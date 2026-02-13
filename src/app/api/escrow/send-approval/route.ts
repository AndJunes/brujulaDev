import { NextResponse } from "next/server";
import { getTrustlessWorkClient } from "@/lib/trustlesswork/client";
import { getDb } from "@/lib/db";
import { generateId } from "@/lib/utils";
import { createNotification } from "@/lib/notifications";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { signedXdr, agreementId, alreadyApproved } = body;

    if (!agreementId) {
      return NextResponse.json(
        { error: "Falta agreementId" },
        { status: 400 }
      );
    }

    const client = getTrustlessWorkClient();
    const sql = getDb();

    // Send signed transaction (skip if already approved on-chain)
    let response: { transactionHash?: string } = {};
    if (!alreadyApproved) {
      if (!signedXdr) {
        return NextResponse.json({ error: "Falta signedXdr" }, { status: 400 });
      }
      response = await client.sendTransaction({ signedXdr });
    }

    // Get agreement info
    const agreements = await sql`
      SELECT a.*, j.title as "jobTitle", j.amount as "jobAmount"
      FROM "Agreement" a
      JOIN "Job" j ON a."jobId" = j.id
      WHERE a.id = ${agreementId}
    `;

    if (agreements.length === 0) {
      return NextResponse.json({ error: "Acuerdo no encontrado" }, { status: 404 });
    }

    const agreement = agreements[0];

    // Update agreement
    await sql`
      UPDATE "Agreement"
      SET "employerApproved" = true,
          "employerApprovedAt" = NOW(),
          status = 'EMPLOYER_APPROVED'
      WHERE id = ${agreementId}
    `;

    // Record transaction
    const txId = generateId(25);
    await sql`
      INSERT INTO "Transaction" (
        id, "agreementId", "jobId", type, amount, "txHash",
        status, "fromAddress", "toAddress", "createdAt", "confirmedAt"
      ) VALUES (
        ${txId}, ${agreementId}, ${agreement.jobId}, 'MILESTONE_APPROVED',
        ${agreement.jobAmount},
        ${response.transactionHash || `tx_${Date.now()}_${txId}`},
        'CONFIRMED', ${agreement.employerAddress}, ${agreement.freelancerAddress},
        NOW(), NOW()
      )
    `;

    // Notify freelancer
    await createNotification({
      userId: agreement.freelancerId,
      type: "WORK_APPROVED",
      title: "Trabajo aprobado",
      message: `El empleador aprobo tu entrega de "${agreement.jobTitle}". Confirma para recibir el pago.`,
      actionUrl: `/dashboard/freelancer/agreements/${agreementId}/confirm`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending approval:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error al enviar aprobacion",
      },
      { status: 500 }
    );
  }
}
