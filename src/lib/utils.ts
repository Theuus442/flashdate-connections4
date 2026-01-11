import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Sanitize filename by removing special characters and accents
 * This is necessary for Supabase Storage which doesn't accept Unicode in file paths
 */
export function sanitizeFilename(filename: string): string {
  // Remove accents and special characters
  let sanitized = filename
    // Normalize unicode (decompose accented characters)
    .normalize('NFD')
    // Remove combining diacritical marks (accents)
    .replace(/[\u0300-\u036f]/g, '')
    // Replace spaces with underscores
    .replace(/\s+/g, '_')
    // Remove any character that's not alphanumeric, underscore, or dot
    .replace(/[^a-zA-Z0-9._-]/g, '')
    // Replace multiple consecutive dots/underscores with single character
    .replace(/\.+/g, '.')
    .replace(/_+/g, '_');

  return sanitized;
}
