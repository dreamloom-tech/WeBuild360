import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongo';
import { verifyToken, getTokenFromHeader } from '@/lib/auth';

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const items = await db.collection('materials').find({}).toArray();
    return NextResponse.json(items);
  } catch (err) {
    console.warn('Materials GET failed, returning empty', err);
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  try {
    const token = getTokenFromHeader(req as any);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try { verifyToken(token as string); } catch (e) { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }

    const body = await req.json();
    if (!body.name) return NextResponse.json({ error: 'Missing name' }, { status: 400 });
    const { db } = await connectToDatabase();
    const res = await db.collection('materials').insertOne({ ...body, updatedAt: new Date().toISOString() });
    const item = await db.collection('materials').findOne({ _id: res.insertedId });
    return NextResponse.json(item);
  } catch (err) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
