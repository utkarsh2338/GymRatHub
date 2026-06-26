import { Schema, model } from "mongoose";

const PersonalRecordSchema = new Schema(
  {
    clerkId: { type: String, required: true, index: true },
    exerciseName: { type: String, required: true },
    category: { type: String, default: "" },
    recordType: {
      type: String,
      enum: ["max_weight", "max_volume", "max_reps", "session_volume"],
      required: true,
    },
    weightKg: { type: Number, default: 0 },
    reps: { type: Number, default: 0 },
    volumeKg: { type: Number, default: 0 },
    sessionId: { type: String, default: "" },
    achievedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

PersonalRecordSchema.index({ clerkId: 1, exerciseName: 1, recordType: 1 });

export const PersonalRecordModel = model("PersonalRecord", PersonalRecordSchema);
export default PersonalRecordModel;
