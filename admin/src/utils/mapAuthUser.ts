import type { IUser } from '../types/auth';

/** Maps POST /auth/login (or 2FA) user payload into the Redux `IUser` shape. */
export function mapLoginResponseUser(
  user: IUser | { id: string; username: string; role: string },
): IUser {
  if (user && typeof user === 'object' && '_id' in user && (user as IUser)._id) {
    return user as IUser;
  }
  const u = user as { id: string; username: string; role: string };
  return {
    _id: u.id,
    username: u.username,
    email: '',
    role: u.role,
    isEmailVerified: false,
    createdAt: '',
    updatedAt: '',
  };
}
