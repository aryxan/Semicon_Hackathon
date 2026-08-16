import sys
import yaml
import cv2
import numpy as np
from pathlib import Path
from backend.cv_engine.core import Localizer, load_gray

with open('backend/cv_engine/config.yaml') as f:
    cfg = yaml.safe_load(f)

localizer = Localizer(cfg)
ref_img = load_gray(Path('backend/data/images/000_golden_reference.png'))
search_img = load_gray(Path('backend/data/images/WF-003_Stage2_02_Etch.png'))

res = localizer.locate(ref_img, search_img, (500.0, 500.0))
print(res)
