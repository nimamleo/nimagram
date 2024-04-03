import { BaseEntity, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ConversationEntity } from './conversation.entity';
import { UserEntity } from '../../user/entities/user.entity';

@Entity('conversationMembers')
export class ConversationMemberEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ConversationEntity, (conversation) => conversation.members)
  conversation: ConversationEntity;

  @ManyToOne(() => UserEntity, (user) => user.conversations)
  user: UserEntity;
}
