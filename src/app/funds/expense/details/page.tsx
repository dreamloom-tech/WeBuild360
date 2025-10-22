"use client";
import { useEffect, useState } from 'react';
import styles from '../inflow/inflow.module.css';
import fetchWithAuth from '@/lib/fetchWithAuth';
import { fetchProjectDropdownItems } from '@/lib/fetchProjectDropdownItems';

export default function FundsExpenseDetailsPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [projectId, setProjectId] = useState('');
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { (async () => {
    try { const items = await fetchProjectDropdownItems(); setProjects(items); } catch(e) {}
  })(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      if (projectId) params.set('projectId', projectId);
      const res = await fetchWithAuth(`/api/funds/expense-details?${params.toString()}`);
      const json = await res.json();
      setRows(json.rows || []);
      setTotal(json.total || 0);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div style={{ display: 'flex', gap: 8, flexDirection: 'column', alignItems: 'stretch' }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <h2 style={{ margin: 0 }}>Funds Expense - Details</h2>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <label>From: <input type="date" value={from} onChange={e=>setFrom(e.target.value)} /></label>
            <label>To: <input type="date" value={to} onChange={e=>setTo(e.target.value)} /></label>
            <label>Project:
              <select value={projectId} onChange={e=>setProjectId(e.target.value)}>
                <option value="">All</option>
                {projects.map(p=> <option key={p._id} value={p._id}>{p.name}</option>)}
              </select>
            </label>
            <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={fetchData}>Refresh</button>
          </div>
        </div>
        <div className={styles.right}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Total: ₹{total.toLocaleString()}</div>
        </div>
      </header>

      <div className={styles.tableWrap}>
        {loading ? <div>Loading...</div> : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Source</th>
                <th>Project</th>
                <th>Category/Staff</th>
                <th>Description</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r:any)=> (
                <tr key={String(r._id)}>
                  <td>{r.date ? new Date(r.date).toLocaleDateString() : '-'}</td>
                  <td>{r.source}</td>
                  <td>{r.project || '-'}</td>
                  <td>{r.category || '-'}</td>
                  <td>{r.description || ''}</td>
                  <td>₹{Number(r.amount || 0).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
