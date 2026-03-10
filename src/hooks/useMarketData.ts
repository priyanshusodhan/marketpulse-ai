"use client";

import { useState, useEffect, useCallback, useMemo } from "react";

const POLL_INTERVAL = 10 * 1000; // 10 seconds

export function useIndices() {
  const [data, setData] = useState<{ symbol: string; value: number; change: number; changePercent: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/indices", { cache: "no-store" });
      const json = await res.json();
      if (Array.isArray(json) && json.length > 0) {
        setData(json);
        setError(null);
      } else {
        setData((prev) => {
          if (prev.length === 0) {
            setError("Live index data unavailable");
          }
          return prev;
        });
      }
    } catch {
      setData((prev) => {
        if (prev.length === 0) setError("Failed to load");
        return prev;
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [fetchData]);

  return { data, loading, error, refresh: fetchData };
}

export function useMovers() {
  const [gainers, setGainers] = useState<{ symbol: string; price: number; changePercent: number }[]>([]);
  const [losers, setLosers] = useState<{ symbol: string; price: number; changePercent: number }[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/movers", { cache: "no-store" });
      const json = await res.json();
      const nextGainers = Array.isArray(json?.gainers) ? json.gainers : [];
      const nextLosers = Array.isArray(json?.losers) ? json.losers : [];
      if (nextGainers.length > 0 || nextLosers.length > 0) {
        setGainers(nextGainers);
        setLosers(nextLosers);
      }
    } catch {
      // Keep last known values.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [fetchData]);

  return { gainers, losers, loading, refresh: fetchData };
}

export function useTicker(symbols: string[]) {
  const [data, setData] = useState<{ symbol: string; price: number; changePercent: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const symbolsKey = useMemo(() => symbols.join(","), [symbols]);

  const fetchData = useCallback(async () => {
    if (!symbolsKey) return;
    try {
      const res = await fetch(`/api/quote?symbols=${encodeURIComponent(symbolsKey)}`, { cache: "no-store" });
      const json = await res.json();
      const next = Array.isArray(json) ? json : [];
      if (next.length > 0) setData(next);
    } catch {
      // Keep last known values.
    } finally {
      setLoading(false);
    }
  }, [symbolsKey]);

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [fetchData]);

  return { data, loading };
}

export function useFullQuote(symbol: string | null) {
  const [quote, setQuote] = useState<{
    price: number;
    changePercent: number;
    dayHigh: number;
    dayLow: number;
    open: number;
    previousClose: number;
    volume: number;
    marketCap: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    if (!symbol) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/quote?symbol=${encodeURIComponent(symbol)}`);
      const json = await res.json();
      if (json?.price != null) setQuote(json);
      else setQuote(null);
    } catch {
      setQuote(null);
    } finally {
      setLoading(false);
    }
  }, [symbol]);

  useEffect(() => {
    fetchData();
    if (!symbol) return;
    const id = setInterval(fetchData, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [fetchData, symbol]);

  return { quote, loading, refresh: fetchData };
}

export function useNifty50() {
  const [data, setData] = useState<{ symbol: string; price: number; changePercent: number; marketCap: number }[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/nifty50", { cache: "no-store" });
      const json = await res.json();
      const next = Array.isArray(json) ? json : [];
      if (next.length > 0) {
        setData(next);
      }
    } catch {
      // Keep last known values.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [fetchData]);

  return { data, loading, refresh: fetchData };
}
