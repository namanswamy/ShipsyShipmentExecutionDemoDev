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
│   │   ├── App.tsx                # Main app — navbar, filters, milestone bar, layout, screen routing (Shipper/Approver)
│   │   ├── App.css                # All CSS with Shipsy design tokens
│   │   ├── components/
│   │   │   ├── ActionsPanel.tsx    # Right panel — tabs, persona switcher, task routing, lifted state
│   │   │   ├── TasksListSequenced.tsx  # Task list with sequencing, milestones, status, multi-vendor submit
│   │   │   ├── TaskDetail.tsx      # Task detail form with field inputs, hideHeader support
│   │   │   ├── GPOTaskView.tsx     # Global Plan Optimizer — bid cards, spot/normal, vendor tabs
│   │   │   ├── BidCard.tsx         # Individual bid/rate card component (Shipsy logo)
│   │   │   ├── IncidentalChargesView.tsx  # Incidental charges — 3 types, BL/container tables, draft/approval flow
│   │   │   ├── MultiVendorWrapper.tsx     # Tab wrapper for multi-vendor personas (Transporter/CFS/ICD/Surveyor)
│   │   │   ├── NavigationMenu.tsx  # Top-half navigation panel with module cards + Manage Tasks submenu
│   │   │   ├── ApproverScreen.tsx  # Approver screen — claims table, inline approval detail, filters
│   │   │   ├── ShipmentCard.tsx    # Left panel shipment cards (FCL/LCL/AIR/BB/BULK icons)
│   │   │   ├── Filters.tsx         # Top filter bar (Mode, Type, My Task, Sort By, Company Code, etc.)
│   │   │   └── MilestoneBar.tsx    # Milestone tabs (All, Drafts, Origin, etc.) with white boxes
│   │   └── data/
│   │       ├── tasks.ts            # Shipment card data + personas + status options
│   │       ├── taskSequence.ts     # Task sequence config per mode (1→37), incoterm filtering
│   │       ├── taskFields.ts       # Field definitions for all tasks with dropdown options
│   │       ├── bidData.ts          # Bid/rate card data generator (normal + spot), vendor-specific details
│   │       └── incidentalCharges.ts # Charge types, BL/container row definitions, GST auto-fill
│   └── public/
│       └── shipsy-logo.jpg         # Shipsy logo for rate cards
├── reference-files/               # Original Shipsy codebase files (read-only reference)
├── TASKS Order List.xlsx          # Excel sheet with task order per mode
├── Shipsy_EXIM_Manage_Tasks_Complete_List.docx  # Generated task list document
└── PROJECT_CONTEXT.md             # This file
```

## Key Features Implemented

### 1. UI Layout (Matching Shipsy Design)
- **Navbar:** 3x3 grid icon (opens navigation menu), "Manage Tasks" title, notification badge (99+), profile avatar
- **Filter bar:** Mode (FCL/LCL/Air/Domestic/RPTL), Type (Export/Import/Trade), My Task, Sort By, Company Code, More Filters, Refresh, Search, Reports, New Shipment — all in one row
- **Milestone tabs:** White box tabs with borders (All 999+, Drafts 999+, Origin 61, etc.) + Bulk Update + pagination
- **Body:** 37.6% shipment list / 62.4% actions panel split
- **Design tokens:** bg #F1EEE7, primary #006EC3, text #333, all Open Sans font

### 2. Shipment Cards (Left Panel)
- 18 shipment cards with different modes (FCL, LCL, AIR, Break Bulk, Bulk)
- Different incoterms (FOB, EXW, FAS, CIF, CPT, CFR, DAP, DDP)
- Purple header (#F5F0FF) with reference number, mode icon, type, incoterm
- Port routes with connecting line, carrier logos (MSC, COSCO text)
- Milestone badge, task count badge, watcher eye icon, overdue alerts
- DEMO-READY shipment at bottom (pre-completed to FF Incidental Events for quick demo)

### 3. Task Sequencing (37 tasks across 6 personas)
- Tasks unlock sequentially: Task N+1 hidden until Task N is Done/Sent for Approval
- Works across personas (Shipper Ops → FF → CHA → CFS/ICD → Transporter)
- Mode-specific tasks: different task names and availability per FCL/LCL/AIR/BB/BULK
- Persona tabs appear progressively as tasks unlock
- 1-second loading buffer + full-screen spinner + success toast on submit

### 4. Incoterm-based Filtering
- **F & E incoterms** (FOB, FAS, FCA, EXW): All personas, all vendor options
- **C incoterms** (CIF, CFR, CPT, CIP): No FF persona, no FF/Shipping Line in vendor selection
- **D incoterms** (DAP, DPU, DDP): Only Shipper + Transporter personas

### 5. Vendor Selection (Task #5)
- Add More multi-select with no duplicates
- CFS/ICD mutually exclusive
- Conditional fields (Segment, Category, Destuff Indicator, Panel Identifier, Buffer Days) appear only when CFS/ICD selected
- Vendor options filtered by incoterm (C removes FF/SL, D keeps only Transporter/Surveyor)
- Selected vendors persist and pass to GPO

### 6. Global Plan Optimizer (Task #6) — Bid Cards
- Vendor tab-based display (click tab to switch vendor's bids)
- Each vendor has 2-3 rank-based bid cards
- Card shows: Shipsy logo, POL, POD, dates, freight amount, rank, carrier, transit days
- POL/POD from Select Port Details task; CFS/ICD/Transporter/Surveyor show only POD
- All USD currency, consistent dates
- View Details modal with vendor-specific fields (FF: shipping line/bunker/HAZ; CHA: customs/documentation; CFS: handling/destuffing; ICD: rail freight; Transporter: vehicle/toll; Surveyor: inspection/certification; BB: stevedoring/wharfage)
- **Spot mode:** Normal RFQ Rank 1 reference card (read-only, dashed border, "Normal RFQ Rank 1 Bid" label) + spot rate cards (30-50% higher). Spot deviation always captured.
- **Normal mode:** Deviation only if non-Rank 1 selected
- Deviation popup with free text reason
- Total Bid Amount + Total Deviation calculated

### 7. L1 Deviation Approval (Task #7)
- Same tab-based UI as GPO but read-only
- Selected bids highlighted, unselected dimmed
- Shows deviation reason
- Approve/Reject buttons
- Auto-skipped if no deviation (normal mode, all rank 1 selected)

### 8. Incidental Charges (5 tasks — FF, CHA, CFS, ICD, Transporter)
- **Charge selection screen** (always opens first): 7 charges mapped to 3 types side by side
  - Incidental: Loading charges, Storage charges
  - Self-Reimbursement: Documentation charges, Special equipment charges
  - Third-Party Reimbursement: Agency charges, License charges, Registration charges
- No duplicate charge selection
- **Detail view** with charge type tabs (horizontal, not vertical):
  - **Incidental type:** BL + Container tables with Rate based on PCD column, rates pre-filled from contract
  - **Self-Reimbursement:** Rate + Currency editable by vendor
  - **Third-Party:** Invoice fields (No, Date, Value user-entered), Basic Value user-entered, CGST/SGST/IGST auto-filled (9%/9%/0%), Vendor Code dropdown → Name auto-populated
- Checkbox selection → Status "Selected for Approval" → after send → "Sent for Approval"
- Grand total calculated across all types
- **Save as Draft / Send for Approval / Cancel** flow
- "Show Draft" button inside task detail (not on task list row)
- Task status: "Sent for Approval" (not Done) + next task unlocks

### 9. Multi-Vendor Tabs (Transporter, CFS, ICD, Surveyor)
- Tasks for these personas show tab bar: "Transporter - 1 | Transporter - 2 | Transporter - 3" (same for CFS, ICD, Surveyor)
- Each tab has independent field state and draft state
- Task name shown once in header, not repeated per tab
- **Submit per vendor:** Each vendor tab has its own Submit button
- When one vendor submits → tab shows green checkmark + "Submitted" badge
- Task list status: "Not Started" → "Pending" (when at least one vendor submitted) → "Done" (when all vendors submitted)
- Outside task list can also be set to Done directly

### 10. Field Persistence
- All task field values persist within same shipment
- Vendor selections, port details, spot/normal choice, incidental drafts all tracked
- Data persists when switching between Tasks/Documents/Details/Tracking tabs (state lifted to ActionsPanel)
- Resets only when switching to a different shipment
- Select Mode of Shipment auto-fills Mode + Incoterm from shipment card

### 11. Navigation Menu
- Click 3x3 grid icon → **top-half panel** (full width, 55vh) slides down with dark backdrop
- **Module cards:** Track Shipments, Rate Inquiry, Quote, Contract Rates, Vessel Schedules, Manage Tasks, RFQ, Shipsy BI(Insights), Invoice, Rate Master — with descriptions
- **Top tabs:** Home, Contract Rates, Vessel Schedules, RFQ Plans
- **Right side:** Team Management, Terms & Conditions, My Charge Master, Regions Template, Demurrage & Detention, My Customers, My Suppliers, My Vendors, My Shipping Lines, My Products, API Documentation, Custom Configurations, Bulk Request, Tasks Workflow
- **Shipsy logo** top-right
- **Manage Tasks hover → submenu:** Shipper | Vendor | Approver
- Navigation works both ways (Shipper ↔ Approver)

### 12. Approver Screen ("Additional Charges Approval")
- Separate screen accessed via Navigation Menu → Manage Tasks → Approver
- **Filters:** Business, Vendor Type, Vendor Code & Name (appears when type selected), ASN No (ASN001-004), Workflow ID (demo only), Date Range (from/to) + Search/Reset
- **Claims table:** 10 demo claims (CLM001-CLM010) with Claim ID, Vendor Type, Vendor Name, Vendor Code, Business, No. of Charges, Total Amount, Status, Created Date/Time, Action
- **Inline approval detail:** Click "[Click for Approval]" → expands below that claim row (no separate screen)
- Charge type tabs (Incidental / Self-Reimbursement / Third-Party Reimbursement)
- Each row has **Approve / Reject / Rework** buttons → popup with free text remarks
- **Remarks column** with truncated text (click to expand, one at a time)
- Status updates: Approved (green) / Rejected (red) / Rework (yellow)
- **Save** (keeps pending) / **Submit** (all approved → Approved, mixed → Done, all rework → Send for Rework)
- Has its own burger icon navbar for navigation back to Shipper

## Task List (37 tasks, 6 personas, 5 modes)
See Shipsy_EXIM_Manage_Tasks_Complete_List.docx for full list with fields.

### Task sequence:
- Tasks 1-7: Drafts (Shipper Ops) — Select Mode, Select Port, Container/Package/Cargo Details, Vendor Selection, GPO, L1 Deviation
- Tasks 8-9: Origin (Ops + FF, FCL only) — Sailing Schedule
- Tasks 10-17: Origin (Ops + FF) — Booking Note, Container Pickup/Gate-in, Weight/Handover, Commercial Invoice, Cargo On-board, Draft BL
- Tasks 18-21: In Transit (FF + Ops) — Final BL, Courier Docket, Cargo Arrival Notice
- Tasks 22-37: Destination (all personas) — BOE, Delivery Order, Vehicle Loading, Detention, Incidentals (FF/CHA), CFS block (29-32), ICD block (29-32), Transporter block (33-37)

### Mode-specific differences:
- FCL: Container Details, Sailing Schedule, Empty Container Pickup, Container Weight, Destuff Indicator, Empty Container Return
- LCL: Package Details, Cargo Volume, Cargo Gate-in, Cargo Handover, Cargo On-board
- AIR: Package Details, Total Weight, Cargo Gate-in, Cargo On-board, AWB instead of BL
- Break Bulk/Bulk: Cargo Volume, Cargo Gate-in, Cargo Handover, Cargo On-board

## Deploy Commands
```bash
# Start dev server
cd demo && npx vite --port 3000 --host

# Build
cd demo && npx vite build

# Deploy to Vercel
cd demo && npx vercel --prod --public --yes
npx vercel alias <deployment-url> shipment-execution-demo.vercel.app

# Push to GitHub
git add -A && git commit -m "message" && git push

# Revert to previous state
git log --oneline  # find commit hash
git revert <hash>  # or git reset --hard <hash>
```

## Git Config
- User: namanswamy
- Email: namanswami3696@gmail.com
- SSH key configured for GitHub

## Key Design Decisions
- Feature branches for big changes, merge to main when confirmed
- Always commit before risky changes for easy revert
- Summarize changes before implementing, wait for confirmation
- Test on localhost first, then deploy to Vercel, then optionally push to GitHub
- DEMO-READY shipment card for quick demo without clicking through all tasks
