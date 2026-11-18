# FHK net training on a free Kaggle GPU. Paste ONE line into a Kaggle notebook cell:
#   !curl -fsSL https://raw.githubusercontent.com/khanfarazhusain/minds-eye-chess/engine-lab/tools/lab/train/kaggle_cell.py -o k.py && python k.py
# Needs: Accelerator = GPU, Internet = On. No login needed to train.
# What it does: downloads the public self-play archive (release "data-archive"), trains with the streaming trainer (trainpt2.py,
# data never has to fit in RAM), saves the net + one checkpoint per epoch in /kaggle/working, and, if a Kaggle Secret named
# GH_TOKEN is attached, uploads them to the GitHub release "kaggle-nets" so they reach the repo without any manual download.
# Settings (optional, put them before "python k.py", e.g.  FHK_NET=kb16_1536 FHK_EPOCHS=1 python k.py):
#   FHK_NET    kb16_1536 (default, FARAZ 16 Nov: big net first) | kb4_512 (starts from the loop's current.bin)
#   NEW (18 Nov): FHK_BINPACK=auto streams every Stockfish binpack, FHK_RUN=1..3 + FHK_NRUNS=3 split the files over the runs; FHK_BPSCALE default 0.75; FHK_INIT=<url|path> resume from a previous net; FHK_BPOFF=<raw positions to skip per file>; FHK_NSRC=4 sources mixed at once; archive+Lichess are one more mixed source; checkpoint every 20 min, GitHub upload hourly (GH_TOKEN secret)
#   FHK_EPOCHS passes over the data (default 1)      FHK_GB    max GB of .gz data to download (default: all that fits)
#   FHK_LICHESS  Lichess eval DB lines to convert here on Kaggle (default 1e8, 0 = off; GitHub was too slow to do it)
#   FHK_HOURS  stop and save after this many hours (default 11; Kaggle kills a run at 12)   FHK_LR  learning rate (default 1e-3, 5e-4 with init)
import os, sys, subprocess, json, urllib.request, urllib.error, time, shutil
T0 = time.time()
# FHK_PLAN=1|2|3: the whole 3-run plan in one setting (nothing else to type). Plan values override other FHK_* settings on purpose.
PLANS = {'1': dict(FHK_RUN='1', FHK_LR='5e-4', FHK_GB='6', FHK_LICHESS='6e7'),  # run 1: c1 net + newest ~6 GB (50 crore) of the self-play archive + 1e8 Lichess lines + this run's binpacks
         '2': dict(FHK_RUN='2', FHK_LR='3e-4', FHK_NOARCHIVE='1', FHK_LICHESS='0', FHK_AUTOINIT='1'),  # runs 2, 3: binpack only, continue from the newest net in the release
         '3': dict(FHK_RUN='3', FHK_LR='2e-4', FHK_NOARCHIVE='1', FHK_LICHESS='0', FHK_AUTOINIT='1')}
if os.environ.get('FHK_PLAN'):
    assert os.environ['FHK_PLAN'] in PLANS, 'FHK_PLAN must be 1, 2 or 3'
    keep = {k: os.environ[k] for k in ('FHK_HOURS', 'FHK_GB', 'FHK_LICHESS', 'FHK_NSRC') if k in os.environ} if os.environ.get('FHK_SMOKE') == '1' else {}  # smoke test (GitHub runner) shrinks the plan
    os.environ.update(dict(FHK_NET='kb4_512', FHK_BINPACK='auto', FHK_NRUNS='3', FHK_HOURS='9', FHK_EPOCHS='3', FHK_NSRC='4', **PLANS[os.environ['FHK_PLAN']])); os.environ.update(keep)
API = os.environ.get('FHK_API', 'https://api.github.com')
R = 'khanfarazhusain/minds-eye-chess'; RAW = os.environ.get('FHK_RAW', f'https://raw.githubusercontent.com/{R}/engine-lab/tools/lab/')
W = '/kaggle/working' if os.path.isdir('/kaggle/working') else os.path.abspath('out'); D = '/tmp/fhk'
os.makedirs(W, exist_ok=True); os.makedirs(D, exist_ok=True); os.chdir(D)
LOG = open(os.path.join(W, 'train_log.txt'), 'a')
def say(*x):
    m = ' '.join(str(v) for v in x); print(m, flush=True); LOG.write(m + '\n'); LOG.flush()
