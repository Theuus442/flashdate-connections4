/**
 * Transform Supabase URLs to use local proxy in development mode
 * This is needed for images and files from Supabase Storage
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';

/**
 * Convert a Supabase Storage URL to a proxied URL for development
 * Example: https://kdwnptqxwnnzvdinhhin.supabase.co/storage/v1/object/events/image.png
 *          -> http://localhost:8080/storage/v1/object/events/image.png
 */
export function getProxiedUrl(url: string | undefined): string {
  if (!url) return '';
  
  // In development, convert Supabase URLs to local proxy URLs
  if (import.meta.env.DEV && SUPABASE_URL && url.startsWith(SUPABASE_URL)) {
    // Extract the path part
    // E.g., https://kdwnptqxwnnzvdinhhin.supabase.co/storage/v1/object/events/image.png
    //       -> /storage/v1/object/events/image.png
    const urlObj = new URL(url);
    const path = urlObj.pathname + urlObj.search;
    
    // Return the proxied URL
    const proxiedUrl = window.location.origin + path;
    
    console.log('[URLProxy] Transformed URL:', {
      original: url.substring(0, 80),
      proxied: proxiedUrl.substring(0, 80),
    });
    
    return proxiedUrl;
  }
  
  // In production or if URL is not Supabase, return as-is
  return url;
}

/**
 * Batch transform multiple URLs
 */
export function getProxiedUrls(urls: (string | undefined)[]): string[] {
  return urls.map(url => getProxiedUrl(url));
}
