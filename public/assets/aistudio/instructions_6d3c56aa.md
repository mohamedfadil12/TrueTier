# instructions.md: Agent Instructions for TrueTier

> **⏱ THIS IS A 24-HOUR HACKATHON (METAVERSE 2.0, 29–30 Oct 2026).**
> You are one of several agents/humans building **TrueTier**, a supplier-dependency intelligence platform for the challenge *"The Supplier Illusion"*. Speed, a working demo, and clarity beat polish-in-the-abstract, perfect architecture, and test coverage. Read `plan.md` first. It is the source of truth for scope, formulas, data shapes, and the API.

---

> **📁 Project location: `D:\METAVERSE` (Windows).** All commands in this repo's docs run in PowerShell from that folder. `make X` means `.\tasks.ps1 X`.

## 1. Prime directives (read these every time you start a task)

1. **Demo path first.** The demo path is: load graph → Confidence Lens toggle changes FDS → click a node and see evidence → run a disruption → see inventory/production charts → see recommendations. Anything not on this path is optional.
2. **Vertical slice before depth.** Get an ugly end-to-end version working, then improve. Never spend more than 45 minutes on one component without a working end-to-end result.
3. **Contract-first.** `contracts/types.ts` and `contracts/models.py` are the shared truth. Do not change field names or shapes without recording it in `docs/STATUS.md`.
4. **Stay in your lane.** Only edit files in the directory you own (see §3). If you need a change elsewhere, write it in `docs/STATUS.md` under "Requests".
5. **No gold-plating.** No auth, no database, no Docker, no microservices, no CI, no i18n, no state-management rewrites, no premature abstraction. Single process, in-memory, JSON files.
6. **Deterministic.** Seeded randomness (`random.Random(42)`, `np.random.default_rng(42)`). The demo must behave identically every time.
7. **Offline-first.** The app must work with zero internet. LLM calls are optional with a deterministic fallback (§8).
8. **Commit small and often** (every 30–45 minutes, or whenever something works). Commit messages: `area: what changed`. Never leave `main` broken.
9. **Do not refactor working code** unless it blocks you. Feature freeze is at **T+20h**; after that, only bug fixes.
10. **When uncertain, choose the simpler option and note the assumption** in `docs/STATUS.md` rather than blocking.

---

## 2. Setup and commands

Prerequisites: Python 3.11+, Node 20+, npm.

Create `tasks.ps1` in the project root early (Task T00). It replaces `make` on Windows. **Wherever any doc says `make X`, run `.\tasks.ps1 X` from `D:\METAVERSE` in PowerShell** (`setup`, `data`, `api`, `web`, `demo`, `test`). If scripts are blocked, run once: `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`, or prefix commands with `powershell -ExecutionPolicy Bypass -File`.

A ready-made `tasks.ps1` and a folder scaffolder `scaffold.ps1` are provided alongside this file. Run `scaffold.ps1` once to create the structure.

Path rules for Windows (important for agents):
- Project root is `D:\METAVERSE`. Never hard-code it in code; resolve paths relative to the file (`Path(__file__).resolve().parent...` in Python, `import.meta.env` / relative imports in the frontend).
- Python venv activation is `backend\.venv\Scripts\Activate.ps1` (not `bin/activate`). Call `backend\.venv\Scripts\python.exe` directly in scripts.
- `scripts/generate_data.py` must write to `<repo>/data/` using `pathlib`, with UTF-8 and `\n` line endings (`newline="\n"`) so output stays byte-stable.
- Use forward slashes inside JSON/TS import paths; avoid shell-specific syntax (`&&`, `export`) in docs and scripts. PowerShell 5.1 does not support `&&`.

`backend/requirements.txt` (pin versions in the first hour):
`fastapi`, `uvicorn[standard]`, `pydantic>=2`, `networkx`, `numpy`, `pandas`, `rapidfuzz`, `jinja2`, `pytest`, `httpx`, `anthropic` (optional).

Frontend dependencies: `react`, `react-dom`, `typescript`, `vite`, `tailwindcss`, `cytoscape`, `cytoscape-fcose` (optional), `recharts`, `zustand`.

Environment (`.env.example`, never commit real keys):
```
ANTHROPIC_API_KEY=
ANTHROPIC_MODEL=claude-sonnet-5-5
```

