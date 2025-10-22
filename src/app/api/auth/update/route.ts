import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongo';
import { verifyToken } from '@/lib/auth';

export async function PUT(req: Request) {
  try {
    const auth = (req as any).headers.get('authorization') || '';
    const token = auth.split(' ')[1];
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload: any = verifyToken(token as string);
  const { name, avatar, mobile, address } = await req.json();
  console.log('/api/auth/update called for user', payload.sub, 'with', { name, avatar, mobile, address });
    const { db } = await connectToDatabase();
    const users = db.collection('users');
    const ObjectId = require('mongodb').ObjectId;
    const user = await users.findOne({ _id: new ObjectId(payload.sub) });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const update: any = {};
    if (name) update.name = name;
    if (avatar) update.avatar = avatar;
    if (mobile) update.mobile = mobile;
    if (address) update.address = address;
    if (Object.keys(update).length === 0) return NextResponse.json({ error: 'No fields to update' }, { status: 400 });

    await users.updateOne(
      { _id: user._id },
      { $set: update }
    );
  const updated = await users.findOne({ _id: user._id });
  console.log('user updated in DB, avatar=', updated.avatar);
  return NextResponse.json({ ok: true, user: { id: updated._id.toString(), name: updated.name, avatar: updated.avatar || null, username: updated.username, mobile: updated.mobile || null, address: updated.address || null } });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
