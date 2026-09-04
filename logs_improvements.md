# Audit & Activity Logging System — Implementation Assessment & Improvements

This document assesses the implementation status of the audit logging system specified in [`logs_prompt.md`](file:///home/tl-wr840n/Documents/Projects/development/tgaw-new/logs_prompt.md) against the current codebase and provides an actionable remediation plan.

---

## Executive Summary

| Category | Status | Assessment |
|---|:---:|---|
| **1. Prisma Schema & Enums** | 🟢 Complete | `AuditLog` model, `AuditAction`, and `AuditTargetType` enums defined with TTL and index support. |
| **2. Core Service (`auditService.ts`)** | 🟡 Partial | Helper exists with action classification, request extraction, and TTL calculation, but lacks batching and diff helper utilities. |
| **3. RBAC Actions (`USER_ROLE_CHANGE`, `BAN`, etc.)** | 🔴 Not Implemented | Defined in enums, but **never logged** when admins use Better Auth's `setRole` or `banUser`. |
| **4. Booking Admin Actions** | 🟡 Partial | Config changes, meeting links, and slot generation are logged; however, slot cancel/assign lack before/after displacement diffs (`previousBookerId`), and event blocking imports `logAudit` without calling it. |
| **5. Auth Lifecycle Events** | 🟡 Partial | Only `AUTH_LOGIN_SUCCESS` (session/account create) and `USER_DELETE` are hooked. Failures, logouts, and password changes are missing. |
| **6. Content Moderation & Groups** | 🔴 Not Implemented | `POST_HIDE`, `COMMENT_HIDE`, `REPORT_RESOLVE`, and group mutations are defined but never executed (includes dead imports). |
| **7. Admin API (`/api/v1/admin/audit-logs`)** | 🟡 Partial | Endpoint exists with role-gated access and filters, but cursor pagination wipes search filters (`where.OR = undefined`). |
| **8. Admin UI & Routing** | 🟡 Partial | UI built at `/admin/activity-logs`, but missing route alias from `/admin/audit-logs`. |
| **9. MongoDB TTL & Retention** | 🟢 Complete | `scripts/audit-ttl.ts` implements tiered 90-day vs indefinite retention. |

**Verdict**: The audit system has solid foundations (schema, query API, TTL, UI shell), but **coverage is largely hollow**: over 60% of specified actions are never logged, and multiple files contain **dead imports** where `logAudit` was imported but never invoked.

---

## Detailed Gap Analysis

### 1. The "Dead Import" Bug (Imported but Never Called)

In multiple files, developers imported `logAudit` and `extractNextRequestContext` from `@/lib/services/auditService`, but the handler logic never executes the call:

1. **Special Event Creation (`EVENT_CREATE`)**:
   - File: [`app/api/v1/events/route.ts`](file:///home/tl-wr840n/Documents/Projects/development/tgaw-new/app/api/v1/events/route.ts#L5)
   - Line 5 imports `extractNextRequestContext, logAudit`.
   - `POST` creates the event and blocks slots via `applyEventBlock`, but `logAudit` is **never called**.
   - Furthermore, [`app/api/v1/events/[id]/route.ts`](file:///home/tl-wr840n/Documents/Projects/development/tgaw-new/app/api/v1/events/[id]/route.ts) has no audit logging on `PATCH` or `DELETE` (`EVENT_DELETE`).
2. **Group Creation (`GROUP_CREATE`)**:
   - File: [`app/api/v1/groups/route.ts`](file:///home/tl-wr840n/Documents/Projects/development/tgaw-new/app/api/v1/groups/route.ts#L5)
   - Line 5 imports `extractNextRequestContext, logAudit`.
   - `POST` creates the group and owner membership, but **never calls `logAudit`**.
3. **Group Membership & Role Changes (`GROUP_MEMBER_ROLE_CHANGE`)**:
   - File: [`app/api/v1/groups/[id]/members/route.ts`](file:///home/tl-wr840n/Documents/Projects/development/tgaw-new/app/api/v1/groups/[id]/members/route.ts#L5)
   - Line 5 imports `extractNextRequestContext, logAudit`.
   - `POST` adds a group member, but **never calls `logAudit`**.

---

### 2. RBAC & Security Actions Are Completely Silent

The most critical requirement in `logs_prompt.md` is auditing role escalations and administrative bans:

1. **`USER_ROLE_CHANGE`**:
   - In [`app/(dashboard)/admin/users/page.tsx`](file:///home/tl-wr840n/Documents/Projects/development/tgaw-new/app/(dashboard)/admin/users/page.tsx#L494), role updates call `authClient.admin.setRole()`.
   - In [`lib/auth.ts`](file:///home/tl-wr840n/Documents/Projects/development/tgaw-new/lib/auth.ts#L171), the `user.update` database hook only runs `preserveUserSetProfileOnLink`. It does not detect role changes or log `USER_ROLE_CHANGE`.
   - Result: A superadmin can promote or demote any user with zero audit trail.
2. **`USER_BAN` and `USER_UNBAN`**:
   - Handled via `authClient.admin.banUser()` and `authClient.admin.unbanUser()`.
   - Neither the client callers nor Better Auth server hooks log `USER_BAN` or `USER_UNBAN`.
3. **`USER_DELETE` Actor Context**:
   - In [`lib/auth.ts`](file:///home/tl-wr840n/Documents/Projects/development/tgaw-new/lib/auth.ts#L176), `user.delete.after` sets `actorId: u.id` (the deleted user), even when a superadmin deleted another user from the admin console!

---

### 3. Missing Slot Displacement & Diff Metadata

`logs_prompt.md` explicitly required tracking slot displacement (`previousBookerId`):

1. **`SLOT_ADMIN_CANCEL`**:
   - [`app/api/v1/slots/admin-cancel/route.ts`](file:///home/tl-wr840n/Documents/Projects/development/tgaw-new/app/api/v1/slots/admin-cancel/route.ts#L25) logs `{ slotId, reason }`.
   - It does not fetch the slot beforehand to record **who was displaced** (`previousBookerId`), the slot type (`BIBLE` / `PRAYER` / `PRAISE_WORSHIP`), or date/time.
2. **`SLOT_ASSIGN`**:
   - [`app/api/v1/slots/assign/route.ts`](file:///home/tl-wr840n/Documents/Projects/development/tgaw-new/app/api/v1/slots/assign/route.ts#L26) logs `{ slotId, targetUserId, notes }`.
   - It does not log the previous booker if a user was reassigned/overwritten.
3. **`EVENT_CREATE` Slot Displacement**:
   - Special events block slots and displace booked users via `previousBookerId`.
   - Because `EVENT_CREATE` is not logged, which slots were blocked and which users were displaced is lost.

---

### 4. Content Moderation & Reporting Incomplete

None of the content moderation actions are audited:

1. **`POST_HIDE` / `POST_UNHIDE`**:
   - [`app/api/v1/posts/[id]/route.ts`](file:///home/tl-wr840n/Documents/Projects/development/tgaw-new/app/api/v1/posts/[id]/route.ts#L26) allows updating `post`, but has no role guard (`leader` / `superadmin` check for `isHidden`) and no audit call.
2. **`COMMENT_HIDE`**:
   - No route or service logs `COMMENT_HIDE`.
3. **`REPORT_RESOLVE`**:
   - [`app/api/v1/reports/route.ts`](file:///home/tl-wr840n/Documents/Projects/development/tgaw-new/app/api/v1/reports/route.ts) only implements `GET` and `POST`. There is no resolution endpoint (`PATCH`) or audit log.
4. **`BROADCAST_CREATE`**:
   - No broadcast management route exists in the API.

---

### 5. Better Auth Hooks Missing Auth Events

In [`lib/auth.ts`](file:///home/tl-wr840n/Documents/Projects/development/tgaw-new/lib/auth.ts):
- `AUTH_LOGIN_SUCCESS` is captured on `session.create.after`.
- `AUTH_LOGIN_FAILURE` is **not hooked**.
- `AUTH_LOGOUT` (`session.delete.after`) is **not hooked**.
- `AUTH_PASSWORD_CHANGE` is **not hooked**.

---

### 6. API Route & Query Quirks (`/api/v1/admin/audit-logs`)

In [`app/api/v1/admin/audit-logs/route.ts`](file:///home/tl-wr840n/Documents/Projects/development/tgaw-new/app/api/v1/admin/audit-logs/route.ts#L118):
```typescript
const decoded = decodeCursor(cursor)
if (decoded) {
  where.OR = undefined // BUG: wipes out text search if paginating!
}
```
If an admin searches for an actor or target and clicks "Next Page" with a cursor, the search query is dropped! Cursor pagination should combine cursor filters with the existing `where.OR` instead of deleting it.

---

## Actionable Remediation Plan

### Phase 1: Fix Dead Imports & Implement Missing Slot/Event Auditing

1. **Update [`app/api/v1/events/route.ts`](file:///home/tl-wr840n/Documents/Projects/development/tgaw-new/app/api/v1/events/route.ts)**:
   - Call `logAudit` on event creation with action `EVENT_CREATE`.
   - Include blocked slot count, displaced user IDs, and date/time window in `metadata`.
2. **Update [`app/api/v1/events/[id]/route.ts`](file:///home/tl-wr840n/Documents/Projects/development/tgaw-new/app/api/v1/events/[id]/route.ts)**:
   - Add `logAudit` on `DELETE` (`EVENT_DELETE`) with restored slot details.
3. **Enhance [`app/api/v1/slots/admin-cancel/route.ts`](file:///home/tl-wr840n/Documents/Projects/development/tgaw-new/app/api/v1/slots/admin-cancel/route.ts)**:
   - Read the slot before cancelling to extract `previousBookerId: slot.userId`, `slotType: slot.type`, and `date: slot.date, time: slot.startTime`.
   - Pass this in `metadata` so the admin log shows exactly whose booking was cancelled.
4. **Enhance [`app/api/v1/slots/assign/route.ts`](file:///home/tl-wr840n/Documents/Projects/development/tgaw-new/app/api/v1/slots/assign/route.ts)**:
   - Read the slot before assigning to capture if an existing user was displaced (`previousBookerId`).

---

### Phase 2: Implement RBAC & User Management Audit Hooks

1. **Hook User Role Changes & Bans in Better Auth ([`lib/auth.ts`](file:///home/tl-wr840n/Documents/Projects/development/tgaw-new/lib/auth.ts))**:
   - In `databaseHooks.user.update`:
     - Compare `before` and `after` user data.
     - If `before.role !== after.role`, call `logAudit` with `action: "USER_ROLE_CHANGE"`, `metadata: { before: before.role, after: after.role }`.
     - If `!before.banned && after.banned`, call `logAudit` with `action: "USER_BAN"`, `metadata: { reason: after.banReason, banExpires: after.banExpires }`.
     - If `before.banned && !after.banned`, call `logAudit` with `action: "USER_UNBAN"`.
2. **Extract Active Admin Actor from Context**:
   - In Better Auth hooks, extract the session user from request headers to distinguish the acting admin from the target user.

---

### Phase 3: Connect Group & Moderation Auditing

1. **Activate [`app/api/v1/groups/route.ts`](file:///home/tl-wr840n/Documents/Projects/development/tgaw-new/app/api/v1/groups/route.ts)**:
   - Invoke `logAudit` on `POST` with `action: "GROUP_CREATE"`, `targetType: "Group"`, `targetId: group.id`.
2. **Activate [`app/api/v1/groups/[id]/members/route.ts`](file:///home/tl-wr840n/Documents/Projects/development/tgaw-new/app/api/v1/groups/[id]/members/route.ts)**:
   - Invoke `logAudit` on `POST` with `action: "GROUP_MEMBER_ROLE_CHANGE"`.
3. **Moderation Endpoints**:
   - In [`app/api/v1/posts/[id]/route.ts`](file:///home/tl-wr840n/Documents/Projects/development/tgaw-new/app/api/v1/posts/[id]/route.ts), log `POST_HIDE` / `POST_UNHIDE` when `isHidden` changes.
   - Add `PATCH` to [`app/api/v1/reports/route.ts`](file:///home/tl-wr840n/Documents/Projects/development/tgaw-new/app/api/v1/reports/route.ts) for report resolution with `REPORT_RESOLVE` audit log.

---

### Phase 4: Route Alias & Search Fix

1. **Fix Cursor Pagination in [`app/api/v1/admin/audit-logs/route.ts`](file:///home/tl-wr840n/Documents/Projects/development/tgaw-new/app/api/v1/admin/audit-logs/route.ts)**:
   - Remove `where.OR = undefined` so text search persists across cursor pagination.
2. **Add Route Alias**:
   - Add redirect or page at `app/(dashboard)/admin/audit-logs/page.tsx` forwarding to `/admin/activity-logs`.
