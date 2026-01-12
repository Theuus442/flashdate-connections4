/**
   * Update user - Uses Edge Function to bypass RLS policies
   */
  async updateUser(id: string, updates: Partial<User>, profileImage?: File): Promise<{ data: User | null; error: any }> {
    if (!isSupabaseConfigured()) {
      return { data: null, error: 'Supabase not configured' };
    }

    try {
      console.log('[usersService] Updating user via Edge Function:', { id, email: updates.email });
      let profileImageUrl: string | undefined;

      // Upload profile image if provided
      if (profileImage) {
        console.log('[usersService] Uploading profile image for user:', id);
        const result = await storageService.uploadUserProfileImage(id, profileImage);
        if (result.error) {
          console.error('[usersService] Error uploading profile image:', result.error);
          throw result.error;
        }
        profileImageUrl = result.data;
        console.log('[usersService] Profile image uploaded:', profileImageUrl);
      }

      // If password is being updated, update it in auth system first
      if (updates.password && updates.password.trim()) {
        console.log('[usersService] Updating password in auth system...');
        const authResult = await authService.updateUserPasswordAsAdmin(id, updates.password);
        if (authResult.error) {
          const errorMsg = authResult.error instanceof Error
            ? authResult.error.message
            : JSON.stringify(authResult.error);
          console.warn('[usersService] Could not update password via auth API:', errorMsg);
          // Don't throw error - password update is secondary, continue with other updates
        }
      } else if (updates.password === '') {
        // Empty password means don't update password - remove from updates
        console.log('[usersService] Password field is empty, skipping password update');
      }

      const updateData: any = {};
      if (updates.name) updateData.name = updates.name;
      if (updates.username) updateData.username = updates.username;
      if (updates.email) updateData.email = updates.email;
      if (updates.whatsapp) updateData.whatsapp = updates.whatsapp;
      if (updates.gender) updateData.gender = updates.gender;
      if (updates.role) updateData.role = updates.role;
      if (profileImageUrl) updateData.profile_image_url = profileImageUrl;

      console.log('[usersService] Calling Edge Function to update user:', {
        userId: id,
        fields: Object.keys(updateData).length
      });

      // Call Edge Function with SERVICE_ROLE permissions (bypasses RLS)
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
      const functionUrl = `${supabaseUrl}/functions/v1/update-user-profile`;

      // Get auth token from Supabase client
      const { data: { session } } = await supabase.auth.getSession();
      const authToken = session?.access_token;

      if (!authToken) {
        console.error('[usersService] No auth token available');
        throw new Error('Sessao expirada. Faca login novamente.');
      }

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
          'apikey': anonKey,
        },
        body: JSON.stringify({
          id,
          ...updateData
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMessage = result.error || `HTTP ${response.status}`;
        console.error('[usersService] Edge Function error:', {
          status: response.status,
          message: errorMessage,
          details: result.details
        });
        throw new Error(result.details || errorMessage || 'Falha ao atualizar perfil');
      }

      if (!result.user) {
        console.error('[usersService] Edge Function returned no user data');
        throw new Error('Falha ao atualizar perfil - nenhum dado retornado');
      }

      const transformedData: User = {
        id: result.user.id,
        name: result.user.name,
        username: result.user.username,
        email: result.user.email,
        whatsapp: result.user.whatsapp,
        gender: result.user.gender,
        role: result.user.role || 'client',
        profileImage: result.user.profileImage,
      };

      console.log('[usersService] User updated successfully via Edge Function');
      return { data: transformedData, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : (typeof error === 'object' && error !== null ? JSON.stringify(error) : String(error));
      console.error('[usersService] Error updating user:', errorMessage);
      return { data: null, error: errorMessage };
    }
  },