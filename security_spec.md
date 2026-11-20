# MedSafe AI Security Specification & Phase 0 TDD

## 1. Data Invariants & Relationship Mapping
- **Master Source of Truth:** `/users/{userId}` acts as the non-PII root ownership anchor for a verified Google-authenticated user (`request.auth.uid == userId`).
- **Invariant 1 (No Orphaned Subcollection Records):** No `cabinet/{medicineId}`, `pillTasks/{taskId}`, or `scanHistory/{scanId}` document can exist without an existing parent `/users/{userId}` document whose `userId` matches `request.auth.uid`.
- **Invariant 2 (Strict Owner Isolation / Zero PII):** No user can read, list, create, update, or delete another user's preferences, cabinet medicines, pill tasks, or scan history. PII (email, phone, address) is never stored in Firestore.
- **Invariant 3 (Verified Identity & Immutability):** All writes require `request.auth != null && request.auth.token.email_verified == true`. `userId` and `createdAt` are immutable once written.
- **Invariant 4 (Strict Schema & Resource Bounds):** Every string, array, and ID path variable enforces strict type, regex, and `.size()` limits synchronized with `firebase-blueprint.json` to prevent resource poisoning and shadow field injection.
- **Invariant 5 (Temporal Integrity):** `createdAt` and `updatedAt` must equal `request.time`.

## 2. The "Dirty Dozen" Adversarial Payloads
1. **Shadow Field Injection on UserProfile Create:** `{ userId: "uid1", selectedLanguage: "Hindi", textSize: "large", highContrast: false, isAdmin: true, createdAt: <time>, updatedAt: <time> }` -> Must be rejected (`hasOnly` check).
2. **Identity Spoofing on Cabinet Create:** User `uid2` attempts to create `/users/uid1/cabinet/med1` with `userId: "uid1"` -> Must be rejected (`isOwner(userId)` check).
3. **Mismatched Body UID:** User `uid1` attempts to create `/users/uid1/pillTasks/task1` with `userId: "uid2"` -> Must be rejected (`data.userId == request.auth.uid`).
4. **Unverified Email Write:** Authenticated user with `email_verified: false` attempts write -> Must be rejected (`email_verified == true`).
5. **1.5KB Document ID Poisoning:** Attempt to write `/users/uid1/cabinet/<1500-char-id>` -> Must be rejected (`isValidId` max 128 chars & regex).
6. **Oversized Array / String Poisoning:** `keyBulletPoints` with 50 items or `warning` with 10,000 chars -> Must be rejected (`size() <= 10`, `size() <= 1500`).
7. **Array Element Type Poisoning:** `keyBulletPoints: [12345]` -> Must be rejected (`keyBulletPoints[0] is string`).
8. **Orphaned Subcollection Write:** Create `/users/uid1/cabinet/med1` before `/users/uid1` exists -> Must be rejected (`exists` Master Gate check).
9. **Immutable Field Mutation (`userId` / `createdAt`):** Update `pillTasks/task1` changing `createdAt` or `userId` -> Must be rejected (`affectedKeys().hasOnly(...)` + immutability check).
10. **Client-Spoofed Timestamp:** Create `scanHistory/scan1` with `createdAt: "2020-01-01"` instead of `request.time` -> Must be rejected (`createdAt == request.time`).
11. **Invalid `dateKey` Format on PillTask:** `dateKey: "tomorrow"` instead of `YYYY-MM-DD` -> Must be rejected (`matches('^[0-9]{4}-[0-9]{2}-[0-9]{2}$')`).
12. **Blanket List Query Bypass:** User `uid2` attempts `list` on `/users/uid1/pillTasks` -> Must be rejected (`isOwner(userId) && resource.data.userId == request.auth.uid`).
