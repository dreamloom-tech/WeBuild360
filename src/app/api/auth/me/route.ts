import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongo';
import { verifyToken } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const auth = (req as any).headers.get('authorization') || '';
    const token = auth.split(' ')[1];
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload: any = verifyToken(token as string);
    const { db } = await connectToDatabase();
    const users = db.collection('users');
    const ObjectId = require('mongodb').ObjectId;
    const user = await users.findOne({ _id: new ObjectId(payload.sub) });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    return NextResponse.json({ user: { id: user._id.toString(), name: user.name, email: user.email, avatar: user.avatar || null, username: user.username || null, mobile: user.mobile || null, address: user.address || null } });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
