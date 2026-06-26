import { Schema, model } from "mongoose";

const PostSchema = new Schema({
  clerkId: { type: String, required: true, index: true },
  author: {
    name: { type: String, required: true },
    avatar: { type: String, default: "" },
    badge: { type: String, default: "" },
  },
  content: { type: String, required: true },
  tags: [{ type: String }],
  likes: [{ type: String }], // Array of clerkIds who liked the post
  commentsCount: { type: Number, default: 0 },
  shares: { type: Number, default: 0 },
  imageUrl: { type: String, default: "" },
  type: { type: String, enum: ["achievement", "progress", "general"], default: "general" },
}, { timestamps: true });

export const PostModel = model("Post", PostSchema);
export default PostModel;
