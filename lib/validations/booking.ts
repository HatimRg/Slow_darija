import { z } from 'zod';

export const createBookingSchema = z.object({
  lesson_slot_id: z.string().uuid('Invalid lesson slot ID'),
});

export const cancelBookingSchema = z.object({
  booking_id: z.string().uuid('Invalid booking ID'),
});

export const createSlotSchema = z.object({
  starts_at: z.string().datetime(),
  ends_at: z.string().datetime(),
  capacity: z.number().int().min(1).default(1),
  teams_join_url: z.string().url().optional(),
});
