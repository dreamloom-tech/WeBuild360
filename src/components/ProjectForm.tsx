"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./ProjectForm.module.css";

export default function ProjectForm({ onSubmitProject, initialData }: { onSubmitProject?: (data: any) => void, initialData?: any }) {
  const [formData, setFormData] = useState(initialData || {
    projectName: "",
    clientName: "",
    projectValue: "",
    startDate: "",
    totalDays: "",
    address: "",
    street: "",
    postalCode: "",
    city: "",
    country: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmitProject) onSubmitProject(formData);
    // do not reset if editing
    if (!initialData) {
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
    }
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
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label style={{ marginBottom: 6, fontSize: 14, fontWeight: 500, color: "#333" }}>Project Name</label>
          <input name="projectName" value={formData.projectName} onChange={handleChange} required type="text" style={{ padding: "10px 12px", border: "1px solid #ccc", borderRadius: 6, fontSize: 14, backgroundColor: "#f9f9f9" }} />
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <label style={{ marginBottom: 6, fontSize: 14, fontWeight: 500, color: "#333" }}>Client Name</label>
          <input name="clientName" value={formData.clientName} onChange={handleChange} required type="text" style={{ padding: "10px 12px", border: "1px solid #ccc", borderRadius: 6, fontSize: 14, backgroundColor: "#f9f9f9" }} />
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <label style={{ marginBottom: 6, fontSize: 14, fontWeight: 500, color: "#333" }}>Project Value</label>
          <input name="projectValue" value={formData.projectValue} onChange={handleChange} type="text" style={{ padding: "10px 12px", border: "1px solid #ccc", borderRadius: 6, fontSize: 14, backgroundColor: "#f9f9f9" }} />
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <label style={{ marginBottom: 6, fontSize: 14, fontWeight: 500, color: "#333" }}>Start Date</label>
          <input name="startDate" value={formData.startDate} onChange={handleChange} type="date" style={{ padding: "10px 12px", border: "1px solid #ccc", borderRadius: 6, fontSize: 14, backgroundColor: "#f9f9f9" }} />
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <label style={{ marginBottom: 6, fontSize: 14, fontWeight: 500, color: "#333" }}>Duration (days)</label>
          <input name="totalDays" value={formData.totalDays} onChange={handleChange} type="number" style={{ padding: "10px 12px", border: "1px solid #ccc", borderRadius: 6, fontSize: 14, backgroundColor: "#f9f9f9" }} />
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <label style={{ marginBottom: 6, fontSize: 14, fontWeight: 500, color: "#333" }}>Address</label>
          <input name="address" value={formData.address} onChange={handleChange} type="text" style={{ padding: "10px 12px", border: "1px solid #ccc", borderRadius: 6, fontSize: 14, backgroundColor: "#f9f9f9" }} />
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <label style={{ marginBottom: 6, fontSize: 14, fontWeight: 500, color: "#333" }}>Street</label>
          <input name="street" value={formData.street} onChange={handleChange} type="text" style={{ padding: "10px 12px", border: "1px solid #ccc", borderRadius: 6, fontSize: 14, backgroundColor: "#f9f9f9" }} />
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <label style={{ marginBottom: 6, fontSize: 14, fontWeight: 500, color: "#333" }}>Postal Code</label>
          <input name="postalCode" value={formData.postalCode} onChange={handleChange} type="text" style={{ padding: "10px 12px", border: "1px solid #ccc", borderRadius: 6, fontSize: 14, backgroundColor: "#f9f9f9" }} />
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <label style={{ marginBottom: 6, fontSize: 14, fontWeight: 500, color: "#333" }}>City</label>
          <input name="city" value={formData.city} onChange={handleChange} type="text" style={{ padding: "10px 12px", border: "1px solid #ccc", borderRadius: 6, fontSize: 14, backgroundColor: "#f9f9f9" }} />
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <label style={{ marginBottom: 6, fontSize: 14, fontWeight: 500, color: "#333" }}>Country</label>
          <input name="country" value={formData.country} onChange={handleChange} type="text" style={{ padding: "10px 12px", border: "1px solid #ccc", borderRadius: 6, fontSize: 14, backgroundColor: "#f9f9f9" }} />
        </div>
      </div>

      <div style={{ marginTop: 32 }}>
        <button
          type="submit"
          style={{
            padding: "10px 20px",
            background: "#6d28d9",
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

      {/* <div className={styles.projectCard}>
        <div className={styles.cardHeader}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Project For: {formData.clientName}</span>
            <span>{formData.status}</span>
          </div>
          <h3 className={styles.cardTitle}>{formData.projectName}</h3>
        </div>
        <div className={styles.cyanStripe}>
          <div>
            <div>Estimation</div>
            <div>₹{formData.projectValue?.toLocaleString() || '-'}</div>
          </div>
          <div>
            <div>Received</div>
            <div>₹{formData.receivedAmount?.toLocaleString() || '-'}</div>
          </div>
        </div>
        <div className={styles.cardFooter}>
          <div>Stage: {formData.currentStage?.name || 'N/A'}</div>
          <Link href={`/projects/${formData._id}`}>
            Click here for details
          </Link>
        </div>
      </div> */}
    </form>
  );
}
