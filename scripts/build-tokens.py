#!/usr/bin/env python3
"""
Vitrin token build.

Source of truth: the Vitrin Figma file (local variables + styles).
Input : tokens/figma-export.txt  (colors, exported from Figma)
        + the SIZE / TYPE / EFFECT tables below (exported from Figma, 27 Oct 2026)
Output: tokens/tokens.json        (machine-readable, all layers)
        src/styles/tokens.css     (CSS custom properties: primitives, semantic light/dark, responsive type)
        src/styles/theme.css      (Tailwind v4 @theme mapping -> utilities)

Re-run after every Figma variable change:  python3 scripts/build-tokens.py
"""
import json, re, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "tokens" / "figma-export.txt"

# ---------------------------------------------------------------- parse colors
primitives, semantic = {}, {}
section = None
for line in SRC.read_text().splitlines():
    line = line.strip()
    if not line:
        continue
    if line.startswith("## "):
        section = "prim" if "Primitives" in line else "sem"
        continue
    name, value = line.split("=", 1)
    if section == "prim":
        primitives[name] = value
    else:
        light, dark = value.split("|")
        semantic[name] = (light, dark)

def prim_var(name: str) -> str:          # primary/600 -> --th-primary-600
    return "--th-" + name.replace("/", "-")

def sem_key(name: str) -> str:           # text/text-primary -> text-primary ; component-specific/sale price/price-sale -> price-sale
    return name.split("/")[-1].replace(" ", "-")

def resolve(v: str) -> str:
    m = re.fullmatch(r"\{(.+)\}", v)
    if m:
        ref = m.group(1)
        assert ref in primitives, f"Unresolved alias {ref}"
        return f"var({prim_var(ref)})"
    return v

# ---------------------------------------------------------------- size / type / effects (from Figma)
SPACE = [0, 2, 4, 6, 8, 12, 14, 16, 20, 24, 32, 36, 40, 48, 52, 60, 64, 72, 80, 96, 120, 160, 200]
RADIUS = {"0": 0, "4": 4, "8": 8, "12": 12, "16": 16, "24": 24, "full": 9999}
# Radius roles: what a shape is, not its size, so a preset can
# change it. control = buttons, inputs, chips, tiles; card = cards, alerts, images in cards;
# surface = bands, callouts, empty states, large panels; overlay = dialogs, menus, tooltips, toasts.
# The numeric scale stays for details (focus boxes, thumbnails, bars).
RADIUS_ROLES = {"control": 8, "card": 8, "surface": 16, "overlay": 8}
ICON = {"sm": 12, "md": 20, "lg": 28, "xl": 40, "2xl": 48}
BORDER = {"default": 1, "double": 2}

FONT = {"sans": "Figtree", "mono": "Roboto Mono"}
# role: (weight, line-height, sizes desktop/tablet/mobile)
TYPE = {
    "display-lg":  (700, 1.22, (56, 44, 36)),
    "display-md":  (700, 1.22, (44, 36, 32)),
    "display-sm":  (700, 1.22, (36, 32, 28)),
    "headline-lg": (700, 1.25, (32, 28, 24)),
    "headline-md": (700, 1.25, (28, 24, 22)),
    "headline-sm": (700, 1.25, (24, 22, 20)),
    "title-lg":    (600, 1.27, (22, 20, 18)),
    "title-md":    (600, 1.35, (16, 16, 16)),
    "title-sm":    (600, 1.42, (14, 14, 14)),
    "body-lg":     (400, 1.38, (16, 16, 16)),
    "body-md":     (400, 1.43, (14, 14, 14)),   # Figma: 20px fixed line-height on 14px
    "body-sm":     (500, 1.50, (12, 12, 12)),   # Medium by design (Body/Weight Medium)
    "label-lg":    (500, 1.42, (14, 14, 14)),
    "label-md":    (500, 1.33, (12, 12, 12)),
    "label-sm":    (500, 1.45, (11, 11, 11)),
    "label-xs":    (500, 1.20, (8, 8, 8)),
    "code-sm":     (400, 1.50, (12, 12, 12)),
    "code-md":     (400, 1.50, (14, 14, 14)),
    "code-lg":     (400, 1.50, (16, 16, 16)),
}
SHADOW = {
    "sm":    "0 1px 5px 0 rgb(0 0 0 / 0.05)",
    "base":  "0 1px 6px 0 rgb(0 0 0 / 0.07)",
    "md":    "0 4px 6px 0 rgb(0 0 0 / 0.12)",
    "lg":    "0 4px 6px -2px rgb(0 0 0 / 0.05), 0 12px 15px -3px rgb(0 0 0 / 0.10)",
    "xl":    "0 10px 10px -5px rgb(0 0 0 / 0.04), 0 20px 25px -5px rgb(0 0 0 / 0.10)",
    "2xl":   "0 25px 50px -12px rgb(0 0 0 / 0.25)",
    "inner": "inset 0 2px 4px 0 rgb(0 0 0 / 0.06)",
    "up":    "0 -4px 24px 0 rgb(0 0 0 / 0.08)",   # bars fixed to the bottom (cookie banner, action bar)
}
BLUR = {"sm": 4, "base": 8, "md": 12, "lg": 16, "xl": 24, "2xl": 40, "3xl": 64}
BREAKPOINTS = {"tablet": 744, "desktop": 1024, "wide": 1440}   # desktop 1024 confirmed by design (27 Oct 2026)
GRID = {"mobile": (4, 8, 16), "tablet": (6, 8, 16), "desktop": (12, 8, 40)}  # cols, gutter, margin

