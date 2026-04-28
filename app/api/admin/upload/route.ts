export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import cloudinary, { CLOUDINARY_FOLDER } from '@/lib/cloudinary';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export async function POST(request: NextRequest) {
    const session = await getSession();
    if (!session.isLoggedIn || (session.role !== 'admin' && session.role !== 'manager')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const formData = await request.formData();
        const files = formData.getAll('images') as File[];

        if (!files || files.length === 0) {
            return NextResponse.json({ error: 'No files provided' }, { status: 400 });
        }

        if (files.length > 10) {
            return NextResponse.json({ error: 'Maximum 10 images allowed' }, { status: 400 });
        }

        const uploadedUrls: string[] = [];

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

            // Convert file to base64 for Cloudinary upload
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const base64 = `data:${file.type};base64,${buffer.toString('base64')}`;

            // Upload to Cloudinary
            const result = await cloudinary.uploader.upload(base64, {
                folder: CLOUDINARY_FOLDER,
                resource_type: 'image',
                quality: 'auto',
                fetch_format: 'auto',
            });

            uploadedUrls.push(result.secure_url);
        }

        return NextResponse.json({ paths: uploadedUrls }, { status: 200 });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Failed to upload images' }, { status: 500 });
    }
}
