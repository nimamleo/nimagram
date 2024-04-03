import { BaseEntity, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('blocks')
export class UserBlockEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, (blocker) => blocker.blockedUsers)
  blocker: UserEntity;

  @ManyToOne(() => UserEntity, (blocked) => blocked.blockerUsers)
  blocked: UserEntity;
}
