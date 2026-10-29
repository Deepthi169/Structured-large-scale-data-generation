"""MongoDB-backed store for analysed images (dataset imports and user uploads)."""
import json
import os
import re
from datetime import datetime, timezone

from pymongo import DESCENDING, MongoClient

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MONGO_URI = os.environ.get("MONGO_URI", "mongodb://localhost:27017/")
DB_NAME = "db_final"
COLLECTION = "medicinal_images"

SEED_FILE = os.path.join(BASE_DIR, "..", "Data", "Output", "neem", "structured_dataset.json")
SEED_LABEL = "neem"  # the seed file lives under Data/Output/neem
IMAGES_DIR = os.path.join(BASE_DIR, "data", "images")

_client = None


def collection():
    global _client
    if _client is None:
        _client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=2000)
    return _client[DB_NAME][COLLECTION]


def _now():
    return datetime.now(timezone.utc).isoformat()


def _dataset_image_url(image_id):
    for split in ("train", "val"):
        if os.path.exists(os.path.join(IMAGES_DIR, split, image_id)):
            return f"/dataset-images/{split}/{image_id}"
    return None


def seed_dataset():
    """Idempotently import the generated neem dataset. Returns the number of records written."""
    col = collection()
    if col.count_documents({"source": "dataset"}) > 0 or not os.path.exists(SEED_FILE):
        return 0
    with open(SEED_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)
    created = _now()
    for r in data:
        doc = {
            "_id": f"dataset:{r['image_id']}",
            "image_id": r["image_id"],
            "source": "dataset",
            "label": SEED_LABEL,
            "status": "Imported",
            "caption": r.get("descriptive_features", {}).get("caption"),
            "quality_metrics": r.get("quality_metrics"),
            "file_metadata": r.get("file_metadata"),
            "object_count": r.get("object_features", {}).get("object_count", 0),
            "clip_embedding": r.get("semantic_features", {}).get("clip_embedding"),
            "image_url": _dataset_image_url(r["image_id"]),
            "created_at": created,
        }
        col.replace_one({"_id": doc["_id"]}, doc, upsert=True)
    return len(data)


def save_upload(result):
    """Persist an /analyze-agentic result."""
    doc = {
        "_id": f"upload:{result['image_id']}",
        "image_id": result["image_id"],
        "source": "upload",
        "label": result["consensus_label"],
        "status": "Accepted" if result["status"] == "ACCEPT" else "Flagged",
        "agreement_ratio": result["agreement_ratio"],
        "votes": result["votes"],
        "retry_count": result["retry_count"],
        "yolo_confidence": result["yolo_confidence"],
        "clip_confidence": result["clip_confidence"],
        "caption": result["caption"],
        "quality_metrics": result["quality_metrics"],
        "clip_embedding": result["clip_embedding"],
        "image_url": f"/files/{result['image_id']}",
        "created_at": _now(),
    }
    collection().replace_one({"_id": doc["_id"]}, doc, upsert=True)


SORTS = {
    "newest": [("created_at", DESCENDING), ("image_id", 1)],
    "sharpest": [("quality_metrics.blur_score", DESCENDING)],
    "confidence": [("yolo_confidence", DESCENDING)],
}


def search(q="", label="", source="", status="", sort="newest", limit=20, skip=0):
    flt = {}
    if q:
        rx = {"$regex": re.escape(q), "$options": "i"}
        flt["$or"] = [{"image_id": rx}, {"caption": rx}, {"label": rx}]
    if label:
        flt["label"] = label
    if source:
        flt["source"] = source
    if status:
        flt["status"] = status
    col = collection()
    cursor = (
        col.find(flt, {"clip_embedding": 0})
        .sort(SORTS.get(sort, SORTS["newest"]))
        .skip(skip)
        .limit(limit)
    )
    return {"total": col.count_documents(flt), "items": list(cursor)}


def get(record_id):
    return collection().find_one({"_id": record_id}, {"clip_embedding": 0})


def stats():
    col = collection()
    by = lambda field: {
        (d["_id"] or "unknown"): d["count"]
        for d in col.aggregate([{"$group": {"_id": f"${field}", "count": {"$sum": 1}}}])
    }
    avg = next(
        col.aggregate([{"$group": {
            "_id": None,
            "blur": {"$avg": "$quality_metrics.blur_score"},
            "brightness": {"$avg": "$quality_metrics.brightness"},
            "contrast": {"$avg": "$quality_metrics.contrast"},
        }}]),
        {},
    )
    recent = list(
        col.find({}, {"clip_embedding": 0}).sort("created_at", DESCENDING).limit(6)
    )
    return {
        "total": col.count_documents({}),
        "by_label": by("label"),
        "by_status": by("status"),
        "by_source": by("source"),
        "avg_quality": {k: round(avg[k], 3) for k in ("blur", "brightness", "contrast") if avg.get(k) is not None},
        "recent": recent,
    }
