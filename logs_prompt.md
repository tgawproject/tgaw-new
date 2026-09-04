# Audit Logging System — Design & Implementation Prompt

> Design and implement a logging/audit system for **The Global Altar Watch (TGAW)** — a Christian community social media app built on **Next.js 16 (App Router), TypeScript, Prisma ORM on MongoDB Atlas, Better Auth (RBAC), and Zod**.
>
> The application has the following Prisma models:
>
> - **Auth & Identity**: `User` (with five-tier `Role`: `member`, `coordinator`, `board`, `leader`, `superadmin`), `Session`, `Account`, `Verification`, `UserProfile`
> - **Booking System**: `Slot` (30-min devotional time slots per type/date — BIBLE, PRAYER, PRAISE_WORSHIP), `MeetingLink` (Zoom/Teams URLs per type/date), `BookingConfig` (global limits, visibility mode, live grid settings), `Event` (special events that can block slots), `EventBooking`
> - **Social & Content**: `Post` (13 types including SERMON, ARTICLE, PRAYER_REQUEST, TESTIMONIAL, PRAISE_REPORT, etc.), `Comment`, `Like`, `Poll`, `PollOption`, `Follow`
> - **Messaging**: `Conversation`, `Message`, `Group`, `GroupMember`
> - **Moderation & Admin**: `Report` (POST/COMMENT/USER targets), `Broadcast`, `Notification`, `PushSubscription`, `CoordinatorAssignment`
> - **Misc**: `Presence`, `VerseOfDay`
>
> All core mutations go through decoupled REST endpoints under `app/api/v1/*`. Route protection is handled in `proxy.ts` (not middleware.ts). Auth is via Better Auth configured in `lib/auth.ts`.

---

## Requirements

### 1. Schema

Propose a Prisma model (e.g. `AuditLog`) capturing:
- **Actor**: user ID + role at time of action (plain `String`, not `@db.ObjectId`, since `User.id` is a Better Auth random string)
- **Action**: a structured action name (e.g. `SLOT_ADMIN_CANCEL`, `USER_ROLE_CHANGE`, `POST_HIDE`)
- **Target**: entity type + entity ID (e.g. `Slot` + `ObjectId`)
- **Timestamp**: `createdAt`
- **Diff / metadata**: a `Json` field for before/after values, request context (IP, user agent), or action-specific details
- **Request context**: IP address, user agent (available from Better Auth session)

The model must follow the project's MongoDB ID conventions: use `@id @default(auto()) @map("_id") @db.ObjectId` for the log's own ID, and plain `String` for `actorId` (since User IDs are Better Auth strings).

### 2. Scope — Which Actions to Log

Suggest which actions should be logged for accountability and traceability. At minimum:

#### RBAC-Sensitive Actions
- Role changes (`member` → `coordinator`, `coordinator` → `leader`, etc.) via `/api/v1/admin/users`
- User banning / unbanning (setting `banned`, `banReason`, `banExpires`)
- Coordinator timezone assignments (`CoordinatorAssignment` CRUD) via `/api/v1/admin/coordinator-assignments`
- Any `superadmin`-only or `leader`-only action

#### Booking System Admin Actions
- **Admin slot cancellation** — `/api/v1/slots/admin-cancel` (leader/superadmin forcibly cancels a member's booking)
- **Slot assignment** — `/api/v1/slots/assign` (leader assigns a slot to a specific user, sets `assignedBy`)
- **Special event creation/deletion** — `/api/v1/events` (SPECIAL events that block slot ranges, displacing existing bookings via `previousBookerId`)
- **BookingConfig changes** — `/api/v1/slots/config` PUT (changing `maxBibleSlotsPerDay`, `maxPrayerSlotsPerDay`, `maxWorshipSlotsPerDay`, `visibilityMode`, `liveGridUpcoming`)
- **Meeting link management** — `/api/v1/slots/meeting-link` (creating/updating/deleting Zoom links)
- **Slot generation** — `/api/v1/slots/generate` (bulk-generating the 48 daily slots)

#### Auth Events
- Login success / failure (Better Auth hooks)
- Session creation and expiry
- Account linking/unlinking (OAuth providers)
- Password changes

#### Content Moderation
- Post hide/unhide (`isHidden` toggle by leader/superadmin) — `/api/v1/posts/[id]` PATCH
- Comment hide/unhide (`isHidden` toggle) — `/api/v1/posts/[id]/comments` PATCH
- Report resolution (`OPEN` → `RESOLVED`) — `/api/v1/reports`
- Broadcast creation — `/api/v1/admin` or Broadcast model mutations

#### Other Sensitive Actions
- Group creation/deletion and membership role changes (owner/moderator/member)
- User profile updates (self-service, but useful for audit trail)
- Notification preference changes

### 3. Access Control on the Logs

Who can read audit logs? Propose role-gated access:
- `superadmin`: full read access to all audit logs
- `leader`: read access to logs within their scope (booking actions, content moderation, but not user role changes)
- `coordinator` / `board` / `member`: no direct access

Should there be an API endpoint (e.g. `/api/v1/admin/audit-logs`) and/or an admin UI page (e.g. `/admin/audit-logs`)? Consider:
- Filtering by actor, action type, target entity, date range
- Pagination (cursor-based, since MongoDB)

### 4. Implementation Approach

Recommend one of:
- **A) Prisma middleware / client extension** — intercepts all `create`, `update`, `delete` calls automatically
- **B) Explicit `logAudit()` utility calls** at each mutation site (in route handlers / server actions)
- **C) Hybrid** — explicit for high-value actions, middleware for catch-all

Explain the tradeoff for this specific codebase where:
- Mutations happen in both `/api/v1/*` route handlers AND `actions/*.ts` server actions
- Not every mutation is audit-worthy (e.g. `Presence` heartbeats, `readBy` array updates on messages)
- Before/after diffs are important for config changes and role changes
- Better Auth manages its own `User`/`Session`/`Account` writes (hooks available)

### 5. Retention & Volume

Given MongoDB Atlas storage:
- Estimate daily log volume (active community of ~500–2000 users)
- Suggest a TTL index or capped collection strategy (e.g. 90 days for routine logs, indefinite for RBAC/ban actions)
- Pagination approach: cursor-based using `createdAt` + `_id` for the admin UI

---

## Expected Output

1. **Prisma schema addition**: The `AuditLog` model (and any supporting enums) to add to `prisma/schema.prisma`
2. **Logging utility**: `lib/services/auditService.ts` — the `logAudit()` function with typed action names, diff capture, and request context extraction
3. **Integration points**: A complete list of which existing route files and server actions need a `logAudit()` call added, with the specific action name for each
4. **API endpoint**: `/api/v1/admin/audit-logs` route with role-gated access, filtering, and cursor pagination
5. **Better Auth hook**: How to tap into auth events (login, failed login, session) for logging
6. **Retention script**: A MongoDB TTL index setup (similar to the existing `scripts/presence-ttl.ts` pattern)
