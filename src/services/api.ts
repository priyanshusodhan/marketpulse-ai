// API service layer - Configure with your API keys

const ALPHA_VANTAGE_KEY = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_KEY || "";
const YAHOO_FINANCE_BASE = "https://query1.finance.yahoo.com/v8/finance/chart";

export const fetchStockData = async (symbol: string, range = "1mo") => {
  try {
    const url = `${YAHOO_FINANCE_BASE}/${symbol}.NS?range=${range}&interval=1d`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.chart?.result?.[0]) {
      const result = data.chart.result[0];
      const quotes = result.indicators.quote[0];
      const timestamps = result.timestamp;
      return timestamps.map((t: number, i: number) => ({
        time: t,
        open: quotes.open[i] ?? 0,
        high: quotes.high[i] ?? 0,
        low: quotes.low[i] ?? 0,
        close: quotes.close[i] ?? 0,
      })).filter((d: { close: number }) => d.close > 0);
    }
  } catch (e) {
    console.warn("Yahoo Finance API failed, using mock data:", e);
  }
  return null;
};

export const fetchAlphaVantage = async (symbol: string, functionType = "TIME_SERIES_DAILY") => {
  if (!ALPHA_VANTAGE_KEY) return null;
  try {
    const url = `https://www.alphavantage.co/query?function=${functionType}&symbol=${symbol}.BSE&apikey=${ALPHA_VANTAGE_KEY}`;
    const res = await fetch(url);
    return await res.json();
  } catch (e) {
    console.warn("Alpha Vantage API failed:", e);
  }
  return null;
};
