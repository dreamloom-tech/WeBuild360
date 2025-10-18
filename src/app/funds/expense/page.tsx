"use client";

"use client";
import styles from "../expense/expense.module.css";

export default function ExpensePage() {
  return (
    <div className={styles.pageWrapper}>
      <h2 className={styles.pageTitle}>Expense Detail</h2>
      <div className={styles.tableWrapper}>
        <table className={styles.expenseTable}>
          <thead>
            <tr>
              <th>#</th>
              <th>Expense Description</th>
              <th>Expense Amount</th>
              <th>Expense Type</th>
              <th>Statement</th>
              <th>Transaction Date</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={6} className={styles.emptyRow}>
                No expenses recorded.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}