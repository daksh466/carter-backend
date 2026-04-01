import React, { useEffect, useRef, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const tooltipStyle = {
  backgroundColor: "var(--panel)",
  border: "1px solid var(--panel-border)",
  borderRadius: 8,
  color: "var(--text)",
};

const ShipmentChart = ({ data = [], height = 280 }) => {
  const frameRef = useRef(null);
  const [canRender, setCanRender] = useState(false);

  useEffect(() => {
    const node = frameRef.current;
    if (!node) return;

    const update = () => {
      const { width, height: measuredHeight } = node.getBoundingClientRect();
      setCanRender(width > 1 && measuredHeight > 1);
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={frameRef}
      className="w-full rounded-xl border border-gray-200 bg-white p-2 transition-colors duration-300 dark:border-gray-700 dark:bg-gray-800"
      style={{ height, minHeight: 300, minWidth: 1 }}
    >
      {canRender ? (
      <ResponsiveContainer width="100%" height={height} minWidth={1} minHeight={300}>
        <LineChart data={data} margin={{ top: 12, right: 12, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--panel-border)" />
          <XAxis dataKey="label" tick={{ fill: "var(--muted)", fontSize: 12 }} axisLine={{ stroke: "var(--panel-border)" }} />
          <YAxis allowDecimals={false} tick={{ fill: "var(--muted)", fontSize: 12 }} axisLine={{ stroke: "var(--panel-border)" }} />
          <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "var(--brand)" }} />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="incoming" 
            stroke="#34d399" 
            strokeWidth={3} 
            name="Incoming" 
            dot={{ fill: "#34d399", strokeWidth: 2 }} 
            activeDot={{ r: 6, strokeWidth: 2 }}
          />
          <Line 
            type="monotone" 
            dataKey="outgoing" 
            stroke="#60a5fa" 
            strokeWidth={3} 
            name="Outgoing" 
            dot={{ fill: "#60a5fa", strokeWidth: 2 }} 
            activeDot={{ r: 6, strokeWidth: 2 }}
          />
          <Line 
            type="monotone" 
            dataKey="delivered" 
            stroke="#10b981" 
            strokeWidth={3} 
            name="Delivered" 
            dot={{ fill: "#10b981", strokeWidth: 2 }} 
            activeDot={{ r: 6, strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
      ) : null}
    </div>
  );
};

export default ShipmentChart;

