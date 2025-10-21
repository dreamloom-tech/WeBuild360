"use client";

import { useState, useEffect } from "react";
import styles from "../app/funds/inflow/InflowForm.module.css";

import { ProjectDropdownItem } from "@/lib/fetchProjectDropdownItems";

interface InflowFormProps {
  onSubmitProject: (data: any) => void;
  onClose: () => void;
  projects: ProjectDropdownItem[];
  initialData?: any;
  readOnly?: boolean;
}

export default function InflowForm({
  onSubmitProject,
  onClose,
  projects = [],
  initialData = {},
  readOnly = false,
}: InflowFormProps) {
  const [formData, setFormData] = useState({
    _id: initialData._id || "",
    projectName: initialData.projectName || "",
    paymentDate: initialData.paymentDate || "",
    fundReceived: initialData.fundReceived || "",
    paymentMode: initialData.paymentMode || "",
    bankName: initialData.bankName || "",
    bankIfsc: initialData.bankIfsc || "",
    upiId: initialData.upiId || "",
    upiNumber: initialData.upiNumber || "",
    upiApp: initialData.upiApp || "",
    whoPaid: initialData.whoPaid || "",
    whoReceived: initialData.whoReceived || "",
    transactionDate: initialData.transactionDate || "",
    comments: initialData.comments || "",
  });

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData({
        _id: initialData._id || "",
        projectName: initialData.projectName || "",
        paymentDate: initialData.paymentDate || "",
        fundReceived: initialData.fundReceived || "",
        paymentMode: initialData.paymentMode || "",
        bankName: initialData.bankName || "",
        bankIfsc: initialData.bankIfsc || "",
        upiId: initialData.upiId || "",
        upiNumber: initialData.upiNumber || "",
        upiApp: initialData.upiApp || "",
        whoPaid: initialData.whoPaid || "",
        whoReceived: initialData.whoReceived || "",
        transactionDate: initialData.transactionDate || "",
        comments: initialData.comments || "",
      });
    }
    // Only run when initialData changes
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    if (readOnly) return;
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (!readOnly) {
      onSubmitProject(formData);
      setFormData({
        _id: "",
        projectName: "",
        paymentDate: "",
        fundReceived: "",
        paymentMode: "",
        bankName: "",
        bankIfsc: "",
        upiId: "",
        upiNumber: "",
        upiApp: "",
        whoPaid: "",
        whoReceived: "",
        transactionDate: "",
        comments: "",
      });
    }
  };

  return (
    <div className={styles.formWrapper}>
      <div className={styles.headerRow}>
        <h3>{readOnly ? "View Fund Inflow" : initialData.projectName ? "Edit Fund Inflow" : "Add Fund Inflow"}</h3>
        <button className={styles.closeButton} onClick={onClose}>✖</button>
      </div>

      <div className={styles.grid}>
        <div className={styles.field}>
          <label>Project Name</label>
          <select name="projectName" value={formData.projectName} onChange={handleChange} disabled={readOnly}>
            <option value="">Select Project</option>
            {projects.map(p => (
              <option key={p._id} value={p.name}>{p.name}</option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label>Payment Date</label>
          <input
            type="date"
            name="paymentDate"
            value={formData.paymentDate}
            onChange={handleChange}
            readOnly={readOnly}
            disabled={readOnly}
          />
        </div>

        <div className={styles.field}>
          <label>Fund Received (₹)</label>
          <input
            type="number"
            name="fundReceived"
            value={formData.fundReceived}
            onChange={handleChange}
            readOnly={readOnly}
            disabled={readOnly}
          />
        </div>

        <div className={styles.field}>
          <label>Payment Mode</label>
          <select name="paymentMode" value={formData.paymentMode} onChange={handleChange} disabled={readOnly}>
            <option value="">Select Mode</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="UPI">UPI</option>
            <option value="Cash">Cash</option>
          </select>
        </div>

        {/* Bank Transfer Fields */}
        {formData.paymentMode === 'Bank Transfer' && (
          <>
            <div className={styles.field}>
              <label>Bank Name</label>
              <input
                type="text"
                name="bankName"
                value={formData.bankName}
                onChange={handleChange}
                readOnly={readOnly}
                disabled={readOnly}
              />
            </div>
            <div className={styles.field}>
              <label>Bank IFSC Code</label>
              <input
                type="text"
                name="bankIfsc"
                value={formData.bankIfsc}
                onChange={handleChange}
                readOnly={readOnly}
                disabled={readOnly}
              />
            </div>
            <div className={styles.field}>
              <label>Transaction Date</label>
              <input
                type="date"
                name="transactionDate"
                value={formData.transactionDate}
                onChange={handleChange}
                readOnly={readOnly}
                disabled={readOnly}
              />
            </div>
          </>
        )}

        {/* UPI Fields */}
        {formData.paymentMode === 'UPI' && (
          <>
            <div className={styles.field}>
              <label>UPI ID</label>
              <input
                type="text"
                name="upiId"
                value={formData.upiId}
                onChange={handleChange}
                readOnly={readOnly}
                disabled={readOnly}
              />
            </div>
            <div className={styles.field}>
              <label>UPI Number</label>
              <input
                type="text"
                name="upiNumber"
                value={formData.upiNumber}
                onChange={handleChange}
                readOnly={readOnly}
                disabled={readOnly}
              />
            </div>
            <div className={styles.field}>
              <label>UPI App</label>
              <select name="upiApp" value={formData.upiApp} onChange={handleChange} disabled={readOnly}>
                <option value="">Select UPI App</option>
                <option value="GPay">GPay</option>
                <option value="Paytm">Paytm</option>
                <option value="PhonePe">PhonePe</option>
              </select>
            </div>
            <div className={styles.field}>
              <label>Who Paid</label>
              <input
                type="text"
                name="whoPaid"
                value={formData.whoPaid}
                onChange={handleChange}
                readOnly={readOnly}
                disabled={readOnly}
              />
            </div>
            <div className={styles.field}>
              <label>Who Received</label>
              <input
                type="text"
                name="whoReceived"
                value={formData.whoReceived}
                onChange={handleChange}
                readOnly={readOnly}
                disabled={readOnly}
              />
            </div>
            <div className={styles.field}>
              <label>Transaction Date</label>
              <input
                type="date"
                name="transactionDate"
                value={formData.transactionDate}
                onChange={handleChange}
                readOnly={readOnly}
                disabled={readOnly}
              />
            </div>
          </>
        )}

        {/* Cash Fields */}
        {formData.paymentMode === 'Cash' && (
          <div className={styles.field}>
            <label>Transaction Date</label>
            <input
              type="date"
              name="transactionDate"
              value={formData.transactionDate}
              onChange={handleChange}
              readOnly={readOnly}
              disabled={readOnly}
            />
          </div>
        )}

        <div className={styles.field}>
          <label>Comments</label>
          <input
            type="text"
            name="comments"
            value={formData.comments}
            onChange={handleChange}
            readOnly={readOnly}
            disabled={readOnly}
          />
        </div>
      </div>

      {!readOnly && (
        <div className={styles.actions}>
          <button onClick={handleSubmit}>Submit</button>
        </div>
      )}
    </div>
  );
}
