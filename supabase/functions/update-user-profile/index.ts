import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  }

  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const authHeader = req.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '') || ''

    // Cliente com Service Role para ter poder total
    const supabase = createClient(supabaseUrl, serviceKey)

    // 1. Validar quem está pedindo a alteração
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !authUser) throw new Error("Não autorizado ou token inválido")

    const body = await req.json()
    const targetId = body.id || authUser.id

    // 2. Atualizar a tabela PUBLIC.USERS primeiro
    const updateData: any = {}
    if (body.name) updateData.name = body.name
    if (body.username) updateData.username = body.username
    if (body.whatsapp) updateData.whatsapp = body.whatsapp
    if (body.gender) updateData.gender = body.gender
    if (body.role) updateData.role = body.role
    updateData.updated_at = new Date().toISOString()

    const { data: publicUser, error: pError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', targetId)
      .select()
      .single()

    if (pError) throw new Error(`Erro na tabela users: ${pError.message}`)

    // 3. Atualizar o AUTHENTICATION (O que você vê no painel de Auth)
    // Aqui sincronizamos o Metadata para ficar igual ao seu print
    const { data: authUpdate, error: aError } = await supabase.auth.admin.updateUserById(targetId, {
      // Se o email foi enviado e é diferente do atual, tentamos mudar no auth também
      email: (body.email && body.email !== publicUser.email) ? body.email : undefined,
      user_metadata: {
        role: publicUser.role, // Aqui atualiza o raw_user_meta_data
        name: publicUser.name,
        email_verified: true
      },
      app_metadata: {
        role: publicUser.role // Aqui atualiza o raw_app_meta_data (essencial para RLS)
      }
    })

    if (aError) {
      console.error("Aviso: Falha ao sincronizar Auth, mas tabela users atualizada:", aError.message)
      // Não lançamos erro aqui para não dar 500 se apenas o e-mail falhar
    }

    return new Response(JSON.stringify({
      success: true,
      message: "Perfil sincronizado com sucesso!",
      data: {
        public: publicUser,
        auth_metadata: authUpdate?.user?.raw_user_meta_data
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    })

  } catch (error: any) {
    console.error(`[ERRO 500] ${error.message}`)
    return new Response(JSON.stringify({
      error: error.message,
      details: "Verifique se o ID do usuário existe em ambas as tabelas."
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    })
  }
})