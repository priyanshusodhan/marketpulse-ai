import { NextResponse } from "next/server";
import { fetchMultipleQuotes } from "@/services/stockService";

const SECTOR_STOCKS: { name: string; color: string; symbols: string[] }[] = [
  { name: "IT", color: "#00f5ff", symbols: ["TCS", "INFY", "WIPRO", "HCLTECH", "TECHM"] },
  { name: "Banking", color: "#bf00ff", symbols: ["HDFCBANK", "ICICIBANK", "SBIN", "AXISBANK", "KOTAKBANK"] },
  { name: "Auto", color: "#0066ff", symbols: ["MARUTI", "TATAMOTORS", "M&M", "HEROMOTOCO", "EICHERMOT"] },
  { name: "Pharma", color: "#00ff88", symbols: ["SUNPHARMA", "CIPLA", "DRREDDY", "DIVISLAB"] },
  { name: "FMCG", color: "#ff6600", symbols: ["HINDUNILVR", "ITC", "NESTLEIND", "BRITANNIA", "TATACONSUM"] },
  { name: "Metal", color: "#ffcc00", symbols: ["TATASTEEL", "HINDALCO", "JSWSTEEL"] },
  { name: "Energy", color: "#ff0066", symbols: ["RELIANCE", "ONGC", "COALINDIA", "POWERGRID"] },
];

export async function GET() {
  try {
    const allSymbols = SECTOR_STOCKS.flatMap((s) => s.symbols);
    const quotes = await fetchMultipleQuotes(allSymbols);
    if (quotes.length === 0) {
      return NextResponse.json([]);
    }
    const bySym = Object.fromEntries(quotes.map((q) => [q.symbol, q.changePercent]));

    const sectors = SECTOR_STOCKS.map((s) => {
      const changes = s.symbols.map((sym) => bySym[sym]).filter((c) => c != null);
      if (!changes.length) return null;
      const avg = changes.reduce((a, b) => a + b, 0) / changes.length;
      return { name: s.name, change: avg, color: s.color };
    }).filter((s): s is { name: string; change: number; color: string } => s != null);

    return NextResponse.json(sectors);
  } catch {
    return NextResponse.json([]);
  }
}
