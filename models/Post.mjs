import mongoose from "mongoose";

const PostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide a title for the blog"],
      maxlength: 300,
    },
    content: {
      type: String,
      required: [true, "Please provide content for the blog"],
      maxlength: 40000,
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide the user"],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Posts", PostSchema);
