import { IChatEntity } from './chat.model';
import { IEntity } from '../../common/interfaces/entity.interface';
import { IDated } from '../../common/interfaces/dated.interface';
import { IDeletable } from '../../common/interfaces/deletable.interface';
import { ConversationType } from '../../enum/conversation-type';
import { IUserEntity } from '../user/user.model';

export interface IConversation {
  name?: string;
  image?: string;
  description?: string;
  type: ConversationType;
  members: Partial<IUserEntity>[];
  lastChat: Date;
  chats: Partial<IChatEntity>[];
  notSeen: number;
}

export interface IConversationEntity extends IConversation, IEntity, IDated {}
