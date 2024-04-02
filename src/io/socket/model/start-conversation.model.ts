import { IsNotEmpty } from 'class-validator';

export class StartConversationRequest {
  @IsNotEmpty()
  targetId: string;
}

export class Member {
  id: string;
  name: string;
}
export class ConversationMembers {
  list: Member[];
}

export class StartConversationResponse {
  id: string;
  name: string;
  image: string;
  type: string;
  createdAt: string;
  members: ConversationMembers;
  chats: [];
}
