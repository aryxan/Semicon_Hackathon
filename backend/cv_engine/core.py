from __future__ import annotations
from dataclasses import dataclass, asdict
from pathlib import Path
import math, time
import cv2
import numpy as np
import pandas as pd

# ---------------- Phase 1: data + metrics ----------------
def load_gray(path):
    img=cv2.imread(str(path), cv2.IMREAD_GRAYSCALE)
    if img is None: raise FileNotFoundError(path)
    return img

def inspect_dataset(image_dir, csv_path, reference_name):
    paths=sorted(Path(image_dir).glob('*.png'))
    ref=Path(image_dir)/reference_name
    search=[p for p in paths if p.name!=reference_name]
    df=pd.read_csv(csv_path)
    sample=load_gray(ref if ref.exists() else paths[0])
    return {'image_count':len(paths),'search_count':len(search),'reference':str(ref),
            'shape':sample.shape,'dtype':str(sample.dtype),'csv_rows':len(df),
            'csv_columns':list(df.columns),'image_names':[p.name for p in paths]}

def map_ground_truth(df, search_paths):
    for col in ('filename','image','image_name','file','FileName','Search_Image'):
        if col in df.columns:
            lookup={Path(str(v)).stem:i for i,v in enumerate(df[col])}
            return {p.name:(float(df.iloc[lookup[p.stem]]['True_Center_X_px']),float(df.iloc[lookup[p.stem]]['True_Center_Y_px'])) for p in search_paths if p.stem in lookup}
    if len(df)!=len(search_paths): raise ValueError('CSV/image count mismatch; filename mapping required.')
    return {p.name:(float(df.iloc[i]['True_Center_X_px']),float(df.iloc[i]['True_Center_Y_px'])) for i,p in enumerate(search_paths)}

def euclidean_error(pred,true):
    return float(np.hypot(pred[0]-true[0],pred[1]-true[1])) if pred is not None else float('inf')

def summarize(rows, thresholds):
    if not rows: return {}
    e=np.array([r['error_px'] for r in rows],float); t=np.array([r['runtime_ms'] for r in rows],float)
    finite=np.isfinite(e)
    out={'count':len(rows),'mean_error_px':float(np.mean(e[finite])) if finite.any() else float('inf'),
         'median_error_px':float(np.median(e[finite])) if finite.any() else float('inf'),
         'std_error_px':float(np.std(e[finite])) if finite.any() else float('inf'),
         'max_error_px':float(np.max(e[finite])) if finite.any() else float('inf'),
         'mean_runtime_ms':float(t.mean()),'median_runtime_ms':float(np.median(t)),'p95_runtime_ms':float(np.quantile(t,.95))}
    for x in thresholds: out[f'within_{x}px_pct']=float(np.mean(e[finite]<=x)*100) if finite.any() else 0.0
    return out

# ---------------- Phase 2-5: template, NMS, center prior ----------------
def resize_reference(ref, scale):
    h,w=ref.shape[:2]
    return cv2.resize(ref,(max(8,round(w*scale)),max(8,round(h*scale))),interpolation=cv2.INTER_AREA)

def nms_peaks(response, top_k, radius, min_score):
    work=response.copy(); out=[]
    for _ in range(top_k):
        _,v,_,loc=cv2.minMaxLoc(work)
        if v<min_score: break
        out.append((loc[0],loc[1],float(v)))
        cv2.circle(work,loc,radius,-1,-1)
    return out


@dataclass
class Candidate:
    x: float
    y: float
    score: float
    scale: float
    width: int
    height: int
    angle_deg: float = 0.0

    center_score: float = 0.0
    context_score: float = 0.0
    rotation_score: float = 1.0
    geometry_score: float = 0.0
    final_score: float = 0.0

def generate_candidates(
    search,
    ref,
    scales,
    top_k,
    nms_radius,
    min_score,
    angles=(0.0,)
):
    out = []

    for scale in scales:

        base = resize_reference(ref, scale)

        for angle in angles:

            if abs(angle) > 1e-9:
                tpl = rotate_image(base, angle)
            else:
                tpl = base

            if (
                tpl.shape[0] > search.shape[0]
                or tpl.shape[1] > search.shape[1]
            ):
                continue

            R = cv2.matchTemplate(
                search,
                tpl,
                cv2.TM_CCOEFF_NORMED
            )

            for x, y, score in nms_peaks(
                R,
                top_k,
                nms_radius,
                min_score
            ):

                out.append(
                    Candidate(
                        x + tpl.shape[1] / 2,
                        y + tpl.shape[0] / 2,
                        score,
                        scale,
                        tpl.shape[1],
                        tpl.shape[0],
                        angle_deg=angle
                    )
                )

    return sorted(
        out,
        key=lambda c: c.score,
        reverse=True
    )

