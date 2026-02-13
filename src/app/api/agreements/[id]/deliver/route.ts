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

    const { deliveryUrl, deliveryNote, freelancerAddress } = body;

    if (!deliveryUrl || !freelancerAddress) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    // Verify agreement exists and belongs to freelancer
    const agreements = await sql`
      SELECT a.*, j.title as "jobTitle", j.id as "realJobId"
      FROM "Agreement" a
      JOIN "Job" j ON a."jobId" = j.id
      WHERE a.id = ${id} AND a."freelancerAddress" = ${freelancerAddress}
    `;

    if (agreements.length === 0) {
      return NextResponse.json({ error: "Acuerdo no encontrado" }, { status: 404 });
    }

    const agreement = agreements[0];

    if (agreement.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Este acuerdo no esta en estado activo" },
        { status: 400 }
      );
    }

    // Update agreement
    await sql`
      UPDATE "Agreement"
      SET "deliveryUrl" = ${deliveryUrl},
          "deliveryNote" = ${deliveryNote || null},
          "deliveredAt" = NOW(),
          status = 'WORK_DELIVERED'
      WHERE id = ${id}
    `;

    // Update job status
    await sql`
      UPDATE "Job" SET status = 'IN_REVIEW' WHERE id = ${agreement.realJobId}
    `;

    // Notify employer
    await createNotification({
      userId: agreement.employerId,
      type: "WORK_DELIVERED",
      title: "Trabajo entregado",
      message: `El freelancer completo "${agreement.jobTitle}". Revisa la entrega.`,
      actionUrl: `/dashboard/employer/agreements/${id}/review`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error delivering work:", error);
    return NextResponse.json(
      { error: "Error al entregar el trabajo" },
      { status: 500 }
    );
  }
}
