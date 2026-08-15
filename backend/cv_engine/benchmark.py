from pathlib import Path
import pandas as pd
from .core import load_gray, map_ground_truth, euclidean_error, summarize

def run(localizer,image_dir,csv_path,reference_name,output='outputs/benchmark',max_images=None):
    out=Path(output); out.mkdir(parents=True,exist_ok=True); ref=load_gray(Path(image_dir)/reference_name)
    paths=sorted(p for p in Path(image_dir).glob('*.png') if p.name!=reference_name); df=pd.read_csv(csv_path); gt=map_ground_truth(df,paths)
    if max_images: paths=paths[:max_images]
    rows=[]
    for i,p in enumerate(paths,1):
        search=load_gray(p); r=localizer.locate(ref,search,(ref.shape[1]/2,ref.shape[0]/2)); d=r.as_dict(); true=gt[p.name]; x_error=(r.x-true[0]) if r.x is not None else None; y_error=(r.y-true[1]) if r.y is not None else None; d.update({'image':p.name,'true_x':true[0],'true_y':true[1],'x_error_px':x_error,'y_error_px':y_error,'error_px':euclidean_error((r.x,r.y),true) if r.x is not None else None,'true':true}); rows.append(d)
        print(f'[{i}/{len(paths)}] {p.name}: {d["error_px"]:.3f}px | {r.method} | conf={r.confidence:.3f}')
    pd.DataFrame(rows).to_csv(out/'results.csv',index=False); s=summarize(rows,(.5,1,2,5)); pd.DataFrame([s]).to_csv(out/'summary.csv',index=False); return s  