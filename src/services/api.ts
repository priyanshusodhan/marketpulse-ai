// Live API layer - Yahoo Finance (no key required)

const YAHOO_CHART = "https://query1.finance.yahoo.com/v8/finance/chart";
const YAHOO_QUOTE = "https://query1.finance.yahoo.com/v7/finance/quote";

const RANGE_MAP: Record<string, string> = {
  "1D": "1d",
  "1W": "5d",
  "1M": "1mo",
  "1Y": "1y",
  "5Y": "5y",
};

function toYahooSymbol(symbol: string, isIndex = false): string {
  if (isIndex) return symbol;
  const s = symbol.toUpperCase().replace(/\s+/g, "");
  if (s.endsWith(".NS") || s.endsWith(".BO")) return s;
  return `${s}.NS`;
}

export interface CandlePoint {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export async function fetchStockChart(symbol: string, range = "1mo"): Promise<CandlePoint[] | null> {
  const yahooRange = RANGE_MAP[range] || range;
  const ySymbol = symbol === "NIFTY" || symbol === "SENSEX"
    ? symbol === "NIFTY" ? "^NSEI" : "^BSESN"
    : toYahooSymbol(symbol);
  try {
    const url = `${YAHOO_CHART}/${encodeURIComponent(ySymbol)}?range=${yahooRange}&interval=${yahooRange === "1d" ? "5m" : "1d"}`;
    const res = await fetch(url);
    const data = await res.json();
    const result = data?.chart?.result?.[0];
    if (!result) return null;
    const q = result.indicators?.quote?.[0];
    const ts = result.timestamp || [];
    if (!q) return null;
    return ts
      .map((t: number, i: number) => ({
        time: t,
        open: q.open?.[i] ?? q.close?.[i] ?? 0,
        high: q.high?.[i] ?? q.close?.[i] ?? 0,
        low: q.low?.[i] ?? q.close?.[i] ?? 0,
        close: q.close?.[i] ?? 0,
      }))
      .filter((d: CandlePoint) => d.close > 0);
  } catch (e) {
    console.warn("Yahoo chart failed:", e);
    return null;
  }
}

export interface QuoteResult {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  shortName?: string;
}

export async function fetchQuote(symbol: string): Promise<QuoteResult | null> {
  const ySymbol = toYahooSymbol(symbol);
  try {
    const url = `${YAHOO_QUOTE}?symbols=${encodeURIComponent(ySymbol)}`;
    const res = await fetch(url);
    const data = await res.json();
    const q = data?.quoteResponse?.result?.[0];
    if (!q) return null;
    const price = q.regularMarketPrice ?? q.previousClose ?? 0;
    const prev = q.previousClose ?? price;
    const change = prev ? ((price - prev) / prev) * 100 : 0;
    return {
      symbol: (q.symbol || symbol).replace(/\.(NS|BO)$/, ""),
      price,
      change: price - prev,
      changePercent: change,
      shortName: q.shortName,
    };
  } catch (e) {
    console.warn("Yahoo quote failed:", e);
    return null;
  }
}

export async function fetchMultipleQuotes(symbols: string[]): Promise<QuoteResult[]> {
  if (symbols.length === 0) return [];
  const ySymbols = symbols.map((s) => toYahooSymbol(s)).join(",");
  try {
    const url = `${YAHOO_QUOTE}?symbols=${encodeURIComponent(ySymbols)}`;
    const res = await fetch(url);
    const data = await res.json();
    const results = data?.quoteResponse?.result ?? [];
    return results.map((q: Record<string, unknown>) => {
      const price = (q.regularMarketPrice ?? q.previousClose ?? 0) as number;
      const prev = (q.previousClose ?? price) as number;
      const change = prev ? ((price - prev) / prev) * 100 : 0;
      return {
        symbol: String(q.symbol ?? "").replace(/\.(NS|BO)$/, ""),
        price,
        change: price - prev,
        changePercent: change,
        shortName: q.shortName as string | undefined,
      };
    });
  } catch (e) {
    console.warn("Yahoo multi-quote failed:", e);
    return [];
  }
}

const INDEX_SYMBOLS = [
  { symbol: "NIFTY 50", yahoo: "^NSEI" },
  { symbol: "SENSEX", yahoo: "^BSESN" },
  { symbol: "BSE", yahoo: "^BSESN" },
  { symbol: "NSE", yahoo: "^NSEI" },
];

export interface IndexQuote {
  symbol: string;
  value: number;
  change: number;
  changePercent: number;
}

export async function fetchIndices(): Promise<IndexQuote[]> {
  const ySymbols = INDEX_SYMBOLS.map((i) => i.yahoo)
    .filter((v, i, a) => a.indexOf(v) === i)
    .join(",");
  try {
    const url = `${YAHOO_QUOTE}?symbols=${encodeURIComponent(ySymbols)}`;
    const res = await fetch(url);
    const data = await res.json();
    const results = data?.quoteResponse?.result ?? [];
    const byYahoo: Record<string, { value: number; change: number; changePercent: number }> = {};
    for (const q of results) {
      const price = q.regularMarketPrice ?? q.previousClose ?? 0;
      const prev = q.previousClose ?? price;
      const change = prev ? ((price - prev) / prev) * 100 : 0;
      byYahoo[q.symbol] = {
        value: price,
        change: price - prev,
        changePercent: change,
      };
    }
    return INDEX_SYMBOLS.map(({ symbol, yahoo }) => {
      const d = byYahoo[yahoo] ?? { value: 0, change: 0, changePercent: 0 };
      return { symbol, ...d };
    });
  } catch (e) {
    console.warn("Yahoo indices failed:", e);
    return [];
  }
}

const MOVER_SYMBOLS = [
  "RELIANCE", "TCS", "HDFCBANK", "INFY", "ICICIBANK", "SBIN", "BHARTIARTL", "ITC", "KOTAKBANK", "LT",
  "HINDUNILVR", "AXISBANK", "ASIANPAINT", "MARUTI", "TITAN", "WIPRO", "HCLTECH", "TECHM", "SUNPHARMA", "CIPLA",
  "TATASTEEL", "HINDALCO", "JSWSTEEL", "COALINDIA", "ONGC", "ULTRACEMCO", "BAJFINANCE", "NESTLEIND", "M&M", "TATAMOTORS",
];

export async function fetchMovers(): Promise<{ gainers: QuoteResult[]; losers: QuoteResult[] }> {
  const quotes = await fetchMultipleQuotes(MOVER_SYMBOLS);
  const sorted = [...quotes].sort((a, b) => b.changePercent - a.changePercent);
  const gainers = sorted.filter((q) => q.changePercent > 0).slice(0, 10);
  const losers = [...sorted].reverse().filter((q) => q.changePercent < 0).slice(0, 10);
  return { gainers, losers };
}
