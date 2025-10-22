# Fund Inflow Management — Specification

This document describes the Fund Inflow Management Page, backend API, DB schema, and frontend integration details for the WeBuild360 project.

## Page Layout Overview

- Header
  - Left: Global search bar (search across inflow records)
  - Right: "Add Inflow" button (opens modal form)

- Under header
  - Records per page selector: 5, 10, 15, 25, 50, 100
  - Data table with columns (see Table Columns Mapping)

- Each row actions: View, Edit, Delete

## Form Fields Roadmap

General Fields
- projectId (select) — Project Name rendered from project list
- date — Payment Date (ISO date)
- amount — Fund Received (number, rupees)
- mode — Payment Mode ('bank' | 'upi' | 'cash')
- comments — text

Conditional Fields
- Bank Transfer (mode='bank')
  - bankName — string
  - ifsc — string
- UPI (mode='upi')
  - upiId (optional)
  - whoPaid (optional)
  - whoReceived (optional)
  - upiApp — ('gpay' | 'paytm' | 'phonepe')
- Cash (mode='cash')
  - no additional fields

## Modal Form Behavior

- Opens on Add Inflow click
- Modal style: no border radius, 3-column layout
- On submit: POST to API; on success show "Inflow record created successfully." toast
- On delete: after confirmation, show "Inflow record deleted successfully." toast
- Edit opens modal in editable mode; View opens modal in read-only mode

## Table Columns Mapping

| Column Name | Source Field | Conditional Display |
|-------------|--------------|---------------------|
| Date        | date         | always              |
| Project     | projectId -> project name | always |
| Amount (₹)  | amount       | always              |
| Mode        | mode         | always              |
| Bank        | bankName     | mode === 'bank'     |
| IFSC Code   | ifsc         | mode === 'bank'     |
| UPI App     | upiApp       | mode === 'upi'      |
| UPI ID      | upiId        | mode === 'upi'      |
| Who Paid    | whoPaid      | mode === 'upi'      |
| Who Received| whoReceived  | mode === 'upi'      |
| Comments    | comments     | always              |
| Actions     | —            | always              |

## API Design

- Collection name: `funds_inflow`

### GET /api/funds/inflow
- Query params: page, limit, q (search), projectId, mode
- Requires Authorization header `Bearer <token>`
- Response: { data: FundInflow[], total: number }

### POST /api/funds/inflow
- Body: {
  projectId: string,
  date: string (ISO),
  amount: number,
  mode: 'bank' | 'upi' | 'cash',
  bankName?: string,
  ifsc?: string,
  upiId?: string,
  whoPaid?: string,
  whoReceived?: string,
  upiApp?: 'gpay' | 'paytm' | 'phonepe',
  comments?: string,
}
- Validations: amount > 0, projectId required, date required
- Requires Authorization header
- Response: created record

### DELETE /api/funds/inflow/:id
- Requires Authorization header
- Response: { success: true }

### Optional: File upload endpoint
- POST /api/uploads/receipts (multipart/form-data)
- Response: { url: '/uploads/receipts/...' }

## DB Schema (example)

FundInflow {
  _id: ObjectId,
  projectId: ObjectId,
  date: ISODateString,
  amount: number,
  mode: 'bank'|'upi'|'cash',
  bankName?: string,
  ifsc?: string,
  upiId?: string,
  whoPaid?: string,
  whoReceived?: string,
  upiApp?: string,
  comments?: string,
  createdBy?: ObjectId,
  createdAt: ISODateString,
}

## Frontend Integration Notes

- Use `fetchWithAuth` helper to call the API.
- For project select, call `/api/projects` (exists) and map to projectId.
- Implement client-side validation for required fields before POST.
- Implement server-side validation in API route.
- Search: send `q` parameter to backend and implement text-indexed search over project name, comments, upiId, bankName.
- Pagination: use `page` and `limit` query params.

## Next steps for implementation
1. Create API route `src/app/api/funds/inflow/route.ts` (GET/POST) following the `expenses` API pattern.
2. Create frontend page `src/app/funds/inflow/page.tsx` with table, modal form, and actions.
3. (Optional) Add uploads API if you want receipt uploading.

---

If you'd like, I can now scaffold the API route and the frontend page with a basic working form and list. Which do you want me to create first: API, frontend, or both together?