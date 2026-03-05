# Application Review System — Implementation Plan

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Application type naming | Keep `attendee` (not `applicant`) | Matches existing schema, questions, profile types. No migration needed. |
| Review storage | Separate `review` table (normalized) | Better for per-reviewer queries, Z-score computation, scalability. Standard Convex pattern. |
| AI scoring execution | Convex action (`"use node"` runtime) | Direct DB access, triggered automatically on submit via scheduler. |
| Reviewer access model | Extend existing `reviewer` role with `review` permissions | Reviewers share the admin layout/sidebar. Less boilerplate. |
| Review queue location | `/admin/review/*` | Shares admin layout which already gates on `adminDashboard:view`. |
| Z-score computation | Compute on read | Simpler schema. Aggregate reviewer stats in the ranking query. |
| Lock expiration | `lockedBy`/`lockedAt` + 5-min TTL | Client renews every 2 minutes. No cron job needed. |
| Scope | Full system | Review + AI + admin ranking dashboard. Complete end-to-end flow. |

---

## Phase 1: Schema & Data Layer

### 1.1 Extend `convex/schema.ts`

**Add fields to existing `application` table:**

```ts
// New fields on the application table
aiScore: v.optional(v.object({
  scores: v.record(v.string(), v.number()),
  total: v.number(),
  summary: v.string(),
  flags: v.array(v.string()),
})),
lockedBy: v.optional(v.string()),
lockedAt: v.optional(v.number()),
bypassDecision: v.optional(v.boolean()),
```

**Add new indexes to `application`:**

- `type_status` — query submitted applications by type
- `lockedBy` — find applications locked by a reviewer

**Create `review` table:**

```ts
review: defineTable({
  applicationId: v.id("application"),
  reviewerId: v.string(),
  scores: v.record(v.string(), v.number()),
  total: v.number(),
  createdAt: v.number(),
})
  .index("applicationId", ["applicationId"])
  .index("reviewerId", ["reviewerId"])
  .index("reviewerId_applicationId", ["reviewerId", "applicationId"]),
```

**Create `applicationFlag` table:**

```ts
applicationFlag: defineTable({
  applicationId: v.id("application"),
  reviewerId: v.string(),
  reason: v.string(),
  details: v.optional(v.string()),
  createdAt: v.number(),
})
  .index("applicationId", ["applicationId"]),
```

### 1.2 Update permissions (`src/lib/permissions.ts`)

Add permission statement:

```ts
review: ["submit", "flag", "bypass"],
```

Update roles:

```ts
reviewer = ac.newRole({
  adminDashboard: ["view"],
  review: ["submit", "flag"],
});

admin = ac.newRole({
  user: [...statement.user],
  adminDashboard: [...statement.adminDashboard],
  review: ["submit", "flag", "bypass"],
});
```

---

## Phase 2: Rubric Configuration (Single Source of Truth)

### 2.1 Create `src/lib/review/rubric.ts`

The `@/` path alias works from Convex files (confirmed: `convex/auth.ts` already imports `@/lib/permissions`), so this file is importable from both frontend and backend.

```ts
export type RubricFieldType = "score" | "boolean" | "select" | "text";

export interface RubricField {
  id: string;
  label: string;
  description?: string;
  type: RubricFieldType;
  scale?: { min: number; max: number; step?: number };
  weight?: number;
  applicationTypes?: ("attendee" | "mentor" | "volunteer")[];
  affectsRanking?: boolean;
}

export const RUBRIC: RubricField[] = [
  {
    id: "effort",
    label: "Effort & Thoughtfulness",
    description: "Did the applicant put care into their responses?",
    type: "score",
    scale: { min: 1, max: 5, step: 1 },
    weight: 1,
    affectsRanking: true,
  },
  {
    id: "motivation",
    label: "Motivation & Growth Mindset",
    description: "Do they genuinely want to learn and grow?",
    type: "score",
    scale: { min: 1, max: 5, step: 1 },
    weight: 1,
    affectsRanking: true,
  },
  {
    id: "communityFit",
    label: "Community Fit",
    description: "Do they seem collaborative and respectful?",
    type: "score",
    scale: { min: 1, max: 5, step: 1 },
    weight: 1,
    affectsRanking: true,
  },
];
```

