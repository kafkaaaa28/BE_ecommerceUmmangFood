import * as cache from "../../cache/redisCahce.js";
import { sendEmail } from "../../email/email.services.js";
import { OTP_EMAIL_TEMPLATE } from "../../email/emailTemplates.js";
import crypto from "crypto";
import { AppError } from "../../error/AppError.js";

const OTP_PEPPER = process.env.OTP_PEPPER;
const OTP_MAX_ATTEMPTS = 5;

if (!OTP_PEPPER) {
  throw new Error("OTP_PEPPER is not defined");
}

function hashOtp(identifier: string, otp: string) {
  return crypto
    .createHash("sha256")
    .update(`${OTP_PEPPER}:${identifier}:${otp}`)
    .digest("hex");
}

export class OtpService {
  async sendOtp(email: string, purpose: cache.OtpPurpose, identifier?: string) {
    const otp = String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
    const otpIdentifier = identifier ?? email;
    const otpHash = hashOtp(otpIdentifier, otp);

    await Promise.all([
      cache.setOtp(otpIdentifier, otpHash, purpose),
      cache.resetOtpAttempts(otpIdentifier, purpose),
    ]);

    try {
      await sendEmail({
        to: email,
        subject: "Your OTP Code",
        html: OTP_EMAIL_TEMPLATE(otp),
      });
    } catch {
      if (process.env.NODE_ENV === "production") {
        await cache.clearOtpState(otpIdentifier, purpose);
        throw new Error("Gagal mengirim email OTP");
      }
    }
  }

  async verifyOtp(
    identifier: string,
    otp: string,
    purpose: cache.OtpPurpose,
  ): Promise<void> {
    const candidate = hashOtp(identifier, otp);
    const result = await cache.consumeOtpIfMatch(
      identifier,
      purpose,
      candidate,
    );

    if (result === "MATCH") {
      return;
    }

    if (result === "MISMATCH") {
      const attempts = await cache.incrementOtpAttempts(identifier, purpose);
      if (attempts >= OTP_MAX_ATTEMPTS) {
        await cache.clearOtpState(identifier, purpose);
        throw new AppError("TOO_MANY_REQUESTS", 429, "TOO_MANY_REQUESTS");
      }
    }

    throw new AppError("OTP_INVALID", 400, "OTP_INVALID");
  }
}
