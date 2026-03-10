"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ScriptableContext,
  TooltipItem,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface LineChartProps {
  data: { x: number; y: number }[];
  label?: string;
  color?: string;
  height?: number;
}

export default function LineChart({ data, label = "Price", color = "#f5c518", height = 200 }: LineChartProps) {
  const chartData = {
    labels: data.map((_, i) => i),
    datasets: [
      {
        label,
        data: data.map((d) => d.y),
        borderColor: color,
        borderWidth: 2,
        backgroundColor: (context: ScriptableContext<"line">) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return `${color}20`;
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, `${color}60`);
          gradient.addColorStop(1, `${color}00`);
          return gradient;
        },
        fill: true,
        tension: 0.4, // smooth animated path
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: "#ffffff",
        pointHoverBorderColor: color,
        pointHoverBorderWidth: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1500,
      easing: "easeOutQuart" as const,
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(10, 8, 0, 0.85)",
        titleColor: "#f0e6c8",
        bodyColor: color,
        borderColor: "rgba(245, 197, 24, 0.2)",
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: (context: TooltipItem<"line">) =>
            `₹${Number(context.parsed.y).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
        },
      },
    },
    scales: {
      x: {
        display: false,
        grid: { color: "rgba(255,255,255,0.02)" },
      },
      y: {
        grid: { color: "rgba(255,255,255,0.05)" },
        ticks: { color: "#8a7a55" },
        border: { dash: [4, 4] },
      },
    },
    interaction: {
      intersect: false,
      mode: "index" as const,
    },
  };

  return (
    <div style={{ height }} className="relative">
      <Line data={chartData} options={options} />
    </div>
  );
}
