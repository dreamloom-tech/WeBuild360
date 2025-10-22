import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongo';
import { verifyToken, getTokenFromHeader } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const limit = parseInt(url.searchParams.get('limit') || '10', 10);
  const q = url.searchParams.get('q') || '';
  const projectId = url.searchParams.get('projectId');
  const mode = url.searchParams.get('mode');
  const year = url.searchParams.get('year');
  const month = url.searchParams.get('month');

    const skip = Math.max(0, page - 1) * limit;

    const { db } = await connectToDatabase();

      // First get matching project IDs if searching by project name
      let matchingProjectIds: string[] = [];
      if (q) {
        const projects = await db.collection('projects').find({
          name: { $regex: q, $options: 'i' }
        }).toArray();
          matchingProjectIds = projects.map((p: { _id: any }) => p._id.toString());
      }

      const filter: any = {};
      if (projectId) filter.projectId = projectId;
      if (mode) filter.mode = mode;

      // Year/month filters (filter by `date` field which is stored as YYYY-MM-DD)
      if (year && month) {
        const mm = month.padStart(2, '0');
        filter.date = { $regex: `^${year}-${mm}` };
      } else if (year) {
        filter.date = { $regex: `^${year}-` };
      }

      if (q) {
        // Comprehensive search across all relevant fields
        const searchRegex = { $regex: q, $options: 'i' };
        filter.$or = [
          { comments: searchRegex },
          { upiId: searchRegex },
          { bankName: searchRegex },
          { ifsc: searchRegex },
          { whoPaid: searchRegex },
          { whoReceived: searchRegex },
          { mobileNumber: searchRegex },
          // Include project ID if project name matches
          ...(matchingProjectIds.length > 0 ? [{ projectId: { $in: matchingProjectIds } }] : []),
          // Search for amount if the query is a number
          ...((!isNaN(Number(q))) ? [{ amount: Number(q) }] : []),
          // Search for mode if query matches mode types
          ...(q.toLowerCase().match(/^(cash|bank|upi)$/) ? [{ mode: q.toLowerCase() }] : [])
        ];
      }

      // Get total count
      const total = await db.collection('funds_inflow').countDocuments(filter);

      // Get paginated data with project details. Sort by creation time so newest created record appears first.
      const data = await db.collection('funds_inflow')
        .aggregate([
          { $match: filter },
          { $sort: { createdAt: -1 } },
          { $skip: skip },
          { $limit: limit },
          // Lookup project details
          {
            $lookup: {
              from: 'projects',
              localField: 'projectId',
              foreignField: '_id',
              as: 'project'
            }
          },
          // Unwind project array (converts array to object)
          { $unwind: { path: '$project', preserveNullAndEmptyArrays: true } }
        ]).toArray();

    return NextResponse.json({ data, total });
  } catch (err) {
    console.warn('Funds inflow GET failed', err);
    return NextResponse.json({ data: [], total: 0 });
  }
}

export async function POST(req: Request) {
  try {
    const token = getTokenFromHeader(req as any);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try { verifyToken(token as string); } catch (e) { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }

    const body = await req.json();
    const { projectId, date, amount, mode } = body;
    if (!projectId) return NextResponse.json({ error: 'Missing projectId' }, { status: 400 });
    if (!date) return NextResponse.json({ error: 'Missing date' }, { status: 400 });
    if (!amount || Number(amount) <= 0) return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });

    const record: any = {
      projectId,
      date,
      amount: Number(amount),
      mode,
      comments: body.comments || '',
      createdAt: new Date().toISOString(),
    };

    // conditional fields
    if (mode === 'bank') {
      record.bankName = body.bankName || '';
      record.ifsc = body.ifsc || '';
    }
    if (mode === 'upi') {
      record.mobileNumber = body.mobileNumber || ''; // Save mobile number
      record.upiId = body.upiId || '';
      record.whoPaid = body.whoPaid || '';
      record.whoReceived = body.whoReceived || '';
      record.upiApp = 'GPAY'; // Always save as GPAY
    }

    const { db } = await connectToDatabase();
    const res = await db.collection('funds_inflow').insertOne(record);
    const item = await db.collection('funds_inflow').findOne({ _id: res.insertedId });
    return NextResponse.json(item);
  } catch (err) {
    console.error('Funds inflow POST failed', err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
