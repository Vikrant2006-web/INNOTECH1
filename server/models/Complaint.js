
import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema(
  {
    resident: {
      type: String,
      required: true,
      trim: true,
    },
    flat: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      default: "Other",
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Urgent"],
      default: "Medium",
    },
    status: {
      type: String,
      enum: ["Open", "In Progress", "Resolved"],
      default: "Open",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Complaint", complaintSchema);
