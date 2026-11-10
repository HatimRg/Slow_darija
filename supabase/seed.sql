-- Seed plans
INSERT INTO plans (id, name, description, monthly_price, annual_price, currency, lesson_credits_per_month, features, active, display_order) VALUES
('starter', 'Starter', 'Perfect for trying Darija at your own pace.', 19.00, 17.10, 'EUR', 2, 
  '["2 lessons/month", "60-minute lessons", "Flexible scheduling"]'::jsonb, true, 1),
('plus', 'Plus', 'For committed learners who want steady progress.', 39.00, 35.10, 'EUR', 4, 
  '["4 lessons/month", "60-minute lessons", "Flexible scheduling", "Priority booking", "Progress tracking"]'::jsonb, true, 2),
('premium', 'Premium', 'Intensive learning with maximum flexibility.', 69.00, 62.10, 'EUR', 8, 
  '["8 lessons/month", "60-minute lessons", "Flexible scheduling", "Priority booking", "Progress tracking", "Dedicated teacher", "Cultural workshops"]'::jsonb, true, 3);
