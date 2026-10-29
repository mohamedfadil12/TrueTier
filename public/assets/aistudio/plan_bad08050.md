# TrueTier: Architecture and Execution Plan

> **⏱ THIS IS A 24-HOUR HACKATHON.** METAVERSE 2.0, 29–30 Oct 2026, MSAJCEA Chennai. Every decision in this document favours a *working, beautiful, explainable demo* over completeness. If something is not on the demo path, it is optional. Feature freeze is at **T+20h**.

> **📁 Project root: `D:\METAVERSE` (Windows / PowerShell).** Wherever this plan says `make X`, run `.\tasks.ps1 X`.

Working name: **TrueTier** (supplier independence intelligence).
Challenge: **#10, The Supplier Illusion** (Supply Chain Management).

---

## 0. Decision context (why this challenge)

Analysis of the 10 official problem statements (`METAVERSE_2.0_PS.pdf`) led to picking #10:

- **Clear "aha" moment:** three suppliers that look independent all depend on one upstream port or fab.
- **Visual and designable:** network graph, disruption animation, risk dashboard. Most teams will ship plain dashboards, so strong UI and storytelling stand out.
- **Feasible in 24h:** synthetic data, no hardware, no heavy model training.
- **Real technical depth:** graph algorithms, exposure/concentration metrics, Monte Carlo disruption simulation, confidence-aware edges.
- **Likely less crowded** than the AI/ML, IoT, and energy challenges.

Runner-ups if the team changes its mind: #7 Invisible Cargo, #3 Data Time Machine.

**Official innovation focus to echo in the pitch:** *"Measuring genuine supply chain independence by examining upstream dependencies, rather than counting the number of direct suppliers."*

---

## 1. Product in one paragraph

TrueTier ingests procurement records, supplier disclosures, and shipment data, builds a **multi-tier supplier network**, and exposes **hidden common dependencies**. Every link is tagged **verified / reported / inferred**, with evidence. It computes a **False Diversification Score (FDS)** and an **Effective Independence Count (EIC)** per critical material, simulates disruptions (port closure, fab shutdown, regional restriction) against inventory and production, and recommends **alternative sourcing, buffers, and diversification** ranked by ROI, always showing the evidence behind each claim.

### The killer demo moment (build everything around this)

> **Confidence Lens toggle.** On *verified-only* links, Aurora Motors looks diversified (3 chip suppliers, EIC ≈ 3.0). Slide the lens to *+reported +inferred* and the graph reveals all three funnel into one wafer fab and one port. EIC collapses to ≈ 1.1. Click "Close Port of Kaohsiung" and watch the red wave propagate and production stop on day 9.

---

## 2. Scope tiers (cut lines)

| Tier | Meaning | Items |
|---|---|---|
| **P0 (must)** | Demo cannot happen without it | Synthetic dataset; graph model; exposure/EIC/FDS engine; confidence lens; graph UI; disruption simulation with inventory time-series; evidence panel; hero metric |
| **P1 (should)** | Makes us win | Monte Carlo (P50/P90); recommendations engine with before/after FDS; inferred-edge generator with evidence; printable report; LLM-written narratives (with deterministic fallback); animated propagation wave |
| **P2 (nice)** | Only if ahead of schedule | CSV upload of own supply chain; min-cut/SPOF view; map view with geo lines; scenario compare side-by-side; dark/light theme toggle |

**Rule:** at **T+12h**, if P0 is not end-to-end working, drop all P1 except recommendations and report.

### Traceability to the official "Expected Solution"

| Official requirement | TrueTier module | Tier |
|---|---|---|
| Multi-tier network of suppliers, sub-suppliers, facilities, materials, transport | `graph.json` + `/api/graph` + GraphCanvas | P0 |
| Identify shared upstream suppliers / single points of failure | `engine/exposure.py` | P0 |
| Supplier concentration and disruption exposure per critical material | EIC, FDS, exposure per node | P0 |
| Simulate port closures, factory shutdowns, shortages, regional disruptions | `engine/simulate.py` + presets | P0 |
| Estimate impact on inventory, production schedule, procurement cost | time-series sim + loss model | P0 / P1 |
| Recommend alternative sourcing, buffers, diversification | `engine/recommend.py` | P1 |
| Visualize dependency paths and explain evidence | EvidencePanel + path highlight | P0 |
| Distinguish verified / reported / inferred | `confidence_class` on every edge + Confidence Lens | P0 |

