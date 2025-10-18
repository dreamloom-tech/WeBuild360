/**
 * Mock data helpers used by Dashboard and examples.
 * - sampleDashboard() returns widgets, chart data and expense rows
 * - Replace with real aggregation from localStorage / API when ready
 */

export function sampleDashboard() {
  const widgets = [
    { color: '#f7a400', icon: '👷', value: '24', label: 'Total Projects' },
    { color: '#2b9af3', icon: '💰', value: '$72,500', label: 'Estimated Funds' },
    { color: '#1fb38a', icon: '⬆️', value: '$48,200', label: 'Total Received' },
    { color: '#eb4d8b', icon: '💵', value: '$24,300', label: 'Funds Available' },
  ];

  const barData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      { label: 'Total Projects', data: [8, 12, 10, 15, 9, 11], backgroundColor: '#2b9af3' },
      { label: 'Completed Projects', data: [5, 9, 7, 10, 6, 8], backgroundColor: '#1fb38a' },
    ],
  };

  const pieData = {
    labels: ['Materials', 'Salary', 'Advance', 'Transport', 'Misc'],
    datasets: [
      { data: [45, 30, 10, 8, 7], backgroundColor: ['#3b5998', '#ff9f40', '#e74c3c', '#9b59b6', '#7f8c8d'] },
    ],
  };

  const expenseRows = [
    { category: 'Materials Purchase', amount: '$8,200', note: 'Bulk steel order' },
    { category: 'Materials Refunded', amount: '$400', note: 'Return - damaged' },
    { category: 'Staff Salary', amount: '$12,000', note: 'Monthly payroll' },
    { category: 'Staff Advance', amount: '$2,500', note: 'Advance for site crew' },
    { category: 'Total', amount: '$22,300', note: '' },
  ];

  return { widgets, barData, pieData, expenseRows };
}