def sh(c): say('$', c); subprocess.run(c, shell=True, check=True)
PRESETS = {'kb4_512': (4, 512, 'nets/current.bin'), 'kb8_768': (8, 768, None), 'kb16_1536': (16, 1536, None), 'kb16_1024': (16, 1024, None), 'kb16_768': (16, 768, None),
           'kb16_1536_ep1': (16, 1536, 'https://raw.githubusercontent.com/khanfarazhusain/minds-eye-chess/kaggle-nets/fhk_kb16_1536_more_20261117_0210_ep1.bin.gz'),  # continue Kaggle run 2, best epoch
           'kb16_1536_more': (16, 1536, 'https://raw.githubusercontent.com/khanfarazhusain/minds-eye-chess/kaggle-nets/fhk_kb16_1536_20261116_2138.bin.gz')}  # continue Kaggle run 1
NET = os.environ.get('FHK_NET', 'kb16_1536'); KB, H, INIT = PRESETS[NET]
if os.environ.get('FHK_AUTOINIT') and not os.environ.get('FHK_INIT'):  # newest net (final or hourly checkpoint) that an earlier run uploaded to the public release
    import re
    rl0 = json.load(urllib.request.urlopen(f'{API}/repos/{R}/releases/tags/kaggle-nets'))
    cand = sorted([x for x in rl0['assets'] if re.fullmatch(r'fhk_kb4_512_\d{8}_\d{4}(_latest)?\.bin', x['name']) and x['size'] == 6326312], key=lambda x: x['updated_at'])
    assert cand, 'FHK_PLAN 2/3 needs a net from the previous run in the kaggle-nets release (none found) - do not continue, tell Claude'
    os.environ['FHK_INIT'] = cand[-1]['browser_download_url']; print('AUTOINIT picked', cand[-1]['name'], cand[-1]['updated_at'], flush=True)
if os.environ.get('FHK_INIT'): INIT = os.environ['FHK_INIT']  # resume: URL (.bin or .bin.gz), /kaggle/input/... path or repo path of the net from the previous run
EPOCHS = int(os.environ.get('FHK_EPOCHS', '1')); HOURS = float(os.environ.get('FHK_HOURS', '11'))  # 17 Nov: default 1 epoch (valid loss was best after epoch 1, then rose)
LR = os.environ.get('FHK_LR', '5e-4' if INIT else '1e-3')
if KB == 8: sys.exit('kb8 is not in fhkfeat.py yet; use kb4_512 or kb16_1536')
STAMP = time.strftime('%Y%m%d_%H%M', time.gmtime()); NAME = f'fhk_{NET}_{STAMP}'
OUT = os.path.join(W, NAME + '.bin'); CK = os.path.join(W, 'checkpoints_' + NAME)
say('== FHK Kaggle trainer', NAME, 'kb', KB, 'h', H, 'epochs', EPOCHS, 'lr', LR, 'max hours', HOURS)
sh('nvidia-smi --query-gpu=name,memory.total --format=csv || echo "NO GPU! Settings > Accelerator > GPU"')
for f in ['trainpt2.py', 'fhkfeat.py', 'featpack.c', '../evconv2.py', 'binpack_dump.cpp']: urllib.request.urlretrieve(RAW + 'train/' + f, os.path.basename(f))
sh('gcc -O2 -o featpack featpack.c -lm')
if INIT:
    src = INIT if INIT.startswith('http') else RAW + INIT
    if src.startswith('/'): sh(f"(zcat -f '{src}') > init.bin")
    elif src.endswith('.gz'): sh(f"curl -fsSL --retry 4 '{src}' | zcat > init.bin")
    else: urllib.request.urlretrieve(src, 'init.bin')
    assert os.path.getsize('init.bin') > 1000, 'init net is empty'
    say('init from', INIT)
