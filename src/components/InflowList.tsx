"use client";

import styles from "../app/funds/inflow/InflowList.module.css";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa"; // install react-icons if not present

interface InflowItem {
  _id: string;
  projectName: string;
  paymentDate: string;
  fundReceived: number;
  paymentMode: string;
  bankName?: string;
  upiApp?: string;
  upiId?: string;
  comments?: string;
}

import React from 'react';

interface InflowItem {
  _id: string;
  projectName: string;
  paymentDate: string;
  fundReceived: number;
  paymentMode: string;
  bankName?: string;
  upiApp?: string;
  upiId?: string;
  comments?: string;
}

export default function InflowList({
  projects,
  onView,
  onEdit,
  onDelete,
}: {
  projects: InflowItem[];
  onView?: (item: InflowItem) => void;
  onEdit?: (item: InflowItem) => void;
  onDelete?: (item: InflowItem, index: number) => void;
}) {
  return (
    <div className={styles.tableWrapper}>
      <table className={styles.fixedTable}>
        <thead>
          <tr>
            <th>#</th>
            <th>Project</th>
            <th>Payment Date</th>
            <th>Fund Received (₹)</th>
            <th>Payment Mode</th>
            <th>Bank/UPI</th>
            <th>Comments</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {!projects || projects.length === 0 ? (
            <tr>
              <td colSpan={8} className={styles.emptyRow}>
                No fund inflows available. Please add some inflows.
              </td>
            </tr>
          ) : (
            projects.map((item, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{item.projectName}</td>
                <td>{item.paymentDate}</td>
                <td>₹{item.fundReceived}</td>
                <td>{item.paymentMode}</td>
                <td>
                  {item.paymentMode === "Bank Transfer" ? item.bankName : item.paymentMode === "UPI" ? `${item.upiApp || ""}${item.upiId ? " / " + item.upiId : ""}` : "-"}
                </td>
                <td>{item.comments || "-"}</td>
                <td className={styles.actionColumn}>
                  {item._id && (
                    <div className={styles.actionButtons}>
                      <button 
                        onClick={() => onView?.(item)} 
                        title="View Details"
                        className={`${styles.actionButton} ${styles.viewButton}`}
                      >
                        <FaEye /> View
                      </button>
                      <button 
                        onClick={() => onEdit?.(item)} 
                        title="Edit Inflow"
                        className={`${styles.actionButton} ${styles.editButton}`}
                      >
                        <FaEdit /> Edit
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this inflow?')) {
                            onDelete?.(item, index);
                          }
                        }}
                        title="Delete Inflow"
                        className={`${styles.actionButton} ${styles.deleteButton}`}
                      >
                        <FaTrash /> Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
