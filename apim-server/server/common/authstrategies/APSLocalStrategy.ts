import passport from "passport";
import { IVerifyOptions, Strategy as LocalStrategy }  from "passport-local";
import { APSUserResponse } from "../../../src/@solace-iot-team/apim-server-openapi-node";
import APSLoginService from "../../api/services/APSLoginService";
import APSSessionService from "../../api/services/APSSessionService";
import APSUsersService from "../../api/services/APSUsersService/APSUsersService";
import { ServerFatalError } from "../ServerError";
import { EServerStatusCodes, ServerLogger } from "../ServerLogger";

/**
 * from: https://www.wlaurance.com/2018/09/async-await-passportjs-local-strategy
 */
class APSLocalStrategy {

  private async authenticate(username: string, password: string, done: (error: any, user?: any, options?: IVerifyOptions) => void  ): Promise<void> {
    const funcName = 'authenticate';
    const logName = `${APSLocalStrategy.name}.${funcName}()`;
    try {
      const authenticatedUserId: string = await APSSessionService.authenticateInternal({
        username: username,
        password: password,
      });
      // throw new Error(`${logName}: continue here: authenticatedUserId = ${JSON.stringify(authenticatedUserId, null, 2)}`);
      return done(undefined, authenticatedUserId);
    } catch(e) {
      return done(e, undefined, undefined);
    }

  }

  public build = (): LocalStrategy => {
    return new LocalStrategy(this.authenticate);
  }

}

export default new APSLocalStrategy();