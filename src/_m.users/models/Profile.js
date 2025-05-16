import mongoose from "mongoose";

const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    karma: { type: Number, default: 0 },
    avatar: { type: String }, // URL or file path
    bio: { type: String, maxlength: 500 },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Profile ||
  mongoose.model("Profile", profileSchema);
