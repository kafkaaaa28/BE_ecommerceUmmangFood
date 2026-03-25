export const OTP_EMAIL_TEMPLATE = (otp: string) => `
<div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
  <h2 style="color: #4A90E2;">Kode OTP Kamu</h2>
  <p>Hai,</p>
  <p>Kode OTP kamu adalah:</p>
  <h1 style="letter-spacing: 5px;">${otp}</h1>
  <p style="color: #888; font-size: 12px;">Kode berlaku 5 menit. Jangan bagikan ke siapapun.</p>
  <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
  <p style="font-size: 12px; color: #aaa;">Jika kamu tidak meminta OTP ini, abaikan email ini.</p>
</div>
`;
