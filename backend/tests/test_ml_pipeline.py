import pytest
from fastapi.testclient import TestClient
from main import app
from ml_engine.model_server import WaferRiskPredictor
from ml_engine.schemas import WaferPredictRequest, StagesMetrology, StageMetrology, DefectLog

def test_health_check():
    with TestClient(app) as client:
        response = client.get("/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["backend"] == "online"
        # Assuming model loads successfully
        assert data["ml_model"] == "loaded"

def test_model_loading():
    predictor = WaferRiskPredictor.get_instance()
    assert predictor is not None
    assert predictor.model is not None
    assert len(predictor.feature_columns) == 36

def test_feature_engineering_and_prediction():
    predictor = WaferRiskPredictor.get_instance()
    req = WaferPredictRequest(
        wafer_id="W_016",
        stages=StagesMetrology(
            stage_1=StageMetrology(x_error_px=1.38, y_error_px=-0.76, overlay_error_px=1.58),
            stage_2=StageMetrology(x_error_px=0.93, y_error_px=-0.17, overlay_error_px=0.95),
            stage_3=StageMetrology(x_error_px=0.51, y_error_px=-0.33, overlay_error_px=0.61)
        ),
        defects=DefectLog(pre_s4_defect_count=0, avg_defect_size=0.0, bridge_defects=0)
    )
    
    res = predictor.predict(req)
    
    assert res.wafer_id == "W_016"
    assert "status" in res.prediction.model_dump()
    assert "probability" in res.prediction.model_dump()
    
    # Check SHAP values
    assert len(res.shap_drivers) <= 5
    for driver in res.shap_drivers:
        assert driver.feature in predictor.feature_columns
        assert driver.direction in ["increases_risk", "decreases_risk"]

def test_api_prediction():
    req_data = {
        "wafer_id": "W_016",
        "stages": {
            "stage_1": {"x_error_px": 1.38, "y_error_px": -0.76, "overlay_error_px": 1.58, "confidence": 0.9, "inlier_ratio": 0.8},
            "stage_2": {"x_error_px": 0.93, "y_error_px": -0.17, "overlay_error_px": 0.95, "confidence": 0.9, "inlier_ratio": 0.8},
            "stage_3": {"x_error_px": 0.51, "y_error_px": -0.33, "overlay_error_px": 0.61, "confidence": 0.9, "inlier_ratio": 0.8}
        },
        "defects": {
            "pre_s4_defect_count": 0, "avg_defect_size": 0.0, "bridge_defects": 0
        }
    }
    
    with TestClient(app) as client:
        response = client.post("/api/wafer/predict", json=req_data)
        assert response.status_code == 200
        data = response.json()
        assert data["wafer_id"] == "W_016"
        assert "prediction" in data
        assert "status" in data["prediction"]
        assert "shap_drivers" in data

def test_history_endpoint_returns_real_wafer_history():
    with TestClient(app) as client:
        response = client.get("/api/wafer/history")
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 100
        wafer_ids = [wafer["waferId"] for wafer in data]
        assert "WF-001" in wafer_ids
        assert "WF-100" in wafer_ids
        first = data[0]
        assert "stages" in first
        assert len(first["stages"]) == 4
        assert first["status"] in {"NORMAL", "DRIFT", "CRITICAL"}


def test_invalid_input():
    # Missing stages
    req_data = {
        "wafer_id": "W_INVALID"
    }
    with TestClient(app) as client:
        response = client.post("/api/wafer/predict", json=req_data)
        assert response.status_code == 200 # Pydantic defaults handles missing stages gracefully
        
        # Really malformed
        response = client.post("/api/wafer/predict", data="not json")
        assert response.status_code == 422 # Pydantic validation error
