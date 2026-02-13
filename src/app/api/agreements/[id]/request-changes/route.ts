import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { createNotification } from "@/lib/notifications";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const sql = getDb();

    const { feedback } = body;

    if (!feedback) {
      return NextResponse.json({ error: "Se requiere feedback" }, { status: 400 });
    }

    // Get agreement with job info
    const agreements = await sql`
      SELECT a.*, j.title as "jobTitle", j.id as "realJobId"
      FROM "Agreement" a
      JOIN "Job" j ON a."jobId" = j.id
      WHERE a.id = ${id}
    `;

    if (agreements.length === 0) {
      return NextResponse.json({ error: "Acuerdo no encontrado" }, { status: 404 });
    }

    const agreement = agreements[0];

    // Reset agreement to active
    await sql`
      UPDATE "Agreement"
      SET status = 'ACTIVE',
          "deliveryUrl" = NULL,
          "deliveryNote" = NULL,
          "deliveredAt" = NULL
      WHERE id = ${id}
    `;

    // Reset job status
    await sql`
      UPDATE "Job" SET status = 'ASSIGNED' WHERE id = ${agreement.realJobId}
    `;

    // Notify freelancer
    await createNotification({
      userId: agreement.freelancerId,
      type: "CHANGES_REQUESTED",
      title: "Cambios solicitados",
      message: `El empleador solicito cambios en "${agreement.jobTitle}": ${feedback.slice(0, 100)}`,
      actionUrl: `/dashboard/freelancer`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error requesting changes:", error);
    return NextResponse.json(
      { error: "Error al solicitar cambios" },
      { status: 500 }
    );
  }
}
