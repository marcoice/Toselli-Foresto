import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const type = searchParams.get('type');
    const region = searchParams.get('region');

    let sql = `SELECT l.id, l.lat, l.lng, l.listing_type, l.title, l.city, l.region, l.category,
               l.description, l.level, l.work_type, l.salary_min, l.salary_max,
               au.display_name as author_name, au.role as author_role, au.avatar_color as author_avatar_color
               FROM listings l JOIN auth_users au ON l.author_id = au.id
               WHERE l.is_active = 1`;
    const args: string[] = [];

    if (type) {
      sql += ' AND l.listing_type = ?';
      args.push(type);
    }
    if (region) {
      sql += ' AND l.region = ?';
      args.push(region);
    }

    sql += ' ORDER BY l.created_at DESC';

    const result = await db.execute({ sql, args });
    return NextResponse.json(result.rows);
  } catch (err) {
    console.error('Map points error:', err);
    return NextResponse.json([], { status: 500 });
  }
}
