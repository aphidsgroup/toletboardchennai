const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

/**
 * Upload an image via the Next.js API route (which uploads to Cloudinary).
 * Replaces the old Supabase direct-browser upload.
 */
export async function uploadImageDirect(file: File): Promise<string> {
    // Validate
    if (!ALLOWED_TYPES.includes(file.type)) {
        throw new Error(`Invalid file type: ${file.type}. Allowed: jpg, jpeg, png, webp`);
    }
    if (file.size > MAX_FILE_SIZE) {
        throw new Error(`File too large: ${file.name}. Maximum: 5MB`);
    }

    const formData = new FormData();
    formData.append('images', file);

    const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Upload failed' }));
        throw new Error(error.error || 'Upload failed');
    }

    const data = await response.json();
    if (!data.paths || data.paths.length === 0) {
        throw new Error('No URL returned from upload');
    }

    return data.paths[0];
}
