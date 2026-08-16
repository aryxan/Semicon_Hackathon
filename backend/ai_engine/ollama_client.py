import os
import json
import httpx
from .prompts import ENGINEER_COPILOT_PROMPT
from .schemas import AIAnalyzeRequest, AIAnalyzeResponse

class OllamaClient:
    def __init__(self):
        self.base_url = os.getenv("OLLAMA_URL", "http://localhost:11434")
        self.model = os.getenv("OLLAMA_MODEL", "qwen3:8b")

    async def analyze(self, req: AIAnalyzeRequest) -> AIAnalyzeResponse:
        context = f"""
Wafer ID: {req.wafer_id}
XGBoost Risk Status: {req.risk_status}
XGBoost Probability: {req.risk_probability}

SHAP Drivers:
{json.dumps(req.shap_drivers, indent=2)}

Metrology Measurements:
{json.dumps(req.stages_metrology, indent=2)}
"""

        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": ENGINEER_COPILOT_PROMPT},
                {"role": "user", "content": context}
            ],
            "format": "json",
            "stream": False
        }

        try:
            async with httpx.AsyncClient() as client:
                resp = await client.post(f"{self.base_url}/api/chat", json=payload, timeout=60.0)
                resp.raise_for_status()
                data = resp.json()
                
                content = data["message"]["content"]
                parsed = json.loads(content)
                
                return AIAnalyzeResponse(
                    summary=parsed.get("summary", ""),
                    risk_interpretation=parsed.get("risk_interpretation", ""),
                    observed_trend=parsed.get("observed_trend", ""),
                    key_factors=parsed.get("key_factors", []),
                    investigation_points=parsed.get("investigation_points", []),
                    recommended_review=parsed.get("recommended_review", ""),
                    confidence_caveat=parsed.get("confidence_caveat", ""),
                    available=True
                )
        except Exception as e:
            print(f"Ollama error: {e}")
            return AIAnalyzeResponse(
                summary="AI analysis temporarily unavailable.",
                risk_interpretation="Unavailable.",
                observed_trend="Unavailable.",
                key_factors=[],
                investigation_points=[],
                recommended_review="Unavailable.",
                confidence_caveat="Unavailable.",
                available=False
            )
