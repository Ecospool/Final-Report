# EcoSpool — FYP Presentation Website

**National University of Singapore · Mechanical Engineering · CDE4301 · 2025–2026**

A static presentation website for the EcoSpool Final Year Project — designing a modified single-screw extrusion system to recycle post-consumer polypropylene (PP) waste into 3D printing filament.

---

## Project Summary

EcoSpool addresses the lack of lab-scale PP recycling infrastructure by modifying a Felfil single-screw extruder with:

- **Compression screw (CR 3.5)** — eliminates feed-zone air voids and stabilises throughput
- **Three-zone barrel heating (185 / 195 / 200 °C)** — derived from PP thermal properties and Maddock solidification experiments
- **Omni-Flow annular cooling assembly** — four-fan radially symmetric airflow for round, consistent filament

**Result:** 1.75 mm diameter filament, σ = 0.183 mm, validated printable on commercial FDM printers.

---

## Repository Structure

```
ecospool/
├── index.html              # Main single-page presentation
├── css/
│   ├── style.css           # Core layout, nav, typography, components
│   └── animations.css      # Scroll-triggered fade-up animations
├── js/
│   └── main.js             # Nav scroll-highlight, mobile toggle, intersection observer
├── assets/
│   ├── icons/
│   │   └── favicon.svg     # EcoSpool logo mark (SVG favicon)
│   └── images/             # Place your project photos here
│       └── .gitkeep
└── README.md
```

---

## Navigation

The top nav contains all chapters with hover dropdowns to sub-sections:

| # | Chapter |
|---|---------|
| — | Acknowledgements |
| — | Executive Summary |
| 1 | Introduction |
| 2 | Problem Analysis |
| 3 | Design Methodology |
| 4 | Compression Screw |
| 5 | Heating & Melting Mechanisms |
| 6 | Cooling Systems |
| 7 | Final Prototype & Test Configuration |
| 8 | Integrated Prototype Validation |
| 9 | Limitations & Future Work |
| 10 | Conclusion |
| — | Appendices |

---

## Usage

This is a pure HTML/CSS/JS static site — no build step required.

```bash
# Clone and open locally
git clone https://github.com/<your-username>/ecospool-fyp-site.git
cd ecospool-fyp-site
open index.html          # macOS
# or serve with any static file server:
npx serve .
python3 -m http.server 8080
```

### Adding Images

Place project photos in `assets/images/` and reference them in `index.html`:

```html
<img src="assets/images/your-photo.jpg" alt="Description" class="figure-img" />
```

### Deploying to GitHub Pages

1. Push to a GitHub repository
2. Go to **Settings → Pages**
3. Source: **Deploy from a branch** → `main` → `/ (root)`
4. Site will be live at `https://<username>.github.io/<repo-name>/`

---

## Tech Stack

- **HTML5** — semantic markup, no framework
- **CSS3** — custom properties, CSS Grid, sticky nav, transitions
- **Vanilla JS** — IntersectionObserver for scroll animations, mobile accordion nav
- **Google Fonts** — Cormorant Garamond (serif display) + DM Sans (body)

---

## Key System Parameters

| Parameter | Value |
|---|---|
| Platform | Felfil Evo single-screw extruder |
| Barrel L × D | 400 mm × 25 mm (L:D = 17.6) |
| Screw compression ratio | 3.5:1 |
| Zone 1 / 2 / 3 setpoints | 185 / 195 / 200 °C |
| Operating screw speed | 2–6.7 rpm |
| Target filament diameter | 1.75 ± 0.1 mm |
| Achieved σ (best run) | 0.183 mm |
| Zero-shear viscosity η₀ | 4,400 Pa·s (NETZSCH DSC) |
| Total system power | ~370 W |

---

## Acknowledgements

NUS Department of Mechanical Engineering · NUS Safety & Security Unit · Robomaster · Bumblebee Autonomous Vehicle Team

---

*EcoSpool FYP · NUS ME4101A · 2025–2026*
