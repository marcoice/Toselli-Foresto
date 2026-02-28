import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await db.execute({
      sql: 'SELECT * FROM jobs WHERE id = ?',
      args: [Number(id)],
    });

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const job = result.rows[0];
    return NextResponse.json({
      ...job,
      requirements: typeof job.requirements === 'string' ? JSON.parse(job.requirements) : job.requirements,
      benefits: typeof job.benefits === 'string' ? JSON.parse(job.benefits) : job.benefits,
    });
  } catch (error) {
    console.error('Error fetching job:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
