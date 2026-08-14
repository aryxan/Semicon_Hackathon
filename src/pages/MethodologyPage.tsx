import React from 'react';
import { BookOpen, ArrowDown } from 'lucide-react';

export default function MethodologyPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div className="border-b border-[var(--color-border-light)] pb-6">
        <h1 className="text-3xl font-bold tracking-tight flex items-center">
          <BookOpen className="w-8 h-8 mr-3 text-[var(--color-accent)]" />
          Methodology & System Architecture
        </h1>
        <p className="text-[var(--color-text-secondary)] mt-2 text-lg">
          Technical overview of the Drift-Sense scale-aware localization pipeline.
        </p>
      </div>

      <div className="space-y-12">
        
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-[var(--color-text-primary)] border-b border-slate-800 pb-2">1. The Problem</h2>
          <p className="text-[var(--color-text-secondary)] leading-relaxed">
            During high-resolution semiconductor inspection (e.g., SEM), stage navigation drift introduces positional errors. When the system attempts to return to a previously inspected 1 µm × 1 µm reference site, it must capture a wider 10 µm × 10 µm search image to guarantee the original site is within the field of view. The challenge is to locate the exact (x, y) center of the reference pattern within this larger, noisier, lower-resolution search image.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-[var(--color-text-primary)] border-b border-slate-800 pb-2">2. Architecture Pipeline</h2>
          
          <div className="bg-[var(--color-surface)] border border-[var(--color-border-light)] rounded-lg p-8 flex flex-col items-center my-8">
            {[
              'Reference Image + Search Image',
              'Preprocessing (Noise Reduction & Edge Enhancement)',
              'Scale-Aware Localization (10× Normalization)',
              'Candidate Detection (Template Matching / Feature Extraction)',
              'Similarity Scoring',
              'Candidate Ranking',
              'Center-Distance Selection (Fallback for Periodic Structures)',
              'Sub-pixel X/Y Coordinate Estimation'
            ].map((step, i, arr) => (
              <React.Fragment key={i}>
                <div className="bg-[#0A0F1C] border border-[var(--color-accent)]/50 text-[var(--color-text-primary)] px-6 py-3 rounded text-sm font-mono text-center w-full max-w-md shadow-[0_0_10px_rgba(56,189,248,0.1)]">
                  {step}
                </div>
                {i < arr.length - 1 && <ArrowDown className="w-5 h-5 text-slate-600 my-2" />}
              </React.Fragment>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-[var(--color-text-primary)] border-b border-slate-800 pb-2">3. Scale Relationship & Input</h2>
          <p className="text-[var(--color-text-secondary)] leading-relaxed">
            Both the reference and search images are 1000 × 1000 pixels. However, the physical capture scale differs by exactly 10× (1 nm/px vs 10 nm/px). The pipeline first normalizes this scale discrepancy, effectively shrinking the reference representation to a 100 × 100 pixel template before performing the search operation.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-[var(--color-text-primary)] border-b border-slate-800 pb-2">4. Candidate Selection in Periodic Structures</h2>
          <p className="text-[var(--color-text-secondary)] leading-relaxed">
            DRAM and FinFET structures are highly repetitive. A standard correlation search yields multiple local maxima (candidate matches) with nearly identical similarity scores. Drift-Sense ranks these candidates by visual similarity, but applies a distance-to-center penalty. If multiple candidates share top-tier confidence scores, the system selects the candidate closest to the physical center of the search image, modeling the assumption that navigation drift follows a normal distribution centered on the intended target.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-[var(--color-text-primary)] border-b border-slate-800 pb-2">5. Synthetic Dataset Generation</h2>
          <p className="text-[var(--color-text-secondary)] leading-relaxed">
            Because proprietary semiconductor imagery cannot be open-sourced, the system includes a synthetic generator. It produces large-scale randomized periodic patterns (mimicking DRAM contacts and FinFET fins), applies localized defects, extracts a reference patch, generates a 10× downsampled wider field, injects simulated navigation drift (translation), and finally applies Gaussian and Poisson noise to simulate realistic SEM imaging conditions.
          </p>
        </section>
        
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-[var(--color-text-primary)] border-b border-slate-800 pb-2">6. Future Work</h2>
          <ul className="list-disc list-inside text-[var(--color-text-secondary)] leading-relaxed space-y-2">
            <li>Implementation of deep-learning-based feature descriptors (e.g., SuperPoint) for increased robustness against noise.</li>
            <li>RGB Optical Mode support for wider metrology applications beyond grayscale SEM.</li>
            <li>Sub-pixel interpolation for coordinate estimation beyond integer pixel boundaries.</li>
          </ul>
        </section>

      </div>
    </div>
  );
}
