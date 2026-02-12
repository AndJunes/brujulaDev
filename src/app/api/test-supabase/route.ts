import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  console.log("🧪 Test Supabase directo");
  
  try {
    // Usar la URL y anon key de Supabase
    const supabaseUrl = 'https://aws-0-americas.pooler.supabase.com';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJydWp1bGEiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTczOTQ1MjYwMCwiZXhwIjoyMDU1MDI4NjAwfQ.4Z3X8Z3X8Z3X8Z3X8Z3X8Z3X8Z3X8Z3X8Z3X8Z3X8Z3A';
    
    console.log("📡 Conectando a Supabase...");
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Intentar consultar la tabla User
    const { data, error, count } = await supabase
      .from('User')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error("❌ Error de Supabase:", error);
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error
      }, { status: 500 });
    }
    
    console.log("✅ Supabase conectado! Total usuarios:", count);
    
    return NextResponse.json({
      success: true,
      message: "✅ Supabase conectado correctamente",
      userCount: count
    });
    
  } catch (error) {
    console.error("❌ Error inesperado:", error);
    return NextResponse.json({
      success: false,
      error: String(error)
    }, { status: 500 });
  }
}