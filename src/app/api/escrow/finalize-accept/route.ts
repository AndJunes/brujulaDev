import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { generateId } from "@/lib/utils";
import { createNotification } from "@/lib/notifications";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { jobId, applicationId, freelancerAddress, contractId } = body;

    if (!jobId || !applicationId || !freelancerAddress || !contractId) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    const sql = getDb();

    // Get job data
    const jobs = await sql`
      SELECT id, title, "employerId", "employerAddress", amount
      FROM "Job"
      WHERE id = ${jobId}
    `;

    if (jobs.length === 0) {
      return NextResponse.json({ error: "Trabajo no encontrado" }, { status: 404 });
    }

    const job = jobs[0];

    // Save escrowContractId on job and set status to ASSIGNED
    await sql`
      UPDATE "Job"
      SET "escrowContractId" = ${contractId}, status = 'ASSIGNED'
      WHERE id = ${jobId}
    `;

    // Upsert freelancer user
    const existingUsers = await sql`
      SELECT id FROM "User" WHERE "stellarAddress" = ${freelancerAddress}
    `;

    let freelancerId: string;

    if (existingUsers.length > 0) {
      freelancerId = existingUsers[0].id;
    } else {
      freelancerId = generateId(25);
      const displayName = `Usuario ${freelancerAddress.slice(0, 6)}...`;
      await sql`
        INSERT INTO "User" (id, "stellarAddress", "displayName", role, "createdAt", "lastSeenAt")
        VALUES (${freelancerId}, ${freelancerAddress}, ${displayName}, 'FREELANCER', NOW(), NOW())
      `;
    }

    // Create Agreement
    const agreementId = generateId(25);
    await sql`
      INSERT INTO "Agreement" (
        id, "jobId", "employerId", "employerAddress",
        "freelancerId", "freelancerAddress", "escrowContractId",
        status, "employerApproved", "freelancerConfirmed", "createdAt"
      ) VALUES (
        ${agreementId}, ${jobId}, ${job.employerId}, ${job.employerAddress},
        ${freelancerId}, ${freelancerAddress}, ${contractId},
        'ACTIVE', false, false, NOW()
      )
    `;

    // Accept application, reject others
    await sql`
      UPDATE "Application"
      SET status = 'ACCEPTED', "acceptedAt" = NOW()
      WHERE id = ${applicationId}
    `;

    await sql`
      UPDATE "Application"
      SET status = 'REJECTED', "rejectedAt" = NOW()
      WHERE "jobId" = ${jobId} AND id != ${applicationId} AND status = 'PENDING'
    `;

    // Notify freelancer
    await createNotification({
      userId: freelancerId,
      type: "APPLICATION_ACCEPTED",
      title: "Postulacion aceptada",
      message: `Tu postulacion para "${job.title}" fue aceptada. Ya puedes empezar a trabajar.`,
      actionUrl: `/dashboard/freelancer`,
    });

    // Record transaction
    const txId = generateId(25);
    await sql`
      INSERT INTO "Transaction" (
        id, "jobId", type, amount, "txHash", status,
        "fromAddress", "toAddress", "createdAt", "confirmedAt"
      ) VALUES (
        ${txId}, ${jobId}, 'ESCROW_FUNDED', ${job.amount},
        ${contractId}, 'CONFIRMED',
        ${job.employerAddress}, ${freelancerAddress}, NOW(), NOW()
      )
    `;

    return NextResponse.json({
      success: true,
      agreementId,
    });
  } catch (error) {
    console.error("Error finalizing accept:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error al finalizar la aceptacion",
      },
      { status: 500 }
    );
  }
}
