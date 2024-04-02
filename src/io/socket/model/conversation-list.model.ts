export class ConversationListRequest {}

export class ConversationList {
  id: string;
  name: string;
  image: string;
  type: string;
  lastChat: string;
  notSeen: number;
  createdAt: string;
}
export class ConversationListResponse {
  list: ConversationList[];
}
