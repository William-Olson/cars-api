import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, ManyToMany, JoinTable } from 'typeorm';
import Make from './Make';
import BodyStyle from './BodyStyle';
import Color from './Color';

@Entity('models')
export class Model {

  @PrimaryGeneratedColumn()
  public id?: number;

  @Column({ unique: true, nullable: false })
  public name?: string;

  @ManyToOne(() => Make, {  cascade: [ 'remove' ], nullable: false })
  @JoinColumn({ name: 'make_id', referencedColumnName: 'id' })
  public make?: Make;

  @ManyToOne(() => BodyStyle, { cascade: [ 'remove' ], nullable: false })
  @JoinColumn({ name: 'body_style_id', referencedColumnName: 'id' })
  public bodyStyle?: BodyStyle;

  @ManyToMany(() => Color, { cascade: [ 'remove' ], onDelete: 'CASCADE', nullable: false })
  @JoinTable({
    name: 'model_colors',
    joinColumn: { name: 'model_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'color_id', referencedColumnName: 'id' }
  })
  public availableColors?: Color[];

}


export default Model;
