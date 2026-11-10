CREATE TABLE profiles (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  preferred_locale TEXT NOT NULL DEFAULT 'en'
    CHECK (preferred_locale IN ('en', 'fr', 'ar', 'de', 'tr')),
  role TEXT NOT NULL DEFAULT 'student'
    CHECK (role IN ('student', 'teacher', 'admin')),
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  monthly_price REAL NOT NULL,
  annual_price REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  lesson_credits_per_month INTEGER NOT NULL,
  features TEXT NOT NULL DEFAULT '[]',
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL REFERENCES plans(id),
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'past_due', 'canceled', 'trialing', 'incomplete')),
  billing_interval TEXT NOT NULL DEFAULT 'monthly'
    CHECK (billing_interval IN ('monthly', 'annually')),
  provider TEXT NOT NULL,
  provider_customer_id TEXT,
  provider_subscription_id TEXT,
  started_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  current_period_end TEXT NOT NULL,
  canceled_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_entitlements (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  remaining_lesson_credits INTEGER NOT NULL DEFAULT 0
    CHECK (remaining_lesson_credits >= 0),
  credits_reset_at TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE lesson_slots (
  id TEXT PRIMARY KEY,
  teacher_id TEXT NOT NULL REFERENCES profiles(id),
  starts_at TEXT NOT NULL,
  ends_at TEXT NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 1 CHECK (capacity > 0),
  booked_count INTEGER NOT NULL DEFAULT 0
    CHECK (booked_count >= 0 AND booked_count <= capacity),
  status TEXT NOT NULL DEFAULT 'available'
    CHECK (status IN ('available', 'booked', 'canceled', 'completed')),
  teams_meeting_id TEXT,
  teams_join_url TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (ends_at > starts_at)
);

CREATE TABLE bookings (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_slot_id TEXT NOT NULL REFERENCES lesson_slots(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'confirmed'
    CHECK (status IN ('confirmed', 'canceled', 'attended', 'no_show')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  confirmed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, lesson_slot_id)
);

CREATE TABLE payment_transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES profiles(id),
  plan_id TEXT NOT NULL REFERENCES plans(id),
  provider TEXT NOT NULL,
  provider_transaction_id TEXT,
  amount REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  billing_interval TEXT NOT NULL
    CHECK (billing_interval IN ('monthly', 'annually')),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  metadata TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sessions (
  token_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TEXT NOT NULL
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_lesson_slots_starts_at ON lesson_slots(starts_at);
CREATE INDEX idx_lesson_slots_status ON lesson_slots(status);
CREATE INDEX idx_lesson_slots_teacher_id ON lesson_slots(teacher_id);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_lesson_slot_id ON bookings(lesson_slot_id);
CREATE INDEX idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);

INSERT INTO plans (
  id, name, description, monthly_price, annual_price, currency,
  lesson_credits_per_month, features, active, display_order
) VALUES
  (
    'starter', 'Starter', 'Perfect for trying Darija at your own pace.',
    19, 17.1, 'EUR', 2,
    '["2 lessons/month","60-minute lessons","Flexible scheduling"]', 1, 1
  ),
  (
    'plus', 'Plus', 'For committed learners who want steady progress.',
    39, 35.1, 'EUR', 4,
    '["4 lessons/month","60-minute lessons","Flexible scheduling","Priority booking","Progress tracking"]',
    1, 2
  ),
  (
    'premium', 'Premium', 'Intensive learning with maximum flexibility.',
    69, 62.1, 'EUR', 8,
    '["8 lessons/month","60-minute lessons","Flexible scheduling","Priority booking","Progress tracking","Dedicated teacher","Cultural workshops"]',
    1, 3
  );

INSERT INTO profiles (id, email, password_hash, full_name, preferred_locale, role)
VALUES
  (
    'student-user-uuid', 'student@slowdarija.com',
    '$2b$10$98/xzi3BhuBgU2EIvo3WjOolPdxtRsHSWLN.ERxsZt0Ah7IT7YG.u',
    'Youssef Alami', 'en', 'student'
  ),
  (
    'teacher-user-uuid', 'teacher@slowdarija.com',
    '$2b$10$ChTLqxFh9x6b1.LBGdl5uOx.0H15PZXnTQWThZMSEAJ9JuPOcu.9i',
    'Sarah Kadiri', 'fr', 'teacher'
  ),
  (
    'admin-user-uuid', 'admin@slowdarija.com',
    '$2b$10$ecC1YV0Ge1oAhAd2NZgLSu5EfVzA521xtp8fT5xHz55KcLJSEyQ5C',
    'Amine Tazi', 'en', 'admin'
  );

INSERT INTO subscriptions (
  id, user_id, plan_id, status, billing_interval, provider, current_period_end
) VALUES (
  'sub-student-preview', 'student-user-uuid', 'plus', 'active', 'monthly', 'mock',
  datetime('now', '+30 days')
);

INSERT INTO user_entitlements (id, user_id, remaining_lesson_credits, credits_reset_at)
VALUES
  ('ent-student-preview', 'student-user-uuid', 4, datetime('now', '+30 days')),
  ('ent-teacher-preview', 'teacher-user-uuid', 0, datetime('now', '+30 days')),
  ('ent-admin-preview', 'admin-user-uuid', 0, datetime('now', '+30 days'));

INSERT INTO lesson_slots (
  id, teacher_id, starts_at, ends_at, capacity, booked_count, status,
  teams_meeting_id, teams_join_url
) VALUES
  (
    'slot-sarah-101', 'teacher-user-uuid',
    datetime('now', '+1 day'), datetime('now', '+1 day', '+1 hour'),
    1, 0, 'available', 'teams-m-101',
    'https://teams.microsoft.com/l/meetup-join/slow-darija-lesson-101'
  ),
  (
    'slot-sarah-102', 'teacher-user-uuid',
    datetime('now', '+2 days'), datetime('now', '+2 days', '+1 hour'),
    1, 0, 'available', 'teams-m-102',
    'https://teams.microsoft.com/l/meetup-join/slow-darija-lesson-102'
  ),
  (
    'slot-sarah-103', 'teacher-user-uuid',
    datetime('now', '+4 days'), datetime('now', '+4 days', '+1 hour'),
    1, 0, 'available', 'teams-m-103',
    'https://teams.microsoft.com/l/meetup-join/slow-darija-lesson-103'
  ),
  (
    'slot-sarah-104', 'teacher-user-uuid',
    datetime('now', '+6 days'), datetime('now', '+6 days', '+1 hour'),
    1, 0, 'available', 'teams-m-104',
    'https://teams.microsoft.com/l/meetup-join/slow-darija-lesson-104'
  );
