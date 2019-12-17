import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, ManyToMany, JoinTable } from 'typeorm';
import Make from './Make';
import BodyStyle from './BodyStyle';
import Color from './Color';
import { ApiModel, ApiModelProperty, SwaggerDefinitionConstant } from 'swagger-express-ts';

@ApiModel({
  description : 'The model of a car',
  name : 'Model'
})
@Entity('models')
export class Model {

  @ApiModelProperty({
    description : 'The ID of the model',
    required : false,
    type: SwaggerDefinitionConstant.NUMBER
  })
  @PrimaryGeneratedColumn()
  public id?: number;

  @ApiModelProperty({
    description : 'The unique name of the model',
    required : true,
    type: SwaggerDefinitionConstant.STRING
  })
  @Column({ unique: true, nullable: false })
  public name?: string;

  @ApiModelProperty({
    description : 'The model\'s make',
    required : true,
    type: SwaggerDefinitionConstant.OBJECT,
    model: Make.name
  })
  @ManyToOne(() => Make, {  cascade: [ 'remove' ], nullable: false })
  @JoinColumn({ name: 'make_id', referencedColumnName: 'id' })
  public make?: Make;

  @ApiModelProperty({
    description : 'The model\'s body-style',
    required : true,
    type: SwaggerDefinitionConstant.OBJECT,
    model: BodyStyle.name
  })
  @ManyToOne(() => BodyStyle, { cascade: [ 'remove' ], nullable: false })
  @JoinColumn({ name: 'body_style_id', referencedColumnName: 'id' })
  public bodyStyle?: BodyStyle;

  @ApiModelProperty({
    description : 'The colors available for the model',
    required : false,
    type: SwaggerDefinitionConstant.ARRAY,
    model: Color.name
  })
  @ManyToMany(() => Color, { cascade: [ 'remove' ], onDelete: 'CASCADE', nullable: false })
  @JoinTable({
    name: 'model_colors',
    joinColumn: { name: 'model_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'color_id', referencedColumnName: 'id' }
  })
  public availableColors?: Color[];

}


export default Model;
