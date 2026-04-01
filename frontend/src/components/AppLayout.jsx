import React, { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import useApp from "../hooks/useApp";
import {
  AlertTriangle,
  Boxes,
  ChevronLeft,
  Gauge,
  GitCompareArrows,
  Menu,
  PackageSearch,
  PackageCheck,
  Store,
  ArrowRightLeft,
  Warehouse,
  ChevronRight,
  ChevronLeft as ChevronLeftIcon,
} from "lucide-react";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: Gauge },
  { to: "/dashboard/machines", label: "Machines", icon: Boxes },
  { to: "/dashboard/spares", label: "Spare Parts", icon: PackageSearch },
  { to: "/dashboard/inventory", label: "Inventory", icon: Warehouse },
  { to: "/dashboard/shipments", label: "Shipments", icon: GitCompareArrows },
  { to: "/dashboard/transfers", label: "Transfers", icon: ArrowRightLeft },
  { to: "/dashboard/transfers/transit", label: "Confirm Transfers", icon: PackageCheck },
  { to: "/dashboard/alerts", label: "Alerts", icon: AlertTriangle },
  { to: "/dashboard/stores", label: "Stores", icon: Store },
];

const AppLayout = () => {
  const { toggleTheme } = useApp();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const closeSidebar = () => setMobileSidebarOpen(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-100 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
      {/* Sidebar */}
      <aside
        className={`relative z-40 transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? "w-0" : "w-64"
        } bg-gradient-to-b from-white to-slate-100 dark:from-slate-900 dark:to-slate-950 border-r border-slate-200 dark:border-slate-800`}
      >
        <div className="saas-sidebar-header flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-800">
          <div className="saas-brand-wrap flex items-center gap-3">
            <div className="saas-brand-dot w-3 h-3 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 shadow-lg" />
            <h2 className="saas-brand text-xl font-bold tracking-tight text-slate-900 dark:text-white">Carter A++</h2>
          </div>
          <button
            className="saas-sidebar-close rounded-lg p-1 transition-colors hover:bg-slate-200 dark:hover:bg-slate-800"
            onClick={() => setSidebarCollapsed(true)}
            aria-label="Collapse sidebar"
          >
            <ChevronLeftIcon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          </button>
        </div>

        <nav className="saas-nav p-4 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/dashboard"}
                className={({ isActive }) =>
                  `saas-nav-link group flex items-center gap-3 rounded-xl border p-3 transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-blue-200/70 to-cyan-100/70 text-slate-900 border-blue-300/70 shadow-sm dark:from-blue-500/20 dark:to-cyan-500/20 dark:border-blue-400/40 dark:text-white dark:shadow-lg"
                      : "border-transparent text-slate-600 hover:bg-slate-200/70 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-white"
                  }`
                }
                onClick={closeSidebar}
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={18}
                      className={isActive ? "text-slate-900 dark:text-white" : "group-hover:scale-110"}
                    />
                    <span className="font-medium text-sm">{link.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="saas-topbar sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/80 p-4 backdrop-blur-sm transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <button
              className="saas-mobile-toggle rounded-xl border border-slate-300 bg-white p-2 text-slate-700 transition-all hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white md:hidden"
              onClick={() => setMobileSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu size={18} />
            </button>

            {!sidebarCollapsed && (
              <button
                className="hidden h-10 w-10 items-center justify-center rounded-xl border border-slate-300 bg-white p-2 text-slate-700 transition-all hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white md:flex"
                onClick={() => setSidebarCollapsed(true)}
                aria-label="Collapse sidebar"
              >
                <ChevronLeftIcon size={18} />
              </button>
            )}
            {sidebarCollapsed && (
              <button
                className="hidden h-10 w-10 items-center justify-center rounded-xl border border-blue-500 bg-blue-600/90 p-2 text-white transition-all hover:bg-blue-500 hover:shadow-xl md:flex"
                onClick={() => setSidebarCollapsed(false)}
                aria-label="Expand sidebar"
              >
                <ChevronRight size={18} />
              </button>
            )}
            <div className="saas-topbar-actions flex items-center gap-2">
              <button
                className="saas-theme-toggle rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-all hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
                onClick={toggleTheme}
              >
                Toggle Theme
              </button>
            </div>
          </div>
          <div className="text-center">
            <h1 className="saas-title bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-2xl font-black text-transparent dark:from-slate-100 dark:to-slate-300">
              Operations Console
            </h1>
            <p className="saas-subtitle mt-1 text-sm text-slate-500 dark:text-slate-400">
              Live operations, inventory, and performance overview
            </p>
          </div>
          <div className="w-20" /> {/* Spacer for balance */}
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-0 md:p-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden"
          onClick={closeSidebar}
          aria-label="Close sidebar overlay"
        />
      )}
    </div>
  );
};

export default AppLayout;

