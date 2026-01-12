import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  // Configuração de CORS
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  }

  // Responde ao Preflight do navegador
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    // Lê os dados enviados
    const body = await req.json()
    const { 
      email, 
      password,
      name = email.split('@')[0], // Default: parte antes do @
      username = email.split('@')[0], // Default: parte antes do @
      whatsapp = '',
      gender = 'Outro',
      role = 'client'
    } = body

    if (!email || !password) {
      return new Response(JSON.stringify({ error: "E-mail e senha são obrigatórios" }), { 
        status: 400, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      })
    }

    console.log('[create-user-confirmed] Creating user:', { email, name, username, role })

    // Step 1: Criar o usuário no Supabase Auth
    const authResponse = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'apikey': SERVICE_ROLE_KEY
      },
      body: JSON.stringify({
        email,
        password,
        email_confirm: true,
        user_metadata: { role }
      })
    })

    const authResult = await authResponse.json()

    if (!authResponse.ok || !authResult.user) {
      console.error('[create-user-confirmed] Auth error:', authResult)
      return new Response(JSON.stringify({ 
        error: authResult.error_description || authResult.message || "Erro ao criar usuário em Auth",
        details: authResult
      }), {
        status: authResponse.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      })
    }

    const userId = authResult.user.id
    console.log('[create-user-confirmed] Auth user created:', userId)

    // Step 2: Criar a entrada na tabela `users`
    const dbResponse = await fetch(`${SUPABASE_URL}/rest/v1/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'apikey': SERVICE_ROLE_KEY,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        id: userId,
        email,
        name,
        username,
        whatsapp,
        gender,
        role
      })
    })

    const dbResult = await dbResponse.json()

    if (!dbResponse.ok) {
      console.error('[create-user-confirmed] Database error:', dbResult)
      
      // Se o usuário foi criado em Auth mas não em DB, retorna sucesso parcial
      // (o próximo login vai sincronizar)
      return new Response(JSON.stringify({
        success: true,
        partial: true,
        message: "Usuário criado em Auth, mas erro ao criar em DB. Será sincronizado no próximo login.",
        user: authResult.user,
        dbError: dbResult
      }), {
        status: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      })
    }

    console.log('[create-user-confirmed] User created successfully:', { userId, email, name })

    return new Response(JSON.stringify({
      success: true,
      user: {
        id: userId,
        email,
        name,
        username,
        whatsapp,
        gender,
        role
      },
      message: "Usuário criado com sucesso!"
    }), {
      status: 201,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    })

  } catch (error) {
    console.error('[create-user-confirmed] Error:', error.message)
    return new Response(JSON.stringify({ 
      error: error.message,
      type: error.constructor.name
    }), { 
      status: 500, 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    })
  }
})
