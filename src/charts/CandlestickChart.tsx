"use client";

import { useEffect, useRef } from "react";

interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface CandlestickChartProps {
  data: Candle[];
  height?: number;
  className?: string;
}

export default function CandlestickChart({ data, height = 400, className = "" }: CandlestickChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current || !data.length) return;

    let chartInstance: { remove: () => void } | null = null;

    const loadChart = async () => {
      const { createChart, CandlestickSeries } = await import("lightweight-charts");
      const chart = createChart(chartRef.current!, {
        height,
        layout: {
          background: { color: "transparent" },
          textColor: "#8a7a55",
        },
        grid: {
          vertLines: { color: "rgba(255,255,255,0.05)" },
          horzLines: { color: "rgba(255,255,255,0.05)" },
        },
        rightPriceScale: {
          borderColor: "rgba(245,197,24,0.1)",
          scaleMargins: { top: 0.1, bottom: 0.2 },
        },
        timeScale: {
          borderColor: "rgba(245,197,24,0.1)",
          timeVisible: true,
          secondsVisible: false,
        },
      });

      const candleSeries = chart.addSeries(CandlestickSeries, {
        upColor: "#39d98a",
        downColor: "#ff6b6b",
        borderUpColor: "#39d98a",
        borderDownColor: "#ff6b6b",
      });

      candleSeries.setData(
        data.map((d) => ({
          time: d.time as import("lightweight-charts").UTCTimestamp,
          open: d.open,
          high: d.high,
          low: d.low,
          close: d.close,
        }))
      );

      chart.timeScale().fitContent();
      chartInstance = chart;
    };

    loadChart();

    return () => {
      chartInstance?.remove();
    };
  }, [data, height]);

  return <div ref={chartRef} className={className} />;
}
