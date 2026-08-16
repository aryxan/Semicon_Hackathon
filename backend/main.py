from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import csv
import os
from pathlib import Path
from ml_engine.schemas import WaferPredictRequest, WaferPredictResponse
from ml_engine.model_server import WaferRiskPredictor
from cv_engine.schemas import CVLocateRequest, CVLocateResponse
from cv_engine.cv_server import CVEngineServer
from ai_engine.ollama_client import OllamaClient
from ai_engine.schemas import AIAnalyzeRequest, AIAnalyzeResponse
from db.database import init_db
import uvicorn

app = FastAPI(title="Drift-Sense ML API")

raw_origins = os.getenv("ALLOWED_ORIGINS", "*")
allowed_origins = [origin.strip() for origin in raw_origins.split(",") if origin.strip()]
allow_credentials = "*" not in allowed_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_PORT = int(os.getenv("API_PORT", "49999"))

data_dir = os.path.join(os.path.dirname(__file__), "data", "images")
if os.path.exists(data_dir):
    app.mount("/images", StaticFiles(directory=data_dir), name="images")

predictor = None
cv_server = None
ollama_client = None

STAGE_NAME_MAP = {
    "01_Lithography": "Lithography",
    "02_Etch": "Etching",
    "03_CMP": "CMP",
    "04_Metal1": "Metal-1",
}

STAGE_ORDER = {"Lithography": 0, "Etching": 1, "CMP": 2, "Metal-1": 3}

STATUS_MAP = {
    "NORMAL": "NORMAL",
    "WATCH": "DRIFT",
    "CRITICAL_DRIFT": "CRITICAL",
}


def load_wafer_history():
    csv_path = Path(__file__).resolve().parent / "data" / "wafer_metrology_history.csv"
    if not csv_path.exists():
        return []

    wafers = {}
    with open(csv_path, newline="") as f:
        rows = csv.DictReader(f)
        for row in rows:
            wafer_id = row["Wafer_ID"].strip()
            wafer = wafers.setdefault(
                wafer_id,
                {
                    "waferId": wafer_id,
                    "batchId": "",
                    "status": "NORMAL",
                    "riskScore": 0.0,
                    "timestamp": "2024-01-01T00:00:00Z",
                    "stages": [],
                },
            )

            normalized_stage = STAGE_NAME_MAP.get(row["Stage_Name"], row["Stage_Name"])
            overlay = float(row.get("Overlay_Error_nm", 0) or 0)
            confidence = max(50.0, min(99.5, 100.0 - overlay * 2.1))
            inlier_ratio = max(0.18, min(0.98, 1.0 - overlay / 60.0))
            risk_label = row.get("Drift_Risk_Label", "NORMAL").strip()
            wafer["status"] = STATUS_MAP.get(risk_label, "NORMAL")
            wafer["riskScore"] = max(wafer["riskScore"], float(row.get("Drift_Magnitude_nm", 0) or 0))

            wafer["stages"].append(
                {
                    "stage": normalized_stage,
                    "xError": float(row.get("Incremental_dX_nm", 0) or 0),
                    "yError": float(row.get("Incremental_dY_nm", 0) or 0),
                    "rotation": float(row.get("Incremental_dTheta_deg", 0) or 0),
                    "scale": max(0.94, min(1.08, 1.0 + (abs(float(row.get("Drift_Magnitude_nm", 0) or 0)) / 5000.0))),
                    "overlayError": overlay,
                    "confidence": round(confidence, 2),
                    "inlierRatio": round(inlier_ratio, 4),
                }
            )

    history = []
    for wafer_id, wafer in sorted(wafers.items(), key=lambda item: item[0]):
        wafer["batchId"] = f"B-{((int(wafer_id.split('-')[-1]) - 1) // 25) + 1:02d}"
        wafer["stages"].sort(key=lambda stage: STAGE_ORDER.get(stage["stage"], 99))
        history.append(wafer)

    return history

@app.on_event("startup")
async def startup_event():
    global predictor, cv_server, ollama_client
    
    try:
        init_db()
    except Exception as e:
        print(f"Failed to initialize database: {e}")
        
    try:
        predictor = WaferRiskPredictor.get_instance()
    except Exception as e:
        print(f"Failed to load ML model: {e}")
        
    try:
        cv_server = CVEngineServer.get_instance()
    except Exception as e:
        print(f"Failed to load CV Engine: {e}")
        
    try:
        ollama_client = OllamaClient()
    except Exception as e:
        print(f"Failed to load Ollama client: {e}")

@app.get("/api/health")
async def health_check():
    global predictor, cv_server, ollama_client
    return {
        "frontend": "online",
        "backend": "online",
        "cv": "READY" if cv_server else "UNAVAILABLE",
        "model": "LOADED" if predictor else "UNAVAILABLE",
        "shap": "READY" if predictor and predictor.booster else "UNAVAILABLE",
        "ollama": "READY" if ollama_client else "UNAVAILABLE",
        "database": "READY",
        "device": predictor.device_used if predictor else "cpu"
    }

@app.post("/api/wafer/save")
async def save_wafer_endpoint(wafer_data: dict):
    try:
        from db.database import save_wafer
        save_wafer(wafer_data)
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail={"error": "SAVE_FAILED", "message": str(e)})

@app.get("/api/wafer/history")
async def wafer_history():
    try:
        from db.database import get_all_wafers
        wafers = get_all_wafers()
        if not wafers:
            wafers = load_wafer_history()
            # Seed the database
            from db.database import save_wafer
            for w in wafers:
                save_wafer(w)
        return wafers
    except Exception as exc:
        raise HTTPException(status_code=500, detail={"error": "HISTORY_LOAD_FAILED", "message": str(exc)})

@app.post("/api/ai/analyze", response_model=AIAnalyzeResponse)
async def analyze_wafer(request: AIAnalyzeRequest):
    global ollama_client
    if not ollama_client:
        return AIAnalyzeResponse(
            summary="AI Engine unavailable.",
            risk_interpretation="",
            observed_trend="",
            key_factors=[],
            investigation_points=[],
            recommended_review="",
            confidence_caveat="",
            available=False
        )
    return await ollama_client.analyze(request)

@app.post("/api/wafer/predict", response_model=WaferPredictResponse)
async def predict_wafer(request: WaferPredictRequest):
    global predictor
    if not predictor:
        raise HTTPException(status_code=503, detail={"error": "ML_MODEL_UNAVAILABLE", "message": "The XGBoost model is not loaded."})
    
    try:
        response = predictor.predict(request)
        return response
    except Exception as e:
        raise HTTPException(status_code=400, detail={"error": "PREDICTION_FAILED", "message": str(e)})

@app.post("/api/cv/locate", response_model=CVLocateResponse)
async def locate_cv(request: CVLocateRequest):
    global cv_server
    if not cv_server:
        raise HTTPException(status_code=503, detail={"error": "CV_ENGINE_UNAVAILABLE", "message": "The CV Engine is not loaded."})
        
    try:
        response = cv_server.locate(request)
        return response
    except Exception as e:
        raise HTTPException(status_code=400, detail={"error": "CV_LOCATE_FAILED", "message": str(e)})

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=API_PORT, reload=True)
# Trigger reload
