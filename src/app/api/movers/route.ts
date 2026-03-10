import { NextResponse } from "next/server";
import { fetchMovers } from "@/services/stockService";

export async function GET() {
  try {
    const { gainers, losers } = await fetchMovers();
    return NextResponse.json({ gainers, losers });
  } catch {
    return NextResponse.json({ gainers: [], losers: [] });
  }
}
