import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

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

    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables')
    }

    // Inicializar cliente Supabase com Service Role
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

    // Lê os dados enviados
    const body = await req.json()
    const { 
      email, 
      password,
      name = email.split('@')[0],
      username = email.split('@')[0],
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

    console.log('[create-user-confirmed] Step 1: Creating user in Auth...')
    console.log('[create-user-confirmed] Email:', email, 'Role:', role)

    // Step 1: Criar o usuário no Supabase Auth com Service Role
    // IMPORTANTE: Usar admin API para garantir controle total
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        role,
        email_verified: true
      },
      app_metadata: {
        role
      }
    })

    if (authError || !authData?.user) {
      console.error('[create-user-confirmed] ❌ Auth creation error:', authError?.message || 'Unknown error')
      return new Response(JSON.stringify({ 
        success: false,
        error: authError?.message || "Erro ao criar usuário em Auth",
        details: authError?.message || "Falha na criação do usuário no sistema de autenticação"
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      })
    }

    const userId = authData.user.id
    console.log('[create-user-confirmed] ✅ Auth user created with ID:', userId)
    console.log('[create-user-confirmed] Auth metadata set - role:', role)

    // Step 2: Criar a entrada na tabela `public.users` com o MESMO ID
    // CRÍTICO: Usar o exato ID retornado do auth.uid()
    console.log('[create-user-confirmed] Step 2: Creating user in public.users with ID:', userId)

    const { data: dbData, error: dbError } = await supabase
      .from('users')
      .insert([{
        id: userId, // ← CRÍTICO: Usar o ID exato do auth.users
        email,
        name,
        username,
        whatsapp,
        gender,
        role,
        created_at: new Date().toISOString(),
      }])
      .select()
      .single()

    if (dbError) {
      console.error('[create-user-confirmed] ❌ Database creation error:', dbError.message)
      
      // Se o usuário foi criado em Auth mas não em DB
      if (dbError.code === '23505') {
        console.log('[create-user-confirmed] ⚠️ User already exists in database')
        
        // Tentar buscar o usuário existente
        const { data: existingUser } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single()

        if (existingUser) {
          console.log('[create-user-confirmed] ✅ Using existing user record')
          return new Response(JSON.stringify({
            success: true,
            user: {
              id: existingUser.id,
              email: existingUser.email,
              name: existingUser.name,
              username: existingUser.username,
              whatsapp: existingUser.whatsapp,
              gender: existingUser.gender,
              role: existingUser.role
            },
            message: "Usuário já existia no sistema"
          }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          })
        }
      }
      
      // Se o usuário foi criado em Auth mas não em DB por outro motivo
      console.log('[create-user-confirmed] ⚠️ User created in Auth, but error in DB. Will sync on next login.')
      return new Response(JSON.stringify({
        success: true,
        partial: true,
        message: "Usuário criado em Auth, mas erro ao criar em DB. Será sincronizado no próximo login.",
        user: {
          id: userId,
          email,
          name,
          username,
          whatsapp,
          gender,
          role
        },
        dbError: dbError.message
      }), {
        status: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      })
    }

    console.log('[create-user-confirmed] ✅ User created in public.users successfully')
    console.log('[create-user-confirmed] ID Consistency Check: Auth ID =', userId, ', DB ID =', dbData.id, ', Match:', userId === dbData.id)

    // Verificar consistência de IDs
    if (userId !== dbData.id) {
      console.error('[create-user-confirmed] ❌ ID MISMATCH! Auth ID:', userId, 'DB ID:', dbData.id)
    }

    // Step 3: Retornar sucesso com todos os dados sincronizados
    return new Response(JSON.stringify({
      success: true,
      user: {
        id: dbData.id,
        email: dbData.email,
        name: dbData.name,
        username: dbData.username,
        whatsapp: dbData.whatsapp,
        gender: dbData.gender,
        role: dbData.role,
        created_at: dbData.created_at,
      },
      message: "Usuário criado com sucesso e sincronizado!",
      id_consistency: {
        auth_id: userId,
        db_id: dbData.id,
        match: userId === dbData.id
      }
    }), {
      status: 201,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    })

  } catch (error) {
    console.error('[create-user-confirmed] ❌ Unexpected error:', error.message)
    console.error('[create-user-confirmed] Error type:', error.constructor.name)
    console.error('[create-user-confirmed] Error details:', error)

    return new Response(JSON.stringify({ 
      success: false,
      error: error.message || 'Erro desconhecido ao criar usuário',
      type: error.constructor.name
    }), { 
      status: 500, 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    })
  }
})
