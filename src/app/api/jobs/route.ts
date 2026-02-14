import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const sql = getDb();
    const { searchParams } = new URL(request.url);
    const employer = searchParams.get("employer");
    const status = searchParams.get("status");

    let jobs;

    if (employer) {
      console.log("[v0] Looking up jobs for employer wallet:", employer);
      const users = await sql`SELECT id FROM "User" WHERE "stellarAddress" = ${employer} LIMIT 1`;
      console.log("[v0] User lookup result:", JSON.stringify(users));

      if (users.length === 0) {
        return NextResponse.json({ jobs: [] });
      }

      jobs = await sql`
        SELECT id, title, category, description, amount, "estimatedDays", status, skills, "escrowContractId", "createdAt"
        FROM "Job"
        WHERE "employerId" = ${users[0].id}
        ORDER BY "createdAt" DESC
      `;
      console.log("[v0] Jobs found:", jobs.length);
    } else if (status) {
      jobs = await sql`
        SELECT id, title, category, description, amount, "estimatedDays", status, skills, "createdAt"
        FROM "Job"
        WHERE status = ${status}
        ORDER BY "createdAt" DESC
      `;
    } else {
      jobs = await sql`
        SELECT id, title, category, description, amount, "estimatedDays", status, skills, "createdAt"
        FROM "Job"
        WHERE status IN ('OPEN', 'FUNDED')
        ORDER BY "createdAt" DESC
      `;
    }

    return NextResponse.json({ jobs });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json(
      { error: "Error al obtener trabajos" },
      { status: 500 }
    );
  }
}
