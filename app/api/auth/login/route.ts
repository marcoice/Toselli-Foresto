import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import db from '@/lib/db';
import { createSession, setSessionCookie } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email e password sono obbligatori' }, { status: 400 });
    }

    const result = await db.execute({
      sql: 'SELECT * FROM auth_users WHERE email = ?',
      args: [email],
    });

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Credenziali non valide' }, { status: 401 });
    }

    const row = result.rows[0];
    const valid = await bcrypt.compare(password, row.password_hash as string);
    if (!valid) {
      return NextResponse.json({ error: 'Credenziali non valide' }, { status: 401 });
    }

    const token = await createSession(row.id as number);
    await setSessionCookie(token);

    return NextResponse.json({
      user: {
        id: row.id,
        email: row.email,
        role: row.role,
        display_name: row.display_name,
        username: row.username,
        avatar_color: row.avatar_color,
        city: row.city,
        region: row.region,
        lat: row.lat,
        lng: row.lng,
        company_name: row.company_name,
      },
      token,
    });
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}
