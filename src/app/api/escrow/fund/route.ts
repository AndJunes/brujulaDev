import { NextResponse } from "next/server";
import { getTrustlessWorkClient } from "@/lib/trustlesswork/client";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { contractId, amount, signer } = body;

    if (!contractId || !amount || !signer) {
      return NextResponse.json(
        { error: "Faltan campos requeridos: contractId, amount, signer" },
        { status: 400 }
      );
    }

    const client = getTrustlessWorkClient();

    const response = await client.fundEscrow({
      contractId,
      amount,
      signer,
    });

    if (!response.unsignedTransaction) {
      throw new Error("No se recibio unsignedTransaction para fondeo");
    }

    return NextResponse.json({
      success: true,
      unsignedXdr: response.unsignedTransaction,
    });
  } catch (error) {
    console.error("Error funding escrow:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error al fondear escrow",
      },
      { status: 500 }
    );
  }
}
