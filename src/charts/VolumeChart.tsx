"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip);

interface VolumeChartProps {
  data: { time: number; close: number; volume?: number }[];
  height?: number;
}

export default function VolumeChart({ data, height = 120 }: VolumeChartProps) {
  const vols = data.map((d) => d.volume ?? 0);
  const colors = data.map((_, i) => {
    const d = data[i];
    if (!d) return "rgba(0,245,255,0.5)";
    const prev = data[i - 1]?.close ?? d.close;
    return d.close >= prev ? "rgba(0,255,136,0.5)" : "rgba(255,82,82,0.5)";
  });

  const chartData = {
    labels: data.map((_, i) => i),
    datasets: [
      {
        label: "Volume",
        data: vols,
        backgroundColor: colors,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (c: { raw: number }) =>
            `Vol: ${(c.raw / 1e6).toFixed(2)}M`,
        },
      },
    },
    scales: {
      x: {
        display: false,
      },
      y: {
        grid: { color: "rgba(255,255,255,0.05)" },
        ticks: {
          color: "#94a3b8",
          callback: (v: number | string) =>
            typeof v === "number" ? `${(v / 1e6).toFixed(1)}M` : v,
        },
      },
    },
  };

  return (
    <div style={{ height }}>
      <Bar data={chartData} options={options} />
    </div>
  );
}
