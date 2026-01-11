import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Diagnose images stored in the database
 */
export async function diagnoseDBImages() {
  console.log('========== DATABASE IMAGES DIAGNOSTIC ==========');
  
  if (!isSupabaseConfigured()) {
    console.log('❌ Supabase not configured');
    return;
  }

  try {
    // Query users table directly to see what's stored
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, profile_image_url');

    if (error) {
      console.error('❌ Failed to fetch users from database:', error);
      return;
    }

    if (!data || data.length === 0) {
      console.log('ℹ️  No users found in database');
      return;
    }

    console.log(`📊 Found ${data.length} users in database`);
    console.log('');

    let usersWithImages = 0;
    let usersWithoutImages = 0;

    for (const user of data) {
      console.log(`👤 ${user.name} (${user.email})`);
      console.log(`   ID: ${user.id}`);
      
      if (user.profile_image_url) {
        usersWithImages++;
        console.log(`   ✅ Has image URL`);
        console.log(`   URL: ${user.profile_image_url}`);
        
        // Test URL
        try {
          const response = await fetch(user.profile_image_url, { method: 'HEAD' });
          if (response.ok) {
            console.log(`   ✅ URL is accessible`);
          } else {
            console.log(`   ⚠️  URL returned status: ${response.status}`);
          }
        } catch (e) {
          console.log(`   ⚠️  Could not reach URL`);
        }
      } else {
        usersWithoutImages++;
        console.log(`   ❌ No image URL in database`);
      }
      console.log('');
    }

    console.log('📈 SUMMARY:');
    console.log(`   Users with image URLs: ${usersWithImages}`);
    console.log(`   Users without image URLs: ${usersWithoutImages}`);

  } catch (error) {
    console.error('❌ Diagnostic failed:', error);
  }

  console.log('========== END DIAGNOSTIC ==========');
}
