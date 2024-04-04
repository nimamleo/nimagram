import { IUserEntity } from '../user/user.model';
import { IConversationEntity } from './conversation.model';
import { IEntity } from '../../common/interfaces/entity.interface';

export interface IConversationMember {
  user: Partial<IUserEntity>;
  conversation: Partial<IConversationEntity>;
}

export interface IConversationMemberEntity
  extends IConversationMember,
    IEntity {}
