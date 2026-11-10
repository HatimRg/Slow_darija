import bcrypt from 'bcryptjs';
import { loginSchema, registerSchema } from '../lib/validations/auth';
import { PLANS } from '../lib/payments/types';

const BASE_PATH = '/darija_learning';
const SESSION_COOKIE = 'slow_darija_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

interface Env {
  DB: D1Database;
}

interface UserRecord {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  preferred_locale: string;
  role: 'student' | 'teacher' | 'admin';
  is_active: number;
  created_at: string;
}

type PublicUser = Pick<UserRecord, 'id' | 'email' | 'full_name' | 'preferred_locale' | 'role'>;

const json = (body: unknown, status = 200, headers: HeadersInit = {}) => new Response(
  JSON.stringify(body),
  {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...headers,
    },
  },
);

const failure = (message: string, status: number) => json({ error: message }, status);

const all = async <T>(db: D1Database, sql: string, ...values: unknown[]): Promise<T[]> => {
  const result = await db.prepare(sql).bind(...values).all<T>();
  return result.results;
};

const first = async <T>(db: D1Database, sql: string, ...values: unknown[]): Promise<T | null> => (
  db.prepare(sql).bind(...values).first<T>()
);

const digest = async (value: string): Promise<string> => {
  const bytes = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(hash), (byte) => byte.toString(16).padStart(2, '0')).join('');
};

const randomToken = (): string => Array.from(
  crypto.getRandomValues(new Uint8Array(32)),
  (byte) => byte.toString(16).padStart(2, '0'),
).join('');

const parseBody = async (request: Request): Promise<Record<string, unknown> | null> => {
  try {
    const body: unknown = await request.json();
    return body && typeof body === 'object' && !Array.isArray(body)
      ? body as Record<string, unknown>
      : null;
  } catch {
    return null;
  }
};

const sessionCookie = (token: string, maxAge = SESSION_TTL_SECONDS) => (
  `${SESSION_COOKIE}=${token}; Path=${BASE_PATH}; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`
);

const getCookie = (request: Request, name: string): string | null => {
  const cookies = request.headers.get('Cookie');
  if (!cookies) return null;

  const prefix = `${name}=`;
  const value = cookies.split(';').map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(prefix));
  return value ? value.slice(prefix.length) : null;
};

const createSession = async (db: D1Database, userId: string): Promise<string> => {
  const token = randomToken();
  const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000)
    .toISOString()
    .replace('T', ' ')
    .replace('Z', '');

  await db.prepare(
    'INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)',
  ).bind(await digest(token), userId, expiresAt).run();

  return token;
};

const authenticate = async (request: Request, db: D1Database): Promise<UserRecord | null> => {
  const token = getCookie(request, SESSION_COOKIE);
  if (!token || !/^[a-f0-9]{64}$/i.test(token)) return null;

  return first<UserRecord>(db, `
    SELECT p.id, p.email, p.password_hash, p.full_name, p.preferred_locale,
           p.role, p.is_active, p.created_at
    FROM sessions s
    JOIN profiles p ON p.id = s.user_id
    WHERE s.token_hash = ? AND datetime(s.expires_at) > CURRENT_TIMESTAMP
      AND p.is_active = 1
  `, await digest(token));
};

const publicUser = (user: UserRecord): PublicUser => ({
  id: user.id,
  email: user.email,
  full_name: user.full_name,
  preferred_locale: user.preferred_locale,
  role: user.role,
});

const requireRole = (user: UserRecord, roles: UserRecord['role'][]): Response | null => (
  roles.includes(user.role) ? null : failure('Access denied.', 403)
);

const handleLogout = async (request: Request, env: Env): Promise<Response> => {
  const token = getCookie(request, SESSION_COOKIE);
  if (token && /^[a-f0-9]{64}$/i.test(token)) {
    await env.DB.prepare('DELETE FROM sessions WHERE token_hash = ?')
      .bind(await digest(token))
      .run();
  }

  return json({ success: true }, 200, {
    'Set-Cookie': sessionCookie('', 0),
  });
};

