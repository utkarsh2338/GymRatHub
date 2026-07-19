import { Schema, model } from "mongoose";

const CommentSchema = new Schema(
  {
    postId: { type: Schema.Types.ObjectId, ref: "Post", required: true, index: true },
    clerkId: { type: String, required: true, index: true },
    author: {
      name: { type: String, required: true },
      avatar: { type: String, default: "" },
    },
    content: { type: String, required: true, maxlength: 1000 },
    editedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const CommentModel = model("Comment", CommentSchema);
export default CommentModel;
