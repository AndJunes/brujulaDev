import { NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client';

export async function GET() {
  console.log("🧪 Test Prisma directo");
  console.log("📂 Directorio actual:", process.cwd());
  
  let prisma = null;
  
  try {
    // Verificar variables de entorno
    console.log("🔑 DATABASE_URL existe?", !!process.env.DATABASE_URL);
    console.log("🔑 DIRECT_URL existe?", !!process.env.DIRECT_URL);
    
    if (!process.env.DIRECT_URL) {
      throw new Error("DIRECT_URL no está definida");
    }
    
    // Crear cliente con la DIRECT_URL
    // Temporarily override DATABASE_URL for this connection
    const originalDatabaseUrl = process.env.DATABASE_URL;
    process.env.DATABASE_URL = process.env.DIRECT_URL;
    
    prisma = new PrismaClient();
    
    // Restore original DATABASE_URL
    if (originalDatabaseUrl) {
      process.env.DATABASE_URL = originalDatabaseUrl;
    }
    
    console.log("🔄 Conectando a PostgreSQL...");
    await prisma.$connect();
    console.log("✅ Conectado!");
    
    // Probar query simple
    const result = await prisma.$queryRaw`SELECT 1 as connected, current_database() as db, current_user as user`;
    console.log("✅ Query exitosa:", result);
    
    // Listar tablas
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log("📊 Tablas encontradas:", tables);
    
    return NextResponse.json({
      success: true,
      message: "✅ Prisma conectado correctamente",
      dbInfo: result,
      tables: tables
    });
    
  } catch (error) {
    console.error("❌ Error:", error);
    return NextResponse.json({
      success: false,
      error: String(error),
      errorDetails: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : error
    }, { status: 500 });
    
  } finally {
    if (prisma) {
      await prisma.$disconnect();
      console.log("👋 Desconectado");
    }
  }
}