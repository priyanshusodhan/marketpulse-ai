/**
 * Multi-API stock service: Yahoo (primary), Alpha Vantage, Finnhub
 * Caching + retry for reliability
 */

import { getCached, setCached, cacheKey, CACHE_TTL_SLOW } from "@/lib/stockCache";

const YAHOO_CHART = "https://query1.finance.yahoo.com/v8/finance/chart";

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
  if (s.startsWith("^")) return s;
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

function lastValidNumber(values: unknown[] | undefined): number | null {
  if (!Array.isArray(values)) return null;
  for (let i = values.length - 1; i >= 0; i--) {
    const v = values[i];
    if (typeof v === "number" && Number.isFinite(v) && v > 0) return v;
  }
  return null;
}

async function fetchYahooChartQuote(symbol: string): Promise<FullQuote | null> {
  const ySymbol = toYahooSymbol(symbol);
  const res = await fetch(`${YAHOO_CHART}/${encodeURIComponent(ySymbol)}?range=5d&interval=1d`);
  const json = await res.json();
  const result = json?.chart?.result?.[0];
  if (!result) return null;

  const meta = result.meta ?? {};
  const closes = result.indicators?.quote?.[0]?.close as unknown[] | undefined;
  const volumes = result.indicators?.quote?.[0]?.volume as unknown[] | undefined;
  const lastClose = lastValidNumber(closes);

  const price = (meta.regularMarketPrice ?? lastClose ?? meta.previousClose ?? 0) as number;
  if (!(price > 0)) return null;

  const previousClose = (meta.chartPreviousClose ?? meta.previousClose ?? lastClose ?? price) as number;
  const change = price - previousClose;
  const changePercent = previousClose ? (change / previousClose) * 100 : 0;

  return {
    symbol: String(meta.symbol ?? symbol).replace(/\.(NS|BO)$/, ""),
    price,
    change,
    changePercent,
    dayHigh: (meta.regularMarketDayHigh ?? meta.fiftyTwoWeekHigh ?? price) as number,
    dayLow: (meta.regularMarketDayLow ?? meta.fiftyTwoWeekLow ?? price) as number,
    open: (meta.regularMarketOpen ?? previousClose ?? price) as number,
    previousClose,
    volume: (meta.regularMarketVolume ?? lastValidNumber(volumes) ?? 0) as number,
    marketCap: (meta.marketCap ?? 0) as number,
    shortName: (meta.shortName ?? meta.longName) as string | undefined,
  };
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

  const { data } = await fetchWithRetry(async () => {
    return await fetchYahooChartQuote(symbol);
  });

  if (data) {
    setCached(key, data);
    return data;
  }
  return null;
}

export async function fetchMultipleQuotes(symbols: string[]): Promise<FullQuote[]> {
  if (symbols.length === 0) return [];
  const cachedForSymbols = symbols
    .map((s) => getCached<FullQuote>(cacheKey("quote", s)))
    .filter((q): q is FullQuote => q != null);

  const toFetch = symbols.filter((s) => !getCached<FullQuote>(cacheKey("quote", s)));
  if (toFetch.length === 0) {
    return cachedForSymbols;
  }

  const { data } = await fetchWithRetry(async () => {
    const items = await Promise.all(
      toFetch.map(async (requested) => ({
        requested,
        quote: await fetchYahooChartQuote(requested),
      })),
    );
    return items.filter((x): x is { requested: string; quote: FullQuote } => x.quote != null);
  });

  if (data && data.length > 0) {
    for (const item of data) {
      setCached(cacheKey("quote", item.requested), item.quote);
      setCached(cacheKey("quote", item.quote.symbol), item.quote);
    }
    // Return using the original symbol order from cache after writing new entries.
    return symbols
      .map((s) => getCached<FullQuote>(cacheKey("quote", s)))
      .filter((q): q is FullQuote => q != null);
  }

  // If upstream returned no quotes, preserve existing cached values instead of replacing with empty.
  return symbols
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

  const { data } = await fetchWithRetry(async () => {
    const [nifty, sensex] = await Promise.all([
      fetchYahooChartQuote("^NSEI"),
      fetchYahooChartQuote("^BSESN"),
    ]);
    if (!nifty || !sensex) return null;
    return [
      { symbol: "NIFTY 50", value: nifty.price, change: nifty.change, changePercent: nifty.changePercent },
      { symbol: "SENSEX", value: sensex.price, change: sensex.change, changePercent: sensex.changePercent },
    ];
  });

  if (data && data.length === 2) {
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
