import { ApiModelProperty, ApiModel, SwaggerDefinitionConstant } from 'swagger-express-ts';
import Car from '../../../models/Car';
import Make from '../../../models/Make';
import Model from '../../../models/Model';
import BodyStyle from '../../../models/BodyStyle';
import Color from '../../../models/Color';
import { PagedResponse } from '../../../services/DbService';


@ApiModel({
  description : 'A pagination response of Cars',
  name : 'PagedCars'
})
export class PagedCars implements PagedResponse<Car> {

  @ApiModelProperty({
    description : 'The total cars found',
    required : true,
    type: SwaggerDefinitionConstant.NUMBER
  })
  public total: number = 0;

  @ApiModelProperty({
    description : 'The cars retrieved',
    required : true,
    type: SwaggerDefinitionConstant.ARRAY,
    model: Car.name
  })
  public results: Car[] = [ ];
}

@ApiModel({
  description : 'A pagination response of Models',
  name : 'PagedModels'
})
export class PagedModels implements PagedResponse<Model> {

  @ApiModelProperty({
    description : 'The total models found',
    required : true,
    type: SwaggerDefinitionConstant.NUMBER
  })
  public total: number = 0;

  @ApiModelProperty({
    description : 'The models retrieved',
    required : true,
    type: SwaggerDefinitionConstant.ARRAY,
    model: Model.name
  })
  public results: Model[] = [ ];
}

@ApiModel({
  description : 'A pagination response of Makes',
  name : 'PagedMakes'
})
export class PagedMakes implements PagedResponse<Make> {

  @ApiModelProperty({
    description : 'The total makes found',
    required : true,
    type: SwaggerDefinitionConstant.NUMBER
  })
  public total: number = 0;

  @ApiModelProperty({
    description : 'The makes retrieved',
    required : true,
    type: SwaggerDefinitionConstant.ARRAY,
    model: Make.name
  })
  public results: Make[] = [ ];
}

@ApiModel({
  description : 'A pagination response of BodyStyles',
  name : 'PagedBodyStyles'
})
export class PagedBodyStyles implements PagedResponse<BodyStyle> {

  @ApiModelProperty({
    description : 'The total body-styles found',
    required : true,
    type: SwaggerDefinitionConstant.NUMBER
  })
  public total: number = 0;

  @ApiModelProperty({
    description : 'The body-styles retrieved',
    required : true,
    type: SwaggerDefinitionConstant.ARRAY,
    model: BodyStyle.name
  })
  public results: BodyStyle[] = [ ];
}

@ApiModel({
  description : 'A pagination response of Colors',
  name : 'PagedColors'
})
export class PagedColors implements PagedResponse<Color> {

  @ApiModelProperty({
    description : 'The total colors found',
    required : true,
    type: SwaggerDefinitionConstant.NUMBER
  })
  public total: number = 0;

  @ApiModelProperty({
    description : 'The colors retrieved',
    required : true,
    type: SwaggerDefinitionConstant.ARRAY,
    model: Color.name
  })
  public results: Color[] = [ ];
}


