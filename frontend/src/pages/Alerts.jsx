import React, { useEffect, useState } from "react";
import { getAlerts } from "../services/api";

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    getAlerts()
      .then((res) => {
        setAlerts(Array.isArray(res?.data) ? res.data : []);
        setError(null);
      })
      .catch(() => {
        setError("Failed to load alerts.");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="mx-auto w-full max-w-5xl rounded-xl border border-gray-200 bg-white p-6 shadow-md transition-colors duration-300 dark:border-gray-700 dark:bg-gray-800">
        <p className="text-sm text-gray-700 dark:text-gray-300">Loading alerts...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mx-auto w-full max-w-5xl rounded-xl border border-red-300 bg-red-50 p-6 shadow-md transition-colors duration-300 dark:border-red-700 dark:bg-red-900/30">
        <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-5xl rounded-xl border border-gray-200 bg-white p-6 shadow-md transition-colors duration-300 dark:border-gray-700 dark:bg-gray-800">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Alerts</h2>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">System notifications and inventory warnings</p>
      <ul className="mt-4 space-y-2">
        {alerts.length === 0 && (
          <li className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
            No alerts.
          </li>
        )}
        {alerts.map((alert, idx) => (
          <li
            key={idx}
            className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 transition-colors duration-300 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-200"
          >
            {alert.message || JSON.stringify(alert)}
          </li>
        ))}
      </ul>
    </section>
  );
};

export default Alerts;
