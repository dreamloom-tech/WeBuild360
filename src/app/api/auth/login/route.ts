import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongo';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    const { db } = await connectToDatabase();
    const users = db.collection('users');

    const user = await users.findOne({ email });
    if (!user) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

    const token = jwt.sign({ sub: user._id.toString(), email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
    return NextResponse.json({ token, user: { id: user._id.toString(), email: user.email, name: user.name } });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
