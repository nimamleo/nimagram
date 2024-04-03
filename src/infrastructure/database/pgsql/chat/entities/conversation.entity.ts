import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ConversationType } from '../../../../../enum/conversation-type';
import { CoreEntity } from '../../entity';
import { ChatEntity } from './chat.entity';
import {
  IConversation,
  IConversationEntity,
} from '../../../../../models/chat/conversation.model';
import { UserEntity } from '../../user/entities/user.entity';
import { ConversationMemberEntity } from './conversation-member.entity';

@Entity({ name: 'conversation' })
export class ConversationEntity extends CoreEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  image?: string;

  @Column()
  description?: string;

  @Column({ type: 'enum', enum: ConversationType })
  type: ConversationType;

  @Column()
  lastChat: Date;

  @Column()
  notSeen: number;

  @OneToMany(() => ChatEntity, (chat) => chat.conversation)
  chats: ChatEntity[];

  @OneToMany(() => ConversationMemberEntity, (x) => x.conversation)
  members: ConversationMemberEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  static fromIConversation(iConversation: IConversation): ConversationEntity {
    if (!iConversation) {
      return null;
    }

    const conversation = new ConversationEntity();

    conversation.name = iConversation.name;
    conversation.image = iConversation.image;
    conversation.description = iConversation.description;
    conversation.type = iConversation.type;
    conversation.lastChat = iConversation.lastChat;
    conversation.notSeen = iConversation.notSeen;

    return conversation;
  }

  static toIConversationEntity(
    conversation: ConversationEntity,
  ): IConversationEntity {
    if (!conversation) {
      return null;
    }

    return {
      id: conversation.id.toString(),
      name: conversation.name,
      image: conversation.image,
      type: conversation.type,
      lastChat: conversation.lastChat,
      description: conversation.description,
      notSeen: conversation.notSeen,
      chats: [],
      members: [],
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    };
  }
}