rel = json.load(urllib.request.urlopen(f'{API}/repos/{R}/releases/tags/data-archive'))
assets = sorted([a for a in rel['assets'] if a['name'].endswith('.gz')], key=lambda a: a['size'])
valid_src = next((a for a in assets if a['name'] == 'run_43665001216.gz'), assets[0])  # held out completely (same file every run, so runs compare)
assets = [valid_src] + [a for a in assets if a is not valid_src]
if any(a['name'].startswith('lichess_eval_') for a in assets):  # the full Lichess set replaces the old slice (run_43660933797 had fake 0.5 results)
    assets = [a for a in assets if a['name'] != 'run_43660933797.gz']
free = shutil.disk_usage(D).free - 3_000_000_000 - (5_000_000_000 if float(os.environ.get('FHK_LICHESS', '1e8')) else 0)  # room for Lichess files
budget = min(free, int(float(os.environ.get('FHK_GB', '1000')) * 1e9))
train, total = [], 0
for a in sorted(assets[1:], key=lambda a: a['name'], reverse=True):
    if total + a['size'] <= budget: train.append(a); total += a['size']
if os.environ.get('FHK_NOARCHIVE') == '1': train, total = [], 0  # binpack-only run: skip the old self-play archive
say('train files', len(train), 'of', len(assets) - 1, 'GB', round(total / 1e9, 2), '(about', round(total / 1e9 * 8), 'crore positions), valid from', valid_src['name'])
sh(f"curl -sSL --retry 4 {valid_src['browser_download_url']} 2>/dev/null | zcat 2>/dev/null | head -n 1000000 | gzip -1 > valid.gz || true")
for a in train:
    if not (os.path.exists(a['name']) and os.path.getsize(a['name']) == a['size']): sh(f"curl -fsSL --retry 4 -o {a['name']} {a['browser_download_url']}")
LN = int(float(os.environ.get('FHK_LICHESS', '1e8'))); extra = []
if LN and not any(a['name'].startswith('lichess_eval_') for a in train):  # convert the Lichess eval DB here (fast download on Kaggle)
    train = [a for a in train if a['name'] != 'run_43660933797.gz']  # old Lichess slice with fake 0.5 results
    t = time.time(); say('converting', LN, 'Lichess DB lines (Stockfish depth>=20, best move kept)')
    if subprocess.run('which zstd', shell=True).returncode: subprocess.run([sys.executable, '-m', 'pip', 'install', '-q', 'zstandard'])
    unz = 'zstd -dc' if not subprocess.run('which zstd', shell=True).returncode else f"{sys.executable} -c 'import sys,zstandard; zstandard.ZstdDecompressor().copy_stream(sys.stdin.buffer, sys.stdout.buffer)'"
    np_ = max(os.cpu_count() or 2, 2)
    subprocess.run(f"set +o pipefail; {os.environ.get('FHK_LICHESS_CMD', 'curl -sL --retry 5 https://database.lichess.org/lichess_db_eval.jsonl.zst')} | {unz} | head -n {LN} | split -n r/{np_} -d -a 2 --filter='{sys.executable} evconv2.py | gzip -1 > $FILE.gz' - lichess_k_", shell=True, executable='/bin/bash')
    extra = sorted(f for f in os.listdir('.') if f.startswith('lichess_k_') and f.endswith('.gz'))
    say('Lichess files', extra, 'GB', round(sum(os.path.getsize(f) for f in extra) / 1e9, 2), 'in', round((time.time() - t) / 60, 1), 'min')
