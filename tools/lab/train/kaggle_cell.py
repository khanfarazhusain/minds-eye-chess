# FHK net training on a free Kaggle GPU. Paste ONE line into a Kaggle notebook cell:
#   !curl -fsSL https://raw.githubusercontent.com/khanfarazhusain/minds-eye-chess/engine-lab/tools/lab/train/kaggle_cell.py -o k.py && python k.py
# Needs: Accelerator = GPU, Internet = On. No login needed to train.
# What it does: downloads the public self-play archive (release "data-archive"), trains with the streaming trainer (trainpt2.py,
# data never has to fit in RAM), saves the net + one checkpoint per epoch in /kaggle/working, and, if a Kaggle Secret named
# GH_TOKEN is attached, uploads them to the GitHub release "kaggle-nets" so they reach the repo without any manual download.
# Settings (optional, put them before "python k.py", e.g.  FHK_NET=kb16_1536 FHK_EPOCHS=1 python k.py):
#   FHK_NET    kb16_1536 (default, FARAZ 16 Nov: big net first) | kb4_512 (starts from the loop's current.bin)
#   FHK_EPOCHS passes over the data (default 2)      FHK_GB    max GB of .gz data to download (default: all that fits)
#   FHK_HOURS  stop and save after this many hours (default 11; Kaggle kills a run at 12)   FHK_LR  learning rate (default 1e-3, 5e-4 with init)
import os, sys, subprocess, json, urllib.request, urllib.error, time, shutil
T0 = time.time()
R = 'khanfarazhusain/minds-eye-chess'; RAW = os.environ.get('FHK_RAW', f'https://raw.githubusercontent.com/{R}/engine-lab/tools/lab/')
W = '/kaggle/working' if os.path.isdir('/kaggle/working') else os.path.abspath('out'); D = '/tmp/fhk'
os.makedirs(W, exist_ok=True); os.makedirs(D, exist_ok=True); os.chdir(D)
LOG = open(os.path.join(W, 'train_log.txt'), 'a')
def say(*x):
    m = ' '.join(str(v) for v in x); print(m, flush=True); LOG.write(m + '\n'); LOG.flush()
def sh(c): say('$', c); subprocess.run(c, shell=True, check=True)
PRESETS = {'kb4_512': (4, 512, 'nets/current.bin'), 'kb8_768': (8, 768, None), 'kb16_1536': (16, 1536, None), 'kb16_1024': (16, 1024, None), 'kb16_768': (16, 768, None),
           'kb16_1536_more': (16, 1536, 'https://raw.githubusercontent.com/khanfarazhusain/minds-eye-chess/kaggle-nets/fhk_kb16_1536_20261116_2138.bin.gz')}  # continue Kaggle run 1
NET = os.environ.get('FHK_NET', 'kb16_1536'); KB, H, INIT = PRESETS[NET]
EPOCHS = int(os.environ.get('FHK_EPOCHS', '2')); HOURS = float(os.environ.get('FHK_HOURS', '11'))
LR = os.environ.get('FHK_LR', '5e-4' if INIT else '1e-3')
if KB == 8: sys.exit('kb8 is not in fhkfeat.py yet; use kb4_512 or kb16_1536')
STAMP = time.strftime('%Y%m%d_%H%M', time.gmtime()); NAME = f'fhk_{NET}_{STAMP}'
OUT = os.path.join(W, NAME + '.bin'); CK = os.path.join(W, 'checkpoints_' + NAME)
say('== FHK Kaggle trainer', NAME, 'kb', KB, 'h', H, 'epochs', EPOCHS, 'lr', LR, 'max hours', HOURS)
sh('nvidia-smi --query-gpu=name,memory.total --format=csv || echo "NO GPU! Settings > Accelerator > GPU"')
for f in ['trainpt2.py', 'fhkfeat.py', 'featpack.c']: urllib.request.urlretrieve(RAW + 'train/' + f, f)
sh('gcc -O2 -o featpack featpack.c -lm')
if INIT:
    src = INIT if INIT.startswith('http') else RAW + INIT
    if src.endswith('.gz'): sh(f"curl -fsSL --retry 4 '{src}' | zcat > init.bin")
    else: urllib.request.urlretrieve(src, 'init.bin')
    say('init from', INIT)
