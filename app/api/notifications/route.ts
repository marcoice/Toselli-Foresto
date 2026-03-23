import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id') || '1';

    const result = await db.execute({
      sql: `SELECT n.*, au.username as actor_username, au.display_name as actor_name
            FROM notifications n
            LEFT JOIN auth_users au ON n.actor_id = au.id
            WHERE n.user_id = ?
            ORDER BY n.created_at DESC
            LIMIT 50`,
      args: [Number(userId)],
    });

    const unreadCount = await db.execute({
      sql: 'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0',
      args: [Number(userId)],
    });

    return NextResponse.json({
      notifications: result.rows,
      unread_count: Number(unreadCount.rows[0].count),
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ notifications: [], unread_count: 0 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const input = await request.json();
    const userId = input.user_id || 1;

    if (input.notification_id) {
      await db.execute({
        sql: 'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?',
        args: [Number(input.notification_id), Number(userId)],
      });
    } else {
      // Mark all as read
      await db.execute({
        sql: 'UPDATE notifications SET is_read = 1 WHERE user_id = ?',
        args: [Number(userId)],
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 });
  }
}