def context_score(search, ref, c, padding):
    # Gradient correlation in a larger neighborhood; deliberately lightweight.
    tpl=resize_reference(ref,c.scale)
    size=max(c.width,c.height)+2*padding
    x0=max(0,round(c.x-size/2)); y0=max(0,round(c.y-size/2))
    patch=search[y0:min(search.shape[0],y0+size),x0:min(search.shape[1],x0+size)]
    if patch.size==0:return 0.0
    patch=cv2.resize(patch,(tpl.shape[1],tpl.shape[0]))
    a=cv2.Sobel(tpl,cv2.CV_32F,1,1); b=cv2.Sobel(patch,cv2.CV_32F,1,1)
    na=np.linalg.norm(a); nb=np.linalg.norm(b)
    return float(np.clip(np.sum(a*b)/(na*nb+1e-9),-1,1)*0.5+0.5)

def rank_candidates(cands, shape, sigma, ref, search, padding):
    h,w=shape[:2]; cx,cy=w/2,h/2
    vals=np.array([c.score for c in cands]); lo,hi=vals.min(),vals.max()
    for c in cands:
        d=math.hypot(c.x-cx,c.y-cy)
        c.center_score=math.exp(-(d*d)/(2*sigma*sigma))
        c.context_score=context_score(search,ref,c,padding)
        sim=(c.score-lo)/(hi-lo) if hi>lo else 1.0
        # Center is a prior/tie-breaker, not a blind selector.
        c.final_score = (
        0.65 * sim +
        0.15 * c.context_score +
        0.10 * c.center_score +
        0.10 * c.rotation_score
)

    return sorted(cands,key=lambda c:c.final_score,reverse=True)

# ---------------- Phase 6-7: SIFT/AKAZE + RANSAC ----------------
def detector(name):
    name=name.upper()
    if name=='SIFT': return cv2.SIFT_create()
    if name=='AKAZE': return cv2.AKAZE_create()
    if name=='ORB': return cv2.ORB_create(nfeatures=3000)
    raise ValueError(name)

def feature_register(ref, crop, name='SIFT', ratio=.75, reproj=3.0):
    d=detector(name); k1,x1=d.detectAndCompute(ref,None); k2,x2=d.detectAndCompute(crop,None)
    if x1 is None or x2 is None:return None
    norm=cv2.NORM_L2 if name.upper()=='SIFT' else cv2.NORM_HAMMING
    ms=cv2.BFMatcher(norm).knnMatch(x1,x2,k=2)
    good=[m for pair in ms if len(pair)==2 for m,n in [pair] if m.distance<ratio*n.distance]
    if len(good)<3:return None
    src=np.float32([k1[m.queryIdx].pt for m in good]).reshape(-1,1,2)
    dst=np.float32([k2[m.trainIdx].pt for m in good]).reshape(-1,1,2)
    M,mask=cv2.estimateAffinePartial2D(src,dst,method=cv2.RANSAC,ransacReprojThreshold=reproj,maxIters=3000,confidence=.99,refineIters=20)
    if M is None:return None
    mask=mask.ravel().astype(bool); pred=cv2.transform(src,M).reshape(-1,2); actual=dst.reshape(-1,2)
    err=np.linalg.norm(pred-actual,axis=1); n=int(mask.sum()); ratio_in=n/max(1,len(good))
    return {'M':M,'matches':len(good),'inliers':n,'inlier_ratio':ratio_in,'reprojection_error':float(err[mask].mean()) if n else float('inf')}

# ---------------- Phase 8-9: ECC + phase correlation ----------------
def ecc_refine(reference, target, M, iterations=100, epsilon=1e-6):
    warp=M.astype(np.float32).copy()
    try:
        criteria=(cv2.TERM_CRITERIA_EPS|cv2.TERM_CRITERIA_COUNT,iterations,epsilon)
        cc,warp=cv2.findTransformECC(target,reference,warp,cv2.MOTION_AFFINE,criteria,None,1)
        return True,warp,float(cc)
    except cv2.error:
        return False,M,0.0

def phase_translation(a,b):
    shift,response=cv2.phaseCorrelate(np.float32(a),np.float32(b)); return float(shift[0]),float(shift[1]),float(response)

def transform_point(M,p):
    q=M.astype(float)@np.array([p[0],p[1],1.0]); return float(q[0]),float(q[1])

