import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongo';
import { ObjectId } from 'mongodb';

// GET - View a single transfer
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('material_transfers');

    const resolvedParams: any = await (params as any);
    const transfer = await collection.findOne({ _id: new ObjectId(resolvedParams.id) });
    if (!transfer) {
      return NextResponse.json({ error: 'Transfer not found' }, { status: 404 });
    }

    return NextResponse.json(transfer);
  } catch (error) {
    console.error('Get transfer error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Server error' 
    }, { status: 500 });
  }
}

// PUT - Update a transfer
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { client, db } = await connectToDatabase();
    const collection = db.collection('material_transfers');

    const body = await request.json();
    const { date, fromProject, toProject, category, subCategory, price, quantity } = body;
    const total = (Number(price) || 0) * (Number(quantity) || 0);

    const resolvedParams: any = await (params as any);
    const result = await collection.updateOne(
      { _id: new ObjectId(resolvedParams.id) },
      {
        $set: {
          date,
          fromProject,
          toProject,
          category,
          subCategory,
          price,
          quantity,
          total,
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Transfer not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: { id: resolvedParams.id, ...body, total } });
  } catch (error) {
    console.error('Update transfer error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Server error' 
    }, { status: 500 });
  }
}

// DELETE - Remove a transfer
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('material_transfers');

    const resolvedParams: any = await (params as any);
    const result = await collection.deleteOne({ _id: new ObjectId(resolvedParams.id) });
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Transfer not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete transfer error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Server error' 
    }, { status: 500 });
  }
}