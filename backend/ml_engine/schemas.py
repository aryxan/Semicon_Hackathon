from pydantic import BaseModel, Field

class StageMetrology(BaseModel):
    x_error_px: float = Field(default=0.0)
    y_error_px: float = Field(default=0.0)
    overlay_error_px: float = Field(default=0.0)
    confidence: float = Field(default=0.9)
    inlier_ratio: float = Field(default=0.8)

class StagesMetrology(BaseModel):
    stage_1: StageMetrology = Field(default_factory=StageMetrology)
    stage_2: StageMetrology = Field(default_factory=StageMetrology)
    stage_3: StageMetrology = Field(default_factory=StageMetrology)

class DefectLog(BaseModel):
    pre_s4_defect_count: int = Field(default=0)
    avg_defect_size: float = Field(default=0.0)
    bridge_defects: int = Field(default=0)

class WaferPredictRequest(BaseModel):
    wafer_id: str = "W_UNKNOWN"
    stages: StagesMetrology = Field(default_factory=StagesMetrology)
    defects: DefectLog = Field(default_factory=DefectLog)

class SHAPDriver(BaseModel):
    feature: str
    value: float
    contribution: float
    direction: str

class WaferPrediction(BaseModel):
    status: str
    probability: float
    action: str

class WaferPredictResponse(BaseModel):
    wafer_id: str
    prediction: WaferPrediction
    features: dict
    shap_drivers: list[SHAPDriver]
