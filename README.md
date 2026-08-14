# Drift-Sense: Nanoscale Navigation-Error Recovery

Drift-Sense is a cutting-edge web application designed for high-resolution semiconductor metrology. It addresses the critical problem of navigation drift, allowing engineers and automated systems to recover precise inspection coordinates using scale-aware image localization.

## 🎯 The Problem

During automated semiconductor inspection, stage movement inevitably introduces positional errors (drift). Finding the original high-resolution reference site within a lower-resolution, wider search field is challenging because:
- **Repeating Structures:** Layouts like DRAM and FinFETs are highly periodic, leading to false positives.
- **Scale Difference:** The reference pattern often appears at a vastly different scale (e.g., 10× reduction).
- **Imaging Noise:** Search images have lower resolution and more noise.

## ✨ Features

- **Scale-Aware Processing:** Intelligently processes images across an order-of-magnitude scale difference.
- **Interactive Localization Workspace:** A comprehensive interface for locating sites.
- **Methodology & Benchmarks:** Deep dive into how our pipeline works, from candidate matching to center selection.
- **Stunning UI:** Powered by React, Tailwind CSS, and OGL-based WebGL animations (WebThreads).

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- npm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/aryxan/Semicon_Hackathon.git
   cd Semicon_Hackathon
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`.

## 🛠️ Technology Stack

- **Frontend Framework:** React 19 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Graphics/Animations:** OGL (WebGL)
- **Icons:** Lucide React

## 📄 License

This project was built for the Semicon Hackathon.
