import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const sql = getDb();
    const { searchParams } = new URL(request.url);
    const stellarAddress = searchParams.get("stellarAddress");

    if (!stellarAddress) {
      return NextResponse.json({ error: "Se requiere stellarAddress" }, { status: 400 });
    }

    const users = await sql`
      SELECT id FROM "User" WHERE "stellarAddress" = ${stellarAddress}
    `;

    if (users.length === 0) {
      return NextResponse.json({ userId: null });
    }

    return NextResponse.json({ userId: users[0].id });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Error al obtener usuario" },
      { status: 500 }
    );
  }
}
