const { Schema, model } = require("mongoose");
const datasetSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  size: Number,
  path: String,
}, { timestamps: true });
module.exports = model("Dataset", datasetSchema);
