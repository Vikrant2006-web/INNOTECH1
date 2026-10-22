
import { useEffect, useState } from "react";

const API_URL = "http://localhost:5000/api/audit-logs";

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadLogs() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_URL);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Audit logs load nahi hue.");
      }

      setLogs(data.logs || []);
    } catch (err) {
      setError(err.message || "Server se connect nahi ho paya.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLogs();
  }, []);

  return (
    <div className="dashboard">
      <div className="section-heading">
        <div>
          <h2>Audit Trail</h2>
          <p>Society operations ki activity history.</p>
        </div>

        <button
          className="primary-button"
          onClick={loadLogs}
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh Logs"}
        </button>
      </div>

      {error && (
        <div className="api-error" role="alert">
          {error}
        </div>
      )}

      <div className="activity-card">
        {loading ? (
          <p>Audit logs load ho rahe hain...</p>
        ) : logs.length === 0 ? (
          <p>Abhi koi audit activity record nahi hui hai.</p>
        ) : (
          logs.map((log) => (
            <article
              className="complaint-item"
              key={log._id}
            >
              <div className="complaint-item-header">
                <strong>{log.action}</strong>
                <span className="status-pill success">
                  {log.entityType || "General"}
                </span>
              </div>

              <p>{log.details || "No additional details"}</p>
              <p>
                By: {log.performedBy || "Society Admin"}
              </p>
              <p>
                {log.createdAt
                  ? new Date(log.createdAt).toLocaleString()
                  : "Date unavailable"}
              </p>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
