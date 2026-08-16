import yaml
import cv2
from pathlib import Path
from backend.cv_engine.core import load_gray, generate_candidates

with open('backend/cv_engine/config.yaml') as f:
    cfg = yaml.safe_load(f)

ref_img = load_gray(Path('backend/data/images/000_golden_reference.png'))
search_img = load_gray(Path('backend/data/images/WF-003_Stage2_02_Etch.png'))

cands = generate_candidates(search_img, ref_img, cfg['matching']['scale_candidates'], cfg['matching']['top_k'], cfg['matching']['nms_radius_px'], cfg['matching']['min_score'], angles=[0.0])

for c in cands:
    print(f"x={c.x:.1f}, y={c.y:.1f}, score={c.score:.3f}")
