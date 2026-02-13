import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { generateId } from "@/lib/utils";
import { createNotification } from "@/lib/notifications";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const sql = getDb();

    const { jobId, freelancerAddress, coverLetter, portfolioUrl, proposedDeliveryDate } = body;

    if (!jobId || !freelancerAddress || !coverLetter || !proposedDeliveryDate) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    // Check job exists and is OPEN
    const jobs = await sql`
      SELECT id, title, "employerId", status FROM "Job" WHERE id = ${jobId}
    `;
    if (jobs.length === 0) {
      return NextResponse.json({ error: "Trabajo no encontrado" }, { status: 404 });
    }
    const job = jobs[0];
    if (job.status !== "OPEN") {
      return NextResponse.json({ error: "Este trabajo no esta disponible para postulaciones" }, { status: 400 });
    }

    // Check if already applied
    const existing = await sql`
      SELECT id FROM "Application"
      WHERE "jobId" = ${jobId} AND "freelancerAddress" = ${freelancerAddress}
    `;
    if (existing.length > 0) {
      return NextResponse.json({ error: "Ya te postulaste a este trabajo" }, { status: 400 });
    }

    // Upsert freelancer user
    const existingUsers = await sql`
      SELECT id FROM "User" WHERE "stellarAddress" = ${freelancerAddress}
    `;

    let freelancerId: string;

    if (existingUsers.length > 0) {
      freelancerId = existingUsers[0].id;
      await sql`
        UPDATE "User" SET "lastSeenAt" = NOW() WHERE id = ${freelancerId}
      `;
    } else {
      freelancerId = generateId(25);
      const displayName = `Usuario ${freelancerAddress.slice(0, 6)}...`;
      await sql`
        INSERT INTO "User" (id, "stellarAddress", "displayName", role, "createdAt", "lastSeenAt")
        VALUES (${freelancerId}, ${freelancerAddress}, ${displayName}, 'FREELANCER', NOW(), NOW())
      `;
    }

    // Create application
    const applicationId = generateId(25);

    await sql`
      INSERT INTO "Application" (
        id, "jobId", "freelancerId", "freelancerAddress",
        "coverLetter", "portfolioUrl", "proposedDeliveryDate",
        status, "appliedAt"
      ) VALUES (
        ${applicationId}, ${jobId}, ${freelancerId}, ${freelancerAddress},
        ${coverLetter}, ${portfolioUrl || null}, ${proposedDeliveryDate},
        'PENDING', NOW()
      )
    `;

    // Notify employer
    await createNotification({
      userId: job.employerId,
      type: "NEW_APPLICATION",
      title: "Nueva postulacion",
      message: `Un freelancer se postulo para "${job.title}"`,
      actionUrl: `/dashboard/employer/jobs/${jobId}/applications`,
    });

    return NextResponse.json({ success: true, applicationId });
  } catch (error) {
    console.error("Error creating application:", error);
    return NextResponse.json(
      { error: "Error al crear la postulacion" },
      { status: 500 }
    );
  }
}
