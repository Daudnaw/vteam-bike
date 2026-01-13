import mongoose from "mongoose";

const PaymentEventSchema = new mongoose.Schema(
  {
    stripeSessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    userId: {
      type: String,
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: ["credits", "membership"],
      required: true,
    },

    amountSek: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "sek",
    },

    tier: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.model("PaymentEvent", PaymentEventSchema);