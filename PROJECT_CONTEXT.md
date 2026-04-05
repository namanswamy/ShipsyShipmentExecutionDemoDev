# Shipsy EXIM - Manage Tasks Demo Screen

## Project Overview
A pixel-accurate demo frontend of Shipsy's EXIM Shipment Execution "Manage Tasks" module. Built for demo/presentation purposes.

## Links
- **Live Demo:** https://shipment-execution-demo.vercel.app
- **GitHub:** https://github.com/namanswamy/ShipsyShipmentExecutionDemoDev
- **Vercel Project:** namanswami3696-1180s-projects/demo
- **Custom Vercel alias:** shipment-execution-demo.vercel.app

## Tech Stack
- React + TypeScript + Vite
- No external UI libraries — all custom CSS matching Shipsy design tokens
- Deployed on Vercel

## Folder Structure
```
ShipsyShipmentExecutionDemoDev/
├── demo/                          # React app (deployed)
│   ├── src/
│   │   ├── App.tsx                # Main app — navbar, filters, milestone bar, layout
│   │   ├── App.css                # All CSS with Shipsy design tokens
│   │   ├── components/
│   │   │   ├── ActionsPanel.tsx    # Right panel — tabs, persona switcher, task routing
│   │   │   ├── TasksListSequenced.tsx  # Task list with sequencing, milestones, status
│   │   │   ├── TaskDetail.tsx      # Task detail form with field inputs
│   │   │   ├── GPOTaskView.tsx     # Global Plan Optimizer — bid cards, spot/normal
│   │   │   ├── BidCard.tsx         # Individual bid/rate card component
│   │   │   ├── IncidentalChargesView.tsx  # Incidental charges — 3 types, BL/container tables
│   │   │   ├── ShipmentCard.tsx    # Left panel shipment cards
│   │   │   ├── Filters.tsx         # Top filter bar (Mode, Type, My Task, Sort By, etc.)
│   │   │   └── MilestoneBar.tsx    # Milestone tabs (All, Drafts, Origin, etc.)
│   │   └── data/
│   │       ├── tasks.ts            # Shipment card data + old task definitions
│   │       ├── taskSequence.ts     # Task sequence config per mode (1→37)
│   │       ├── taskFields.ts       # Field definitions for all tasks
│   │       ├── bidData.ts          # Bid/rate card data generator
│   │       └── incidentalCharges.ts # Charge types, BL/container row definitions
│   └── public/
│       └── shipsy-logo.jpg         # Shipsy logo for rate cards
├── reference-files/               # Original Shipsy codebase files (read-only reference)
├── TASKS Order List.xlsx          # Excel sheet with task order per mode
├── Shipsy_EXIM_Manage_Tasks_Complete_List.docx  # Generated task list document
└── PROJECT_CONTEXT.md             # This file
```

## Key Features Implemented

### 1. Shipment Cards (Left Panel)
- 17 shipment cards with different modes (FCL, LCL, AIR, Break Bulk, Bulk)
- Different incoterms (FOB, EXW, FAS, CIF, CPT, CFR, DAP, DDP)
- Port routes, milestone badges, task counts, overdue alerts, carrier logos

### 2. Task Sequencing (37 tasks across 6 personas)
- Tasks unlock sequentially: Task N+1 hidden until Task N is Done
- Works across personas (Shipper Ops → FF → CHA → CFS/ICD → Transporter)
- Mode-specific tasks: different task names and availability per mode
- Persona tabs appear progressively as tasks unlock
- 1-second loading buffer + success toast on submit

### 3. Incoterm-based Filtering
- **F & E incoterms** (FOB, FAS, FCA, EXW): All personas, all vendor options
- **C incoterms** (CIF, CFR, CPT, CIP): No FF persona, no FF/Shipping Line in vendor selection
- **D incoterms** (DAP, DPU, DDP): Only Shipper + Transporter personas

