const Dataset = require("../models/Dataset.model");
const fs = require("fs");

exports.uploadDataset = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const dataset = await Dataset.create({ userId: req.user._id, filename: req.file.filename, originalName: req.file.originalname, size: req.file.size, path: req.file.path });
    res.status(201).json(dataset);
  } catch (err) { next(err); }
};

exports.getHistory = async (req, res, next) => {
  try {
    const datasets = await Dataset.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(datasets);
  } catch (err) { next(err); }
};

exports.deleteDataset = async (req, res, next) => {
  try {
    const dataset = await Dataset.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!dataset) return res.status(404).json({ message: "Not found" });
    if (fs.existsSync(dataset.path)) fs.unlinkSync(dataset.path);
    res.json({ message: "Deleted" });
  } catch (err) { next(err); }
};