# ---------------------------------------------------------------- tokens.json
tokens = {
    "$source": "Vitrin Figma file — local variables & styles",
    "primitive": {"color": primitives, "space": SPACE, "radius": RADIUS, "font": FONT},
    "radiusRole": RADIUS_ROLES,
    "semantic": {"color": {sem_key(k): {"light": v[0], "dark": v[1], "figma": k} for k, v in semantic.items()}},
    "type": {k: {"weight": w, "lineHeight": lh, "size": dict(zip(("desktop", "tablet", "mobile"), s))} for k, (w, lh, s) in TYPE.items()},
    "shadow": SHADOW, "blur": BLUR, "icon": ICON, "border": BORDER,
    "breakpoint": BREAKPOINTS, "grid": {k: {"columns": c, "gutter": g, "margin": m} for k, (c, g, m) in GRID.items()},
}
(ROOT / "tokens" / "tokens.json").write_text(json.dumps(tokens, indent=2, ensure_ascii=False))

# ---------------------------------------------------------------- tokens.css
L = ["/* AUTO-GENERATED by scripts/build-tokens.py — do not edit by hand. */", "", ":root {", "  /* ---- Primitives (never use directly in components) ---- */"]
for k, v in primitives.items():
    L.append(f"  {prim_var(k)}: {v};")
L += ["", "  /* ---- Semantic: light ---- */"]
for k, (light, _) in semantic.items():
    L.append(f"  --th-{sem_key(k)}: {resolve(light)};")
L += ["", "  /* ---- Typography (mobile first) ---- */"]
# next/font exposes each family as a CSS variable that already contains the
# metric-matched fallback ("'Figtree', 'Figtree Fallback'"), which prevents CLS.
# Keep the plain family name as a second option for contexts without next/font (e.g. Storybook).
NEXT_FONT_VAR = {"sans": "--font-figtree", "mono": "--font-roboto-mono"}
for f, fam in FONT.items():
    fallback = "ui-monospace, monospace" if f == "mono" else "system-ui, sans-serif"
    L.append(f"  --th-font-{f}: var({NEXT_FONT_VAR[f]}, \"{fam}\"), {fallback};")
for k, (w, lh, s) in TYPE.items():
    L.append(f"  --th-{k}-size: {s[2]}px;")
L += ["", "  /* ---- Radius roles (presets change these) ---- */"]
for k, v in RADIUS_ROLES.items():
    L.append(f"  --th-radius-{k}: {v}px;")
L += ["", "  /* ---- Icon sizes (Figma Icon/*) ---- */"]
for k, v in ICON.items():
    L.append(f"  --th-icon-size-{k}: {v}px;")
L += ["", "  /* ---- Shadows (Figma effect styles shadow/*) ---- */"]
for k, v in SHADOW.items():
    L.append(f"  --th-shadow-{k}: {v};")
