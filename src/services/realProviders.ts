import { RiskProvider, CVProvider } from './providers';
import { RiskInput, RiskPrediction, InspectionInput, CVResult } from '../types';
import { API_BASE_URL } from '../config/api';

const DEFAULT_API_BASE = API_BASE_URL;

export class RealCVProvider implements CVProvider {
  private baseUrl: string;
  constructor(baseUrl: string = DEFAULT_API_BASE) {
    this.baseUrl = baseUrl;
  }
  
  async locate(input: InspectionInput): Promise<CVResult> {
    const payload = {
      wafer_id: input.waferId,
      stage: input.stage,
      reference_image: input.referenceImage,
      search_image: input.searchImage
    };
    
    const response = await fetch(`${this.baseUrl}/api/cv/locate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error(`CV HTTP Error: ${response.statusText}`);
    }
    
    return await response.json();
  }
}

export class RealRiskProvider implements RiskProvider {
  private baseUrl: string;
  constructor(baseUrl: string = DEFAULT_API_BASE) {
    this.baseUrl = baseUrl;
  }

  async predict(input: RiskInput): Promise<RiskPrediction> {
    try {
      // Map frontend input to backend expected schema
      const stage1 = input.stages.find((s: any) => s.stage === 'Lithography');
      const stage2 = input.stages.find((s: any) => s.stage === 'Etching');
      const stage3 = input.stages.find((s: any) => s.stage === 'CMP');

      const payload = {
        wafer_id: input.waferId,
        stages: {
          stage_1: {
            x_error_px: stage1?.xError ?? 0,
            y_error_px: stage1?.yError ?? 0,
            overlay_error_px: stage1?.overlayError ?? 0,
            confidence: stage1?.confidence ?? 0.9,
            inlier_ratio: stage1?.inlierRatio ?? 0.8
          },
          stage_2: {
            x_error_px: stage2?.xError ?? 0,
            y_error_px: stage2?.yError ?? 0,
            overlay_error_px: stage2?.overlayError ?? 0,
            confidence: stage2?.confidence ?? 0.9,
            inlier_ratio: stage2?.inlierRatio ?? 0.8
          },
          stage_3: {
            x_error_px: stage3?.xError ?? 0,
            y_error_px: stage3?.yError ?? 0,
            overlay_error_px: stage3?.overlayError ?? 0,
            confidence: stage3?.confidence ?? 0.9,
            inlier_ratio: stage3?.inlierRatio ?? 0.8
          }
        },
        defects: {
          pre_s4_defect_count: 0,
          avg_defect_size: 0.0,
          bridge_defects: 0
        }
      };

      const response = await fetch(`${this.baseUrl}/api/wafer/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        waferId: input.waferId,
        status: data.prediction.status as any,
        probability: data.prediction.probability * 100, // Frontend expects 0-100
        action: data.prediction.action as any,
        shapDrivers: data.shap_drivers.map((d: any) => ({
          feature: d.feature,
          contribution: d.contribution * 100, // Frontend expects scaled 0-100 roughly
          direction: d.direction === 'increases_risk' ? 'positive' : 'negative'
        }))
      };
    } catch (e) {
      console.error("RealRiskProvider prediction failed:", e);
      throw e;
    }
  }
}
