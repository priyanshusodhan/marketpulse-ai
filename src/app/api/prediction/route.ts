import { NextResponse } from "next/server";
import { fetchChart } from "@/services/stockService";

type HorizonKey = "1W" | "1M" | "6M" | "1Y";

interface HorizonConfig {
  key: HorizonKey;
  label: string;
  range: string;
  points: number;
  days: number;
}

const HORIZONS: Record<HorizonKey, HorizonConfig> = {
  "1W": { key: "1W", label: "1 Week", range: "6M", points: 7, days: 7 },
  "1M": { key: "1M", label: "1 Month", range: "1Y", points: 30, days: 30 },
  "6M": { key: "6M", label: "6 Months", range: "5Y", points: 26, days: 182 },
  "1Y": { key: "1Y", label: "1 Year", range: "5Y", points: 52, days: 365 },
};

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

// Abramowitz and Stegun approximation for erf.
function erf(x: number): number {
  const sign = x >= 0 ? 1 : -1;
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  const absX = Math.abs(x);
  const t = 1 / (1 + p * absX);
  const y = 1 - (((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t) * Math.exp(-absX * absX);
  return sign * y;
}

function normalCdf(x: number): number {
  return 0.5 * (1 + erf(x / Math.sqrt(2)));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = (searchParams.get("symbol") || "RELIANCE").trim().toUpperCase();
  const horizonKey = (searchParams.get("horizon") || "1M").toUpperCase() as HorizonKey;
  const cfg = HORIZONS[horizonKey] ?? HORIZONS["1M"];

  try {
    const chart = await fetchChart(symbol, cfg.range);
    if (!Array.isArray(chart) || chart.length < 40) {
      return NextResponse.json(
        { error: `Insufficient historical data for ${symbol}` },
        { status: 400 },
      );
    }

    const closes = chart.map((d) => d.close).filter((v) => Number.isFinite(v) && v > 0);
    if (closes.length < 40) {
      return NextResponse.json({ error: `No valid close data for ${symbol}` }, { status: 400 });
    }

    const returns: number[] = [];
    for (let i = 1; i < closes.length; i++) {
      returns.push(Math.log(closes[i] / closes[i - 1]));
    }
    const lookback = returns.slice(-120);
    const mean = lookback.reduce((a, b) => a + b, 0) / lookback.length;
    const variance = lookback.reduce((s, r) => s + (r - mean) ** 2, 0) / lookback.length;
    const sigma = Math.sqrt(Math.max(variance, 1e-8));

    const lastPrice = closes[closes.length - 1];
    const startTs = chart[chart.length - 1]?.time ?? Math.floor(Date.now() / 1000);
    const dayStep = cfg.days / cfg.points;

    const prediction: { x: number; y: number }[] = [];
    const upperBand: { x: number; y: number }[] = [];
    const lowerBand: { x: number; y: number }[] = [];
    const confidenceWave: number[] = [];

    for (let i = 1; i <= cfg.points; i++) {
      const nDays = dayStep * i;
      const m = mean * nDays;
      const sd = Math.max(sigma * Math.sqrt(nDays), 1e-6);
      const expected = lastPrice * Math.exp(m);
      const upper = lastPrice * Math.exp(m + 1.28 * sd);
      const lower = lastPrice * Math.exp(m - 1.28 * sd);
      const x = startTs + Math.round(nDays * 86400);

      prediction.push({ x, y: expected });
      upperBand.push({ x, y: upper });
      lowerBand.push({ x, y: lower });

      const spreadRatio = (upper - lower) / expected;
      const stepConfidence = clamp(95 - spreadRatio * 110, 25, 90);
      confidenceWave.push(Math.round(stepConfidence));
    }

    const horizonDays = cfg.days;
    const mT = mean * horizonDays;
    const sdT = Math.max(sigma * Math.sqrt(horizonDays), 1e-6);
    const zUp = (Math.log(1.05) - mT) / sdT;
    const zDown = (Math.log(0.95) - mT) / sdT;

    const upsideProb = clamp((1 - normalCdf(zUp)) * 100, 1, 98);
    const downsideProb = clamp(normalCdf(zDown) * 100, 1, 98);
    const stableProb = clamp(100 - upsideProb - downsideProb, 1, 98);

    const testWindow = Math.min(40, returns.length - 1);
    let absErr = 0;
    for (let i = returns.length - testWindow; i < returns.length; i++) {
      const actual = returns[i];
      absErr += Math.abs(actual - mean);
    }
    const meanAbsErr = absErr / Math.max(testWindow, 1);
    const confidence = clamp(85 - meanAbsErr * 900 - sigma * 120, 35, 92);

    const expectedEnd = prediction[prediction.length - 1]?.y ?? lastPrice;
    const expectedChangePct = ((expectedEnd - lastPrice) / lastPrice) * 100;
    const signal =
      upsideProb - downsideProb > 18 ? "BUY" : downsideProb - upsideProb > 18 ? "SELL" : "HOLD";

    return NextResponse.json({
      symbol,
      horizon: cfg.label,
      model: "Probabilistic Trend Model (returns + volatility)",
      lastPrice,
      prediction,
      upperBand,
      lowerBand,
      confidenceWave,
      metrics: {
        expectedPrice: expectedEnd,
        expectedChangePct,
        upperPrice: upperBand[upperBand.length - 1]?.y ?? expectedEnd,
        lowerPrice: lowerBand[lowerBand.length - 1]?.y ?? expectedEnd,
        upsideProb,
        stableProb,
        downsideProb,
        confidence,
        signal,
      },
    });
  } catch (error) {
    console.error("Prediction API failed:", error);
    return NextResponse.json({ error: "Prediction fetch failed" }, { status: 500 });
  }
}

