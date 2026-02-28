import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conditions: string[] = [];
    const args: string[] = [];

    if (searchParams.get('category')) {
      conditions.push('category = ?');
      args.push(searchParams.get('category')!);
    }
    if (searchParams.get('level')) {
      conditions.push('level = ?');
      args.push(searchParams.get('level')!);
    }

    let sql = 'SELECT id, title, description, category, level, duration, badge_name, badge_color, prerequisites FROM courses';
    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    sql += ' ORDER BY id ASC';

    const result = await db.execute({ sql, args });
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
