
import { TAPSClientOpenApiConfig } from './utils/APSClientOpenApi';
import { EAPSClientProtocol } from '@solace-iot-team/apim-server-openapi-browser';


type TConfig = {
  useDevelTools: boolean,
  useEmbeddablePages: boolean,
  apsClientOpenApiConfig: TAPSClientOpenApiConfig
}

export class Config {
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
    const logName = `${Config.name}.${funcName}()`;
    console.log(`${logName}: process.env = ${JSON.stringify(process.env, null, 2)}`);
    // const protocolStr: string | undefined = Config.getOptionalEnvVarValue("REACT_APP_AP_SERVER_CLIENT_PROTOCOL");
    // let protocol: EAPSClientProtocol | undefined = undefined;
    // if(protocolStr) {
    //   protocol = (protocolStr === EAPSClientProtocol.HTTP ? EAPSClientProtocol.HTTP : EAPSClientProtocol.HTTPS);
    // }
    Config.config = {
      useDevelTools: Config.getOptionalEnvVarValueAsBoolean('REACT_APP_AP_USE_DEVEL_TOOLS', false),
      useEmbeddablePages: Config.getOptionalEnvVarValueAsBoolean('REACT_APP_AP_USE_EMBEDDEDABLE_PAGES', false),
      apsClientOpenApiConfig: {
        apsServerUrl: Config.getOptionalEnvVarValueAsURL("REACT_APP_AP_SERVER_URL"),
        // protocol: protocol,
        // host: Config.getOptionalEnvVarValue("REACT_APP_AP_SERVER_CLIENT_HOST"),
        // port: Config.getOptionalEnvVarValueAsNumber("REACT_APP_AP_SERVER_CLIENT_PORT"),
        // user: Config.getMandatoryEnvVarValue("REACT_APP_AP_SERVER_CLIENT_USER"),
        // pwd: Config.getMandatoryEnvVarValue("REACT_APP_AP_SERVER_CLIENT_USER_PWD"),
      }
    }
    console.log(`${logName}: config = ${JSON.stringify(Config.config, null, 2)}`);
  }

  public static getAPSClientOpenApiConfig = (): TAPSClientOpenApiConfig => {
    return Config.config.apsClientOpenApiConfig;
  }
  
  public static getUseDevelTools = (): boolean => {
    return Config.config.useDevelTools;
  }

  public static getUseEmbeddablePages = (): boolean => {
    return Config.config.useEmbeddablePages;
  }
}