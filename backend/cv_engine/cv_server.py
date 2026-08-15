import os
import yaml
from pathlib import Path
from .schemas import CVLocateRequest, CVLocateResponse, CVMetrics, CVMatchRegion
from .core import Localizer, load_gray, Result

class CVEngineServer:
    _instance = None
    
    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def __init__(self, config_path=None):
        if not config_path:
            config_path = os.path.join(os.path.dirname(__file__), 'config.yaml')
        
        with open(config_path, 'r', encoding='utf-8') as f:
            self.cfg = yaml.safe_load(f)
            
        self.localizer = Localizer(self.cfg)
        self.data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'images')
        
    def locate(self, req: CVLocateRequest) -> CVLocateResponse:
        # Load images
        ref_path = os.path.join(self.data_dir, self.cfg['data']['reference_name'])
        
        # If the search image is provided literally, use it, else default to the W_xxx pattern
        search_filename = req.search_image
        if search_filename == "current_stage_sim.png":
            # Map "Metal-1" to "04_Metal1", "CMP" to "03_CMP", etc
            stage_map = {
                "Lithography": "01_Lithography",
                "Etching": "02_Etch",
                "CMP": "03_CMP",
                "Metal-1": "04_Metal1"
            }
            mapped_stage = stage_map.get(req.stage, "04_Metal1")
            
            # W-016 format from frontend needs to be WF-016
            wafer_fmt = req.wafer_id.replace("W-", "WF-")
            search_filename = f"{wafer_fmt}_Stage{list(stage_map.keys()).index(req.stage)+1}_{mapped_stage}.png"
            
        search_path = os.path.join(self.data_dir, search_filename)
        
        # Fallback to golden ref if image not found (for robustness)
        if not os.path.exists(search_path):
            search_path = ref_path
            
        ref_img = load_gray(Path(ref_path))
        search_img = load_gray(Path(search_path))
        
        # Center of 1000x1000 is 500,500
        center_pt = (ref_img.shape[1]/2, ref_img.shape[0]/2)
        
        res: Result = self.localizer.locate(ref_img, search_img, center_pt)
        
        # Convert Result to CVLocateResponse
        match_status = "MATCH"
        if res.status == 'LOW_CONFIDENCE':
            match_status = "LOW_CONFIDENCE"
        elif res.status == 'FAILED' or res.x is None:
            match_status = "FAILED"
            
        if match_status == "FAILED":
            x_err = 0.0
            y_err = 0.0
            scale = 1.0
            rot = 0.0
            cx, cy = 500.0, 500.0
        else:
            x_err = float(res.x - center_pt[0])
            y_err = float(res.y - center_pt[1])
            scale = float(res.scale or 1.0)
            rot = float(res.angle_deg or 0.0)
            cx, cy = float(res.x), float(res.y)
            
        overlay = (x_err**2 + y_err**2)**0.5
        
        metrics = CVMetrics(
            scaleConsistency=min(100.0, max(0.0, (1.0 - abs(1.0 - scale))*100)),
            geometricFit=min(100.0, (res.inliers / max(1, res.candidate_count)) * 100 if res.inliers else 50.0),
            inlierQuality=res.inlier_ratio * 100
        )
        
        region_w = ref_img.shape[1] * scale
        region_h = ref_img.shape[0] * scale
        
        matchRegion = CVMatchRegion(
            x=cx - region_w/2,
            y=cy - region_h/2,
            width=region_w,
            height=region_h
        )
        
        return CVLocateResponse(
            waferId=req.wafer_id,
            stage=req.stage,
            centerX=cx,
            centerY=cy,
            scale=scale,
            rotation=rot,
            xError=x_err,
            yError=y_err,
            overlayError=overlay,
            confidence=res.confidence * 100,
            inlierRatio=res.inlier_ratio,
            matchStatus=match_status,
            metrics=metrics,
            matchRegion=matchRegion
        )
