import { 
  Strategy as JwtStrategy, 
  ExtractJwt, 
  StrategyOptions, 
  VerifyCallback 
}  from "passport-jwt";
import { TTokenPayload } from "./APSAuthStrategyService";
import { APSUserResponse } from "../../../src/@solace-iot-team/apim-server-openapi-node";
import APSUsersService from "../../api/services/APSUsersService/APSUsersService";
import { TAuthConfigInternal } from "../ServerConfig";
import { ServerError } from "../ServerError";


interface IVerifiedCallback {
  (error: any, user?: APSUserResponse, info?: any): void;
}

/**
 * from: https://www.codingdeft.com/posts/react-authentication-mern-node-passport-express-mongo/
 */
class APSJwtStrategy {
  private authConfigInternal: TAuthConfigInternal | undefined = undefined;
  private jwtStrategyOptions: StrategyOptions = {
    // can I extract the token from the session instead? 
    // don't send the token to browser
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: '',
  };

  private getStrategyOptions = (): StrategyOptions => {
    const funcName = 'getStrategyOptions';
    const logName = `${APSJwtStrategy.name}.${funcName}()`;
    if(this.authConfigInternal === undefined) throw new ServerError(logName, 'this.authConfigInternal === undefined');
    this.jwtStrategyOptions.secretOrKey = this.authConfigInternal.authJwtSecret;
    return this.jwtStrategyOptions;
  }
  //   export interface VerifyCallback {
  //     (payload: any, done: VerifiedCallback): void;
  // }
  private static verifyCallbackFunc: VerifyCallback = async(jwt_payload: TTokenPayload, done: IVerifiedCallback): Promise<void> => {
    const funcName = 'verifyCallbackFunc';
    const logName = `${APSJwtStrategy.name}.${funcName}()`;
    try {
      // throw new Error(`${logName}: continue here: jwt_payload = ${JSON.stringify(jwt_payload, null, 2)}`);
      const apsUserResponse: APSUserResponse = await APSUsersService.byId({ userId: jwt_payload._id });
      return done(undefined, apsUserResponse, undefined);
    } catch(e) {
      return done(e, undefined, undefined);
    }
  }
  
  public build = ({ authConfigInternal }:{
    authConfigInternal: TAuthConfigInternal;
  }): JwtStrategy => {
    this.authConfigInternal = authConfigInternal;
    return new JwtStrategy(this.getStrategyOptions(), APSJwtStrategy.verifyCallbackFunc);
  }

}

export default new APSJwtStrategy();