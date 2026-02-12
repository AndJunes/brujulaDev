import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employer = searchParams.get("employer");
    const status = searchParams.get("status");

    let jobs;

    if (employer) {
      // Employer dashboard: get jobs by employer wallet
      jobs = await sql`
        SELECT id, title, category, description, amount, "estimatedDays", status, skills, "escrowContractId", "createdAt"
        FROM "Job"
        WHERE "employerId" = (
          SELECT id FROM "User" WHERE "stellarAddress" = ${employer} LIMIT 1
        )
        ORDER BY "createdAt" DESC
      `;
    } else if (status) {
      // Freelancer dashboard: get jobs by status (e.g., FUNDED)
      jobs = await sql`
        SELECT id, title, category, description, amount, "estimatedDays", status, skills, "createdAt"
        FROM "Job"
        WHERE status = ${status}
        ORDER BY "createdAt" DESC
      `;
    } else {
      // Default: all open/funded jobs
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
