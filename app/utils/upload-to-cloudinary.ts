import { Readable } from 'stream';
import cloudinary from '../config/cloudinary.js';

export function uploadBufferToCloudinary(buffer: Buffer, publicId: string): Promise<{ secure_url: string; public_id: string }> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'avatars',
        public_id: publicId,
        overwrite: true,
        resource_type: 'image',
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
