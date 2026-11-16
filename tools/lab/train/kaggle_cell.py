# FHK big-net sanity training on a free Kaggle GPU. Paste ONE line into a Kaggle notebook cell:
#   !curl -fsSL https://raw.githubusercontent.com/khanfarazhusain/minds-eye-chess/engine-lab/tools/lab/train/kaggle_cell.py -o k.py && python k.py
# Downloads public FHK self-play data (release "data-archive"), trains the 1536-neuron / 16-king-bucket net, writes /kaggle/working/fhk_kb16_1536.bin.
# Needs: Accelerator = GPU, Internet = On. No tokens or logins.
import os, subprocess, json, urllib.request, time
R = 'khanfarazhusain/minds-eye-chess'; RAW = f'https://raw.githubusercontent.com/{R}/engine-lab/tools/lab/train/'
W = '/kaggle/working'; D = '/tmp/fhk'; os.makedirs(D, exist_ok=True); os.chdir(D)
def sh(c): print('$', c, flush=True); subprocess.run(c, shell=True, check=True)
for f in ['trainpt2.py', 'fhkfeat.py', 'featpack.c']: urllib.request.urlretrieve(RAW + f, f)
sh('gcc -O2 -o featpack featpack.c -lm')
rel = json.load(urllib.request.urlopen(f'https://api.github.com/repos/{R}/releases/tags/data-archive'))
assets = sorted([a for a in rel['assets'] if a['name'].endswith('.gz')], key=lambda a: a['name'])
budget = int(float(os.environ.get('FHK_GB', '3.5')) * 1_000_000_000)  # ~3.5 GB of gz = roughly 25-30 crore positions
valid_src, train = assets[0], []; total = 0
for a in assets[1:][::-1]:
    if total + a['size'] > budget: continue
    train.append(a); total += a['size']
print('train files', len(train), 'GB', round(total / 1e9, 2), 'valid from', valid_src['name'], flush=True)
sh(f"curl -fsSL {valid_src['browser_download_url']} | zcat | head -n 1000000 | gzip -1 > valid.gz")
for a in train: sh(f"curl -fsSL --retry 4 -o {a['name']} {a['browser_download_url']}")
sh('nvidia-smi --query-gpu=name,memory.total --format=csv')
t = time.time()
sh('python trainpt2.py ' + W + '/fhk_kb16_1536.bin ' + ' '.join(a['name'] for a in train) + ' --valid valid.gz --epochs 1 --kb 16 --h 1536 --lr 1e-3')
print('DONE in', round((time.time() - t) / 3600, 2), 'hours. Download fhk_kb16_1536.bin from the Output panel.', flush=True)
