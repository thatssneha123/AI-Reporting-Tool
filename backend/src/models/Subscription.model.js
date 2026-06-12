const { Schema, model } = require("mongoose");
const subSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  plan: { type: String, enum: ["basic", "pro", "enterprise"], required: true },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
  paymentId: String,
}, { timestamps: true });
module.exports = model("Subscription", subSchema);
