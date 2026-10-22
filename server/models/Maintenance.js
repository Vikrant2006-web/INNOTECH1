
import mongoose from "mongoose";

const maintenanceSchema = new mongoose.Schema(
  {
    resident: {
      type: String,
      required: [true, "Resident name is required"],
      trim: true,
    },
    flat: {
      type: String,
      required: [true, "Flat number is required"],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, "Maintenance amount is required"],
      min: [0, "Amount cannot be negative"],
    },
    month: {
      type: String,
      required: [true, "Month is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["Paid", "Pending", "Overdue"],
      default: "Pending",
    },
    dueDate: {
      type: Date,
      required: [true, "Due date is required"],
    },
    paidAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const Maintenance = mongoose.model(
  "Maintenance",
  maintenanceSchema
);

export default Maintenance;
