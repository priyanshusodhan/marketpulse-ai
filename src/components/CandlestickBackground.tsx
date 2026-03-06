"use client";

import { useEffect, useRef } from "react";

export default function CandlestickBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const candles: { x: number; open: number; close: number; high: number; low: number }[] = [];
    const w = 8;
    const gap = 12;
    const cols = Math.floor(canvas.width / (w + gap)) + 2;
    const rows = Math.floor(canvas.height / 80) + 2;

    for (let row = 0; row < rows; row++) {
      let price = 100;
      for (let col = 0; col < cols; col++) {
        const change = (Math.random() - 0.5) * 8;
        const open = price;
        price = Math.max(70, Math.min(130, price + change));
        const high = Math.max(open, price) + Math.random() * 3;
        const low = Math.min(open, price) - Math.random() * 3;
        candles.push({
          x: col * (w + gap) + (row % 2) * 40,
          open,
          close: price,
          high,
          low,
        });
      }
    }

    let offset = 0;
    const draw = () => {
      ctx.fillStyle = "rgba(10, 10, 15, 0.03)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      candles.forEach((c, i) => {
        const row = Math.floor(i / cols);
        const col = i % cols;
        const x = col * (w + gap) + (row % 2) * 40 - (offset % (cols * (w + gap)));
        const y = 80 + row * 100 + Math.sin((Date.now() + i * 100) * 0.001) * 5;

        const scale = 0.4;
        const openY = y - (c.open - 100) * scale;
        const closeY = y - (c.close - 100) * scale;
        const highY = y - (c.high - 100) * scale;
        const lowY = y - (c.low - 100) * scale;

        const isGreen = c.close >= c.open;
        ctx.strokeStyle = isGreen ? "rgba(0, 255, 136, 0.15)" : "rgba(255, 82, 82, 0.15)";
        ctx.fillStyle = isGreen ? "rgba(0, 255, 136, 0.08)" : "rgba(255, 82, 82, 0.08)";
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.moveTo(x + w / 2, Math.min(highY, openY, closeY));
        ctx.lineTo(x + w / 2, Math.max(lowY, openY, closeY));
        ctx.stroke();

        ctx.fillRect(x, Math.min(openY, closeY), w, Math.abs(closeY - openY) || 1);
        ctx.strokeRect(x, Math.min(openY, closeY), w, Math.abs(closeY - openY) || 1);
      });

      offset += 0.5;
      requestAnimationFrame(draw);
    };
    const anim = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(anim);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0 opacity-40" />;
}
