import { Schema, model, models } from "mongoose";

export interface Holding {
  symbol: string;
  qty: number;
  avgPrice: number;
  currentPrice: number;
}

export interface PortfolioDocument {
  userId: string;
  holdings: Holding[];
  createdAt: Date;
  updatedAt: Date;
}

const HoldingSchema = new Schema<Holding>(
  {
    symbol: { type: String, required: true },
    qty: { type: Number, required: true },
    avgPrice: { type: Number, required: true },
    currentPrice: { type: Number, required: true },
  },
  { _id: false },
);

const PortfolioSchema = new Schema<PortfolioDocument>(
  {
    userId: { type: String, required: true, index: true },
    holdings: { type: [HoldingSchema], default: [] },
  },
  {
    timestamps: true,
  },
);

export const Portfolio = models.Portfolio || model<PortfolioDocument>("Portfolio", PortfolioSchema);

