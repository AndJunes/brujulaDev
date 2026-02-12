import { NextResponse } from "next/server";
import { getTrustlessWorkClient } from "@/lib/trustlesswork/client";
import { getDb } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { signedXdr, jobId } = body;

    if (!signedXdr) {
      return NextResponse.json(
        { error: "Falta signedXdr" },
        { status: 400 }
      );
    }

    const client = getTrustlessWorkClient();

    // Send the signed transaction to Stellar via Trustless Work
    const response = await client.sendTransaction({ signedXdr });

    // If we got a contractId back, update the job in Neon
    if (response.contractId && jobId) {
      const sql = getDb();
      await sql`
        UPDATE "Job"
        SET "escrowContractId" = ${response.contractId},
            status = 'FUNDED'
        WHERE id = ${jobId}
      `;
    }

    return NextResponse.json({
      success: true,
      contractId: response.contractId,
      status: response.status,
    });
  } catch (error) {
    console.error("Error sending transaction:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error al enviar transaccion",
      },
      { status: 500 }
    );
  }
}