---

## 3. Ownership map

| Directory | Owner role | Notes |
|---|---|---|
| `contracts/` | Everyone, **frozen at T+1h** | Changes need a STATUS.md note |
| `scripts/`, `data/`, `backend/app/main.py`, `store.py`, `llm.py`, `report.py` | **Data & API agent** | |
| `backend/app/engine/`, `backend/tests/` | **Engine agent** | |
| `frontend/src/**` (except `styles/`) | **Frontend agent** | |
| `frontend/src/styles/`, `docs/pitch.md` | **Design/QA agent** (or human designer) | Tokens, polish, pitch script |

With a small team, one human or agent may hold multiple roles. The rule "one owner per directory" still applies.

---

## 4. Shared handoff log: `docs/STATUS.md`

Create at T+0 with these sections and keep it current. Every agent appends, never rewrites others' entries.

```
## Now (who is doing what)
## Done (with commit hash)
## Requests (cross-lane asks: "Frontend needs X from API")
## Decisions / assumptions
## Known bugs
```

Update it at the **start** and **end** of every task. At each task start, read it first.

---

## 5. Task backlog (ordered)

Each task lists owner, deliverable, and acceptance criteria (AC). Do them in order within a lane; lanes run in parallel after T00–T02.

### Phase 0: Foundation (T+0 → T+1)

**T00. Repo scaffold** *(any)*: folders per plan §5, `tasks.ps1`, `.gitignore`, `.env.example`, empty `docs/STATUS.md`.
AC: `make setup` succeeds.

**T01. Contracts** *(all, then freeze)*: write `contracts/types.ts` and `contracts/models.py` exactly per plan §6.1 and §8 (Node, Edge, Evidence, Material, BuyerProfile, Disruption, Scenario, CandidateSupplier, request/response types).
AC: Pydantic models import without error; TS types compile.

**T02. Mock API** *(Data & API)*: FastAPI app with `/health`, `/graph`, `/analysis`, `/scenarios`, `/simulate`, `/recommend` returning **hard-coded plausible JSON** matching contracts.
AC: Frontend can develop against it immediately. `curl localhost:8000/api/graph | head` works.

### Phase 1: P0 vertical slice (T+1 → T+12)

**T10. Data generator v1** *(Data & API)*: `scripts/generate_data.py` produces `graph.json`, `materials.json`, `scenarios.json`, `candidates.json`, `shipments.csv`, `disclosures.json` for the "Aurora Motors" scenario in plan §6.2 (MCU, cells, magnets, copper control). Hand-write the *verified/reported/inferred* classes for v1.
AC: Re-running yields byte-identical output; ~40–55 nodes; all edge `share`s per (node, material) sum to 1; every inferred/reported edge has ≥ 1 evidence item.

**T11. Graph loader and lens** *(Engine)*: `engine/graph.py`: build `networkx.DiGraph` from data; `apply_lens(graph, lens)` filters edges and **renormalizes shares**; nodes with no visible inbound supply edges become independent leaves.
AC: Unit test: under `verified`, Orion's and Helix's wafer links are absent.

**T12. Availability and exposure** *(Engine)*: `engine/exposure.py` per plan §7.2–7.3: `availability(graph, material, disruptions)`, `node_exposure(...)`.
AC: Removing Port of Kaohsiung makes MCU availability < 0.2 under `all`.

**T13. EIC / FDS / verdicts** *(Engine)*: plan §7.4. Include `top_shared` with path examples and `spof_nodes` (exposure ≥ 0.6).
AC: Golden tests in §6 pass.

**T14. Wire `/graph` and `/analysis` to the real engine** *(Data & API)*: replace mocks with engine calls; keep the response shape identical.
AC: Frontend lens toggle returns different FDS values per lens.

**T20. Frontend shell** *(Frontend)*: Vite+React+TS+Tailwind; `api.ts` typed client; zustand store (`lens`, `selection`, `scenarioId`, `simResult`); 3-pane layout per plan §9.1.
AC: Page loads, calls `/graph`, no console errors.

