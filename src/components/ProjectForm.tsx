"use client";

import { useState } from "react";

export default function ProjectForm({ onSubmitProject }: { onSubmitProject?: (data: any) => void }) {
  const [formData, setFormData] = useState({
    projectName: "",
    clientName: "",
    address: "",
    street: "",
    postalCode: "",
    startDate: "",
    totalDays: "",
    city: "",
    country: "",
    projectValue: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmitProject) onSubmitProject(formData);
    alert("Project submitted successfully!");
    setFormData({
      projectName: "",
      clientName: "",
      address: "",
      street: "",
      postalCode: "",
      startDate: "",
      totalDays: "",
      city: "",
      country: "",
      projectValue: "",
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: "#fff",
        padding: 24,
        borderRadius: 8,
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <h3 style={{ marginBottom: 24, fontSize: 20, fontWeight: 600 }}>Create a New Project</h3>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {Object.entries(formData).map(([key, value]) => (
          <div key={key} style={{ display: "flex", flexDirection: "column" }}>
            <label style={{ marginBottom: 6, fontSize: 14, fontWeight: 500, color: "#333" }}>
              {key.replace(/([A-Z])/g, " $1")}
            </label>
            <input
              type={key === "startDate" ? "date" : "text"}
              name={key}
              value={value}
              onChange={handleChange}
              required
              style={{
                padding: "10px 12px",
                border: "1px solid #ccc",
                borderRadius: 6,
                fontSize: 14,
                backgroundColor: "#f9f9f9",
              }}
            />
          </div>
        ))}
      </div>

      <div style={{ marginTop: 32 }}>
        <button
          type="submit"
          style={{
            padding: "10px 20px",
            background: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          Submit Project
        </button>
      </div>
    </form>
  );
}
