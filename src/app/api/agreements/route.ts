import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const sql = getDb();
    const { searchParams } = new URL(request.url);
    const freelancerAddress = searchParams.get("freelancerAddress");
    const employerAddress = searchParams.get("employerAddress");

    let agreements;

    if (freelancerAddress) {
      agreements = await sql`
        SELECT a.*, j.title as "jobTitle", j.amount as "jobAmount", j.deliverables as "jobDeliverables"
        FROM "Agreement" a
        JOIN "Job" j ON a."jobId" = j.id
        WHERE a."freelancerAddress" = ${freelancerAddress}
        ORDER BY a."createdAt" DESC
      `;
    } else if (employerAddress) {
      agreements = await sql`
        SELECT a.*, j.title as "jobTitle", j.amount as "jobAmount"
        FROM "Agreement" a
        JOIN "Job" j ON a."jobId" = j.id
        WHERE a."employerAddress" = ${employerAddress}
        ORDER BY a."createdAt" DESC
      `;
    } else {
      return NextResponse.json(
        { error: "Se requiere freelancerAddress o employerAddress" },
        { status: 400 }
      );
    }

    return NextResponse.json({ agreements });
  } catch (error) {
    console.error("Error fetching agreements:", error);
    return NextResponse.json(
      { error: "Error al obtener acuerdos" },
      { status: 500 }
    );
  }
}
