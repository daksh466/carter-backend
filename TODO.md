# API Error Fix Plan - Progress Tracker

## Plan Summary
Fix 404/401 errors on Render deploy by:
1. Remove auth from read-only `/api/orders` GET
2. Add missing fallback `/api/inventory/alerts` 
3. Ensure `/api/stores`, `/api/transfers`, `/api/purchase-orders` public
4. Test/deploy

## TODO Steps ⬜
✅ 1. Read `backend/src/routes/storeOrdersRoutes.js`
✅ 2. Edited `backend/src/routes/storeOrdersRoutes.js` → Made GET `/api/orders` public (no auth)
✅ 3. Edited `backend/server.js` → Added `/api/inventory/alerts` fallback + confirmed routes public

✅ 4. Tested locally → Backend running on port 5000, APIs return 200 OK (orders, stores, transfers, purchase-orders, alerts, inventory/alerts)

## TODO Steps ⬜
- [ ] 5. `git add . && git commit -m "fix(api-errors): resolve 404/401 on Render deploy" && git push origin main`
- [ ] 6. Verify https://carter-a.onrender.com → no console errors
- [ ] 7. `attempt_completion` ✅
- [ ] 5. `git commit && git push` → auto-deploy Render
- [ ] 6. Verify no console errors on prod site
- [ ] 7. `attempt_completion` ✅

**Current: Step 1 (read file)**

*Updated: $(date)*

