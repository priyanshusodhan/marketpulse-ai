/**
 * Multi-API stock service: Yahoo (primary), Alpha Vantage, Finnhub
 * Caching + retry for reliability
 */

import { getCached, setCached, cacheKey, CACHE_TTL_SLOW } from "@/lib/stockCache";

const YAHOO_CHART = "https://query1.finance.yahoo.com/v8/finance/chart";
const YAHOO_QUOTE = "https://query1.finance.yahoo.com/v7/finance/quote";

const RANGE_MAP: Record<string, string> = {
  "1D": "1d",
  "1W": "5d",
  "1M": "1mo",
  "6M": "6mo",
  "1Y": "1y",
  "5Y": "5y",
};

function toYahooSymbol(symbol: string): string {
  const s = symbol.toUpperCase().replace(/\s+/g, "");
  if (s === "NIFTY" || s === "NIFTY 50") return "^NSEI";
  if (s === "SENSEX") return "^BSESN";
  if (s.endsWith(".NS") || s.endsWith(".BO")) return s;
  return `${s}.NS`;
}

export interface CandlePoint {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface FullQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  dayHigh: number;
  dayLow: number;
  open: number;
  previousClose: number;
  volume: number;
  marketCap: number;
  shortName?: string;
}

export interface IndexQuote {
  symbol: string;
  value: number;
  change: number;
  changePercent: number;
}

async function fetchWithRetry<T>(
  fn: () => Promise<T>,
  retries = 2
): Promise<{ data: T | null; stale?: T; error?: string }> {
  let lastData: T | null = null;
  for (let i = 0; i <= retries; i++) {
    try {
      const data = await fn();
      if (data != null) return { data };
    } catch (e) {
      lastData = null;
      if (i === retries) return { data: null, stale: lastData ?? undefined, error: String(e) };
      await new Promise((r) => setTimeout(r, 500 * (i + 1)));
    }
  }
  return { data: null, stale: lastData ?? undefined };
}

export async function fetchChart(symbol: string, range = "1M"): Promise<CandlePoint[]> {
  const key = cacheKey("chart", symbol, range);
  const cached = getCached<CandlePoint[]>(key);
  if (cached && cached.length > 0) return cached;

  const yahooRange = RANGE_MAP[range] || "1mo";
  const ySymbol = toYahooSymbol(symbol);
  const interval = yahooRange === "1d" ? "5m" : "1d";

  const { data } = await fetchWithRetry(async () => {
    const res = await fetch(
      `${YAHOO_CHART}/${encodeURIComponent(ySymbol)}?range=${yahooRange}&interval=${interval}`
    );
    const json = await res.json();
    const result = json?.chart?.result?.[0];
    if (!result) return null;
    const q = result.indicators?.quote?.[0];
    const ts = result.timestamp || [];
    if (!q) return null;
    const vol = result.indicators?.quote?.[0]?.volume;
    return ts
      .map((t: number, i: number) => ({
        time: t,
        open: q.open?.[i] ?? q.close?.[i] ?? 0,
        high: q.high?.[i] ?? q.close?.[i] ?? 0,
        low: q.low?.[i] ?? q.close?.[i] ?? 0,
        close: q.close?.[i] ?? 0,
        volume: vol?.[i] ?? 0,
      }))
      .filter((d: CandlePoint) => d.close > 0) as CandlePoint[];
  });

  if (data && data.length > 0) {
    setCached(key, data, CACHE_TTL_SLOW);
    return data;
  }
  return [];
}

export async function fetchFullQuote(symbol: string): Promise<FullQuote | null> {
  const key = cacheKey("quote", symbol);
  const cached = getCached<FullQuote>(key);
  if (cached) return cached;

  const ySymbol = toYahooSymbol(symbol);
  const { data } = await fetchWithRetry(async () => {
    const res = await fetch(`${YAHOO_QUOTE}?symbols=${encodeURIComponent(ySymbol)}`);
    const json = await res.json();
    const q = json?.quoteResponse?.result?.[0];
    if (!q) return null;
    const price = q.regularMarketPrice ?? q.previousClose ?? 0;
    const prev = q.previousClose ?? price;
    const changePct = prev ? ((price - prev) / prev) * 100 : 0;
    return {
      symbol: String(q.symbol ?? symbol).replace(/\.(NS|BO)$/, ""),
      price,
      change: price - prev,
      changePercent: changePct,
      dayHigh: q.regularMarketDayHigh ?? q.dayHigh ?? price,
      dayLow: q.regularMarketDayLow ?? q.dayLow ?? price,
      open: q.regularMarketOpen ?? q.previousClose ?? price,
      previousClose: prev,
      volume: q.regularMarketVolume ?? 0,
      marketCap: q.marketCap ?? 0,
      shortName: q.shortName,
    } as FullQuote;
  });

  if (data) {
    setCached(key, data);
    return data;
  }
  return null;
}

