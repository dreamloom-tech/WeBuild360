import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongo';

function toISO(d: string | Date | undefined) {
  if (!d) return null;
  const dt = typeof d === 'string' ? new Date(d) : d;
  if (isNaN(dt.getTime())) return null;
  return dt.toISOString();
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');
    const project = url.searchParams.get('project');
    const source = url.searchParams.get('source'); // optional filter

    const { db } = await connectToDatabase();

    // Build filters for each collection
    const dateFilter: any = {};
    if (from) dateFilter.$gte = new Date(from).toISOString();
    if (to) dateFilter.$lte = new Date(to).toISOString();

    // helper to add project filters
    const projectMatch = project ? { project: project } : {};

    // Fetch manual expenses
    const expFilter: any = {};
    if (from || to) expFilter.date = {};
    if (from) expFilter.date.$gte = new Date(from).toISOString();
    if (to) expFilter.date.$lte = new Date(to).toISOString();
    if (project) expFilter.project = project;
    const manual = await db.collection('expenses').find(expFilter).toArray();

    // Fetch material purchases
    const purchaseFilter: any = {};
    if (from || to) purchaseFilter.creditedAt = {};
    if (from) purchaseFilter.creditedAt.$gte = new Date(from).toLocaleDateString();
    if (to) purchaseFilter.creditedAt.$lte = new Date(to).toLocaleDateString();
    if (project) purchaseFilter.project = project;
    const purchases = await db.collection('material_purchases').find(purchaseFilter).toArray().catch(async () => {
      // fallback: some apps store purchases in purchase-details collection
      return db.collection('purchase-details').find(purchaseFilter).toArray().catch(() => []);
    });

    // Fetch salary payments
    const salaryFilter: any = {};
    if (from || to) salaryFilter.date = {};
    if (from) salaryFilter.date.$gte = new Date(from).toISOString();
    if (to) salaryFilter.date.$lte = new Date(to).toISOString();
    if (project) salaryFilter.projectName = project;
    const salaries = await db.collection('salary_history').find(salaryFilter).toArray();

    const rows: any[] = [];

    // normalize manual
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

    // normalize purchases
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

    // normalize salaries
    salaries.forEach((s: any) => rows.push({
      _id: s._id,
      date: s.date || s.createdAt || null,
      amount: Number(s.paid || s.paidAmount || 0),
      source: 'salary',
      project: s.projectName || null,
      category: s.type || 'Salary',
      description: `${s.name || ''}`,
      receiptUrl: null,
      raw: s,
    }));

    // Optionally filter by source
    const filtered = source ? rows.filter(r => r.source === source) : rows;

    // Sort by date desc
    filtered.sort((a, b) => {
      const da = a.date ? new Date(a.date).getTime() : 0;
      const db_ = b.date ? new Date(b.date).getTime() : 0;
      return db_ - da;
    });

    const total = filtered.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

    return NextResponse.json({ rows: filtered, total });
  } catch (err) {
    console.error('Reports expenses failed', err);
    return NextResponse.json({ rows: [], total: 0 });
  }
}

export default {};
