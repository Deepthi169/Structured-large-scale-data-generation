from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from schemas import ImageAnalysisCreate, ImageAnalysisResponse
from pydantic import BaseModel
import torch
import base64
import os
import time

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
        self.model = YOLO("yolov8n.pt")

    def extract(self, image_path: str):
        # Lower confidence threshold
        results = self.model(image_path, conf=0.15, iou=0.45)[0]

        objects = []

        # If YOLO detects nothing
        if results.boxes is None or len(results.boxes) == 0:
            return [{
                "label": "plant-like object",
                "confidence": "N/A",
                "bbox": "N/A",
                "note": "YOLO fallback (non-COCO object)"
            }]

        for box in results.boxes:
            cls_id = int(box.cls)
            label = results.names.get(cls_id, "unknown")

            objects.append({
                "label": label,
                "confidence": round(float(box.conf), 3),
                "bbox": [round(x, 2) for x in box.xyxy[0].tolist()]
            })

        return objects


# ================= LOAD MODELS ================= #

clip_extractor = CLIPExtractor()
blip_extractor = BLIPExtractor()
yolo_extractor = YOLOExtractor()

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

@app.post("/analyze", response_model=ImageAnalysisResponse)
async def analyze_image(data: ImageAnalysisCreate):
    try:
        start_time = time.time()

        file_path = os.path.join(UPLOAD_DIR, data.name)

        # Decode base64 → image file
        image_bytes = base64.b64decode(data.body)
        with open(file_path, "wb") as f:
            f.write(image_bytes)

        # Validate image
        Image.open(file_path).verify()

        # Run models
        clip_embedding = clip_extractor.extract(file_path)
        caption = blip_extractor.extract(file_path)
        objects = yolo_extractor.extract(file_path)

        latency = round(time.time() - start_time, 2)

        return {
            "image_name": data.name,
            "blip_caption": caption,
            "yolo_objects": objects,
            "clip_dim": len(clip_embedding),
            "latency_seconds": latency
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
