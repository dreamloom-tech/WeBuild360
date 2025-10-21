import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongo';
import bcrypt from 'bcryptjs';
import { verifyToken } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { token, newPassword } = await req.json();
    if (!token || !newPassword) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    const payload: any = verifyToken(token as string);
    const { db } = await connectToDatabase();
    const users = db.collection('users');
    const ObjectId = require('mongodb').ObjectId;
    const user = await users.findOne({ _id: new ObjectId(payload.sub) });
    if (!user) return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
    if (!user.resetToken || user.resetToken !== token) return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
    if (user.resetTokenExpiry && new Date(user.resetTokenExpiry) < new Date()) return NextResponse.json({ error: 'Token expired' }, { status: 400 });

    const hashed = await bcrypt.hash(newPassword, 10);
    await users.updateOne({ _id: user._id }, { $set: { password: hashed }, $unset: { resetToken: '', resetTokenExpiry: '' } });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
