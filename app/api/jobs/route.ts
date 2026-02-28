import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conditions: string[] = [];
    const args: (string | number)[] = [];

    if (searchParams.get('category')) {
      conditions.push('category = ?');
      args.push(searchParams.get('category')!);
    }
    if (searchParams.get('level')) {
      conditions.push('level = ?');
      args.push(searchParams.get('level')!);
    }
    if (searchParams.get('type')) {
      conditions.push('type = ?');
      args.push(searchParams.get('type')!);
    }
    if (searchParams.get('salary_min')) {
      conditions.push('salary_max >= ?');
      args.push(Number(searchParams.get('salary_min')));
    }
    if (searchParams.get('salary_max')) {
      conditions.push('salary_min <= ?');
      args.push(Number(searchParams.get('salary_max')));
    }
    if (searchParams.get('search')) {
      conditions.push('(title LIKE ? OR company LIKE ? OR description LIKE ?)');
      const term = `%${searchParams.get('search')}%`;
      args.push(term, term, term);
    }

    let sql = 'SELECT * FROM jobs';
    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    sql += ' ORDER BY posted_date DESC';

    const result = await db.execute({ sql, args });

    const jobs = result.rows.map((row) => ({
      ...row,
      requirements: typeof row.requirements === 'string' ? JSON.parse(row.requirements) : row.requirements,
      benefits: typeof row.benefits === 'string' ? JSON.parse(row.benefits) : row.benefits,
    }));

    return NextResponse.json(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
