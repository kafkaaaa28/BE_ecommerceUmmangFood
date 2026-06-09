import { Readable } from 'stream';
import cloudinary from '../config/cloudinary.js';

type CloudinaryUploadOptions = {
  folder?: string;
  overwrite?: boolean;
  resourceType?: 'image' | 'video' | 'raw' | 'auto';
};

export function uploadBufferToCloudinary(buffer: Buffer, publicId: string, options: CloudinaryUploadOptions = {}): Promise<{ secure_url: string; public_id: string }> {
  const { folder = 'avatars', overwrite = true, resourceType = 'image' } = options;

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        overwrite,
        resource_type: resourceType,
      },
      (error, result) => {
        if (error || !result) {
          return reject(error || new Error('Upload gagal'));
        }

        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
        });
      },
    );

    Readable.from(buffer).pipe(uploadStream);
  });
}

export function extractCloudinaryPublicId(url: string): string | null {
  try {
    const parsedUrl = new URL(url);
    if (!parsedUrl.hostname.includes('cloudinary.com')) {
      return null;
    }

    const segments = parsedUrl.pathname.split('/').filter(Boolean);
    const uploadIndex = segments.findIndex((segment) => segment === 'upload');
    if (uploadIndex === -1) {
      return null;
    }

    const afterUpload = segments.slice(uploadIndex + 1);
    const versionIndex = afterUpload.findIndex((segment) => /^v\d+$/.test(segment));
    const publicIdSegments = versionIndex >= 0 ? afterUpload.slice(versionIndex + 1) : afterUpload;

    if (publicIdSegments.length === 0) {
      return null;
    }

    const lastSegment = publicIdSegments[publicIdSegments.length - 1];
    if (!lastSegment) {
      return null;
    }
    publicIdSegments[publicIdSegments.length - 1] = lastSegment.replace(/\.[^.]+$/, '');

    return publicIdSegments.join('/');
  } catch {
    return null;
  }
}

export async function destroyCloudinaryAssetByUrl(url: string, resourceType: 'image' | 'video' | 'raw' = 'image') {
  const publicId = extractCloudinaryPublicId(url);
  if (!publicId) {
    return null;
  }

  return cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}
