import { NextResponse } from 'next/server';
import connectToDatabase from '../../../../lib/mongo';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  // Enable CORS
  if (req.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }
  try {
    const { name, email, password, mobile } = await req.json();
    if (!name || !email || !password) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    const { db } = await connectToDatabase();
    const users = db.collection('users');

    const exists = await users.findOne({ email });
    if (exists) return NextResponse.json({ error: 'Email already registered' }, { status: 409 });

    const usernameBase = (name || email.split('@')[0]).toLowerCase().replace(/[^a-z0-9]/g, '');
    let username = usernameBase;
    // ensure uniqueness
    let i = 0;
    while (await users.findOne({ username })) {
      i += 1;
      username = `${usernameBase}${i}`;
    }

    const hashed = await bcrypt.hash(password, 10);
    const res = await users.insertOne({ name, email, username, mobile: mobile || null, password: hashed, createdAt: new Date() });

    return NextResponse.json({ ok: true, id: res.insertedId.toString() }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
