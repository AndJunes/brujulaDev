import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const sql = getDb();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Se requiere userId" }, { status: 400 });
    }

    const notifications = await sql`
      SELECT * FROM "Notification"
      WHERE "userId" = ${userId}
      ORDER BY "createdAt" DESC
      LIMIT 20
    `;

    const unreadCount = await sql`
      SELECT COUNT(*) as count FROM "Notification"
      WHERE "userId" = ${userId} AND read = false
    `;

    return NextResponse.json({
      notifications,
      unreadCount: Number(unreadCount[0]?.count || 0),
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Error al obtener notificaciones" },
      { status: 500 }
    );
  }
}
