const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB (Cloudinary converts to WebP which is smaller)
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

/**
 * Upload an image via the Next.js API route → Cloudinary.
 * Cloudinary automatically converts all images to optimized WebP.
 */
export async function uploadImageDirect(
    file: File,
    onProgress?: (pct: number) => void
): Promise<string> {
    // Validate type
    if (!ALLOWED_TYPES.includes(file.type)) {
        throw new Error(`Invalid file type: ${file.type}. Allowed: jpg, png, webp, gif`);
    }
    // Validate size
    if (file.size > MAX_FILE_SIZE) {
        throw new Error(`File too large: ${file.name}. Maximum: 10MB`);
    }

    const formData = new FormData();
    formData.append('images', file);

    // Use XMLHttpRequest for upload progress tracking
    return new Promise<string>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/admin/upload');

        xhr.upload.onprogress = (e) => {
            if (e.lengthComputable && onProgress) {
                onProgress(Math.round((e.loaded / e.total) * 100));
            }
        };

        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    const data = JSON.parse(xhr.responseText);
                    if (!data.paths || data.paths.length === 0) {
                        reject(new Error('No URL returned from upload'));
                    } else {
                        if (onProgress) onProgress(100);
                        resolve(data.paths[0]);
                    }
                } catch {
                    reject(new Error('Invalid response from upload server'));
                }
            } else {
                try {
                    const err = JSON.parse(xhr.responseText);
                    reject(new Error(err.error || `Upload failed (${xhr.status})`));
                } catch {
                    reject(new Error(`Upload failed (${xhr.status})`));
                }
            }
        };

        xhr.onerror = () => reject(new Error('Network error during upload'));
        xhr.send(formData);
    });
}
