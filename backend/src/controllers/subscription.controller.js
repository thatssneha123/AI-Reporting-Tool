const Subscription = require("../models/Subscription.model");
const User = require("../models/User.model");
const PLANS = {
  basic: { duration: 30, price: 299 },
  pro: { duration: 60, price: 799 },
  enterprise: { duration: 90, price: 1999 },
};

exports.getPlans = (req, res) => res.json(PLANS);

exports.subscribe = async (req, res, next) => {
  try {
    const { plan } = req.body;
    if (!PLANS[plan]) return res.status(400).json({ message: "Invalid plan" });
    const endDate = new Date(); endDate.setDate(endDate.getDate() + PLANS[plan].duration);
    await Subscription.updateMany({ userId: req.user._id }, { isActive: false });
    const sub = await Subscription.create({ userId: req.user._id, plan, endDate });
    await User.findByIdAndUpdate(req.user._id, { plan });
    res.status(201).json(sub);
  } catch (err) { next(err); }
};

exports.getStatus = async (req, res, next) => {
  try {
    const sub = await Subscription.findOne({ userId: req.user._id, isActive: true }).sort({ createdAt: -1 });
    res.json(sub || { plan: "free" });
  } catch (err) { next(err); }
};