---

## 3. System architecture

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
│ scripts/generate_data.py regenerates everything with `.\tasks.ps1 data`                          │
└───────────────────────────────────────────────────────────────────────────────────────────┘
```

**Design principles:** single process, no database, no auth, no queues. All data in memory. Deterministic seed so the demo behaves identically every time. Offline-first (the demo must run with no internet; LLM is an optional garnish).

---

## 4. Tech stack

| Layer | Choice | Why |
|---|---|---|
| Backend | Python 3.11, FastAPI, Pydantic v2, NetworkX, NumPy, pandas | Fast to write, strong graph tooling |
| Fuzzy/inference | `rapidfuzz` | Name matching for inferred links |
| Frontend | Vite, React 18, TypeScript, Tailwind CSS | Fast iteration, easy theming |
| Graph viz | Cytoscape.js (+ `cytoscape-fcose` optional) | Rich styling per edge class, animation, good with ~60 nodes |
| Charts | Recharts | Quick line/area charts |
| State | zustand | Minimal boilerplate |
| Report | Jinja2 → HTML → browser print-to-PDF | Zero PDF dependencies |
| LLM (optional) | Anthropic API, model from env `ANTHROPIC_MODEL` (default `claude-sonnet-5-5`) | Natural-language explanations; must have fallback |
| Fallback UI | Streamlit | Only if frontend is hopelessly behind at T+12h |

---

## 5. Repository structure

```
truetier/
├─ plan.md                 # this file
├─ instructions.md         # instructions for coding agents
├─ tasks.ps1               # .\tasks.ps1 setup | data | api | web | demo | test   (Windows; replaces make)
├─ scaffold.ps1            # one-time folder scaffolder
├─ README.md
├─ docs/
│  ├─ STATUS.md            # live handoff log (agents + humans)
│  └─ pitch.md             # demo script + slide text
├─ contracts/
│  ├─ types.ts             # TS types mirroring API (source of truth for frontend)
│  └─ models.py            # Pydantic models (source of truth for backend)
├─ data/                   # generated; committed so demo works without regenerating
├─ scripts/
│  └─ generate_data.py
├─ backend/
│  ├─ requirements.txt
│  ├─ app/
│  │  ├─ main.py  store.py  llm.py  report.py
│  │  └─ engine/ graph.py exposure.py simulate.py montecarlo.py recommend.py inference.py
│  └─ tests/test_golden.py
└─ frontend/
   ├─ package.json  vite.config.ts  tailwind.config.ts
   └─ src/
      ├─ main.tsx  App.tsx  api.ts  types.ts
      ├─ state/store.ts
      ├─ styles/tokens.css
      └─ components/ HeroMetric MaterialCards LensSlider GraphCanvas EvidencePanel
                     SimPanel Charts RecoTable ReportButton
```

**Ownership (avoids merge conflicts):** one human or agent per top-level directory. `contracts/` is frozen at T+1h; changes require a note in `docs/STATUS.md`.

---

## 6. Data model

### 6.1 Entities

```ts
// contracts/types.ts  (mirror in contracts/models.py)
type NodeType = "buyer" | "supplier" | "facility" | "port" | "region" | "raw_source";
type ConfClass = "verified" | "reported" | "inferred";
type EdgeKind = "supplies" | "ships_via" | "located_in";

interface Node {
  id: string; label: string; type: NodeType;
  tier: number;               // 0 = buyer, 1 = direct supplier, 2, 3 = upstream
  country: string; region?: string; lat?: number; lng?: number;
  recovery_days?: number;     // time to restore after disruption ends
  meta?: Record<string, unknown>;
}

interface Evidence {
  type: "contract" | "disclosure" | "shipment_record" | "geo_proximity" | "text_extraction";
  source: string;             // document / dataset name
  snippet: string;            // human-readable proof
  weight: number;             // 0..1 contribution to confidence
}

interface Edge {
  id: string;
  source: string; target: string;
  kind: EdgeKind;
  // "supplies":  source (upstream) -> target (downstream); flow direction toward the buyer
  // "ships_via": source (supplier/facility) -> target (port)
  // "located_in": source (facility) -> target (region)
  material?: string;          // required for "supplies"
  share: number;              // fraction of target's input of this material (supplies) or of volume (ships_via)
  confidence_class: ConfClass;
  confidence: number;         // 0..1 (verified=1.0, reported≈0.85, inferred=0.3–0.7)
  evidence: Evidence[];
}

