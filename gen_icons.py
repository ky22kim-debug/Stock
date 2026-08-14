from PIL import Image, ImageDraw, ImageFont

BG = (13, 17, 23, 255)      # --bg
ACCENT = (240, 192, 64, 255)  # --accent
GREEN = (63, 185, 80, 255)

def draw_icon(size, maskable=False):
    img = Image.new("RGBA", (size, size), BG)
    d = ImageDraw.Draw(img)

    # safe zone padding for maskable icons (~10% margin each side)
    pad = int(size * (0.18 if maskable else 0.10))
    inner = size - pad * 2

    # rounded background card (only for non-maskable so it looks like an app icon on white bg too)
    if not maskable:
        d.rounded_rectangle([0, 0, size - 1, size - 1], radius=int(size * 0.20), fill=BG)

    # simple ascending bar chart glyph
    bars = 4
    gap = inner * 0.12
    bar_w = (inner - gap * (bars - 1)) / bars
    heights = [0.38, 0.58, 0.78, 1.0]
    base_y = pad + inner
    x = pad
    for i, h in enumerate(heights):
        bh = inner * h * 0.62
        y0 = base_y - bh
        color = ACCENT if i < bars - 1 else GREEN
        d.rounded_rectangle([x, y0, x + bar_w, base_y], radius=bar_w * 0.25, fill=color)
        x += bar_w + gap

    # trend line accent
    line_pts = []
    x = pad
    for i, h in enumerate(heights):
        bh = inner * h * 0.62
        y0 = base_y - bh - inner * 0.06
        line_pts.append((x + bar_w / 2, y0))
        x += bar_w + gap
    d.line(line_pts, fill=(230, 237, 243, 255), width=max(2, int(size * 0.02)), joint="curve")
    for px, py in line_pts:
        r = max(2, int(size * 0.018))
        d.ellipse([px - r, py - r, px + r, py + r], fill=(230, 237, 243, 255))

    return img

for size in (192, 512):
    draw_icon(size, maskable=False).save(f"icons/icon-{size}.png")
    draw_icon(size, maskable=True).save(f"icons/icon-{size}-maskable.png")

print("icons generated")
