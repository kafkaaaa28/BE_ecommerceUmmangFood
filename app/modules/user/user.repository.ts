import { prisma } from '../../config/prisma.js';
import crypto from 'crypto';
export class UserRepository {
  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, role: true, image: true, status: true },
    });
  }

  async findByNormalizedEmail(normalizedEmail: string) {
    return prisma.user.findUnique({
      where: { normalizedEmail },
      select: { id: true, email: true, name: true, role: true, image: true, status: true },
    });
  }

  async createByNormalizedEmail(normalizedEmail: string) {
    return prisma.user.create({
      data: { normalizedEmail, email: normalizedEmail },
      select: { id: true, email: true, name: true, role: true, image: true, status: true },
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
        imagePublicId: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async updateProfileById(userId: string, input: { name?: string; image?: string; imagePublicId?: string }) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        name: input.name,
        image: input.image,
        imagePublicId: input.imagePublicId,
      },
      select: {
        name: true,
        updatedAt: true,
      },
    });
  }
  async findPhone(phone: string) {
    return prisma.user.findUnique({
      where: { phone },
      select: {
        id: true,
        phone: true,
        phoneVerifiedAt: true,
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
  async DeletePhoneUser(id: string) {
    return prisma.user.update({
      where: {
        id,
      },
      data: {
        phone: null,
        phoneVerifiedAt: null,
      },
    });
  }
}
