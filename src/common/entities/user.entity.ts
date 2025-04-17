import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { Activity } from './activity.entity';

@Entity('users')
export class User {
  @PrimaryColumn()
  id: number;

  @Column()
  accessToken: string;

  @Column()
  refreshToken: string;

  @Column()
  expiresAt: number;

  @OneToMany(() => Activity, (activity) => activity.user)
  activities: Activity[];
}
