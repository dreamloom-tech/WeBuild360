"use client";

import { useState } from "react";
import styles from "../app/funds/inflow/InflowForm.module.css";

export default function InflowForm({
  onSubmitProject,
  onClose,
}: {
  onSubmitProject: (data: any) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    projectName: "",
    paymentDate: "",
    fundReceived: "",
    paymentMode: "",
    bankName: "",
    transactionNo: "",
    comments: "",
    receivedBy: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    onSubmitProject(formData);
    setFormData({
      projectName: "",
      paymentDate: "",
      fundReceived: "",
      paymentMode: "",
      bankName: "",
      transactionNo: "",
      comments: "",
      receivedBy: "",
    });
  };

  return (
    <div className={styles.formWrapper}>
      <div className={styles.headerRow}>
        <h3>Add Fund Inflow</h3>
        <button className={styles.closeButton} onClick={onClose}>✖</button>
      </div>

      <div className={styles.grid}>
        <div className={styles.field}>
          <label>Project Name</label>
          <select name="projectName" value={formData.projectName} onChange={handleChange}>
            <option value="">Select Project</option>
            <option value="Project Alpha">Project Alpha</option>
            <option value="Project Beta">Project Beta</option>
            <option value="Project Gamma">Project Gamma</option>
          </select>
        </div>

        <div className={styles.field}>
          <label>Payment Date</label>
          <input
            type="date"
            name="paymentDate"
            value={formData.paymentDate}
            onChange={handleChange}
          />
        </div>

        <div className={styles.field}>
          <label>Fund Received (₹)</label>
          <input
            type="number"
            name="fundReceived"
            value={formData.fundReceived}
            onChange={handleChange}
          />
        </div>

        <div className={styles.field}>
          <label>Payment Mode</label>
          <select name="paymentMode" value={formData.paymentMode} onChange={handleChange}>
            <option value="">Select Mode</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="UPI">UPI</option>
            <option value="By Cash">By Cash</option>
          </select>
        </div>

        <div className={styles.field}>
          <label>Bank Name</label>
          <input
            type="text"
            name="bankName"
            value={formData.bankName}
            onChange={handleChange}
          />
        </div>

        <div className={styles.field}>
          <label>Transaction No</label>
          <input
            type="text"
            name="transactionNo"
            value={formData.transactionNo}
            onChange={handleChange}
          />
        </div>

        <div className={styles.field}>
          <label>Comments</label>
          <input
            type="text"
            name="comments"
            value={formData.comments}
            onChange={handleChange}
          />
        </div>

        <div className={styles.field}>
          <label>Received By</label>
          <select name="receivedBy" value={formData.receivedBy} onChange={handleChange}>
            <option value="">Select Staff</option>
            <option value="Ravi">Ravi</option>
            <option value="Priya">Priya</option>
            <option value="Kumar">Kumar</option>
          </select>
        </div>
      </div>

      <div className={styles.actions}>
        <button onClick={handleSubmit}>Submit</button>
      </div>
    </div>
  );
}