L += ["", "  /* ---- Grid ---- */", f"  --th-grid-columns: {GRID['mobile'][0]};", f"  --th-grid-gutter: {GRID['mobile'][1]}px;", f"  --th-grid-margin: {GRID['mobile'][2]}px;", "}", ""]
L += ["[data-theme=\"dark\"] {", "  /* ---- Semantic: dark ---- */"]
for k, (_, dark) in semantic.items():
    L.append(f"  --th-{sem_key(k)}: {resolve(dark)};")
# Dark-mode elevation (TOKEN-AUDIT, 29 Oct 2026): shadows barely show on dark surfaces, so every
# drop shadow also draws a 1px border-default hairline. Inset shadows are left alone.
L += ["", "  /* ---- Shadows: dark adds a 1px border-default hairline ---- */"]
for k, v in SHADOW.items():
    L.append(f"  --th-shadow-{k}: {v if v.startswith('inset') else '0 0 0 1px var(--th-border-default), ' + v};")
L += ["  color-scheme: dark;", "}", ""]
for bp, idx in (("tablet", 1), ("desktop", 0)):
    L.append(f"@media (min-width: {BREAKPOINTS[bp]}px) {{")
    L.append("  :root {")
    for k, (w, lh, s) in TYPE.items():
        if s[idx] != s[2]:
            L.append(f"    --th-{k}-size: {s[idx]}px;")
    c, g, m = GRID[bp]
    L += [f"    --th-grid-columns: {c};", f"    --th-grid-gutter: {g}px;", f"    --th-grid-margin: {m}px;", "  }", "}", ""]
(ROOT / "src" / "styles" / "tokens.css").write_text("\n".join(L))

# ---------------------------------------------------------------- theme.css (Tailwind v4)
T = ["/* AUTO-GENERATED by scripts/build-tokens.py — do not edit by hand.",
     "   Tailwind v4 theme: default palette, spacing, radii, shadows and type are REPLACED by Vitrin tokens. */", "",
     "@theme inline {",
     "  /* Remove Tailwind defaults so only Vitrin tokens exist */",
     "  --color-*: initial;", "  --font-*: initial;", "  --text-*: initial;", "  --radius-*: initial;", "  --shadow-*: initial;", "  --blur-*: initial;", "  --breakpoint-*: initial;", "",
     "  /* Spacing: 1 unit = 1px, so p-16 = 16px, gap-8 = 8px (matches Figma Space/s-16, s-8) */",
     "  --spacing: 1px;", "",
     "  /* Semantic colors -> bg-surface-primary, text-text-secondary, border-border-default ... */"]
for k in semantic:
    T.append(f"  --color-{sem_key(k)}: var(--th-{sem_key(k)});")
T += ["  --color-transparent: transparent;", "  --color-current: currentColor;", ""]
for f in FONT:
    T.append(f"  --font-{f}: var(--th-font-{f});")
T.append("")
for k, (w, lh, s) in TYPE.items():
    T += [f"  --text-{k}: var(--th-{k}-size);", f"  --text-{k}--line-height: {lh};", f"  --text-{k}--font-weight: {w};"]
T.append("")
for k, v in RADIUS.items():
    T.append(f"  --radius-{k}: {v}px;")
for k in RADIUS_ROLES:
    T.append(f"  --radius-{k}: var(--th-radius-{k});")
T.append("")
for k in SHADOW:
    T.append(f"  --shadow-{k}: var(--th-shadow-{k});")
for k, v in BLUR.items():
    T.append(f"  --blur-{k}: {v}px;")
T.append("")
for k, v in BREAKPOINTS.items():
    T.append(f"  --breakpoint-{k}: {v}px;")
T += ["}", ""]
(ROOT / "src" / "styles" / "theme.css").write_text("\n".join(T))

print(f"OK  primitives={len(primitives)} semantic={len(semantic)} type={len(TYPE)}")

