import sharp from 'sharp';
import { AppError } from '../error/AppError.js';
import { rlRequestOtpByEmail, rlRequestOtpByIp, rlVerifyOtpByEmail, rlVerifyOtpByIp } from '../lib/otp/otplimiter.js';
import { UserRepository } from './user.repository.js';
import { OtpService } from '../lib/otp/otp.service.js';
import { classifyImageBuffer, isAvatarSafe } from '../image/image.services.js';
import { uploadBufferToCloudinary } from '../../utils/upload-to-cloudinary.js';
import cloudinary from '../../config/cloudinary.js';

type UpdateProfileInput = {
  name: string;
};

export class UserService {
  constructor(private readonly userRepo: UserRepository) {}
  otpService = new OtpService();
  async getProfile(userId: string) {
    const user = await this.userRepo.findProfileById(userId);
    if (!user) throw new AppError('USER_NOT_FOUND', 404, 'User tidak ditemukan');
    if (user.status !== 'ACTIVE') throw new AppError('ACCOUNT_UNAVAILABLE', 403, 'Akun tidak tersedia');
    return user;
  }

  async updateProfile(userId: string, input: UpdateProfileInput) {
    const user = await this.userRepo.findProfileById(userId);
    if (!user) throw new AppError('USER_NOT_FOUND', 404, 'User tidak ditemukan');
    if (user.status !== 'ACTIVE') throw new AppError('ACCOUNT_UNAVAILABLE', 403, 'Akun tidak tersedia');

    return await this.userRepo.updateProfileById(userId, input);
  }
  async uploadProfileAvatar(userId: string, file?: Express.Multer.File) {
    const user = await this.userRepo.findProfileById(userId);
    if (!user) throw new AppError('USER_NOT_FOUND', 404, 'User tidak ditemukan');
    if (user.status !== 'ACTIVE') throw new AppError('ACCOUNT_UNAVAILABLE', 403, 'Akun tidak tersedia');
    if (!file) throw new AppError('FILE_REQUIRED', 400, 'Foto profile wajib diupload');

    const processedBuffer = await sharp(file.buffer).rotate().resize(512, 512, { fit: 'cover' }).jpeg({ quality: 82 }).toBuffer();

    const predictions = await classifyImageBuffer(processedBuffer);
    if (!isAvatarSafe(predictions)) {
      throw new AppError('INAPPROPRIATE_IMAGE', 422, 'Foto profile terdeteksi mengandung konten yang tidak diizinkan');
    }

    const oldImagePublicId = user.imagePublicId;
    const uploaded = await uploadBufferToCloudinary(processedBuffer, `user-${userId}`);

    const updatedUser = await this.userRepo.updateProfileById(userId, {
      image: uploaded.secure_url,
      imagePublicId: uploaded.public_id,
    });

    if (oldImagePublicId) {
      await cloudinary.uploader.destroy(oldImagePublicId).catch(() => null);
    }

    return updatedUser;
  }

  async requestPhoneVerificationOtp(email: string, phone: string, ip: string) {
    try {
      await Promise.all([rlRequestOtpByIp.consume(ip), rlRequestOtpByEmail.consume(email)]);
    } catch (err: any) {
      const retryAfter = err?.msBeforeNext ? Math.ceil(err.msBeforeNext / 1000) : 60;
      throw new AppError('TOO_MANY_REQUESTS', 429, `Terlalu banyak permintaan. Silakan coba lagi dalam ${retryAfter} detik`);
    }

    const user = await this.userRepo.findByNormalizedEmail(email);
    if (!user) {
      throw new AppError('USER_NOT_FOUND', 404, 'User tidak ditemukan');
    }

    if (user.status !== 'ACTIVE') {
      throw new AppError('ACCOUNT_UNAVAILABLE', 403, 'Akun tidak tersedia');
    }
    const existingPhoneOwner = await this.userRepo.findPhone(phone);
    if (existingPhoneOwner && existingPhoneOwner.id !== user.id) {
      throw new AppError('PHONE_ALREADY_USED', 409, 'Nomor telepon sudah digunakan');
    }
    const identifier = `${email}:${phone}`;
    await this.otpService.sendOtp(email, 'phone_verification', identifier);
  }
  async verifyPhoneOtp(phone: string, email: string, otp: string, ip: string) {
    try {
      await Promise.all([rlVerifyOtpByIp.consume(ip), rlVerifyOtpByEmail.consume(email)]);
    } catch (err: any) {
      const retryAfter = err?.msBeforeNext ? Math.ceil(err.msBeforeNext / 1000) : 60;
      throw new AppError('TOO_MANY_REQUESTS', 429, `Terlalu banyak permintaan. Silakan coba lagi dalam ${retryAfter} detik`);
    }

    const user = await this.userRepo.findByNormalizedEmail(email);
    if (!user) {
      throw new AppError('USER_NOT_FOUND', 404, 'User tidak ditemukan');
    }

    if (user.status !== 'ACTIVE') {
      throw new AppError('ACCOUNT_UNAVAILABLE', 403, 'Akun tidak tersedia');
    }
    const existingPhoneOwner = await this.userRepo.findPhone(phone);
    if (existingPhoneOwner && existingPhoneOwner.id !== user.id) {
      throw new AppError('PHONE_ALREADY_USED', 409, 'Nomor telepon sudah digunakan');
    }
    const identifier = `${email}:${phone}`;
    await this.otpService.verifyOtp(identifier, otp, 'phone_verification');

    return await this.userRepo.verifyPhoneOtp(phone, email);
  }
  async deletePhoneUser(id: string, email: string, phone: string) {
    const user = await this.userRepo.findByNormalizedEmail(email);

    if (!user) {
      throw new AppError('USER_NOT_FOUND', 404, 'User tidak ditemukan');
    }

    if (user.status !== 'ACTIVE') {
      throw new AppError('ACCOUNT_UNAVAILABLE', 403, 'Akun tidak tersedia');
    }

    const findPhone = await this.userRepo.findPhone(phone);

    if (!findPhone) {
      throw new AppError('PHONE_NOT_FOUND', 404, 'Nomor telepon tidak ditemukan');
    }

    if (findPhone.id !== id) {
      throw new AppError('FORBIDDEN', 403, 'Nomor telepon ini bukan milik user');
    }

    if (findPhone.phone !== phone) {
      throw new AppError('PHONE_MISMATCH', 400, 'Nomor telepon tidak cocok');
    }

    return await this.userRepo.DeletePhoneUser(id);
  }
}
