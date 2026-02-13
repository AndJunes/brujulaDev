import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const sql = getDb();
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId");
    const freelancerAddress = searchParams.get("freelancerAddress");

    let applications;

    if (jobId && freelancerAddress) {
      applications = await sql`
        SELECT * FROM "Application"
        WHERE "jobId" = ${jobId} AND "freelancerAddress" = ${freelancerAddress}
        ORDER BY "appliedAt" DESC
      `;
    } else if (jobId) {
      applications = await sql`
        SELECT * FROM "Application"
        WHERE "jobId" = ${jobId}
        ORDER BY "appliedAt" DESC
      `;
    } else if (freelancerAddress) {
      applications = await sql`
        SELECT a.*, j.title as "jobTitle", j.amount as "jobAmount"
        FROM "Application" a
        JOIN "Job" j ON a."jobId" = j.id
        WHERE a."freelancerAddress" = ${freelancerAddress}
        ORDER BY a."appliedAt" DESC
      `;
    } else {
      return NextResponse.json(
        { error: "Se requiere jobId o freelancerAddress" },
        { status: 400 }
      );
    }

    return NextResponse.json({ applications });
  } catch (error) {
    console.error("Error fetching applications:", error);
    return NextResponse.json(
      { error: "Error al obtener aplicaciones" },
      { status: 500 }
    );
  }
}
