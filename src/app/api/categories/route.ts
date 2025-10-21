import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongo';

// Get all categories and subcategories
export async function GET() {
  try {
    const { db } = await connectToDatabase();
    
    // Fetch both categories and subcategories
    const categories = await db.collection('categories').find({}).toArray();
    const subcategories = await db.collection('subcategories').find({}).toArray();
    
    return NextResponse.json({ 
      categories: categories || [], 
      subcategories: subcategories || [] 
    });
  } catch (error) {
    console.error('Categories GET error:', error);
    return NextResponse.json({ categories: [], subcategories: [] });
  }
}

// Add new category or subcategory
export async function POST(req: Request) {
  try {
    const { db } = await connectToDatabase();
    const data = await req.json();
    
    // Determine if it's a category or subcategory based on the data structure
    const isSubcategory = 'name' in data && 'category' in data;
    
    if (isSubcategory) {
      // Validate subcategory data
      if (!data.name || !data.category || !data.shop || !data.unit) {
        return NextResponse.json({ error: 'Missing required fields for subcategory' }, { status: 400 });
      }
      
      // Insert subcategory
      const result = await db.collection('subcategories').insertOne({
        name: data.name,
        category: data.category,
        shop: data.shop,
        grade: data.grade || '',
        unit: data.unit,
        createdAt: new Date()
      });
      
      return NextResponse.json({ success: true, _id: result.insertedId });
    } else {
      // Validate category data
      if (!data.type || !data.shop) {
        return NextResponse.json({ error: 'Missing required fields for category' }, { status: 400 });
      }
      
      // Insert category
      const result = await db.collection('categories').insertOne({
        type: data.type,
        shop: data.shop,
        createdAt: new Date()
      });
      
      return NextResponse.json({ success: true, _id: result.insertedId });
    }
  } catch (error) {
    console.error('Categories POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Delete category or subcategory
export async function DELETE(req: Request) {
  try {
    const { db } = await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const requestType = searchParams.get('type');
    
    if (requestType === 'sub') {
      const id = searchParams.get('id');
      if (!id) {
        return NextResponse.json({ error: 'Missing id parameter for subcategory deletion' }, { status: 400 });
      }
      await db.collection('subcategories').deleteOne({ _id: id });
    } else {
      const categoryType = searchParams.get('type');
      if (!categoryType) {
        return NextResponse.json({ error: 'Missing type parameter for category deletion' }, { status: 400 });
      }
      await db.collection('categories').deleteOne({ type: categoryType });
      // Also delete associated subcategories
      await db.collection('subcategories').deleteMany({ category: categoryType });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Categories DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
