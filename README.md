# Carter A++ - Smart Inventory Management System

A professional full-stack platform for managing inventory, machines, spare parts, and logistics workflows from one operational dashboard.

## 📌 Overview

Carter A++ is built for teams that need accurate stock visibility, reliable movement tracking, and actionable analytics. It combines core warehouse and operations workflows into a single system with a modern web interface.

## ✨ Features

- 📦 Inventory management with live stock monitoring
- 🔩 Spare parts tracking and availability insights
- 🏭 Machine tracking with quantity and warranty visibility
- 🚚 Transfers and shipments flow for incoming/outgoing operations
- 🧪 FEFO batch system (First Expire, First Out)
- 📊 Dashboard analytics for operational decision-making

## 🧱 Tech Stack

### Frontend

- React
- Vite
- JavaScript (ES6+)
- CSS

### Backend

- Node.js
- Express
- Mongoose

### Database

- MongoDB

## 📸 Screenshots

Add screenshots after deployment:

- Dashboard overview (placeholder)
- Inventory module (placeholder)
- Machines module (placeholder)
- Transfers and shipments workflow (placeholder)

## ⚙️ Installation

1. Clone the repository:

```bash
git clone https://github.com/daksh466/carter-A-.git
cd carterA++
```

2. Install root dependencies:

```bash
npm install
```

3. Install backend dependencies:

```bash
cd backend
npm install
```

4. Install frontend dependencies:

```bash
cd ../frontend
npm install
```

## 🔐 Environment Variables

Create these files before running.

### backend/.env

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### frontend/.env

```env
VITE_API_URL=http://localhost:5000/api
```

## ▶️ Run Locally

### Option A: Run backend and frontend separately

Backend:

```bash
cd backend
npm run dev
```

Frontend:

```bash
cd frontend
npm run dev
```

### Option B: Run from project root (if scripts are configured)

```bash
npm run dev
```

## 🚀 Deployment

### Vercel (Frontend)

1. Import repository in Vercel.
2. Set root directory to repository root (`.`), not `frontend`.
3. Keep `vercel.json` at the repo root so rewrites and output directory are applied.
4. Build command (if manually set in Vercel):
   - `npm --prefix frontend run build`
5. Install command (if manually set in Vercel):
   - `npm --prefix frontend ci --no-audit --no-fund`
6. Output directory:
   - `frontend/dist`
7. Set environment variable:
   - `VITE_API_URL=https://your-render-backend-url/api`
8. Deploy.

If your Vercel project root is set to `frontend`, use these instead:
- Build command: `npm install && npm run build`
- Output directory: `dist`
- Rewrites are already defined in `frontend/vercel.json`.

### Render (Backend)

1. Create a new Web Service from this repository.
2. Set root directory to `backend`.
3. Build command:
   - `npm install`
4. Start command:
   - `npm start`
5. Configure environment variables:
   - `PORT`
   - `MONGO_URI`
   - `JWT_SECRET`
   - `CLIENT_URL` (your Vercel domain)
   - `NODE_ENV=production`
6. Deploy.

## 🛣️ Future Improvements

- 🔔 Real-time alert notifications
- 📱 PWA/mobile optimization
- 📈 Demand forecasting and trend analytics
- 🧾 Scheduled export reports (PDF/CSV)
- 👥 Role-based access control and audit trails

## 👨‍💻 Author

Daksh

## 📄 License

MIT License
