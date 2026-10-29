import csv
import io
import json
from collections import Counter

from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from schemas import ImageAnalysisCreate, ImageAnalysisResponse
import records
import llm
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
            'neem', 'plant', 'leaf', 'leaves', 'vegetation', 'potted plant', 'stem',
            'branch', 'green'
        }

        boxes = results.boxes if results.boxes is not None else []

        for box in boxes:
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

# ================= AGENTIC CONSENSUS (from models/new copro.ipynb) ================= #

PLANT_CLASSES = ["neem", "tulasi"]
# Weights of the YOLOv8 classifier trained in the notebook
# (Colab: runs/classify/train/weights/best.pt). Override with YOLO_CLS_WEIGHTS.
CLS_WEIGHTS = os.environ.get(
    "YOLO_CLS_WEIGHTS", os.path.join(BASE_DIR, "yolov8_cls_best.pt")
)


class YOLOClassifier:
    def __init__(self):
        if os.path.exists(CLS_WEIGHTS):
            print(f"Loading plant classifier: {CLS_WEIGHTS}")
            self.model = YOLO(CLS_WEIGHTS)
        else:
            print(f"Classifier weights {CLS_WEIGHTS} not found; YOLO will not vote.")
            self.model = None

    def predict(self, image_bgr):
        if self.model is None:
            return None, 0.0
        results = self.model.predict(source=image_bgr, imgsz=640, verbose=False)
        if not results or results[0].probs is None:
            return None, 0.0
        probs = results[0].probs
        return self.model.names[int(probs.top1)], float(probs.top1conf)


class CLIPZeroShot:
    def __init__(self, extractor: CLIPExtractor):
        self.model = extractor.model
        self.preprocess = extractor.preprocess
        tokenizer = open_clip.get_tokenizer("ViT-B-32")
        tokens = tokenizer([f"a photo of a {c} leaf" for c in PLANT_CLASSES])
        with torch.no_grad():
            text = self.model.encode_text(tokens)
            self.text_features = text / text.norm(dim=-1, keepdim=True)

    def predict(self, image_bgr):
        pil = Image.fromarray(cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB))
        with torch.no_grad():
            feat = self.model.encode_image(self.preprocess(pil).unsqueeze(0))
            feat = feat / feat.norm(dim=-1, keepdim=True)
            sim = (100.0 * feat @ self.text_features.T).softmax(dim=-1)
            conf, idx = sim[0].topk(1)
        return PLANT_CLASSES[idx[0].item()], conf[0].item(), feat.cpu().numpy().flatten().tolist()


def blip_predict(image_bgr):
    pil = Image.fromarray(cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB))
    inputs = blip_extractor.processor(pil, return_tensors="pt")
    with torch.no_grad():
        out = blip_extractor.model.generate(**inputs)
    caption = blip_extractor.processor.decode(out[0], skip_special_tokens=True).lower()
    label = next((c for c in PLANT_CLASSES if c in caption), None)
    return label, caption


def quality_from_bgr(image_bgr):
    gray = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2GRAY)
    return {
        "blur_score": round(float(cv2.Laplacian(gray, cv2.CV_64F).var()), 3),
        "brightness": round(float(np.mean(gray) / 255.0), 3),
        "contrast": round(float(np.std(gray) / 255.0), 3),
    }


def enhance_image(image, q):
    """Adaptive enhancement: CLAHE for contrast, unsharp mask for blur, gamma for brightness."""
    out = image.copy()
    if q["contrast"] < 0.18:
        l, a, b = cv2.split(cv2.cvtColor(out, cv2.COLOR_BGR2LAB))
        l = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8)).apply(l)
        out = cv2.cvtColor(cv2.merge((l, a, b)), cv2.COLOR_LAB2BGR)
    if q["blur_score"] < 150.0:
        out = cv2.addWeighted(out, 1.5, cv2.GaussianBlur(out, (0, 0), 2.0), -0.5, 0)
    if q["brightness"] < 0.35:
        table = np.array([((i / 255.0) ** (1.0 / 1.4)) * 255 for i in range(256)]).astype("uint8")
        out = cv2.LUT(out, table)
    return out


