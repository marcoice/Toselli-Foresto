import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await db.execute({
      sql: `SELECT ub.*, c.badge_color, c.category, c.level as course_level
            FROM user_badges ub
            JOIN courses c ON ub.course_id = c.id
            WHERE ub.user_id = ?
            ORDER BY ub.earned_date DESC`,
      args: [Number(id)],
    });

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching badges:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