# Stockfish self-play binpacks (HuggingFace official-stockfish/master-binpacks, public). FHK_BINPACK="nodes5000pv2_UHO,farseerT75" FHK_BPN=3e8 (total positions) FHK_LICHESS=0
BP = [x.strip() for x in os.environ.get('FHK_BINPACK', '').split(',') if x.strip()]
BPS = os.environ.get('FHK_BPSCALE', '0.75')  # 0.75 = binpack cp -> FHK cp (FHK/Stockfish eval ratio; 1.5 made the net 1.95x too big vs the search margins)
STREAM = os.environ.get('FHK_STREAM', '1') == '1'  # stream binpacks straight into the trainer: no disk, any amount of data, mixed with the other sources
HFB = 'https://huggingface.co/datasets/official-stockfish/master-binpacks/'
pipes = []
if BP and STREAM:
    vn = os.environ.get('FHK_BPVALID', 'fishpack32'); RUN = int(os.environ.get('FHK_RUN', '1')); NRUNS = int(os.environ.get('FHK_NRUNS', '3')); OFF = int(float(os.environ.get('FHK_BPOFF', '0')))
    if BP == ['auto']:  # every binpack of the dataset, split over the runs so no run reads another run's files (no skipping through data)
        try:
            tr = json.load(urllib.request.urlopen(HFB.replace('/datasets/', '/api/datasets/') + 'tree/main?recursive=true'))
            names = sorted(x['path'][:-8] for x in tr if x['path'].endswith('.binpack') and x['path'][:-8] != vn)
            say('HF binpack files', len(names), 'GB', round(sum(x.get('size', 0) for x in tr if x['path'].endswith('.binpack')) / 1e9))
        except Exception as e:
            names = ['nodes5000pv2_UHO', 'farseerT75', 'fishpack32'][:2]; say('HF listing failed, using', names, e)
        BP = names[RUN - 1::NRUNS]; say('run', RUN, 'of', NRUNS, 'uses', len(BP), 'binpack files:', BP)
    sh('rm -rf nnp && git clone -q --depth 1 https://github.com/official-stockfish/nnue-pytorch nnp && g++ -O2 -std=c++20 -I. -o binpack_dump binpack_dump.cpp')
    for nm in BP: pipes.append(f"pipe:curl -sL --retry 5 {HFB}resolve/main/{nm}.binpack | ./binpack_dump /dev/stdin 100000000000 {BPS} 8 {OFF} 2>> bp_progress.log")
    if os.environ.get('FHK_BPVALID', 'fishpack32'):
        subprocess.run(f"set +o pipefail; curl -sL --retry 5 {HFB}resolve/main/{vn}.binpack | ./binpack_dump /dev/stdin 1500000 {BPS} 8 | head -n 1000000 | gzip -1 > valid.gz", shell=True, executable='/bin/bash')
        say('valid from binpack', vn, os.path.getsize('valid.gz'), 'bytes')
elif BP:
    t = time.time(); BPN = int(float(os.environ.get('FHK_BPN', '3e8'))); np_ = max(os.cpu_count() or 2, 2)
    sh('rm -rf nnp && git clone -q --depth 1 https://github.com/official-stockfish/nnue-pytorch nnp && g++ -O2 -std=c++20 -I. -o binpack_dump binpack_dump.cpp')
    for i, nm in enumerate(BP):
        url = f'{HFB}resolve/main/{nm}.binpack'
        subprocess.run(f"set +o pipefail; curl -sL --retry 5 {url} | ./binpack_dump /dev/stdin {BPN // len(BP)} {BPS} 8 | split -n r/{np_} -d -a 2 --filter='gzip -1 > $FILE.gz' - bp{i}_", shell=True, executable='/bin/bash')
    extra += sorted(f for f in os.listdir('.') if f.startswith('bp') and f.endswith('.gz'))
    if os.environ.get('FHK_BPVALID', 'fishpack32'):
        vn = os.environ.get('FHK_BPVALID', 'fishpack32')
        subprocess.run(f"set +o pipefail; curl -sL --retry 5 {HFB}resolve/main/{vn}.binpack | ./binpack_dump /dev/stdin 1500000 {BPS} 8 | head -n 1000000 | gzip -1 > valid.gz", shell=True, executable='/bin/bash')
        say('valid from binpack', vn, os.path.getsize('valid.gz'), 'bytes')
    say('binpack files', len(extra), 'in', round((time.time() - t) / 60, 1), 'min')
if pipes:  # archive + Lichess text files become ONE more mixed source (zcat of all of them), so every batch mixes binpack, self-play and Lichess
    loc = [a['name'] for a in train] + extra
    if loc: pipes.append('pipe:zcat ' + ' '.join(loc)); train, extra = [], []