const handleLogin = async (request: Request, env: Env): Promise<Response> => {
  const body = await parseBody(request);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) return failure(parsed.error.issues[0]?.message || 'Invalid login details.', 400);

  const user = await first<UserRecord>(
    env.DB,
    `SELECT id, email, password_hash, full_name, preferred_locale, role, is_active, created_at
     FROM profiles WHERE email = ?`,
    parsed.data.email,
  );

  if (!user || !user.is_active || !(await bcrypt.compare(parsed.data.password, user.password_hash))) {
    return failure('Invalid email or password.', 401);
  }

  const token = await createSession(env.DB, user.id);
  return json({ success: true, user: publicUser(user) }, 200, {
    'Set-Cookie': sessionCookie(token),
  });
};

const handleRegister = async (request: Request, env: Env): Promise<Response> => {
  const body = await parseBody(request);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) return failure(parsed.error.issues[0]?.message || 'Invalid registration details.', 400);

  const existing = await first<{ id: string }>(
    env.DB,
    'SELECT id FROM profiles WHERE email = ?',
    parsed.data.email,
  );
  if (existing) return failure('An account with this email already exists.', 409);

  const user: UserRecord = {
    id: crypto.randomUUID(),
    email: parsed.data.email,
    password_hash: await bcrypt.hash(parsed.data.password, 10),
    full_name: parsed.data.full_name,
    preferred_locale: parsed.data.preferred_locale,
    role: 'student',
    is_active: 1,
    created_at: new Date().toISOString(),
  };
  const entitlementId = crypto.randomUUID();
  const resetAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const statements = [
    env.DB.prepare(`
      INSERT INTO profiles (id, email, password_hash, full_name, preferred_locale, role)
      VALUES (?, ?, ?, ?, ?, 'student')
    `).bind(user.id, user.email, user.password_hash, user.full_name, user.preferred_locale),
    env.DB.prepare(`
      INSERT INTO user_entitlements (id, user_id, remaining_lesson_credits, credits_reset_at)
      VALUES (?, ?, 1, ?)
    `).bind(entitlementId, user.id, resetAt),
  ];

  try {
    await env.DB.batch(statements);
  } catch (error) {
    console.error('Preview registration failed:', error);
    const duplicate = await first<{ id: string }>(
      env.DB,
      'SELECT id FROM profiles WHERE email = ?',
      user.email,
    );
    if (duplicate) return failure('An account with this email already exists.', 409);
    return failure('Registration could not be completed.', 500);
  }

  const token = await createSession(env.DB, user.id);
  return json({
    success: true,
    user: publicUser(user),
  }, 200, {
    'Set-Cookie': sessionCookie(token),
  });
};

