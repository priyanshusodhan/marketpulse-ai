import { NextResponse } from "next/server";
import { fetchNifty50 } from "@/services/stockService";

export async function GET() {
  try {
    const data = await fetchNifty50();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json([]);
  }
}
