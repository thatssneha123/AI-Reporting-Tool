const bcrypt = require("bcryptjs");
const User = require("../models/User.model");
const generateToken = require("../utils/generateToken");
const sendEmail = require("../utils/sendEmail");
const { otpTemplate } = require("../utils/emailTemplates");

const OTP_TTL_MS = 10 * 60 * 1000;
const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();
const publicUser = (user) => ({ id: user._id, name: user.name, email: user.email, plan: user.plan });
const sendOtpEmail = async (email, otp, type) => {
  const subject = type === "reset" ? "Reset your password OTP" : "Verify your email OTP";
  try {
    await sendEmail({ to: email, subject, html: otpTemplate(otp, type) });
    return { delivered: true };
  } catch (error) {
    if (process.env.NODE_ENV === "production") {
      throw createError("Unable to send OTP email. Please try again later.", 502);
    }

    console.warn(`OTP email delivery failed for ${email}: ${error.message}`);
    console.warn(`Development OTP for ${email}: ${otp}`);
    return { delivered: false, devOtp: otp };
  }
};

exports.signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) throw createError("Name, email, and password are required");
    if (password.length < 6) throw createError("Password must be at least 6 characters");

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) throw createError("Email already registered");

    const hashed = await bcrypt.hash(password, 12);
    const userData = {
      name: name.trim(),
      email: normalizedEmail,
      password: hashed,
      isVerified: true,
      otp: undefined,
      otpExpiry: undefined,
    };
    const user = await User.create(userData);
    const token = generateToken(user._id);

    res.status(201).json({ message: "Signup successful", token, user: publicUser(user) });
  } catch (err) { next(err); }
};

exports.verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) throw createError("Email and OTP are required");

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) throw createError("User not found", 404);
    if (user.isVerified) throw createError("Account is already verified");
    if (user.otp !== otp) throw createError("Invalid OTP");
    if (!user.otpExpiry || user.otpExpiry < new Date()) throw createError("OTP has expired");

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    const token = generateToken(user._id);
    res.json({ message: "Email verified successfully", token, user: publicUser(user) });
  } catch (err) { next(err); }
};

exports.resendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) throw createError("Email is required");

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) throw createError("User not found", 404);
    if (user.isVerified) throw createError("Account is already verified");

    const otp = generateOtp();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + OTP_TTL_MS);
    await user.save();
    const emailResult = await sendOtpEmail(user.email, otp, "verification");

    res.json({
      message: emailResult.delivered ? "A new OTP has been sent" : "Email delivery failed, so use the development OTP.",
      emailSent: emailResult.delivered,
      ...(emailResult.devOtp ? { devOtp: emailResult.devOtp } : {}),
    });
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) throw createError("Email and password are required");

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ message: "Invalid credentials" });
    if (!user.isVerified) {
      user.isVerified = true;
      user.otp = undefined;
      user.otpExpiry = undefined;
      await user.save();
    }

    const token = generateToken(user._id);
    res.json({ token, user: publicUser(user) });
  } catch (err) { next(err); }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) throw createError("Email is required");

    const user = await User.findOne({ email: email.toLowerCase().trim(), isVerified: true });
    if (!user) throw createError("No verified account found for this email", 404);

    const otp = generateOtp();
    user.resetOtp = otp;
    user.resetOtpExpiry = new Date(Date.now() + OTP_TTL_MS);
    await user.save();
    const emailResult = await sendOtpEmail(user.email, otp, "reset");

    res.json({
      message: emailResult.delivered
        ? "Password reset OTP sent to your email"
        : "Email delivery failed, so use the development OTP.",
      email: user.email,
      emailSent: emailResult.delivered,
      ...(emailResult.devOtp ? { devOtp: emailResult.devOtp } : {}),
    });
  } catch (err) { next(err); }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) throw createError("Email, OTP, and new password are required");
    if (newPassword.length < 6) throw createError("Password must be at least 6 characters");

    const user = await User.findOne({ email: email.toLowerCase().trim(), isVerified: true });
    if (!user) throw createError("User not found", 404);
    if (user.resetOtp !== otp) throw createError("Invalid OTP");
    if (!user.resetOtpExpiry || user.resetOtpExpiry < new Date()) throw createError("OTP has expired");

    user.password = await bcrypt.hash(newPassword, 12);
    user.resetOtp = undefined;
    user.resetOtpExpiry = undefined;
    await user.save();

    res.json({ message: "Password reset successfully" });
  } catch (err) { next(err); }
};

exports.getMe = async (req, res, next) => {
  try {
    res.json({ user: publicUser(req.user) });
  } catch (err) { next(err); }
};
