# TrueTier — Frontend Design System & UI Architecture

> **"See the source behind your suppliers."**  
> Comprehensive Design System, Architectural Constitution, and Interaction Specification for the TrueTier Supply Chain Intelligence Platform.

---

## 1. Design Constitution & Philosophy

TrueTier translates multi-tier supply chain opacity—a domain historically buried in clunky ERP tables and fragmented spreadsheets—into an intuitive, editorial, and mathematically rigorous visual experience.

### Core Tenets

1. **Anti-Slop Discipline & Clean Restraint**:
   - No generic purple gradients, floating stat balloons, or decorative emojis.
   - Zero-Pill Rule for static metadata: Informational metadata (dates, counts, formulas) is presented as clean unboxed typography separated by subtle typographic dots (`·`), reserving bordered pill shapes strictly for interactive segmented controls and navigation pills.
2. **60-30-10 Color Allocation**:
   - **60% Neutral Canvas**: Off-white and muted stone fields (`#ededed`, `#f5f2ee`, `#ffffff`).
   - **30% Structural Surfaces**: Deep ink navy surfaces (`#0b0f1a`, `#0d172a`) providing high-contrast editorial anchors.
   - **10% Intentional Accent**: TrueTier Golden Amber (`#f09e26`) reserved strictly for the brand mark, identified single points of failure, active gauge arcs, and interactive state triggers.
3. **Domain-Native Authenticity**:
   - Every metric (EIC, FDS, Exposure, Latency) maps directly to operational supply chain graph theory.
   - Provenance is always visible: every claim links back to audited contracts, 10-K regulatory filings, or bill-of-lading shipment manifests.

---

## 2. Brand Identity & Motif System

### The TrueTier Brand Mark
The TrueTier logo reflects the central paradox of **The Supplier Illusion**:

```
    [ Tier 1 ]    [ Tier 1 ]    [ Tier 1 ]   (3 Direct Vendors on Paper)
         \            |            /
          \           |           /          (Curving Dependency Streams)
           \          |          /
                    ( ● )                    (1 Hidden Upstream Chokepoint)
```

- **Geometry**: Three upper nodes (representing apparently independent Tier-1 vendors) with organic curved paths that converge into a single, larger golden-amber node at the bottom (representing the hidden common fab, port, or raw-material chokepoint).
- **Colors**:
  - Upper nodes and stem tracks: Deep Navy (`#0d172a`) in light mode; Pure White (`#ffffff`) in dark mode.
  - Convergence Source Node: TrueTier Golden Amber (`#f09e26`) with a crisp outline ring.
- **Logotype**:
  - `"True"`: Set in `Inter` Regular (400 weight) with tight tracking (`-0.03em`).
  - `"Tier"`: Set in `Inter` Bold (700 weight) with tight tracking (`-0.03em`).
  - Tagline: *"See the source behind your suppliers."* (Inter Regular, `#64748b`).

---

## 3. Color Tokens & Palette Specifications

| Token | Hex Value | Semantic Role |
|---|---|---|
| `--color-canvas-outer` | `#ededed` | Page exterior boundary frame |
| `--color-canvas-inner` | `#e5e5e5` | Translucent hero container backdrop |
| `--color-tray-bg` | `#f5f2ee` | Dashboard preview tray background |
| `--color-surface-white` | `#ffffff` | Primary cards, modals, and nav pill background |
| `--color-brand-gold` | `#f09e26` | TrueTier primary accent, active chokepoints, active gauges |
| `--color-brand-gold-hover` | `#df8f1a` | Button and interactive hover state |
| `--color-brand-gold-dark` | `#b45309` | High-contrast text on amber backgrounds (WCAG AA compliant) |
| `--color-brand-gold-light` | `#fef3c7` / `#fffbeb` | Soft badge backgrounds |
| `--color-navy-dark` | `#0b0f1a` | Deep CTA buttons, buyer nodes, high-contrast banners |
| `--color-navy-slate` | `#0d172a` | Logo typography, primary headings |
| `--color-risk-hazard` | `#ef4444` | Disruption shockwave lines, stockout alerts |
| `--color-control-green` | `#10b981` | Control group diversification status, avoided losses |

---

## 4. Typography Hierarchy

TrueTier pairs an engineered, legible sans-serif for numbers and system controls with an expressive display serif for editorial headline storytelling.

```
Display Headline:   Instrument Serif (Italic, 400 weight)
Primary Sans:       Inter (400 Regular, 500 Medium, 600 SemiBold, 700 Bold)
Monospace Telemetry: Inter / font-mono with tabular-nums
```

### Scale & Rules
- **Hero Display Headline**: `clamp(32px, 6.5vw, 68px)` with `lineHeight: 1.05`, `letterSpacing: -0.02em`. Features the distinctive *Instrument Serif* italic span (e.g. *"Shaping [Supply Chains] of tomorrow"*).
- **Section Headings**: `clamp(24px, 4vw, 48px)` with tight line height.
- **Card Titles**: `16px–18px` SemiBold (`Inter`).
- **Body & Captions**: `13px–15px` Regular (`Inter`), measure capped at `65ch` for readability.
- **Numbers & Metrics**: Always set with `tabular-nums` so numbers align vertically without jitter during animations or calculations.

---

## 5. Component Specifications & Layout Architecture

