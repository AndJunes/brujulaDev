import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sql = getDb();

    const rows = await sql`
      SELECT id, title, description, deliverables, requirements, amount,
             "estimatedDays", deadline, status, "engagementId", "escrowContractId",
             "employerAddress", category, skills, "createdAt"
      FROM "Job"
      WHERE id = ${id}
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: "Job no encontrado" }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("Error fetching job:", error);
    return NextResponse.json(
      { error: "Error al obtener el trabajo" },
      { status: 500 }
    );
  }
}
