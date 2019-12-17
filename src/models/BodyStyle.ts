import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { ApiModel, ApiModelProperty, SwaggerDefinitionConstant } from 'swagger-express-ts';

@ApiModel({
    description : 'Represents a body-style of a car',
    name : 'BodyStyle'
})
@Entity('body_styles')
export class BodyStyle {

    @ApiModelProperty({
        description : 'The ID of the body-style',
        required : false,
        type: SwaggerDefinitionConstant.NUMBER
    })
    @PrimaryGeneratedColumn()
    public id?: number;

    @ApiModelProperty({
        description : 'The unique name of the body-style',
        required : true,
        type: SwaggerDefinitionConstant.STRING
    })
    @Column({ unique: true, nullable: false })
    public name?: string;

}


export default BodyStyle;
