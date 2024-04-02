import { BaseEntity, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity({ name: 'contact' })
export class ContactEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, (user) => user.userContacts)
  user: UserEntity;

  @ManyToOne(() => UserEntity, (contact) => contact.contacts)
  contact: UserEntity;
}