**T21. GraphCanvas** *(Frontend)*: Cytoscape with **preset tier layout** (x by tier, y grouped by material), edge styles by `confidence_class` (solid/dashed/dotted; teal/amber/violet), node size ∝ exposure, red halo for nodes shared by ≥ 2 suppliers (from `/analysis.top_shared`), click selects.
AC: Readable at 1080p; inferred edges visually distinct without relying on color.

**T22. HeroMetric, MaterialCards, LensSlider** *(Frontend)*: slider (Verified / +Reported / All) updates store → refetch → graph + metric animate (count-up).
AC: The "Confidence Lens" moment from plan §1 works.

**T23. EvidencePanel** *(Frontend)*: node/edge details, confidence badge, evidence list with type icons, "why it matters".
AC: Clicking the Helix→HWW edge shows ≥ 2 evidence items.

**T30. Simulation engine** *(Engine)*: `engine/simulate.py` per plan §7.5, with caching by `frozenset(D_t.items())`; `wave_index` via BFS from disrupted nodes.
AC: Kaohsiung 14d scenario → MCU `stockout_day` is a finite day < 14 and `first_halt_day` is set; Copper is unaffected.

**T31. `/simulate` + scenario presets** *(Data & API)*: wire engine; return template narrative (§8).
AC: `curl -X POST /api/simulate -d '{"scenario_id":"kaohsiung"}'` returns series arrays of length = horizon.

**T32. SimPanel + Charts + propagation animation** *(Frontend)*: preset buttons, custom disrupt (selected node), Recharts inventory/production/loss, BFS wave animation (250 ms per wave).
AC: **Milestone T+12h: full P0 demo path runs end-to-end.**

### Phase 2: P1 (T+12 → T+20): skip any item that threatens the schedule

**T40. Monte Carlo** *(Engine)*: plan §7.6; N configurable; target < 3 s at N=500.
AC: P90 ≥ P50; `prob_halt` ∈ [0,1].

**T41. Recommendations** *(Engine → Data & API → Frontend)*: plan §7.7; `/recommend`; RecoTable with before→after FDS and ROI.
AC: Best action lowers MCU FDS and loss_p90; ROI sorted descending.

**T42. Inference module** *(Engine/Data)*: plan §7.8, run inside `generate_data.py` to produce the inferred edges + evidence; expose `/inference/scan`.
AC: Helix→HWW inferred with confidence in [0.5, 0.8] and ≥ 2 evidence signals.

**T43. LLM narrative/explanations** *(Data & API)*: §8.
AC: With key unset, app behaves identically using templates.

**T44. Printable report** *(Data & API)*: Jinja2 template with hero metrics, material table, scenario result, top 3 actions; `@media print` CSS.
AC: Browser "Save as PDF" yields a clean 1–2 page document.

### Phase 3: Polish and ship (T+18 → T+24)

**T50. Visual polish** *(Design/QA, with Frontend)*: tokens, typography, spacing, lens-transition animation, loading skeletons, error toasts, projector legibility.
**T51. Bug bash and rehearsal** *(everyone)*: run the 3-minute script from plan §12 on the demo laptop three times. Log bugs in STATUS.md.
**T52. Backup** *(Design/QA)*: record the full demo screen capture; commit nothing large, store video outside git.
**T53. README** *(any)*: what/why, `make setup && make demo`, architecture diagram (copy from plan §3), team.

**P2 (only if ahead):** CSV import; min-cut/SPOF view; map view; scenario comparison.

---

## 6. Golden tests (guardrails for the dataset and engine)

Put in `backend/tests/test_golden.py`. These protect the demo's story. If a test fails after a change, **fix the cause, not the test**, unless you also update `plan.md` and note it in STATUS.md.

| Test | Expectation |
|---|---|
| MCU EIC under `verified` | ≥ 2.5 (looks diversified) |
| MCU EIC under `all` | ≤ 1.5 (illusion revealed) |
| MCU FDS under `all` | > 0.5 → verdict `illusion` |
| Copper (control) FDS under `all` | < 0.2 → verdict `diversified` |
| Disrupt `port_kaohsiung` (severity 1) | MCU availability < 0.2; Copper availability > 0.9 |
| Shares sum | For every (node, material), visible inbound shares sum to 1 ± 1e-6 after lens |
| Simulation determinism | Same input twice → identical output |
| Monte Carlo ordering | `loss_p90 ≥ loss_p50` |
| Recommendations | Top action's `fds_after < fds_before` |

