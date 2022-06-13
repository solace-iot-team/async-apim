
import { TAPSClientOpenApiConfig } from './utils/APSClientOpenApi';

type TConfig = {
  useDevelTools: boolean;
  apsClientOpenApiConfig: TAPSClientOpenApiConfig;
}

export class Config {
  private static commonName='Config';
  private static config: TConfig; 

  private static getMandatoryEnvVarValue = (envVarName: string): string => {
    const value: any = (process.env[envVarName] === undefined) ? null : process.env[envVarName];
    if (value === null) throw new Error(`missing env var: ${envVarName}`);
    return value;
  }
  private static getOptionalEnvVarValue = (envVarName: string): string | undefined => {
    return process.env[envVarName];
  }
  private static getMandatoryEnvVarValueAsNumber = (envVarName: string): number => {
    const value: any = Number(Config.getMandatoryEnvVarValue(envVarName));
    if (Number.isNaN(value)) throw new Error(`env var not a number:${envVarName}=${Config.getMandatoryEnvVarValue(envVarName)}`);
    return value;
  }
  private static getOptionalEnvVarValueAsNumber = (envVarName: string): number | undefined => {
    const value: any = Number(Config.getOptionalEnvVarValue(envVarName));
    if(value) {
      if (Number.isNaN(value)) throw new Error(`env var not a number:${envVarName}=${Config.getOptionalEnvVarValue(envVarName)}`);
    }
    return value;  
  }
  private static getOptionalEnvVarValueAsBoolean = (envVarName: string, defaultValue: boolean): boolean => {
    const value: string | undefined = process.env[envVarName];
    if(!value) return defaultValue;
    return value.toLowerCase() === 'true';
  };
  private static getOptionalEnvVarValueAsURL = (envVarName: string): URL | undefined => {
    const value: string | undefined = process.env[envVarName];
    if(!value) return undefined;
    try {
      const url: URL = new URL(value);
      return url;
    } catch(e) {
      throw new Error(`env var not a well-formed URL: ${envVarName}=${value}`);
    }
  };

  public static initialize = () => {
    const funcName = 'initialize';
    const logName = `${Config.commonName}.${funcName}()`;
    console.log(`${logName}: process.env = ${JSON.stringify(process.env, null, 2)}`);
    Config.config = {
      useDevelTools: Config.getOptionalEnvVarValueAsBoolean('REACT_APP_AP_USE_DEVEL_TOOLS', false),
      apsClientOpenApiConfig: {
        apsServerUrl: Config.getOptionalEnvVarValueAsURL("REACT_APP_AP_SERVER_URL"),
      }
    }
    console.log(`${logName}: config = ${JSON.stringify(Config.config, null, 2)}`);
  }

  public static getAPSClientOpenApiConfig = (): TAPSClientOpenApiConfig => {
    const funcName = 'getAPSClientOpenApiConfig';
    const logName = `${Config.commonName}.${funcName}()`;
    if(!Config.config) throw new Error(`${logName}: Config.config is undefined`);
    return Config.config.apsClientOpenApiConfig;
  }
  
  public static getUseDevelTools = (): boolean => {
    const funcName = 'getUseDevelTools';
    const logName = `${Config.commonName}.${funcName}()`;
    if(!Config.config) throw new Error(`${logName}: Config.config is undefined`);
    return Config.config.useDevelTools;
  }

}