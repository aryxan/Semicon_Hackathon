from pydantic import BaseModel

class CVLocateRequest(BaseModel):
    wafer_id: str
    stage: str
    reference_image: str
    search_image: str

class CVMetrics(BaseModel):
    scaleConsistency: float
    geometricFit: float
    inlierQuality: float

class CVMatchRegion(BaseModel):
    x: float
    y: float
    width: float
    height: float

class CVLocateResponse(BaseModel):
    waferId: str
    stage: str
    centerX: float
    centerY: float
    scale: float
    rotation: float
    xError: float
    yError: float
    overlayError: float
    confidence: float
    inlierRatio: float
    matchStatus: str
    metrics: CVMetrics
    matchRegion: CVMatchRegion