### 2.2 Create `src/lib/review/scoring.ts`

Utility functions shared by frontend and backend:

- `computeWeightedTotal(scores: Record<string, number>, rubric: RubricField[]): number` — sums `score * weight` for ranking fields
- `getRubricForType(type: "attendee" | "mentor" | "volunteer"): RubricField[]` — filters rubric by applicationTypes
- `getRankingFields(rubric: RubricField[]): RubricField[]` — filters to `affectsRanking === true && type === "score"`

### 2.3 Create `src/lib/review/z-score.ts`

Z-score normalization utilities:

- `computeReviewerStats(totals: number[]): { mean: number; stddev: number }` — mean and standard deviation
- `computeZScore(total: number, mean: number, stddev: number): number` — returns Z-score; returns 0 if stddev === 0
- `normalizeApplicationScore(reviews: { reviewerId: string; total: number }[], reviewerStatsMap: Map<string, { mean: number; stddev: number; count: number }>): number` — computes final normalized score: if reviewer has < 10 reviews use raw average, otherwise average the Z-scores

### 2.4 Create `src/lib/review/index.ts`

Barrel export for all review modules.

---

## Phase 3: Backend Functions (Convex)

### 3.1 Create `convex/fn/review.ts`

**Queries:**

#### `getReviewQueue(type)`

Returns submitted applications for the given type that:

- Have `status === "submitted"`
- Are not bypassed (`bypassDecision` is not set)
- Are not locked by another reviewer (or lock expired > 5 min)
- Have not been reviewed by the current reviewer

Sorting:
- If AI scoring is enabled and `aiScore` exists: sort by `aiScore.total` descending, randomize within narrow score bands (e.g., +/- 0.5)
- If no AI score: FIFO by `submittedAt` ascending

Returns per application:
- `_id`, `type`, `submittedAt`
- `aiScore.total` (if exists)
- Review count (from `review` table)
- Flag count (from `applicationFlag` table)
- Lock status

#### `getApplicationForReview(applicationId)`

Returns (data-leakage safe):
- Application answers
- AI score (read-only, if exists)
- Current reviewer's own past review (if exists)
- Flags on this application
- Application type

Does NOT return:
- Other reviewers' scores
- Z-scores or ranking position
- Reviewer IDs or statistics

#### `getMyReviewStats()`

Returns the current reviewer's:
- Total review count
- Reviews per application type

**Mutations:**

#### `lockApplication(applicationId)`

- Sets `lockedBy = userId`, `lockedAt = Date.now()`
- Fails if already locked by another user and lock is < 5 minutes old
- If lock is stale (> 5 min), overwrite it

#### `renewLock(applicationId)`

- Updates `lockedAt = Date.now()`
- Only succeeds if `lockedBy === userId`

#### `unlockApplication(applicationId)`

- Clears `lockedBy` and `lockedAt`
- Only succeeds if `lockedBy === userId` (or lock is expired)

#### `submitReview(applicationId, scores)`

1. Validates scores against rubric (correct field IDs, within scale range)
2. Computes weighted total via `computeWeightedTotal()`
3. Inserts row into `review` table
4. Unlocks the application

#### `skipApplication(applicationId)`

- Unlocks the application
- No review stored

#### `flagApplication(applicationId, reason, details?)`

- Inserts into `applicationFlag` table
- Predefined reasons: `"dietary_followup"`, `"suspicious"`, `"incomplete_promising"`, `"other"`
- Optional `details` text
- Does NOT affect decision

#### `bypassAccept(applicationId)`

- Requires bypass permission (admin only)
- Sets `decision: { status: "accepted", at: Date.now(), by: userId }`
- Sets `bypassDecision: true`
- Unlocks the application

#### `bypassReject(applicationId)`

- Same as above with `status: "rejected"`

### 3.2 Create `convex/fn/admin.ts`

**Queries (admin only — check permissions in handler):**

#### `getRankingDashboard(type)`

For all submitted applications of the given type:

