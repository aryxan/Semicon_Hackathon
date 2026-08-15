export type ProcessStage = 'Lithography' | 'Etching' | 'CMP' | 'Metal-1';
export type RiskStatus = 'NORMAL' | 'DRIFT' | 'CRITICAL';
export type MatchStatus = 'MATCH' | 'LOW_CONFIDENCE' | 'FAILED';

export interface StageMeasurement {
  stage: ProcessStage;
  xError: number;
  yError: number;
  rotation: number;
  scale: number;
  overlayError: number;
  confidence: number;
  inlierRatio: number;
}

export interface Wafer {
  waferId: string;
  batchId: string;
  status: RiskStatus;
  stages: StageMeasurement[];
  riskScore: number;
  timestamp: string;
}

export interface InspectionInput {
  waferId: string;
  stage: ProcessStage;
  referenceImage: string;
  searchImage: string;
}

export interface CVResult {
  waferId: string;
  stage: ProcessStage;
  centerX: number;
  centerY: number;
  scale: number;
  rotation: number;
  xError: number;
  yError: number;
  overlayError: number;
  confidence: number;
  inlierRatio: number;
  matchStatus: MatchStatus;
  metrics: {
    scaleConsistency: number;
    geometricFit: number;
    inlierQuality: number;
  };
  matchRegion: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface RiskInput {
  waferId: string;
  stages: StageMeasurement[];
}

export interface RiskPrediction {
  waferId: string;
  status: RiskStatus;
  probability: number;
  action: 'PASS' | 'REVIEW' | 'HOLD_STOP';
  shapDrivers: {
    feature: string;
    contribution: number;
    direction: 'positive' | 'negative';
  }[];
}

export interface AIAnalysisInput {
  waferId: string;
  riskPrediction: RiskPrediction;
  history: StageMeasurement[];
}

export interface AIAnalysis {
  summary: string;
  riskInterpretation: string;
  observedTrend: string;
  keyFactors: string[];
  investigationPoints: string[];
  recommendedReview: string;
  confidenceCaveat: string;
}
