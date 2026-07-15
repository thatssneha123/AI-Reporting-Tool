const { Schema, model } = require("mongoose");
const analysisSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  datasetId: { type: Schema.Types.ObjectId, ref: "Dataset", required: true },
  query: { type: String, default: "" },
  result: { type: Schema.Types.Mixed, required: true },
}, { timestamps: true });
module.exports = model("Analysis", analysisSchema);
