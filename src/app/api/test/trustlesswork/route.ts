import { NextResponse } from 'next/server';
import { getTrustlessWorkClient } from '@/lib/trustlesswork/client';

export async function GET() {
  try {
    const client = getTrustlessWorkClient();
    
    // Endpoint más simple: Get escrows by role con la wallet de Brújula
    const response = await client.getEscrowsByRole({
      role: 'platformAddress',
      roleAddress: process.env.BRUJULA_STELLAR_PUBLIC_KEY!,
      validateOnChain: false
    });
    
    return NextResponse.json({ 
      success: true, 
      message: '✅ Trustless Work conectado!',
      data: response 
    });
    
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      message: '❌ Error',
      error: error.message 
    }, { status: 500 });
  }
}