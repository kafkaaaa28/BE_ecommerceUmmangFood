import { prisma } from '../../config/prisma.js';
import type { CreateLoginEventInput } from './user.types.js';
import crypto from 'crypto';

export class UserRepository {
  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, role: true, status: true },
    });
  }

  async findByNormalizedEmail(normalizedEmail: string) {
    return prisma.user.findUnique({
      where: { normalizedEmail },
      select: { id: true, email: true, name: true, role: true, status: true },
    });
  }

  async createByNormalizedEmail(normalizedEmail: string) {
    return prisma.user.create({
      data: { normalizedEmail, email: normalizedEmail },
      select: { id: true, email: true, name: true, role: true, status: true },
    });
  }

  async createLoginEvent(input: CreateLoginEventInput) {
    return prisma.loginEvent.create({
      data: {
        id: crypto.randomUUID(),
        userId: input.userId ?? null,
        email: input.email ?? null,
        provider: input.provider,
        success: input.success,
        reason: input.reason,
        ipAddress: input.ipAddress,
      },
    });
  }

  async findProfileById(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        phoneVerifiedAt: true,
        image: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async updateProfileById(userId: string, input: { name?: string; phone?: string; image?: string; phoneVerifiedAt?: Date | null }) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        name: input.name,
        phone: input.phone,
        image: input.image,
        phoneVerifiedAt: input.phoneVerifiedAt,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        phoneVerifiedAt: true,
        image: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async verifyPhoneOtp(phone: string, email: string) {
    return prisma.user.update({
      where: { normalizedEmail: email },
      data: { phone, phoneVerifiedAt: new Date() },
      select: {
        email: true,
        phone: true,
        phoneVerifiedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
