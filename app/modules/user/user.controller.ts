import type { Request, Response, NextFunction } from 'express';
import { UserRepository } from './user.repository.js';
import { UserService } from './user.services.js';
import { parseOrThrow } from '../validation/parse.js';
import { UpdateProfileSchema, phoneInput, verifyPhoneOtpInput } from './user.schema.js';
const userRepo = new UserRepository();
const userService = new UserService(userRepo);

export async function getMyProfileHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ ok: false, message: 'Unauthorized' });
    }
    const profile = await userService.getProfile(userId);
    res.status(200).json({ ok: true, data: profile });
  } catch (err) {
    next(err);
  }
}

export async function updateMyProfileHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ ok: false, message: 'Unauthorized' });
    }
    const parsed = parseOrThrow(UpdateProfileSchema, req.body);
    const profile = await userService.updateProfile(userId, parsed);
    res.status(200).json({ ok: true, data: profile });
  } catch (err) {
    next(err);
  }
}
export const requestOtpPhoneVerifikasi = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phone } = req.body;
    const email = req.user?.email;

    if (!email) {
      return res.status(401).json({ ok: false, message: 'Unauthorized' });
    }
    const ip = req.ip;
    const parsed = parseOrThrow(phoneInput, { phone });
    await userService.requestPhoneVerificationOtp(email, parsed.phone, String(ip));
    res.status(200).json({ ok: true });
  } catch (error) {
    next(error);
  }
};
export const verifyOtpPhoneVerifikasi = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phone, otp } = req.body;
    const email = req.user?.email;

    if (!email) {
      return res.status(401).json({ ok: false, message: 'Unauthorized' });
    }

    const parsed = parseOrThrow(verifyPhoneOtpInput, { phone, email, otp });
    const result = await userService.verifyPhoneOtp(parsed.phone, parsed.email, parsed.otp, String(req.ip));

    res.status(200).json({ ok: true, data: result });
  } catch (error) {
    next(error);
  }
};
