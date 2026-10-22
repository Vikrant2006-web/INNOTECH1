
import express from "express";
import Approval from "../models/Approval.js";
import AuditLog from "../models/AuditLog.js";

const router = express.Router();

// Audit log helper
async function createAuditLog({
  action,
  details,
  entityId,
}) {
  try {
    await AuditLog.create({
      action,
      performedBy: "Society Admin",
      details,
      entityType: "Approval",
      entityId: entityId ? String(entityId) : "",
    });
  } catch (error) {
    // Audit failure should not undo a successful approval action.
    console.error("Audit log save failed:", error.message);
  }
}

// Saari approval requests fetch karna
router.get("/", async (req, res) => {
  try {
    const approvals = await Approval.find().sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      approvals,
    });
  } catch (error) {
    console.error("Approvals fetch error:", error.message);
    res.status(500).json({
      success: false,
      message: "Approvals load nahi ho sake.",
    });
  }
});

// Nayi approval request add karna
router.post("/", async (req, res) => {
  try {
    const { title, description, requestedBy } = req.body;

    if (
      typeof title !== "string" ||
      !title.trim() ||
      typeof requestedBy !== "string" ||
      !requestedBy.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Title aur requested by bharna zaroori hai.",
      });
    }

    const approval = await Approval.create({
      title: title.trim(),
      description:
        typeof description === "string"
          ? description.trim()
          : "",
      requestedBy: requestedBy.trim(),
    });

    await createAuditLog({
      action: "Approval Created",
      details: `${approval.title} requested by ${approval.requestedBy}`,
      entityId: approval._id,
    });

    res.status(201).json({
      success: true,
      message: "Approval request add ho gayi.",
      approval,
    });
  } catch (error) {
    console.error("Approval create error:", error.message);
    res.status(500).json({
      success: false,
      message: "Approval save nahi ho saki.",
    });
  }
});

// Approval approve ya reject karna
router.patch("/:id", async (req, res) => {
  try {
    const { status } = req.body;

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status Approved ya Rejected hona chahiye.",
      });
    }

    const approval = await Approval.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!approval) {
      return res.status(404).json({
        success: false,
        message: "Approval request nahi mili.",
      });
    }

    await createAuditLog({
      action: `Approval ${status}`,
      details: `${approval.title} — requested by ${approval.requestedBy}`,
      entityId: approval._id,
    });

    res.json({
      success: true,
      approval,
    });
  } catch (error) {
    console.error("Approval update error:", error.message);
    res.status(500).json({
      success: false,
      message: "Approval status update nahi ho saka.",
    });
  }
});

export default router;
