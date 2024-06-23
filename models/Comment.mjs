import mongoose from "mongoose";

const PostSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Types.ObjectId,
      ref: "Post",
      required: [true, "Please provide the post id of the comment"],
    },
    comment: {
      type: String,
      required: [true, "Please provide a comment for the post"],
      maxlength: 40000,
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide the user who is commenting"],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Posts", PostSchema);
