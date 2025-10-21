import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongo';

export async function GET() {
  try {
    const { db } = await connectToDatabase();

    // Try to read an explicit shops collection
    const shopsCollectionExists = await db.listCollections({ name: 'shops' }).hasNext();
    let shops: { name: string }[] = [];

    if (shopsCollectionExists) {
      shops = await db.collection('shops').find({}).project({ name: 1, _id: 0 }).toArray();
    } else {
      // Fallback: derive shops from categories and subcategories
      const categories = await db.collection('categories').find({}).toArray();
      const subCategories = await db.collection('subcategories').find({}).toArray();
      const shopSet = new Set<string>();
      (categories || []).forEach((c: any) => { if (c?.shop) shopSet.add(c.shop); });
      (subCategories || []).forEach((s: any) => { if (s?.shop) shopSet.add(s.shop); });
      shops = Array.from(shopSet).map((name) => ({ name }));
    }

    return NextResponse.json({ shops });
  } catch (error) {
    console.error('shops GET error:', error);
    return NextResponse.json({ shops: [] });
  }
}
