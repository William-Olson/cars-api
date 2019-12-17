import { ApiModel, ApiModelProperty, SwaggerDefinitionConstant } from 'swagger-express-ts';

@ApiModel({
  description : 'Deletion Response',
  name : 'DeletionResponse'
})
export class DeletionResponse {

  @ApiModelProperty({
    description : 'Was successful',
    required : true,
    type: SwaggerDefinitionConstant.BOOLEAN
  })
  public success: boolean = false;

  @ApiModelProperty({
    description : 'Message details',
    required : true,
    type: SwaggerDefinitionConstant.STRING
  })
  public message: string = '';
}
