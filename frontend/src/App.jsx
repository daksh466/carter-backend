import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import { AppProvider } from "./context/AppContext.jsx";
import Alerts from "./pages/Alerts";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import Inventory from "./pages/Inventory";
import Logistics from "./pages/Logistics";
import MachineDetails from "./pages/MachineDetails";
import Machines from "./pages/Machines";
import IncomingShipments from "./pages/IncomingShipments";
import Orders from "./pages/Orders";
import OutgoingShipments from "./pages/OutgoingShipments";
import Purchases from "./pages/Purchases";
import Reports from "./pages/Reports";
import Shipments from "./pages/Shipments";
import SpareParts from "./pages/SpareParts";
import StoreDetails from "./pages/StoreDetails";
import StoreList from "./pages/StoreList";
import TransferHistory from "./pages/TransferHistory";
import Transfers from "./pages/Transfers";
import TransferTransit from "./pages/TransferTransit";
import Welcome from "./pages/Welcome";

// Error Boundary Component for crash handling
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    console.error("[ErrorBoundary] Caught error:", error);
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[ErrorBoundary] Error details:", { error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          color: "#fff",
          fontFamily: "system-ui, -apple-system, sans-serif",
          flexDirection: "column",
          padding: "20px"
        }}>
          <div style={{ textAlign: "center", maxWidth: 600 }}>
            <h1 style={{ fontSize: 48, fontWeight: 700, marginBottom: 16 }}>⚠️ Application Error</h1>
            <p style={{ fontSize: 16, color: "#cbd5e1", marginBottom: 24 }}>
              Something went wrong. The error has been logged and our team has been notified.
            </p>
            <details style={{ 
              background: "rgba(255,0,0,0.1)", 
              border: "1px solid rgba(255,0,0,0.3)",
              borderRadius: 8,
              padding: 16,
              textAlign: "left",
              marginBottom: 24,
              color: "#fca5a5"
            }}>
              <summary style={{ cursor: "pointer", fontWeight: 600, marginBottom: 8 }}>Error Details</summary>
              <pre style={{ overflow: "auto", fontSize: 12, whiteSpace: "pre-wrap" }}>
                {this.state.error?.toString()}
              </pre>
            </details>
            <button
              onClick={() => {
                console.log("[ErrorBoundary] User clicked reload");
                window.location.href = "/dashboard/welcome";
              }}
              style={{
                padding: "12px 24px",
                background: "#2563eb",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 600,
                transition: "background 0.2s"
              }}
              onMouseEnter={(e) => e.target.style.background = "#1d4ed8"}
              onMouseLeave={(e) => e.target.style.background = "#2563eb"}
            >
              Go to Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard/welcome" replace />} />

            <Route path="/dashboard/welcome" element={<Welcome />} />

            <Route path="/dashboard" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="home" element={<Home />} />
            <Route path="machines" element={<Machines />} />
            <Route path="machines/:id" element={<MachineDetails />} />
            <Route path="spares" element={<SpareParts />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="shipments" element={<Shipments />} />
            <Route path="transfers" element={<Transfers />} />
            <Route path="transfers/transit" element={<TransferTransit />} />
            <Route path="transfer-history" element={<TransferHistory />} />
            <Route path="incoming" element={<IncomingShipments />} />
            <Route path="outgoing" element={<OutgoingShipments />} />
            <Route path="alerts" element={<Alerts />} />
            <Route path="stores" element={<StoreList />} />
            <Route path="stores/:id" element={<StoreDetails />} />
            <Route path="orders" element={<Orders />} />
            <Route path="purchases" element={<Purchases />} />
            <Route path="reports" element={<Reports />} />
            <Route path="logistics" element={<Logistics />} />
          </Route>

          <Route path="/inventory" element={<Navigate to="/dashboard/inventory" replace />} />
          <Route path="/alerts" element={<Navigate to="/dashboard/alerts" replace />} />
          <Route path="*" element={<Navigate to="/dashboard/welcome" replace />} />
        </Routes>
        </BrowserRouter>
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;
