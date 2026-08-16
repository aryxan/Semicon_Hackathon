# SemSight (formerly Drift-Sense)

SemSight is an enterprise-grade semiconductor yield analytics and nanoscale navigation-error recovery platform. It addresses the critical problem of navigation drift, allowing engineers and automated systems to recover precise inspection coordinates, analyze defect drivers, and proactively prevent yield loss using scale-aware computer vision and machine learning.

## ✨ Features

- **Scale-Aware OpenCV Geometric Registration:** Intelligently processes metrology images across order-of-magnitude scale differences using a dual-pass FAST/RANSAC pipeline for sub-pixel accuracy.
- **XGBoost Risk Classifier & TreeSHAP:** Predicts structural failure probabilities in real-time and evaluates exact physical defect drivers using SHAP values.
- **Ollama AI Copilot:** Generates automated Root Cause Analysis (RCA) insights based on live system telemetry.
- **Enterprise Dashboard:** Built with React, Tailwind CSS, Recharts, and `gsap`-powered MagicBento dynamic layouts for seamless real-time monitoring.
- **Background Fab Simulator:** A local Python daemon that actively simulates inline metrology ingestion, running images through the CV engine and ML pipelines.
- **Interactive Wafer Inspection:** Interactive wafer drill-down with HOLD / STOP controls to intercept critical deviations.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Python 3.10+
- Ollama (running locally)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/aryxan/Semicon_Hackathon.git
   cd Semicon_Hackathon
   ```

2. **Frontend Setup:**
   ```bash
   npm install
   npm run dev
   ```

3. **Backend Setup:**
   ```bash
   python -m venv backend/venv
   # Windows: backend\venv\Scripts\activate
   # Mac/Linux: source backend/venv/bin/activate
   pip install -r backend/requirements.txt
   python backend/main.py
   ```

4. **Start the Fab Simulator (in a new terminal):**
   ```bash
   # Windows: backend\venv\Scripts\activate
   python simulate_lab.py
   ```

5. Open your browser and navigate to `http://localhost:5173`. 
*(Default Login: admin / admin)*

## Vercel Deployment

This repo is configured so Vercel serves the React frontend and routes `/api/*` to FastAPI.

1. Import this repository into Vercel.
2. In Vercel Project Settings, add environment variables (do not commit real secrets):
   - `ALLOWED_ORIGINS` (comma-separated origins, or `*`)
   - `OLLAMA_URL`
   - `OLLAMA_MODEL`
   - Optional frontend override: `VITE_API_BASE_URL` (leave unset to use same-domain `/api` in production)
3. Deploy.

Notes:
- Keep secrets in Vercel Environment Variables, not in the repository.
- Local defaults are preserved for development (`http://127.0.0.1:49999`).

## 🛠️ Technology Stack

- **Frontend:** React 19 + TypeScript, Vite, Tailwind CSS, Recharts, GSAP, Lucide React
- **Backend API:** FastAPI (Python), Uvicorn
- **Computer Vision:** OpenCV (cv2), NumPy
- **Machine Learning:** XGBoost, SHAP
- **AI Agent:** Ollama (LLaMA inference)
- **Database:** SQLite (local telemetry persistence)

## 📄 License

Built for the Semicon Hackathon.
