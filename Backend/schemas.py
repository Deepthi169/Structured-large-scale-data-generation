from pydantic import BaseModel
from typing import List, Dict, Any


# Request schema
class ImageAnalysisCreate(BaseModel):
    name: str          # filename
    body: str          # base64 image


# Response schema
class ImageAnalysisResponse(BaseModel):
    image_id: str
    file_metadata: Dict[str, Any]  # original_size, resized_size, color_mode
    quality_metrics: Dict[str, Any]  # blur_score, brightness, contrast
    semantic_features: Dict[str, Any]  # clip_embedding, blip_caption
    yolo_objects: List[Dict[str, Any]]
    object_count: int
    latency_seconds: float

    class Config:
        from_attributes = True
