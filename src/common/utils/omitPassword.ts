// src/common/utils/omitPassword.ts
import { User } from 'src/users/entities/user.entity';

export function omitPassword(user: User): Omit<User, 'passwordHash'> {
  // clonamos para no mutar el objeto original
  const safeUser = { ...user } as Omit<User, 'passwordHash'> &
    Partial<Pick<User, 'passwordHash'>>;
  delete (safeUser as Partial<User>).passwordHash;
  return safeUser;
}
