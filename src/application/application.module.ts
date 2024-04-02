import { Module } from '@nestjs/common';
import { DatabaseModule } from '../infrastructure/database/database.module';
import { UserService } from './user/user.service';
import { ConversationService } from './chat/conversation.service';

@Module({
  imports: [DatabaseModule],
  providers: [UserService, ConversationService],
  exports: [UserService, ConversationService],
})
export class ApplicationModule {}
