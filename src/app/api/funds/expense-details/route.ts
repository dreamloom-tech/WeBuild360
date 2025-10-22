import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongo';

function safeDate(d: any) {
  if (!d) return null;
  const dt = typeof d === 'string' ? new Date(d) : d;
  if (isNaN(dt.getTime())) return null;
  return dt;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');
    const project = url.searchParams.get('projectId');

    const { db } = await connectToDatabase();

    // Manual expenses
    const expFilter: any = {};
    if (from || to) expFilter.date = {};
    if (from) expFilter.date.$gte = new Date(from).toISOString();
    if (to) expFilter.date.$lte = new Date(to).toISOString();
    if (project) expFilter.project = project;
    const manual = await db.collection('expenses').find(expFilter).toArray().catch(() => []);

    // Material purchases
    const purchaseFilter: any = {};
    if (from || to) purchaseFilter.creditedAt = {};
    if (from) purchaseFilter.creditedAt.$gte = new Date(from).toLocaleDateString();
    if (to) purchaseFilter.creditedAt.$lte = new Date(to).toLocaleDateString();
    if (project) purchaseFilter.project = project;
    const purchases = await db.collection('material_purchases').find(purchaseFilter).toArray().catch(async () => {
      return db.collection('purchase-details').find(purchaseFilter).toArray().catch(() => []);
    });

    // Material returns
    const returnFilter: any = {};
    if (from || to) returnFilter.date = {};
    if (from) returnFilter.date.$gte = new Date(from).toISOString();
    if (to) returnFilter.date.$lte = new Date(to).toISOString();
    if (project) returnFilter.project = project;
    const returns = await db.collection('material_returns').find(returnFilter).toArray().catch(() => []);

    // Salary entries
    const salaryFilter: any = {};
    if (from || to) salaryFilter.date = {};
    if (from) salaryFilter.date.$gte = new Date(from).toISOString();
    if (to) salaryFilter.date.$lte = new Date(to).toISOString();
    if (project) salaryFilter.projectName = project;
    const salaries = await db.collection('salary_history').find(salaryFilter).toArray().catch(() => []);

    const rows: any[] = [];

    manual.forEach((m: any) => rows.push({
      _id: m._id,
      date: m.date || m.createdAt || null,
      amount: Number(m.amount || 0),
      source: 'manual',
      project: m.project || null,
      category: m.category || null,
      description: m.comments || m.description || '',
      receiptUrl: m.receiptUrl || null,
      raw: m,
    }));

    purchases.forEach((p: any) => rows.push({
      _id: p._id,
      date: p.creditedAt || p.date || null,
      amount: Number(p.total || p.amount || 0),
      source: 'materials',
      project: p.project || null,
      category: p.category || null,
      description: p.comments || p.subcategory || '',
      receiptUrl: p.receiptUrl || null,
      raw: p,
    }));

    // Treat returns as negative expenses
    returns.forEach((r: any) => rows.push({
      _id: r._id,
      date: r.date || r.createdAt || null,
      amount: -(Number(r.total || r.amount || 0)),
      source: 'materials',
      project: r.project || null,
      category: r.category || null,
      description: r.note || r.comments || 'Return',
      receiptUrl: r.receiptUrl || null,
      raw: r,
    }));

    salaries.forEach((s: any) => rows.push({
      _id: s._id,
      date: s.date || s.createdAt || null,
      amount: Number(s.paid || s.paidAmount || s.amount || 0),
      source: 'salary',
      project: s.projectName || null,
      category: s.type || 'Salary',
      description: `${s.name || ''}`,
      receiptUrl: null,
      raw: s,
    }));

    // Sort and compute total
    rows.sort((a, b) => {
      const da = a.date ? new Date(a.date).getTime() : 0;
      const db = b.date ? new Date(b.date).getTime() : 0;
      return db - da;
    });

    const total = rows.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

    return NextResponse.json({ rows, total });
  } catch (err) {
    console.error('Funds expense-details failed', err);
    return NextResponse.json({ rows: [], total: 0 });
  }
}

export default {};
