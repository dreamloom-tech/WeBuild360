import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import connectToDatabase from '@/lib/mongo';
import { verifyToken, getTokenFromHeader } from '@/lib/auth';

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const items = await db.collection('workers').find({}).toArray();
    return NextResponse.json(items);
  } catch (err) {
    console.warn('Workers GET failed, returning empty', err);
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  try {
    const token = getTokenFromHeader(req as any);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try { verifyToken(token as string); } catch (e) { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }

    const body = await req.json();
    if (!body.firstName) return NextResponse.json({ error: 'Missing firstName' }, { status: 400 });
    const { db } = await connectToDatabase();
    const res = await db.collection('workers').insertOne({ ...body, joinDate: body.joinDate || new Date().toISOString(), status: body.status || 'active' });
    const item = await db.collection('workers').findOne({ _id: res.insertedId });
    return NextResponse.json(item);
  } catch (err) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const token = getTokenFromHeader(req as any);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try { verifyToken(token as string); } catch (e) { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }

    const body = await req.json();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    // validate id and prevent setting immutable _id field
    let objectId;
    try {
      objectId = new ObjectId(id);
    } catch (err) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }

    // remove _id from body if present to avoid immutable field error
    if (body && typeof body === 'object' && '_id' in body) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _id, ...rest } = body as any;
      // use rest as body
      Object.assign(body, rest);
    }

    const { db } = await connectToDatabase();
    const result = await db.collection('workers').updateOne(
      { _id: objectId },
      { $set: { ...body, updatedAt: new Date().toISOString() } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Worker not found' }, { status: 404 });
    }

    const updated = await db.collection('workers').findOne({ _id: objectId });
    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update worker' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const token = getTokenFromHeader(req as any);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try { verifyToken(token as string); } catch (e) { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const { db } = await connectToDatabase();
    const objectId = new ObjectId(id);
    
    const result = await db.collection('workers').deleteOne({ _id: objectId });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Worker not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete worker' }, { status: 500 });
  }
}
