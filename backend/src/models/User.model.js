const { Schema, model } = require("mongoose");
const userSchema = new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  plan: { type: String, enum: ["free", "basic", "pro", "enterprise"], default: "free" },
  isVerified: { type: Boolean, default: false },
  otp: String,
  otpExpiry: Date,
  resetOtp: String,
  resetOtpExpiry: Date,
}, { timestamps: true });
module.exports = model("User", userSchema);
