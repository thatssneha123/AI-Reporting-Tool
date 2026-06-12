const router = require("express").Router();
const { analyze, summary } = require("../controllers/analyze.controller");
const { protect } = require("../middleware/auth.middleware");

router.post("/analyze", protect, analyze);
router.get("/summary/:datasetId", protect, summary);

module.exports = router;
