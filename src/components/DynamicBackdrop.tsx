"use client";

import { useEffect, useMemo, useState } from "react";

export default function DynamicBackdrop() {
  const [hasVideo, setHasVideo] = useState(true);
  const [mouse, setMouse] = useState({ x: 50, y: 35 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      setMouse({ x, y });
      document.documentElement.style.setProperty("--mx", `${x}%`);
      document.documentElement.style.setProperty("--my", `${y}%`);
    };

    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const parallax = useMemo(
    () => ({ transform: `translate3d(${(mouse.x - 50) * -0.05}px, ${(mouse.y - 50) * -0.05}px, 0) scale(1.06)` }),
    [mouse.x, mouse.y],
  );

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden>
      {hasVideo ? (
        <video
          className="absolute inset-0 h-full w-full object-cover opacity-35"
          autoPlay
          muted
          loop
          playsInline
          style={parallax}
          onError={() => setHasVideo(false)}
          src="/videos/market-loop.mp4"
        />
      ) : (
        <div className="absolute inset-0 app-fallback-bg" style={parallax} />
      )}
      <div className="absolute inset-0 app-noise" />
      <div className="absolute inset-0 app-gradient-overlay" />
      <div className="absolute inset-0 app-cursor-spotlight" />
    </div>
  );
}
