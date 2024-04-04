import { BaseEntity, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ConversationEntity } from './conversation.entity';
import { UserEntity } from '../../user/entities/user.entity';
import {
  IConversationMember,
  IConversationMemberEntity,
} from '../../../../../models/chat/conversation-member.model';

@Entity('conversationMembers')
export class ConversationMemberEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ConversationEntity, (conversation) => conversation.members)
  conversation: Partial<ConversationEntity>;

  @ManyToOne(() => UserEntity, (user) => user.conversations)
  user: Partial<UserEntity>;

  static fromIConversationMember(
    iConversationMember: IConversationMember,
  ): ConversationMemberEntity {
    if (!iConversationMember) {
      return null;
    }

    const conversationMember = new ConversationMemberEntity();
    conversationMember.user = { id: +iConversationMember.user.id };
    conversationMember.conversation = {
      id: +iConversationMember.conversation.id,
    };

    return conversationMember;
  }
}