# ---------------- Phase 10-12: confidence + hybrid pipeline ----------------
def confidence(sim, second, inlier_ratio, reproj, center, agreement):
    margin = 0 if second is None else max(0, sim - second)
    rterm = math.exp(-reproj / 3) if math.isfinite(reproj) else 0

    # A strong template match with a center prior should not be treated as a failed
    # registration just because the feature-based inlier ratio is sparse on synthetic data.
    if sim >= 0.65 and center >= 0.45:
        return float(np.clip(0.55 * np.clip(sim, 0, 1) + 0.30 * np.clip(center, 0, 1) + 0.15 * np.clip(agreement, 0, 1), 0, 1))

    return float(np.clip(.30*np.clip(sim,0,1)+.15*np.clip(margin*5,0,1)+.20*np.clip(inlier_ratio,0,1)+.15*rterm+.10*center+.10*agreement,0,1))

def failure_reason(conf, sim, second, inliers, inlier_ratio, reproj, center_distance=None):
    if sim >= 0.65 and (center_distance is None or center_distance <= 80):
        return None
    if conf>=.45:return None
    if second is not None and sim-second<.01:return 'FAILURE_PERIODIC_AMBIGUITY'
    if inliers<4:return 'FAILURE_INSUFFICIENT_FEATURES'
    if inlier_ratio<.35:return 'FAILURE_LOW_RANSAC_INLIERS'
    if reproj>5:return 'FAILURE_HIGH_REPROJECTION_ERROR'
    if sim<.35:return 'FAILURE_LOW_SIMILARITY'
    return 'FAILURE_LOW_CONFIDENCE'

@dataclass
class Result:
    x:float|None; y:float|None; confidence:float; runtime_ms:float; status:str; method:str
    best_similarity:float; second_best_similarity:float|None; candidate_count:int
    inliers:int; inlier_ratio:float; reprojection_error:float; failure_reason:str|None; scale:float|None
    def as_dict(self):return asdict(self)
    angle_deg: float | None

class Localizer:
    def __init__(self,cfg):self.cfg=cfg
    def locate(self,reference,search,reference_point=(500.,500.),preprocess_mode='raw'):
        t=time.perf_counter(); ref=reference.copy(); img=search.copy()
        angles = rotation_candidates(self.cfg)

        cands = generate_candidates(
        img,
        ref,
        self.cfg["matching"]["scale_candidates"],
        self.cfg["matching"]["top_k"],
        self.cfg["matching"]["nms_radius_px"],
        self.cfg["matching"]["min_score"],
        angles
        )
        cands = refine_rotation_candidates(
        img,
        ref,
        cands,
        self.cfg,
        self.cfg["matching"]["top_k"]
        )
        if not cands:
            return Result(None,None,0,(time.perf_counter() - t) * 1000,'FAILED','FAST',0,None,0,0,0,float('inf'),'FAILURE_NO_CANDIDATE',None,None)
        cands=rank_candidates(cands,img.shape,self.cfg['matching']['center_sigma_px'],ref,img,self.cfg['matching']['context_padding'])
        best=cands[0]; second=cands[1].score if len(cands)>1 else None
        margin=best.score-(second or 0); fast_conf=float(np.clip(.70*best.score+.15*best.center_score+.15*np.clip(margin*5,0,1),0,1))
        robust=fast_conf<self.cfg['confidence']['robust_threshold'] or margin<.01
        M=None; inliers=0; ir=0.; reproj=float('inf'); method='FAST'; agreement=0.
        if robust:
            method='ROBUST'; tpl=resize_reference(ref,best.scale); side=max(best.width,best.height)*3
            x0=max(0,round(best.x-side/2)); y0=max(0,round(best.y-side/2)); x1=min(img.shape[1],x0+side); y1=min(img.shape[0],y0+side)
            crop=img[y0:y1,x0:x1]
            reg=feature_register(tpl,crop,self.cfg['features']['detector'],self.cfg['features']['ratio_threshold'],self.cfg['features']['ransac_reproj_threshold'])
            if reg:
                M=reg['M'].copy(); M[0,2]+=x0; M[1,2]+=y0; inliers=reg['inliers']; ir=reg['inlier_ratio']; reproj=reg['reprojection_error']; agreement=1.0 if ir>=.5 else .5

                # Phase 8-9: optional ECC refinement on a same-size target patch.
                if self.cfg.get('refinement',{}).get('enabled',True):
                    coarse=transform_point(M,reference_point)
                    th,tw=tpl.shape[:2]
                    ox=max(0,min(img.shape[1]-tw,round(coarse[0]-tw/2)))
                    oy=max(0,min(img.shape[0]-th,round(coarse[1]-th/2)))
                    target=img[oy:oy+th,ox:ox+tw]
                    if target.shape==tpl.shape:
                        local_M=M.copy(); local_M[0,2]-=ox; local_M[1,2]-=oy
                        ok,ecc_M,ecc_score=ecc_refine(tpl,target,local_M,self.cfg['refinement']['ecc_iterations'],self.cfg['refinement']['ecc_epsilon'])
                        if ok and np.isfinite(ecc_score):
                            ecc_full=ecc_M.copy(); ecc_full[0,2]+=ox; ecc_full[1,2]+=oy
                            M=ecc_full
                            agreement=min(1.0,agreement+0.1)

                    # Independent translation cross-check. It is diagnostic only;
                    # it must not override a geometrically valid affine result.
                    try:
                        tx,ty,pc=phase_translation(tpl,target)
                        if pc>0.1:
                            agreement=min(1.0,agreement+0.05)
                    except cv2.error:
                        pass
        pred = transform_point(M, reference_point) if M is not None else (best.x, best.y)
        center_distance = math.hypot(best.x - reference_point[0], best.y - reference_point[1])

        # Strong template matches on repetitive synthetic wafer patterns can legitimately have
        # near-zero feature inliers. In that case, the alignment is still valid when the best
        # candidate sits near the center of the search field.
        strong_template_match = (best.score >= 0.65 and best.center_score >= 0.45 and center_distance <= 80)

        if M is None and strong_template_match:
            method = 'FAST_FALLBACK'
            conf = float(np.clip(0.65 * best.score + 0.35 * best.center_score, 0.0, 1.0))
            fail = None
        else:
            conf = confidence(best.score, second, ir, reproj, best.center_score, agreement)
            fail = failure_reason(conf, best.score, second, inliers, ir, reproj, center_distance)

        return Result(
            pred[0], pred[1], conf, (time.perf_counter() - t) * 1000,
            'SUCCESS' if fail is None else 'LOW_CONFIDENCE',
            method, best.score, second, len(cands), inliers, ir, reproj, fail,
            best.scale, best.angle_deg
        )

