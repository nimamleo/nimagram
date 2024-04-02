import { Module } from '@nestjs/common';
import { USER_DATABASE_PROVIDER } from './provider/user/user.provider';
import { UserPgsqlService } from './pgsql/user/user-pgsql.service';
import { CONVERSATION_DATABASE_PROVIDER } from './provider/chat/conversation.provider';
import { ConversationPgsqlService } from './pgsql/chat/conversation-pgsql.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './pgsql/user/entities/user.entity';
import { ChatEntity } from './pgsql/chat/entities/chat.entity';
import { ConversationEntity } from './pgsql/chat/entities/conversation.entity';
import { ConversationMemberEntity } from './pgsql/chat/entities/conversation-member.entity';
import { ContactEntity } from './pgsql/user/entities/contact.entity';
import { UserBlockEntity } from './pgsql/user/entities/user-block.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: '127.0.0.1',
      port: 5432,
      username: 'postgres',
      password: 'root',
      database: 'nimagram_typeorm',
      entities: [
        UserEntity,
        ChatEntity,
        ConversationEntity,
        ConversationMemberEntity,
        ContactEntity,
        UserBlockEntity,
      ],
      synchronize: true,
      // autoLoadEntities: true,
    }),
    TypeOrmModule.forFeature([
      UserEntity,
      ChatEntity,
      ConversationEntity,
      ConversationMemberEntity,
      ContactEntity,
      UserBlockEntity,
    ]),
  ],
  providers: [
    {
      provide: USER_DATABASE_PROVIDER,
      useClass: UserPgsqlService,
    },
    {
      provide: CONVERSATION_DATABASE_PROVIDER,
      useClass: ConversationPgsqlService,
    },
  ],
  exports: [USER_DATABASE_PROVIDER, CONVERSATION_DATABASE_PROVIDER],
})
export class DatabaseModule {}