### 5.1 Floating Pill Navbar (`Navbar.tsx`)
- **Container**: Floating pill centered horizontally (`max-w-[760px]`, `rounded-full`, `bg-white/95 backdrop-blur-md`, `border border-neutral-200/90`).
- **Left Zone**: TrueTier brand mark and logotype.
- **Center Zone**: Clean single-line links (`Home` with active gold dot, `Features`, `Sandbox`, `Case Study`) with subtle hover states.
- **Right Zone**:
  - Desktop: Action button `"Deep Graph"` with arrow icon opening the full graph intelligence modal.
  - Mobile: Clean hamburger button opening an accessible touch drawer with 1-tap navigation.

### 5.2 Full-Viewport Hero Section (`App.tsx`)
- **Outer Wrapper**: `min-h-screen bg-[#ededed] p-2 sm:p-4`.
- **Hero Container**: `min-h-[580px] h-[calc(100dvh-16px)] sm:h-[calc(100vh-32px)]`, `rounded-2xl sm:rounded-3xl`, `overflow-hidden`.
- **Bleeding Tray**: The dashboard preview cards bleed off the bottom edge of the hero frame, naturally drawing the eye downward into the Lenis smooth scroll sections.

### 5.3 Reusable 40-Tick Gauge Component (`Gauge.tsx`)
- **Props**: `value: number`, `color?: string` (default `#f09e26`), `showLabels?: boolean`, `min?: string`, `max?: string`.
- **Geometry**: SVG `viewBox="0 0 200 120"`, max-width `260px`.
- **Ticks**: 40 tick marks along a $180^\circ$ semicircle ($\pi \to 2\pi$), centered at `(100, 100)`. Active count = $\text{round}(\frac{\text{value}}{100} \times 40)$. Active ticks use the TrueTier gold accent; inactive ticks use `#d4d4d8`.
- **Value**: Centered percentage text at `(100, 105)`, `fontSize: 22`, `fontWeight: 600`.

### 5.4 Dashboard Preview Tray (`DashboardPreview.tsx`)
- **Card 1 (Hidden Exposure)**: Displays the False Diversification metric (`6,896` nodes mapped, `-3,382 (33%)` independence delta) with a 92% gauge in TrueTier gold and active/direct toggle pills.
- **Card 2 (Scenario & Target Form)**: Interactive inputs for material target selection, disruption scenario period, safety buffer days, and goal caps with working Save, Cancel, and reset actions.
- **Card 3 (Upstream Fab / Resilience)**: Live zero-redundancy indicator (`0 unshared fabs`) with a 68% upstream exposure gauge.

### 5.5 Full-Page Continuous Scenery (`SupplyChainBackdrop.tsx`)
- **Engine**: 60fps HTML5 Canvas 2D engine mounted at the page root, eliminating external videos with butterflies.
- **Elements**: Global geodesic trade lanes, maritime container routes, dynamic wafer packet pulses, and pulsing golden chokepoints.
- **Scroll Parallax**: Intercepts Lenis scroll position to smoothly shift the camera depth and particle velocities.
- **Interactivity**: Gentle mouse deflection when moving across the screen.

### 5.6 Interactive Multi-Tier Convergence Sandbox
- **Visualization**: Interactive SVG diagram rendering three Tier-1 suppliers (Nexa, Orion, Helix) converging into Hsinchu Wafer Works (Fab) and Port of Kaohsiung.
- **Live Disruption Shocks**: Interactive toggles (*Normal Flow*, *Typhoon Kaohsiung*, *HWW Cleanroom Fault*) that trigger pulsing red hazard streams and day-by-day depletion tickers.
- **Telemetry Inspector**: Real-time card updating with upstream exposure, capacity percentage, and shipment evidence when hovering or tapping any node.

### 5.7 Interactive Decoupling Simulator
- **Sliders**: Dual range inputs controlling Domestic Supplier Allocation (0%–60% to Pune Micro) and Safety Buffer Days (5–30 days).
- **Real-Time Recalculation**: Dynamically recalculates the False Diversification Score (FDS) dropping from 68% down to 22%, and calculates avoided P90 losses up to ₹32.4 Crore.

### 5.8 Deep Graph Explorer Modal (`SupplierIllusionExplorer.tsx`)
- Comprehensive scenario dialog with material switcher (Power MCU, Li-ion Cells, Rare-Earth Magnets, Copper Busbars control group).
- Interactive 3-stop **Confidence Lens** (*Verified*, *+Reported*, *All/Inferred*) with real-time recalculation of EIC and FDS.
- Epistemological evidence drawer citing customs bills of lading, geospatial co-location, and 10-K regulatory filings.
- Protected by `data-lenis-prevent` to prevent background page scroll while inspecting.

---

## 6. Motion & Smooth Scroll Dynamics

- **Lenis Smooth Scroll**: Configured with an inertia damping curve (`duration: 1.25s`, easing `t => Math.min(1, 1.001 - Math.pow(2, -10 * t))`).
- **Navbar Smooth Anchoring**: Clicking Home, Features, Sandbox, or Case Study glides the viewport smoothly with tailored negative offsets.
- **Live Telemetry HUD**: Sticky pill in the bottom corner that tracks scroll position and reveals the network tier depth (Tier 1 Direct $\to$ Tier 2 Fab $\to$ Tier 3 Port $\to$ Decoupling).

---

## 7. Responsive & Mobile Architecture

1. **Fluid Typography**: Clamp math (`clamp(28px, 6vw, 68px)`) prevents text clipping on small phones.
2. **Dynamic Viewport Units**: Uses `100dvh` for the hero container to prevent layout shifts caused by mobile browser address bars.
3. **Touch Targets**: All interactive buttons, tabs, dropdowns, and sliders maintain $\ge 44\text{px}$ touch targets.
4. **Adaptive Navigation**: Desktop links collapse into an accessible drawer with high-contrast text and instant action links.
