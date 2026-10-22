
import { useEffect, useState } from "react";
import { complaintAPI, maintenanceAPI } from "./services/api";

function AIOperations() {
  const [complaints, setComplaints] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [complaintResponse, maintenanceResponse] =
          await Promise.all([
            complaintAPI.getAll(),
            maintenanceAPI.getAll(),
          ]);

        const complaintData =
          complaintResponse?.data ?? complaintResponse;

        const maintenanceData =
          maintenanceResponse?.data ?? maintenanceResponse;

        setComplaints(
          Array.isArray(complaintData)
            ? complaintData
            : complaintData?.complaints ?? []
        );

        setMaintenance(
          Array.isArray(maintenanceData)
            ? maintenanceData
            : maintenanceData?.records ?? []
        );
      } catch (err) {
        setError(
          err.message || "AI Operations data load nahi ho saka."
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const openComplaints = complaints.filter(
    (item) =>
      !["resolved", "closed", "completed"].includes(
        String(item.status || "").toLowerCase()
      )
  );

  const urgentComplaints = openComplaints.filter((item) => {
    const priority = String(item.priority || "").toLowerCase();

    return ["high", "urgent", "critical"].includes(priority);
  });

  const pendingPayments = maintenance.filter(
    (item) => item.status !== "Paid"
  );

  const pendingAmount = pendingPayments.reduce(
    (total, item) => total + Number(item.amount || 0),
    0
  );

  const overduePayments = pendingPayments.filter((item) => {
    if (!item.dueDate) return false;

    return new Date(item.dueDate) < new Date();
  });

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);

  const insights = [
    {
      title: "Complaint Workload",
      value: openComplaints.length,
      description:
        openComplaints.length > 0
          ? "Open complaints ko review aur assign karein."
          : "Koi open complaint nahi hai.",
      type: openComplaints.length > 0 ? "warning" : "success",
    },
    {
      title: "High-Priority Complaints",
      value: urgentComplaints.length,
      description:
        urgentComplaints.length > 0
          ? "High ya urgent priority complaints par pehle action lein."
          : "Koi high-priority complaint marked nahi hai.",
      type: urgentComplaints.length > 0 ? "danger" : "success",
    },
    {
      title: "Pending Maintenance",
      value: formatCurrency(pendingAmount),
      description: `${pendingPayments.length} payment records unpaid hain.`,
      type: pendingPayments.length > 0 ? "warning" : "success",
    },
    {
      title: "Overdue Payments",
      value: overduePayments.length,
      description:
        "Due date guzar chuki hai aur payment abhi Paid nahi hai.",
      type: overduePayments.length > 0 ? "danger" : "success",
    },
  ];

  const recommendations = [];

  if (urgentComplaints.length > 0) {
    recommendations.push({
      title: "Urgent complaints review karein",
      detail: `${urgentComplaints.length} complaint(s) high, urgent ya critical priority par marked hain. Inhe review karke responsible staff ko assign karein.`,
    });
  }

  if (openComplaints.length > 0) {
    recommendations.push({
      title: "Open complaints follow up karein",
      detail: `${openComplaints.length} complaint(s) abhi resolved, closed ya completed status mein nahi hain.`,
    });
  }

  if (overduePayments.length > 0) {
    recommendations.push({
      title: "Overdue payments follow up karein",
      detail: `${overduePayments.length} maintenance record(s) ki due date guzar chuki hai. Payment status verify karein.`,
    });
  }

  if (pendingPayments.length > 0) {
    recommendations.push({
      title: "Maintenance collection monitor karein",
      detail: `${formatCurrency(pendingAmount)} maintenance amount unpaid records mein hai. Residents ke saath payment follow-up karein.`,
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      title: "Operations looking good",
      detail:
        "Current data ke hisaab se koi open complaint ya unpaid maintenance record nahi mila.",
    });
  }

  if (loading) {
    return (
      <div className="ai-operations-page">
        <h1>AI Operations</h1>
        <p>Society operations data load ho raha hai...</p>
      </div>
    );
  }

  return (
    <div className="ai-operations-page">
      <div className="ai-operations-header">
        <div>
          <h1>AI Operations</h1>
          <p>
            Society data se operational insights aur suggested actions.
          </p>
        </div>

        <span className="ai-label">AI Insights</span>
      </div>

      {error && (
        <div className="ai-error">
          {error}
        </div>
      )}

      <div className="ai-insights-grid">
        {insights.map((insight) => (
          <div
            className="ai-insight-card"
            key={insight.title}
          >
            <span className="ai-insight-title">
              {insight.title}
            </span>

            <h2>{insight.value}</h2>

            <p>{insight.description}</p>

            <span className={`ai-status ${insight.type}`}>
              {insight.type === "danger"
                ? "Needs attention"
                : insight.type === "warning"
                ? "Review recommended"
                : "On track"}
            </span>
          </div>
        ))}
      </div>

      <section className="ai-recommendations">
        <div className="ai-section-heading">
          <div>
            <h2>Recommended Actions</h2>
            <p>
              Rules-based suggestions generated from available records.
            </p>
          </div>
        </div>

        <div className="ai-recommendation-list">
          {recommendations.map((item, index) => (
            <div
              className="ai-recommendation-item"
              key={item.title}
            >
              <div className="ai-recommendation-number">
                {index + 1}
              </div>

              <div>
                <h3>{item.title}</h3>
                <p>{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="ai-recommendations">
        <h2>Operations Summary</h2>

        <div className="ai-summary-row">
          <span>Total complaints</span>
          <strong>{complaints.length}</strong>
        </div>

        <div className="ai-summary-row">
          <span>Open complaints</span>
          <strong>{openComplaints.length}</strong>
        </div>

        <div className="ai-summary-row">
          <span>Total maintenance records</span>
          <strong>{maintenance.length}</strong>
        </div>

        <div className="ai-summary-row">
          <span>Paid maintenance records</span>
          <strong>
            {maintenance.filter((item) => item.status === "Paid").length}
          </strong>
        </div>
      </section>

      <p className="ai-disclaimer">
        Note: Yeh suggestions existing records aur simple rules par based
        hain. Yeh live AI model predictions nahi hain.
      </p>
    </div>
  );
}

export default AIOperations;
