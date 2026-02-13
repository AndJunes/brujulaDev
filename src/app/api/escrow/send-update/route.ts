import { NextResponse } from "next/server";
import { getTrustlessWorkClient } from "@/lib/trustlesswork/client";
import { getDb } from "@/lib/db";
import { generateId } from "@/lib/utils";
import { createNotification } from "@/lib/notifications";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { signedXdr, jobId, applicationId, freelancerAddress } = body;

    if (!signedXdr || !jobId || !applicationId || !freelancerAddress) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    const client = getTrustlessWorkClient();
    const sql = getDb();

    // Send signed transaction to Stellar
    const response = await client.sendTransaction({ signedXdr });

    // Get job and employer info
    const jobs = await sql`
      SELECT id, title, "employerId", "employerAddress", "escrowContractId"
      FROM "Job" WHERE id = ${jobId}
    `;

    if (jobs.length === 0) {
      return NextResponse.json({ error: "Trabajo no encontrado" }, { status: 404 });
    }

    const job = jobs[0];

    // Upsert freelancer user (ensure exists)
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
        ${freelancerId}, ${freelancerAddress}, ${job.escrowContractId},
        'ACTIVE', false, false, NOW()
      )
    `;

    // Accept the application
    await sql`
      UPDATE "Application"
      SET status = 'ACCEPTED', "acceptedAt" = NOW()
      WHERE id = ${applicationId}
    `;

    // Reject all other applications for this job
    await sql`
      UPDATE "Application"
      SET status = 'REJECTED', "rejectedAt" = NOW()
      WHERE "jobId" = ${jobId} AND id != ${applicationId} AND status = 'PENDING'
    `;

    // Update job status
    await sql`
      UPDATE "Job" SET status = 'ASSIGNED' WHERE id = ${jobId}
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
        ${txId}, ${jobId}, 'ESCROW_UPDATE', 0,
        ${response.transactionHash || response.contractId || `tx_${Date.now()}_${txId}`},
        'CONFIRMED', ${job.employerAddress}, ${freelancerAddress}, NOW(), NOW()
      )
    `;

    return NextResponse.json({
      success: true,
      agreementId,
    });
  } catch (error) {
    console.error("Error sending escrow update:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error al enviar actualizacion",
      },
      { status: 500 }
    );
  }
}
