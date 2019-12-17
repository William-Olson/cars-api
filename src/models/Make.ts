import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { ApiModel, ApiModelProperty, SwaggerDefinitionConstant } from 'swagger-express-ts';

@ApiModel({
    description : 'The make of a car',
    name : 'Make'
})
@Entity('makes')
export class Make {

    @ApiModelProperty({
        description : 'The ID of the make',
        required : false,
        type: SwaggerDefinitionConstant.NUMBER
    })
    @PrimaryGeneratedColumn()
    public id?: number;

    @ApiModelProperty({
        description : 'The unique name of the make',
        required : true,
        type: SwaggerDefinitionConstant.STRING
    })
    @Column({ unique: true, nullable: false })
    public name?: string;

}


export default Make;