const handleProfile = async (
  request: Request,
  env: Env,
  user: UserRecord,
): Promise<Response> => {
  if (request.method === 'GET') {
    const [subscription] = await all<Record<string, unknown>>(env.DB, `
      SELECT s.id, s.plan_id, s.status, s.billing_interval, s.started_at, s.current_period_end,
             p.name AS plan_name, p.monthly_price, p.annual_price,
             p.lesson_credits_per_month
      FROM subscriptions s
      LEFT JOIN plans p ON p.id = s.plan_id
      WHERE s.user_id = ?
      ORDER BY s.created_at DESC LIMIT 1
    `, user.id);
    const entitlement = await first<{ remaining_lesson_credits: number }>(
      env.DB,
      'SELECT remaining_lesson_credits FROM user_entitlements WHERE user_id = ?',
      user.id,
    );

    const currentSubscription = subscription || {
      plan_id: 'plus',
      plan_name: 'Plus',
      status: 'active',
      billing_interval: 'monthly',
      monthly_price: 39,
      annual_price: 35.1,
      lesson_credits_per_month: 4,
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };

    return json({
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        preferred_locale: user.preferred_locale,
        role: user.role,
        created_at: user.created_at,
      },
      subscription: currentSubscription,
      remainingCredits: entitlement?.remaining_lesson_credits
        ?? Number(currentSubscription.lesson_credits_per_month),
      availablePlans: PLANS,
    });
  }

  if (request.method !== 'PUT') return failure('Method not allowed.', 405);

  const body = await parseBody(request);
  if (!body) return failure('Invalid request body.', 400);
  const fullName = typeof body.full_name === 'string' ? body.full_name : null;
  const email = typeof body.email === 'string' ? body.email : null;
  const locale = typeof body.preferred_locale === 'string' ? body.preferred_locale : null;
  const allowedLocales = ['en', 'fr', 'ar', 'de', 'tr'];
  if (locale && !allowedLocales.includes(locale)) return failure('Invalid preferred locale.', 400);

  if (email && email.toLowerCase() !== user.email.toLowerCase()) {
    const duplicate = await first<{ id: string }>(
      env.DB,
      'SELECT id FROM profiles WHERE email = ? AND id != ?',
      email,
      user.id,
    );
    if (duplicate) return failure('An account with this email already exists.', 409);
  }

  const statements = [];
  if (fullName || email || locale) {
    statements.push(env.DB.prepare(`
      UPDATE profiles
      SET full_name = COALESCE(?, full_name),
          email = COALESCE(?, email),
          preferred_locale = COALESCE(?, preferred_locale),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(fullName, email, locale, user.id));
  }

  const planId = typeof body.newPlanId === 'string' ? body.newPlanId : null;
  const plan = planId ? PLANS[planId] : null;
  if (planId && plan) {
    const interval = body.billing_interval === 'annually' ? 'annually' : 'monthly';
    const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    statements.push(
      env.DB.prepare(`
        INSERT INTO subscriptions (
          id, user_id, plan_id, status, billing_interval, provider, current_period_end
        ) VALUES (?, ?, ?, 'active', ?, 'mock', ?)
        ON CONFLICT(user_id) DO UPDATE SET
          plan_id = excluded.plan_id,
          status = 'active',
          billing_interval = excluded.billing_interval,
          current_period_end = excluded.current_period_end
      `).bind(crypto.randomUUID(), user.id, planId, interval, periodEnd),
      env.DB.prepare(`
        INSERT INTO user_entitlements (id, user_id, remaining_lesson_credits, credits_reset_at)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(user_id) DO UPDATE SET
          remaining_lesson_credits = excluded.remaining_lesson_credits,
          credits_reset_at = excluded.credits_reset_at
      `).bind(crypto.randomUUID(), user.id, plan.creditsPerMonth, periodEnd),
    );
  }

  if (statements.length) await env.DB.batch(statements);
  return json({ success: true, message: 'Settings and profile updated successfully!' });
};

const handleBookings = async (
  request: Request,
  env: Env,
  user: UserRecord,
): Promise<Response> => {
  if (request.method === 'GET') {
    const [entitlement] = await all<{ remaining_lesson_credits: number }>(
      env.DB,
      'SELECT remaining_lesson_credits FROM user_entitlements WHERE user_id = ?',
      user.id,
    );
    const slots = await all<Record<string, unknown>>(env.DB, `
      SELECT ls.id, ls.starts_at, ls.ends_at, ls.capacity, ls.booked_count, ls.status,
             ls.teams_join_url, p.full_name AS teacher_name
      FROM lesson_slots ls
      JOIN profiles p ON p.id = ls.teacher_id
      WHERE ls.status != 'canceled'
      ORDER BY ls.starts_at ASC
    `);
    const bookings = await all<{ lesson_slot_id: string }>(
      env.DB,
      `SELECT lesson_slot_id FROM bookings WHERE user_id = ? AND status = 'confirmed'`,
      user.id,
    );
    const bookedSlotIds = new Set(bookings.map((booking) => booking.lesson_slot_id));
    const formattedSlots = slots.map((slot) => {
      const isUserBooking = bookedSlotIds.has(String(slot.id));
      const isFull = Number(slot.booked_count) >= Number(slot.capacity);
      const isPast = new Date(String(slot.ends_at)).getTime() < Date.now();
      const state = isUserBooking
        ? 'YOUR_BOOKING'
        : isPast
          ? 'PAST'
          : isFull
            ? 'FULLY_BOOKED'
            : 'AVAILABLE';

      return {
        id: slot.id,
        startsAt: slot.starts_at,
        endsAt: slot.ends_at,
        teacherName: slot.teacher_name,
        state,
        teamsJoinUrl: isUserBooking ? slot.teams_join_url : undefined,
      };
    });

    return json({
      remainingCredits: entitlement?.remaining_lesson_credits ?? 0,
      slots: formattedSlots,
    });
  }

  if (request.method !== 'POST') return failure('Method not allowed.', 405);
  const body = await parseBody(request);
  const slotId = typeof body?.slotId === 'string' ? body.slotId : '';
  if (!slotId) return failure('Slot ID is required.', 400);

  const slot = await first<{ id: string; teams_join_url: string | null }>(
    env.DB,
    'SELECT id, teams_join_url FROM lesson_slots WHERE id = ?',
    slotId,
  );
  if (!slot) return failure('Lesson slot not found.', 404);

  const bookingId = crypto.randomUUID();
  const results = await env.DB.batch([
    env.DB.prepare(`
      UPDATE lesson_slots
      SET booked_count = booked_count + 1,
          status = CASE WHEN booked_count + 1 >= capacity THEN 'booked' ELSE 'available' END
      WHERE id = ? AND status = 'available' AND booked_count < capacity
        AND EXISTS (
          SELECT 1 FROM user_entitlements
          WHERE user_id = ? AND remaining_lesson_credits > 0
        )
    `).bind(slotId, user.id),
    env.DB.prepare(`
      UPDATE user_entitlements
      SET remaining_lesson_credits = remaining_lesson_credits - 1,
          updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ? AND remaining_lesson_credits > 0 AND changes() = 1
    `).bind(user.id),
    env.DB.prepare(`
      INSERT INTO bookings (id, user_id, lesson_slot_id, status)
      SELECT ?, ?, ?, 'confirmed' WHERE changes() = 1
    `).bind(bookingId, user.id, slotId),
  ]);

  if (results[2].meta.changes !== 1) {
    const entitlement = await first<{ remaining_lesson_credits: number }>(
      env.DB,
      'SELECT remaining_lesson_credits FROM user_entitlements WHERE user_id = ?',
      user.id,
    );
    if (!entitlement || entitlement.remaining_lesson_credits <= 0) {
      return failure('Insufficient lesson credits. Please upgrade your plan.', 400);
    }
    return failure('This lesson slot is fully booked or no longer available.', 409);
  }

  const entitlement = await first<{ remaining_lesson_credits: number }>(
    env.DB,
    'SELECT remaining_lesson_credits FROM user_entitlements WHERE user_id = ?',
    user.id,
  );

  return json({
    success: true,
    bookingId,
    slotId,
    teamsJoinUrl: slot.teams_join_url,
    remainingCredits: entitlement?.remaining_lesson_credits ?? 0,
  });
};

const handleCancellation = async (
  request: Request,
  env: Env,
  user: UserRecord,
  bookingOrSlotId: string,
): Promise<Response> => {
  if (request.method !== 'POST') return failure('Method not allowed.', 405);
  const booking = await first<{
    id: string;
    user_id: string;
    lesson_slot_id: string;
    starts_at: string;
    booked_count: number;
  }>(env.DB, `
    SELECT b.id, b.user_id, b.lesson_slot_id, ls.starts_at, ls.booked_count
    FROM bookings b
    JOIN lesson_slots ls ON ls.id = b.lesson_slot_id
    WHERE (b.id = ? OR b.lesson_slot_id = ?) AND b.status = 'confirmed'
      AND (? = 1 OR b.user_id = ?)
    LIMIT 1
  `, bookingOrSlotId, bookingOrSlotId, user.role === 'admin' || user.role === 'teacher' ? 1 : 0, user.id);

  if (!booking) return failure('Active booking not found.', 404);

  const hoursUntilLesson = (new Date(booking.starts_at).getTime() - Date.now()) / 3_600_000;
  const body = await parseBody(request);
  const canOverride = user.role === 'admin' && body?.isAdminOverride === true;
  const refunded = canOverride || user.role === 'admin' || user.role === 'teacher' || hoursUntilLesson >= 72;

  const statements = [
    env.DB.prepare(`
      UPDATE bookings SET status = 'canceled'
      WHERE id = ? AND status = 'confirmed'
        AND (? = 1 OR user_id = ?)
    `).bind(booking.id, user.role === 'admin' || user.role === 'teacher' ? 1 : 0, user.id),
    env.DB.prepare(`
      UPDATE lesson_slots
      SET booked_count = MAX(0, booked_count - 1), status = 'available'
      WHERE id = ? AND changes() = 1
    `).bind(booking.lesson_slot_id),
  ];

  if (refunded) {
    statements.push(env.DB.prepare(`
      UPDATE user_entitlements
      SET remaining_lesson_credits = remaining_lesson_credits + 1,
          updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ? AND changes() = 1
    `).bind(booking.user_id));
  }

  const results = await env.DB.batch(statements);
  if (results[0].meta.changes !== 1) return failure('Active booking not found.', 404);

  const entitlement = await first<{ remaining_lesson_credits: number }>(
    env.DB,
    'SELECT remaining_lesson_credits FROM user_entitlements WHERE user_id = ?',
    booking.user_id,
  );

  return json({
    success: true,
    bookingId: booking.id,
    refunded,
    hoursUntilLesson: Math.round(hoursUntilLesson * 10) / 10,
    remainingCredits: entitlement?.remaining_lesson_credits ?? 0,
    message: refunded
      ? user.role === 'admin' || user.role === 'teacher'
        ? 'Lesson canceled with a full credit refund.'
        : 'Lesson canceled with full 1-credit refund (more than 72 hours notice).'
      : 'Lesson canceled. Per the 72-hour cancellation policy, this credit could not be refunded.',
  });
};

const handlePayment = async (request: Request, env: Env, user: UserRecord): Promise<Response> => {
  if (request.method !== 'POST') return failure('Method not allowed.', 405);
  const body = await parseBody(request);
  const planId = typeof body?.planId === 'string' ? body.planId : '';
  const plan = PLANS[planId];
  if (!plan) return failure('Invalid plan selected.', 400);

  const interval = body?.interval === 'annually' ? 'annually' : 'monthly';
  const now = new Date();
  const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const subscriptionId = crypto.randomUUID();
  const entitlementId = crypto.randomUUID();
  const transactionId = crypto.randomUUID();
  const amount = interval === 'annually' ? plan.annualMonthlyPrice * 12 : plan.monthlyPrice;

  await env.DB.batch([
    env.DB.prepare(`
      INSERT INTO subscriptions (
        id, user_id, plan_id, status, billing_interval, provider, current_period_end
      ) VALUES (?, ?, ?, 'active', ?, 'mock', ?)
      ON CONFLICT(user_id) DO UPDATE SET
        plan_id = excluded.plan_id,
        status = 'active',
        billing_interval = excluded.billing_interval,
        current_period_end = excluded.current_period_end
    `).bind(subscriptionId, user.id, planId, interval, periodEnd),
    env.DB.prepare(`
      INSERT INTO user_entitlements (id, user_id, remaining_lesson_credits, credits_reset_at)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET
        remaining_lesson_credits = excluded.remaining_lesson_credits,
        credits_reset_at = excluded.credits_reset_at
    `).bind(entitlementId, user.id, plan.creditsPerMonth, periodEnd),
    env.DB.prepare(`
      INSERT INTO payment_transactions (
        id, user_id, plan_id, provider, provider_transaction_id,
        amount, currency, billing_interval, status
      ) VALUES (?, ?, ?, 'mock', ?, ?, ?, ?, 'completed')
    `).bind(transactionId, user.id, planId, transactionId, amount, plan.currency, interval),
  ]);

  const url = new URL(request.url);
  const requestedLocale = typeof body?.locale === 'string' ? body.locale : user.preferred_locale;
  const locale = ['en', 'fr', 'ar', 'de', 'tr'].includes(requestedLocale)
    ? requestedLocale
    : user.preferred_locale;
  const checkoutUrl = new URL(`${BASE_PATH}/${locale}/checkout/success`, url.origin);
  const sessionId = `mock_sess_${crypto.randomUUID()}`;
  checkoutUrl.searchParams.set('session_id', sessionId);
  checkoutUrl.searchParams.set('plan_id', planId);
  checkoutUrl.searchParams.set('interval', interval);
  checkoutUrl.searchParams.set('mock_success', 'true');

  return json({
    sessionId,
    checkoutUrl: checkoutUrl.toString(),
    mode: 'mock',
    assignedCredits: plan.creditsPerMonth,
  });
};

const handleAdminOverview = async (env: Env): Promise<Response> => {
  const [students] = await all<{ total: number }>(
    env.DB,
    "SELECT COUNT(*) AS total FROM profiles WHERE role = 'student'",
  );
  const [lessons] = await all<{ total: number }>(
    env.DB,
    "SELECT COUNT(*) AS total FROM lesson_slots WHERE starts_at >= CURRENT_TIMESTAMP AND status = 'available'",
  );
  const [bookings] = await all<{ total: number }>(
    env.DB,
    "SELECT COUNT(*) AS total FROM bookings WHERE status = 'confirmed'",
  );
  const [revenue] = await all<{ total: number }>(
    env.DB,
    "SELECT COALESCE(SUM(amount), 0) AS total FROM payment_transactions WHERE status = 'completed'",
  );
  const recent = await all<Record<string, unknown>>(env.DB, `
    SELECT b.id, b.status, b.created_at,
           student.full_name AS student_name, student.email AS student_email,
           teacher.full_name AS teacher_name, ls.starts_at, ls.ends_at,
           ls.teams_join_url, pl.name AS plan_name
    FROM bookings b
    JOIN profiles student ON student.id = b.user_id
    JOIN lesson_slots ls ON ls.id = b.lesson_slot_id
    JOIN profiles teacher ON teacher.id = ls.teacher_id
    LEFT JOIN subscriptions s ON s.user_id = student.id AND s.status = 'active'
    LEFT JOIN plans pl ON pl.id = s.plan_id
    ORDER BY b.created_at DESC LIMIT 10
  `);

  return json({
    kpis: {
      activeSubscribers: students?.total ?? 0,
      upcomingLessons: lessons?.total ?? 0,
      totalBookings: bookings?.total ?? 0,
      monthlyRevenue: `€${Number(revenue?.total ?? 0).toFixed(2)}`,
    },
    recentBookings: recent.map((booking) => ({
      id: booking.id,
      student: booking.student_name || booking.student_email,
      teacher: booking.teacher_name,
      date: new Date(String(booking.starts_at)).toLocaleString([], {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
      plan: booking.plan_name ? `${booking.plan_name} Plan` : 'No plan',
      status: booking.status === 'confirmed' ? 'Confirmed' : booking.status,
      teamsUrl: booking.teams_join_url,
    })),
  });
};

const handleAdminStudents = async (request: Request, env: Env): Promise<Response> => {
  if (request.method === 'GET') {
    const students = await all<Record<string, unknown>>(env.DB, `
      SELECT p.id, p.full_name AS name, p.email, p.created_at,
             COALESCE(ue.remaining_lesson_credits, 0) AS credits,
             COALESCE(pl.name, 'Plus') AS plan_name,
             COALESCE(s.billing_interval, 'monthly') AS billing_interval
      FROM profiles p
      LEFT JOIN user_entitlements ue ON p.id = ue.user_id
      LEFT JOIN subscriptions s ON p.id = s.user_id AND s.status = 'active'
      LEFT JOIN plans pl ON s.plan_id = pl.id
      WHERE p.role = 'student'
      ORDER BY p.created_at DESC
    `);

    return json({
      students: students.map((student) => ({
        id: student.id,
        name: student.name || 'Student',
        email: student.email,
        plan: `${student.plan_name} (${student.billing_interval})`,
        credits: student.credits,
        joinedDate: new Date(String(student.created_at)).toISOString().split('T')[0],
      })),
    });
  }

  if (request.method !== 'POST') return failure('Method not allowed.', 405);
  const body = await parseBody(request);
  const studentId = typeof body?.studentId === 'string' ? body.studentId : '';
  const delta = body?.delta;
  if (!studentId || typeof delta !== 'number' || !Number.isInteger(delta)) {
    return failure('studentId and an integer delta are required.', 400);
  }

  const profile = await first<{ id: string }>(
    env.DB,
    "SELECT id FROM profiles WHERE id = ? AND role = 'student'",
    studentId,
  );
  if (!profile) return failure('Student not found.', 404);

  await env.DB.prepare(`
    INSERT INTO user_entitlements (id, user_id, remaining_lesson_credits, credits_reset_at)
    VALUES (?, ?, MAX(0, ?), datetime('now', '+30 days'))
    ON CONFLICT(user_id) DO UPDATE SET
      remaining_lesson_credits = MAX(0, user_entitlements.remaining_lesson_credits + ?),
      updated_at = CURRENT_TIMESTAMP
  `).bind(crypto.randomUUID(), studentId, delta, delta).run();

  const entitlement = await first<{ remaining_lesson_credits: number }>(
    env.DB,
    'SELECT remaining_lesson_credits FROM user_entitlements WHERE user_id = ?',
    studentId,
  );
  return json({ success: true, credits: entitlement?.remaining_lesson_credits ?? 0 });
};

const handleAdminBookings = async (env: Env): Promise<Response> => {
  const bookings = await all<Record<string, unknown>>(env.DB, `
    SELECT b.id, b.status, b.created_at,
           student.full_name AS student_name, student.email AS student_email,
           teacher.full_name AS teacher_name, ls.starts_at, ls.ends_at,
           ls.teams_join_url
    FROM bookings b
    JOIN profiles student ON student.id = b.user_id
    JOIN lesson_slots ls ON ls.id = b.lesson_slot_id
    JOIN profiles teacher ON teacher.id = ls.teacher_id
    ORDER BY ls.starts_at DESC
  `);

  return json({
    bookings: bookings.map((booking) => ({
      id: booking.id,
      student: booking.student_name || booking.student_email,
      teacher: booking.teacher_name || 'Teacher',
      time: `${new Date(String(booking.starts_at)).toLocaleString([], {
        dateStyle: 'medium',
        timeStyle: 'short',
      })} – ${new Date(String(booking.ends_at)).toLocaleTimeString([], {
        timeStyle: 'short',
      })}`,
      teamsUrl: booking.teams_join_url,
      status: booking.status === 'confirmed' ? 'Confirmed' : booking.status,
    })),
  });
};

const handleAdminCalendar = async (
  request: Request,
  env: Env,
): Promise<Response> => {
  if (request.method === 'GET') {
    const [slots, teachers] = await Promise.all([
      all<Record<string, unknown>>(env.DB, `
        SELECT ls.id, ls.teacher_id, ls.starts_at, ls.ends_at, ls.capacity,
               ls.booked_count, ls.status, ls.teams_join_url,
               p.full_name AS teacher_name
        FROM lesson_slots ls
        JOIN profiles p ON p.id = ls.teacher_id
        ORDER BY ls.starts_at ASC
      `),
      all<Record<string, unknown>>(
        env.DB,
        "SELECT id, full_name, email FROM profiles WHERE role IN ('teacher', 'admin')",
      ),
    ]);

    return json({ slots, teachers });
  }

  if (request.method !== 'POST') return failure('Method not allowed.', 405);
  const body = await parseBody(request);
  const teacherId = typeof body?.teacherId === 'string' ? body.teacherId : '';
  const startsAt = typeof body?.startsAt === 'string' ? body.startsAt : '';
  const endsAt = typeof body?.endsAt === 'string' ? body.endsAt : '';
  const capacity = body?.capacity === undefined ? 1 : body.capacity;
  if (
    !teacherId
    || !startsAt
    || !endsAt
    || !Number.isInteger(capacity)
    || Number(capacity) < 1
    || !Number.isFinite(Date.parse(startsAt))
    || !Number.isFinite(Date.parse(endsAt))
    || Date.parse(endsAt) <= Date.parse(startsAt)
  ) {
    return failure('Valid teacherId, startsAt, endsAt, and capacity are required.', 400);
  }

  const teacher = await first<{ id: string }>(
    env.DB,
    "SELECT id FROM profiles WHERE id = ? AND role IN ('teacher', 'admin')",
    teacherId,
  );
  if (!teacher) return failure('Teacher not found.', 404);

  const slotId = crypto.randomUUID();
  const meetingId = `teams_m_${slotId}`;
  const teamsUrl = `https://teams.microsoft.com/l/meetup-join/slow-darija-${slotId}`;
  await env.DB.prepare(`
    INSERT INTO lesson_slots (
      id, teacher_id, starts_at, ends_at, capacity, booked_count,
      status, teams_meeting_id, teams_join_url
    ) VALUES (?, ?, ?, ?, ?, 0, 'available', ?, ?)
  `).bind(slotId, teacherId, startsAt, endsAt, Number(capacity), meetingId, teamsUrl).run();

  return json({ success: true, slotId });
};

const apiPath = (pathname: string): string | null => {
  const prefixedPath = pathname === BASE_PATH
    ? '/'
    : pathname.startsWith(`${BASE_PATH}/`)
      ? pathname.slice(BASE_PATH.length)
      : pathname;

  return prefixedPath.startsWith('/api/') ? prefixedPath : null;
};

export const handleApiRequest = async (request: Request, env: Env): Promise<Response | null> => {
  const path = apiPath(new URL(request.url).pathname);
  if (!path) return null;

  try {
    if (path === '/api/auth/login' && request.method === 'POST') {
      return await handleLogin(request, env);
    }
    if (path === '/api/auth/register' && request.method === 'POST') {
      return await handleRegister(request, env);
    }
    if (path === '/api/auth/logout' && request.method === 'POST') {
      return await handleLogout(request, env);
    }

    const user = await authenticate(request, env.DB);
    if (!user) return failure('Unauthenticated.', 401);

    if (path === '/api/user/profile') return handleProfile(request, env, user);
    if (path === '/api/bookings') return handleBookings(request, env, user);
    const cancellationMatch = path.match(/^\/api\/bookings\/([^/]+)\/cancel$/);
    if (cancellationMatch) {
      return handleCancellation(request, env, user, decodeURIComponent(cancellationMatch[1]));
    }
    if (path === '/api/payments/create') return handlePayment(request, env, user);

    if (path === '/api/admin/calendar') {
      const denied = requireRole(user, ['admin', 'teacher']);
      return denied || handleAdminCalendar(request, env);
    }
    if (path.startsWith('/api/admin/')) {
      const denied = requireRole(user, ['admin']);
      if (denied) return denied;
      if (path === '/api/admin/overview' && request.method === 'GET') return handleAdminOverview(env);
      if (path === '/api/admin/students') return handleAdminStudents(request, env);
      if (path === '/api/admin/bookings' && request.method === 'GET') return handleAdminBookings(env);
    }

    return failure('Not found.', 404);
  } catch (error) {
    console.error('Slow Darija preview API request failed:', error);
    return failure('An internal error occurred.', 500);
  }
};
