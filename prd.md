# TrueTier — Product Requirements Document (PRD)

> **Document Version:** 2.0.0  
> **Product Title:** TrueTier (Supplier Independence Intelligence)  
> **Brand Slogan:** *"See the source behind your suppliers."*  
> **Category:** Supply Chain Management / Enterprise Resilience

---

## 1. Executive Summary & Problem Statement

### 1.1 The Core Problem: The Supplier Illusion
A modern manufacturing enterprise counts its suppliers and assumes it is diversified. An automotive manufacturer purchases Power Microcontroller (MCU) chips from three separate Tier-1 vendors: *Nexa Semi*, *Orion Micro*, and *Helix Devices*. Corporate procurement records report: **"Diversified (3 direct suppliers)."**

**The Planted Chokepoint Trap:**
All three direct suppliers depend on the exact same Tier-2 semiconductor fabrication plant—**Hsinchu Wafer Works (HWW)** in Taiwan—for 40nm automotive silicon, and route 94% of their container volume through the **Port of Kaohsiung**. 

When a category-5 typhoon strikes Kaohsiung or cleanroom contamination halts HWW, all three suppliers fail simultaneously. The manufacturer had three suppliers on paper, but a single point of failure in reality.

### 1.2 The TrueTier Solution
TrueTier is a multi-tier supplier independence intelligence platform that:
1. Synthesizes procurement purchase orders, customs bills of lading, and regulatory 10-K filings into a deep multi-tier dependency graph (Tiers 1, 2, and 3).
2. Establishes a **3-Stop Confidence Lens** (*Verified*, *Reported*, *Inferred*) to explicitly distinguish audited contractual data from probabilistic inferences with attached evidence.
3. Quantifies diversification through two proprietary metrics:
   - **Effective Independence Count (EIC)**
   - **False Diversification Score (FDS)**
4. Simulates physical disruptions (port closures, fab contaminations, export restrictions) through a day-by-day Leontief bottleneck production model.
5. Prescribes autonomous decoupling recommendations ranked by capital allocation ROI.

---

## 2. Target User Personas & Use Cases

| Persona | Role | Primary Objective | TrueTier Value |
|---|---|---|---|
| **Chief Procurement Officer (CPO)** | Executive | Ensure vendor diversification and eliminate blind single-source dependencies | Instant visibility into True vs Nominal supplier counts |
| **VP of Supply Chain Operations** | Management | Prevent factory stoppages caused by hidden upstream bottlenecks | Disruption simulation with exact stockout day predictions |
| **Supply Chain Risk Analyst** | Tactical | Audit tier-2 and tier-3 bill-of-lading records and geographic chokepoints | Epistemological evidence citations with verifiable provenance |

---

## 3. Mathematical Foundations & Metrics

### 3.1 3-Stop Epistemological Confidence Lens
Every edge in the TrueTier network graph possesses an epistemological confidence rating:
- **Verified ($1.0$ confidence):** Confirmed via audited master purchase agreements and direct ERP integrations. Represented by solid lines.
- **Reported ($\approx 0.85$ confidence):** Extracted from voluntary supplier SEC 10-K filings and ESG reports. Represented by dashed lines.
- **Inferred ($0.30 - 0.75$ confidence):** Deduced by multi-signal Noisy-OR analysis over customs bill-of-lading shipment manifests and geospatial proximity:
  $$\text{Confidence}_{\text{inferred}} = 1 - \prod_{i=1}^k (1 - w_i)$$
  Represented by dotted lines with a question mark (`?`) indicator.

### 3.2 Effective Independence Count (EIC)
Measures the true number of independent failure paths supplying a critical material:
$$\text{EIC}(m) = \min\left(N_{\text{nominal}}(m), \frac{1}{\max_u \text{Exposure}(u, m)}\right)$$
- *Aurora Motors MCU Case*: Nominal suppliers = 3. Because Hsinchu Wafer Works has an exposure of $\approx 92.4\%$, $\text{EIC} \approx \frac{1}{0.924} \approx 1.1$.

### 3.3 False Diversification Score (FDS)
Quantifies the degree to which a company's diversification is an illusion:
$$\text{FDS}(m) = 1 - \frac{\text{EIC}(m)}{N_{\text{nominal}}(m)}$$
- $\text{FDS} < 0.20 \implies$ **Genuinely Diversified** (e.g. Copper Busbars control group).
- $0.20 \le \text{FDS} \le 0.50 \implies$ **Partial Concentration**.
- $\text{FDS} > 0.50 \implies$ **Illusion Revealed** (e.g. Power MCU chips at $68\%$).

### 3.4 Day-by-Day Disruption Simulation
Models daily inventory depletion and factory assembly output:
$$I_{m, t} = \max\left(0, I_{m, t-1} + \text{Inflow}_{m, t} - P_t \times \text{Demand}_m\right)$$
$$\text{Production Rate } P_t = \min_m \left(\min\left(1, \frac{I_{m, t-1} + \text{Inflow}_{m, t}}{\text{Demand}_m}\right)\right)$$
When buffer inventory hits zero and incoming flow is zero, vehicle assembly halts ($P_t = 0$), accumulating daily financial losses ($₹\text{ Cr/day}$).

