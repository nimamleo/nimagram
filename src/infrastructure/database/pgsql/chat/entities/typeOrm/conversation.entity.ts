import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ConversationType } from '../../../../../../enum/conversation-type';
import { ChatEntity } from './chat.entity';
import { ConversationMemberEntity } from './conversation-member.entity';
import { UserEntity } from '../../../user/entities/typeOrm/user.entity';

@Entity()
export class ConversationEntity {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  image?: string;

  @Column({ type: 'varchar', nullable: true })
  description: string;

  @Column({ type: 'varchar' })
  type: ConversationType;

  @OneToMany(() => ChatEntity, (x) => x.conversation)
  chats: ChatEntity[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @OneToMany(() => UserEntity, (x) => x.conversations)
  members: UserEntity[];
}
