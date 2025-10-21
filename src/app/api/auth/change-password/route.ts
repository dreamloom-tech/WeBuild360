import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongo';
import bcrypt from 'bcryptjs';
import { verifyToken } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const auth = (req as any).headers.get('authorization') || '';
    const token = auth.split(' ')[1];
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload: any = verifyToken(token as string);
    const { oldPassword, newPassword } = await req.json();
    if (!oldPassword || !newPassword) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    const { db } = await connectToDatabase();
    const users = db.collection('users');
    const ObjectId = require('mongodb').ObjectId;
    const user = await users.findOne({ _id: new ObjectId(payload.sub) });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const ok = await bcrypt.compare(oldPassword, user.password);
    if (!ok) return NextResponse.json({ error: 'Current password incorrect' }, { status: 401 });

    const hashed = await bcrypt.hash(newPassword, 10);
    await users.updateOne({ _id: user._id }, { $set: { password: hashed } });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
