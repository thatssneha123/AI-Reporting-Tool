const router = require("express").Router();
const { uploadDataset, getHistory, deleteDataset } = require("../controllers/dataset.controller");
const { protect } = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");
const fs = require("fs"); if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");
router.post("/upload", protect, upload.single("file"), uploadDataset);
router.get("/history", protect, getHistory);
router.delete("/:id", protect, deleteDataset);
module.exports = router;
