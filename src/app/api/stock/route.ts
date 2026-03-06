import { NextResponse } from "next/server";
import { fetchStockData } from "@/services/api";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol") || "RELIANCE";
  const range = searchParams.get("range") || "1mo";

  try {
    const data = await fetchStockData(symbol, range);
    if (data && data.length > 0) {
      return NextResponse.json(data);
    }
    // Return mock data if API fails
    const { generateCandleData } = await import("@/utils/mockData");
    const days = range === "1d" ? 1 : range === "1wk" ? 7 : range === "1mo" ? 30 : 365;
    return NextResponse.json(generateCandleData(days));
  } catch (e) {
    const { generateCandleData } = await import("@/utils/mockData");
    return NextResponse.json(generateCandleData(30));
  }
}
