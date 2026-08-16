from pydantic import BaseModel
from typing import List

class AIAnalyzeRequest(BaseModel):
    wafer_id: str
    risk_status: str
    risk_probability: float
    shap_drivers: List[dict]
    stages_metrology: dict

class AIAnalyzeResponse(BaseModel):
    summary: str
    risk_interpretation: str
    observed_trend: str
    key_factors: List[str]
    investigation_points: List[str]
    recommended_review: str
    confidence_caveat: str
    available: bool = True
