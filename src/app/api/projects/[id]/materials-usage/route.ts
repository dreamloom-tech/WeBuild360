import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongo';
import { ObjectId } from 'mongodb';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    let projectId = url.searchParams.get('projectId');
    if (!projectId) {
      const parts = url.pathname.split('/').filter(Boolean);
      const idx = parts.indexOf('projects');
      if (idx >= 0 && parts.length > idx + 1) projectId = parts[idx + 1];
    }
    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    // Get material purchase details
    const purchases = await db.collection('expenses')
      .aggregate([
        { 
          $match: { 
            projectId: projectId,
            type: 'material'
          }
        },
        {
          $group: {
            _id: {
              category: '$category',
              item: '$item'
            },
            purchaseAmount: { $sum: '$amount' },
            purchaseQuantity: { $sum: '$quantity' }
          }
        }
      ]).toArray();

    // Get material return details
    const returns = await db.collection('material_returns')
      .aggregate([
        { 
          $match: { 
            projectId: projectId 
          }
        },
        {
          $group: {
            _id: {
              category: '$category',
              item: '$item'
            },
            returnAmount: { $sum: '$amount' },
            returnQuantity: { $sum: '$quantity' }
          }
        }
      ]).toArray();

    // Get material usage details
    const usage = await db.collection('material_usage')
      .aggregate([
        { 
          $match: { 
            projectId: projectId 
          }
        },
        {
          $group: {
            _id: {
              category: '$category',
              item: '$item'
            },
            usedQuantity: { $sum: '$quantity' }
          }
        }
      ]).toArray();

    // Combine all material details
    const materialsMap = new Map();

    // Add purchases
    purchases.forEach(p => {
      const key = `${p._id.category}-${p._id.item}`;
      materialsMap.set(key, {
        category: p._id.category,
        item: p._id.item,
        purchaseAmount: p.purchaseAmount || 0,
        purchaseQuantity: p.purchaseQuantity || 0,
        returnAmount: 0,
        returnQuantity: 0,
        usedQuantity: 0
      });
    });

    // Add/update returns
    returns.forEach(r => {
      const key = `${r._id.category}-${r._id.item}`;
      const existing = materialsMap.get(key) || {
        category: r._id.category,
        item: r._id.item,
        purchaseAmount: 0,
        purchaseQuantity: 0,
        returnAmount: 0,
        returnQuantity: 0,
        usedQuantity: 0
      };
      existing.returnAmount = r.returnAmount || 0;
      existing.returnQuantity = r.returnQuantity || 0;
      materialsMap.set(key, existing);
    });

    // Add/update usage
    usage.forEach(u => {
      const key = `${u._id.category}-${u._id.item}`;
      const existing = materialsMap.get(key) || {
        category: u._id.category,
        item: u._id.item,
        purchaseAmount: 0,
        purchaseQuantity: 0,
        returnAmount: 0,
        returnQuantity: 0,
        usedQuantity: 0
      };
      existing.usedQuantity = u.usedQuantity || 0;
      materialsMap.set(key, existing);
    });

    // Convert map to array and calculate remaining quantities
    const materials = Array.from(materialsMap.values()).map(m => ({
      ...m,
      remainingQuantity: (m.purchaseQuantity - m.returnQuantity - m.usedQuantity),
      netCost: (m.purchaseAmount - m.returnAmount)
    }));

    // Calculate totals
    const totals = {
      totalPurchaseAmount: materials.reduce((sum, m) => sum + m.purchaseAmount, 0),
      totalReturnAmount: materials.reduce((sum, m) => sum + m.returnAmount, 0),
      totalNetCost: materials.reduce((sum, m) => sum + m.netCost, 0)
    };

    return NextResponse.json({
      materials,
      totals
    });

  } catch (err) {
    console.error('Material usage calculation failed:', err);
    return NextResponse.json({ error: 'Failed to calculate material usage' }, { status: 500 });
  }
}