Keep tests to these. Do not write other tests during the hackathon.

---

## 7. Coding conventions

**Backend (Python)**
- Type hints everywhere; Pydantic models from `contracts/models.py`; small pure functions in `engine/`; no globals except the loaded store.
- Engine functions take a graph and plain args and return plain dicts/dataclasses so they are trivially testable.
- Core signatures (keep stable):
  ```python
  def apply_lens(g: nx.DiGraph, lens: str) -> nx.DiGraph: ...
  def availability(g, material_id: str, disruptions: dict[str, float]) -> float: ...
  def node_exposure(g, material_id: str, node_id: str) -> float: ...
  def analyze(g, materials, lens: str) -> dict: ...                       # returns /analysis payload
  def simulate(g, materials, buyer, disruptions, horizon=90) -> dict: ...  # returns /simulate payload minus narrative
  def monte_carlo(g, materials, buyer, disruptions, runs=500, seed=42) -> dict: ...
  def recommend(g, materials, buyer, candidates, scenario) -> list[dict]: ...
  def infer_edges(shipments, disclosures, nodes) -> list[Edge]: ...
  ```
- Handle: missing material, unknown node id, empty disruption list (return a clean 400/422 with `{ "error": ... }`).

**Frontend (TypeScript/React)**
- Functional components, hooks, zustand store; all network calls go through `api.ts`; types imported from `types.ts` (a copy of `contracts/types.ts`).
- Every fetch has loading and error UI. No `any` in API-facing code.
- Styling via Tailwind + CSS variables in `styles/tokens.css`. Never use color alone to encode meaning (also use line style / icon / label).
- Cytoscape: build the stylesheet from tokens; keep graph state outside React renders (use refs) to avoid re-layout thrash.
- Performance target: interaction < 100 ms on ~55 nodes.

**General**
- Comments explain *why*, not *what*. Short docstrings on engine functions with the formula reference (`plan §7.x`).
- No TODOs left in demo-path code at T+20.

---

## 8. LLM rules (optional layer)

- Module: `backend/app/llm.py` with `narrate(summary: dict) -> str` and `explain(action: dict) -> str`.
- **Always** implement the deterministic template first (T31), then optionally wrap with the LLM (T43).
- Timeout 8 s, max 1 retry, then template. Never raise to the API layer. Cache by hash of input.
- The prompt must contain only computed numbers and evidence strings from our engine, with the instruction: *"Use only the facts provided. Do not invent suppliers, numbers, or causes. 2–3 sentences, plain language."*
- Missing `ANTHROPIC_API_KEY` ⇒ use templates silently.
- Never put LLM output into numbers, scores, or rankings; it only writes prose.

---

## 9. Multi-agent coordination protocol

1. **One agent per lane** (Engine, Data & API, Frontend, Design/QA). Optional extra: a **Reviewer** agent that only reads code and tests, and writes findings to STATUS.md.
2. **Branches:** `main` is the demo branch. Work in `lane/<name>` branches, merge to `main` at least hourly via fast-forward or small merges. Resolve conflicts in favour of the lane owner.
3. **Contracts frozen at T+1h.** If an agent needs a contract change: write the request in STATUS.md → human approves → update `contracts/` + `plan.md` §6/§8 in one commit → notify other lanes via STATUS.md.
4. **Integration checkpoints:** T+4, T+8, T+12, T+18, T+20. At each, run `make demo` from a clean clone and walk the demo path. The Design/QA lane owns this.
5. **If blocked > 20 minutes:** stub it (return mock/constant), write the stub in STATUS.md "Known bugs", move on.
6. **Never silently expand scope.** If you have an idea, write it under "Decisions / assumptions → Ideas (parked)".

### Role prompts (paste at the start of each agent session)

**Engine agent**
> You are the Engine agent for TrueTier, a 24-hour hackathon project. Read `plan.md` §6–7 and `instructions.md`. You own `backend/app/engine/` and `backend/tests/`. Implement tasks T11–T13, T30, T40, T41, T42 in order, matching the formulas in plan §7 exactly. Keep functions pure and small. Make the golden tests in instructions §6 pass. Do not touch other directories; write cross-lane requests in `docs/STATUS.md`. Prefer a simple correct implementation over an optimized one (the graph has ≤ 60 nodes).

