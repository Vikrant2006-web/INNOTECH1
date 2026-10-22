

import { complaintAPI } from "./services/api";
import Maintenance from "./Maintenance";
import AIOperations from "./AIOperations";
import Approvals from "./Approvals.jsx";
import AuditLogs from "./AuditLogs.jsx";
import { useEffect, useState } from "react";
import "./styles/global.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
const pages = [
  "Dashboard",
  "AI Operations",
  "Complaints",
  "Maintenance Dues",
  "Approvals",
  "Audit Logs",
];

function SocietyDashboard() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadComplaints() {
    setLoading(true);
    setError("");

    try {
      const response = await complaintAPI.getAll();
      const data = response?.data ?? response;

      setComplaints(
        Array.isArray(data)
          ? data
          : data?.complaints ?? []
      );
    } catch (err) {
      setError(err.message || "Could not load complaints.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadComplaints();
  }, []);

  async function saveComplaint(complaint) {
    try {
      setError("");

      if (complaint._id) {
        await complaintAPI.update(complaint._id, complaint);
      } else {
        await complaintAPI.create(complaint);
      }

      await loadComplaints();
      return true;
    } catch (err) {
      setError(err.message || "Could not save complaint.");
      return false;
    }
  }

  async function deleteComplaint(id) {
    if (!window.confirm("Delete this complaint permanently?")) {
      return;
    }

    try {
      setError("");
      await complaintAPI.delete(id);
      await loadComplaints();
    } catch (err) {
      setError(err.message || "Could not delete complaint.");
    }
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">S</div>

          <div>
            <h2>SocietyOps</h2>
            <span>AI MANAGEMENT</span>
          </div>
        </div>

        <p className="menu-label">WORKSPACE</p>

        <nav className="navigation">
          {pages.map((page) => (
            <button
              key={page}
              className={`nav-item ${
                activePage === page ? "active" : ""
              }`}
              onClick={() => setActivePage(page)}
            >
              <span>{getIcon(page)}</span>
              {page}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="status-dot" />
          <span>SocietyOps Workspace</span>
        </div>
         <button
          type="button"
          className="nav-item logout-button"
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/login";
          }}
        >
          <span>↪</span>
          Logout
        </button>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="breadcrumb">
              Workspace / {activePage}
            </p>

            <h1>{activePage}</h1>
          </div>

          <div className="admin-profile">
            <div className="avatar">A</div>

            <div>
              <strong>Society Admin</strong>
              <span>Administrator</span>
            </div>
          </div>
        </header>

        <section className="page-content">
          {error && (
            <div className="api-error" role="alert">
              <span>{error}</span>

              <button onClick={() => setError("")}>
                Dismiss
              </button>
            </div>
          )}

          {/* Dashboard */}
          {activePage === "Dashboard" && (
            <Dashboard
              complaints={complaints}
              loading={loading}
              openPage={setActivePage}
            />
          )}

          {/* AI Operations */}
          {activePage === "AI Operations" && (
            <AIOperations />
          )}

          {/* Complaints */}
          {activePage === "Complaints" && (
            <ComplaintsPage
              complaints={complaints}
              loading={loading}
              onSave={saveComplaint}
              onDelete={deleteComplaint}
            />
          )}

          {/* Maintenance Dues */}
          {activePage === "Maintenance Dues" && (
            <Maintenance />
          )}

          {/* Approvals */}
          {activePage === "Approvals" && (
            <Approvals />
          )}
          {/* Audit Logs */}
{activePage === "Audit Logs" && <AuditLogs />}

          {/* Placeholder for modules not implemented yet */}
          {![
            "Dashboard",
            "AI Operations",
            "Complaints",
            "Maintenance Dues",
            "Approvals",
            "Audit Logs",
          ].includes(activePage) && (
            <div className="placeholder-page">
              <h2>{activePage}</h2>

              <p>
                This module will be implemented next.
              </p>

              <button
                className="primary-button"
                onClick={() => setActivePage("Dashboard")}
              >
                Back to Dashboard
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function getIcon(page) {
  const icons = {
    Dashboard: "▦",
    "AI Operations": "✧",
    Complaints: "☷",
    "Maintenance Dues": "₹",
    Approvals: "✓",
    "Audit Logs": "◷",
  };

  return icons[page] || "•";
}

function Dashboard({ complaints, loading, openPage }) {
  const openCount = complaints.filter(
    (item) =>
      !["resolved", "closed", "completed"].includes(
        String(item.status || "").toLowerCase()
      )
  ).length;

  const resolvedCount = complaints.length - openCount;

  const stats = [
    {
      label: "Total Complaints",
      value: loading ? "..." : complaints.length,
      note: "Records in MongoDB",
      color: "purple",
    },
    {
      label: "Open Complaints",
      value: loading ? "..." : openCount,
      note: "Require attention",
      color: "orange",
    },
    {
      label: "Resolved",
      value: loading ? "..." : resolvedCount,
      note: "Completed complaints",
      color: "green",
    },
    {
      label: "AI Tasks Completed",
      value: "0",
      note: "AI integration pending",
      color: "red",
    },
  ];

  return (
    <div className="dashboard">
      <div className="welcome-banner">
        <div>
          <span className="eyebrow">
            SMART SOCIETY OPERATIONS
          </span>

          <h2>Your society, intelligently managed.</h2>

          <p>
            Manage complaints and monitor society operations
            from one place.
          </p>

          <button
            className="primary-button"
            onClick={() => openPage("Complaints")}
          >
            Manage Complaints
          </button>
        </div>

        <div className="welcome-symbol">✧</div>
      </div>

      <div className="section-heading">
        <div>
          <h2>Society Overview</h2>
          <p>Live complaint statistics from MongoDB</p>
        </div>

        <span className="demo-badge">DATABASE</span>
      </div>

      <div className="stats-grid">
        {stats.map((stat) => (
          <article className="stat-card" key={stat.label}>
            <div className={`stat-icon ${stat.color}`}>
              ●
            </div>

            <p>{stat.label}</p>
            <h3>{stat.value}</h3>
            <span>{stat.note}</span>
          </article>
        ))}
      </div>

      <div className="section-heading activity-heading">
        <div>
          <h2>Recent Complaints</h2>
          <p>Latest records from the database</p>
        </div>

        <button
          className="primary-button"
          onClick={() => openPage("Complaints")}
        >
          View All
        </button>
      </div>

      <div className="activity-card">
        {loading ? (
          <p>Loading complaints...</p>
        ) : complaints.length === 0 ? (
          <p>No complaints yet. Add your first complaint.</p>
        ) : (
          complaints.slice(0, 5).map((item) => (
            <div className="activity-row" key={item._id}>
              <div className="activity-indicator">•</div>

              <div className="activity-details">
                <strong>{item.description}</strong>

                <p>
                  Flat {item.flat} · {item.resident}
                </p>
              </div>

              <span
                className={`status-pill ${
                  item.status === "Resolved"
                    ? "success"
                    : "warning"
                }`}
              >
                {item.status}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function ComplaintsPage({
  complaints,
  loading,
  onSave,
  onDelete,
}) {
  const emptyForm = {
    resident: "",
    flat: "",
    category: "Plumbing",
    description: "",
    priority: "Medium",
    status: "Open",
  };

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const filtered = complaints.filter((item) =>
    [
      item.resident,
      item.flat,
      item.category,
      item.description,
      item.status,
    ]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  function change(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function submit(event) {
    event.preventDefault();

    setSaving(true);
    setMessage("");

    try {
      const success = await onSave(
        editingId
          ? { ...form, _id: editingId }
          : form
      );

      if (success) {
        setForm(emptyForm);
        setEditingId(null);
        setMessage("Complaint saved successfully.");
      }
    } finally {
      setSaving(false);
    }
  }

  function edit(item) {
    setForm({
      resident: item.resident || "",
      flat: item.flat || "",
      category: item.category || "Other",
      description: item.description || "",
      priority: item.priority || "Medium",
      status: item.status || "Open",
    });

    setEditingId(item._id);
    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function cancelEdit() {
    setForm(emptyForm);
    setEditingId(null);
    setMessage("");
  }

  return (
    <div className="dashboard">
      <div className="section-heading">
        <div>
          <h2>Complaints Management</h2>
          <p>Add, search, update and delete database records.</p>
        </div>

        <span className="demo-badge">
          {complaints.length} TOTAL
        </span>
      </div>

      <form
        className="activity-card complaint-form"
        onSubmit={submit}
      >
        <h3>
          {editingId ? "Edit Complaint" : "Add New Complaint"}
        </h3>

        <div className="form-grid">
          <label>
            Resident Name *
            <input
              value={form.resident}
              onChange={(e) =>
                change("resident", e.target.value)
              }
              placeholder="e.g. Rahul Sharma"
              required
            />
          </label>

          <label>
            Flat Number *
            <input
              value={form.flat}
              onChange={(e) =>
                change("flat", e.target.value)
              }
              placeholder="e.g. A-204"
              required
            />
          </label>

          <label>
            Category
            <select
              value={form.category}
              onChange={(e) =>
                change("category", e.target.value)
              }
            >
              {[
                "Plumbing",
                "Electrical",
                "Lift",
                "Security",
                "Cleaning",
                "Water Supply",
                "Other",
              ].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>

          <label>
            Priority
            <select
              value={form.priority}
              onChange={(e) =>
                change("priority", e.target.value)
              }
            >
              {["Low", "Medium", "High", "Urgent"].map(
                (value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                )
              )}
            </select>
          </label>

          <label>
            Status
            <select
              value={form.status}
              onChange={(e) =>
                change("status", e.target.value)
              }
            >
              {["Open", "In Progress", "Resolved"].map(
                (value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                )
              )}
            </select>
          </label>

          <label className="full-width">
            Complaint Description *
            <textarea
              value={form.description}
              onChange={(e) =>
                change("description", e.target.value)
              }
              placeholder="Describe the issue..."
              rows={3}
              required
            />
          </label>
        </div>

        {message && <p role="status">{message}</p>}

        <div className="form-actions">
          <button
            className="primary-button"
            type="submit"
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : editingId
                ? "Update Complaint"
                : "Save Complaint"}
          </button>

          {editingId && (
            <button
              className="secondary-button"
              type="button"
              onClick={cancelEdit}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="section-heading">
        <div>
          <h2>All Complaints</h2>
          <p>Search your saved records.</p>
        </div>
      </div>

      <div className="activity-card complaints-list">
        <input
          className="search-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search complaints..."
          aria-label="Search complaints"
        />

        {loading ? (
          <p>Loading complaints...</p>
        ) : filtered.length === 0 ? (
          <p>No matching complaints found.</p>
        ) : (
          filtered.map((item) => (
            <article className="complaint-item" key={item._id}>
              <div className="complaint-item-header">
                <div>
                  <strong>{item.description}</strong>
                  <p>
                    {item.resident} · Flat {item.flat}
                  </p>
                </div>

                <span
                  className={`status-pill ${
                    item.status === "Resolved"
                      ? "success"
                      : "warning"
                  }`}
                >
                  {item.status}
                </span>
              </div>

              <p>
                Category: {item.category} · Priority:{" "}
                {item.priority}
              </p>

              <p>
                Date:{" "}
                {item.createdAt
                  ? new Date(item.createdAt).toLocaleDateString()
                  : "Not recorded"}
              </p>

              <div className="form-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => edit(item)}
                >
                  Edit
                </button>

                <button
                  type="button"
                  className="danger-button"
                  onClick={() => onDelete(item._id)}
                >
                  Delete
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}

function ProtectedDashboard() {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <SocietyDashboard />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Navigate to="/dashboard" replace />}
        />

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route
          path="/dashboard"
          element={<ProtectedDashboard />}
        />

        <Route
          path="*"
          element={<Navigate to="/dashboard" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

// import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import Login from "./pages/Login";
// import Signup from "./pages/Signup";

// function Dashboard() {
//   const user = JSON.parse(localStorage.getItem("user") || "null");

//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("user");
//     window.location.href = "/login";
//   };

//   if (!user) {
//     return <Navigate to="/login" replace />;
//   }

//   return (
//     <div style={{ padding: "30px", fontFamily: "Arial" }}>
//       <h1>Welcome to SocietyOps AI!</h1>
//       <h2>Hello, {user.name}</h2>
//       <p>Your role: {user.role}</p>
//       <p>You are successfully logged in.</p>

//       <button onClick={handleLogout}>Logout</button>
//     </div>
//   );
// }

// export default function App() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/" element={<Navigate to="/login" replace />} />
//         <Route path="/login" element={<Login />} />
//         <Route path="/signup" element={<Signup />} />
//         <Route path="/dashboard" element={<Dashboard />} />
//         <Route path="*" element={<Navigate to="/login" replace />} />
//       </Routes>
//     </BrowserRouter>
//   );
// }
