import WidgetCard from '../../components/WidgetCard';
import ChartArea from '../../components/ChartArea';
import StatsTable from '../../components/StatsTable';
import styles from './dashboard.module.css';
import { sampleDashboard } from '../../lib/mockData';

/*
  Dashboard page
  - renders widgets, charts and table using sampleDashboard()
*/
export default function DashboardPage() {
  const { widgets, barData, pieData, expenseRows } = sampleDashboard();

  return (
    <div className={styles.container}>
      <h2 className={styles.pageTitle}>Dashboard</h2>

      <section className={styles.statsGrid}>
        {widgets.map((w, i) => (
          <WidgetCard key={i} color={w.color} icon={w.icon} value={w.value} label={w.label} />
        ))}
      </section>

      <section className={styles.socialGrid}>
        <WidgetCard color="#3b5998" value="35k" label="Friends" />
        <WidgetCard color="#1da1f2" value="584k" label="Followers" />
        <WidgetCard color="#0077b5" value="758+" label="Contacts" />
        <WidgetCard color="#db4437" value="450" label="Google+" />
      </section>

      <section className={styles.chartCard}>
        <div className={styles.cardHeader}>Extra Area Chart & Expense Breakdown</div>

        <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <ChartArea barData={barData} />
          </div>

          <div style={{ width: 360 }}>
            <h6>Expense Summary</h6>
            <StatsTable rows={expenseRows} />
          </div>
        </div>
      </section>
    </div>
  );
}