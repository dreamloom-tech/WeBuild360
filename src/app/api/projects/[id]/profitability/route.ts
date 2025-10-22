import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongo';
import { ObjectId } from 'mongodb';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    let projectId = url.searchParams.get('projectId');
    // If route called via path (/api/projects/:id/profitability), extract id from pathname
    if (!projectId) {
      const parts = url.pathname.split('/').filter(Boolean);
      // expected parts: ['api','projects', '<id>', 'profitability']
      const idx = parts.indexOf('projects');
      if (idx >= 0 && parts.length > idx + 1) projectId = parts[idx + 1];
    }
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate') || new Date().toISOString();
    
    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    // Get project details
    const project = await db.collection('projects').findOne({ 
      _id: new ObjectId(projectId) 
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Get total salary expenses for the project
    const salaryExpenses = await db.collection('salary_history')
      .aggregate([
        { $match: { projectId: projectId } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]).toArray();

    // Get total material purchase expenses
    const materialExpenses = await db.collection('expenses')
      .aggregate([
        { 
          $match: { 
            projectId: projectId, 
            type: 'material',
            date: { 
              $gte: new Date(startDate || '2020-01-01').toISOString(),
              $lte: new Date().toISOString() 
            }
          }
        },
        { 
          $group: { 
            _id: '$category',
            purchaseAmount: { $sum: '$amount' },
            purchaseQuantity: { $sum: '$quantity' }
          }
        }
      ]).toArray();

    // Get total material returns
    const materialReturns = await db.collection('material_returns')
      .aggregate([
        { 
          $match: { 
            projectId: projectId,
            date: { 
              $gte: new Date(startDate || '2020-01-01').toISOString(),
              $lte: new Date().toISOString() 
            }
          }
        },
        { 
          $group: { 
            _id: '$category',
            returnAmount: { $sum: '$amount' },
            returnQuantity: { $sum: '$quantity' }
          }
        }
      ]).toArray();

    // Get total material usage (for tracking only, not cost)
    const materialUsage = await db.collection('material_usage')
      .aggregate([
        { 
          $match: { 
            projectId: projectId,
            date: { 
              $gte: new Date(startDate || '2020-01-01').toISOString(),
              $lte: new Date().toISOString() 
            }
          }
        },
        { 
          $group: { 
            _id: '$category',
            usedQuantity: { $sum: '$quantity' }
          }
        }
      ]).toArray();

    // Calculate totals (using 0 if no records found)
    const totalSalary = salaryExpenses[0]?.total || 0;
    
    // Calculate material totals by category
    const materialSummary = new Map();

    materialExpenses.forEach((expense: any) => {
      if (!materialSummary.has(expense._id)) {
        materialSummary.set(expense._id, {
          category: expense._id,
          purchaseAmount: 0,
          purchaseQuantity: 0,
          returnAmount: 0,
          returnQuantity: 0,
          usedQuantity: 0
        });
      }
      const summary = materialSummary.get(expense._id);
      summary.purchaseAmount = expense.purchaseAmount || 0;
      summary.purchaseQuantity = expense.purchaseQuantity || 0;
    });

    materialReturns.forEach((ret: any) => {
      if (!materialSummary.has(ret._id)) {
        materialSummary.set(ret._id, {
          category: ret._id,
          purchaseAmount: 0,
          purchaseQuantity: 0,
          returnAmount: 0,
          returnQuantity: 0,
          usedQuantity: 0
        });
      }
      const summary = materialSummary.get(ret._id);
      summary.returnAmount = ret.returnAmount || 0;
      summary.returnQuantity = ret.returnQuantity || 0;
    });

    materialUsage.forEach((usage: any) => {
      if (materialSummary.has(usage._id)) {
        const summary = materialSummary.get(usage._id);
        summary.usedQuantity = usage.usedQuantity || 0;
      }
    });

    const materials = Array.from(materialSummary.values());
    const totalPurchases = materials.reduce((sum, m) => sum + m.purchaseAmount, 0);
    const totalReturns = materials.reduce((sum, m) => sum + m.returnAmount, 0);
    
    // Calculate net costs and profit
    const projectValue = project.projectValue || 0;
    const totalExpenses = totalSalary + totalPurchases - totalReturns;
    const profit = projectValue - totalExpenses;

    return NextResponse.json({
      projectValue,
      expenses: {
        salary: totalSalary,
        materials: {
          purchases: totalPurchases,
          returns: totalReturns,
          net: totalPurchases - totalReturns
        },
        total: totalExpenses
      },
      materials: materials.map(m => ({
        ...m,
        netCost: m.purchaseAmount - m.returnAmount,
        remainingQuantity: m.purchaseQuantity - m.returnQuantity - m.usedQuantity
      })),
      profit
    });

  } catch (err) {
    console.error('Project profitability calculation failed:', err);
    return NextResponse.json({ error: 'Failed to calculate project profitability' }, { status: 500 });
  }
}