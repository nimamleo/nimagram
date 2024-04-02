import { IConversationEntity } from '../chat/conversation.model';
import { IEntity } from '../../common/interfaces/entity.interface';
import { IDated } from '../../common/interfaces/dated.interface';

export interface IUser {
  name: string;
  username: string;
  avatar: string;
  bio: string;
  phone: string;
  lastOnline: Date;
  blockedUsers: Partial<IUserEntity>[];
  rfToken: string;
  contacts: Partial<IUserEntity>[];
  conversations: Partial<IConversationEntity>[];
}

export interface IUserEntity extends IUser, IDated, IEntity {}
