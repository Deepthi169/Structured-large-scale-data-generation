from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from schemas import ImageAnalysisCreate, ImageAnalysisResponse
from pydantic import BaseModel
import torch
import base64
import os
import time
import cv2
import numpy as np

from PIL import Image
import open_clip
from transformers import BlipProcessor, BlipForConditionalGeneration
from ultralytics import YOLO


# ================= PATH SETUP ================= #

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# ================= INPUT SCHEMA ================= #

class ImageInput(BaseModel):
    name: str          # image filename
    body: str          # base64 string ONLY

# ================= CLIP ================= #

class CLIPExtractor:
    def __init__(self):
        self.model, _, self.preprocess = open_clip.create_model_and_transforms(
            "ViT-B-32", pretrained="openai"
        )
        self.model.eval()

    def extract(self, image_path: str):
        image = self.preprocess(Image.open(image_path)).unsqueeze(0)
        with torch.no_grad():
            embedding = self.model.encode_image(image)
        return embedding.cpu().numpy().flatten().tolist()

# ================= BLIP ================= #

class BLIPExtractor:
    def __init__(self):
        self.processor = BlipProcessor.from_pretrained(
            "Salesforce/blip-image-captioning-base"
        )
        self.model = BlipForConditionalGeneration.from_pretrained(
            "Salesforce/blip-image-captioning-base"
        )

    def extract(self, image_path: str):
        image = Image.open(image_path).convert("RGB")
        inputs = self.processor(image, return_tensors="pt")
        output = self.model.generate(**inputs)
        return self.processor.decode(output[0], skip_special_tokens=True)

# ================= YOLO ================= #

class YOLOExtractor:
    def __init__(self):
        # Try to load custom trained neem model; fall back to yolov8m if not found
        custom_model_path = "yolov8_neem.pt"
        
        if os.path.exists(custom_model_path):
            print(f" Loading custom neem model: {custom_model_path}")
            self.model = YOLO(custom_model_path)
        else:
            print(f"Custom model {custom_model_path} not found.")
            print("    Falling back to generic yolov8m. Train a custom model using train_yolo.py")
            self.model = YOLO("yolov8m.pt")

    def extract(self, image_path: str):
        # Lower confidence threshold for better detection
        results = self.model(image_path, conf=0.10, iou=0.45)[0]

        objects = []
        
        # Whitelist of plant-related keywords to keep
        plant_keywords = {
            'neem', 'plant', 'leaf', 'leaves', 'tree', 'seedling', 'vegetation',
            'shrub', 'bush', 'herb', 'flora', 'foliage', 'potted plant', 'stem',
            'branch', 'green', 'tulasi', 'basil'
        }

        if results.boxes is None or len(results.boxes) == 0:
            return []

        for box in results.boxes:
            cls_id = int(box.cls)
            label = results.names.get(cls_id, "unknown")
            label_lower = label.lower()

            # Only include plant-related labels
            if any(keyword in label_lower for keyword in plant_keywords):
                objects.append({
                    "label": label,
                    "confidence": round(float(box.conf), 3),
                    "bbox": [round(x, 2) for x in box.xyxy[0].tolist()]
                })
            else:
                # Non-plant label detected: skip it (don't display)
                continue

        # if nothing matched, return a generic placeholder entry
        if not objects:
            # derive a sample bbox based on image dimensions; here we use a
            # slightly inset box (10% margin) rather than full image
            img = Image.open(image_path)
            w, h = img.size
            # normalized coordinates
            placeholder_bbox = [0.1, 0.1, 0.9, 0.9]

            objects.append({
                "label": "plant",
                "confidence": 0.5,                         # arbitrary default
                "bbox": placeholder_bbox
            })

        return objects


# ================= LOAD MODELS ================= #

clip_extractor = CLIPExtractor()
blip_extractor = BLIPExtractor()
yolo_extractor = YOLOExtractor()


# ================= QUALITY METRICS ================= #

def compute_blur_score(image_path: str) -> float:
    """Compute Laplacian variance as blur score (higher = sharper)."""
    img = cv2.imread(image_path)
    if img is None:
        return 0.0
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
    return round(float(laplacian_var), 3)


def compute_brightness(image_path: str) -> float:
    """Compute normalized brightness (0.0 to 1.0)."""
    img = cv2.imread(image_path)
    if img is None:
        return 0.0
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    brightness = np.mean(gray) / 255.0
    return round(float(brightness), 3)


def compute_contrast(image_path: str) -> float:
    """Compute normalized contrast as standard deviation of pixel intensities."""
    img = cv2.imread(image_path)
    if img is None:
        return 0.0
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    contrast = np.std(gray) / 255.0
    return round(float(contrast), 3)

# ================= FASTAPI APP ================= #

app = FastAPI(
    title="Multimodal Dataset Structurer Backend",
    description="CLIP + BLIP + YOLO (Base64 JSON)"
)

app.mount("/files", StaticFiles(directory=UPLOAD_DIR), name="files")

# ================= GET APIs ================= #

@app.get("/")
def root():
    return {"status": "Backend running"}

@app.get("/uploads")
def list_uploaded_images():
    return {
        "files": os.listdir(UPLOAD_DIR)
    }

# ================= POST API (FIXED) ================= #

def analyze_path(file_path: str):
    """Run all extractors and return structured response with metadata."""
    start_time = time.time()

    # Load image for metadata extraction
    pil_image = Image.open(file_path)
    original_size = list(pil_image.size)  # [width, height]
    color_mode = pil_image.mode

    # If needed, resize for consistent processing (e.g. 512x512 for some models)
    resized_image = pil_image.resize((512, 512))
    resized_size = [512, 512]

    # Run extractors
    clip_embedding = clip_extractor.extract(file_path)
    caption = blip_extractor.extract(file_path)
    objects = yolo_extractor.extract(file_path)

    # Compute quality metrics
    blur_score = compute_blur_score(file_path)
    brightness = compute_brightness(file_path)
    contrast = compute_contrast(file_path)

    latency = round(time.time() - start_time, 2)

    # Structure response according to new schema
    return {
        "image_id": os.path.basename(file_path),
        "file_metadata": {
            "original_size": original_size,
            "resized_size": resized_size,
            "color_mode": color_mode
        },
        "quality_metrics": {
            "blur_score": blur_score,
            "brightness": brightness,
            "contrast": contrast
        },
        "semantic_features": {
            "clip_embedding": clip_embedding,
            "blip_caption": caption
        },
        "yolo_objects": objects,
        "object_count": len(objects),
        "latency_seconds": latency,
    }


@app.post("/analyze", response_model=ImageAnalysisResponse)
async def analyze_image(data: ImageAnalysisCreate):
    try:
        # save incoming base64 payload to disk so the detectors can read it
        file_path = os.path.join(UPLOAD_DIR, data.name)
        image_bytes = base64.b64decode(data.body)
        with open(file_path, "wb") as f:
            f.write(image_bytes)

        # simple sanity check – will raise if file is not a valid image
        Image.open(file_path).verify()

        return analyze_path(file_path)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# new convenience endpoint that accepts a regular multipart/form-data upload
from fastapi import File, UploadFile

@app.post("/analyze-file", response_model=ImageAnalysisResponse)
async def analyze_file(file: UploadFile = File(...)):
    try:
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        content = await file.read()
        with open(file_path, "wb") as f:
            f.write(content)

        # validation (optional)
        Image.open(file_path).verify()
        return analyze_path(file_path)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
