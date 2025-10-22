import { NextResponse } from 'next/server';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { verifyToken } from '@/lib/auth';
import connectToDatabase from '@/lib/mongo';

export async function POST(req: Request) {
  try {
    // Verify auth token
    const auth = req.headers.get('authorization') || '';
    const token = auth.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // verifyToken may throw; catch below
    try {
      verifyToken(token);
    } catch (err) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

  // Debug: log that upload route was hit
  console.log('/api/auth/upload-avatar called, headers:', Object.fromEntries(req.headers.entries()));

  // Parse form data
    let formData: FormData;
    try {
      formData = await req.formData();
    } catch (error) {
      console.error('FormData parsing error:', error);
      return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
    }

    // Get the file from form data
    const file = formData.get('avatar');
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Ensure it's a Blob/File with arrayBuffer
    if (typeof (file as any).arrayBuffer !== 'function') {
      return NextResponse.json({ error: 'No valid file uploaded' }, { status: 400 });
    }

    // Read file as buffer
    const bytes = await (file as any).arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Determine extension (prefer filename if available, else mime type)
    let extension = 'jpg';
    if ((file as any).name) {
      const parts = String((file as any).name).split('.');
      if (parts.length > 1) extension = parts.pop() as string;
    } else if ((file as any).type) {
      const t = String((file as any).type).split('/');
      if (t.length > 1) extension = t[1];
    }

    const fileName = `avatar-${Date.now()}.${extension}`;
    const filePath = join(uploadsDir, fileName);

    // Write file
    await writeFile(filePath, buffer);

    // Return public URL
    const url = `/uploads/${fileName}`;

    // Persist avatar URL to user's record so subsequent /me calls return updated avatar
    try {
      const payload: any = verifyToken(token);
      const { db } = await connectToDatabase();
      const users = db.collection('users');
      const ObjectId = require('mongodb').ObjectId;
      const userId = new ObjectId(payload.sub);

      // Fetch existing user to identify previous avatar
      const existing = await users.findOne({ _id: userId });
      const previousAvatar: string | null = existing?.avatar || null;

      const result = await users.updateOne({ _id: userId }, { $set: { avatar: url } });
      console.log('upload-avatar: db update result', result && (result as any).modifiedCount);

      // Remove previous avatar file if it's inside /public/uploads and different
      try {
        if (previousAvatar && previousAvatar !== url && previousAvatar.startsWith('/uploads/')) {
          const prevPath = join(process.cwd(), 'public', previousAvatar.replace(/^\//, ''));
          if (existsSync(prevPath)) {
            await unlink(prevPath);
            console.log('upload-avatar: removed previous avatar file', prevPath);
          }
        }
      } catch (unlinkErr) {
        console.error('upload-avatar: failed to remove previous avatar', unlinkErr);
      }

      const updated = await users.findOne({ _id: userId });
      return NextResponse.json({ url, user: { id: updated._id.toString(), name: updated.name, avatar: updated.avatar || null, username: updated.username, email: updated.email } });
    } catch (e) {
      console.error('Failed to persist avatar to DB:', e);
      // still return url so client can update immediately; client will call /api/auth/update too
      return NextResponse.json({ url });
    }
  } catch (err) {
    console.error('Upload error:', err);
    const message = err instanceof Error ? err.message : 'Failed to upload file';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
