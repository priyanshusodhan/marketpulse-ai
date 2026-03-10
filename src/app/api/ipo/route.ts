import { NextResponse } from "next/server";
import { fetchIpos } from "@/services/ipoService";

export async function GET() {
  try {
    const data = await fetchIpos();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ upcoming: [], open: [], closed: [] });
  }
}
