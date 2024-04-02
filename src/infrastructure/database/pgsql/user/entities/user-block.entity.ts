import { BaseEntity, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity({ name: 'user_block' })
export class UserBlockEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, (blocker) => blocker.blockerUsers)
  blocker: UserEntity;

  @ManyToOne(() => UserEntity, (blocked) => blocked.blockedUsers)
  blocked: UserEntity;
}
