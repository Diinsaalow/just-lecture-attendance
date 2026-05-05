import type { IUser, IAbilityRule } from '../types/auth';

/** Maps POST /auth/login user payload into the Redux `IUser` shape. */
export function mapLoginResponseUser(
  user:
    | IUser
    | {
        id: string;
        username: string;
        role: string;
        abilities?: IAbilityRule[];
        facultyId?: string;
      },
): IUser {
  if (user && typeof user === 'object' && '_id' in user && (user as IUser)._id) {
    return user as IUser;
  }
  const u = user as {
    id: string;
    username: string;
    role: string;
    abilities?: IAbilityRule[];
    facultyId?: string;
  };
  return {
    _id: u.id,
    username: u.username,
    email: '',
    role: u.role,
    abilities: u.abilities,
    facultyId: u.facultyId,
    isEmailVerified: false,
    createdAt: '',
    updatedAt: '',
  };
}
