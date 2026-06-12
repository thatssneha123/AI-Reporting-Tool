const router = require("express").Router();
const { signup, login, forgotPassword, resetPassword, getMe } = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth.middleware");
router.post("/signup", signup);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/me", protect, getMe);
module.exports = router;
