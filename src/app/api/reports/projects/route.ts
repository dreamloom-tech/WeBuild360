import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongo';

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const projects = await db.collection('projects').find({}).toArray();

    const reports = await Promise.all(projects.map(async (p: any) => {
      const expenses = await db.collection('expenses').aggregate([
        { $match: { project: p.name } },
        { $group: { _id: '$category', amount: { $sum: '$amount' } } }
      ]).toArray();

      const materials = await db.collection('material_transfers').aggregate([
        { $match: { project: p.name } },
        { $group: { _id: '$subcategory', qty: { $sum: '$quantity' }, cost: { $sum: '$total' } } }
      ]).toArray();

      return {
        project: p.name,
        budget: p.budget || 0,
        expensesByCategory: expenses.map((e: any) => ({ category: e._id, amount: e.amount })),
        materialSummary: materials.map((m: any) => ({ material: m._id, qty: m.qty, cost: m.cost })),
      };
    }));

    return NextResponse.json(reports);
  } catch (err) {
    console.warn('Reports generation failed', err);
    return NextResponse.json([]);
  }
}
