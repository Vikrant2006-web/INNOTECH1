
const API_URL = "http://localhost:5000/api";

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

export const complaintAPI = {
  getAll: () => request("/complaints"),

  create: (complaint) =>
    request("/complaints", {
      method: "POST",
      body: JSON.stringify(complaint),
    }),

  update: (id, complaint) =>
    request(`/complaints/${id}`, {
      method: "PUT",
      body: JSON.stringify(complaint),
    }),

  delete: (id) =>
    request(`/complaints/${id}`, {
      method: "DELETE",
    }),
};

export const maintenanceAPI = {
  getAll: () => request("/maintenance"),

  create: (record) =>
    request("/maintenance", {
      method: "POST",
      body: JSON.stringify(record),
    }),

  update: (id, record) =>
    request(`/maintenance/${id}`, {
      method: "PUT",
      body: JSON.stringify(record),
    }),

  delete: (id) =>
    request(`/maintenance/${id}`, {
      method: "DELETE",
    }),
};