1. Fetch all reviews from `review` table
2. Group reviews by reviewer, compute per-reviewer stats (mean, stddev, count)
3. For each application:
   - Compute raw average of human review totals
   - Compute normalized score (Z-score average using reviewer stats; fallback to raw average if reviewer has < 10 reviews; fallback to 0 if stddev === 0)
   - Include AI score total (if exists)
   - Include review count, flag count
   - Include decision status and bypass status
4. Exclude bypassed applications from main ranking
5. Sort by normalized score descending
6. Return all data for the table view

#### `getApplicationDetail(applicationId)`

Full admin view:
- All reviews (with reviewer identifiers)
- All flags
- AI score details
- Normalization details (per-review Z-scores)
- Decision history

#### `getReviewerOverview()`

Lists all reviewers with:
- Review count per type
- Average score given
- Last review timestamp

**Mutations (admin only):**

#### `setDecisions(applicationIds[], decision)`

- Bulk set `decision: { status, at, by }` on multiple applications
- Validates that each application has >= 2 human reviews (or warn)
- `decision` is one of `"accepted" | "rejected" | "waitlist"`

---

## Phase 4: AI Pre-Scoring

### 4.1 Create `convex/fn/ai.ts`

Uses `"use node"` runtime for Vercel AI SDK + OpenRouter access.

**Internal action: `scoreApplication(applicationId)`**

1. Read the application document (answers, type)
2. Get rubric fields for the application type
3. Construct a system prompt that:
   - Defines the scoring rubric with field descriptions and scales
   - Instructs to evaluate effort, motivation, community fit
   - Explicitly forbids evaluating grammar quality, hackathon count, writing sophistication, prestige signals
   - Requests structured JSON output
4. Construct a user prompt with the application answers
5. Call OpenRouter via Vercel AI SDK with structured output / JSON mode
6. Validate the response against expected schema
7. Compute total
8. Patch the application document with `aiScore: { scores, total, summary, flags }`

### 4.2 Environment Variables

Add to Convex environment (via `npx convex env set`):

```
ENABLE_AI_PRESCORE=false
OPENROUTER_API_KEY=<key>
```

### 4.3 Trigger on Submit

Modify `convex/fn/application.ts` `submitMyApplication`:

After successful submit, check if `ENABLE_AI_PRESCORE === "true"`:
- If yes: `ctx.scheduler.runAfter(0, internal.fn.ai.scoreApplication, { applicationId })`
- If no: skip

---

## Phase 5: Review UI

### 5.1 Update Admin Sidebar

**File:** `src/components/admin-sidebar.tsx`

Add nav items:

```ts
{
  title: "Review",
  href: "/admin/review",
  icon: ClipboardCheck,
  match: "prefix",
},
{
  title: "Ranking",
  href: "/admin/ranking",
  icon: BarChart3,
},
```

### 5.2 Review Queue Landing — `/admin/review/page.tsx`

Three bucket cards:

| Card | Link | Shows |
|------|------|-------|
| Review Attendees | `/admin/review/attendee` | Pending count / Total submitted |
| Review Mentors | `/admin/review/mentor` | Pending count / Total submitted |
| Review Volunteers | `/admin/review/volunteer` | Pending count / Total submitted |

### 5.3 Review Bucket Queue — `/admin/review/[type]/page.tsx`

Queue view for a specific application type:

- List of applications available for review
- Each row shows: submitted date, AI score (if exists), review count, flag count, lock status
- Click any row → navigate to `/admin/review/[type]/[applicationId]`
- "Start Reviewing" button → auto-assigns the next unlocked application
- Filter: show all / unreviewed only / flagged only

### 5.4 Individual Review Page — `/admin/review/[type]/[applicationId]/page.tsx`

The core review experience. Optimized for < 60 seconds per review.

**Layout: Two-panel (responsive)**

**Left panel — Application responses:**
- Renders applicant's answers using question config (read-only `ApplicationResponseView`)
- AI score card below answers (if AI scoring enabled), read-only
- Existing flags displayed if any

