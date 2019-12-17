import { ApiModel, ApiModelProperty, SwaggerDefinitionConstant } from 'swagger-express-ts';

@ApiModel({
  description : 'Entity Creation',
  name : 'EntityInput'
})
export class EntityInput {

  @ApiModelProperty({
    description : 'A unique name',
    required : true,
    type: SwaggerDefinitionConstant.STRING
  })
  public name?: string;

}

@ApiModel({
  description : 'Model Creation',
  name : 'ModelInput'
})
export class ModelInput {

  @ApiModelProperty({
    description : 'A unique name',
    required : true,
    type: SwaggerDefinitionConstant.STRING
  })
  public name?: string;

  @ApiModelProperty({
    description : 'The IDs of the Colors the Model is available in',
    required : true,
    type: SwaggerDefinitionConstant.ARRAY,
    example: [ 1 ]
  })
  public colorIds?: number[];

  @ApiModelProperty({
    description : 'The ID of the Model\'s Make',
    required : true,
    type: SwaggerDefinitionConstant.NUMBER
  })
  public makeId?: number;

  @ApiModelProperty({
    description : 'The ID of the Model\'s BodyStyle',
    required : true,
    type: SwaggerDefinitionConstant.NUMBER
  })
  public bodyStyleId?: number;

}


@ApiModel({
  description : 'Car Creation',
  name : 'CarInput'
})
export class CarInput {

  @ApiModelProperty({
    description : 'The year of the Car',
    required : true,
    type: SwaggerDefinitionConstant.NUMBER
  })
  public year?: string;

  @ApiModelProperty({
    description : 'The ID of the Color of the Car',
    required : true,
    type: SwaggerDefinitionConstant.NUMBER
  })
  public colorId?: number[];

  @ApiModelProperty({
    description : 'The ID of the Car\'s Model',
    required : true,
    type: SwaggerDefinitionConstant.NUMBER
  })
  public modelId?: number;

}
