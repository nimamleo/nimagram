import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../prisma/prisma.module';
import { USER_DATABASE_PROVIDER } from './provider/user/user.provider';
import { UserPgsqlService } from './pgsql/user/user-pgsql.service';
import { CONVERSATION_DATABASE_PROVIDER } from './provider/chat/conversation.provider';
import { ConversationPgsqlService } from './pgsql/chat/conversation-pgsql.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './pgsql/user/entities/typeOrm/user.entity';
import { BlockEntity } from './pgsql/user/entities/typeOrm/block.entity';
import { ConversationEntity } from './pgsql/chat/entities/typeOrm/conversation.entity';
import { ChatEntity } from './pgsql/chat/entities/typeOrm/chat.entity';
import { ConversationMemberEntity } from './pgsql/chat/entities/typeOrm/conversation-member.entity';
import { ContactEntity } from './pgsql/user/entities/typeOrm/contact.entity';

@Module({
  imports: [
    PrismaModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: '127.0.0.1',
      port: 5432,
      username: 'postgres',
      password: 'root',
      database: 'chat_typeorm',
      entities: [
        UserEntity,
        ChatEntity,
        ConversationEntity,
        ConversationMemberEntity,
        ContactEntity,
        BlockEntity,
      ],
      synchronize: true,
      autoLoadEntities: true,
    }),
    TypeOrmModule.forFeature([
      UserEntity,
      ChatEntity,
      ConversationEntity,
      ConversationMemberEntity,
      ContactEntity,
      BlockEntity,
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
