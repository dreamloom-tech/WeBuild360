import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongo';
import { getTokenFromHeader, verifyToken } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const { db } = await connectToDatabase();
    const items = await db.collection('salary_history').find({}).toArray();
    return NextResponse.json(items);
  } catch (err) {
    console.warn('Salary GET failed', err);
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  try {
    const token = getTokenFromHeader(req as any);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try { verifyToken(token as string); } catch (e) { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }

    const body = await req.json();
    if (!body || !body.name) return NextResponse.json({ error: 'Missing data' }, { status: 400 });

    const { db } = await connectToDatabase();
    const res = await db.collection('salary_history').insertOne({ ...body, createdAt: new Date().toISOString() });
    const item = await db.collection('salary_history').findOne({ _id: res.insertedId });
    return NextResponse.json(item);
  } catch (err) {
    console.error('Salary POST failed', err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export default {};
