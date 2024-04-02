import { Prisma } from '@prisma/client';
import { IUser, IUserEntity } from '../../../../../models/user/user.model';

export function fromIUser(iUser: IUser): Prisma.UserUncheckedCreateInput {
  if (!iUser) {
    return null;
  }

  return {
    name: iUser.name,
    username: iUser.username,
    bio: iUser.bio,
    avatar: iUser.avatar,
    phone: iUser.phone,
  };
}

export function toIUserEntity(
  user: Partial<Prisma.UserUncheckedCreateInput>,
): IUserEntity {
  if (!user) {
    return null;
  }

  return {
    id: user.id.toString(),
    username: user.username,
    name: user.name,
    bio: user.bio,
    avatar: user.avatar,
    phone: user.phone,
    lastOnline: undefined,
    rfToken: user.rfToken,
    contacts: [],
    blockedUsers: [],
    conversations: [],
    createdAt: new Date(user.createdAt),
    updatedAt: new Date(user.updatedAt),
  };
}
