import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity()
export class BlockEntity {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ type: 'bigint' })
  blockerId: number;

  @Column({ type: 'bigint' })
  blockedId: number;

  @ManyToOne(() => UserEntity, (x) => x.blockerUser, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  blocker: UserEntity;

  @ManyToOne(() => UserEntity, (x) => x.blockedUser, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  blocked: UserEntity;
}
