import React, { useCallback, useEffect, useMemo, useState } from "react";
import useApp from "../hooks/useApp";
import { getSpareParts } from "../services/api";

const Inventory = () => {
  const { selectedStore, setSelectedStore, stores, machines, storeLoading } = useApp();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [selectedMachineId, setSelectedMachineId] = useState("");

  const selectedStoreName = useMemo(() => {
    const match = stores.find((store) => String(store.id || store._id) === String(selectedStore || ""));
    return match?.name || "";
  }, [stores, selectedStore]);

  const machineOptions = useMemo(
    () => (Array.isArray(machines) ? machines : []).map((machine, index) => ({
      id: String(machine?.id || machine?._id || `machine-${index}`),
      name: machine?.name || `Machine ${index + 1}`
    })),
    [machines]
  );

  const selectedMachineName = useMemo(() => {
    const match = machineOptions.find((machine) => machine.id === String(selectedMachineId || ""));
    return match?.name || "";
  }, [machineOptions, selectedMachineId]);

  const filteredItems = useMemo(() => {
    if (!selectedMachineId) return items;

    return items.filter((item) => {
      const linkedMachineIds = [
        ...(Array.isArray(item.machine_ids) ? item.machine_ids : []),
        ...(Array.isArray(item.machines)
          ? item.machines.map((machine) => machine?.id || machine?._id)
          : []),
        item.machine_id,
        item.machineId,
      ]
        .map((id) => String(id || "").trim())
        .filter(Boolean);

      return linkedMachineIds.includes(String(selectedMachineId));
    });
  }, [items, selectedMachineId]);

  const loadInventory = useCallback(async ({ silent = false } = {}) => {
    if (!selectedStore) {
      setItems([]);
      setError("");
      return;
    }

    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await getSpareParts({ storeId: selectedStore });
      if (!response.success) {
        setItems([]);
        setError(response.error || "Failed to load inventory.");
        return;
      }

      setItems(Array.isArray(response.data) ? response.data : []);
      setError("");
    } catch (err) {
      setItems([]);
      setError(err?.message || "Failed to load inventory.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedStore]);

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  useEffect(() => {
    setSelectedMachineId("");
  }, [selectedStore]);

  useEffect(() => {
    const handleInventoryUpdate = (event) => {
      const updatedStoreIds = event?.detail?.storeIds || [];
      if (!selectedStore || updatedStoreIds.length === 0 || updatedStoreIds.includes(selectedStore)) {
        loadInventory({ silent: true });
      }
    };

    window.addEventListener("inventory:updated", handleInventoryUpdate);
    return () => window.removeEventListener("inventory:updated", handleInventoryUpdate);
  }, [loadInventory, selectedStore]);

  if (loading) {
    return (
      <section className="card grid min-h-[260px] place-items-center gap-2.5 transition-colors duration-300">
        <div className="saas-spinner" />
        <p className="text-gray-700 dark:text-gray-300">Loading inventory...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="card grid min-h-[240px] place-items-center gap-3 transition-colors duration-300">
        <p className="text-red-700 dark:text-red-300">{error}</p>
        <button className="saas-btn saas-btn-primary px-3 py-2" onClick={() => loadInventory()}>
          Retry
        </button>
      </section>
    );
  }

  return (
    <section className="card p-4.5 transition-colors duration-300">
      <div className="mb-3.5 flex flex-wrap justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Inventory</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {selectedStoreName ? `${selectedStoreName} stock overview` : "Stock overview"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={selectedStore || ""}
            onChange={(event) => setSelectedStore(event.target.value)}
            className="min-w-[220px] rounded-lg border border-gray-300 bg-white px-2.5 py-2 text-gray-900 transition-colors duration-300 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
          >
            <option value="">Select Store</option>
            {stores.map((store, index) => {
              const storeId = String(store?.id || store?._id || `store-${index}`);
              return (
                <option key={storeId} value={storeId}>
                  {store?.name || `Store ${index + 1}`}
                </option>
              );
            })}
          </select>
          <button
            className="saas-btn"
            style={{ padding: "8px 12px" }}
            type="button"
            onClick={() => loadInventory({ silent: true })}
            disabled={refreshing || !selectedStore}
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {!selectedStore ? (
        <div className="grid min-h-[160px] place-items-center text-gray-600 dark:text-gray-400">
          Select a store to view machines and spare parts.
        </div>
      ) : (
        <>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Machines:</span>
            <button
              type="button"
              onClick={() => setSelectedMachineId("")}
              className={`cursor-pointer rounded-full px-2.5 py-1.5 text-xs font-bold transition-colors duration-300 ${
                selectedMachineId
                  ? "border border-gray-300 bg-white text-gray-700 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300"
                  : "border border-blue-500 bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200"
              }`}
            >
              All Machines
            </button>
            {storeLoading && machineOptions.length === 0 ? (
              <span className="text-xs text-gray-600 dark:text-gray-400">Loading machines...</span>
            ) : machineOptions.length === 0 ? (
              <span className="text-xs text-gray-600 dark:text-gray-400">No machines found for this store.</span>
            ) : (
              machineOptions.map((machine) => (
                <button
                  key={machine.id}
                  type="button"
                  onClick={() => setSelectedMachineId(machine.id)}
                  className={`cursor-pointer rounded-full px-2.5 py-1.5 text-xs font-bold transition-colors duration-300 ${
                    selectedMachineId === machine.id
                      ? "border border-blue-500 bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200"
                      : "border border-gray-300 bg-white text-gray-700 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300"
                  }`}
                >
                  {machine.name}
                </button>
              ))
            )}
          </div>

          {filteredItems.length === 0 ? (
        <div className="grid min-h-[180px] place-items-center text-gray-600 dark:text-gray-400">
          {selectedMachineId
            ? `No spare parts found for ${selectedMachineName || "selected machine"}.`
            : "No inventory items found for this store."}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
          <table className="w-full border-collapse bg-white dark:bg-gray-800">
            <thead>
              <tr className="border-b border-gray-200 text-left text-sm text-blue-700 dark:border-gray-700 dark:text-blue-300">
                <th className="px-2 py-2.5">Item</th>
                <th className="px-2 py-2.5">Size</th>
                <th className="px-2 py-2.5">Used In Machine(s)</th>
                <th className="px-2 py-2.5">Quantity</th>
                <th className="px-2 py-2.5">Min Required</th>
                <th className="px-2 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item, index) => {
                const quantity = Number(item.availableQty ?? item.available_qty ?? item.quantity ?? item.quantity_available ?? item.stockQuantity ?? 0);
                const minRequired = Number(item.minRequired ?? item.min_required ?? item.minimumRequired ?? item.minimum_required ?? 0);
                const size = item.size ?? "N/A";
                const isLow = minRequired > 0 && quantity < minRequired;
                const machineNames = [
                  ...(Array.isArray(item.machine_names) ? item.machine_names : []),
                  ...(Array.isArray(item.machines)
                    ? item.machines.map((machine) => machine?.name).filter(Boolean)
                    : []),
                  item.machineName,
                  item.machine_name
                ]
                  .map((name) => String(name || "").trim())
                  .filter(Boolean)
                  .filter((name, nameIndex, list) => list.indexOf(name) === nameIndex);

                return (
                  <tr
                    key={String(item.id || item._id || item.itemCode || item.name || `inv-${index}`)}
                    className="border-b border-gray-100 dark:border-gray-700"
                  >
                    <td className="px-2 py-3 text-gray-900 dark:text-gray-100">{item.itemName || item.name || "-"}</td>
                    <td className="px-2 py-3 text-gray-700 dark:text-gray-300">{size}</td>
                    <td className="px-2 py-3 text-gray-700 dark:text-gray-300">
                      {machineNames.length > 0 ? machineNames.join(", ") : "-"}
                    </td>
                    <td className="px-2 py-3 text-gray-700 dark:text-gray-300">{quantity}</td>
                    <td className="px-2 py-3 text-gray-700 dark:text-gray-300">{minRequired}</td>
                    <td className="px-2 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${
                          isLow
                            ? "border border-red-300 bg-red-100 text-red-800 dark:border-red-700 dark:bg-red-900/30 dark:text-red-200"
                            : "border border-emerald-300 bg-emerald-100 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200"
                        }`}
                      >
                        {isLow ? "Low Stock" : "Healthy"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
        </>
      )}
    </section>
  );
};

export default Inventory;
