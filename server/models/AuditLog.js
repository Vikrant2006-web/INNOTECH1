import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      trim: true,
    },
    performedBy: {
      type: String,
      default: "Society Admin",
    },
    details: {
      type: String,
      default: "",
    },
    entityType: {
      type: String,
      default: "General",
    },
    entityId: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.model("AuditLog", auditLogSchema);