# GitHub upload (release "kaggle-nets"). Needs a Kaggle Secret GH_TOKEN (Add-ons > Secrets, attached to this notebook). Without it the nets stay in the Output tab only.
tok = None
try:
    from kaggle_secrets import UserSecretsClient; tok = UserSecretsClient().get_secret('GH_TOKEN')
except Exception as e: say('no GH_TOKEN secret, skipping upload:', type(e).__name__)
def api(url, data=None, method='GET', ctype='application/json'):
    rq = urllib.request.Request(url, data=data, method=method, headers={'Authorization': 'Bearer ' + tok, 'Accept': 'application/vnd.github+json', 'Content-Type': ctype})
    with urllib.request.urlopen(rq) as r: return json.loads(r.read() or b'{}')
def gh_upload(pairs):  # [(local file, asset name)]; replaces an asset of the same name
    try: rl = api(f'{API}/repos/{R}/releases/tags/kaggle-nets')
    except urllib.error.HTTPError:
        rl = api(f'{API}/repos/{R}/releases', json.dumps({'tag_name': 'kaggle-nets', 'target_commitish': 'engine-lab', 'name': 'Nets trained on Kaggle', 'body': 'Uploaded by tools/lab/train/kaggle_cell.py'}).encode(), 'POST')
    up = rl['upload_url'].split('{')[0]
    for f, nm in pairs:
        for x in rl.get('assets', []):
            if x['name'] == nm: api(x['url'], method='DELETE')
        api(f'{up}?name={nm}', open(f, 'rb').read(), 'POST', 'application/octet-stream'); say('uploaded', nm)
if tok:
    import threading
    def bg():  # every hour: latest checkpoint + log to GitHub, so a dead session loses at most ~1 h
        while True:
            time.sleep(3600)
            try:
                lt = os.path.join(CK, 'latest.bin')
                if os.path.exists(lt): gh_upload([(lt, NAME + '_latest.bin'), (LOG.name, NAME + '_log.txt')])
            except Exception as e: say('periodic upload failed:', e)
    threading.Thread(target=bg, daemon=True).start()
t = time.time()
cmd = (f'python -u trainpt2.py {OUT} ' + ' '.join([a['name'] for a in train] + extra + ["'" + p + "'" for p in pipes]) + f' --nsrc {int(os.environ.get("FHK_NSRC", "4"))} --ck-min 20 --planned-pos {HOURS * 3600 * 4e5:.0f} --valid valid.gz --epochs {EPOCHS} --kb {KB} --h {H} --lr {LR}'
       + f' --ckdir {CK} --max-hours {max(HOURS - (time.time() - T0) / 3600 - 0.3, 0.02):.2f}' + (' --init init.bin' if INIT else '') + (' --lam 0.8 --lam-end 0.4 --fact' if os.environ.get('FHK_V2') == '1' else '') + ' ' + os.environ.get('FHK_EXTRA', ''))
say('$', cmd)
p = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
for line in p.stdout: print(line, end='', flush=True); LOG.write(line); LOG.flush()
rc = p.wait(); say('trainer exit', rc, 'after', round((time.time() - t) / 3600, 2), 'hours')
if not os.path.exists(OUT): sys.exit('no net was written, see train_log.txt')
for pf in ['bp_progress.log']:
    if os.path.exists(pf): say('binpack raw positions read per source (last progress lines; use as FHK_BPOFF to continue the same files):', open(pf).read().strip().split('\n')[-4:])
if tok:
    try:
        files = [(OUT, NAME + '.bin'), (LOG.name, NAME + '_log.txt')] + [(os.path.join(CK, f), NAME + '_' + f) for f in sorted(os.listdir(CK))] if os.path.isdir(CK) else [(OUT, NAME + '.bin'), (LOG.name, NAME + '_log.txt')]
        gh_upload(files); say('GitHub: https://github.com/' + R + '/releases/tag/kaggle-nets')
    except Exception as e: say('upload failed (net is still in the Output tab):', e)
say('DONE. Net:', OUT, '| checkpoints:', CK, '| log: train_log.txt (all in the Output tab)')