### 4. Vendor Selection (Task #5)
- Add More multi-select with no duplicates
- CFS/ICD mutually exclusive
- Conditional fields (Segment, Category, etc.) appear only when CFS/ICD selected
- Vendor options filtered by incoterm
- Selected vendors persist and pass to GPO

### 5. Global Plan Optimizer (Task #6) — Bid Cards
- Vendor tab-based display (click tab to switch vendor's bids)
- Each vendor has 2-3 rank-based bid cards
- Card shows: Shipsy logo, POL, POD, dates, freight amount, rank, carrier, transit days
- POL/POD from Select Port Details task; CFS/ICD/Transporter show only POD
- All USD currency, same dates
- View Details modal with vendor-specific fields
- **Spot mode:** Normal RFQ Rank 1 reference card (read-only) + spot rate cards (30-50% higher)
- Deviation = selected bid - rank 1 (normal) or selected spot - normal rank 1 (spot)
- Deviation popup with free text reason
- Total Bid Amount + Total Deviation calculated

### 6. L1 Deviation Approval (Task #7)
- Same tab-based UI as GPO but read-only
- Selected bids highlighted, unselected dimmed
- Shows deviation reason
- Approve/Reject buttons
- Skipped if no deviation (normal mode, all rank 1 selected)

### 7. Incidental Charges (5 tasks — FF, CHA, CFS, ICD, Transporter)
- Charge selection: 7 charges mapped to 3 types
  - Incidental: Loading charges, Storage charges
  - Self-Reimbursement: Documentation charges, Special equipment charges
  - Third-Party Reimbursement: Agency charges, License charges, Registration charges
- No duplicate charge selection
- Detail view with BL-wise (2 BLs) + Container-wise (3 containers) tables
- Incidental type: rates pre-filled from contract
- Self-Reimbursement: rate + currency editable by vendor
- Third-Party: Invoice fields, Basic Value user-entered, GST auto-filled (9%/9%/0%), vendor code dropdown
- Checkbox selection → Status "Send for Approval"
- Grand total calculated
- Save as Draft / Send for Approval / Cancel flow
- "Show Draft" button on task row when draft exists

### 8. Field Persistence
- All task field values persist within same shipment
- Vendor selections, port details, spot/normal choice all tracked
- Resets when switching to different shipment

### 9. UI Design
- Pixel-accurate to Shipsy's actual system (based on screenshots + design tokens)
- Background: #F1EEE7, Primary: #006EC3, Text: #333333
- 37.6% / 62.4% split layout
- White milestone tab boxes with borders
- Filter bar with Mode, Type, My Task, Sort By, Company Code, More Filters
- Navbar with 3x3 grid icon, notification badge, profile avatar

## Git Branches
- `main` — stable, deployed to Vercel and GitHub
- `feature/task-sequencing` — merged
- `feature/bid-cards` — merged
- `feature/gpo-revamp` — merged
- `feature/incidental-charges` — latest work, needs merge to main

## Deploy Commands
```bash
# Deploy to Vercel
cd demo && npx vercel --prod --public --yes
npx vercel alias <deployment-url> shipment-execution-demo.vercel.app

# Push to GitHub
cd .. && git add -A && git commit -m "message" && git push
```

## Task List (40 tasks, 6 personas)
See Shipsy_EXIM_Manage_Tasks_Complete_List.docx for full list with fields.

Key task numbers:
- Tasks 1-7: Drafts (all Shipper Ops)
- Task 5: Vendor Selection (with incoterm filtering)
- Task 6: Run Global Plan Optimizer (bid cards)
- Task 7: Approval of L1 Deviation
- Tasks 8-17: Origin (mix of Ops + FF)
- Tasks 18-21: In Transit
- Tasks 22-37: Destination (all personas)
- Tasks 26, 27, 32, 37: Incidental charges (per vendor type)

## Pending / In Progress
- feature/incidental-charges branch has latest incidental charges work — needs merge + push
- Incidental charges "next part" (approval flow after send for approval) — user mentioned will tell later
```