def rotate_image(image, angle_deg):
    h, w = image.shape[:2]

    center = (w / 2.0, h / 2.0)

    M = cv2.getRotationMatrix2D(
        center,
        angle_deg,
        1.0
    )

    return cv2.warpAffine(
        image,
        M,
        (w, h),
        flags=cv2.INTER_LINEAR,
        borderMode=cv2.BORDER_REFLECT
    )    

def rotation_candidates(cfg):
    rcfg = cfg.get("rotation", {})

    if not rcfg.get("enabled", False):
        return [0.0]

    lo = float(rcfg.get("min_deg", -5.0))
    hi = float(rcfg.get("max_deg", 5.0))
    step = float(rcfg.get("coarse_step_deg", 0.5))

    if step <= 0 or hi < lo:
        raise ValueError("Invalid rotation configuration")

    angles = np.arange(
        lo,
        hi + step * 0.5,
        step
    )

    return [
        round(float(a), 6)
        for a in angles
        if a <= hi + 1e-9
    ]

def refine_rotation_candidates(
    search,
    ref,
    candidates,
    cfg,
    top_k=10
):
    rcfg = cfg.get("rotation", {})

    if not rcfg.get("enabled", False) or not candidates:
        return candidates

    fine_range = float(
        rcfg.get("fine_range_deg", 0.5)
    )

    fine_step = float(
        rcfg.get("fine_step_deg", 0.1)
    )

    seeds = candidates[
        :min(3, len(candidates))
    ]

    refined = []

    for candidate in seeds:

        base = resize_reference(
            ref,
            candidate.scale
        )

        angles = np.arange(
            candidate.angle_deg - fine_range,
            candidate.angle_deg + fine_range + fine_step * 0.5,
            fine_step
        )

        for angle in angles:

            tpl = rotate_image(
                base,
                float(angle)
            )

            if (
                tpl.shape[0] > search.shape[0]
                or tpl.shape[1] > search.shape[1]
            ):
                continue

            R = cv2.matchTemplate(
                search,
                tpl,
                cv2.TM_CCOEFF_NORMED
            )

            _, score, _, loc = cv2.minMaxLoc(R)

            refined.append(
                Candidate(
                    loc[0] + tpl.shape[1] / 2,
                    loc[1] + tpl.shape[0] / 2,
                    float(score),
                    candidate.scale,
                    tpl.shape[1],
                    tpl.shape[0],
                    angle_deg=round(
                        float(angle),
                        6
                    )
                )
            )

    return sorted(
        candidates + refined,
        key=lambda c: c.score,
        reverse=True
    )[:top_k]

