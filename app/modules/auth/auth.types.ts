export type LoginEventProvider = 'GOOGLE' | 'EMAIL';

export type OAuthAccountInput = {
  type: string;
  provider: string;
  providerAccountId: string;
  refresh_token?: string | null;
  access_token?: string | null;
  expires_at?: number | null;
  token_type?: string | null;
  scope?: string | null;
  id_token?: string | null;
  session_state?: string | null;
};

export type GoogleExchangeInput = {
  email: string;
  name?: string | null;
  image?: string | null;
  account: OAuthAccountInput;
};

export type CreateLoginEventInput = {
  userId?: string | null;
  email?: string | null;
  provider: LoginEventProvider;
  success: boolean;
  reason: string;
  ipAddress: string;
};
