import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Test if Supabase Storage is properly configured for public access
 */
export async function testStorageAccess() {
  console.log('========== STORAGE DIAGNOSTIC TEST ==========');
  
  if (!isSupabaseConfigured()) {
    console.log('❌ Supabase is not configured');
    return;
  }

  try {
    // Test with a small dummy file
    const testFileName = `test-${Date.now()}-diagnostic.txt`;
    const testContent = new Blob(['test'], { type: 'text/plain' });
    const testFile = new File([testContent], testFileName);

    console.log('📤 Attempting to upload test file to profiles bucket...');
    const { error: uploadError } = await supabase.storage
      .from('profiles')
      .upload(testFileName, testFile, { upsert: true });

    if (uploadError) {
      console.error('❌ Upload failed:', uploadError.message);
      return;
    }

    console.log('✅ Upload successful');

    // Try to get public URL
    const { data: urlData } = supabase.storage
      .from('profiles')
      .getPublicUrl(testFileName);

    const publicUrl = urlData.publicUrl;
    console.log('🔗 Generated public URL:', publicUrl);

    // Test if URL is accessible
    console.log('🔍 Testing if URL is publicly accessible...');
    try {
      const response = await fetch(publicUrl, { method: 'HEAD' });
      
      if (response.ok) {
        console.log('✅ SUCCESS! URL is publicly accessible (Status: ' + response.status + ')');
        console.log('Your storage bucket is properly configured for public access!');
      } else if (response.status === 403) {
        console.error('❌ PROBLEM FOUND: Access Denied (403)');
        console.error('The bucket "profiles" is configured as PRIVATE.');
        console.error('');
        console.error('SOLUTION:');
        console.error('1. Go to Supabase Dashboard → Storage');
        console.error('2. Click on the "profiles" bucket');
        console.error('3. Look for the lock icon 🔒 at the top');
        console.error('4. Click it to make the bucket PUBLIC 🔓');
        console.error('5. Repeat for the "events" bucket');
      } else {
        console.warn('⚠️  URL returned status:', response.status);
      }
    } catch (fetchError) {
      console.error('❌ Could not reach URL:', fetchError);
    }

    // Cleanup: delete test file
    console.log('🧹 Cleaning up test file...');
    await supabase.storage.from('profiles').remove([testFileName]);

  } catch (error) {
    console.error('❌ Test failed:', error);
  }

  console.log('========== END DIAGNOSTIC TEST ==========');
}
