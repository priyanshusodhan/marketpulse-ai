import { Schema, model, models } from "mongoose";

export interface IpoApplicationDocument {
  userId?: string;
  ipoName: string;
  upiId: string;
  amount: number;
  status: "PENDING" | "CONFIRMED";
  createdAt: Date;
  updatedAt: Date;
}

const IpoApplicationSchema = new Schema<IpoApplicationDocument>(
  {
    userId: { type: String },
    ipoName: { type: String, required: true },
    upiId: { type: String, required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ["PENDING", "CONFIRMED"], default: "PENDING" },
  },
  { timestamps: true },
);

export const IpoApplication =
  models.IpoApplication || model<IpoApplicationDocument>("IpoApplication", IpoApplicationSchema);

