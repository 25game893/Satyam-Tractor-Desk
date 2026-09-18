# Security Specification (Payload-First TDD)

## 1. Data Invariants

1.  **Auth Requirement**: No unauthenticated reads or writes are allowed across any collection. Users must be authenticated and have their email verified (or be a recognized system operator).
2.  **Immutability of Key Identity Fields**: Fields like `createdAt`, `userId`, `customerId`, and `invoiceId` must remain unchanged after creation.
3.  **Role Escalation Protection**: Standard `STAFF` users are strictly blocked from writing or altering user profiles, global settings, or tractor models.
4.  **Audit Logs Integrity**: Activity logs can only be appended (created) and can never be modified or deleted.
5.  **Strict Timestamps**: Creation and update timestamps must match the server-generated time `request.time`.

---

## 2. The "Dirty Dozen" Malicious Payloads

The following 12 specific payloads attempt to breach the boundaries of identity, integrity, or system state:

| ID | Target Collection | Operation | Malicious Payload / Intent | Expected Result |
|---|---|---|---|---|
| P1 | `users` | Create | Attempting to create a user profile with role `ADMIN` by a non-admin client. | `PERMISSION_DENIED` |
| P2 | `users` | Update | Standard user trying to escalate their own role to `ADMIN`. | `PERMISSION_DENIED` |
| P3 | `tractorModels` | Create | Non-admin trying to create or edit a tractor model. | `PERMISSION_DENIED` |
| P4 | `tractors` | Update | Standard user changing `createdAt` timestamp of a tractor document. | `PERMISSION_DENIED` |
| P5 | `activityLogs` | Update | Standard user trying to modify an existing audit log entry. | `PERMISSION_DENIED` |
| P6 | `activityLogs` | Delete | Attempt to delete an audit trail log to cover tracks. | `PERMISSION_DENIED` |
| P7 | `showroomSettings` | Update | Non-admin user trying to close the showroom or edit banking details. | `PERMISSION_DENIED` |
| P8 | `customers` | Create | Attempting to inject a huge 10MB string into the ID or name field (Denial of Wallet). | `PERMISSION_DENIED` |
| P9 | `invoices` | Create | Creating an invoice with mismatching or spoofed `paidAmount` and `totalAmount` states. | `PERMISSION_DENIED` |
| P10 | `deliveryChallans`| Update | Non-authorized user approving delivery challans or overwriting approvalStatus. | `PERMISSION_DENIED` |
| P11 | `returnRequests` | Update | Non-admin/staff bypassing return approval state to auto-APPROVED without proper credentials. | `PERMISSION_DENIED` |
| P12 | `tractors` | Create | Injecting junk characters or SQL injection strings into document ID variables. | `PERMISSION_DENIED` |

---

## 3. Test Runner Definition

These invariants and payloads are compiled into `firestore.rules.test.ts` to enforce and guarantee absolute security protection.