yolo_classifier = YOLOClassifier()
clip_zero_shot = CLIPZeroShot(clip_extractor)


def agentic_process(image_path: str, max_retries: int = 2):
    """YOLO/CLIP/BLIP vote; re-enhance and retry until accepted or flagged for review."""
    current = cv2.imread(image_path)
    if current is None:
        return None

    for retry_count in range(max_retries + 1):
        q = quality_from_bgr(current)
        yolo_cls, yolo_conf = yolo_classifier.predict(current)
        clip_cls, clip_conf, clip_emb = clip_zero_shot.predict(current)
        blip_cls, caption = blip_predict(current)

        votes = {"yolo": yolo_cls, "clip": clip_cls, "blip": blip_cls}
        valid = [v for v in votes.values() if v is not None]
        consensus, agreement = None, "0/3"
        if valid:
            consensus, n = Counter(valid).most_common(1)[0]
            agreement = f"{n}/3"

        accept = (
            (agreement == "3/3" and yolo_conf >= 0.75 and clip_conf >= 0.75)
            or (agreement == "2/3" and yolo_cls == consensus and yolo_conf >= 0.80)
        )
        if accept or retry_count == max_retries:
            return {
                "status": "ACCEPT" if accept else "FLAG_FOR_REVIEW",
                "consensus_label": consensus,
                "agreement_ratio": agreement,
                "retry_count": retry_count,
                "votes": votes,
                "quality_metrics": q,
                "yolo_confidence": round(yolo_conf, 3),
                "clip_confidence": round(clip_conf, 3),
                "caption": caption,
                "clip_embedding": clip_emb,
            }
        current = enhance_image(current, q)


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

# The React dev server runs on a different origin (localhost:3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/files", StaticFiles(directory=UPLOAD_DIR), name="files")
app.mount("/dataset-images", StaticFiles(directory=records.IMAGES_DIR), name="dataset-images")


@app.on_event("startup")
def seed_records():
    try:
        n = records.seed_dataset()
        if n:
            print(f"Seeded {n} dataset records into {records.DB_NAME}.{records.COLLECTION}")
    except Exception as e:
        print(f"MongoDB unavailable, records API disabled: {e}")


def db_call(fn, *args, **kwargs):
    try:
        return fn(*args, **kwargs)
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Database error: {e}")


@app.get("/records")
def list_records(q: str = "", label: str = "", source: str = "", status: str = "",
                 sort: str = "newest", limit: int = 20, skip: int = 0):
    return db_call(records.search, q, label, source, status, sort, min(limit, 100), max(skip, 0))


class ReviewInput(BaseModel):
    label: str


@app.post("/records/{record_id}/review")
def review_record(record_id: str, data: ReviewInput):
    if data.label not in records.REVIEW_LABELS:
        raise HTTPException(status_code=400, detail=f"label must be one of {sorted(records.REVIEW_LABELS)}")
    doc = db_call(records.review, record_id, data.label)
    if doc is None:
        raise HTTPException(status_code=404, detail="Record not found")
    return doc


@app.get("/export")
def export_records(format: str = "json", label: str = "", source: str = "", status: str = "",
                   include_embeddings: bool = False):
    if format not in ("json", "csv"):
        raise HTTPException(status_code=400, detail="format must be json or csv")
    docs = db_call(records.export_docs, label, source, status, include_embeddings)
    if format == "json":
        body = json.dumps(docs, indent=2, default=str)
        return Response(body, media_type="application/json",
                        headers={"Content-Disposition": 'attachment; filename="plant_dataset.json"'})

    buf = io.StringIO()
    cols = ["image_id", "source", "label", "model_label", "status", "caption", "blur_score", "brightness",
            "contrast", "yolo_confidence", "clip_confidence", "vlm_species", "vlm_leaf_condition", "vlm_notes"]
    writer = csv.writer(buf)
    writer.writerow(cols)
    for d in docs:
        q, v = d.get("quality_metrics") or {}, d.get("vlm") or {}
        writer.writerow([
            d.get("image_id"), d.get("source"), d.get("label"), d.get("model_label"), d.get("status"),
            d.get("caption"), q.get("blur_score"), q.get("brightness"), q.get("contrast"),
            d.get("yolo_confidence"), d.get("clip_confidence"),
            v.get("species"), v.get("leaf_condition"), v.get("notes"),
        ])
    return Response(buf.getvalue(), media_type="text/csv",
                    headers={"Content-Disposition": 'attachment; filename="plant_dataset.csv"'})


