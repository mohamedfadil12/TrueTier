# TrueTier: Multi-Tier Supplier Independence Intelligence

> Built for **METAVERSE 2.0 Hackathon (29–30 Oct 2026)**  
> **Challenge #10: "The Supplier Illusion"** (Supply Chain Management)  
> *Innovation Focus: "Measuring genuine supply chain independence by examining upstream dependencies, rather than counting the number of direct suppliers."*

---

## 1. The Problem: The Supplier Illusion
A company counts its suppliers and thinks it is safe. **Aurora Motors**, our fictional EV maker in Chennai, buys Power MCU chips from three separate Tier-1 suppliers: Nexa Semi, Orion Micro, and Helix Devices. Procurement reports: *"Diversified (3/3 suppliers)."*

**The planted trap:** All three direct suppliers depend on the exact same Tier-2 semiconductor fabrication plant—**Hsinchu Wafer Works (HWW)** in Taiwan—and ship outward container volume through the **Port of Kaohsiung**. When a super typhoon closes Kaohsiung or a cleanroom contamination shuts HWW, all three suppliers fail simultaneously. The manufacturer had three suppliers on paper, but a single point of failure in reality.

---

## 2. Our Solution: TrueTier
TrueTier builds the full multi-tier supply network, explicitly tracking epistemological confidence for every connection:
- **Verified (Solid Teal):** Audited master purchase contracts and tier-1 vendor agreements ($1.0$ confidence).
- **Reported (Dashed Amber):** Disclosed voluntarily in supplier 10-K filings and ESG reports ($\approx 0.85$ confidence).
- **Inferred (Dotted Violet):** Deduced by multi-signal Noisy-OR analysis over customs bill-of-lading shipment manifests and geospatial facility mapping ($0.30 - 0.75$ confidence).

On top of this graph, TrueTier computes:
1. **Effective Independence Count (EIC):** The true number of independent failure paths upstream.
   $$\text{EIC}(m) = \min\left(N_{\text{nominal}}, \frac{1}{\max_u \text{Exposure}(u, m)}\right)$$
   For Power MCU chips: Three suppliers sharing one fab yield an EIC of **$\approx 1.1$**.
2. **False Diversification Score (FDS):** Quantifies how much the diversification is an illusion:
   $$\text{FDS}(m) = 1 - \frac{\text{EIC}(m)}{N_{\text{nominal}}(m)}$$
   - $0.0 \to$ Genuinely diversified.
   - $> 0.5 \to$ Pure illusion.
3. **Disruption Shock Simulation:** Day-by-day Leontief bottleneck simulation modeling inventory depletion, vehicle assembly stoppage, and Monte Carlo P50/P90 financial exposure.
4. **Remediation Ranked by ROI:** Evaluates autonomous actions (e.g. onboarding domestic suppliers like Pune Micro or expanding safety buffers) with before/after FDS and financial risk reduction.

---

## 3. System Architecture

```
┌────────────────────────────── FRONTEND (Vite + React + TS) ──────────────────────────────┐
│  HeroMetric  │  MaterialCards  │  GraphCanvas (Cytoscape)  │  EvidencePanel               │
│  LensSlider  │  SimPanel + Charts (Recharts)  │  RecoTable  │  ReportButton (print CSS)   │
│                        zustand store  ──  api.ts (typed fetch)                            │
└───────────────────────────────────────────┬───────────────────────────────────────────────┘
                                            │ JSON over HTTP (localhost:8000)
┌───────────────────────────────────────────▼───────────────────────────────────────────────┐
│                               BACKEND (FastAPI + Pydantic v2)                             │
│  /api/graph  /api/analysis  /api/simulate  /api/recommend  /api/scenarios  /api/report    │
│                                                                                           │
│   store.py ── loads data/*.json at startup into an in-memory NetworkX DiGraph            │
│                                                                                           │
│   engine/                                                                                 │
│     graph.py       build graph, apply lens (filter + renormalize shares)                  │
│     exposure.py    availability(), node exposure, EIC, FDS, verdicts                      │
│     simulate.py    day-by-day inventory/production simulation                             │
│     montecarlo.py  sampled edge existence + duration → P50/P90 loss                       │
│     recommend.py   candidate actions → recompute FDS/loss → rank by ROI                   │
│     inference.py   signals → inferred edges (noisy-OR confidence + evidence)              │
│   llm.py       optional Claude API for narratives, deterministic template fallback        │
│   report.py    Jinja2 → print-ready HTML                                                  │
└───────────────────────────────────────────┬───────────────────────────────────────────────┘
                                            │ read at startup
┌───────────────────────────────────────────▼───────────────────────────────────────────────┐
│ DATA (synthetic, deterministic seed)   data/graph.json  materials.json  scenarios.json    │
│                                        candidates.json  shipments.csv  disclosures.json   │
│ scripts/generate_data.py regenerates everything with `.\tasks.ps1 data`                   │
└───────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Quick Start & Execution

Run from `D:\METAVERSE` in Windows PowerShell (or use `powershell -ExecutionPolicy Bypass -File .\tasks.ps1 <command>`):

```powershell
# 1. Setup Python virtual environment and frontend node packages
.\tasks.ps1 setup

# 2. Generate deterministic synthetic dataset
.\tasks.ps1 data

# 3. Run all golden test suites (protecting the demo narrative)
.\tasks.ps1 test

# 4. Launch backend and frontend demo in one command
.\tasks.ps1 demo
```

The application will be accessible at:
- **Frontend Dashboard:** [http://localhost:5173](http://localhost:5173)
- **Backend API Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **Executive Board Report:** [http://localhost:8000/api/report](http://localhost:8000/api/report)

---

## 5. Golden Tests (Integrity Guardrails)

All 9 golden test cases in `backend/tests/test_golden.py` enforce the official challenge criteria:
1. `test_mcu_eic_under_verified`: MCU EIC under verified $\ge 2.5$ (looks safe).
2. `test_mcu_eic_under_all`: MCU EIC under full intelligence $\le 1.5$ (illusion revealed).
3. `test_mcu_fds_under_all`: MCU FDS $> 0.5$ $\to$ verdict `illusion`.
4. `test_copper_control_fds_under_all`: Copper control FDS $< 0.2$ $\to$ verdict `diversified` (proves TrueTier does not cry wolf).
5. `test_disrupt_port_kaohsiung`: Disruption of Kaohsiung port collapses MCU availability below $0.20$ while Copper remains $> 0.90$.
6. `test_shares_sum_to_one`: Supply shares strictly sum to $1.0 \pm 10^{-5}$ across all lenses.
7. `test_simulation_determinism`: Identical seeds and inputs produce bit-identical simulation trajectories.
8. `test_monte_carlo_ordering`: Enforces $\text{Loss}_{\text{P90}} \ge \text{Loss}_{\text{P50}}$.
9. `test_recommendations_top_action`: Top decoupling action strictly lowers FDS and delivers positive ROI.

---

## 6. Offline-First & Privacy Guarantee
TrueTier is designed to run 100% locally with zero external internet connectivity. It uses in-memory graph traversal with deterministic mathematical formulas. Optional natural language briefings utilize deterministic template fallbacks when no Anthropic API key is provided.
