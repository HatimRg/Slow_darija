const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function migrate() {
  console.log('Connecting to MySQL...');
  
  const connection = await mysql.createConnection({
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '3306'),
    user: process.env.DATABASE_USER || 'root',
    password: process.env.DATABASE_PASSWORD || '',
  });

  try {
    await connection.query('CREATE DATABASE IF NOT EXISTS slow_darija CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;');
    await connection.query('USE slow_darija;');

    console.log('Generating password hashes...');
    const studentHash = await bcrypt.hash('student123', 10);
    const teacherHash = await bcrypt.hash('teacher123', 10);
    const adminHash = await bcrypt.hash('admin123', 10);

    // Update / Insert 3 primary accounts
    await connection.query(`
      INSERT INTO profiles (id, email, password_hash, full_name, preferred_locale, role)
      VALUES 
        ('student-user-uuid', 'student@slowdarija.com', '${studentHash}', 'Youssef Alami', 'en', 'student')
      ON DUPLICATE KEY UPDATE 
        password_hash = '${studentHash}',
        full_name = 'Youssef Alami',
        role = 'student';
    `);

    // Get actual student id
    const [students] = await connection.query("SELECT id FROM profiles WHERE email = 'student@slowdarija.com'");
    const studentId = students[0].id;

    await connection.query(`
      INSERT INTO profiles (id, email, password_hash, full_name, preferred_locale, role)
      VALUES 
        ('teacher-user-uuid', 'teacher@slowdarija.com', '${teacherHash}', 'Sarah Kadiri', 'fr', 'teacher')
      ON DUPLICATE KEY UPDATE 
        password_hash = '${teacherHash}',
        full_name = 'Sarah Kadiri',
        role = 'teacher';
    `);
    const [teachers] = await connection.query("SELECT id FROM profiles WHERE email = 'teacher@slowdarija.com'");
    const teacherId = teachers[0].id;

    await connection.query(`
      INSERT INTO profiles (id, email, password_hash, full_name, preferred_locale, role)
      VALUES 
        ('admin-user-uuid', 'admin@slowdarija.com', '${adminHash}', 'Amine Tazi', 'en', 'admin')
      ON DUPLICATE KEY UPDATE 
        password_hash = '${adminHash}',
        full_name = 'Amine Tazi',
        role = 'admin';
    `);
    const [admins] = await connection.query("SELECT id FROM profiles WHERE email = 'admin@slowdarija.com'");
    const adminId = admins[0].id;

    // Seed/Update Student Subscription (Plus Plan - 4 credits)
    await connection.query(`
      INSERT INTO subscriptions (id, user_id, plan_id, status, billing_interval, provider, current_period_end)
      VALUES ('sub-student-001', '${studentId}', 'plus', 'active', 'monthly', 'mock', DATE_ADD(NOW(), INTERVAL 30 DAY))
      ON DUPLICATE KEY UPDATE plan_id = 'plus', status = 'active';
    `);

    // Seed/Update Student Entitlements
    await connection.query(`
      INSERT INTO user_entitlements (id, user_id, remaining_lesson_credits, credits_reset_at)
      VALUES ('ent-student-001', '${studentId}', 4, DATE_ADD(NOW(), INTERVAL 30 DAY))
      ON DUPLICATE KEY UPDATE remaining_lesson_credits = 4;
    `);

    // Seed Teacher Lesson Slots for Sarah Kadiri
    await connection.query(`
      INSERT INTO lesson_slots (id, teacher_id, starts_at, ends_at, capacity, booked_count, status, teams_meeting_id, teams_join_url)
      VALUES
        ('slot-sarah-101', '${teacherId}', DATE_ADD(NOW(), INTERVAL 1 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 1 DAY), INTERVAL 1 HOUR), 1, 0, 'available', 'teams-m-101', 'https://teams.microsoft.com/l/meetup-join/slow-darija-lesson-101'),
        ('slot-sarah-102', '${teacherId}', DATE_ADD(NOW(), INTERVAL 2 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 2 DAY), INTERVAL 1 HOUR), 1, 0, 'available', 'teams-m-102', 'https://teams.microsoft.com/l/meetup-join/slow-darija-lesson-102'),
        ('slot-sarah-103', '${teacherId}', DATE_ADD(NOW(), INTERVAL 4 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 4 DAY), INTERVAL 1 HOUR), 1, 0, 'available', 'teams-m-103', 'https://teams.microsoft.com/l/meetup-join/slow-darija-lesson-103'),
        ('slot-sarah-104', '${teacherId}', DATE_ADD(NOW(), INTERVAL 6 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 6 DAY), INTERVAL 1 HOUR), 1, 0, 'available', 'teams-m-104', 'https://teams.microsoft.com/l/meetup-join/slow-darija-lesson-104')
      ON DUPLICATE KEY UPDATE status = 'available', teacher_id = '${teacherId}';
    `);

    console.log('✅ Accounts seeded successfully:');
    console.log(`   🎓 Student: student@slowdarija.com (PW: student123, ID: ${studentId})`);
    console.log(`   👩‍🏫 Teacher: teacher@slowdarija.com (PW: teacher123, ID: ${teacherId})`);
    console.log(`   🛡️ Admin:   admin@slowdarija.com   (PW: admin123,   ID: ${adminId})`);
  } finally {
    await connection.end();
  }
}

migrate().catch(console.error);