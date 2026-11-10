/**
 * Seed remote D1 database with demo data.
 * Uses --batch JSON to avoid shell-escaping issues.
 * Usage: node scripts/seed-d1.mjs
 */
import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cfBin = path.join(__dirname, '..', 'node_modules', '.bin', 'cf.cmd');
const DB_ID = 'e0917e17-ee33-4ca6-b924-9eb53b5c8973';
const ROOT = path.join(__dirname, '..');
const BATCH_FILE = path.join(ROOT, 'scripts', '_seed_batch.json');

function runBatch(statements) {
  const batch = statements.map((sql) => ({ sql: sql.trim() }));
  writeFileSync(BATCH_FILE, JSON.stringify(batch), 'utf8');
  try {
    const out = execSync(
      `"${cfBin}" d1 query ${DB_ID} --batch @scripts/_seed_batch.json`,
      { encoding: 'utf8', cwd: ROOT, shell: true },
    );
    return JSON.parse(out);
  } finally {
    unlinkSync(BATCH_FILE);
  }
}

// ── Seed statements ────────────────────────────────────────────────────────
const results = runBatch([
  `INSERT OR IGNORE INTO plans (id, name, monthly_price, annual_price, lesson_credits_per_month, features, display_order) VALUES
    ('plan-starter','Starter',29.00,290.00,4,'4 lessons/month, Flexible scheduling, Progress tracking',1),
    ('plan-regular','Regular',49.00,490.00,8,'8 lessons/month, Priority booking, Grammar workbook',2),
    ('plan-intensive','Intensive',89.00,890.00,16,'16 lessons/month, 24h support, Certificate of progress',3)`,

  `INSERT OR IGNORE INTO subscriptions (id, user_id, plan_id, billing_interval, provider, current_period_end)
    SELECT 'sub-student-001', id, 'plan-regular', 'monthly', 'demo', datetime('now','+30 days')
    FROM profiles WHERE role='student' LIMIT 1`,

  `INSERT OR IGNORE INTO user_entitlements (id, user_id, remaining_lesson_credits, credits_reset_at)
    SELECT 'ent-student-001', id, 6, datetime('now','+30 days')
    FROM profiles WHERE role='student' LIMIT 1`,

  `INSERT OR IGNORE INTO lesson_slots (id, teacher_id, starts_at, ends_at, teams_join_url)
    SELECT 'slot-sarah-101', id,
      datetime('now','+1 day','start of day','+10 hours'),
      datetime('now','+1 day','start of day','+11 hours'),
      'https://teams.microsoft.com/l/meetup-join/demo-slot-101'
    FROM profiles WHERE role='teacher' LIMIT 1`,

  `INSERT OR IGNORE INTO lesson_slots (id, teacher_id, starts_at, ends_at, teams_join_url)
    SELECT 'slot-sarah-102', id,
      datetime('now','+2 days','start of day','+10 hours'),
      datetime('now','+2 days','start of day','+11 hours'),
      'https://teams.microsoft.com/l/meetup-join/demo-slot-102'
    FROM profiles WHERE role='teacher' LIMIT 1`,

  `INSERT OR IGNORE INTO lesson_slots (id, teacher_id, starts_at, ends_at, teams_join_url)
    SELECT 'slot-sarah-103', id,
      datetime('now','+3 days','start of day','+14 hours'),
      datetime('now','+3 days','start of day','+15 hours'),
      'https://teams.microsoft.com/l/meetup-join/demo-slot-103'
    FROM profiles WHERE role='teacher' LIMIT 1`,

  `INSERT OR IGNORE INTO lesson_slots (id, teacher_id, starts_at, ends_at, teams_join_url)
    SELECT 'slot-sarah-104', id,
      datetime('now','+5 days','start of day','+10 hours'),
      datetime('now','+5 days','start of day','+11 hours'),
      'https://teams.microsoft.com/l/meetup-join/demo-slot-104'
    FROM profiles WHERE role='teacher' LIMIT 1`,
]);

const labels = ['plans', 'subscription', 'entitlement', 'slot-101', 'slot-102', 'slot-103', 'slot-104'];
for (let i = 0; i < results.length; i++) {
  const r = results[i];
  const changes = r.meta?.changes ?? 0;
  console.log(`${r.success ? '✅' : '❌'} ${labels[i] ?? i}: ${changes} row(s) written`);
}

// ── Verification ───────────────────────────────────────────────────────────
const verify = runBatch([
  `SELECT 'profiles' t, COUNT(*) n FROM profiles
   UNION ALL SELECT 'plans', COUNT(*) FROM plans
   UNION ALL SELECT 'subscriptions', COUNT(*) FROM subscriptions
   UNION ALL SELECT 'entitlements', COUNT(*) FROM user_entitlements
   UNION ALL SELECT 'slots', COUNT(*) FROM lesson_slots`,
]);

console.log('\nRemote D1 row counts:');
for (const row of verify[0].results) {
  console.log(`  ${row.t}: ${row.n}`);
}
