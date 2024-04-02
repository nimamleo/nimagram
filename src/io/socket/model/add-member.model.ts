import { IsNotEmpty } from 'class-validator';

export class AddMemberRequest {
  @IsNotEmpty()
  userIds: string[];
  @IsNotEmpty()
  groupId: string;
}

export class GroupMembers {
  id: string;
  username: string;
  name: string;
}
export class AddMemberResponse {
  id: string;
  name: string;
  image: string;
  type: string;
  description: string;
  createdAt: string;
  lastChat: string;
  members: GroupMembers[];
}
