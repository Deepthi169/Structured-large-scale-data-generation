from pydantic import BaseModel
from typing import List, Dict, Any


# Request schema
class ImageAnalysisCreate(BaseModel):
    name: str          # filename
    body: str          # base64 image


# Response schema
class ImageAnalysisResponse(BaseModel):
    image_name: str
    blip_caption: str
    yolo_objects: List[Dict[str, Any]]
    clip_dim: int
    latency_seconds: float

    class Config:
        from_attributes = True
