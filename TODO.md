# Centralized Error Handling & Logging Implementation Plan

## Progress Tracker

### 1. [ ] Install Dependencies
   - `npm install winston`

### 2. [x] Upgrade logger.js (src/utils/logger.js)
   - Winston structured logging
   - Console + file transports
   - HTTP request logger middleware

### 3. [x] Upgrade errorHandler.js (src/middlewares/errorHandler.js)
   - AppError class
   - Specific error type handling (Validation, Mongo, JWT)
   - Consistent response format
   - Winston logging

### 4. [x] Update server.js
   - Replace morgan with logger.http
   - Remove console.log, use logger
   - Remove deprecated inline endpoints
   - Proper middleware order

### 5. [x] Refactor Controllers (Batch 1/2)\n   - userController.js, orderController.js, inventoryController.js\n   - Remove inline error responses\n   - Use AppError + next(err)

### 6. [ ] Refactor Controllers (Batch 2/2)
   - machineController.js, paymentController.js, sparePartController.js, serviceController.js, connectionController.js
   - Remove inline error responses

### 7. [ ] Update other files if needed
   - auth.js, routes if inline errors

### 8. [ ] Test & Verify
   - `npm test`
   - Manual tests: validation, 404, Mongo error
   - Check structured logs

### 9. [ ] Production Config (Optional)
   - Rotate logs, cloud logging

**Current Status: Starting implementation...**

