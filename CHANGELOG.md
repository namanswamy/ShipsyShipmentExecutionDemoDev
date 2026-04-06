# Shipsy EXIM - Manage Tasks Demo: Changes Summary

**Date:** 7 April 2026
**Live Demo:** https://shipment-execution-demo.vercel.app

---

## 1. Spot / Normal Shipment Indicators

### What changed
- Shipment cards now visually distinguish between **Spot** and **Normal** RFQ modes.
- **Spot shipments** have an orange left border, warm background gradient, and an orange "SPOT" badge in the card header.
- **Normal shipments** have a blue left border, cool background gradient, and a blue "NORMAL" badge in the card header.

### Pre-configured shipments
- **4 new shipment cards** added with Task 1 ("Select Mode of Shipment") already completed:
  - 2 Spot shipments (SEHR38490, SEHR38489)
  - 2 Normal shipments (SEHR38488, SEHR38486)

### Dynamic behavior
- When any shipment's Task 1 is submitted with a Spot/Normal selection, the card border and badge update live.

---

## 2. Mode Dropdown Filtering

### What changed
- Mode dropdown names cleaned up: "BULK (MR)" is now "Bulk", "BREAK BULK (MB)" is now "Break Bulk", "AIR" is now "Air".
- The Mode dropdown in Task 1 now shows **conditional options** based on the shipment card's mode:
  - **FCL / LCL / Break Bulk shipments** → FCL, LCL, Bulk, Break Bulk
  - **AIR shipments** → Air only

### Shipment card changes
- Removed standalone BULK shipment card (Bulk only exists as a dropdown option).
- BB shipment card now displays as "Break Bulk".

---

## 3. Port Details Dropdown Update

### What changed
- All 4 fields in Task 2 ("Select Port Details") — Place of Receipt at Origin, Port of Loading, Port of Discharge, Destination Port — now share the same 20 port options:

Kutno, Pipavav, ICD/CFS Chennai, Nhava Sheva, Songkhla, Salvador BA, Santos SP, Vizagapatnam, Lat Krabang, Penang Port, Dadri (Greater Noida), Fremantle, Chittagong, Legnickie Pole Poland, Manaus AM, Allcargo Global Logistics Limited (CFS), Copenhagen, Rio de Janeiro RJ, Paranagua PR, Hong Kong.

---

## 4. Container Details Repeater

### What changed
- Task 3 ("Enter Container Details"): Removed the "Container Details" text field.
- The remaining 5 fields (Container Type, Container Size, Container Count, Container Total Weight, Container Weight Unit) now display as a **clean horizontal table row** with:
  - Numbered rows (#)
  - Column headers
  - Compact inline inputs and dropdowns
  - Per-row remove button (x)
- **"+ Add More"** button adds additional container entry rows.

---

## 5. GPO Bid Card Color Theming

### What changed
- **GPO Task (Run Global Plan Optimizer):**
  - Spot rate cards have a warm orange background and borders.
  - Normal rate cards have a grey background and borders.
  - Selection indicator bar uses orange for Spot, blue for Normal.

- **L1 Deviation Approval Task:**
  - Same Spot/Normal color scheme but with **lighter/muted tones** to visually indicate read-only state.
  - Selected card badges use pastel colors instead of solid.

---

## 6. Incidental Charges: BL / Container Level Mapping

### What changed
Each incidental charge now has a defined level — either **BL level** or **Container level**. Based on this, only the relevant table is shown (not both).

| Charge | Type | Level |
|--------|------|-------|
| Loading charges | Incidental | BL (1 row) |
| Storage charges | Incidental | Container (3 rows) |
| Documentation charges | Self-Reimbursement | BL (1 row) |
| Special equipment charges | Self-Reimbursement | Container (3 rows) |
| Agency charges | Third-Party Reimbursement | BL (1 row) |
| License charges | Third-Party Reimbursement | Container (3 rows) |
| Registration charges | Third-Party Reimbursement | Container (3 rows) |

- **BL-level charges** always show exactly 1 BL row (1 ASN = 1 BL).
- **Container-level charges** show only the Container table.
- Each charge displays a "(BL Level)" or "(Container Level)" label next to its name.

---

## 7. GST Manual Input with Mutual Exclusion

### What changed (Third-Party Reimbursement charges)
- CGST, SGST, and IGST are now **manual editable input fields** (previously auto-calculated).
- **CGST auto-fills SGST** with the same value when entered.
- **Mutual exclusion logic:**
  - If CGST or SGST has a value → IGST field is disabled (greyed out).
  - If IGST has a value → CGST and SGST fields are disabled (greyed out).
- Invoice Value auto-recalculates as: Basic Value + CGST + SGST + IGST.

---

## 8. Grand Total Breakdown by Charge Category

### What changed
The Grand Total section at the bottom of the Incidental Charges detail view now shows a **4-box row**:

| Incidental Total | Self-Reimbursement Total | Third-Party Reimbursement Total | Grand Total |

- Each category total updates **live** as values are filled in.
- Category boxes are color-coded (orange for Incidental, blue for Self-Reimb, green for Third-Party).
- Boxes start greyed out and light up with their category color as values appear.
- Grand Total uses a dark background with white text.

---

## 9. Demo Incidental Shipments: Approver Response Flow

### What changed
4 new demo shipment cards replace the old DEMO-READY card, demonstrating the full incidental charges lifecycle:

### Demo Test Shipment Incidental Task 1
- Incidental task ready to be filled by vendor (same as previous DEMO-READY behavior).

### Demo Test Shipment Incidental Task 2 — "Rework Required"
- Incidental charges already submitted; approver sent back with **mixed actions**:
  - Loading charges → **Approved** (green badge, row locked/read-only)
  - Documentation charges → **Rework** (yellow badge + remark: "Please attach supporting invoice document")
  - Agency charges → **Rejected** (red badge + remark: "Rate not as per contract terms")
- Task status shows "Rework Required".
- Rework/Rejected rows remain editable for vendor to revise and re-submit.

### Demo Test Shipment Incidental Task 3 — "Not Approved"
- All charges **Rejected** by approver with individual remarks.
- Task status shows "Not Approved".
- All fields editable for re-submission.

### Demo Test Shipment Incidental Task 4 — "Approved"
- All charges **Approved** by approver with remarks.
- Task status shows "Approved".
- All fields **locked/read-only** (greyed out inputs, disabled checkboxes, green-tinted rows).

### UI details
- **Approver Response column** appears automatically when charge rows have approver data, showing colored badge + remark text.
- **Charge selection screen is locked** for reviewed shipments — remove (x) buttons hidden, "+ Add More" hidden, dropdowns disabled.
- **"Show Draft" button renamed** to **"View Approver Response"** (orange themed) for shipments with approver feedback.

---

## 10. UI Fixes

- **Status dropdown widened** from 100px to 130px so "Rework Required" and other long status names display fully without truncation. Applied uniformly to all task rows.
- **Grid column alignment fixed** — status column no longer overlaps the assignee column.
- **Persona visibility bug fixed** — switching between demo shipments no longer causes FF or other persona tabs to disappear.
