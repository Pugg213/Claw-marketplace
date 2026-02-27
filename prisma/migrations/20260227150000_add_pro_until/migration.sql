-- Add proUntil subscription field
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "proUntil" TIMESTAMP(3);