@app.get("/records/{record_id}")
def get_record(record_id: str):
    doc = db_call(records.get, record_id)
    if doc is None:
        raise HTTPException(status_code=404, detail="Record not found")
    return doc


@app.get("/stats")
def get_stats():
    return db_call(records.stats)


class ChatInput(BaseModel):
    message: str


@app.post("/chat")
def chat(data: ChatInput):
    """Natural-language questions over the dataset: LLM -> validated filters -> real query -> LLM answer."""
    if not llm.enabled():
        raise HTTPException(status_code=503, detail="NVIDIA_API_KEY is not configured on the backend")
    question = data.message.strip()
    if not question:
        raise HTTPException(status_code=400, detail="Empty message")
    try:
        filters = llm.question_to_filters(question)
        if filters["intent"] == "stats":
            stats = db_call(records.stats)
            stats.pop("recent", None)
            facts, items = {"stats": stats}, []
        else:
            found = db_call(
                records.search, filters["q"], filters["label"], filters["source"],
                filters["status"], filters["sort"], 6, 0,
            )
            items = found["items"]
            facts = {
                "total_matches": found["total"],
                "shown": [
                    {k: it.get(k) for k in ("image_id", "label", "status", "caption", "quality_metrics")}
                    for it in items
                ],
            }
        answer = llm.write_answer(question, {"filters_used": filters, **facts})
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))
    return {"answer": answer, "filters": filters, "items": items}

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
        file_path = os.path.join(UPLOAD_DIR, os.path.basename(data.name))
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


@app.get("/agentic-status")
def agentic_status():
    return {
        "classes": PLANT_CLASSES,
        "yolo_classifier_loaded": yolo_classifier.model is not None,
        "weights_path": CLS_WEIGHTS,
    }


@app.post("/analyze-agentic")
async def analyze_agentic(file: UploadFile = File(...)):
    try:
        file_path = os.path.join(UPLOAD_DIR, os.path.basename(file.filename or "upload.jpg"))
        with open(file_path, "wb") as f:
            f.write(await file.read())
        Image.open(file_path).verify()

        start = time.time()
        result = agentic_process(file_path)
        if result is None:
            raise ValueError("Could not read image")
        result["image_id"] = os.path.basename(file_path)
        result["yolo_classifier_loaded"] = yolo_classifier.model is not None

        # Hosted VLM: structured annotation, and a tiebreaker for images the local models flag.
        result["vlm"] = llm.annotate_image(file_path)
        result["adjudicated"] = False
        vlm = result["vlm"]
        if (
            result["status"] == "FLAG_FOR_REVIEW"
            and vlm
            and vlm["species"] in PLANT_CLASSES
            and vlm["species"] == result["consensus_label"]
            and vlm["confidence"] >= 0.7
        ):
            result["status"] = "ACCEPT"
            result["adjudicated"] = True
            result["votes"]["vlm"] = vlm["species"]
        result["latency_seconds"] = round(time.time() - start, 2)
        try:
            records.save_upload(result)
            result["saved"] = True
        except Exception:
            result["saved"] = False  # analysis still returned if MongoDB is down
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze-file", response_model=ImageAnalysisResponse)
async def analyze_file(file: UploadFile = File(...)):
    try:
        file_path = os.path.join(UPLOAD_DIR, os.path.basename(file.filename or "upload.jpg"))
        content = await file.read()
        with open(file_path, "wb") as f:
            f.write(content)

        # validation (optional)
        Image.open(file_path).verify()
        return analyze_path(file_path)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
