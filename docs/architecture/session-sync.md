# Session and collection synchronization

## Ownership

The auth store owns the account identity. `auth/accountScope.ts` captures its
lifetime for cart, favourites, addresses, orders and profile work. Logout and
account changes invalidate it, including logout followed by signing into the
same account. Same-account token refreshes do not invalidate collection work.
`sessionVersion` separately orders authentication decisions. Neither value stores
credentials.

Command requests carry the expected server user ID. Snapshots also carry their
owner ID. A cookie/session change cannot redirect an old account's command or
make another account's snapshot appear in its UI.

## Confirmed state, pending commands and guest drafts

These are distinct:

- **Confirmed state:** server snapshot and resource revision.
- **Pending command:** immutable intent with an operation ID, expected owner and
  expected revision. Its result may still be unknown.
- **Guest draft:** selections made before sign-in. Rejected drafts are shown
  separately from the account collection and can be corrected or discarded.

`session/syncCommands.ts` is the write gateway for cart, favourites and profile.
It serializes writes per account/resource in this tab. Commands are saved to
browser local storage before dispatch, using a separate key per operation, so a
reload or another tab cannot overwrite a whole pending-operation array. A storage
failure prevents dispatch. A new click gets a new ID at entry, even when its
payload matches an uncertain command or a copied tab shares browser storage.
Only an explicit retry reuses an ID. Wire payloads are frozen before queueing.
Clearing browser data loses this client recovery
journal; it does not undo server changes.

## Server outcomes and retries

The backend synchronization API exposes:

- `GET /api/v1/sync/{resource}`: current owner, revision and snapshot.
- `POST /api/v1/sync/{resource}/operations`: execute or replay a command.
- `GET /api/v1/sync/{resource}/operations/{operationId}`: retrieve an outcome
  if another tab already resolved the local journal entry, with a current snapshot.

Resources are `cart`, `favourites` and `profile`. A database row lock serializes
commands and existing legacy writers. The business write, resource revision and
operation receipt commit in one transaction. The receipt stores a canonical
payload hash, outcome and original applied revision. It does not store credentials.

A command has one of three client-visible outcomes:

| Outcome | Meaning | Client action |
| --- | --- | --- |
| APPLIED | Server confirms the change committed | Accept the current snapshot; remove the journal entry |
| REJECTED | Server confirms validation/revision rejection | Show the reason; correct the intent using a new operation ID |
| UNKNOWN | Response was lost, aborted, malformed or not definitive | Retain the exact command; retry that ID before later writes |

A repeated ID never repeats its business write. Reusing an ID with a different
payload or base revision returns a conflict. Receipt replay returns the **current**
snapshot, rather than an old snapshot that could resurrect subsequently removed
items. A read is never treated as proof that an uncertain write failed.

Independent devices may submit different commands from the same revision. One
can apply; the stale command is explicitly rejected. It is not silently rebased
or allowed to overwrite the newer edit. A retry after reviewing the latest state
is a new intent. Receipts are retained until account deletion; cleanup must not
make an old operation executable again.

## Guest recovery and cart clear

Sign-in freezes the guest merge payload and its operation ID. Account mutations
wait for its outcome. Unknown outcomes keep that same draft/key for recovery.
A definitive rejection detaches the draft and loads the account collection, so
account edits can free capacity or reduce quantities. The review panel allows
removing guest entries, adjusting guest cart quantities, retrying the corrected
draft with a new ID, or discarding it. It retains product names and the account
binding across same-account reloads.

Cart clear captures products at the time of the click, including products in
unresolved earlier adds. It waits for earlier writes and removes by product ID,
so an addition whose server slot ID was lost is still cleared. Products added
after the clear request are preserved.

## One acceptance path for authenticated state

`session/resourceState.ts` owns the latest confirmed snapshot per account and
resource. All reads, command responses, receipt replays and definitive rejections
pass through it. Older revisions cannot replace newer ones. Cart, favourites and
profile stores project these snapshots into the shapes their existing UI needs;
they do not independently merge authenticated server responses.

