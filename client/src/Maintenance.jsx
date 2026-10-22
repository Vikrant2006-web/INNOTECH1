
import { useEffect, useState } from "react";
import { maintenanceAPI } from "./services/api";

function Maintenance() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    resident: "",
    flat: "",
    amount: "",
    month: "",
    dueDate: "",
  });

  const loadRecords = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await maintenanceAPI.getAll();
      const data = response?.data ?? response;

      setRecords(Array.isArray(data) ? data : data?.records ?? []);
    } catch (err) {
      setError(
        err.message || "Maintenance records load nahi ho paaye."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (
      !form.resident.trim() ||
      !form.flat.trim() ||
      !form.amount ||
      !form.month ||
      !form.dueDate
    ) {
      setError("Saari fields fill karna zaroori hai.");
      return;
    }

    if (Number(form.amount) < 0) {
      setError("Amount negative nahi ho sakta.");
      return;
    }

    try {
      setSaving(true);

      await maintenanceAPI.create({
        resident: form.resident.trim(),
        flat: form.flat.trim(),
        amount: Number(form.amount),
        month: form.month,
        dueDate: form.dueDate,
        status: "Pending",
      });

      setForm({
        resident: "",
        flat: "",
        amount: "",
        month: "",
        dueDate: "",
      });

      setMessage("Maintenance record successfully add ho gaya.");

      await loadRecords();
    } catch (err) {
      setError(
        err.message || "Record add nahi ho paaya."
      );
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (record, status) => {
    setMessage("");
    setError("");

    try {
      await maintenanceAPI.update(record._id, {
        status,
        paidAt: status === "Paid" ? new Date().toISOString() : null,
      });

      setMessage(
        status === "Paid"
          ? "Payment status Paid kar diya gaya."
          : "Payment status Pending kar diya gaya."
      );

      await loadRecords();
    } catch (err) {
      setError(
        err.message || "Payment status update nahi hua."
      );
    }
  };

  const deleteRecord = async (id) => {
    const confirmed = window.confirm(
      "Kya aap ye maintenance record delete karna chahte hain?"
    );

    if (!confirmed) return;

    setMessage("");
    setError("");

    try {
      await maintenanceAPI.delete(id);

      setMessage("Maintenance record delete ho gaya.");
      await loadRecords();
    } catch (err) {
      setError(
        err.message || "Record delete nahi ho paaya."
      );
    }
  };

  const filteredRecords = records.filter((record) => {
    const query = search.toLowerCase();

    return (
      record.resident?.toLowerCase().includes(query) ||
      record.flat?.toLowerCase().includes(query) ||
      record.month?.toLowerCase().includes(query) ||
      record.status?.toLowerCase().includes(query)
    );
  });

  const totalAmount = records.reduce(
    (sum, record) => sum + Number(record.amount || 0),
    0
  );

  const paidAmount = records
    .filter((record) => record.status === "Paid")
    .reduce(
      (sum, record) => sum + Number(record.amount || 0),
      0
    );

  const pendingAmount = records
    .filter((record) => record.status !== "Paid")
    .reduce(
      (sum, record) => sum + Number(record.amount || 0),
      0
    );

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="maintenance-page">
      <div className="page-header">
        <div>
          <h1>Maintenance Dues</h1>
          <p>Society maintenance payments ko manage karein.</p>
        </div>

        <button
          type="button"
          className="secondary-button"
          onClick={loadRecords}
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      <div className="maintenance-stats">
        <div className="maintenance-stat-card">
          <span>Total Maintenance</span>
          <h2>{formatCurrency(totalAmount)}</h2>
          <p>{records.length} records</p>
        </div>

        <div className="maintenance-stat-card paid-card">
          <span>Total Collected</span>
          <h2>{formatCurrency(paidAmount)}</h2>
          <p>Paid maintenance</p>
        </div>

        <div className="maintenance-stat-card pending-card">
          <span>Pending Amount</span>
          <h2>{formatCurrency(pendingAmount)}</h2>
          <p>Unpaid maintenance</p>
        </div>
      </div>

      <section className="maintenance-section">
        <h2>Add Maintenance Record</h2>

        <form
          className="maintenance-form"
          onSubmit={handleSubmit}
        >
          <div className="form-group">
            <label htmlFor="resident">Resident Name</label>
            <input
              id="resident"
              type="text"
              name="resident"
              placeholder="Enter resident name"
              value={form.resident}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="flat">Flat Number</label>
            <input
              id="flat"
              type="text"
              name="flat"
              placeholder="e.g. A-101"
              value={form.flat}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="amount">Amount (₹)</label>
            <input
              id="amount"
              type="number"
              name="amount"
              placeholder="Enter amount"
              min="0"
              value={form.amount}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="month">Maintenance Month</label>
            <input
              id="month"
              type="month"
              name="month"
              value={form.month}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="dueDate">Due Date</label>
            <input
              id="dueDate"
              type="date"
              name="dueDate"
              value={form.dueDate}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            className="primary-button"
            disabled={saving}
          >
            {saving ? "Saving..." : "Add Record"}
          </button>
        </form>

        {message && (
          <p className="maintenance-message success-message">
            {message}
          </p>
        )}

        {error && (
          <p className="maintenance-message error-message">
            {error}
          </p>
        )}
      </section>

      <section className="maintenance-section">
        <div className="maintenance-table-header">
          <div>
            <h2>Maintenance Records</h2>
            <p>Society ke saare maintenance records.</p>
          </div>

          <input
            type="search"
            className="maintenance-search"
            placeholder="Search resident, flat, month..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <p className="maintenance-empty">Loading records...</p>
        ) : (
          <div className="table-scroll">
            <table className="maintenance-table">
              <thead>
                <tr>
                  <th>Resident</th>
                  <th>Flat</th>
                  <th>Month</th>
                  <th>Amount</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="maintenance-empty">
                      Koi maintenance record nahi mila.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((record) => (
                    <tr key={record._id}>
                      <td>{record.resident}</td>
                      <td>{record.flat}</td>
                      <td>{record.month}</td>
                      <td>{formatCurrency(record.amount)}</td>
                      <td>{formatDate(record.dueDate)}</td>
                      <td>
                        <span
                          className={`maintenance-status ${
                            record.status === "Paid"
                              ? "status-paid"
                              : record.status === "Overdue"
                              ? "status-overdue"
                              : "status-pending"
                          }`}
                        >
                          {record.status || "Pending"}
                        </span>
                      </td>
                      <td>
                        <div className="maintenance-actions">
                          {record.status !== "Paid" ? (
                            <button
                              type="button"
                              className="small-action-button mark-paid"
                              onClick={() =>
                                updateStatus(record, "Paid")
                              }
                            >
                              Mark Paid
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="small-action-button mark-pending"
                              onClick={() =>
                                updateStatus(record, "Pending")
                              }
                            >
                              Mark Pending
                            </button>
                          )}

                          <button
                            type="button"
                            className="small-action-button delete-action"
                            onClick={() =>
                              deleteRecord(record._id)
                            }
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default Maintenance;