rel = json.load(urllib.request.urlopen(f'https://api.github.com/repos/{R}/releases/tags/data-archive'))
assets = sorted([a for a in rel['assets'] if a['name'].endswith('.gz')], key=lambda a: a['size'])
valid_src = next((a for a in assets if a['name'] == 'run_43665001216.gz'), assets[0])  # held out completely (same file every run, so runs compare)
assets = [valid_src] + [a for a in assets if a is not valid_src]
if any(a['name'].startswith('lichess_eval_') for a in assets):  # the full Lichess set replaces the old slice (run_43660933797 had fake 0.5 results)
    assets = [a for a in assets if a['name'] != 'run_43660933797.gz']
free = shutil.disk_usage(D).free - 3_000_000_000
budget = min(free, int(float(os.environ.get('FHK_GB', '1000')) * 1e9))
train, total = [], 0
for a in sorted(assets[1:], key=lambda a: a['name'], reverse=True):
    if total + a['size'] <= budget: train.append(a); total += a['size']
say('train files', len(train), 'of', len(assets) - 1, 'GB', round(total / 1e9, 2), '(about', round(total / 1e9 * 8), 'crore positions), valid from', valid_src['name'])
sh(f"curl -sSL --retry 4 {valid_src['browser_download_url']} 2>/dev/null | zcat 2>/dev/null | head -n 1000000 | gzip -1 > valid.gz || true")
for a in train:
    if not (os.path.exists(a['name']) and os.path.getsize(a['name']) == a['size']): sh(f"curl -fsSL --retry 4 -o {a['name']} {a['browser_download_url']}")
t = time.time()
cmd = (f'python -u trainpt2.py {OUT} ' + ' '.join(a['name'] for a in train) + f' --valid valid.gz --epochs {EPOCHS} --kb {KB} --h {H} --lr {LR}'
       + f' --ckdir {CK} --max-hours {max(HOURS - (time.time() - T0) / 3600 - 0.3, 0.02):.2f}' + (' --init init.bin' if INIT else ''))
say('$', cmd)
p = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
for line in p.stdout: print(line, end='', flush=True); LOG.write(line); LOG.flush()
rc = p.wait(); say('trainer exit', rc, 'after', round((time.time() - t) / 3600, 2), 'hours')
if not os.path.exists(OUT): sys.exit('no net was written, see train_log.txt')
# Optional: send the result to GitHub (release "kaggle-nets"). Needs a Kaggle Secret GH_TOKEN (Add-ons > Secrets, attached to this notebook).
tok = None
try:
    from kaggle_secrets import UserSecretsClient; tok = UserSecretsClient().get_secret('GH_TOKEN')
except Exception as e: say('no GH_TOKEN secret, skipping upload:', type(e).__name__)
if tok:
    def api(url, data=None, method='GET', ctype='application/json'):
        rq = urllib.request.Request(url, data=data, method=method, headers={'Authorization': 'Bearer ' + tok, 'Accept': 'application/vnd.github+json', 'Content-Type': ctype})
        with urllib.request.urlopen(rq) as r: return json.loads(r.read() or b'{}')
    try:
        try: rl = api(f'https://api.github.com/repos/{R}/releases/tags/kaggle-nets')
        except urllib.error.HTTPError:
            rl = api(f'https://api.github.com/repos/{R}/releases', json.dumps({'tag_name': 'kaggle-nets', 'target_commitish': 'engine-lab', 'name': 'Nets trained on Kaggle', 'body': 'Uploaded by tools/lab/train/kaggle_cell.py'}).encode(), 'POST')
        up = rl['upload_url'].split('{')[0]
        files = [OUT, LOG.name] + ([os.path.join(CK, f) for f in sorted(os.listdir(CK))] if os.path.isdir(CK) else [])
        for f in files:
            nm = NAME + '.bin' if f == OUT else (NAME + '_log.txt' if f == LOG.name else NAME + '_' + os.path.basename(f))
            api(f'{up}?name={nm}', open(f, 'rb').read(), 'POST', 'application/octet-stream'); say('uploaded', nm)
        say('GitHub: https://github.com/' + R + '/releases/tag/kaggle-nets')
    except Exception as e: say('upload failed (net is still in the Output tab):', e)
say('DONE. Net:', OUT, '| checkpoints:', CK, '| log: train_log.txt (all in the Output tab)')
