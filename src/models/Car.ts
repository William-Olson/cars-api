import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import Color from './Color';
import Model from './Model';
import { ApiModel, ApiModelProperty, SwaggerDefinitionConstant } from 'swagger-express-ts';

@ApiModel({
  description : 'Car',
  name : 'Car'
})
@Entity('cars')
export class Car {

  @ApiModelProperty({
    description : 'The ID of the car',
    required : false,
    type: SwaggerDefinitionConstant.NUMBER
  })
  @PrimaryGeneratedColumn()
  public id?: number;

  @ApiModelProperty({
    description : 'The car\'s model',
    required : true,
    type: SwaggerDefinitionConstant.OBJECT,
    model: 'Model'
  })
  @ManyToOne(() => Model)
  @JoinColumn({ name: 'model_id', referencedColumnName: 'id' })
  public model?: Model;

  @ApiModelProperty({
    description : 'The color of the car',
    required : true,
    type: SwaggerDefinitionConstant.OBJECT,
    model: 'Color'
  })
  @ManyToOne(() => Color)
  @JoinColumn({ name: 'color_id', referencedColumnName: 'id' })
  public color?: Color;

  @ApiModelProperty({
    description : 'The year of the car',
    required : true,
    type: SwaggerDefinitionConstant.NUMBER
  })
  @Column({ nullable: false })
  public year?: number;

}


export default Car;