interface Material {
  id: string; name: string; unit: string;
  daily_demand: number;       // units/day consumed at nominal production
  inventory_days: number;     // buyer's current buffer
  unit_cost: number;          // currency units
  criticality: number;        // 0..1 weight for overall FDS
}

interface BuyerProfile { name: string; daily_output_value: number; currency: string; }

interface Disruption { node_id: string; severity: number /*0..1*/; start_day: number; duration_days: number; }
interface Scenario { id: string; title: string; story: string; disruptions: Disruption[]; }

interface CandidateSupplier {
  id: string; label: string; material: string; country: string;
  onboarding_cost: number; price_premium_pct: number; achievable_share: number;
  upstream_edges: Edge[];     // its own (independent) upstream chain
  nodes: Node[];
}
```

### 6.2 Synthetic scenario: "Aurora Motors" (fictional EV maker, Chennai plant)

Use **fictional company names** (avoid real brands). Target ~40–55 nodes.

| Material | Tier-1 suppliers | Hidden truth (planted trap) | Lens behaviour |
|---|---|---|---|
| **Power MCU chips** | Nexa Semi, Orion Micro, Helix Devices | All three depend on tier-2 **Hsinchu Wafer Works** (HWW) and ship via **Port of Kaohsiung**. Nexa→HWW *verified*, Orion→HWW *reported*, Helix→HWW *inferred* (shared address + shipment records) | Verified-only EIC ≈ 3.0 → full EIC ≈ 1.1 |
| **Li-ion cells** | VoltaCell, Ampere Dynamics | Both buy cathode material from tier-2 **Sichuan Cathode Materials**, which relies on a single tier-3 lithium refinery | EIC ≈ 1.3 |
| **Rare-earth magnets** | Magnetix, Polaris Magnetics | Both depend on rare-earth processing in a single region node (**Inner Mongolia**), a *regional* dependency | EIC ≈ 1.2 |
| **Copper busbars** *(control)* | Three suppliers with genuinely separate upstream chains and separate ports | None | EIC ≈ nominal; verdict "diversified". **Proves the tool does not cry wolf.** |

Provide `candidates.json` with 3–4 alternatives (e.g., an India-based MCU supplier with its own fab and Chennai port routing) whose onboarding makes FDS visibly improve.

### 6.3 Scenario presets

1. **Kaohsiung typhoon:** Port of Kaohsiung, severity 1.0, 14 days
2. **Hsinchu fab shutdown:** HWW, severity 1.0, 30 days
3. **Rare-earth export restriction:** Inner Mongolia region, severity 0.8, 60 days
4. **Compound shock:** Kaohsiung 14d + cathode refinery 21d (shows non-additive pain)

### 6.4 Generator rules (`scripts/generate_data.py`)

- `random.Random(42)` everywhere; output must be byte-stable.
- Generates `shipments.csv` (supplier, port, date, qty) and `disclosures.json` (short text snippets, e.g., "Our wafers are sourced from facilities in Hsinchu Science Park").
- Runs the **inference module** over shipments + disclosures to produce the *inferred* edges, so the demo's inferred links are produced by real code, not hand-typed.

---

## 7. Core algorithms

All formulas below are the spec. Keep implementations small and unit-tested against the golden cases in §7.7.

### 7.1 Lens (what the buyer "believes")

`lens ∈ {verified, reported, all}`:

- `verified` → keep only `verified` edges
- `reported` → `verified + reported`
- `all` → everything

After filtering, **renormalize `share` among the remaining inbound `supplies` edges of each (node, material)** so shares still sum to 1. A node left with no visible inbound supply edges is treated as an **independent leaf** (availability 1, unless disrupted). This is precisely what makes a supplier *look* independent under the verified lens.

### 7.2 Availability

Supply edges form a DAG toward the buyer. For a material `m` and a disruption map `D: node → severity` (0..1):

```
avail(v):
  if v in D: base = 1 - D[v]  (severity 1 → 0)  else base = 1   # for infrastructure leaves
  inputs(v)  = Σ over visible supplies-edges e (u→v, material m): share(e) * avail(u)
               (if none: 1.0, a leaf)
  logistics(v) = Σ over ships_via edges (v→p): share * avail(p)   (1.0 if none)
  region(v)    = avail(region node of v)                          (1.0 if none)
  avail(v)   = base_for_v * inputs(v) * logistics(v) * region(v), clipped to [0, 1]
  # for port/region/raw_source nodes: avail = 1 - D.get(node, 0)
