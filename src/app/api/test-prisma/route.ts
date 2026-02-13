import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const sql = getDb();

    // Clean up orphaned 'unknown' txHash records
    const deleted = await sql`
      DELETE FROM "Transaction" WHERE "txHash" = 'unknown'
      RETURNING id
    `;

    // Test basic connection
    const result = await sql`SELECT 1 as connected, current_database() as db, current_user as "user"`;

    // List tables
    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;

    return NextResponse.json({
      success: true,
      message: "Neon conectado correctamente",
      dbInfo: result[0],
      tables: tables.map((t) => t.table_name),
      cleanedUpTransactions: deleted.length,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: String(error),
      },
      { status: 500 }
    );
  }
}
