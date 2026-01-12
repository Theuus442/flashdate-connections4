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
    const authHeader = req.headers.get('Authorization')

    // Create service role client (can bypass RLS)
    const supabase = createClient(supabaseUrl, serviceKey)

    // Create auth client to verify user is logged in
    const supabaseAuth = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
      global: {
        headers: {
          Authorization: authHeader || ''
        }
      }
    })

    // Verify user is authenticated
    const { data: { user: authUser }, error: authError } = await supabaseAuth.auth.getUser()
    
    if (authError || !authUser) {
      console.error('[update-user-profile] Auth error:', authError?.message)
      return new Response(JSON.stringify({ 
        error: "Usuário não autenticado",
        details: authError?.message
      }), { 
        status: 401, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      })
    }

    const { id, name, username, email, whatsapp, gender, profile_image_url } = await req.json()

    console.log('[update-user-profile] Request:', {
      userId: id,
      authUserId: authUser.id,
      authEmail: authUser.email,
      updateEmail: email
    })

    // Verify user can only update their own profile (unless they're updating by email that matches their auth email)
    if (id !== authUser.id && email !== authUser.email) {
      console.error('[update-user-profile] Unauthorized update attempt')
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