```

Memoize per call. `A_buyer(m | D) = avail(buyer)` restricted to material `m`.

### 7.3 Node exposure

For every upstream node `u` of material `m` (all ancestors via supplies, ships_via, located_in):

```
exposure(u, m) = 1 - A_buyer(m | D={u: 1.0})
```

(Exactly "what fraction of this material's supply disappears if `u` fails". No double counting. ≤ ~60 nodes, so brute force is instant.)

### 7.4 Effective Independence Count and False Diversification Score

```
nominal(m) = number of tier-1 suppliers of m (visible under the lens? NO: use all tier-1 suppliers, since the buyer knows who they buy from)
max_exp(m) = max over upstream nodes u of exposure(u, m)          # includes tier-1 suppliers themselves
EIC(m)     = min(nominal, 1 / max_exp)                            # "how many truly independent suppliers do I effectively have?"
FDS(m)     = 1 - EIC(m) / nominal(m)                              # 0 = truly diversified, →1 = pure illusion
gap(m)     = nominal - EIC
verdict    = "diversified" if FDS < 0.2 else "partial" if FDS < 0.5 else "illusion"
overall_FDS = Σ criticality(m) * FDS(m) / Σ criticality(m)
```

If `nominal(m) == 1`, report FDS = 0 and flag **"known single-source"** separately (it's not a hidden problem).

Also return for each material `top_shared`: the nodes with the highest exposure that are shared by ≥ 2 tier-1 suppliers, with `supplier_ids` and **path examples** (list of node-id paths from each supplier to the shared node) for highlighting.

### 7.5 Disruption simulation (day by day)

Inputs: `disruptions[]`, `horizon_days` (default 90), `lens`.
Each disrupted node's effective end = `start + duration + recovery_days(node)`.

```
inv[m] = materials[m].inventory_days * daily_demand[m]
for t in 0..horizon-1:
  D_t = {d.node: d.severity for d in disruptions if d.start <= t < d.end_with_recovery}
  f[m] = A_buyer(m | D_t)                       # cache by frozenset(D_t.items())
  inflow[m] = f[m] * daily_demand[m]
  p_t = min over m of min(1, (inv[m] + inflow[m]) / daily_demand[m])    # production rate (Leontief: weakest material gates output)
  inv[m] = max(0, inv[m] + inflow[m] - p_t * daily_demand[m])
  loss_t = (1 - p_t) * buyer.daily_output_value
outputs: supply_fraction series, inventory series per m, production_rate series,
         stockout_day[m] (first day inv hits ~0 with inflow < demand), total_loss = Σ loss_t,
         affected_nodes with wave_index (BFS distance from disrupted node, for animation)
```

### 7.6 Monte Carlo (P1)

N = 500–1000 runs:

- Each edge exists with probability = `confidence` (verified 1.0, reported ≈0.85, inferred = its score). This models **uncertainty in our own knowledge**.
- Disruption duration ~ lognormal with mean = scenario duration.
- Output: `loss_p50`, `loss_p90`, `prob_stockout` per material, `prob_production_halt`.
- Cache availability by `(frozenset(edges_sampled_signature), frozenset(D))` only if it is too slow; otherwise keep it simple. Target < 3 s per scenario.

### 7.7 Recommendations (P1)

Candidate actions:

- `ADD_SUPPLIER(candidate, share)`: splice candidate nodes/edges into a *copy* of the graph, shift shares from existing suppliers, recompute FDS (lens=all) and loss P90 for the top-risk scenario.
- `BUFFER(material, +days)`: loss recomputed with larger `inventory_days`; cost = `holding_cost_per_unit_day * extra_units`.

```
benefit = loss_p90_before - loss_p90_after
cost    = onboarding_cost + price_premium_pct * unit_cost * annual_volume_share   |   holding cost
roi     = benefit / cost
rank by roi; return top 5 with fds_before/after and a plain-language explanation citing evidence
```

### 7.8 Inferred-edge generator (P1; P0 uses its pre-computed output)

Signals per `(supplier, candidate_upstream_node)` pair:

| Signal | Weight (starting values) |
|---|---|
| Same port appears in ≥ 60% of shipment records | 0.35 |
| Geocode within 3 km of the upstream facility | 0.30 |
| Disclosure text mentions upstream facility/region (fuzzy ≥ 85) | 0.40 |
| LLM text extraction (optional) agrees | 0.25 |

`confidence = 1 - Π(1 - weight_i)` (noisy-OR). Keep edges with `confidence ≥ 0.3` as `inferred`, with the evidence list attached. Clamp inferred confidence to ≤ 0.8 so nothing machine-inferred ever looks "verified".

---

## 8. API contract

Base: `http://localhost:8000/api`. All responses JSON unless noted. CORS open for `localhost:5173`.

