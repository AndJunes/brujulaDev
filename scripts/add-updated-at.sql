-- Add updatedAt column to Job table if it doesn't exist
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;
