import { Schema, model } from "mongoose";

const UserChallengeSchema = new Schema({
  clerkId: { type: String, required: true, index: true },
  challengeId: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String },
  category: { type: String },
  progress: { type: Number, default: 0 }, // 0 to 100
  xpReward: { type: Number, default: 100 },
  endDate: { type: String },
  participants: { type: Number, default: 100 },
  status: { type: String, enum: ["active", "completed", "joined"], default: "active" },
  badgeEmoji: { type: String, default: "🏆" },
}, { timestamps: true });

export const UserChallengeModel = model("UserChallenge", UserChallengeSchema);
export default UserChallengeModel;
