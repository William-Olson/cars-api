import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

@Entity('body_styles')
export class BodyStyle {

    @PrimaryGeneratedColumn()
    public id?: number;

    @Column({ unique: true, nullable: false })
    public name?: string;

}


export default BodyStyle;
