import { NextResponse } from "next/server";
import { getTrustlessWorkClient } from "@/lib/trustlesswork/client";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { contractId, approver } = body;

    if (!contractId || !approver) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    const client = getTrustlessWorkClient();

    const response = await client.approveMilestone({
      contractId,
      milestoneIndex: "0",
      approver,
    });

    if (!response.unsignedTransaction) {
      throw new Error("No se recibio unsignedTransaction");
    }

    return NextResponse.json({
      success: true,
      unsignedXdr: response.unsignedTransaction,
    });
  } catch (error) {
    console.error("Error approving milestone:", error);

    // If already approved on-chain, treat as success and skip to DB update
    const msg = error instanceof Error ? error.message : "";
    if (msg.includes("already been approved")) {
      return NextResponse.json({
        success: true,
        alreadyApproved: true,
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: msg || "Error al aprobar milestone",
      },
      { status: 500 }
    );
  }
}
