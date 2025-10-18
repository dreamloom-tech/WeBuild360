'use client';
import React from 'react';
import styles from '../app/dashboard/dashboard.module.css';

type Props = {
  color?: string;
  icon?: React.ReactNode | string;
  value: string | number;
  label: string;
};

/*
  WidgetCard
  - small metric card used on Dashboard for KPIs
  - color: background for the icon block
  - icon: React node or emoji (keep simple for now)
  - value: main metric value
  - label: small description under value
*/
export default function WidgetCard({ color = '#f7a400', icon = '★', value, label }: Props) {
  return (
    <div className={styles.statCard} role="group" aria-label={label}>
      <div
        className={styles.statIcon}
        style={{ backgroundColor: color }}
        aria-hidden={!!icon}
      >
        {icon}
      </div>

      <div className={styles.statBody}>
        <div className={styles.statValue}>{value}</div>
        <div className={styles.statLabel}>{label}</div>
      </div>
    </div>
  );
}