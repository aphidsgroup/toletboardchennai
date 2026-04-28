import { createClient } from '@supabase/supabase-js';

// DEPRECATED — this file is kept only to avoid breaking any lingering imports.
// Image storage has been migrated to Cloudinary.
// See lib/cloudinary.ts

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder';

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
export const STORAGE_BUCKET = 'property-images';
