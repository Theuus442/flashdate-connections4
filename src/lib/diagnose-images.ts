import { supabase, isSupabaseConfigured } from './supabase';
import { usersService } from './users.service';

/**
 * Diagnose image issues in the database
 */
export async function diagnoseImages() {
  console.log('========== IMAGE DIAGNOSTIC ==========');
  
  if (!isSupabaseConfigured()) {
    console.log('❌ Supabase not configured');
    return;
  }

  try {
    // Get all users
    const { data: users, error: usersError } = await usersService.getUsers();

    if (usersError) {
      console.error('❌ Failed to fetch users:', usersError);
      return;
    }

    if (!users || users.length === 0) {
      console.log('ℹ️  No users found');
      return;
    }

    console.log(`📊 Found ${users.length} users`);
    console.log('');

    let usersWithImages = 0;
    let usersWithoutImages = 0;
    let brokenImageUrls = [];

    for (const user of users) {
      if (user.profileImage) {
        usersWithImages++;
        console.log(`👤 ${user.name} (${user.email})`);
        console.log(`   URL: ${user.profileImage}`);

        // Test URL
        try {
          const response = await fetch(user.profileImage, { method: 'HEAD' });
          if (response.ok) {
            console.log(`   ✅ URL is accessible`);
          } else if (response.status === 403) {
            console.log(`   ❌ Access Denied (403) - Bucket may be private`);
            brokenImageUrls.push({
              user: user.name,
              url: user.profileImage,
              status: 403
            });
          } else {
            console.log(`   ⚠️  URL returned status ${response.status}`);
            brokenImageUrls.push({
              user: user.name,
              url: user.profileImage,
              status: response.status
            });
          }
        } catch (e) {
          console.log(`   ⚠️  Could not reach URL`);
          brokenImageUrls.push({
            user: user.name,
            url: user.profileImage,
            error: String(e)
          });
        }
      } else {
        usersWithoutImages++;
        console.log(`👤 ${user.name} (${user.email}) - No image`);
      }
      console.log('');
    }

    console.log('📈 SUMMARY:');
    console.log(`   Users with images: ${usersWithImages}`);
    console.log(`   Users without images: ${usersWithoutImages}`);
    console.log(`   Broken/inaccessible URLs: ${brokenImageUrls.length}`);

    if (brokenImageUrls.length > 0) {
      console.log('');
      console.log('🔧 BROKEN URLS FOUND:');
      brokenImageUrls.forEach(item => {
        console.log(`   ${item.user}: ${item.url}`);
        if ('status' in item) {
          console.log(`      Status: ${item.status}`);
        } else if ('error' in item) {
          console.log(`      Error: ${item.error}`);
        }
      });
    }

  } catch (error) {
    console.error('❌ Diagnostic failed:', error);
  }

  console.log('========== END DIAGNOSTIC ==========');
}

/**
 * Regenerate all image URLs (useful if bucket was private and now is public)
 */
export async function regenerateImageUrls() {
  console.log('========== REGENERATING IMAGE URLS ==========');
  
  if (!isSupabaseConfigured()) {
    console.log('❌ Supabase not configured');
    return;
  }

  try {
    // Get all users with images
    const { data: users, error: usersError } = await usersService.getUsers();

    if (usersError) {
      console.error('❌ Failed to fetch users:', usersError);
      return;
    }

    if (!users || users.length === 0) {
      console.log('ℹ️  No users found');
      return;
    }

    const usersWithImages = users.filter(u => u.profileImage);
    if (usersWithImages.length === 0) {
      console.log('ℹ️  No users with images found');
      return;
    }

    console.log(`🔄 Processing ${usersWithImages.length} users with images...`);

    let regeneratedCount = 0;

    for (const user of usersWithImages) {
      try {
        // Extract file path from URL
        const urlParts = user.profileImage!.split('/');
        const fileName = urlParts[urlParts.length - 1];
        const filePath = `profiles/${fileName}`;

        // Generate new public URL
        const { data: newUrlData } = supabase.storage
          .from('profiles')
          .getPublicUrl(filePath);

        const newUrl = newUrlData.publicUrl;

        // Only update if URL changed
        if (newUrl !== user.profileImage) {
          console.log(`   Updating ${user.name}...`);
          console.log(`      Old: ${user.profileImage}`);
          console.log(`      New: ${newUrl}`);

          // Update in database
          const { error: updateError } = await supabase
            .from('users')
            .update({ profile_image_url: newUrl })
            .eq('id', user.id);

          if (updateError) {
            console.error(`   ❌ Failed to update: ${updateError.message}`);
          } else {
            console.log(`   ✅ Updated successfully`);
            regeneratedCount++;
          }
        } else {
          console.log(`   ✅ ${user.name} - URL already correct`);
          regeneratedCount++;
        }
      } catch (error) {
        console.error(`   ❌ Error processing ${user.name}:`, error);
      }
    }

    console.log('');
    console.log(`✅ Regeneration complete! ${regeneratedCount}/${usersWithImages.length} processed`);

  } catch (error) {
    console.error('❌ Regeneration failed:', error);
  }

  console.log('========== END REGENERATION ==========');
}
