import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CoreEntity } from '../../entity';
import { UserBlockEntity } from './user-block.entity';
import { ContactEntity } from './contact.entity';
import { ConversationMemberEntity } from '../../chat/entities/conversation-member.entity';
import { IUser, IUserEntity } from '../../../../../models/user/user.model';
import { ChatEntity } from '../../chat/entities/chat.entity';

@Entity({ name: 'user' })
export class UserEntity extends CoreEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  username: string;

  @Column({ nullable: true })
  avatar?: string;

  @Column({ nullable: true })
  bio?: string;

  @Column()
  phone: string;

  @Column()
  lastOnline: Date;

  @Column()
  rfToken: string;

  @OneToMany(() => UserBlockEntity, (x) => x.blocker)
  blockedUsers: UserBlockEntity[];

  @OneToMany(() => UserBlockEntity, (x) => x.blocked)
  blockerUsers: UserBlockEntity[];

  @OneToMany(() => ContactEntity, (userContact) => userContact.user)
  contacts: ContactEntity[];

  @OneToMany(() => ContactEntity, (userContact) => userContact.contact)
  userContacts: ContactEntity[];

  @OneToMany(() => ConversationMemberEntity, (x) => x.user)
  conversations: ConversationMemberEntity[];

  @OneToMany(() => ChatEntity, (chat) => chat.sender)
  chats: ChatEntity[];

  @OneToMany(() => ChatEntity, (deletedCHats) => deletedCHats.deletedBy)
  deletedChats: ChatEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  static fromIUser(iUser: IUser): UserEntity {
    if (!iUser) {
      return null;
    }

    const user = new UserEntity();

    user.name = iUser.name;
    user.username = iUser.username;
    user.avatar = iUser.avatar;
    user.bio = iUser.bio;
    user.phone = iUser.phone;
    user.lastOnline = iUser.lastOnline;
    user.rfToken = iUser.rfToken;

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
      blockedUsers: [],
      conversations: [],
      contacts: [],
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