| Method | Path | Purpose |
|---|---|---|
| GET | `/graph?lens=verified\|reported\|all` | Nodes, edges (filtered by lens), materials, buyer profile |
| GET | `/analysis?lens=...` | EIC, FDS, verdict, top shared nodes + paths per material; `overall_fds` |
| GET | `/scenarios` | Preset scenarios |
| POST | `/simulate` | Run disruption simulation (+ optional Monte Carlo) |
| POST | `/recommend` | Ranked actions for a scenario |
| POST | `/inference/scan` | *(P1)* Re-run inference, return candidate inferred edges |
| GET | `/report?scenario_id=...&lens=all` | Print-ready HTML (text/html) |
| GET | `/health` | `{ "ok": true }` |

### Key shapes

```ts
// GET /analysis
{
  lens: "verified"|"reported"|"all",
  overall_fds: number,
  materials: [{
    material_id: string, name: string,
    nominal_suppliers: number, eic: number, fds: number, gap: number,
    verdict: "diversified"|"partial"|"illusion",
    single_source: boolean,
    top_shared: [{ node_id: string, exposure: number, supplier_ids: string[], paths: string[][] }],
    spof_nodes: string[]                       // exposure >= 0.6
  }]
}

// POST /simulate
req:  { scenario_id?: string, disruptions?: Disruption[], horizon_days?: number /*90*/,
        monte_carlo_runs?: number /*0 = off*/, lens?: "all" }
resp: {
  affected_nodes: [{ node_id: string, availability: number, wave_index: number }],
  materials: [{ material_id: string, min_supply_fraction: number, stockout_day: number|null,
                inventory_series: number[], supply_series: number[] }],
  production_rate_series: number[],
  total_loss: number, first_halt_day: number|null,
  monte_carlo?: { loss_p50: number, loss_p90: number, prob_stockout: Record<string, number>, prob_halt: number },
  narrative: string                            // LLM or template
}

// POST /recommend
req:  { scenario_id: string, budget?: number }
resp: { actions: [{ id: string, type: "ADD_SUPPLIER"|"BUFFER", title: string, cost: number,
                    fds_before: number, fds_after: number,
                    loss_p90_before: number, loss_p90_after: number, roi: number,
                    explanation: string, evidence: Evidence[] }] }
```

Errors: `{ "error": string }` with a proper HTTP status. The frontend must handle loading and error states on every call.

---

## 9. Frontend design

### 9.1 Layout (single page, no router)

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│ TrueTier        Aurora Motors            [ Overall FDS: 0.68  ● ILLUSION ]  [Report] │
├───────────────┬──────────────────────────────────────────────┬───────────────────────┤
│ Material      │                                              │ EVIDENCE PANEL        │
│ cards (4)     │            GRAPH CANVAS                      │ node/edge details,    │
│  MCU   0.73 ▲ │   tier3 → tier2 → tier1 → buyer              │ confidence badge,     │
│  Cells 0.58 ▲ │   shared nodes pulse red                     │ evidence snippets,    │
│  Magn. 0.62 ▲ │                                              │ "why this matters"    │
│  Copper 0.04 ✓│  [ Confidence Lens:  Verified ─●─ +Rep ─ All ]│                       │
├───────────────┴──────────────────────────────────────────────┴───────────────────────┤
│ SIMULATE:  [Kaohsiung typhoon] [Fab shutdown] [Rare-earth ban] [Compound]  or click a│
│ node → "Disrupt"     │ Charts: inventory by material │ production rate │ cumulative   │
│                      │ loss │ P50/P90 band │ Recommendations table (ROI, FDS Δ)      │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

