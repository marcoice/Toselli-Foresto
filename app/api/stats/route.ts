import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const [listingsRes, coursesRes, usersRes, badgesRes] = await Promise.all([
      db.execute('SELECT COUNT(*) as count FROM listings WHERE is_active = 1').catch(() => ({ rows: [{ count: 0 }] })),
      db.execute('SELECT COUNT(*) as count FROM courses'),
      db.execute('SELECT COUNT(*) as count FROM auth_users').catch(() => db.execute('SELECT COUNT(*) as count FROM users')),
      db.execute('SELECT COUNT(*) as count FROM user_badges'),
    ]);

    return NextResponse.json({
      jobs: listingsRes.rows[0].count,
      courses: coursesRes.rows[0].count,
      users: usersRes.rows[0].count,
      badges_awarded: badgesRes.rows[0].count,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
