import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongo';

const mockData = {
  widgets: {
    projectCount: 12,
    totalBudget: 1250000,
    totalExpense: 430000,
    activeWorkers: 86,
  },
  charts: {
    monthlyExpense: [
      { month: '2025-01', amount: 20000 },
      { month: '2025-02', amount: 30000 },
      { month: '2025-03', amount: 25000 },
      { month: '2025-04', amount: 40000 },
      { month: '2025-05', amount: 35000 },
      { month: '2025-06', amount: 45000 },
      { month: '2025-07', amount: 42000 },
      { month: '2025-08', amount: 38000 },
      { month: '2025-09', amount: 47000 },
      { month: '2025-10', amount: 52000 },
    ],
    expenseByCategory: [
      { category: 'Materials', amount: 200000 },
      { category: 'Labor', amount: 150000 },
      { category: 'Equipment', amount: 80000 },
      { category: 'Misc', amount: 10000 },
    ],
  },
  recentExpenses: [
    { id: '1', date: new Date().toISOString(), category: 'Materials', amount: 12000, project: 'Project A' },
    { id: '2', date: new Date().toISOString(), category: 'Labor', amount: 8000, project: 'Project B' },
    { id: '3', date: new Date().toISOString(), category: 'Equipment', amount: 15000, project: 'Project C' },
  ],
};

export async function GET() {
  try {
    // Try to connect to DB; if it fails, return mock
    try {
      const { db } = await connectToDatabase();

      const projects = await db.collection('projects').find({}).toArray();
      const projectCount = projects.length;
      const totalBudget = projects.reduce((s: number, p: any) => s + (p.budget || 0), 0);

      const expenses = await db.collection('expenses').find({}).toArray();
      const totalExpense = expenses.reduce((s: number, e: any) => s + (e.amount || 0), 0);

      const activeWorkers = await db.collection('workers').countDocuments({ status: 'active' });

      const monthlyAgg = await db.collection('expenses').aggregate([
        { $project: { month: { $dateToString: { format: '%Y-%m', date: { $toDate: '$date' } } }, amount: '$amount' } },
        { $group: { _id: '$month', amount: { $sum: '$amount' } } },
        { $sort: { _id: 1 } },
      ]).toArray();

      const categoryAgg = await db.collection('expenses').aggregate([
        { $group: { _id: '$category', amount: { $sum: '$amount' } } }
      ]).toArray();

      const recent = await db.collection('expenses').find({}).sort({ date: -1 }).limit(10).toArray();

      return NextResponse.json({
        widgets: {
          projectCount,
          totalBudget,
          totalExpense,
          activeWorkers,
        },
        charts: {
          monthlyExpense: monthlyAgg.map((m: any) => ({ month: m._id, amount: m.amount })),
          expenseByCategory: categoryAgg.map((c: any) => ({ category: c._id, amount: c.amount })),
        },
        recentExpenses: recent.map((r: any) => ({ id: r._id.toString(), date: r.date, category: r.category, amount: r.amount, project: r.project }))
      });
    } catch (err) {
      console.warn('DB unavailable, returning mock dashboard data', err);
      return NextResponse.json(mockData);
    }
  } catch (err: any) {
    console.error('dashboard overview error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
