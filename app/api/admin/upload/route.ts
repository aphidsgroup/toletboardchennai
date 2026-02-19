import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { supabaseAdmin, STORAGE_BUCKET } from '@/lib/supabase';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

// Ensure the storage bucket exists (auto-creates on first use)
let bucketEnsured = false;
async function ensureBucket() {
    if (bucketEnsured) return;

    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const exists = buckets?.some(b => b.id === STORAGE_BUCKET);

    if (!exists) {
        const { error } = await supabaseAdmin.storage.createBucket(STORAGE_BUCKET, {
            public: true,
            fileSizeLimit: MAX_FILE_SIZE,
            allowedMimeTypes: ALLOWED_TYPES,
        });
        if (error && !error.message.includes('already exists')) {
            console.error('Failed to create bucket:', error);
            throw new Error('Storage bucket creation failed');
        }
    }

    bucketEnsured = true;
}

export async function POST(request: NextRequest) {
    if (!(await isAuthenticated())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Auto-create bucket if it doesn't exist
        await ensureBucket();

        const formData = await request.formData();
        const files = formData.getAll('images') as File[];

        if (!files || files.length === 0) {
            return NextResponse.json({ error: 'No files provided' }, { status: 400 });
        }

        if (files.length > 5) {
            return NextResponse.json({ error: 'Maximum 5 images allowed' }, { status: 400 });
        }

        const uploadedPaths: string[] = [];

        for (const file of files) {
            // Validate file type
            if (!ALLOWED_TYPES.includes(file.type)) {
                return NextResponse.json(
                    { error: `Invalid file type: ${file.type}. Allowed: jpg, jpeg, png, webp` },
                    { status: 400 }
                );
            }

            // Validate file size
            if (file.size > MAX_FILE_SIZE) {
                return NextResponse.json(
                    { error: `File too large: ${file.name}. Maximum size: 5MB` },
                    { status: 400 }
                );
            }

            // Generate unique filename
            const timestamp = Date.now();
            const randomString = Math.random().toString(36).substring(2, 15);
            const extension = file.name.split('.').pop();
            const filename = `${timestamp}-${randomString}.${extension}`;
            const filePath = `properties/${filename}`;

            // Convert file to buffer for Supabase upload
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            // Upload to Supabase Storage
            const { error: uploadError } = await supabaseAdmin.storage
                .from(STORAGE_BUCKET)
                .upload(filePath, buffer, {
                    contentType: file.type,
                    upsert: false,
                });

            if (uploadError) {
                console.error('Supabase upload error:', uploadError);
                return NextResponse.json(
                    { error: `Failed to upload ${file.name}: ${uploadError.message}` },
                    { status: 500 }
                );
            }

            // Get public URL
            const { data: urlData } = supabaseAdmin.storage
                .from(STORAGE_BUCKET)
                .getPublicUrl(filePath);

            uploadedPaths.push(urlData.publicUrl);
        }

        return NextResponse.json({ paths: uploadedPaths }, { status: 200 });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Failed to upload images' }, { status: 500 });
    }
}
