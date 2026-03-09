import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const type = searchParams.get('type'); // job_offer | service_proposal | null (both)

    let sql = `SELECT l.id, l.lat, l.lng, l.listing_type, l.title, l.city, l.category,
               au.display_name as author_name, au.role as author_role
               FROM listings l JOIN auth_users au ON l.author_id = au.id
               WHERE l.is_active = 1 AND l.lat IS NOT NULL AND l.lng IS NOT NULL`;
    const args: string[] = [];

    if (type) {
      sql += ' AND l.listing_type = ?';
      args.push(type);
    }

    sql += ' ORDER BY l.created_at DESC';

    const result = await db.execute({ sql, args });
    return NextResponse.json(result.rows);
  } catch (err) {
    console.error('Map points error:', err);
    return NextResponse.json([], { status: 500 });
  }
}
