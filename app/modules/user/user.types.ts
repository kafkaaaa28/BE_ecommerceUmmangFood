export type User = {
  id: string;
  email: string;
  name: string | null;
  role: string;
};
type LoginEventProvider = 'GOOGLE' | 'EMAIL';
export type CreateLoginEventInput = {
  userId?: string | null;
  email?: string | null;
  provider: LoginEventProvider;
  success: boolean;
  reason: string;
  ipAddress: string;
};
