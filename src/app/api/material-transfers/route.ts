import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongo';
import { verifyToken, getTokenFromHeader } from '@/lib/auth';

// Require bearer token for both GET and POST
export async function GET(req: Request) {
  try {
    const token = getTokenFromHeader(req as any);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try { verifyToken(token as string); } catch (e) { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }

    const { db } = await connectToDatabase();
    const items = await db.collection('material_transfers').find({}).toArray();
    return NextResponse.json(items);
  } catch (err) {
    console.warn('Material transfers GET failed, returning empty', err);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const token = getTokenFromHeader(req as any);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try { verifyToken(token as string); } catch (e) { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }

    const body = await req.json();
    if (!body.project && !body.fromProject) return NextResponse.json({ error: 'Missing project' }, { status: 400 });
    const { db } = await connectToDatabase();
    const res = await db.collection('material_transfers').insertOne({ ...body, date: body.date || new Date().toISOString() });
    const item = await db.collection('material_transfers').findOne({ _id: res.insertedId });
    return NextResponse.json(item);
  } catch (err) {
    console.warn('Material transfers POST failed', err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
