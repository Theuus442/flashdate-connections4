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
    if (authError || !authUser) {
      console.error('[update-user-profile] Auth error:', authError?.message || 'Token inválido')
      throw new Error("Não autorizado ou token inválido")
    }

    console.log('[update-user-profile] Request authorized for user:', authUser.id)

    const body = await req.json()
    const targetId = body.id || authUser.id

    console.log('[update-user-profile] Updating user:', targetId, 'with fields:', Object.keys(body).filter(k => k !== 'id'))

    // 2. Atualizar a tabela PUBLIC.USERS primeiro
    const updateData: any = {}
    if (body.name !== undefined) updateData.name = body.name
    if (body.username !== undefined) updateData.username = body.username
    if (body.email !== undefined) updateData.email = body.email
    if (body.whatsapp !== undefined) updateData.whatsapp = body.whatsapp
    if (body.gender !== undefined) updateData.gender = body.gender
    if (body.role !== undefined) updateData.role = body.role
    if (body.profile_image_url !== undefined) updateData.profile_image_url = body.profile_image_url
    updateData.updated_at = new Date().toISOString()

    console.log('[update-user-profile] Step 1: Updating public.users table with:', Object.keys(updateData))

    const { data: publicUser, error: pError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', targetId)
      .select()
      .single()

    if (pError) {
      console.error('[update-user-profile] Error updating public.users table:', pError.message)
      throw new Error(`Erro ao atualizar tabela users: ${pError.message}`)
    }

    console.log('[update-user-profile] ✅ public.users updated successfully')

    // 3. Atualizar o AUTHENTICATION via admin API (OBRIGATÓRIO)
    // Sincronizar dados em BOTH user_metadata e app_metadata para RLS
    console.log('[update-user-profile] Step 2: Updating auth metadata with admin API')

    const authUpdatePayload: any = {}
    
    // Preparar user_metadata com todos os campos relevantes
    const userMetadata: any = {}
    if (body.name !== undefined) userMetadata.name = body.name
    if (body.email !== undefined) userMetadata.email = body.email
    // Sempre incluir role no user_metadata
    userMetadata.role = publicUser.role || 'client'
    userMetadata.email_verified = true

    // Preparar app_metadata com role (essencial para RLS funcionando via JWT)
    const appMetadata: any = {
      role: publicUser.role || 'client'
    }

    authUpdatePayload.user_metadata = userMetadata
    authUpdatePayload.app_metadata = appMetadata

    // Se email foi alterado, tentar atualizar no auth também
    if (body.email !== undefined && body.email !== publicUser.email) {
      console.log('[update-user-profile] Email change detected, updating in auth...')
      authUpdatePayload.email = body.email
    }

    console.log('[update-user-profile] Auth update payload:', {
      has_email: !!authUpdatePayload.email,
      user_metadata_keys: Object.keys(userMetadata),
      app_metadata_keys: Object.keys(appMetadata)
    })

    const { data: authUpdate, error: aError } = await supabase.auth.admin.updateUserById(targetId, authUpdatePayload)

    if (aError) {
      console.error('[update-user-profile] ⚠️ Warning: Failed to sync auth metadata:', aError.message)
      console.log('[update-user-profile] Continuing anyway since public.users was already updated')
      // NÃO lançamos erro aqui - a tabela pública já foi alterada com sucesso
      // Apenas registramos o aviso
    } else {
      console.log('[update-user-profile] ✅ Auth metadata synced successfully')
      console.log('[update-user-profile] Updated auth user metadata:', {
        user_metadata: authUpdate?.user?.user_metadata,
        app_metadata: authUpdate?.user?.app_metadata
      })
    }

    // 4. Retornar resposta com dados sincronizados
    const responseData = {
      success: true,
      message: "Perfil sincronizado com sucesso!",
      user: {
        id: publicUser.id,
        email: publicUser.email,
        name: publicUser.name,
        username: publicUser.username,
        whatsapp: publicUser.whatsapp,
        gender: publicUser.gender,
        role: publicUser.role,
        profile_image_url: publicUser.profile_image_url,
        created_at: publicUser.created_at,
        updated_at: publicUser.updated_at,
      },
      auth_sync: {
        synced: !aError,
        error: aError?.message || null
      }
    }

    console.log('[update-user-profile] ✅ Returning success response')

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    })

  } catch (error: any) {
    console.error(`[update-user-profile] ❌ ERROR 500:`, error.message)
    console.error('[update-user-profile] Error details:', error)
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Erro desconhecido ao atualizar perfil',
      details: "Verifique se o ID do usuário existe em ambas as tabelas (auth.users e public.users)."
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    })
  }
})
