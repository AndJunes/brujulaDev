import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { createNotification } from "@/lib/notifications";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const sql = getDb();

    const { status } = body;

    if (status !== "REJECTED") {
      return NextResponse.json(
        { error: "Solo se puede rechazar por esta ruta" },
        { status: 400 }
      );
    }

    // Get application with job info for notification
    const apps = await sql`
      SELECT a.*, j.title as "jobTitle"
      FROM "Application" a
      JOIN "Job" j ON a."jobId" = j.id
      WHERE a.id = ${id}
    `;

    if (apps.length === 0) {
      return NextResponse.json({ error: "Aplicacion no encontrada" }, { status: 404 });
    }

    const app = apps[0];

    await sql`
      UPDATE "Application"
      SET status = 'REJECTED', "rejectedAt" = NOW()
      WHERE id = ${id}
    `;

    // Notify freelancer
    await createNotification({
      userId: app.freelancerId,
      type: "APPLICATION_REJECTED",
      title: "Postulacion no seleccionada",
      message: `Tu postulacion para "${app.jobTitle}" no fue seleccionada`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating application:", error);
    return NextResponse.json(
      { error: "Error al actualizar la aplicacion" },
      { status: 500 }
    );
  }
}