**Right panel — Rubric scoring form:**
- One `RubricScoreField` per rubric field (1-5 scale, large click targets)
- Live weighted total preview
- Action buttons at bottom:
  - **Submit** (primary) — submits review, auto-loads next application
  - **Skip** — unlocks, loads next
  - **Flag** — opens `FlagDialog` with predefined reasons + optional custom text
  - **Bypass Accept** (admin only, destructive) — immediately accepts
  - **Bypass Reject** (admin only, destructive) — immediately rejects

**Locking behavior:**
- On page mount: call `lockApplication` mutation
- Every 2 minutes: call `renewLock` mutation (via `setInterval`)
- On submit / skip / navigate away: call `unlockApplication`
- `beforeunload` + `visibilitychange` as best-effort cleanup
- If lock fails (already locked by another reviewer): show message, redirect to queue

**Keyboard shortcuts (future nice-to-have):**
- 1-5 for scoring current field
- Tab to next field
- Enter to submit

### 5.5 Review Components — `src/components/review/`

| Component | Purpose |
|-----------|---------|
| `rubric-score-field.tsx` | Individual rubric field input — row of 5 buttons (1-5), label, description |
| `rubric-form.tsx` | Full rubric form — maps over rubric fields, shows total, wraps submit logic |
| `application-response-view.tsx` | Read-only rendering of applicant answers (reuses question config for labels) |
| `ai-score-display.tsx` | Read-only AI score card — shows per-field scores, total, summary, flags |
| `flag-dialog.tsx` | Dialog with radio group for predefined reasons + textarea for custom details |
| `review-header.tsx` | Shows application type badge, review count, flag count, lock status |
| `review-actions.tsx` | Submit / Skip / Flag / Bypass buttons with proper permission gating |

---

## Phase 6: Admin Ranking Dashboard

### 6.1 Ranking Page — `/admin/ranking/page.tsx`

**Top: Statistics panel**
- Total applications per type
- Reviewed / unreviewed counts
- Average reviews per application
- Reviewer activity summary (who reviewed how many)

**Main: Ranking table**

