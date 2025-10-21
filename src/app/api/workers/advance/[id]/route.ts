import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import connectToDatabase from '@/lib/mongo';
import { getTokenFromHeader, verifyToken } from '@/lib/auth';

export async function DELETE(req: Request) {
  try {
    const token = getTokenFromHeader(req as any);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try { verifyToken(token as string); } catch (e) { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }

    const parts = req.url.split('/');
    const id = parts[parts.length - 1];
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    const { db } = await connectToDatabase();
    const objectId = new ObjectId(id);
    const result = await db.collection('advances').deleteOne({ _id: objectId });
    if (result.deletedCount === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export default {};
