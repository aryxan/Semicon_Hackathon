import { Wafer } from '../types';

export const waferDatabase: Wafer[] = [];

const fallbackWafer: Wafer = {
  waferId: 'WF-001',
  batchId: 'B-01',
  status: 'NORMAL',
  riskScore: 0,
  timestamp: new Date().toISOString(),
  stages: [
    { stage: 'Lithography', xError: 0, yError: 0, rotation: 0, scale: 1, overlayError: 0, confidence: 0, inlierRatio: 0 },
    { stage: 'Etching', xError: 0, yError: 0, rotation: 0, scale: 1, overlayError: 0, confidence: 0, inlierRatio: 0 },
    { stage: 'CMP', xError: 0, yError: 0, rotation: 0, scale: 1, overlayError: 0, confidence: 0, inlierRatio: 0 },
    { stage: 'Metal-1', xError: 0, yError: 0, rotation: 0, scale: 1, overlayError: 0, confidence: 0, inlierRatio: 0 },
  ],
};

export function getWaferById(waferId: string | null): Wafer {
  return waferDatabase.find((w) => w.waferId === waferId) ?? waferDatabase[0] ?? fallbackWafer;
}

export async function loadWaferDatabase(): Promise<Wafer[]> {
  if (waferDatabase.length > 0) {
    return waferDatabase;
  }

  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:49999';
  const response = await fetch(`${apiBase}/api/wafer/history`);

  if (!response.ok) {
    throw new Error(`Failed to load wafer metrology history: ${response.statusText}`);
  }

  const data = await response.json();
  const normalized: Wafer[] = (data || []).map((item: any) => ({
    waferId: String(item.waferId),
    batchId: String(item.batchId ?? ''),
    status: item.status === 'CRITICAL' ? 'CRITICAL' : item.status === 'DRIFT' ? 'DRIFT' : 'NORMAL',
    riskScore: Number(item.riskScore ?? 0),
    timestamp: item.timestamp ?? new Date().toISOString(),
    stages: (item.stages ?? []).map((stage: any) => ({
      stage: stage.stage,
      xError: Number(stage.xError ?? 0),
      yError: Number(stage.yError ?? 0),
      rotation: Number(stage.rotation ?? 0),
      scale: Number(stage.scale ?? 1),
      overlayError: Number(stage.overlayError ?? 0),
      confidence: Number(stage.confidence ?? 0),
      inlierRatio: Number(stage.inlierRatio ?? 0),
    })),
  }));

  waferDatabase.splice(0, waferDatabase.length, ...normalized);
  return waferDatabase;
}
