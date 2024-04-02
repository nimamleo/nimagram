import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateGroupRequest {
  @IsNotEmpty()
  @IsString()
  secondUserId: string;
  @IsNotEmpty()
  @IsString()
  name: string;
  @IsOptional()
  @IsString()
  image: string;
  @IsOptional()
  @IsString()
  description: string;
}
export class GroupMembers {
  id: string;
  username: string;
  name: string;
}
export class CreateGroupResponse {
  id: string;
  name: string;
  image: string;
  type: string;
  description: string;
  createdAt: string;
  lastChat: string;
  members: GroupMembers[];
}
