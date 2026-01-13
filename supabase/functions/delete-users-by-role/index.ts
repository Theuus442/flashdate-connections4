import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  }

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, serviceKey)

    const { role } = await req.json()

    if (!role || (role !== "admin" && role !== "client")) {
      return new Response(JSON.stringify({ error: "Role invalida" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      })
    }

    console.log(`Iniciando exclusao de usuarios com role: ${role}`)

    // 1. Buscar os IDs na tabela pública
    const { data: users, error: fetchError } = await supabase
      .from("users")
      .select("id")
      .eq("role", role)

    if (fetchError) throw fetchError
    if (!users || users.length === 0) {
      return new Response(JSON.stringify({ message: "Nenhum usuario encontrado" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      })
    }

    const userIds = users.map(u => u.id)
    let deletedCount = 0

    // 2. Loop para deletar do Auth (Obrigatário para limpeza real)
    // O deleteUser remove o usuario do sistema de login permanentemente
    for (const id of userIds) {
      const { error: authErr } = await supabase.auth.admin.deleteUser(id)
      if (!authErr) deletedCount++
      
      // O Supabase deleta automaticamente da public.users se houver CASCADE, 
      // caso contrario, deletamos manualmente abaixo:
      await supabase.from("users").delete().eq("id", id)
    }

    return new Response(JSON.stringify({
      count: deletedCount,
      message: `Sucesso! ${deletedCount} usuarios removidos.`,
      role_afetada: role
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    })

  } catch (error) {
    console.error("Erro na funcao:", error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    })
  }
})
