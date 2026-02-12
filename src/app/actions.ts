"use server";

import { getDb } from "@/lib/db";

export async function getJobs(status?: string) {
  const sql = getDb();

  if (status) {
    return sql`SELECT * FROM "Job" WHERE status = ${status} ORDER BY "createdAt" DESC`;
  }
  return sql`SELECT * FROM "Job" ORDER BY "createdAt" DESC`;
}

export async function getJobById(id: string) {
  const sql = getDb();
  const jobs = await sql`SELECT * FROM "Job" WHERE id = ${id}`;
  return jobs[0] || null;
}

export async function getUserByAddress(stellarAddress: string) {
  const sql = getDb();
  const users = await sql`SELECT * FROM "User" WHERE "stellarAddress" = ${stellarAddress}`;
  return users[0] || null;
}

export async function getApplicationsByJobId(jobId: string) {
  const sql = getDb();
  return sql`SELECT * FROM "Application" WHERE "jobId" = ${jobId} ORDER BY "appliedAt" DESC`;
}

export async function getNotificationsForUser(userId: string) {
  const sql = getDb();
  return sql`SELECT * FROM "Notification" WHERE "userId" = ${userId} ORDER BY "createdAt" DESC LIMIT 20`;
}
