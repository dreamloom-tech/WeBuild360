"use client";

import { useEffect, useState } from 'react';
import styles from "../expense/expense.module.css";
import StatsTable from '@/components/StatsTable';
import { fetchWithAuth } from '@/lib/fetchWithAuth';

export default function ExpensePage() {
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetchWithAuth('/api/expenses');
        const json = await res.json();
        if (mounted) setRows(json || []);
      } catch (err) {
        // ignore
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div className={styles.pageWrapper}>
      <h2 className={styles.pageTitle}>Expense Detail</h2>
      <div className={styles.tableWrapper}>
        <StatsTable rows={rows.map((r) => ({ category: r.category || r.description || 'Expense', amount: r.amount || 0, date: r.date, project: r.project }))} pageSize={10} />
      </div>
    </div>
  );
}