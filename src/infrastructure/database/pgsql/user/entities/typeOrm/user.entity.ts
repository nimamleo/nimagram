import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BlockEntity } from './block.entity';
import { ContactEntity } from './contact.entity';
import { ChatEntity } from '../../../chat/entities/typeOrm/chat.entity';
import { ConversationMemberEntity } from '../../../chat/entities/typeOrm/conversation-member.entity';
import { ConversationEntity } from '../../../chat/entities/typeOrm/conversation.entity';
import { IUser, IUserEntity } from '../../../../../../models/user/user.model';

@Entity({ name: 'users' })
export class UserEntity {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar' })
  username: string;

  @Column({ type: 'varchar', nullable: true })
  avatar?: string;

  @Column({ type: 'varchar', nullable: true })
  bio: string;

  @Column({ type: 'varchar' })
  phone: string;

  @Column({ type: 'timestamp', nullable: true })
  lastOnline?: Date;

  @Column({ type: 'varchar' })
  rfToken: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @OneToMany(() => BlockEntity, (x) => x.blocked, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  blockedUser: BlockEntity[];

  @OneToMany(() => BlockEntity, (x) => x.blocker, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  blockerUser: BlockEntity[];

  @OneToMany(() => ContactEntity, (x) => x.contact, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  contact: ContactEntity[];

  @OneToMany(() => ContactEntity, (x) => x.user, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  userContact: ContactEntity[];

  @OneToMany(() => ChatEntity, (x) => x.sender, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  chat: ChatEntity[];

  @OneToMany(() => ChatEntity, (x) => x.deletedBy)
  deletedChat: ChatEntity[];

  @OneToMany(() => ConversationEntity, (x) => x.members)
  conversations: ConversationEntity[];

  static fromIUser(iUser: IUser): UserEntity {
    if (!iUser) {
      return null;
    }

    const user = new UserEntity();
    user.username = iUser.username;
    user.name = iUser.name;
    user.phone = iUser.phone;
    user.bio = iUser.bio;
    user.avatar = iUser.avatar;
    user.rfToken = iUser.rfToken;
    user.lastOnline = iUser.lastOnline;
    user.conversations = [];
    user.contact = [];
    user.blockedUser = [];

    return user;
  }

  static toIUserEntity(user: UserEntity): IUserEntity {
    if (!user) {
      return null;
    }

    return {
      id: user.id.toString(),
      name: user.name,
      username: user.username,
      bio: user.bio,
      avatar: user.avatar,
      phone: user.phone,
      lastOnline: user.lastOnline,
      rfToken: user.rfToken,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      contacts: [],
      conversations: [],
      blockedUsers: [],
    };
  }
}
