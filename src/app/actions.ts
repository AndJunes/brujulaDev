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

export async function getUserIdByAddress(stellarAddress: string) {
  const sql = getDb();
  const users = await sql`SELECT id FROM "User" WHERE "stellarAddress" = ${stellarAddress}`;
  return users[0]?.id || null;
}

export async function getApplicationsByJobId(jobId: string) {
  const sql = getDb();
  return sql`SELECT * FROM "Application" WHERE "jobId" = ${jobId} ORDER BY "appliedAt" DESC`;
}

export async function getApplicationsByFreelancerAddress(address: string) {
  const sql = getDb();
  return sql`
    SELECT a.*, j.title as "jobTitle", j.amount as "jobAmount", j.status as "jobStatus"
    FROM "Application" a
    JOIN "Job" j ON a."jobId" = j.id
    WHERE a."freelancerAddress" = ${address}
    ORDER BY a."appliedAt" DESC
  `;
}

export async function getNotificationsForUser(userId: string) {
  const sql = getDb();
  return sql`SELECT * FROM "Notification" WHERE "userId" = ${userId} ORDER BY "createdAt" DESC LIMIT 20`;
}

export async function getAgreementsByFreelancerAddress(address: string) {
  const sql = getDb();
  return sql`
    SELECT a.*, j.title as "jobTitle", j.amount as "jobAmount", j.deliverables as "jobDeliverables"
    FROM "Agreement" a
    JOIN "Job" j ON a."jobId" = j.id
    WHERE a."freelancerAddress" = ${address}
    ORDER BY a."createdAt" DESC
  `;
}

export async function getAgreementsByEmployerAddress(address: string) {
  const sql = getDb();
  return sql`
    SELECT a.*, j.title as "jobTitle", j.amount as "jobAmount"
    FROM "Agreement" a
    JOIN "Job" j ON a."jobId" = j.id
    WHERE a."employerAddress" = ${address}
    ORDER BY a."createdAt" DESC
  `;
}

export async function getAgreementById(id: string) {
  const sql = getDb();
  const agreements = await sql`
    SELECT a.*, j.title as "jobTitle", j.amount as "jobAmount", j.deliverables as "jobDeliverables",
           j.description as "jobDescription", j."escrowContractId", j."engagementId"
    FROM "Agreement" a
    JOIN "Job" j ON a."jobId" = j.id
    WHERE a.id = ${id}
  `;
  return agreements[0] || null;
}
