import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongo';

// Return categories, subcategories and unique shops for dropdowns
export async function GET() {
  try {
    const { db } = await connectToDatabase();

    const categories = await db.collection('categories').find({}).toArray();
    const subCategories = await db.collection('subcategories').find({}).toArray();

    // Build unique shops list from categories and subcategories
    const shopSet = new Set<string>();
    (categories || []).forEach((c: any) => { if (c?.shop) shopSet.add(c.shop); });
    (subCategories || []).forEach((s: any) => { if (s?.shop) shopSet.add(s.shop); });

    const shops = Array.from(shopSet).map((name) => ({ name }));

    // Normalize categories for frontend: ensure { type, shop }
    const normalizedCategories = (categories || []).map((c: any) => ({ type: c.type, shop: c.shop }));

    // Normalize subcategories for frontend: { name, category, shop, unit }
    const normalizedSubCategories = (subCategories || []).map((s: any) => ({
      name: s.name,
      category: s.category,
      shop: s.shop,
      unit: s.unit || ''
    }));

    // Build grouped structure: shops -> categories -> subCategories
    const grouped: any[] = [];
    shops.forEach((shopObj) => {
      const shopName = shopObj.name;
      const shopCategories = normalizedCategories
        .filter((c: any) => c.shop === shopName)
        .map((c: any) => ({ type: c.type }));

      const categoriesWithChildren = shopCategories.map((cat: any) => {
        const children = normalizedSubCategories
          .filter((s: any) => s.shop === shopName && s.category === cat.type)
          .map((s: any) => ({ name: s.name, unit: s.unit }));
        return { type: cat.type, children };
      });

      grouped.push({ shop: shopName, categories: categoriesWithChildren });
    });

    return NextResponse.json({
      categories: normalizedCategories,
      subCategories: normalizedSubCategories,
      shops,
      grouped,
    });
  } catch (error) {
    console.error('material-menus GET error:', error);
    return NextResponse.json({ categories: [], subCategories: [], shops: [] });
  }
}
