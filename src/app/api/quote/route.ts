import { NextResponse } from "next/server";
import { fetchFullQuote, fetchMultipleQuotes } from "@/services/stockService";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");
  const symbols = searchParams.get("symbols");

  try {
    if (symbols) {
      const list = symbols.split(",").map((s) => s.trim()).filter(Boolean);
      const data = await fetchMultipleQuotes(list);
      return NextResponse.json(data);
    }
    if (symbol) {
      const data = await fetchFullQuote(symbol);
      return NextResponse.json(data ?? {});
    }
    return NextResponse.json({ error: "Missing symbol or symbols" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({}, { status: 500 });
  }
}
