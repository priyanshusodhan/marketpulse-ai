import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";

export async function GET() {
  try {
    const conn = await connectDB();
    const ok = Boolean(conn);
    return NextResponse.json({
      ok,
      dbConfigured: ok,
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        dbConfigured: true,
        error: "DB connection failed",
      },
      { status: 500 },
    );
  }
}
