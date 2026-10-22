import express from "express";
import AuditLog from "../models/AuditLog.js";

const router = express.Router();

// Get all audit logs
router.get("/", async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .sort({ createdAt: -1 })
      .limit(200);

    res.json({
      success: true,
      logs,
    });
  } catch (error) {
    console.error("Audit logs fetch error:", error);

    res.status(500).json({
      success: false,
      message: "Audit logs fetch nahi ho sake.",
    });
  }
});

// Create a new audit log
router.post("/", async (req, res) => {
  try {
    const { action, performedBy, details, entityType, entityId } =
      req.body;

    if (!action || !action.trim()) {
      return res.status(400).json({
        success: false,
        message: "Action required hai.",
      });
    }

    const log = await AuditLog.create({
      action,
      performedBy,
      details,
      entityType,
      entityId,
    });

    res.status(201).json({
      success: true,
      message: "Audit log save ho gaya.",
      log,
    });
  } catch (error) {
    console.error("Audit log create error:", error);

    res.status(500).json({
      success: false,
      message: "Audit log save nahi ho saka.",
    });
  }
});

export default router;