import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ChatType } from '../../../../../enum/chat-type.enum';
import { CoreEntity } from '../../entity';
import { ConversationEntity } from './conversation.entity';
import { IChat, IChatEntity } from '../../../../../models/chat/chat.model';
import { UserEntity } from '../../user/entities/user.entity';

@Entity({ name: 'chat' })
export class ChatEntity extends CoreEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  content: string;

  @Column()
  seen: boolean;

  @Column()
  isEdited: boolean;

  @Column()
  isDeleted: boolean;

  @Column({ nullable: true })
  filePath: string;

  @Column({ type: 'enum', enum: ChatType })
  type: ChatType;

  @ManyToOne(() => ConversationEntity, (conversation) => conversation.chats)
  conversation: Partial<ConversationEntity>;

  @ManyToOne(() => UserEntity, (user) => user.chats)
  sender: Partial<UserEntity>;

  @ManyToOne(() => UserEntity, (user) => user.deletedChats)
  deletedBy: Partial<UserEntity>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date;

  static fromIChat(iChat: IChat): ChatEntity {
    if (!iChat) {
      return null;
    }

    const chat = new ChatEntity();

    chat.content = iChat.content;
    chat.seen = iChat.seen;
    chat.isEdited = iChat.isEdited;
    chat.isDeleted = iChat.isDeleted;
    chat.filePath = iChat.filePath;
    chat.type = iChat.type;
    chat.conversation = { id: +iChat.conversation.id };
    chat.sender = { id: +iChat.sender.id };

    return chat;
  }

  static toIChatEntity(chat: ChatEntity): IChatEntity {
    if (!chat) {
      return null;
    }

    return {
      id: chat.id.toString(),
      content: chat.content,
      seen: chat.seen,
      isEdited: chat.isEdited,
      isDeleted: chat.isDeleted,
      type: chat.type,
      filePath: chat.filePath,
      deletedBy: {},
      conversation: {},
      sender: chat?.sender ? UserEntity.toIUserEntity(chat.sender) : {},
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
      deletedAt: chat.deletedAt,
    };
  }
}
