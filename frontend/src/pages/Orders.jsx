import React, { useState, useMemo } from "react";
import { useApp } from "../hooks/useApp";
import AddOrderModal from "../components/AddOrderModal";
import { deleteOrder } from "../services/api";

const Orders = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { orders, ordersSummary, ordersLoading, ordersError } = useApp();
  const [deletingOrderId, setDeletingOrderId] = useState(null);

  const safeNumber = (value) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : 0;
  };

  const formatAmount = (value) => safeNumber(value).toLocaleString("en-IN");

  const formatDate = (value) => {
    if (!value) return "N/A";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "N/A";
    return date.toLocaleString("en-IN");
  };

  const getOrderId = (order) => order?.id || order?._id || "";

  const handleDeleteOrder = async (orderId) => {
    if (!orderId) return;
    if (!window.confirm("Are you sure you want to delete this order?")) return;

    setDeletingOrderId(orderId);
    const result = await deleteOrder(orderId);
    if (result.success) {
      window.location.reload();
    } else {
      alert("Failed to delete order: " + (result.error || "Unknown error"));
    }
    setDeletingOrderId(null);
  };

  const [paymentFilter, setPaymentFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date-new");

  const filteredOrders = useMemo(() => {
    let result = Array.isArray(orders) ? [...orders] : [];

    if (paymentFilter !== "all") {
      result = result.filter((order) => order?.paymentStatus === paymentFilter);
    }

    if (searchTerm.trim()) {
      result = result.filter((order) =>
        String(order?.customerName || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
    }

    if (sortBy === "date-new") {
      result.sort((a, b) => new Date(b?.orderDate || 0) - new Date(a?.orderDate || 0));
    } else if (sortBy === "date-old") {
      result.sort((a, b) => new Date(a?.orderDate || 0) - new Date(b?.orderDate || 0));
    } else if (sortBy === "amount-high") {
      result.sort((a, b) => safeNumber(b?.totalAmount) - safeNumber(a?.totalAmount));
    } else if (sortBy === "amount-low") {
      result.sort((a, b) => safeNumber(a?.totalAmount) - safeNumber(b?.totalAmount));
    }

    return result;
  }, [orders, paymentFilter, searchTerm, sortBy]);

  if (ordersLoading) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] w-full flex-col items-center justify-center px-6 py-8 transition-colors duration-300">
        <div className="mb-4 text-5xl">⏳</div>
        <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100">Loading Orders...</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">Fetching order data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] w-full px-6 py-8 transition-colors duration-300">
      <div className="mx-auto mb-8 flex w-full max-w-6xl flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="mb-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Orders</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Manage all orders and track payment status</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-300 hover:bg-blue-700"
        >
          + Create Order
        </button>
      </div>

      {ordersError && (
        <div className="mx-auto mb-6 w-full max-w-6xl rounded-lg border border-red-300 bg-red-50 p-4 text-center text-red-800 dark:border-red-700 dark:bg-red-900/30 dark:text-red-200">
          <strong>⚠️ Warning:</strong> {ordersError}
        </div>
      )}

      <div className="mx-auto mb-8 grid w-full max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-md transition-colors duration-300 dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-2 text-xs text-gray-600 dark:text-gray-400">Total Orders</div>
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-300">{safeNumber(ordersSummary?.total)}</div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-md transition-colors duration-300 dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-2 text-xs text-gray-600 dark:text-gray-400">Paid</div>
          <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-300">{safeNumber(ordersSummary?.paid)}</div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-md transition-colors duration-300 dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-2 text-xs text-gray-600 dark:text-gray-400">Pending</div>
          <div className="text-3xl font-bold text-rose-600 dark:text-rose-300">{safeNumber(ordersSummary?.pending)}</div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-md transition-colors duration-300 dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-2 text-xs text-gray-600 dark:text-gray-400">Total Amount</div>
          <div className="text-3xl font-bold text-amber-600 dark:text-amber-300">₹{formatAmount(ordersSummary?.totalAmount)}</div>
        </div>
      </div>

      <div className="mx-auto mb-6 grid w-full max-w-6xl grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">Search by Customer</label>
          <input
            type="text"
            placeholder="Search by customer"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors duration-300 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">Payment Status</label>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="w-full cursor-pointer rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 transition-colors duration-300 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
          >
            <option value="all">All Orders</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full cursor-pointer rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 transition-colors duration-300 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
          >
            <option value="date-new">Newest First</option>
            <option value="date-old">Oldest First</option>
            <option value="amount-high">Highest Amount</option>
            <option value="amount-low">Lowest Amount</option>
          </select>
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl">
        {filteredOrders.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-md transition-colors duration-300 dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-4 text-5xl">📭</div>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {searchTerm || paymentFilter !== "all" ? "No orders match your filters" : "No data found"}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredOrders?.map((order, index) => {
              const orderId = getOrderId(order);
              const machines = Array.isArray(order?.machines) ? order.machines : [];

              return (
                <div
                  key={orderId || `order-${index}`}
                  className="relative rounded-xl border border-gray-200 bg-white p-5 shadow-md transition-colors duration-300 dark:border-gray-700 dark:bg-gray-800"
                >
                  <button
                    onClick={() => handleDeleteOrder(orderId)}
                    disabled={!orderId || deletingOrderId === orderId}
                    className="absolute right-3 top-3 rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors duration-300 hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {deletingOrderId === orderId ? "Deleting..." : "Delete"}
                  </button>

                  <div className="mb-4 grid grid-cols-1 gap-4 border-b border-gray-200 pb-4 md:grid-cols-[1fr_auto] dark:border-gray-700">
                    <div>
                      <div className="mb-2 flex flex-wrap items-center gap-3">
                        <div className="text-sm font-bold text-gray-900 dark:text-gray-100">{orderId || "N/A"}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">{formatDate(order?.orderDate)}</div>
                      </div>
                      <div className="text-base font-semibold text-gray-900 dark:text-gray-100">{order?.customerName || "Unknown Customer"}</div>
                      <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                        📧 {order?.customerEmail || "N/A"} • 📞 {order?.customerPhone || "N/A"}
                      </div>
                    </div>
                    <div className="text-left md:text-right">
                      <div className="mb-2 text-2xl font-bold text-amber-600 dark:text-amber-300">
                        ₹{formatAmount(order?.totalAmount)}
                      </div>
                      <div
                        className={`inline-block rounded-full px-3.5 py-1.5 text-xs font-semibold ${
                          order?.paymentStatus === "Paid"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200"
                            : "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200"
                        }`}
                      >
                        {order?.paymentStatus === "Paid" ? "✓ Paid" : "⏳ Pending"}
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                      Machines Ordered
                    </div>
                    <div className="grid gap-2">
                      {machines.length === 0 ? (
                        <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
                          No machine data
                        </div>
                      ) : (
                        machines.map((machine, idx) => (
                          <div
                            key={`machine-${idx}`}
                            className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 dark:border-gray-700 dark:bg-gray-900"
                          >
                            <span className="text-sm text-gray-800 dark:text-gray-200">{machine?.name || "Unnamed Machine"}</span>
                            <span
                              className="rounded-md bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-200"
                            >
                              Qty: {safeNumber(machine?.quantity)}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    <strong>Verified By:</strong> {order?.verifiedBy || "N/A"}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {filteredOrders.length > 0 && (
        <div className="mt-8 text-center text-xs text-gray-600 dark:text-gray-400">
          Showing {filteredOrders.length} of {safeNumber(ordersSummary?.total)} orders
        </div>
      )}

      <AddOrderModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          console.log("[Orders] Order created successfully");
        }}
      />
    </div>
  );
};

export default Orders;
