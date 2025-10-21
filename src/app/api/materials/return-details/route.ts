import { ObjectId } from 'mongodb';

export async function DELETE(req: Request) {
  try {
    const token = getTokenFromHeader(req as any);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try { verifyToken(token as string); } catch (e) { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    const { db } = await connectToDatabase();
    const res = await db.collection('material_returns').deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ deleted: res.deletedCount });
  } catch (err) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongo';
import { verifyToken, getTokenFromHeader } from '@/lib/auth';

export async function PUT(req: Request) {
  try {
    const token = getTokenFromHeader(req as any);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try { verifyToken(token as string); } catch (e) { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }

    const body = await req.json();
    const id = body.id;
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    const { db } = await connectToDatabase();
    const update = { ...body };
    delete update.id;
    const res = await db.collection('material_returns').updateOne(
      { _id: new ObjectId(id) },
      { $set: update }
    );
  if (res.matchedCount === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const item = await db.collection('material_returns').findOne({ _id: new ObjectId(id) });
  return NextResponse.json({ updated: item });
  } catch (err) {
    console.error('Return PUT failed', err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const items = await db.collection('material_returns').find({}).toArray();
    return NextResponse.json(items);
  } catch (err) {
    console.warn('Return details GET failed, returning empty', err);
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  try {
    const token = getTokenFromHeader(req as any);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try { verifyToken(token as string); } catch (e) { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }

    const body = await req.json();
    if (!body.project) return NextResponse.json({ error: 'Missing project' }, { status: 400 });
    const { db } = await connectToDatabase();
    const inserted = await db.collection('material_returns').insertOne({ ...body, date: body.date || new Date().toISOString() });
    const item = await db.collection('material_returns').findOne({ _id: inserted.insertedId });
    return NextResponse.json(item);
  } catch (err) {
    console.error('Return POST failed', err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
