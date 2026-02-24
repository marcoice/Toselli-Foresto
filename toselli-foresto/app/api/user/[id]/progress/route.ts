import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await db.execute({
      sql: `SELECT up.*, c.title as course_title, c.badge_name, c.badge_color, c.level as course_level
            FROM user_progress up
            JOIN courses c ON up.course_id = c.id
            WHERE up.user_id = ?`,
      args: [Number(id)],
    });

    const progress = result.rows.map((row) => ({
      ...row,
      completed_modules:
        typeof row.completed_modules === 'string'
          ? JSON.parse(row.completed_modules)
          : row.completed_modules,
    }));

    return NextResponse.json(progress);
  } catch (error) {
    console.error('Error fetching progress:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const input = await request.json();

    if (input.course_id === undefined || input.module_index === undefined) {
      return NextResponse.json({ error: 'Missing course_id or module_index' }, { status: 400 });
    }

    const userId = Number(id);
    const courseId = Number(input.course_id);
    const moduleIndex = Number(input.module_index);

    const existing = await db.execute({
      sql: 'SELECT * FROM user_progress WHERE user_id = ? AND course_id = ?',
      args: [userId, courseId],
    });

    if (existing.rows.length > 0) {
      const row = existing.rows[0];
      const modules: number[] =
        typeof row.completed_modules === 'string'
          ? JSON.parse(row.completed_modules)
          : Array.isArray(row.completed_modules) ? row.completed_modules : [];

      if (!modules.includes(moduleIndex)) {
        modules.push(moduleIndex);
      }

      await db.execute({
        sql: 'UPDATE user_progress SET completed_modules = ? WHERE user_id = ? AND course_id = ?',
        args: [JSON.stringify(modules), userId, courseId],
      });
    } else {
      await db.execute({
        sql: 'INSERT INTO user_progress (user_id, course_id, completed_modules, quiz_score, quiz_completed) VALUES (?, ?, ?, 0, 0)',
        args: [userId, courseId, JSON.stringify([moduleIndex])],
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating progress:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
