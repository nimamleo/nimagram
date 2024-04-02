import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from '../../../user/entities/typeOrm/user.entity';
import { ConversationEntity } from './conversation.entity';

@Entity()
export class ChatEntity {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ type: 'varchar' })
  content: string;

  @Column({ type: 'boolean' })
  seen: boolean;

  @Column({ type: 'boolean' })
  isEdited: boolean;

  @Column({ type: 'boolean' })
  isDeleted: boolean;

  @Column({ type: 'varchar' })
  filePath: string;

  @Column({ type: 'bigint' })
  senderId: number;

  @ManyToOne(() => UserEntity, (x) => x.chat)
  sender: UserEntity;

  @Column({ type: 'bigint' })
  deletedById: number;

  @ManyToOne(() => UserEntity, (x) => x.deletedChat)
  deletedBy: UserEntity;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @Column({ type: 'bigint' })
  conversationId: number;

  @ManyToOne(() => ConversationEntity, (x) => x.chats)
  conversation: ConversationEntity;
}
