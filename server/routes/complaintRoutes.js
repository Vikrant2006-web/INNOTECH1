
import express from "express";
import mongoose from "mongoose";
import Complaint from "../models/Complaint.js";

const router = express.Router();

// GET: All complaints
router.get("/", async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({
      createdAt: -1,
    });

    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch complaints." });
  }
});

// POST: Add complaint
router.post("/", async (req, res) => {
  try {
    const { resident, flat, category, description, priority, status } =
      req.body;

    if (
      typeof resident !== "string" ||
      !resident.trim() ||
      typeof flat !== "string" ||
      !flat.trim() ||
      typeof description !== "string" ||
      !description.trim()
    ) {
      return res.status(400).json({
        message: "Resident, flat and description are required.",
      });
    }

    const complaint = await Complaint.create({
      resident,
      flat,
      category,
      description,
      priority,
      status,
    });

    res.status(201).json(complaint);
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ message: "Failed to create complaint." });
  }
});

// PUT: Update complaint
router.put("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid complaint ID." });
    }

    const allowedFields = [
      "resident",
      "flat",
      "category",
      "description",
      "priority",
      "status",
    ];

    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([key]) =>
        allowedFields.includes(key)
      )
    );

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      updates,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found." });
    }

    res.json(complaint);
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ message: "Failed to update complaint." });
  }
});

// DELETE: Remove complaint
router.delete("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid complaint ID." });
    }

    const complaint = await Complaint.findByIdAndDelete(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found." });
    }

    res.json({ message: "Complaint deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete complaint." });
  }
});

export default router;
