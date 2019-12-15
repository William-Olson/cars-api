import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import Model from './Model';

@Entity('makes')
export class Make {

    @PrimaryGeneratedColumn()
    public id?: number;

    @Column({ unique: true, nullable: false })
    public name?: string;

}


export default Make;
