import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongo';
import { signToken } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 });
    const { db } = await connectToDatabase();
    const users = db.collection('users');
    const user = await users.findOne({ email });
    if (!user) return NextResponse.json({ ok: true }); // not revealing existence

    // create short-lived token (e.g., 1h) and store hashed token+expiry
    const token = signToken({ sub: user._id.toString() }, '1h');
    const expiry = new Date(Date.now() + 60 * 60 * 1000);
    await users.updateOne({ _id: user._id }, { $set: { resetToken: token, resetTokenExpiry: expiry } });

    // TODO: send email with reset link containing token

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
