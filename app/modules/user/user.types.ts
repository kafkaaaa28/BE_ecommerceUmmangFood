export type User = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  image: string | null;
  imagePublicId?: string | null;
  status: UserStatus;
};
export type UserStatus = 'ACTIVE' | 'SUSPENDED';
export type UserProfile = User & {
  phone: string | null;
  imagePublicId: string | null;
  createdAt: Date;
  updatedAt: Date;
};
