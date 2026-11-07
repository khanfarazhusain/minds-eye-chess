#!/usr/bin/env bash
# Rebuild downloads/Chess-Course-Notes.docx and .txt from notes.html.
# Needs: node + playwright, python3 (pillow, python-docx), pandoc.
set -euo pipefail
export LANG=C.UTF-8 LC_ALL=C.UTF-8
HERE="$(cd "$(dirname "$0")" && pwd)"; ROOT="$(cd "$HERE/../.." && pwd)"; OUT="$HERE/out"
node "$HERE/export.js"
cd "$OUT"
python3 - <<'PY'
from PIL import Image;import glob
for f in glob.glob('img/*.png'):
    im=Image.open(f).convert('RGB').resize((480,480),Image.LANCZOS).quantize(colors=64,method=Image.Quantize.MEDIANCUT);im.save(f,optimize=True)
# Word styles: each level on a new page, bigger headings
import subprocess,docx
from docx.shared import Pt,RGBColor
subprocess.run('pandoc -o ref.docx --print-default-data-file reference.docx',shell=True,check=True)
d=docx.Document('ref.docx')
S={s.name:s for s in d.styles}
for name,size in [('Heading 1',22),('Heading 2',17),('Heading 3',13.5)]:
    st=S[name];st.font.size=Pt(size);st.font.bold=True;st.font.color.rgb=RGBColor(0x23,0x66,0x4A)
S['Heading 1'].paragraph_format.page_break_before=True
S['Heading 2'].paragraph_format.space_before=Pt(18)
d.save('ref.docx')
PY
pandoc docx.html -f html -t docx -o "$ROOT/downloads/Chess-Course-Notes.docx" --resource-path=. --reference-doc=ref.docx \
  --metadata title="Chess Course Notes"
pandoc txt.html -f html -t plain --wrap=auto --columns=78 -o body.txt
{ printf 'CHESS COURSE NOTES (basics se pro tak) - 7 levels, 47 lessons\nOnline (diagrams ke saath): https://khanfarazhusain.github.io/minds-eye-chess/notes.html\n\nDiagram kaise padhein:\n  Bade letters = White, chhote letters = Black\n  K king, Q queen, R rook, B bishop, N knight, P pawn\n  * = piece yahan ja sakta hai,  # = important (highlighted) square,  . = khaali\n  Arrows sirf Word/online version mein dikhte hain.\n\nHeadings: ### = Level, === = Lesson (jaise 1.2), --- = Topic (jaise 1.2.3)\n\n'; cat body.txt; } > "$ROOT/downloads/Chess-Course-Notes.txt"
echo done
