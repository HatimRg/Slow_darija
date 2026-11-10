-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Custom types
CREATE TYPE user_role AS ENUM ('student', 'teacher', 'admin');
CREATE TYPE subscription_status AS ENUM ('active', 'past_due', 'canceled', 'trialing', 'incomplete');
CREATE TYPE billing_interval AS ENUM ('monthly', 'annually');
CREATE TYPE slot_status AS ENUM ('available', 'booked', 'canceled', 'completed');
CREATE TYPE booking_status AS ENUM ('confirmed', 'canceled', 'attended', 'no_show');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');

-- 2. Profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  preferred_locale TEXT DEFAULT 'en' CHECK (preferred_locale IN ('en', 'fr', 'ar', 'de', 'tr')),
  role user_role DEFAULT 'student' NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3. Plans table
CREATE TABLE plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  monthly_price NUMERIC(10, 2) NOT NULL,
  annual_price NUMERIC(10, 2) NOT NULL,
  currency TEXT DEFAULT 'EUR' NOT NULL,
  lesson_credits_per_month INT NOT NULL,
  features JSONB DEFAULT '[]'::jsonb NOT NULL,
  active BOOLEAN DEFAULT true NOT NULL,
  display_order INT DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 4. Subscriptions table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  plan_id TEXT REFERENCES plans(id) NOT NULL,
  status subscription_status DEFAULT 'active' NOT NULL,
  billing_interval billing_interval DEFAULT 'monthly' NOT NULL,
  provider TEXT NOT NULL,
  provider_customer_id TEXT,
  provider_subscription_id TEXT,
  started_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 5. User entitlements (credit balance)
CREATE TABLE user_entitlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  remaining_lesson_credits INT DEFAULT 0 NOT NULL CHECK (remaining_lesson_credits >= 0),
  credits_reset_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 6. Lesson slots
CREATE TABLE lesson_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES profiles(id) NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  capacity INT DEFAULT 1 NOT NULL CHECK (capacity > 0),
  booked_count INT DEFAULT 0 NOT NULL CHECK (booked_count >= 0),
  status slot_status DEFAULT 'available' NOT NULL,
  teams_meeting_id TEXT,
  teams_join_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT valid_time_range CHECK (ends_at > starts_at),
  CONSTRAINT booked_within_capacity CHECK (booked_count <= capacity)
);

-- 7. Bookings
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  lesson_slot_id UUID REFERENCES lesson_slots(id) ON DELETE CASCADE NOT NULL,
  status booking_status DEFAULT 'confirmed' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  confirmed_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT unique_user_slot UNIQUE(user_id, lesson_slot_id)
);

-- 8. Payment transactions
CREATE TABLE payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  plan_id TEXT REFERENCES plans(id) NOT NULL,
  provider TEXT NOT NULL,
  provider_transaction_id TEXT,
  amount NUMERIC(10, 2) NOT NULL,
  currency TEXT DEFAULT 'EUR' NOT NULL,
  billing_interval billing_interval NOT NULL,
  status payment_status DEFAULT 'pending' NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 9. Indexes
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_lesson_slots_starts_at ON lesson_slots(starts_at);
CREATE INDEX idx_lesson_slots_status ON lesson_slots(status);
CREATE INDEX idx_lesson_slots_teacher_id ON lesson_slots(teacher_id);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_lesson_slot_id ON bookings(lesson_slot_id);
CREATE INDEX idx_payment_transactions_user_id ON payment_transactions(user_id);

-- 10. Auto-update updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_entitlements_updated_at
  BEFORE UPDATE ON user_entitlements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 11. Auto-create profile + entitlement on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, preferred_locale, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'preferred_locale', 'en'),
    'student'
  );

  INSERT INTO public.user_entitlements (user_id, remaining_lesson_credits, credits_reset_at)
  VALUES (NEW.id, 0, now() + interval '30 days');

  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 12. Row Level Security policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- Profiles: Users read/update own, admins read all
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Plans: Public read, admin write
CREATE POLICY "Anyone can view active plans" ON plans FOR SELECT USING (active = true);
CREATE POLICY "Admins can manage plans" ON plans FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Subscriptions: User reads own
CREATE POLICY "Users can view own subscription" ON subscriptions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins can view all subscriptions" ON subscriptions FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- User entitlements: User reads own
CREATE POLICY "Users can view own entitlements" ON user_entitlements FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins can view all entitlements" ON user_entitlements FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Lesson slots: Authenticated users can view available, admins/teachers manage
CREATE POLICY "Authenticated users can view available slots" ON lesson_slots FOR SELECT USING (
  auth.role() = 'authenticated' AND (status = 'available' OR status = 'booked')
);
CREATE POLICY "Admins can manage lesson slots" ON lesson_slots FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'teacher'))
);

-- Bookings: Users manage own, admins view all
CREATE POLICY "Users can view own bookings" ON bookings FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create own bookings" ON bookings FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own bookings" ON bookings FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Admins can view all bookings" ON bookings FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'teacher'))
);

-- Payment transactions: Users view own
CREATE POLICY "Users can view own transactions" ON payment_transactions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins can view all transactions" ON payment_transactions FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
