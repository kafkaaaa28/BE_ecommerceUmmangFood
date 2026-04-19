import type { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.services.js';
import { UserRepository } from '../user/user.repository.js';
import { parseOrThrow } from '../validation/parse.js';
import { RequestOtpSchema, VerifyOtpSchema, RefreshBodySchema, GoogleExchangeSchema } from './auth.schema.js';
const userRepo = new UserRepository();
const auth = new AuthService(userRepo);
export const requestOtpLoginHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    const ip = req.ip;
    const parsed = parseOrThrow(RequestOtpSchema, { email });
    await auth.requestOtpLogin(parsed.email, String(ip));
    res.status(200).json({ sent: true });
  } catch (err) {
    next(err);
  }
};

export async function verifyOtpLoginHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, otp } = req.body;
    const ip = req.ip;
    const parsed = parseOrThrow(VerifyOtpSchema, { email, otp });
    const result = await auth.verifyOtpLogin(parsed.email, parsed.otp, String(ip));
    res.status(200).json({ ok: true, data: result });
  } catch (err) {
    next(err);
  }
}
export const refreshTokenHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;
    const parsed = parseOrThrow(RefreshBodySchema, { refreshToken });
    const result = await auth.refresh(parsed.refreshToken);
    res.status(200).json({ ok: true, data: result });
  } catch (err) {
    next(err);
  }
};
export const googleExchangeHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ip = req.ip;
    const parsed = parseOrThrow(GoogleExchangeSchema, req.body);
    const result = await auth.loginWithGoogle(
      {
        email: parsed.email,
        name: parsed.name,
        image: parsed.image,
        account: parsed.account,
      },
      String(ip),
    );
    res.status(200).json({ ok: true, data: result });
  } catch (err) {
    next(err);
  }
};
export const logoutHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionId = req.user?.sessionId;
    await auth.logoutCurrent(String(sessionId));
    res.status(200).json({ ok: true });
  } catch (err) {
    next(err);
  }
};
