"use client";

import { useState, useEffect, useCallback } from "react";

const POLL_INTERVAL = 10 * 1000; // 10 seconds

export function useIndices() {
  const [data, setData] = useState<{ symbol: string; value: number; change: number; changePercent: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/indices");
      const json = await res.json();
      setData(Array.isArray(json) ? json : []);
      setError(null);
    } catch (e) {
      setError("Failed to load");
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
      const res = await fetch("/api/movers");
      const json = await res.json();
      setGainers(Array.isArray(json?.gainers) ? json.gainers : []);
      setLosers(Array.isArray(json?.losers) ? json.losers : []);
    } catch {
      // keep last
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

  const fetchData = useCallback(async () => {
    if (symbols.length === 0) return;
    try {
      const res = await fetch(`/api/quote?symbols=${symbols.join(",")}`);
      const json = await res.json();
      setData(Array.isArray(json) ? json : []);
    } catch {
      // keep last
    } finally {
      setLoading(false);
    }
  }, [symbols.join(",")]);

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
      const res = await fetch("/api/nifty50");
      const json = await res.json();
      setData(Array.isArray(json) ? json : []);
    } catch {
      setData([]);
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
