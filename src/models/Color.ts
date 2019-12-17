import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { ApiModel, ApiModelProperty, SwaggerDefinitionConstant } from 'swagger-express-ts';

@ApiModel({
    description : 'Colors of cars',
    name : 'Color'
})
@Entity('colors')
export class Color {

    @ApiModelProperty({
        description : 'The ID of the color',
        required : false,
        type: SwaggerDefinitionConstant.NUMBER
    })
    @PrimaryGeneratedColumn()
    public id?: number;

    @ApiModelProperty({
        description : 'The unique name of the color',
        required : true,
        type: SwaggerDefinitionConstant.STRING
    })
    @Column({ unique: true, nullable: false })
    public name?: string;

}


export default Color;
