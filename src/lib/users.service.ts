import { supabase, isSupabaseConfigured } from './supabase';
import { User } from '@/context/UsersContext';
import { storageService } from './storage.service';
import { authService } from './auth.service';

export const usersService = {
  /**
   * Sync user from Auth to Database if missing
   * Creates a database record for an auth user that doesn't exist in DB
   */
  async syncAuthUserToDatabase(authUser: { id: string; email: string; user_metadata?: any }): Promise<{ data: User | null; error: any }> {
    if (!isSupabaseConfigured()) {
      return { data: null, error: 'Supabase not configured' };
    }

    try {
      console.log('[usersService] Attempting to sync auth user to database:', authUser.email);

      // Extract metadata from auth user
      const name = authUser.user_metadata?.name || authUser.email.split('@')[0];
      const username = authUser.user_metadata?.username || authUser.email.split('@')[0];

      // Try to insert user record
      const { data, error } = await supabase
        .from('users')
        .insert([{
          id: authUser.id,
          email: authUser.email,
          name,
          username,
          whatsapp: '',
          gender: 'Outro',
          role: 'client',
          created_at: new Date().toISOString(),
        }])
        .select();

      if (error) {
        // If it's a duplicate key error, the user already exists - that's fine
        if (error.code === '23505') {
          console.log('[usersService] User already exists in database');
          // Try to fetch existing user
          return this.getUserById(authUser.id);
        }

        const errorMessage = error instanceof Error
          ? error.message
          : (error?.message || JSON.stringify(error));
        console.error('[usersService] Error syncing user:', {
          message: errorMessage,
          code: error?.code,
          details: error?.details,
        });
        throw error;
      }

      if (!data || data.length === 0) {
        throw new Error('Failed to sync user - no data returned');
      }

      const userData = data[0];
      const transformedData: User = {
        id: userData.id,
        name: userData.name,
        username: userData.username,
        email: userData.email,
        whatsapp: userData.whatsapp,
        gender: userData.gender,
        role: userData.role || 'client',
        profileImage: userData.profile_image_url,
      };

      console.log('[usersService] User synced to database successfully:', transformedData);
      return { data: transformedData, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : (typeof error === 'object' && error !== null ? JSON.stringify(error) : String(error));
      console.error('[usersService] Error syncing auth user:', errorMessage);
      return { data: null, error };
    }
  },

  /**
   * Get all users
   */
  async getUsers(): Promise<{ data: User[] | null; error: any }> {
    if (!isSupabaseConfigured()) {
      return { data: null, error: 'Supabase not configured' };
    }

    try {
      console.log('[usersService] Fetching users from Supabase...');
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[usersService] Supabase error:', error);
        throw error;
      }

      console.log('[usersService] Successfully fetched users, count:', data?.length || 0);

      const transformedData = data?.map((user: any) => ({
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        whatsapp: user.whatsapp,
        gender: user.gender,
        role: user.role || 'client',
        profileImage: user.profile_image_url,
        password: user.password,
      }));

      return { data: transformedData || [], error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('[usersService] Error fetching users:', {
        message: errorMessage,
        type: error instanceof TypeError ? 'Network/Fetch Error' : 'Other Error',
        error,
      });

      // Check if it's a network error
      if (error instanceof TypeError && errorMessage.includes('Failed to fetch')) {
        console.error('[usersService] Network error detected - Supabase may be unreachable from this environment');
      }

      return { data: null, error };
    }
  },

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<{ data: User | null; error: any }> {
    if (!isSupabaseConfigured()) {
      return { data: null, error: 'Supabase not configured' };
    }

    try {
      console.log('[usersService] Fetching user by ID:', id);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        const errorMessage = error instanceof Error
          ? error.message
          : (error?.message || JSON.stringify(error));
        console.error('[usersService] Supabase error fetching user by ID:', {
          userId: id,
          message: errorMessage,
          code: error?.code,
          details: error?.details,
          hint: error?.hint,
        });
        throw error;
      }

      // If user found in database, return it
      if (data) {
        const transformedData: User = {
          id: data.id,
          name: data.name,
          username: data.username,
          email: data.email,
          whatsapp: data.whatsapp,
          gender: data.gender,
          role: data.role || 'client',
          profileImage: data.profile_image_url,
          password: data.password,
        };
        console.log('[usersService] Successfully fetched user from database by ID:', id);
        return { data: transformedData, error: null };
      }

      // If user not found by ID, return null (caller will try fallback by email)
      console.log('[usersService] User not found by ID, will try email fallback:', id);
      return { data: null, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : (typeof error === 'object' && error !== null ? JSON.stringify(error) : String(error));
      console.error('[usersService] Error in getUserById:', {
        userId: id,
        message: errorMessage,
        error,
      });
      return { data: null, error };
    }
  },

  /**
   * Get user by email - useful when IDs don't match between Auth and DB
   */
  async getUserByEmail(email: string): Promise<{ data: User | null; error: any }> {
    if (!isSupabaseConfigured()) {
      return { data: null, error: 'Supabase not configured' };
    }

    try {
      console.log('[usersService] Fetching user by email:', email);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (error) {
        const errorMessage = error instanceof Error
          ? error.message
          : (error?.message || JSON.stringify(error));
        console.error('[usersService] Supabase error fetching user by email:', {
          email,
          message: errorMessage,
          code: error?.code,
          details: error?.details,
          hint: error?.hint,
        });
        throw error;
      }

      // If user found in database, return it
      if (data) {
        const transformedData: User = {
          id: data.id,
          name: data.name,
          username: data.username,
          email: data.email,
          whatsapp: data.whatsapp,
          gender: data.gender,
          role: data.role || 'client',
          profileImage: data.profile_image_url,
          password: data.password,
        };
        console.log('[usersService] Successfully fetched user from database by email:', email);
        return { data: transformedData, error: null };
      }

      // If user not found by email
      console.warn('[usersService] User not found by email:', email);
      return { data: null, error: 'User not found in database' };
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : (typeof error === 'object' && error !== null ? JSON.stringify(error) : String(error));
      console.error('[usersService] Error in getUserByEmail:', {
        email,
        message: errorMessage,
        error,
      });
      return { data: null, error };
    }
  },

  /**
   * Create new user - creates user in both database and authentication
   */
  async createUser(user: Omit<User, 'id'>, profileImage?: File): Promise<{ data: User | null; error: any }> {
    if (!isSupabaseConfigured()) {
      console.error('[usersService] Supabase not configured');
      return { data: null, error: 'Supabase not configured' };
    }

    try {
      console.log('[usersService] Creating user:', user);
      let profileImageUrl: string | undefined;
      let userId = crypto.randomUUID();

      // Create auth user if password provided (Edge Function handles both Auth and DB)
      if (user.password && user.password.trim()) {
        console.log('[usersService] Creating auth user with Edge Function...');
        const authResult = await authService.createUserAsAdmin(
          user.email,
          user.password.trim(),
          user.name,
          user.username,
          user.whatsapp,
          user.gender
        );
        if (authResult.error) {
          const errorMsg = authResult.error instanceof Error
            ? authResult.error.message
            : JSON.stringify(authResult.error);
          console.error('[usersService] Error creating auth user:', errorMsg);
          // Don't throw - auth creation is secondary, we can still create user in DB
          console.log('[usersService] Continuing with database creation despite auth error');
        } else if (authResult.data?.id) {
          // Use the ID from Auth to keep them in sync
          userId = authResult.data.id;
          console.log('[usersService] Auth user created, using ID:', userId);
        }
      }

      // Upload profile image if provided
      if (profileImage) {
        console.log('[usersService] Uploading profile image...');
        const result = await storageService.uploadUserProfileImage(userId, profileImage);
        if (result.error) throw result.error;
        profileImageUrl = result.data;
        console.log('[usersService] Image uploaded:', profileImageUrl);
      }

      console.log('[usersService] Inserting user into database with data:', {
        name: user.name,
        username: user.username,
        email: user.email,
        whatsapp: user.whatsapp,
        gender: user.gender,
        role: user.role || 'client',
        hasImage: !!profileImageUrl,
      });

      // Create user in database
      const { data, error } = await supabase
        .from('users')
        .insert([{
          id: userId,
          name: user.name,
          username: user.username,
          email: user.email,
          whatsapp: user.whatsapp,
          gender: user.gender,
          role: user.role || 'client',
          profile_image_url: profileImageUrl,
          created_at: new Date().toISOString(),
        }])
        .select();

      if (error) {
        let errorMsg = error instanceof Error
          ? error.message
          : (error?.message || JSON.stringify(error));

        // Provide better error messages for common issues
        if (error?.code === '23505') {
          if (errorMsg.includes('username')) {
            errorMsg = 'Este apelido (username) já existe. Escolha outro apelido único.';
          } else if (errorMsg.includes('email')) {
            errorMsg = 'Este email já está cadastrado.';
          } else {
            errorMsg = 'Dados duplicados. Verifique se apelido ou email já existem.';
          }
        }

        console.error('[usersService] Database insert error:', {
          message: errorMsg,
          code: error?.code,
          details: error?.details,
          hint: error?.hint,
        });
        throw new Error(errorMsg);
      }

      console.log('[usersService] Insert result:', { hasData: !!data, dataLength: data?.length });

      if (!data || data.length === 0) {
        throw new Error('Failed to insert user - no data returned');
      }

      const userData = data[0];
      const transformedData: User = {
        id: userData.id,
        name: userData.name,
        username: userData.username,
        email: userData.email,
        whatsapp: userData.whatsapp,
        gender: userData.gender,
        role: userData.role || 'client',
        profileImage: userData.profile_image_url,
      };

      console.log('[usersService] User created successfully:', transformedData);
      return { data: transformedData, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : (typeof error === 'object' && error !== null ? JSON.stringify(error) : String(error));
      console.error('[usersService] Error creating user:', errorMessage);
      return { data: null, error };
    }
  },

  /**
   * Update user
   */
  async updateUser(id: string, updates: Partial<User>, profileImage?: File): Promise<{ data: User | null; error: any }> {
    if (!isSupabaseConfigured()) {
      return { data: null, error: 'Supabase not configured' };
    }

    try {
      console.log('[usersService] Updating user:', { id, email: updates.email });
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

      const userData: any = result.user;
      if (!userData) {
        console.error('[usersService] No user data in Edge Function response');
        throw new Error('Nenhum dado de usuario retornado');
        console.warn('[usersService] Update affected 0 rows for ID:', id);
        console.warn('[usersService] User ID:', id, 'Email:', updates.email);

        if (!updates.email) {
          console.error('[usersService] No email provided for fallback update');
          throw new Error(`Usuário com ID ${id} não foi encontrado. Verifique sua conexão com o servidor.`);
        }

        // First, let's check if user exists by email
        const { data: existingUser } = await supabase
          .from('users')
          .select('id, email')
          .eq('email', updates.email)
          .maybeSingle();

        if (!existingUser) {
          console.error('[usersService] User not found with email:', updates.email);
          console.warn('[usersService] Attempting to sync user from Auth to Database...');

          // Try to sync the user from Auth system
          const syncResult = await this.syncAuthUserToDatabase({
            id,
            email: updates.email,
            user_metadata: {
              name: updates.name,
              username: updates.username,
            }
          });

          if (syncResult.error) {
            const syncErrorMsg = syncResult.error instanceof Error
              ? syncResult.error.message
              : (typeof syncResult.error === 'object' ? JSON.stringify(syncResult.error) : String(syncResult.error));
            console.error('[usersService] Sync failed:', syncErrorMsg);
            throw new Error(`Usuário não encontrado. Erro ao sincronizar: ${syncErrorMsg}`);
          }

          if (!syncResult.data) {
            throw new Error(`Falha ao sincronizar usuário ${updates.email} com o banco de dados.`);
          }

          console.log('[usersService] User synced successfully, retrying update...');
          // Retry the update with synced user (use validId to ensure we have the right ID)
          const { data: retryData, error: retryError } = await supabase
            .from('users')
            .update(updateData)
            .eq('id', validId)
            .select();

          if (retryError || !retryData || retryData.length === 0) {
            throw new Error(`Falha ao salvar dados após sincronização.`);
          }

          userData = retryData[0];
          console.log('[usersService] User updated successfully after sync');
        } else {
          // User exists with email, update by email
          console.log('[usersService] User found by email, preparing to update:', {
            email: updates.email,
            existingUserId: existingUser?.id,
            updateDataFields: Object.keys(updateData),
            updateDataValues: updateData,
          });

          const { data: emailUpdateData, error: emailUpdateError } = await supabase
            .from('users')
            .update(updateData)
            .eq('email', updates.email)
            .select();

          if (emailUpdateError) {
            const emailErrorMsg = emailUpdateError instanceof Error
              ? emailErrorError.message
              : (emailUpdateError?.message || 'Erro desconhecido');
            console.error('[usersService] Email-based update error response:', {
              message: emailErrorMsg,
              code: emailUpdateError?.code,
              details: emailUpdateError?.details,
              hint: emailUpdateError?.hint,
            });
            throw new Error(`Falha ao atualizar usuário: ${emailErrorMsg}`);
          }

          console.log('[usersService] Email-based update response:', {
            hasData: !!emailUpdateData,
            dataLength: emailUpdateData?.length || 0,
            data: emailUpdateData,
          });

          if (!emailUpdateData || emailUpdateData.length === 0) {
            console.error('[usersService] Email-based update affected 0 rows:', {
              email: updates.email,
              updateDataKeys: Object.keys(updateData),
            });

            // Try to debug: check if user still exists
            const { data: debugUser } = await supabase
              .from('users')
              .select('id, email, updated_at')
              .eq('email', updates.email)
              .maybeSingle();

            console.error('[usersService] Debug: User exists after failed update?', debugUser);

            throw new Error(`Falha ao salvar alterações no usuário ${updates.email}. Verifique sua conexão e tente novamente.`);
          }

          userData = emailUpdateData[0];
          console.log('[usersService] User updated successfully via email');
        }
      } else {
        userData = data[0];
        console.log('[usersService] User updated successfully via ID');
      }
      const transformedData: User = {
        id: userData.id,
        name: userData.name,
        username: userData.username,
        email: userData.email,
        whatsapp: userData.whatsapp,
        gender: userData.gender,
        role: userData.role || 'client',
        profileImage: userData.profile_image_url,
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

  /**
   * Delete user
   */
  async deleteUser(id: string): Promise<{ error: any }> {
    if (!isSupabaseConfigured()) {
      return { error: 'Supabase not configured' };
    }

    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return { error: null };
    } catch (error) {
      return { error };
    }
  },

  /**
   * Delete all users by role - uses Edge Function with SERVICE_ROLE permissions
   */
  async deleteAllByRole(role: 'admin' | 'client'): Promise<{ count: number; error: any }> {
    if (!isSupabaseConfigured()) {
      return { count: 0, error: 'Supabase not configured' };
    }

    try {
      console.log('[usersService] Deleting all users with role via Edge Function:', role);

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
      const functionUrl = `${supabaseUrl}/functions/v1/delete-users-by-role`;

      console.log('[usersService] Calling Edge Function at:', functionUrl);

      const response = await Promise.race([
        fetch(functionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${anonKey}`,
            'apikey': anonKey,
          },
          body: JSON.stringify({ role }),
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Edge function timeout')), 10000)
        ),
      ]);

      const status = (response as Response).status;
      console.log('[usersService] Edge Function response - status:', status);

      if (!(response as Response).ok) {
        let errorData: { error?: string; details?: string; message?: string } | null = null;
        try {
          errorData = await (response as Response).json();
        } catch {
          errorData = null;
        }

        const errorMsg = errorData?.error || errorData?.details || `HTTP ${status}`;
        console.error('[usersService] Edge Function error:', errorMsg);
        throw new Error(errorMsg);
      }

      const responseData = await (response as Response).json();
      const count = responseData.count || 0;

      console.log('[usersService] Successfully deleted', count, 'users with role:', role);
      return { count, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : (typeof error === 'object' && error !== null ? JSON.stringify(error) : String(error));
      console.error('[usersService] Error deleting users by role:', errorMessage);
      return { count: 0, error };
    }
  },
};
