import { NextResponse } from 'next/server';
import { getTrustlessWorkClient } from '@/lib/trustlesswork/client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const client = getTrustlessWorkClient();
    
    console.log('📦 Enviando a Trustless Work:', {
      signer: body.signer,
      engagementId: `brujula_${Date.now()}`,
      amount: body.amount
    });
    
    // Use roles from body if provided, otherwise default to signer for all
    // Always override platform-related roles with server-side env var
    const platformAddress = process.env.BRUJULA_STELLAR_PUBLIC_KEY!;
    const roles = body.roles
      ? {
          approver: body.roles.approver,
          serviceProvider: body.roles.serviceProvider,
          platformAddress,
          releaseSigner: platformAddress,
          disputeResolver: platformAddress,
          receiver: body.roles.receiver,
        }
      : {
          approver: body.signer,
          serviceProvider: body.signer,
          platformAddress,
          releaseSigner: platformAddress,
          disputeResolver: platformAddress,
          receiver: body.signer,
        };

    const response = await client.deploySingleReleaseEscrow({
      signer: body.signer,
      engagementId: `brujula_${Date.now()}`,
      title: body.title,
      description: body.description,
      roles,
      amount: body.amount,
      platformFee: body.platformFee || 0,
      milestones: body.milestones || [{ description: "Entregar trabajo" }],
      trustline: {
        symbol: "USDC",
        address: process.env.USDC_ISSUER_ADDRESS!
      }
    });

    // ✅ Ahora response TIENE que tener xdr y status
    return NextResponse.json({
      success: true,
      unsignedXdr: response.unsignedXdr,
      status: response.status
    });

  } catch (error: any) {
    console.error('Error en deploy:', error);

    // Friendly error for missing USDC trustline
    let errorMessage = error.message;
    if (errorMessage?.includes("does not have the required asset")) {
      errorMessage = "El freelancer no tiene USDC configurado en su wallet de Stellar. Debe agregar la trustline de USDC en Freighter antes de poder ser asignado.";
    }

    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 500 });
  }
}