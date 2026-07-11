import { Schema, model } from "mongoose";

const ProgressPhotoSchema = new Schema(
  {
    clerkId: { type: String, required: true, index: true },
    imageUrl: { type: String, required: true },
    date: { type: String, required: true }, // format YYYY-MM-DD
    weightKg: { type: Number, default: null },
  },
  { timestamps: true }
);

// Compound index for sorting user's photos by date
ProgressPhotoSchema.index({ clerkId: 1, date: -1 });

export const ProgressPhotoModel = model("ProgressPhoto", ProgressPhotoSchema);
export default ProgressPhotoModel;
