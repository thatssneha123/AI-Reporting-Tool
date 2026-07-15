const Dataset = require("../models/Dataset.model");
const Analysis = require("../models/Analysis.model");
const { analyzeFileWithAi, summarizeFileWithAi } = require("../services/ai.service");

exports.analyze = async (req, res, next) => {
  try {
    const { datasetId, query = "" } = req.body;
    if (!datasetId) return res.status(400).json({ message: "datasetId is required" });

    const dataset = await Dataset.findOne({ _id: datasetId, userId: req.user._id });
    if (!dataset) return res.status(404).json({ message: "Dataset not found" });

    let result;

    // Dashboard mode: empty query → only analyzeFileWithAi (triggers full dashboard)
    // Analyze mode: non-empty query → analyzeFileWithAi + summarizeFileWithAi (existing behavior)
    const chartResult = await analyzeFileWithAi({
      filePath: dataset.path,
      query,
    });

    if (query.trim()) {
      // Analyze mode: merge grocery summary (existing behavior)
      const groceryResult = await summarizeFileWithAi(dataset.path);
      result = {
        ...chartResult,
        ...groceryResult,
      };
    } else {
      // Dashboard mode: just use chartResult (already has everything)
      result = chartResult;
    }

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
