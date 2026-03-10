import { NextResponse } from "next/server";
import { fetchIndices } from "@/services/stockService";

export async function GET() {
  try {
    const data = await fetchIndices();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
