import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Browser-safe Supabase client (uses anon key, no server secrets)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const STORAGE_BUCKET = 'property-images';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

/**
 * Upload an image directly from the browser to Supabase Storage.
 * Bypasses the Vercel API route (and its 4.5MB limit).
 */
export async function uploadImageDirect(file: File): Promise<string> {
    // Validate
    if (!ALLOWED_TYPES.includes(file.type)) {
        throw new Error(`Invalid file type: ${file.type}. Allowed: jpg, jpeg, png, webp`);
    }
    if (file.size > MAX_FILE_SIZE) {
        throw new Error(`File too large: ${file.name}. Maximum: 5MB`);
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 15);
    const ext = file.name.split('.').pop();
    const filePath = `properties/${timestamp}-${randomStr}.${ext}`;

    // Upload directly to Supabase Storage
    const { error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, file, {
            contentType: file.type,
            upsert: false,
        });

    if (error) {
        throw new Error(`Upload failed: ${error.message}`);
    }

    // Get public URL
    const { data } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(filePath);

    return data.publicUrl;
}