### 9.2 Visual language (design-led, this is where we beat the field)

- **Mood:** calm "mission control" meets editorial. Dark ink background (`#080A0D`), generous spacing, a single display typeface for headings plus a monospace for numbers and IDs.
- **Edge encoding (never rely on color alone):**
  - **verified:** solid line, teal
  - **reported:** dashed line, amber
  - **inferred:** dotted line, violet, with a small "?" glyph on the edge label
- **Risk encoding:** nodes shared by ≥ 2 tier-1 suppliers get a soft red pulsing halo; size ∝ exposure.
- **Layout:** preset left→right by tier (tier 3 → buyer) with vertical grouping by material. Avoid force-directed chaos on stage.
- **Lens transition:** animate edges fading in/out and the hero metric counting from the old FDS to the new FDS (this is the "wow").
- **Propagation animation:** BFS waves by `wave_index`, 250 ms per wave, nodes turn red/amber by availability.
- **Typography for the room:** body ≥ 15px, chart labels ≥ 12px. The judges are not sitting at your desk.
- **Empty/loading/error:** skeletons, never spinners alone.

### 9.3 Components and responsibilities

| Component | Responsibility |
|---|---|
| `HeroMetric` | Animated overall FDS + verdict chip |
| `MaterialCards` | Per-material EIC/FDS, verdict, "Nominal 3 → Effective 1.1" bar |
| `LensSlider` | 3-stop slider, drives `lens` in store → refetch graph + analysis |
| `GraphCanvas` | Cytoscape render, tier layout, edge styles, click → select, highlight paths, run propagation animation |
| `EvidencePanel` | Selected node/edge: type, confidence badge, evidence list, why-it-matters text |
| `SimPanel` | Scenario preset buttons, custom disruption (selected node + severity + duration), Monte Carlo toggle |
| `Charts` | Inventory curves (with stockout markers), production rate, cumulative loss, P50/P90 band |
| `RecoTable` | Ranked actions, before→after FDS, ROI, "apply" preview that updates the graph overlay |
| `ReportButton` | Opens `/api/report` in new tab (print stylesheet) |

---

## 10. LLM layer (optional garnish, must not be on the critical path)

Uses: (1) 2–3 sentence **narrative** of a simulation result; (2) **explanation text** for each recommendation; (3) *(P2)* extracting supplier mentions from disclosure text.

Rules:

- `llm.py` exposes `narrate(simulation_summary) -> str` and `explain(action) -> str`.
- **Hard timeout 8 s, one retry max, then fall back** to a deterministic f-string template. The UI must look identical either way.
- The prompt receives **only computed numbers and evidence**, and is instructed not to invent suppliers, numbers, or causes. Cache by input hash.
- API key from env `ANTHROPIC_API_KEY`; never commit it. If missing, silently use templates.

---

## 11. 24-hour execution timeline

`T+0` = kickoff. Assign roles (with 2 people, merge A+C and B+D).

| Role | Owns |
|---|---|
| **A. Engine lead** | `backend/app/engine/*`, golden tests |
| **B. Frontend lead** | `frontend/*` graph + charts |
| **C. Data and API** | `scripts/`, `data/`, `main.py`, `llm.py`, `report.py` |
| **D. Design / pitch / QA** | `styles/tokens.css`, visual polish, `docs/pitch.md`, demo rehearsal, bug triage |

| Time | Goal | Exit criteria |
|---|---|---|
| **T+0 → 1** | Kickoff: repo, tools, contracts frozen, split tasks, start agents | `contracts/` committed; `.\tasks.ps1 setup` works on every laptop |
| **T+1 → 4** | **Vertical slice with mocks.** Data generator v1; API serves static `graph.json`; frontend renders the graph with edge styles | Graph visible in browser from real backend |
| **T+4 → 8** | Engine v1: lens, availability, exposure, EIC/FDS. Frontend: MaterialCards, HeroMetric, LensSlider wired to `/analysis` | Lens toggle changes FDS live; golden tests green |
| **T+8 → 12** | Simulation + charts + propagation animation + EvidencePanel. **Milestone: P0 end-to-end demo path works.** | Run the 3-minute script once, ugly but complete |
| **T+12 → 14** | **Sleep shift 1** (half the team, 90 min). The other half bug-fixes and writes the README | No one works > 16 h straight |
| **T+14 → 18** | P1: Monte Carlo, recommendations, inference module, LLM narratives, report | Reco table shows FDS before→after |
| **T+18 → 20** | Visual polish pass (D leads), loading/error states, lens transition animation, responsiveness for projector | Looks intentional on a 1080p projector |
| **T+20** | ❄ **FEATURE FREEZE** | Only bug fixes after this line |
| **T+20 → 22** | Bug bash, **offline backup** (screen recording of full demo), pitch slides (max 5), README | Backup video exists; `.\tasks.ps1 demo` is one command |
| **T+22 → 24** | Rehearse the 3-minute demo 3×, prep Q&A, submit before the deadline, keep a 30-min buffer | Submission confirmed |

