import mongoose from "mongoose";

const answerSchema = new mongoose.Schema(
  {
    questionId: { type: String, required: true },
    // for MCQ: option index number
    answer: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { _id: false }
);

const violationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["TAB_HIDDEN", "BLUR", "FULLSCREEN_EXIT", "CAMERA", "LOOKING_AWAY"],
      required: true,
    },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const attemptSchema = new mongoose.Schema(
  {
    testId: { type: mongoose.Schema.Types.ObjectId, ref: "Test", required: true },
    tokenId: { type: mongoose.Schema.Types.ObjectId, ref: "TestToken", required: true },

    startedAt: { type: Date, required: true },
    submittedAt: { type: Date, default: null },

    status: {
      type: String,
      enum: ["active", "locked", "submitted", "expired"],
      default: "active",
      index: true,
    },

    violationsCount: { type: Number, default: 0 },
    violations: { type: [violationSchema], default: [] },

    answers: { type: [answerSchema], default: [] },

    score: { type: Number, default: 0 },
    maxScore: { type: Number, default: 0 },

    client: {
      userAgent: { type: String, default: "" },
      ip: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

export default mongoose.models.Attempt || mongoose.model("Attempt", attemptSchema);
