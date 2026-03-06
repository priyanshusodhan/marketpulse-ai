import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { IpoApplication } from "@/models/IpoApplication";

export async function POST(request: Request) {
  try {
    const conn = await connectDB();
    if (!conn) {
      // Still succeed on demo if DB not configured
      return NextResponse.json({ status: "OK", stored: false });
    }

    const body = await request.json();
    const { ipoName, upiId, amount } = body ?? {};

    if (!ipoName || !upiId || typeof amount !== "number") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const doc = await IpoApplication.create({
      ipoName,
      upiId,
      amount,
      status: "CONFIRMED",
    });

    return NextResponse.json({ status: "OK", stored: true, id: doc._id });
  } catch (error) {
    console.error("Failed to store IPO application", error);
    return NextResponse.json({ error: "Failed to store IPO application" }, { status: 500 });
  }
}

