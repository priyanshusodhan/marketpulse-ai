import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { Portfolio } from "@/models/Portfolio";

// Simple demo user id – in real app, read from auth session
const DEMO_USER_ID = "demo-user";

export async function GET() {
  try {
    const conn = await connectDB();
    if (!conn) {
      return NextResponse.json({ error: "Database not configured" }, { status: 200 });
    }

    let portfolio = await Portfolio.findOne({ userId: DEMO_USER_ID }).lean();

    if (!portfolio) {
      portfolio = await Portfolio.create({
        userId: DEMO_USER_ID,
        holdings: [
          { symbol: "RELIANCE", qty: 10, avgPrice: 2350, currentPrice: 2456.78 },
          { symbol: "TCS", qty: 5, avgPrice: 3500, currentPrice: 3654.32 },
          { symbol: "HDFC", qty: 8, avgPrice: 1600, currentPrice: 1654.21 },
          { symbol: "INFY", qty: 15, avgPrice: 1400, currentPrice: 1456.89 },
        ],
      });
    }

    return NextResponse.json(portfolio);
  } catch (error) {
    console.error("Failed to fetch portfolio", error);
    return NextResponse.json({ error: "Failed to fetch portfolio" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const conn = await connectDB();
    if (!conn) {
      return NextResponse.json({ error: "Database not configured" }, { status: 200 });
    }

    const body = await request.json();
    const { holdings } = body ?? {};

    if (!Array.isArray(holdings)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const portfolio = await Portfolio.findOneAndUpdate(
      { userId: DEMO_USER_ID },
      { $set: { holdings } },
      { upsert: true, new: true },
    );

    return NextResponse.json(portfolio);
  } catch (error) {
    console.error("Failed to update portfolio", error);
    return NextResponse.json({ error: "Failed to update portfolio" }, { status: 500 });
  }
}

