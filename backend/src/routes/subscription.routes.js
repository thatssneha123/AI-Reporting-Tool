const router = require("express").Router();
const { getPlans, subscribe, getStatus } = require("../controllers/subscription.controller");
const { protect } = require("../middleware/auth.middleware");
router.get("/plans", getPlans);
router.post("/subscribe", protect, subscribe);
router.get("/status", protect, getStatus);
module.exports = router;
