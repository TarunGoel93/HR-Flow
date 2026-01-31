import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["mcq"],
      default: "mcq",
    },
    prompt: { type: String, required: true },
    options: { type: [String], default: [] },

    // MCQ correct option index
    correctOptionIndex: { type: Number, required: true },

    marks: { type: Number, default: 1 },
  },
  { _id: true }
);

const testSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    durationSeconds: { type: Number, default: 3600 }, // 60 min
    maxViolations: { type: Number, default: 3 },

    questions: { type: [questionSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.models.Test || mongoose.model("Test", testSchema);
