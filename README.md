# TrueTier

**Supply chain risk intelligence for procurement and operations teams.**

TrueTier helps teams see beyond tier-1 supplier lists: map shared upstream dependencies, understand disruption exposure, and prioritize practical resilience actions.

## Product preview

The current Vite app is an interactive SaaS product preview built around a synthetic Aurora Motors case. It includes:

- A procurement workspace dashboard with exposure signals and supplier risk register
- A multi-tier dependency graph and verified / reported / inferred confidence labels
- A disruption scenario preview with adjustable duration and inventory buffer
- A prioritized action plan and evidence register
- Client-side CSV import and risk register export
- Explorer, Team, and Enterprise plan concepts with indicative pricing

All sample companies, risk figures, loss estimates, and modeled outputs are illustrative. CSV imports stay in the browser session and are not uploaded or saved.

## Run locally

Requirements: Bun and a current Node.js runtime.

```sh
bun install
bun run dev
```

The Vite dev server runs on port 3000. Create a production bundle with:

```sh
bun run build
```

## Early pricing hypothesis

Pricing in the app is for customer discovery, not a live offer:

| Plan | Indicative price | Intended fit |
| --- | ---: | --- |
| Explorer | Free | Single workspace and basic risk exploration |
| Team | $499/month or $399/month billed annually | Procurement teams coordinating supplier risk |
| Enterprise | Custom | Larger networks, integrations, and security controls |

The paid value proposition is saved workspaces, verified evidence workflows, team collaboration, recurring monitoring, advanced scenario modeling, and audit-ready reporting.

## Production work still required

This repository currently contains a frontend preview. It does not yet provide server-side accounts, team access controls, persistent customer data, scheduled monitoring, or payment processing. Before accepting customers or payments, implement and review:

1. Authentication, workspace membership, role-based access, and account recovery.
2. A database and tenant isolation for supplier records, evidence, scenarios, and audit history.
3. Secure ingestion and retention controls for procurement data, including deletion and export.
4. A verified data pipeline and scheduled risk updates with clear evidence provenance.
5. Server-side scenario calculations, validation, rate limits, and background jobs.
6. Stripe checkout, billing portal, webhooks, plan entitlements, invoices, and cancellation.
7. Operational controls: backups, observability, incident response, privacy terms, and security review.

Do not treat the synthetic risk scores in the preview as real supplier assessments.