# ================================================================ component token layer (3rd layer)
# Input: tokens/figma-components.txt  (Figma collection "Component Tokens", aliases to primitives)
# Output: appended to tokens.css (light in :root, dark in [data-theme="dark"]) and tokens.json["component"]
# Not exposed as Tailwind utilities on purpose: components consume them inside their own variant classes,
# e.g. bg-(--th-button-accent-solid-bg). Page code never references component tokens directly.
COMP_SRC = ROOT / "tokens" / "figma-components.txt"
if COMP_SRC.exists():
    component = {}
    for line in COMP_SRC.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        name, value = line.split("=", 1)
        light, dark = value.split("|")
        component[name] = (light, dark)
    css = (ROOT / "src" / "styles" / "tokens.css").read_text()
    light_block = ["", "  /* ---- Component tokens: light (3rd layer, alias primitives) ---- */"] + [f"  --th-{k.split('/')[-1]}: {resolve(v[0])};" for k, v in component.items()]
    dark_block = ["", "  /* ---- Component tokens: dark ---- */"] + [f"  --th-{k.split('/')[-1]}: {resolve(v[1])};" for k, v in component.items()]
    css = css.replace("\n  /* ---- Typography (mobile first) ---- */", "\n".join(light_block) + "\n\n  /* ---- Typography (mobile first) ---- */", 1)
    css = css.replace("  color-scheme: dark;", "\n".join(dark_block).lstrip("\n") + "\n  color-scheme: dark;", 1)
    (ROOT / "src" / "styles" / "tokens.css").write_text(css)
    tj = json.loads((ROOT / "tokens" / "tokens.json").read_text())
    tj["component"] = {"color": {k.split("/")[-1]: {"light": v[0], "dark": v[1], "figma": k} for k, v in component.items()}}
    (ROOT / "tokens" / "tokens.json").write_text(json.dumps(tj, indent=2, ensure_ascii=False))
    # drift report: component tokens whose light/dark pair no longer matches ANY semantic token (expected for tuned tokens)
    sem_pairs = set(semantic.values())
    tuned = [k.split("/")[-1] for k, v in component.items() if v not in sem_pairs]
    print(f"OK  component={len(component)}  (independent of semantic layer: {len(tuned)})")

# ================================================================ presets
# Input: tokens/presets.json. Each preset overrides the primary ramp, the sans font and the radius
# roles. Semantic and component tokens are declared again inside the preset block: a custom
# property that reads var(--th-primary-700) is resolved where it is declared, so overriding the
# primitive alone on a wrapper would not reach them. The dark block is more specific, so a preset
# keeps following data-theme on <html>.
PRESET_SRC = ROOT / "tokens" / "presets.json"
# next/font variables of the families a preset may use (src/lib/fonts.ts).
PRESET_FONTS = {"nunito": ("--font-nunito", "Nunito")}
if PRESET_SRC.exists():
    presets = json.loads(PRESET_SRC.read_text())["presets"]
    comp = component if COMP_SRC.exists() else {}
    def declarations(pick):
        sem = [f"  --th-{sem_key(k)}: {resolve(pick(v))};" for k, v in semantic.items()]
        com = [f"  --th-{k.split('/')[-1]}: {resolve(pick(v))};" for k, v in comp.items()]
        return sem + com
    P = ["", "/* ---- Presets (tokens/presets.json) ---- */"]
    for pid, preset in presets.items():
        own = []
        for step, value in (preset.get("primary") or {}).items():
            own.append(f"  --th-primary-{step}: {value};")
        for role, value in (preset.get("radius") or {}).items():
            assert role in RADIUS_ROLES, f"Unknown radius role {role} in preset {pid}"
            own.append(f"  --th-radius-{role}: {value}px;")
        font = preset.get("font")
        if font:
            var, family = PRESET_FONTS[font]
            own.append(f"  --th-font-sans: var({var}, \"{family}\"), system-ui, sans-serif;")
            own.append("  font-family: var(--th-font-sans);")
        if not own:
            continue
        P += [f'[data-preset="{pid}"] {{'] + own + declarations(lambda v: v[0]) + ["}", ""]
        P += [f'[data-theme="dark"] [data-preset="{pid}"],', f'[data-theme="dark"][data-preset="{pid}"] {{'] + declarations(lambda v: v[1]) + ["}", ""]
    css = (ROOT / "src" / "styles" / "tokens.css").read_text().rstrip("\n") + "\n" + "\n".join(P)
    (ROOT / "src" / "styles" / "tokens.css").write_text(css)
    tj = json.loads((ROOT / "tokens" / "tokens.json").read_text())
    tj["preset"] = presets
    (ROOT / "tokens" / "tokens.json").write_text(json.dumps(tj, indent=2, ensure_ascii=False))
    print(f"OK  presets={len(presets)}")
