import { 
  Strategy as JwtStrategy, 
  ExtractJwt, 
  StrategyOptions, 
  VerifyCallback 
}  from "passport-jwt";
import { TTokenPayload, TTokenPayload_AccountType } from "./APSAuthStrategyService";
import { TAuthConfigInternal } from "../ServerConfig";
import { ApiNotAuthorizedServerError, ServerError } from "../ServerError";
import APSSessionService, { APSSessionUser } from "../../api/services/APSSessionService";
import { ServerUtils } from "../ServerUtils";
import APSServiceAccountsService from "../../api/services/apsAdministration/APSServiceAccountsService";
import { APSServiceAccount } from "../../../src/@solace-iot-team/apim-server-openapi-node";


interface IVerifiedCallback {
  (error: any, account?: APSSessionUser | APSServiceAccount, info?: TTokenPayload_AccountType): void;
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
      // // DEBUG
      // const iat: number = jwt_payload.iat;
      // const iatStr: string = (new Date(iat)).toUTCString();
      // ServerLogger.error(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.AUTHENTICATING_USER, message: 'check if it is a userAccount, if so, compare issuedAt in token with Server lastValidIssuedAt:', details: {
      //   jwt_payload: jwt_payload,
      //   iatStr: iatStr
      // }}));    

      switch(jwt_payload.accountType) {
        case TTokenPayload_AccountType.USER_ACCOUNT:
          try {
            // check if user was logged out: no refreshToken, then not logged in
            const apsSessionUser: APSSessionUser = await APSSessionService.byId({ userId: jwt_payload._id }); 
            if(apsSessionUser.sessionInfo.refreshToken.length === 0) throw new ApiNotAuthorizedServerError(logName, undefined, { userId: jwt_payload._id });
            return done(undefined, apsSessionUser, TTokenPayload_AccountType.USER_ACCOUNT);
          } catch(e) {
            throw new ApiNotAuthorizedServerError(logName, undefined, { userId: jwt_payload._id });
          }
        case TTokenPayload_AccountType.SERVICE_ACCOUNT:
          try {
            const apsServiceAccount: APSServiceAccount = await APSServiceAccountsService.byId({ serviceAccountId: jwt_payload._id });
            return done(undefined, apsServiceAccount, TTokenPayload_AccountType.SERVICE_ACCOUNT);
          } catch(e) {
            throw new ApiNotAuthorizedServerError(logName, undefined, { serviceAccountId: jwt_payload._id });
          }
        default:
          ServerUtils.assertNever(logName, jwt_payload.accountType);
      }
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