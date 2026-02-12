import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { generateId } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const sql = getDb();

    const { stellarAddress, ...jobData } = body;

    if (!stellarAddress) {
      return NextResponse.json(
        { error: "Wallet no conectada" },
        { status: 400 }
      );
    }

    // Upsert user by stellarAddress
    const existingUsers = await sql`
      SELECT id FROM "User" WHERE "stellarAddress" = ${stellarAddress}
    `;

    let userId: string;

    if (existingUsers.length > 0) {
      userId = existingUsers[0].id;
      await sql`
        UPDATE "User" SET "lastSeenAt" = NOW() WHERE id = ${userId}
      `;
    } else {
      const newId = generateId(25);
      const displayName = `Usuario ${stellarAddress.slice(0, 6)}...`;
      await sql`
        INSERT INTO "User" (id, "stellarAddress", "displayName", role, "createdAt", "lastSeenAt")
        VALUES (${newId}, ${stellarAddress}, ${displayName}, 'EMPLOYER', NOW(), NOW())
      `;
      userId = newId;
    }

    // Generate unique engagementId for Trustless Work
    const engagementId = `brujula_${Date.now()}_${generateId(6)}`;
    const jobId = generateId(25);

    const skillsText = Array.isArray(jobData.skills)
      ? jobData.skills.join(", ")
      : jobData.skills || "";

    await sql`
      INSERT INTO "Job" (
        id, "employerId", "employerAddress", title, description,
        deliverables, requirements, amount, "estimatedDays",
        deadline, status, "engagementId", category, skills, "createdAt"
      ) VALUES (
        ${jobId}, ${userId}, ${stellarAddress}, ${jobData.title},
        ${jobData.description}, ${jobData.deliverables?.join(", ") || ""},
        ${jobData.requirements || ""}, ${jobData.amount}, ${jobData.estimatedDays},
        ${jobData.deadline || null}, 'OPEN', ${engagementId},
        ${jobData.category || ""}, ${skillsText}, NOW()
      )
    `;

    return NextResponse.json({
      success: true,
      jobId,
      engagementId,
    });
  } catch (error) {
    console.error("Error creando job:", error);
    return NextResponse.json(
      { error: "Error al crear el trabajo" },
      { status: 500 }
    );
  }
}
