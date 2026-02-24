import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await db.execute({
      sql: 'SELECT * FROM courses WHERE id = ?',
      args: [Number(id)],
    });

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    const course = result.rows[0];
    return NextResponse.json({
      ...course,
      modules: typeof course.modules === 'string' ? JSON.parse(course.modules) : course.modules,
      company_tips: typeof course.company_tips === 'string' ? JSON.parse(course.company_tips) : course.company_tips,
    });
  } catch (error) {
    console.error('Error fetching course:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
