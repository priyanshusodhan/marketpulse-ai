import { NextResponse } from "next/server";
import { fetchChart } from "@/services/stockService";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol") || "RELIANCE";
  const range = searchParams.get("range") || "1M";

  try {
    const data = await fetchChart(symbol, range);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