---

## 4. Frontend Functional Requirements

### FR-1: Full-Viewport Executive Hero Section
- **Description**: Full-viewport hero container with dynamic ambient scenery, floating pill navbar, clamp-scaled typography with Instrument Serif italic emphasis, and bottom-bleeding dashboard preview cards.
- **Requirements**:
  - Exact outer padding (`p-2 sm:p-4`) and inner container clipping (`min-h-[580px] h-[calc(100dvh-16px)] sm:h-[calc(100vh-32px)]`).
  - TrueTier brand mark (3 converging nodes into 1 amber chokepoint) and official tagline.
  - Primary CTA button opening the Deep Graph Explorer.

### FR-2: Floating Pill Navigation (`Navbar.tsx`)
- **Description**: Centered, balanced navigation pill.
- **Requirements**:
  - TrueTier logo left-aligned with direct scroll-to-top handler.
  - Centered links (`Home`, `Features`, `Sandbox`, `Case Study`) with smooth Lenis anchor gliding.
  - Right-side `"Deep Graph"` action button with arrow icon.
  - Fully responsive mobile drawer toggled via clean hamburger button.

### FR-3: Full-Page Continuous Backdrop Scenery (`SupplyChainBackdrop.tsx`)
- **Description**: 60fps HTML5 Canvas 2D engine running across the entire page, replacing external videos.
- **Requirements**:
  - Renders global maritime trade corridors, semiconductor fab chokepoints, and moving data packets.
  - Golden chokepoint pulse rings around Taiwan fab and port nodes.
  - Parallax depth shifting linked to Lenis scroll velocity and position.
  - Subtle interactive mouse deflection.

### FR-4: Dashboard Preview Bleeding Tray (`DashboardPreview.tsx`)
- **Description**: 3-card grid tray sitting inside the hero container and bleeding off the lower fold.
- **Cards**:
  - **Card 1**: Hidden Exposure ($6,896$ nodes mapped, $92\%$ False Diversification gauge in TrueTier gold, segmented view toggle).
  - **Card 2**: Scenario & Target Configuration Form (Material target selector, disruption period selector, buffer days input, and working Save/Cancel/Reset buttons).
  - **Card 3**: Upstream Fab Resilience ($0$ unshared fabs, $68\%$ exposure gauge).

### FR-5: Interactive Convergence Sandbox Diagram
- **Description**: Dedicated on-page SVG visualization directly reflecting the TrueTier 3-to-1 logo motif.
- **Requirements**:
  - Displays 3 direct suppliers (Nexa, Orion, Helix) flowing into HWW Fab and Kaohsiung Port.
  - Interactive shock triggers (*Normal Flow*, *Typhoon Kaohsiung*, *HWW Cleanroom Fault*).
  - Real-time hazard pulse animations and day-by-day stockout alerts on disruption.
  - Interactive hover/tap node telemetry inspector displaying exposure percentage and shipment records.

### FR-6: Interactive Decoupling ROI Simulator
- **Description**: Real-time slider simulator modeling remediation actions.
- **Requirements**:
  - Dual sliders: Domestic Allocation to Pune Micro ($0\%–60\%$) and Safety Buffer Inventory ($5–30\text{ days}$).
  - Live recalculation of False Diversification Score (dropping from $68\%$ to $22\%$).
  - Live calculation of P90 loss avoided (up to $₹32.4\text{ Cr}$) and capital allocation ROI ($4.2\times$).

### FR-7: Deep Graph & Evidence Explorer Modal (`SupplierIllusionExplorer.tsx`)
- **Description**: Full-screen modal inspector.
- **Requirements**:
  - Material switcher: Power MCU, Li-ion Cells, Rare-Earth Magnets, Copper Busbars (Control).
  - 3-Stop Confidence Lens (*Verified*, *+Reported*, *All/Inferred*).
  - Detailed evidence drawer displaying customs container manifests, 2.4km geospatial co-location, and SEC filings.
  - Modal isolated via `data-lenis-prevent` to prevent background scroll jitter.

---

## 5. Non-Functional Requirements & Performance Targets

1. **Rendering Performance**: 60fps steady canvas animation; interactions respond in $\le 100\text{ms}$.
2. **Offline-First & Privacy Guarantee**: 100% client-side execution; runs with zero external internet dependencies or API latency bottlenecks.
3. **Accessibility**: WCAG AA compliance (contrast ratio $\ge 4.5:1$ for normal text, $\ge 3:1$ for large text/icons; visible focus rings `focus-visible:ring-[#f09e26]`).
4. **Responsive Coverage**: Flawless layout across screen sizes from 320px mobile viewports to 4K desktop displays.
5. **No AI Slop**: Strict zero-pill metadata discipline, curated typography pairings, single-elevation card depth, and domain-native language.
