import { NextResponse } from 'next/server';
import { getTrustlessWorkClient } from '@/lib/trustlesswork/client';

export async function POST() {
  try {
    const client = getTrustlessWorkClient();
    
    const response = await client.deploySingleReleaseContract({
      signer: "GB7XVLLHZF62WL5BEMVCP7SXBQBMCUPK74XFDKRUWWZ6QUM5NNV7VQXT",
      engagementId: `test_${Date.now()}`,
      title: "Mi primer trabajo en Brújula",
      description: "Este es un trabajo de prueba",
      roles: {
        approver: "GB7XVLLHZF62WL5BEMVCP7SXBQBMCUPK74XFDKRUWWZ6QUM5NNV7VQXT",
        serviceProvider: "GB7XVLLHZF62WL5BEMVCP7SXBQBMCUPK74XFDKRUWWZ6QUM5NNV7VQXT",
        platformAddress: process.env.BRUJULA_STELLAR_PUBLIC_KEY!,
        releaseSigner: process.env.BRUJULA_STELLAR_PUBLIC_KEY!,
        disputeResolver: process.env.BRUJULA_STELLAR_PUBLIC_KEY!,
        receiver: "GB7XVLLHZF62WL5BEMVCP7SXBQBMCUPK74XFDKRUWWZ6QUM5NNV7VQXT"
      },
      amount: 10,
      platformFee: 0.2, // 2% de 10
      milestones: [
        { description: "Diseñar logo" }
      ],
      trustline: {
        symbol: "USDC",
        address: "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5"
      }
    });

    return NextResponse.json({
      success: true,
      message: "✅ Escrow creado! Ahora necesitas firmarlo con Freighter",
      data: response
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}