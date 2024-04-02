import { IConversationEntity } from './conversation.model';
import { IUserEntity } from '../user/user.model';
import { ChatType } from '../../enum/chat-type.enum';
import { IDated } from '../../common/interfaces/dated.interface';
import { IEntity } from '../../common/interfaces/entity.interface';
import { IDeletable } from '../../common/interfaces/deletable.interface';

export interface IChat {
  content: string;
  sender: Partial<IUserEntity>;
  seen: boolean;
  isEdited: boolean;
  isDeleted: boolean;
  filePath: string;
  type: ChatType;
  deletedBy: Partial<IUserEntity>;
  conversation: Partial<IConversationEntity>;
  // seenBy: Partial<IUserEntity>[];
}

export interface IChatEntity extends IChat, IDated, IEntity, IDeletable {}
