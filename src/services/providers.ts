import { 
  CVResult, 
  InspectionInput, 
  RiskPrediction, 
  RiskInput, 
  AIAnalysis, 
  AIAnalysisInput 
} from '../types';

export interface CVProvider {
  locate(input: InspectionInput): Promise<CVResult>;
}

export interface RiskProvider {
  predict(input: RiskInput): Promise<RiskPrediction>;
}

export interface AIProvider {
  analyze(input: AIAnalysisInput): Promise<AIAnalysis>;
  ask(question: string, context: any): Promise<string>;
}
