'use client';
import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Title,
} from 'chart.js';
import styles from '../app/dashboard/dashboard.module.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Tooltip, Legend, Title);

type ChartPoint = { name: string; value: number };

type Props = {
  barData?: ChartPoint[] | { labels: string[]; datasets: any[] };
  barOptions?: any;
};

/*
  ChartArea: single responsive area/bar chart (no pie)
  - height constrained by CSS (.chartBox.full -> min-height)
*/
export default function ChartArea({ barData, barOptions }: Props) {
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const, align: 'center' as const },
      title: { display: false },
      tooltip: { mode: 'index' as const, intersect: false },
    },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true, ticks: { stepSize: 2 } },
    },
    elements: {
      line: { tension: 0.35 },
      point: { radius: 3 },
    },
  };

  // normalize incoming data to chart.js format
  const normalized = (() => {
    if (!barData) return null;
    if (Array.isArray(barData)) {
      return {
        labels: (barData as ChartPoint[]).map((d) => d.name),
        datasets: [
          {
            label: 'Amount',
            data: (barData as ChartPoint[]).map((d) => d.value),
            backgroundColor: '#4caf50',
          },
        ],
      };
    }
    // assume it's already chart.js data shape
    return barData as { labels: string[]; datasets: any[] };
  })();

  return (
    <div className={styles.chartArea}>
      <div className={`${styles.chartBox} ${styles.full}`}>
        <div style={{ height: 360 }}>
          {normalized ? (
            <Bar data={normalized} options={{ ...defaultOptions, ...barOptions }} />
          ) : (
            <div style={{ padding: 24 }}>No chart data available</div>
          )}
        </div>
      </div>
    </div>
  );
}