import passport from "passport";
import { Strategy as LocalStrategy }  from "passport-local";
import { Strategy as JwtStrategy }  from "passport-jwt";
import APSLocalStrategy from "./APSLocalStrategy";
import APSJwTStrategy from "./APSJwTStrategy";
import { TAuthConfigInternal } from "../ServerConfig";

export type TPassportBuildInternalResult = {
  apsLocalStrategy: passport.Strategy;
  apsJwtStrategy: passport.Strategy;
}
export default class APSPassportFactory {

  private static buildInternal_Local({ name }:{
    name: string;
  }): LocalStrategy {
    const funcName = 'buildInternal_Local';
    const logName = `${APSPassportFactory.name}.${funcName}()`;

    const localStrategy: LocalStrategy = APSLocalStrategy.build();
    passport.use(name, localStrategy);
    // serializeUser(): (user: T, cb: (err: any, id?: any) => void) => void;
    // deserializeUser(): (username: string, cb: (err: any, user?: any) => void) => void;
    passport.serializeUser<string>((user: Express.User, done: (err: any, user?: string | undefined) => void) => {
      // const _funcName = 'passport.serializeUser';
      // const _logName = `${logName}.${_funcName}()`;  
      // throw new Error(`${_logName}: continue here: user = ${JSON.stringify(user, null, 2)}`);
      
      // what to store in the session
      // populates: req.user=userId
      // populates: req.session = 
      // "session": {
      //   "passport": {
      //     "user": "master.user@async-apim-devel.com"
      //   }
      // }
      return done(undefined, user as string);
    });
    passport.deserializeUser<string>((user: string, done: (err: any, user?: false | string | null | undefined) => void) => {
      const _funcName = 'passport.deserializeUser';
      const _logName = `${logName}.${_funcName}()`;
  
      throw new Error(`${_logName}: continue here: user = ${JSON.stringify(user, null, 2)}`);


      console.log('passport.deserializeUser')

      // user comes from the session

      return done(undefined, user);
    });

    return localStrategy;
  }

  private static buildInternal_Jwt({ name, authConfigInternal }:{
    name: string;
    authConfigInternal: TAuthConfigInternal;
  }): JwtStrategy {
    // const funcName = 'buildInternal_Jwt';
    // const logName = `${APSPassportFactory.name}.${funcName}()`;

    const jwtStrategy: JwtStrategy = APSJwTStrategy.build({ authConfigInternal: authConfigInternal });
    passport.use(name, jwtStrategy);

    return jwtStrategy;
  }

  public static buildInternal({ authConfigInternal, internalLocalStrategyName, internalJwtStrategyName }:{
    authConfigInternal: TAuthConfigInternal;
    internalLocalStrategyName: string;
    internalJwtStrategyName: string;
  }): TPassportBuildInternalResult {
    // const funcName = 'buildInternal';
    // const logName = `${APSPassportFactory.name}.${funcName}()`;

    const localStrategy: LocalStrategy = APSPassportFactory.buildInternal_Local({ name: internalLocalStrategyName });

    const jwtStrategy: JwtStrategy = APSPassportFactory.buildInternal_Jwt({ 
      name: internalJwtStrategyName,
      authConfigInternal: authConfigInternal,
    });

    return {
      apsLocalStrategy: localStrategy,
      apsJwtStrategy: jwtStrategy
    };
  }
}
