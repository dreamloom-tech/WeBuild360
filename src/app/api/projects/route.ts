import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongo';
import { verifyToken, getTokenFromHeader } from '@/lib/auth';

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const projects = await db.collection('projects').find({}).toArray();

    // Aggregate total received per project from funds_inflow collection
    const sums = await db.collection('funds_inflow').aggregate([
      { $group: { _id: '$projectId', totalReceived: { $sum: '$amount' } } }
    ]).toArray();

    const sumsMap: Record<string, number> = {};
    sums.forEach((s: any) => { if (s && s._id) sumsMap[String(s._id)] = s.totalReceived || 0; });

    // Attach receivedAmount to each project for UI
    const enriched = projects.map((p: any) => ({
      ...p,
      receivedAmount: sumsMap[String(p._id)] || 0
    }));

    return NextResponse.json(enriched);
  } catch (err) {
    console.warn('Projects GET error, returning empty list', err);
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  try {
    const token = getTokenFromHeader(req as any);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try { verifyToken(token as string); } catch (e) { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }

    const { db } = await connectToDatabase();
    const body = await req.json();
    if (!body.name) return NextResponse.json({ error: 'Missing name' }, { status: 400 });
    const res = await db.collection('projects').insertOne({ ...body, createdAt: new Date().toISOString() });
    const project = await db.collection('projects').findOne({ _id: res.insertedId });
    return NextResponse.json(project);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
