const Dataset = require("../models/Dataset.model");
const Analysis = require("../models/Analysis.model");
const { analyzeFileWithAi, summarizeFileWithAi } = require("../services/ai.service");

exports.analyze = async (req, res, next) => {
  try {
    const { datasetId, query } = req.body;
    if (!datasetId || !query) return res.status(400).json({ message: "datasetId and query are required" });

    const dataset = await Dataset.findOne({ _id: datasetId, userId: req.user._id });
    if (!dataset) return res.status(404).json({ message: "Dataset not found" });

    const result = await analyzeFileWithAi({ filePath: dataset.path, query });
    const analysis = await Analysis.create({ userId: req.user._id, datasetId, query, result });
    res.json({ ...result, analysisId: analysis._id });
  } catch (err) { next(err); }
};

exports.summary = async (req, res, next) => {
  try {
    const { datasetId } = req.params;
    const dataset = await Dataset.findOne({ _id: datasetId, userId: req.user._id });
    if (!dataset) return res.status(404).json({ message: "Dataset not found" });

    const result = await summarizeFileWithAi(dataset.path);
    res.json(result);
  } catch (err) { next(err); }
};
