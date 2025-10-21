"use client";

import { useEffect, useState } from 'react';
import WidgetCard from '../../components/WidgetCard';
import ChartArea from '../../components/ChartArea';
import StatsTable from '../../components/StatsTable';
import styles from './dashboard.module.css';
import { fetchWithAuth } from '@/lib/fetchWithAuth';

type DashboardData = {
  widgets: { projectCount: number; totalBudget: number; totalExpense: number; activeWorkers: number };
  charts: { monthlyExpense: { month: string; amount: number }[]; expenseByCategory: { category: string; amount: number }[] };
  recentExpenses: { id: string; date: string; category: string; amount: number; project: string }[];
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await fetchWithAuth('/api/dashboard/overview');
        if (!res.ok) throw new Error('Failed to fetch dashboard');
        const json = await res.json();
        if (mounted) setData(json);
      } catch (err: any) {
        if (mounted) setError(err.message || 'Error');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  if (loading) return <div className={styles.container}>Loading dashboard...</div>;
  if (error) return <div className={styles.container}>Error: {error}</div>;
  if (!data) return <div className={styles.container}>No data</div>;

  const widgetData = [
    { color: '#4CAF50', icon: 'FaFolderOpen', value: data.widgets.projectCount.toString(), label: 'Projects' },
    { color: '#2196F3', icon: 'FaMoneyBillWave', value: `₹${data.widgets.totalBudget.toLocaleString()}`, label: 'Total Budget' },
    { color: '#F44336', icon: 'FaArrowDown', value: `₹${data.widgets.totalExpense.toLocaleString()}`, label: 'Total Expense' },
    { color: '#9C27B0', icon: 'FaUsers', value: data.widgets.activeWorkers.toString(), label: 'Active Workers' },
  ];

  const barData = data.charts.monthlyExpense.map((m) => ({ name: m.month, value: m.amount }));
  const expenseRows = data.recentExpenses.map((e) => ({ name: e.category, amount: e.amount, project: e.project, date: new Date(e.date).toLocaleDateString() }));

  return (
    <div className={styles.container}>
      <h2 className={styles.pageTitle}>Dashboard</h2>

      <section className={styles.statsGrid}>
        {widgetData.map((w, i) => (
          <WidgetCard key={i} color={w.color} icon={w.icon} value={w.value} label={w.label} />
        ))}
      </section>

      <section className={styles.chartCard}>
        <div className={styles.cardHeader}>Monthly Expenses & Recent Activity</div>

        <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <ChartArea barData={barData} />
          </div>

          <div style={{ width: 360 }}>
            <h6>Recent Expenses</h6>
            <StatsTable rows={expenseRows} />
          </div>
        </div>
      </section>
    </div>
  );
}