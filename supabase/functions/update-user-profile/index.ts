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
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    const authHeader = req.headers.get('Authorization')

    console.log('[update-user-profile] Request started:', {
      hasAuthHeader: !!authHeader,
      authHeaderLength: authHeader?.length || 0,
      supabaseUrl: supabaseUrl.substring(0, 30) + '...',
      hasServiceKey: !!serviceKey,
      hasAnonKey: !!anonKey,
    })

    // Extract token from Authorization header (format: "Bearer TOKEN")
    const token = authHeader?.replace('Bearer ', '') || ''

    if (!token) {
      console.error('[update-user-profile] ❌ No auth token provided')
      return new Response(JSON.stringify({
        error: "Token de autenticação não fornecido",
        details: "Header Authorization não contém um token válido"
      }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      })
    }

    console.log('[update-user-profile] Token extracted:', {
      tokenLength: token.length,
      tokenStart: token.substring(0, 20) + '...'
    })

    // Create service role client (can bypass RLS)
    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      }
    })

    // Create auth client to verify user is logged in - pass token in Authorization header
    const supabaseAuth = createClient(supabaseUrl, anonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      }
    })

    // Verify user is authenticated
    console.log('[update-user-profile] Calling auth.getUser()...')
    const { data: { user: authUser }, error: authError } = await supabaseAuth.auth.getUser()

    console.log('[update-user-profile] Auth response:', {
      hasUser: !!authUser,
      userId: authUser?.id,
      userEmail: authUser?.email,
      hasError: !!authError,
      errorMessage: authError?.message,
      errorStatus: authError?.status,
    })

    if (authError || !authUser) {
      console.error('[update-user-profile] ❌ Auth verification failed:', {
        message: authError?.message,
        status: authError?.status,
        hasToken: !!token,
        tokenLength: token.length
      })
      return new Response(JSON.stringify({
        error: "Usuário não autenticado",
        details: authError?.message || "Token inválido ou expirado"
      }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      })
    }

    console.log('[update-user-profile] ✅ User authenticated:', authUser.id)

    let body: any = {}
    try {
      body = await req.json()
    } catch (e) {
      console.error('[update-user-profile] ❌ Failed to parse request JSON:', e.message)
      return new Response(JSON.stringify({
        error: "Falha ao processar solicitação - JSON inválido",
        details: e.message
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      })
    }

    const { id, name, username, email, whatsapp, gender, profile_image_url } = body

    console.log('[update-user-profile] Request received:', {
      hasId: !!id,
      idValue: id,
      fields: Object.keys(body),
      authUserId: authUser.id,
      authEmail: authUser.email,
    })

    // Check if user is an admin by querying the users table
    let isAdmin = false
    const { data: currentUserData } = await supabase
      .from('users')
      .select('role')
      .eq('id', authUser.id)
      .maybeSingle()

    if (currentUserData?.role === 'admin') {
      isAdmin = true
      console.log('[update-user-profile] ✅ User is admin, allowing update of other profiles')
    } else {
      console.log('[update-user-profile] User is not admin, checking ownership')
    }

    // Verify user can only update their own profile (unless they're an admin)
    if (!isAdmin && id !== authUser.id && email !== authUser.email) {
      console.error('[update-user-profile] ❌ Unauthorized update attempt - user is not admin and trying to update different profile')
      return new Response(JSON.stringify({
        error: "Você não tem permissão para atualizar este perfil"
      }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      })
    }

    // Build update object
    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (username !== undefined) updateData.username = username
    if (email !== undefined) updateData.email = email
    if (whatsapp !== undefined) updateData.whatsapp = whatsapp
    if (gender !== undefined) updateData.gender = gender
    if (profile_image_url !== undefined) updateData.profile_image_url = profile_image_url
    updateData.updated_at = new Date().toISOString()

    console.log('[update-user-profile] Updating with data:', Object.keys(updateData))

    // Try to update by ID first (most common case)
    let response = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()

    // If no rows affected and we have an email, try updating by email
    if ((!response.data || response.data.length === 0) && email) {
      console.log('[update-user-profile] ID update returned 0 rows, trying by email:', email)
      response = await supabase
        .from('users')
        .update(updateData)
        .eq('email', email)
        .select()
    }

    if (response.error) {
      console.error('[update-user-profile] Database error:', response.error)
      return new Response(JSON.stringify({ 
        error: "Erro ao atualizar perfil",
        details: response.error.message
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      })
    }

    if (!response.data || response.data.length === 0) {
      console.error('[update-user-profile] Update affected 0 rows')
      return new Response(JSON.stringify({ 
        error: "Usuário não encontrado ou perfil não pode ser atualizado"
      }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      })
    }

    const updatedUser = response.data[0]
    console.log('[update-user-profile] User updated successfully:', updatedUser.id)

    return new Response(JSON.stringify({
      success: true,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        username: updatedUser.username,
        email: updatedUser.email,
        whatsapp: updatedUser.whatsapp,
        gender: updatedUser.gender,
        profileImage: updatedUser.profile_image_url,
        role: updatedUser.role
      },
      message: "Perfil atualizado com sucesso!"
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    })

  } catch (error) {
    console.error('[update-user-profile] Error:', error.message)
    return new Response(JSON.stringify({ 
      error: error.message,
      type: error.constructor.name
    }), { 
      status: 500, 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    })
  }
})
