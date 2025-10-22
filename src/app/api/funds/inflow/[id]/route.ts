import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongo';
import { verifyToken, getTokenFromHeader } from '@/lib/auth';

export async function DELETE(req: Request, { params }: any) {
  try {
    const token = getTokenFromHeader(req as any);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try { verifyToken(token as string); } catch (e) { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }

    const id = params.id;
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const { db } = await connectToDatabase();
    const res = await db.collection('funds_inflow').deleteOne({ _id: new (require('mongodb').ObjectId)(id) });
    if (res.deletedCount === 1) return NextResponse.json({ success: true });
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  } catch (err) {
    console.error('Funds inflow DELETE failed', err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: any) {
  try {
    const token = getTokenFromHeader(req as any);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try { verifyToken(token as string); } catch (e) { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }

    const id = params.id;
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const body = await req.json();
    const update: any = {};
    const allowed = ['projectId','date','amount','mode','comments','bankName','ifsc','upiId','whoPaid','whoReceived','upiApp'];
    for (const k of allowed) if (k in body) update[k] = body[k];
    update.updatedAt = new Date().toISOString();

    const { db } = await connectToDatabase();
    const ObjectId = require('mongodb').ObjectId;
    const res = await db.collection('funds_inflow').updateOne({ _id: new ObjectId(id) }, { $set: update });
    if (res.matchedCount === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const item = await db.collection('funds_inflow').findOne({ _id: new ObjectId(id) });
    return NextResponse.json(item);
  } catch (err) {
    console.error('Funds inflow PUT failed', err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
