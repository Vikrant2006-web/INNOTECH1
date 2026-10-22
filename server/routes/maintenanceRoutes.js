
import express from "express";
import Maintenance from "../models/Maintenance.js";

const router = express.Router();

// GET: Saare maintenance records
router.get("/", async (req, res) => {
  try {
    const records = await Maintenance.find().sort({ createdAt: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch maintenance records",
    });
  }
});

// POST: Naya maintenance record
router.post("/", async (req, res) => {
  try {
    const { resident, flat, amount, month, status, dueDate } = req.body;

    const record = await Maintenance.create({
      resident,
      flat,
      amount,
      month,
      status,
      dueDate,
      paidAt: status === "Paid" ? new Date() : null,
    });

    res.status(201).json(record);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT: Payment status update
router.put("/:id", async (req, res) => {
  try {
    const updates = { ...req.body };

    if (updates.status === "Paid") {
      updates.paidAt = new Date();
    } else if (updates.status) {
      updates.paidAt = null;
    }

    const record = await Maintenance.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!record) {
      return res.status(404).json({ message: "Record not found" });
    }

    res.json(record);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE: Maintenance record delete
router.delete("/:id", async (req, res) => {
  try {
    const record = await Maintenance.findByIdAndDelete(req.params.id);

    if (!record) {
      return res.status(404).json({ message: "Record not found" });
    }

    res.json({ message: "Maintenance record deleted" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