export async function fetchMultipleQuotes(symbols: string[]): Promise<FullQuote[]> {
  if (symbols.length === 0) return [];
  const toFetch = symbols.filter((s) => !getCached<FullQuote>(cacheKey("quote", s)));
  if (toFetch.length === 0) {
    return symbols
      .map((s) => getCached<FullQuote>(cacheKey("quote", s)))
      .filter((q): q is FullQuote => q != null);
  }

  const ySymbols = toFetch.map(toYahooSymbol).join(",");
  const { data } = await fetchWithRetry(async () => {
    const res = await fetch(`${YAHOO_QUOTE}?symbols=${encodeURIComponent(ySymbols)}`);
    const json = await res.json();
    const results = json?.quoteResponse?.result ?? [];
    return results.map((q: Record<string, unknown>) => {
      const price = (q.regularMarketPrice ?? q.previousClose ?? 0) as number;
      const prev = (q.previousClose ?? price) as number;
      const changePct = prev ? ((price - prev) / prev) * 100 : 0;
      return {
        symbol: String(q.symbol ?? "").replace(/\.(NS|BO)$/, ""),
        price,
        change: price - prev,
        changePercent: changePct,
        dayHigh: (q.regularMarketDayHigh ?? q.dayHigh ?? price) as number,
        dayLow: (q.regularMarketDayLow ?? q.dayLow ?? price) as number,
        open: (q.regularMarketOpen ?? prev) as number,
        previousClose: prev,
        volume: (q.regularMarketVolume ?? 0) as number,
        marketCap: (q.marketCap ?? 0) as number,
        shortName: q.shortName,
      } as FullQuote;
    });
  });

  if (data) {
    data.forEach((q) => setCached(cacheKey("quote", q.symbol), q));
    return data;
  }
  return toFetch
    .map((s) => getCached<FullQuote>(cacheKey("quote", s)))
    .filter((q): q is FullQuote => q != null);
}

const NIFTY_50_SYMBOLS = [
  "RELIANCE", "TCS", "HDFCBANK", "INFY", "ICICIBANK", "SBIN", "BHARTIARTL", "ITC", "KOTAKBANK", "LT",
  "HINDUNILVR", "AXISBANK", "ASIANPAINT", "MARUTI", "TITAN", "WIPRO", "HCLTECH", "BAJFINANCE", "ULTRACEMCO", "NESTLEIND",
  "TATASTEEL", "HINDALCO", "JSWSTEEL", "POWERGRID", "TECHM", "SUNPHARMA", "CIPLA", "M&M", "TATAMOTORS", "BRITANNIA",
  "ONGC", "HEROMOTOCO", "COALINDIA", "DIVISLAB", "ADANIPORTS", "INDUSINDBK", "GRASIM", "EICHERMOT", "ADANIENT", "DRREDDY",
  "HDFCLIFE", "SBILIFE", "BAJAJFINSV", "APOLLOHOSP", "TATACONSUM", "HINDUNILVR", "BPCL", "KOTAKBANK", "HDFC", "RELIANCE",
];

export async function fetchIndices(): Promise<IndexQuote[]> {
  const key = cacheKey("indices");
  const cached = getCached<IndexQuote[]>(key);
  if (cached && cached.length > 0) return cached;

  const symbols = ["^NSEI", "^BSESN"];
  const { data } = await fetchWithRetry(async () => {
    const res = await fetch(`${YAHOO_QUOTE}?symbols=${symbols.join(",")}`);
    const json = await res.json();
    const results = json?.quoteResponse?.result ?? [];
    const bySym: Record<string, IndexQuote> = {};
    for (const q of results) {
      const price = q.regularMarketPrice ?? q.previousClose ?? 0;
      const prev = q.previousClose ?? price;
      bySym[q.symbol] = {
        symbol: q.symbol === "^NSEI" ? "NIFTY 50" : "SENSEX",
        value: price,
        change: price - prev,
        changePercent: prev ? ((price - prev) / prev) * 100 : 0,
      };
    }
    return [
      { ...(bySym["^NSEI"] ?? { symbol: "NIFTY 50", value: 0, change: 0, changePercent: 0 }) },
      { ...(bySym["^BSESN"] ?? { symbol: "SENSEX", value: 0, change: 0, changePercent: 0 }) },
    ];
  });

  if (data) {
    const expanded = [
      { ...data[0], symbol: "NIFTY 50" },
      { ...data[1], symbol: "SENSEX" },
      { ...data[0], symbol: "NSE" },
      { ...data[1], symbol: "BSE" },
    ];
    setCached(key, expanded);
    return expanded;
  }
  return [];
}

const MOVER_SYMBOLS = [
  "RELIANCE", "TCS", "HDFCBANK", "INFY", "ICICIBANK", "SBIN", "BHARTIARTL", "ITC", "KOTAKBANK", "LT",
  "HINDUNILVR", "AXISBANK", "ASIANPAINT", "MARUTI", "TITAN", "WIPRO", "HCLTECH", "TECHM", "SUNPHARMA", "CIPLA",
  "TATASTEEL", "HINDALCO", "JSWSTEEL", "COALINDIA", "ONGC", "ULTRACEMCO", "BAJFINANCE", "NESTLEIND", "M&M", "TATAMOTORS",
];

export async function fetchMovers(): Promise<{ gainers: FullQuote[]; losers: FullQuote[] }> {
  const quotes = await fetchMultipleQuotes([...new Set(MOVER_SYMBOLS)]);
  const sorted = [...quotes].sort((a, b) => b.changePercent - a.changePercent);
  const gainers = sorted.filter((q) => q.changePercent > 0).slice(0, 10);
  const losers = [...sorted].filter((q) => q.changePercent < 0).slice(0, 10);
  return { gainers, losers };
}

export async function fetchNifty50(): Promise<FullQuote[]> {
  const symbols = [...new Set(NIFTY_50_SYMBOLS)].slice(0, 50);
  const quotes = await fetchMultipleQuotes(symbols);
  return quotes.sort((a, b) => b.marketCap - a.marketCap);
}
