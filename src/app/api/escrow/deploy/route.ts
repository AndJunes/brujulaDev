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
    
    const response = await client.deploySingleReleaseEscrow({
      signer: body.signer,
      engagementId: `brujula_${Date.now()}`,
      title: body.title,
      description: body.description,
      roles: {
        approver: body.signer,
        serviceProvider: body.signer,
        platformAddress: process.env.BRUJULA_STELLAR_PUBLIC_KEY!,
        releaseSigner: process.env.BRUJULA_STELLAR_PUBLIC_KEY!,
        disputeResolver: process.env.BRUJULA_STELLAR_PUBLIC_KEY!,
        receiver: body.signer
      },
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
    console.error('❌ Error en deploy:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}