Columns:
- Rank (#)
- Applicant identifier (anonymized or name — configurable by admin toggle)
- Type (attendee / mentor / volunteer)
- Raw Average Score
- Normalized Score (Z-score average)
- AI Score (if exists)
- Review Count
- Flag Count
- Decision Status (badge: undecided / accepted / rejected / waitlisted / bypassed)
- Actions (Accept / Reject / Waitlist buttons)

**Features:**
- Filter by application type (tabs or dropdown)
- Filter by decision status
- Sort by normalized score (default), raw average, AI score, review count
- Bulk select (checkboxes) + bulk decision button
- Warning badge if application has < 2 human reviews
- Bypassed applications shown in a separate section (below or in a tab)

### 6.2 Application Detail Modal/Page

Accessible from ranking table row click:
- Full application answers
- All individual reviews (scores per field, total, reviewer identifier)
- AI score breakdown
- Flags with reasons
- Per-review Z-scores
- Timeline of events (submitted, reviewed, flagged, decided)

---

## Phase 7: Integration & Wiring

### 7.1 Trigger AI Scoring on Submit

**File:** `convex/fn/application.ts`

In `submitMyApplication`, after patching status to `"submitted"`:

```ts
const aiEnabled = process.env.ENABLE_AI_PRESCORE === "true";
if (aiEnabled) {
  await ctx.scheduler.runAfter(0, internal.fn.ai.scoreApplication, {
    applicationId: existing._id,
  });
}
```

### 7.2 Update User Dashboard

**File:** `src/app/(authenticated)/dashboard/page.tsx`

In the application status widget, show the decision if one exists:
- "Accepted" — green badge
- "Rejected" — red badge
- "Waitlisted" — yellow badge
- "Under Review" — neutral badge (submitted but no decision)

### 7.3 Sidebar Updates

Already covered in Phase 5.1.

---

## File Summary

### New Files

| File | Purpose |
|------|---------|
| `src/lib/review/rubric.ts` | Rubric types and configuration (single source of truth) |
| `src/lib/review/scoring.ts` | Weighted total computation utilities |
| `src/lib/review/z-score.ts` | Z-score normalization utilities |
| `src/lib/review/index.ts` | Barrel export |
| `convex/fn/review.ts` | Review queries and mutations (lock, submit, skip, flag, bypass) |
| `convex/fn/admin.ts` | Admin-only queries and mutations (ranking, detail, bulk decisions) |
| `convex/fn/ai.ts` | AI pre-scoring Convex action |
| `src/app/(admin)/admin/review/page.tsx` | Review queue landing (3 bucket cards) |
| `src/app/(admin)/admin/review/[type]/page.tsx` | Review queue for a specific type |
| `src/app/(admin)/admin/review/[type]/[applicationId]/page.tsx` | Individual review page |
| `src/app/(admin)/admin/ranking/page.tsx` | Admin ranking dashboard |
| `src/components/review/rubric-score-field.tsx` | Individual rubric field input (1-5 buttons) |
| `src/components/review/rubric-form.tsx` | Full rubric scoring form |
| `src/components/review/application-response-view.tsx` | Read-only application answers display |
| `src/components/review/ai-score-display.tsx` | Read-only AI score card |
| `src/components/review/flag-dialog.tsx` | Flag dialog with predefined reasons |
| `src/components/review/review-header.tsx` | Review page header (type, counts, status) |
| `src/components/review/review-actions.tsx` | Action buttons (submit, skip, flag, bypass) |

### Files to Modify

| File | Changes |
|------|---------|
| `convex/schema.ts` | Add `review` table, `applicationFlag` table; extend `application` with `aiScore`, `lockedBy`, `lockedAt`, `bypassDecision` fields + new indexes |
| `src/lib/permissions.ts` | Add `review` permission statements; update `reviewer` and `admin` roles |
| `convex/fn/application.ts` | Trigger AI scoring action on submit (scheduler) |
| `src/components/admin-sidebar.tsx` | Add "Review" and "Ranking" nav items |
| `src/app/(authenticated)/dashboard/page.tsx` | Show decision status in application widget |

### Environment Variables to Add

| Variable | Where | Default |
|----------|-------|---------|
| `ENABLE_AI_PRESCORE` | Convex env (`npx convex env set`) | `"false"` |
| `OPENROUTER_API_KEY` | Convex env (`npx convex env set`) | — |

---

## Implementation Order

Execute phases in this sequence to minimize blocked work:

```
Phase 1 ──► Phase 2 ──► Phase 3 ──► Phase 5 ──► Phase 7
  Schema      Rubric      Backend      Review UI    Wiring
                            │
                            ▼
                         Phase 4 ──────────────────►
                          AI Scoring
                            │
                            ▼
                         Phase 6
                          Ranking Dashboard
```

**Step-by-step:**

1. **Phase 1.1** — Schema changes (`convex/schema.ts`) — everything depends on this
2. **Phase 1.2** — Permissions update (`src/lib/permissions.ts`)
3. **Phase 2** — Rubric config + scoring + Z-score utilities (`src/lib/review/`)
4. **Phase 3.1** — Review backend functions (`convex/fn/review.ts`)
5. **Phase 5.1** — Admin sidebar update
6. **Phase 5.2-5.3** — Review queue pages
7. **Phase 5.4-5.5** — Individual review page + components
8. **Phase 4** — AI pre-scoring action (`convex/fn/ai.ts`)
9. **Phase 3.2** — Admin backend functions (`convex/fn/admin.ts`)
10. **Phase 6** — Ranking dashboard UI
11. **Phase 7** — Integration wiring (AI trigger, dashboard status)

---

## Bias & Data Leakage Checklist

These constraints must be enforced in the backend queries (Phase 3):

- [ ] Reviewers cannot see other reviewers' scores
- [ ] Reviewers cannot see Z-score values
- [ ] Reviewers cannot see ranking position
- [ ] Reviewers cannot see reviewer IDs or statistics
- [ ] Reviewers can only see: application answers, AI score (read-only), their own past review, flags
- [ ] School name is hidden from reviewers (strip from answers if present)
- [ ] AI summary is shown after reviewer submits their score (not before) — optional, configurable
- [ ] Applications within same AI score band are randomized in queue
- [ ] Minimum 2 human reviews required before admin can set a decision (warn if not met)
- [ ] Normalization metrics never exposed to reviewer-role users