Authenticated mutations show pending indicators while keeping the last confirmed
values. They publish the server's complete snapshot after confirmation. Guest
changes remain immediate and local. `collectionSync.ts` retains initialization,
request lifetime and pending-write coordination, not per-product merging of
confirmed responses.

Focus, visibility and journal-removal notifications request fresh snapshots,
coalescing overlapping reads. These are freshness hints, not correctness locks:
server ownership, revisions and receipts still protect missed notifications and
simultaneous tabs. Account lifetime guards apply before publishing responses,
including logout followed by signing into the same account. A rejection recovered
from an earlier unknown result is reported, not silently treated as success.

Profile editors capture their initial server revision. A conflict publishes the
latest server profile but preserves the unsaved form. The user can load that
profile or explicitly keep locally edited fields over it and review before
saving. Untouched remote fields survive that choice. Authentication responses
cannot overwrite a newer profile revision. A separate client generation also
protects against older profile reads crossing profile/avatar writes.
Avatar upload/delete retain their existing APIs and cancellation behavior; they
are not general-purpose replayable commands.

Addresses retain their existing scoped/per-ID reconciliation. Creation inserts
by ID so a refresh that already saw the new address does not duplicate it.
Orders and profile counts hide old-account data immediately. These resources
are not covered by the cart/favourites/profile command API.

## Verification and release

`syncCommands.test.ts` covers command outcomes, durability, retries, concurrent
clicks, stale revisions, account changes and immutable wire payloads. The session
regression suites cover initialization, guest recovery, clear, logout, account
switching and refresh. Backend `SyncIntegrationTest` verifies the contract using
real PostgreSQL, including a forced receipt failure that rolls back the cart
write and a concurrent retry that applies once. Permutation tests check monotonic
snapshot acceptance, and recovery tests cover current favourite membership,
copied-tab intent identity and profile conflicts.

`SyncBrowserIntegrationTest` runs real Next.js, the real Spring application and
isolated Testcontainers PostgreSQL/Redis. `e2e/sync-lifecycle.real.mjs` drives Chrome
at desktop and phone sizes. Only response delivery is fault-injected after the
backend commits; API responses are not fabricated. It verifies copied tabs, lost
responses, favourite replay, profile conflict review and guest-cart correction.
Avatar uploads, replacement, deletion and cross-tab refresh also traverse the
real proxy and backend. Storage bytes are served by a local test-only image
server; tests compare the replacement bytes and check the controls at 320px.
Product images and external mail/storage dependencies remain mocked. It does
not test production, external providers or Cloudflare. Instructions live in the
backend's `docs/getting-started.md`; release orchestration belongs to Vault.

Vault's existing release runner requires the regression, type-check and full-stack
browser checks before remote work. Reuse requires matching clean frontend/backend
sources and tool/dependency inputs. A failed or stale result blocks the release.

Release backend migrations/API before the matching frontend. The new sync paths
must be included in Cloudflare API schema coverage before enabling this frontend;
unknown endpoints are blocked there. Runtime/deployment instructions belong to
Vault. Existing legacy APIs remain available for an older frontend rollback.

Avatar upload, activation and deletion advance the profile revision in the same
transaction as their metadata writes. Avatar mutations acquire the profile lock
before the user lock, matching profile edits; failed uploads roll back without
advancing the revision. The private image route includes that revision in its
URL, so a fresh profile snapshot refreshes an already mounted image in another
tab and can retry a previously failed image. Successful upload/removal sends a
scoped storage invalidation hint so other tabs refresh without a reload; the
hint contains no profile data or credentials, and snapshots remain authoritative.
Signed storage URLs remain behind
the same-origin proxy. Avatar actions and feedback occupy normal header layout
space instead of overflowing a fixed-height photo wrapper.
