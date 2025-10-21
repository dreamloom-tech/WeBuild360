import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongo';
import { verifyToken, getTokenFromHeader } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

// Simple helper to write the uploaded file buffer to public/uploads/receipts
async function saveFile(filename: string, buffer: Buffer) {
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'receipts');
  await fs.promises.mkdir(uploadsDir, { recursive: true });
  const filePath = path.join(uploadsDir, filename);
  await fs.promises.writeFile(filePath, buffer);
  return `/uploads/receipts/${filename}`;
}

export async function POST(req: Request) {
  try {
    const token = getTokenFromHeader(req as any);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try { verifyToken(token as string); } catch (e) { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }


    const contentType = req.headers.get('content-type') || '';

    // Support JSON upload (base64) for simpler client integration
    if (contentType.includes('application/json')) {
      const bodyJson = await req.json();
      const { recordId: rId, type: t, filename: fn, data } = bodyJson as any;
      if (!rId || !fn || !data) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
      const fileBuffer = Buffer.from(data, 'base64');
      const safeName = `${Date.now()}-${String(fn).replace(/[^a-zA-Z0-9.\-]/g, '_')}`;
      const receiptUrl = await saveFile(safeName, fileBuffer as Buffer);
      const { db } = await connectToDatabase();
      let collectionName = '';
      if (t === 'Purchase') collectionName = 'material_purchases';
      else if (t === 'Used') collectionName = 'material_uses';
      else if (t === 'Return') collectionName = 'material_returns';
      else collectionName = 'material_purchases';
      const { ObjectId } = await import('mongodb');
      const objectId = new ObjectId(rId);
      await db.collection(collectionName).updateOne({ _id: objectId }, { $set: { receiptUrl } });
      const updated = await db.collection(collectionName).findOne({ _id: objectId });
      return NextResponse.json({ success: true, updated });
    }

    // We only accept JSON/base64 uploads in this route for simplicity.
    return NextResponse.json({ error: 'Only application/json (base64) uploads are supported. Please send { recordId, type, filename, data }' }, { status: 400 });
  } catch (err) {
    console.error('Upload receipt failed', err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
