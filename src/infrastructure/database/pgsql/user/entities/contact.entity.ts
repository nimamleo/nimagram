import { BaseEntity, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('contacts')
export class ContactEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, (user) => user.contacts)
  user: UserEntity;

  @ManyToOne(() => UserEntity, (user) => user.userContacts)
  contact: UserEntity;
}
