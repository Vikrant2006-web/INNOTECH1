
import { useCallback, useEffect, useState } from "react";

const API_URL = "http://localhost:5000/api/approvals";

export default function Approvals() {
  const [approvals, setApprovals] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [requestedBy, setRequestedBy] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadApprovals = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_URL);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Approvals load nahi hui.");
      }

      setApprovals(data.approvals || []);
    } catch (err) {
      setError(err.message || "Failed to fetch. Backend check karo.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadApprovals();
  }, [loadApprovals]);

  // async function handleSubmit(event) {
  //   event.preventDefault();
  //   setSaving(true);
  //   setError("");
  //   setMessage("");
  async function handleSubmit(event) {
  event.preventDefault();

  console.log("Add Approval button clicked");
  console.log({ title, description, requestedBy });

  setSaving(true);
  setError("");
  setMessage("");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          requestedBy,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Request save nahi hui.");
      }

      setTitle("");
      setDescription("");
      setRequestedBy("");
      setMessage("Approval request successfully add ho gayi.");

      await loadApprovals();
    } catch (err) {
      setError(err.message || "Request save nahi ho saki.");
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(id, status) {
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Status update nahi hua.");
      }

      setMessage(`Request ${status.toLowerCase()} ho gayi.`);
      await loadApprovals();
    } catch (err) {
      setError(err.message || "Status update nahi ho saka.");
    }
  }

  const styles = {
    page: {
      padding: "28px",
      maxWidth: "1100px",
      margin: "0 auto",
      color: "#172033",
    },
    card: {
      background: "#fff",
      border: "1px solid #e2e8f0",
      borderRadius: "12px",
      padding: "22px",
      marginBottom: "24px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
    },
    input: {
      display: "block",
      width: "100%",
      boxSizing: "border-box",
      padding: "11px",
      marginTop: "7px",
      marginBottom: "16px",
      border: "1px solid #cbd5e1",
      borderRadius: "7px",
      fontSize: "15px",
    },
    button: {
      padding: "10px 16px",
      border: "none",
      borderRadius: "7px",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "600",
      marginRight: "8px",
      marginTop: "8px",
    },
  };

  return (
    <div style={styles.page}>
      <h1>Approvals</h1>
      <p>Society requests add karein aur unhe manage karein.</p>

      {error && (
        <p role="alert" style={{ color: "#b91c1c" }}>
          {error}
        </p>
      )}

      {message && (
        <p role="status" style={{ color: "#047857" }}>
          {message}
        </p>
      )}

      <section style={styles.card}>
        <h2>Add Approval Request</h2>

        <form onSubmit={handleSubmit}>
          <label htmlFor="approval-title">Request Title *</label>
          <input
            id="approval-title"
            style={styles.input}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. CCTV installation"
            maxLength={150}
            required
          />

          <label htmlFor="approval-requested-by">
            Requested By *
          </label>
          <input
            id="approval-requested-by"
            style={styles.input}
            value={requestedBy}
            onChange={(e) => setRequestedBy(e.target.value)}
            placeholder="e.g. Amit Sharma, Flat A-101"
            maxLength={100}
            required
          />

          <label htmlFor="approval-description">
            Request Details
          </label>
          <textarea
            id="approval-description"
            style={{ ...styles.input, minHeight: "100px" }}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Request ki details likhein..."
            maxLength={2000}
          />

          <button
            type="submit"
            disabled={saving}
            style={{
              ...styles.button,
              background: "#0f766e",
              color: "#fff",
              opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? "Saving..." : "Add Approval"}
          </button>
        </form>
      </section>

      <section style={styles.card}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <h2>Approval Requests</h2>

          <button
            type="button"
            onClick={loadApprovals}
            disabled={loading}
            style={{
              ...styles.button,
              background: "#e2e8f0",
              color: "#172033",
            }}
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {loading ? (
          <p>Approvals load ho rahi hain...</p>
        ) : approvals.length === 0 ? (
          <p>Abhi koi approval request nahi hai.</p>
        ) : (
          <div style={{ display: "grid", gap: "16px" }}>
            {approvals.map((approval) => (
              <article
                key={approval._id}
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: "9px",
                  padding: "16px",
                }}
              >
                <h3>{approval.title}</h3>

                <p>
                  <strong>Requested by:</strong>{" "}
                  {approval.requestedBy}
                </p>

                {approval.description && (
                  <p>{approval.description}</p>
                )}

                <p>
                  <strong>Status:</strong>{" "}
                  {approval.status || "Pending"}
                </p>

                <p style={{ color: "#64748b", fontSize: "13px" }}>
                  {approval.createdAt
                    ? new Date(approval.createdAt).toLocaleString()
                    : ""}
                </p>

                {(!approval.status ||
                  approval.status === "Pending") && (
                  <div>
                    <button
                      type="button"
                      onClick={() =>
                        updateStatus(approval._id, "Approved")
                      }
                      style={{
                        ...styles.button,
                        background: "#d1fae5",
                        color: "#065f46",
                      }}
                    >
                      Approve
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        updateStatus(approval._id, "Rejected")
                      }
                      style={{
                        ...styles.button,
                        background: "#fee2e2",
                        color: "#991b1b",
                      }}
                    >
                      Reject
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
