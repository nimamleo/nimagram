import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity()
export class ContactEntity {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ type: 'bigint' })
  userId: number;

  @Column({ type: 'bigint' })
  contactId: number;

  @ManyToOne(() => UserEntity, (x) => x.contact)
  contact: UserEntity;

  @ManyToOne(() => UserEntity, (x) => x.userContact)
  user: UserEntity;
}
