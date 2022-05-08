import passport from "passport";
import { IVerifyOptions, Strategy as LocalStrategy }  from "passport-local";
import { APSUserResponse } from "../../../src/@solace-iot-team/apim-server-openapi-node";
import { EServerStatusCodes, ServerLogger } from "../ServerLogger";
import APSLocalStrategy from "./APSLocalStrategy";

export type TPassportBuildResult = {
  apsPassport: passport.PassportStatic;
  apsStrategy: passport.Strategy;
}
export default class APSPassportFactory {

  public static buildInternal({ name }:{
    name: string;
  }): TPassportBuildResult {
    const funcName = 'buildInternal';
    const logName = `${APSPassportFactory.name}.${funcName}()`;

    const localStrategy: LocalStrategy = APSLocalStrategy.build();

    passport.use(name, localStrategy);

    // serializeUser(): (user: T, cb: (err: any, id?: any) => void) => void;
    // deserializeUser(): (username: string, cb: (err: any, user?: any) => void) => void;

    // passport.serializeUser<APSUserResponse>(function (user, done) {
    passport.serializeUser<string>((userId: Express.User, done: (err: any, userId?: string | undefined) => void) => {
      const _funcName = 'passport.serializeUser';
      const _logName = `${logName}.${_funcName}()`;  
      // throw new Error(`${_logName}: continue here: user = ${JSON.stringify(user, null, 2)}`);
      // what to store in the session
      return done(undefined, userId as string);
    });

    passport.deserializeUser<string>((userId: string, done: (err: any, userId?: false | string | null | undefined) => void) => {
      const _funcName = 'passport.deserializeUser';
      const _logName = `${logName}.${_funcName}()`;
  
      throw new Error(`${_logName}: continue here: user = ${JSON.stringify(userId, null, 2)}`);


      console.log('passport.deserializeUser')

      // user comes from the session

      return done(undefined, userId);
    });

    return {
      apsPassport: passport,
      apsStrategy: localStrategy
    };
  }
}
