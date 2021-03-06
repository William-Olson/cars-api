import CarRouter from './CarRouter';
import MakeRouter from './MakeRouter';
import BodyStyleRouter from './BodyStyleRouter';
import ColorRouter from './ColorRouter';
import ModelRouter from './ModelRouter';
import { SearchRouter } from './SearchRouter';

/*

  Resolve the list of routers

*/
export class Routes {

  /*

    Provide routers as an array of classes

  */
  public static asArray(): any[]
  {
    return [
      CarRouter,
      MakeRouter,
      BodyStyleRouter,
      ColorRouter,
      ModelRouter,
      SearchRouter
    ];
  }

}

export default Routes;
