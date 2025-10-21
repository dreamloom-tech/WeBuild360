import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongo';
import { getTokenFromHeader, verifyToken } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const workerId = url.searchParams.get('workerId');
    const { db } = await connectToDatabase();
    const filter: any = {};
    if (workerId) filter.workerId = workerId;
    const items = await db.collection('advances').find(filter).sort({ createdAt: -1 }).toArray();
    return NextResponse.json(items);
  } catch (err) {
    console.warn('Advances GET failed', err);
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  try {
    const token = getTokenFromHeader(req as any);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try { verifyToken(token as string); } catch (e) { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }

    const body = await req.json();
    if (!body || !body.workerId || typeof body.amount !== 'number') return NextResponse.json({ error: 'Missing data' }, { status: 400 });

    const { db } = await connectToDatabase();
    const doc = { ...body, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    const res = await db.collection('advances').insertOne(doc);
    const item = await db.collection('advances').findOne({ _id: res.insertedId });
    return NextResponse.json(item);
  } catch (err) {
    console.error('Advances POST failed', err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}


