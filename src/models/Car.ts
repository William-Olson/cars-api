import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import Color from './Color';
import Model from './Model';

@Entity('cars')
export class Car {

  @PrimaryGeneratedColumn()
  public id?: number;

  @ManyToOne(() => Model)
  @JoinColumn({ name: 'model_id', referencedColumnName: 'id' })
  public model?: Model;

  @ManyToOne(() => Color)
  @JoinColumn({ name: 'color_id', referencedColumnName: 'id' })
  public color?: Color;

  @Column({ nullable: false })
  public year?: number;

}


export default Car;
