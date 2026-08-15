from pathlib import Path
import json
import cv2, numpy as np

def make_layout(size=1000):
    img=np.full((size,size),55,np.float32); pitch=24; line=3
    for x in range(20,size,pitch): img[:,max(0,x-line):min(size,x+line)]=180
    for y in range(20,size,pitch): img[max(0,y-line):min(size,y+line),:]=195
    for y in range(30,size,pitch*2):
        for x in range(30,size,pitch*2): cv2.ellipse(img,(x,y),(5,3),0,0,360,235,-1)
    gx=cv2.Sobel(img,cv2.CV_32F,1,0,3); gy=cv2.Sobel(img,cv2.CV_32F,0,1,3)
    e=cv2.magnitude(gx,gy); e/=max(float(e.max()),1); img+=35*e
    return np.clip(img,0,255).astype(np.uint8)

def generate(output='data/synthetic',count=30,size=1000,seed=42):
    out=Path(output); out.mkdir(parents=True,exist_ok=True); rows=[]
    base=make_layout(size)
    for i in range(count):
        rng=np.random.default_rng(seed+i); tx=float(rng.uniform(-50,50)); ty=float(rng.uniform(-50,50)); rot=float(rng.uniform(-5,5)); scale=float(rng.uniform(.98,1.02)); noise=float(rng.uniform(2,15)); blur=float(rng.uniform(0,1.5))
        M=cv2.getRotationMatrix2D((size/2,size/2),rot,scale); M[0,2]+=tx; M[1,2]+=ty
        search=cv2.warpAffine(base,M,(size,size),borderMode=cv2.BORDER_REFLECT)
        if blur>0:
            k=max(3,int(blur*6)|1); search=cv2.GaussianBlur(search,(k,k),blur)
        search=np.clip(search.astype(np.float32)+rng.normal(0,noise,search.shape),0,255).astype(np.uint8)
        cv2.imwrite(str(out/f'{i:04d}_reference.png'),base); cv2.imwrite(str(out/f'{i:04d}_search.png'),search)
        q=M.astype(float)@np.array([size/2,size/2,1]); rows.append({'seed':seed+i,'translation_x':tx,'translation_y':ty,'rotation_deg':rot,'scale':scale,'noise_sigma':noise,'blur_sigma':blur,'reference_x':size/2,'reference_y':size/2,'true_x':float(q[0]),'true_y':float(q[1])})
    (out/'metadata.json').write_text(json.dumps(rows,indent=2),encoding='utf-8')
