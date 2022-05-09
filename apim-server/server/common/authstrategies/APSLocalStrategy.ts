import { IVerifyOptions, Strategy as LocalStrategy }  from "passport-local";
import APSSessionService from "../../api/services/APSSessionService";

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

      // should add user to req and user={ _id: authenticatedUserId}
      // user and user._id

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