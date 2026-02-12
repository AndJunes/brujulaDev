import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateId } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validar que el usuario tiene wallet conectada
    const { stellarAddress, ...jobData } = body;
    
    if (!stellarAddress) {
      return NextResponse.json(
        { error: "Wallet no conectada" },
        { status: 400 }
      );
    }

    // Buscar o crear usuario por stellarAddress
    const user = await prisma.user.upsert({
      where: { stellarAddress },
      update: { lastSeenAt: new Date() },
      create: {
        stellarAddress,
        displayName: `Usuario ${stellarAddress.slice(0, 6)}...`,
        role: "EMPLOYER",
      },
    });

    // Generar engagementId único para Trustless Work
    const engagementId = `brujula_${Date.now()}_${generateId(6)}`;

    // Crear el trabajo en estado DRAFT
    const job = await prisma.job.create({
      data: {
        employerId: user.id,
        employerAddress: stellarAddress,
        title: jobData.title,
        description: jobData.description,
        deliverables: jobData.deliverables,
        requirements: jobData.requirements,
        amount: jobData.amount,
        estimatedDays: jobData.estimatedDays,
        deadline: jobData.deadline || null,
        status: "DRAFT",
        engagementId,
      },
    });

    return NextResponse.json({
      success: true,
      jobId: job.id,
      engagementId: job.engagementId,
    });

  } catch (error) {
    console.error("Error creando job:", error);
    return NextResponse.json(
      { error: "Error al crear el trabajo" },
      { status: 500 }
    );
  }
}