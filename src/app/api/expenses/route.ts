import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongo';
import { verifyToken, getTokenFromHeader } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const projectId = url.searchParams.get('projectId');
    const { db } = await connectToDatabase();
    const query: any = {};
    if (projectId) query.projectId = projectId;
    const items = await db.collection('expenses').find(query).toArray();
    return NextResponse.json(items);
  } catch (err) {
    console.warn('Expenses GET failed, returning empty', err);
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  try {
    const token = getTokenFromHeader(req as any);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try { verifyToken(token as string); } catch (e) { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }

    const body = await req.json();
    if (!body.amount) return NextResponse.json({ error: 'Missing amount' }, { status: 400 });
    const { db } = await connectToDatabase();
    const res = await db.collection('expenses').insertOne({ ...body, date: body.date || new Date().toISOString() });
    const item = await db.collection('expenses').findOne({ _id: res.insertedId });
    return NextResponse.json(item);
  } catch (err) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
