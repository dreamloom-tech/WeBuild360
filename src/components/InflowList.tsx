"use client";

import styles from "../app/funds/inflow/InflowList.module.css";

export default function InflowList({
  projects,
  onDelete,
}: {
  projects: any[];
  onDelete?: (index: number) => void;
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
            <th>Bank</th>
            <th>Txn No</th>
            <th>Received By</th>
            <th>Comments</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {projects.length === 0 ? (
            <tr>
              <td colSpan={10} className={styles.emptyRow}>
                No fund inflows available.
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
                <td>{item.bankName || "-"}</td>
                <td>{item.transactionNo || "-"}</td>
                <td>{item.receivedBy}</td>
                <td>{item.comments || "-"}</td>
                <td>
                  <button
                    className={styles.deleteButton}
                    onClick={() => onDelete?.(index)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
