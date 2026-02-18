import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Server-side Supabase client with service role key (for storage uploads)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export const STORAGE_BUCKET = 'property-images';
