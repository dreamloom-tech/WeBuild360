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

type Props = {
  barData: any;
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

  return (
    <div className={styles.chartArea}>
      <div className={`${styles.chartBox} ${styles.full}`}>
        <div style={{ height: 360 }}>
          <Bar data={barData} options={{ ...defaultOptions, ...barOptions }} />
        </div>
      </div>
    </div>
  );
}