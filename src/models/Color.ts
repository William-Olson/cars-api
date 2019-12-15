import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('colors')
export class Color {

    @PrimaryGeneratedColumn()
    public id?: number;

    @Column({ unique: true, nullable: false })
    public name?: string;

}


export default Color;