**Sleep and sanity:** alternate 90-minute rests between T+12 and T+16. A rested team at T+22 beats an exhausted team with one extra feature.

---

## 12. Demo script (3 minutes)

1. **Hook (0:00–0:20):** "Aurora Motors buys power chips from three suppliers. Procurement says: diversified. Let's check."
2. **Illusion reveal (0:20–1:00):** Lens at *Verified*: "three independent suppliers, EIC 3.0." Slide to *All*. The graph lights up: one wafer fab, one port. The hero metric animates from 0.12 to 0.68. *"Three suppliers, one point of failure."*
3. **Evidence (1:00–1:25):** Click the inferred Helix→HWW edge: shared address, shipment records, disclosure text. *"We label every link verified, reported, or inferred, and show the proof."*
4. **Disruption (1:25–2:10):** Press "Kaohsiung typhoon". The red wave spreads, the inventory curve hits zero on day 9, production halts. Monte Carlo band: "P90 loss ₹X crore."
5. **Honesty check (2:10–2:25):** Select Copper: "genuinely diversified. We don't cry wolf."
6. **Fix (2:25–2:50):** Reco table: "Onboard Pune Micro for 25% share + 12 days buffer: FDS 0.68 → 0.31, loss P90 −64%."
7. **Close (2:50–3:00):** "Independence isn't how many suppliers you have. It's how many *don't share a failure.*"

---

## 13. Judging criteria mapping

| Likely criterion | Our answer |
|---|---|
| Innovation | EIC/FDS (new, intuitive metric) + confidence-aware graph + knowledge-uncertainty in Monte Carlo |
| Technical depth | Graph propagation, exact exposure computation, noisy-OR inference, day-level simulation, Monte Carlo |
| Feasibility / real-world | Works on any CSV graph (P2), explicit verified/reported/inferred separation mirrors real data quality |
| UI/UX | Designed visual language, lens animation, projector-legible |
| Impact | Quantified loss avoided, ROI-ranked actions |
| Presentation | One story, one "wow" moment, backup video |

---

## 14. Risks and fallbacks

| Risk | Mitigation |
|---|---|
| Graph looks messy | Preset tier layout; cap nodes at ~55; group by material |
| Time overrun | Cut lines in §2; P1 dropped at T+12 if P0 incomplete |
| Venue Wi-Fi fails / LLM down | Offline-first; templates fallback; local run only; screen-recording backup |
| "Is your data real?" | Say it plainly: synthetic, deterministic, designed to include the real patterns (shared fab, port, region); show CSV import if P2 done |
| Engine bugs produce silly numbers | Golden tests (§instructions) + the Copper control must stay "diversified" |
| Merge conflicts | One owner per directory; small commits; `docs/STATUS.md` |
| Agent-generated code drifts from contract | `contracts/` is the single source of truth; agents must not alter it unannounced |
| Dependency hell at hour 3 | Pin versions in the first hour; commit lockfiles |

---

## 15. Pre-submission checklist

- [ ] `.\tasks.ps1 demo` starts backend and frontend with one command, from a clean clone
- [ ] Lens toggle, simulation, evidence panel, recommendations all work on the demo laptop *and* on the backup laptop
- [ ] Golden tests pass (`.\tasks.ps1 test`)
- [ ] Backup demo video recorded (≥ 2 min), saved locally and on a phone
- [ ] README: what it is, how to run, architecture diagram, team
- [ ] Slides (≤ 5): problem, insight (EIC/FDS), demo, architecture, impact
- [ ] No API keys in the repo; `.env.example` present
- [ ] Contact details and submission form filled before the deadline