**Data & API agent**
> You are the Data & API agent for TrueTier, a 24-hour hackathon project. Read `plan.md` §6, §8, §10 and `instructions.md`. You own `scripts/`, `data/`, `backend/app/main.py`, `store.py`, `llm.py`, `report.py`. First ship the mock API (T02) so the frontend can start, then the deterministic data generator (T10), then wire real engine calls (T14, T31), then T43/T44. Keep response shapes identical to `contracts/`. Never block the API on the LLM.

**Frontend agent**
> You are the Frontend agent for TrueTier, a 24-hour hackathon project. Read `plan.md` §9 and `instructions.md`. You own `frontend/src/` (except `styles/`). Build against the mock API from minute one. Prioritise the Confidence Lens moment and the disruption animation: those are the demo. Use Cytoscape with a preset tier layout, distinct edge styles per confidence class, and readable typography for a projector. Handle loading and error states on every request.

**Design/QA agent**
> You are the Design/QA agent for TrueTier, a 24-hour hackathon project. Read `plan.md` §9, §12, §14 and `instructions.md`. You own `frontend/src/styles/` and `docs/pitch.md`. Define design tokens (dark ink `#080A0D` base, teal/amber/violet for verified/reported/inferred, red for risk), typography, spacing. At each checkpoint run the 3-minute demo script and log defects in `docs/STATUS.md`. Keep the pitch script ≤ 3 minutes.

**Reviewer agent (optional)**
> You are the Reviewer for TrueTier. You do not write features. Every 2 hours: pull `main`, run `make test` and `make demo`, walk the demo path, check API responses against `contracts/`, and list concrete defects with file/line in `docs/STATUS.md`. Flag any scope creep.

---

## 10. Schedule guardrails and cut rules

| Checkpoint | If you are behind… |
|---|---|
| **T+4h** (graph visible from real backend) | Drop inference/LLM/report from the plan entirely for now; focus on P0 |
| **T+8h** (lens toggle changes FDS live) | Simplify simulation to deterministic only (no Monte Carlo) |
| **T+12h** (P0 end-to-end) | Drop everything in P1 except recommendations + report; if the frontend is not usable, switch to the **Streamlit fallback** (graph via pyvis, same engine) |
| **T+18h** | Stop adding features. Polish only |
| **T+20h** | **Feature freeze** |
| **T+22h** | Backup video recorded, README done; only rehearsal remains |

---

## 11. Definition of done (per task)

- Meets its acceptance criteria.
- Runs from `make demo` without manual steps.
- No console errors/stack traces on the demo path.
- STATUS.md updated (Done + commit hash).
- Committed to its lane branch and merged to `main` (or flagged for merge).

---

## 12. Do-nots (hard limits)

- ❌ Do not add a database, auth, Docker, CI, or cloud deployment as a *dependency of the demo*.
- ❌ Do not use real company names or real proprietary data; use the fictional scenario.
- ❌ Do not commit API keys, large videos, or `node_modules`/`.venv`.
- ❌ Do not make the demo depend on the internet or the LLM.
- ❌ Do not change `contracts/` unannounced.
- ❌ Do not present inferred links as verified. The distinction is the product.
- ❌ Do not add features after T+20h.
- ❌ Do not spend more than 45 minutes stuck on any single issue without stubbing and moving on.

---

## 13. Demo-readiness checklist (Design/QA runs this at T+20, T+22, T+23)

- [ ] Fresh clone → `make setup && make data && make demo` works
- [ ] Lens slider animates graph and hero metric; MCU goes from "looks diversified" to "illusion"
- [ ] Helix→HWW edge shows evidence; edge styles distinguishable in grayscale
- [ ] All 4 presets run; Kaohsiung halts production before day 14; Copper stays healthy
- [ ] Charts legible from 3 m away on a projector
- [ ] Recommendations show FDS before→after and ROI
- [ ] Report opens and prints cleanly
- [ ] App works with Wi-Fi off and `ANTHROPIC_API_KEY` unset
- [ ] Backup video recorded; phone has a copy
