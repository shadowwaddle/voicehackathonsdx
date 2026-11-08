// Python that runs inside the Daytona sandbox: reads story.json, writes site/index.html.
// Self-contained output: inline SVG art and system fonts, plus one Noto font link when
// the words page needs Chinese, Hindi or Japanese script.
export const STORYBOOK_SCRIPT = String.raw`
import html, json, math, os, random

here = os.path.dirname(os.path.abspath(__file__))
book = json.load(open(os.path.join(here, "story.json"), encoding="utf-8"))
esc = lambda s: html.escape(str(s), quote=True)

GENRE_PALETTES = {
    "fantasy": ["#b79ced", "#f5b8d0", "#ffd98a", "#8fc7e8"],
    "space": ["#3f4a8c", "#7a6fd0", "#8fd3f0", "#f5d76e"],
    "jungle": ["#7fb069", "#c5d86d", "#f4a259", "#3e8e7e"],
    "ocean": ["#3aa6b9", "#8fe0d6", "#5b8def", "#ffc898"],
    "detective": ["#d9a441", "#a67c52", "#6c7a89", "#f2d7a0"],
    "dinosaurs": ["#6fbf73", "#d8c36a", "#e58f65", "#8ab6a9"],
}
fallback = GENRE_PALETTES.get(book["genre"], GENRE_PALETTES["fantasy"])


def blob(r, cx, cy, rx, ry):
    n = 9
    pts = []
    for i in range(n):
        a = i / n * math.tau
        k = 0.75 + r.random() * 0.5
        pts.append((cx + math.cos(a) * rx * k, cy + math.sin(a) * ry * k))
    def mid(i):
        a, b = pts[i % n], pts[(i + 1) % n]
        return "%.1f %.1f" % ((a[0] + b[0]) / 2, (a[1] + b[1]) / 2)
    curves = " ".join("Q%.1f %.1f %s" % (p[0], p[1], mid(i)) for i, p in enumerate(pts))
    return "M%s %s Z" % (mid(n - 1), curves)


def bleed(r, fid, freq, scale):
    return (
        '<filter id="%s" x="-15%%" y="-15%%" width="130%%" height="130%%">'
        '<feTurbulence type="fractalNoise" baseFrequency="%s" numOctaves="3" seed="%d"/>'
        '<feDisplacementMap in="SourceGraphic" scale="%d"/></filter>' % (fid, freq, r.randint(1, 999), scale)
    )


def illustration(scene, i):
    r = random.Random(scene["location"] + str(i))  # same scene, same picture
    palette = scene["palette"] if len(scene["palette"]) >= 2 else fallback
    wash = "".join(
        '<path d="%s" fill="%s" opacity="%.2f"/>'
        % (blob(r, r.random() * 640, r.random() * 300, 70 + r.random() * 130, 45 + r.random() * 80), r.choice(palette), 0.22 + r.random() * 0.3)
        for _ in range(16)
    )
    ground = '<path d="%s" fill="%s" opacity=".55"/>' % (blob(r, 320, 400, 480, 110), r.choice(palette))
    cast = scene["characters"][:3]
    figures = ""
    for j, c in enumerate(cast):
        x = (j + 1) / (len(cast) + 1) * 640
        y = 262 + r.random() * 18
        size = 40 + r.random() * 12
        figures += (
            '<path d="%s" fill="%s" opacity=".92" filter="url(#soft%d)"/>' % (blob(r, x, y, size, size * 1.15), esc(c["color"]), i)
            + '<circle cx="%.1f" cy="%.1f" r="4.5" fill="#2b2350"/><circle cx="%.1f" cy="%.1f" r="4.5" fill="#2b2350"/>' % (x - 13, y - 10, x + 13, y - 10)
            + '<path d="M%.1f %.1f Q%.1f %.1f %.1f %.1f" stroke="#2b2350" stroke-width="3" fill="none" stroke-linecap="round"/>' % (x - 9, y + 9, x, y + 18, x + 9, y + 9)
            + '<text x="%.1f" y="%.1f" text-anchor="middle" class="name">%s</text>' % (x, y + size * 1.15 + 26, esc(c["name"]))
        )
    return (
        '<svg viewBox="0 0 640 400" role="img" aria-label="%s"><defs>%s%s</defs><rect width="640" height="400" fill="#fffdf6"/><g filter="url(#wash%d)">%s%s</g>%s</svg>'
        % (esc(scene["location"]), bleed(r, "wash%d" % i, 0.016, 42), bleed(r, "soft%d" % i, 0.04, 9), i, wash, ground, figures)
    )


def bullets(items):
    return "<ul>%s</ul>" % "".join("<li>%s</li>" % esc(x) for x in items) if items else "<p>—</p>"


scenes = book["scenes"] or [{"location": book["genre"].replace("_", " ").title(), "mood": "calm", "palette": fallback, "characters": book["characters"], "speaker": "Birbal"}]
pages = "".join('<section class="page">%s<h2>%s</h2></section>' % (illustration(s, i), esc(s["location"])) for i, s in enumerate(scenes))
LANG_NAMES = {"es": "Spanish", "fr": "French", "zh": "Mandarin", "hi": "Hindi", "ja": "Japanese"}
NOTO = {"zh": "Noto Sans SC", "hi": "Noto Sans Devanagari", "ja": "Noto Sans JP"}
words = [w for w in (book.get("wordsLearned") or []) if w.get("word") and w.get("language") in LANG_NAMES]
lang = words[0]["language"] if words else ""
noto = NOTO.get(lang)
font_link = ('<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=%s:wght@500;700&display=swap">' % noto.replace(" ", "+")) if noto else ""
word_font = ('"%s", ' % noto if noto else "") + "Georgia, serif"


def word_card(w, k):
    r = random.Random(w["word"] + str(k))
    color = r.choice(fallback)
    rom = '<div class="rom">%s</div>' % esc(w["romanization"]) if w.get("romanization") else ""
    return (
        '<div class="word"><svg class="wbg" viewBox="0 0 200 170" aria-hidden="true"><defs>%s</defs>'
        '<path d="%s" fill="%s" opacity=".38" filter="url(#wb%d)"/></svg>'
        '<div class="wc"><div class="emo">%s</div><div class="w" lang="%s">%s</div>%s<div class="m">%s</div></div></div>'
        % (bleed(r, "wb%d" % k, 0.03, 14), blob(r, 100, 85, 88, 70), color, k,
           esc(w.get("emoji", "")), esc(lang), esc(w["word"]), rom, esc(w.get("translation", "")))
    )


words_page = (
    '<section class="page"><h2>Words I learned in %s</h2><div class="words">%s</div></section>'
    % (LANG_NAMES[lang], "".join(word_card(w, k) for k, w in enumerate(words)))
) if words else ""
word_css = (
    ".words{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:16px}"
    ".word{position:relative;text-align:center;padding:26px 12px}"
    ".wbg{position:absolute;inset:0;width:100%;height:100%;border-radius:0}"
    ".wc{position:relative}.emo{font-size:40px}"
    ".w{font-family:" + word_font + ";font-size:36px;font-weight:700;line-height:1.2;margin-top:4px}"
    ".rom{font-size:18px;opacity:.7}.m{font-size:18px;margin-top:4px}"
) if words else ""

names = ", ".join(esc(c["name"]) for c in book["characters"])
starring = "<p>Starring %s</p>" % names if names else ""

page = """<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>%(title)s</title>
%(font_link)s<style>
:root{--ink:#2b2350;--paper:#fffaf0;--accent:#c8622a;--soft:#f3e8ff}
*{box-sizing:border-box}body{margin:0;background:linear-gradient(160deg,#ffe8cc,#e9d8ff);font-family:"Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif;color:var(--ink);min-height:100vh;padding:24px 16px}
.page{max-width:720px;margin:0 auto 24px;background:var(--paper);border-radius:28px;padding:32px;box-shadow:0 20px 60px rgba(43,35,80,.18)}
.cover{text-align:center;padding:64px 32px}.tag{display:inline-block;background:var(--soft);border-radius:999px;padding:6px 14px;font-weight:700}
h1{font-size:clamp(32px,7vw,52px);margin:20px 0 8px;line-height:1.1}h2{color:var(--accent);margin:20px 0 8px;font-size:26px}
p,li{font-size:20px;line-height:1.6}ul{padding-left:22px}svg{display:block;width:100%%;height:auto;border-radius:18px}.name{font:700 18px Georgia,serif;fill:#2b2350}
%(word_css)s
</style></head><body>
<section class="page cover"><span class="tag">%(genre)s</span><h1>%(title)s</h1><p>Told by Birbal, with help from a very clever friend</p>%(starring)s</section>
%(pages)s
<section class="page"><h2>The Story</h2><p>%(summary)s</p></section>
<section class="page"><h2>Your choices</h2>%(choices)s<h2>Puzzles you solved</h2>%(puzzles)s</section>
%(words_page)s
</body></html>""" % {
    "title": esc(book["title"]), "genre": esc(book["genre"].replace("_", " ").title()), "starring": starring, "pages": pages,
    "summary": esc(book["summary"]), "choices": bullets(book["choices"]), "puzzles": bullets(book["puzzles_solved"]),
    "font_link": font_link, "word_css": word_css, "words_page": words_page,
}

os.makedirs(os.path.join(here, "site"), exist_ok=True)
with open(os.path.join(here, "site", "index.html"), "w", encoding="utf-8") as f:
    f.write(page)
print("wrote site/index.html", len(page))
`;
