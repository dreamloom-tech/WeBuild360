import React from 'react';
import styles from '@/app/funds/expense/expensePage.module.css';

type Props = {
  show: boolean;
  message: string;
  type?: 'success' | 'error' | 'info';
  action?: 'purchase' | 'return' | 'manual';
};

export default function Toast({ show, message, type = 'success', action }: Props) {
  if (!show) return null;
  
  const getToastClass = () => {
    if (type === 'error') return styles.toastError;
    if (action === 'purchase') return styles.toastPurchase;
    if (action === 'return') return styles.toastReturn;
    if (action === 'manual') return styles.toastManual;
    return styles.toastSuccess;
  };

  return (
    <div className={styles.toastWrapper} role="status" aria-live="polite">
      <div className={`${styles.toast} ${getToastClass()}`}>
        {message}
      </div>
    </div>
  );
}
