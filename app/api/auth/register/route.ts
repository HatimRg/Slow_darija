import { NextResponse } from 'next/server';
import { query, withTransaction } from '@/lib/db/mysql';
import bcrypt from 'bcryptjs';
import { registerSchema } from '@/lib/validations/auth';
import { RowDataPacket } from 'mysql2';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = registerSchema.parse(body);

    // Check if email already exists
    const existing = await query<RowDataPacket[]>(
      'SELECT id FROM profiles WHERE email = ?',
      [validated.email]
    );

    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(validated.password, salt);

    await withTransaction(async (conn) => {
      // 1. Insert Profile
      await conn.query(
        `INSERT INTO profiles (id, email, password_hash, full_name, preferred_locale, role)
         VALUES (?, ?, ?, ?, ?, 'student')`,
        [userId, validated.email, passwordHash, validated.full_name, validated.preferred_locale]
      );

      // 2. Grant Initial Trial Entitlements (e.g. 1 introductory lesson credit)
      const entitlementId = `ent_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      await conn.query(
        `INSERT INTO user_entitlements (id, user_id, remaining_lesson_credits, credits_reset_at)
         VALUES (?, ?, 1, DATE_ADD(NOW(), INTERVAL 30 DAY))`,
        [entitlementId, userId]
      );
    });

    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        email: validated.email,
        full_name: validated.full_name,
        role: 'student',
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: error.errors?.[0]?.message || error.message || 'Registration failed' },
      { status: 400 }
    );
  }
}