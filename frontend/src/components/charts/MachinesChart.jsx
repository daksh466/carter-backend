import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const COLORS = {
  Running: "#34d399",
  Idle: "#fbbf24",
  Error: "#f87171",
};

const tooltipStyle = {
  backgroundColor: "var(--panel)",
  border: "1px solid var(--panel-border)",
  borderRadius: 8,
  color: "var(--text)",
};

const normalizeStatus = (status = "") => {
  const value = String(status).toLowerCase();
  if (value.includes("run")) return "Running";
  if (value.includes("idle")) return "Idle";
  return "Error";
};

const MachinesChart = ({ machines = [] }) => {
  const frameRef = useRef(null);
  const [canRender, setCanRender] = useState(false);

  useEffect(() => {
    const node = frameRef.current;
    if (!node) return;

    const update = () => {
      const { width, height } = node.getBoundingClientRect();
      setCanRender(width > 1 && height > 1);
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, []);

  const chartData = useMemo(() => {
    const source = Array.isArray(machines) ? machines : [];

    const summary = {
      Running: 0,
      Idle: 0,
      Error: 0,
    };

    source.forEach((machine) => {
      const key = normalizeStatus(machine?.status);
      summary[key] += 1;
    });

    return Object.entries(summary).map(([name, value]) => ({ name, value }));
  }, [machines]);

  return (
    <div
      ref={frameRef}
      className="w-full rounded-xl border border-gray-200 bg-white p-2 transition-colors duration-300 dark:border-gray-700 dark:bg-gray-800"
      style={{ minHeight: 300, height: 300, minWidth: 1 }}
    >
      {canRender ? (
      <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={300}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            innerRadius={55}
            outerRadius={95}
            paddingAngle={4}
            stroke="#1e293b"
          >
            {chartData.map((entry) => (
              <Cell key={entry.name} fill={COLORS[entry.name]} />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "var(--brand)" }} />
          <Legend wrapperStyle={{ color: "var(--muted)", fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
      ) : null}
    </div>
  );
};

export default MachinesChart;

