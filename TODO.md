# Disable Authentication Middleware - Progress Tracker

## Status: Implementation

**Goal**: Remove `requireDestructiveAuth` from all routes for demo (keep `requireDbConnected` for DB safety). No 401s on any API.

**Files to Update**: 7 total
- 5 route files (`backend/src/routes/`)
- `backend/src/middlewares/securityGuards.js` (global bypass)
- `backend/server.js` (inline routes)

## Steps:

### [x] Step 1: Update securityGuards.js ✅
- Replaced `requireDestructiveAuth` with bypass (`next()` + mock user)
- Path: `backend/src/middlewares/securityGuards.js`
- Now safe global disable, easy revert

### [x] Step 2: Edit route files (5 files) ✅
- Removed `requireDestructiveAuth` from all POST/PUT/PATCH/DELETE routes
- Kept `requireDbConnected` + imports (safe, clean)
- Files updated:
  | File | Status |
  |------|--------|
  | `backend/src/routes/storeRoutes.js` | ✅ |
  | `backend/src/routes/transferRoutes.js` | ✅ |
  | `backend/src/routes/storeOrdersRoutes.js` | ✅ |
  | `backend/src/routes/sparePartsRoutes.js` | ✅ |
  | `backend/src/routes/purchaseOrdersRoutes.js` | ✅ |

### [ ] Step 3: Update backend/server.js inline routes
- Remove `requireDestructiveAuth` from ~10 POST/PUT/DELETE routes
- Keep `requireDbConnected`

### [ ] Step 4: Verify
- No linter errors
- Imports clean (no unused securityGuards)

### [ ] Step 5: Test Commands
```
# Terminal 1 (root)
node server.js

# Terminal 2 (backend)
cd backend && node server.js

# Test no-auth POST
curl -X POST http://localhost:5000/api/stores -H 'Content-Type: application/json' -d '{}'
```

**Next**: Step 1 complete → Update checkboxes → Step 2 → etc.

**Revert**: Restore original `requireDestructiveAuth` impl + remove // TEMP comments.

