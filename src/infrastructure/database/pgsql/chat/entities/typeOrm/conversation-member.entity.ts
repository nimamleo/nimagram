import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ConversationEntity } from './conversation.entity';
import { UserEntity } from '../../../user/entities/typeOrm/user.entity';

@Entity()
export class ConversationMemberEntity {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ type: 'bigint' })
  conversationId: number;

  @ManyToOne(() => ConversationEntity, (x) => x.members)
  conversation: ConversationEntity;

  @Column({ type: 'bigint' })
  userId: number;

  @ManyToOne(() => UserEntity, (x) => x.conversations)
  user: UserEntity;
}
