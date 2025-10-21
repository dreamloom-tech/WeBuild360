import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { verifyToken } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    // Verify auth token
    const auth = req.headers.get('authorization') || '';
    const token = auth.split(' ')[1];
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    verifyToken(token);

    // Get the file from form data
    const formData = await req.formData();
    const file = formData.get('avatar') as File;
    if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });

    // Read file as buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Create unique filename
    const ext = file.name.split('.').pop();
    const fileName = `avatar-${Date.now()}.${ext}`;
    const filePath = join(uploadsDir, fileName);
    
    // Write file
    await writeFile(filePath, buffer);
    
    // Return public URL
    const url = `/uploads/${fileName}`;
    return NextResponse.json({ url });
  } catch (err: any) {
    console.error('Upload error:', err);
    return NextResponse.json({ 
      error: err.message || 'Failed to upload file'
    }, { status: 500 });
  }
}
