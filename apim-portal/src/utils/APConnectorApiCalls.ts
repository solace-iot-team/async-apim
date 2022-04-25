import yaml from "js-yaml";

import { 
  APIInfo,
  ApisService, 
  About,
  AdministrationService,
} from '@solace-iot-team/apim-connector-openapi-browser';
import { 
  APSConnectorClientConfig 
} from "../_generated/@solace-iot-team/apim-server-openapi-browser";
import { TAPOrganizationId } from '../components/deleteme.APComponentsCommon';
import { APClientConnectorOpenApi } from './APClientConnectorOpenApi';
import { ApiCallState, TApiCallState } from './ApiCallState';
import { Globals } from './Globals';
import { APConnectorApiMismatchError, APError } from './APError';
import { APLogger } from './APLogger';
import { EAPAsyncApiSpecFormat, TAPAsyncApiSpec } from "./APTypes";

export type TAPConnectorPortalAbout = {
  isEventPortalApisProxyMode: boolean,
  connectorServerVersionStr?: string,
  connectorOpenApiVersionStr?: string
}
export type TAPConnectorAbout = {
  apiAbout: About;
  portalAbout: TAPConnectorPortalAbout;
}

export type TAPConnectorInfo = {
  connectorAbout: TAPConnectorAbout
}

export type TGetAsyncApiSpecResult = {
  apiCallState: TApiCallState,
  asyncApiSpec?: TAPAsyncApiSpec,
  apiInfo?: APIInfo
}

export type TTransformApiAboutToAPConnectorAboutResult = {
  apConnectorAbout: TAPConnectorAbout,
  apError?: APError
}

export class APConnectorApiHelper {

  public static transformApiAboutToAPConnectorAbout = (apiAbout: About): TTransformApiAboutToAPConnectorAboutResult => {
    const funcName = 'transformApiAboutToAPConnectorAbout';
    const logName = `${APConnectorApiHelper.name}.${funcName}()`;
    let result: TTransformApiAboutToAPConnectorAboutResult = {
      apConnectorAbout: {
        apiAbout: apiAbout,
        portalAbout: {
          isEventPortalApisProxyMode: apiAbout.APIS_PROXY_MODE ? apiAbout.APIS_PROXY_MODE : false
        }
      }
    }
    const createResult = (apError: APError | undefined): TTransformApiAboutToAPConnectorAboutResult => {
      return {
        ...result,
        apError: apError
      }
    }
    if(!apiAbout.version) return createResult(new APConnectorApiMismatchError(logName, 'apiAbout.version is undefined'));
    const apiAboutVersionConnectorOpenApiVersionField = 'platform-api-openapi';
    const apiAboutVersionconnectorServerVersionField = 'platform-api-server';
    const connectorOpenApiVersionStr: string | undefined = apiAbout.version.version[apiAboutVersionConnectorOpenApiVersionField];
    const connectorServerVersionStr: string | undefined = apiAbout.version.version[apiAboutVersionconnectorServerVersionField];
    if(!connectorOpenApiVersionStr) return createResult(new APConnectorApiMismatchError(logName, `connectorOpenApiVersionStr is undefined, reading from 'version.version[${apiAboutVersionConnectorOpenApiVersionField}]'`));
    if(!connectorServerVersionStr) return createResult(new APConnectorApiMismatchError(logName, `connectorServerVersionStr is undefined, reading from 'version.version[${apiAboutVersionconnectorServerVersionField}]`));
    result = {
      ...result,
      apConnectorAbout: {
        ...result.apConnectorAbout,
        portalAbout: {
          ...result.apConnectorAbout.portalAbout,
          connectorOpenApiVersionStr: connectorOpenApiVersionStr,
          connectorServerVersionStr: connectorServerVersionStr  
        }
      }
    };
    return createResult(undefined);
  }
  public static getAsyncApiSpecJsonAsString = (asyncApiSpec: TAPAsyncApiSpec): string => {
    const funcName = 'getAsyncApiSpecJsonAsString';
    const logName = `${APConnectorApiHelper.name}.${funcName}()`;
    if(asyncApiSpec.format !== EAPAsyncApiSpecFormat.JSON) throw new Error(`${logName}: cannot handle asyncApiSpec.format other than JSON. format=${asyncApiSpec.format}`);
    // console.log(`${logName}: asyncApiSpec.spec=${JSON.stringify(asyncApiSpec.spec, null, 2)}`);
    return JSON.stringify(asyncApiSpec.spec);
  }

  public static getAsyncApiSpecJsonAsDisplayString = (asyncApiSpec: TAPAsyncApiSpec): string => {
    const funcName = 'getAsyncApiSpecJsonAsDisplayString';
    const logName = `${APConnectorApiHelper.name}.${funcName}()`;
    if(asyncApiSpec.format !== EAPAsyncApiSpecFormat.JSON) throw new Error(`${logName}: cannot handle asyncApiSpec.format other than JSON. format=${asyncApiSpec.format}`);
    return JSON.stringify(asyncApiSpec.spec, null, 2);
  }

  public static getAsyncApiSpecJsonFromString = (asyncApiSpecString: string): TAPAsyncApiSpec => {
    const funcName = 'getAsyncApiSpecJsonFromString';
    const logName = `${APConnectorApiHelper.name}.${funcName}()`;
    const result: TAPAsyncApiSpec | string = APConnectorApiHelper.getAsyncApiSpecAsJson({ format: EAPAsyncApiSpecFormat.UNKNOWN, spec: asyncApiSpecString });
    if(typeof(result) === 'string') throw new Error(`${logName}: invalid asyncApiSpecJsonString, result=${result}`);
    return result;
  }

  public static getAsyncApiSpecAsJson = (asyncApiSpec: TAPAsyncApiSpec): TAPAsyncApiSpec | string => {
    const funcName = 'getAsyncApiSpecAsJson';
    const logName = `${APConnectorApiHelper.name}.${funcName}(${asyncApiSpec.format})`;
    // console.log(`${logName}: starting ...`);
    switch (asyncApiSpec.format) {
      case EAPAsyncApiSpecFormat.JSON:
        return asyncApiSpec;
      case EAPAsyncApiSpecFormat.YAML: {
        // return `${logName}: implement conversion from YAML to JSON`;
        try {
          const doc: any = yaml.load(asyncApiSpec.spec);
          try {
            const jsonParsedDoc: any = JSON.parse(JSON.stringify(doc));
            return { format: EAPAsyncApiSpecFormat.JSON, spec: jsonParsedDoc };
          } catch (e) {
            return `unable to convert YAML to JSON, e=${e}`;
          }
        } catch (e) {
          return `unable to convert YAML to JSON, e=${e}`;
        }
      }
      case EAPAsyncApiSpecFormat.UNKNOWN: {
        try {
          const parsedSpec: any = JSON.parse(asyncApiSpec.spec);
          return { format: EAPAsyncApiSpecFormat.JSON, spec: parsedSpec };
        } catch(jsonError: any) {
          console.error(`${logName}: jsonError=${jsonError}`);
          try {
            const doc: any = yaml.load(asyncApiSpec.spec);
            try {
              const jsonParsedDoc: any = JSON.parse(JSON.stringify(doc));
              if(typeof(jsonParsedDoc) !== 'object') return `unable to parse as JSON or YAML, type:${typeof(jsonParsedDoc)}`;
              // console.log(`${logName}: typeof(jsonParseddoc)=${typeof(jsonParsedDoc)} , jsonParseddoc = ${JSON.stringify(doc, null, 2)}`);
              return APConnectorApiHelper.getAsyncApiSpecAsJson({ format: EAPAsyncApiSpecFormat.YAML, spec: asyncApiSpec.spec });
              // return { format: EAPAsyncApiSpecFormat.YAML, spec: asyncApiSpec.spec };
            } catch (yamlError) {
              console.error(`${logName}: yamlError=${JSON.stringify(yamlError, null, 2)}`);
              return `unable to parse as JSON or YAML, jsonError=${JSON.stringify(jsonError)}, error=${JSON.stringify(yamlError)}`;
            }
            // return { format: EAPAsyncApiSpecFormat.YAML, spec: asyncApiSpec.spec };
          } catch(yamlError: any) {
            console.error(`${logName}: yamlError=${JSON.stringify(yamlError, null, 2)}`);
            return `unable to parse as JSON or YAML, error=${yamlError.reason}`;
          }  
        }
      }
      default:
        return Globals.assertNever(logName, asyncApiSpec.format);
    }
  }
}

export class APConnectorApiCalls {
  
  public static getConnectorInfo = async(connectorClientConfig: APSConnectorClientConfig): Promise<TAPConnectorInfo | undefined> => {
    const funcName = 'getConnectorInfo';
    const logName= `${APConnectorApiCalls.name}.${funcName}()`;

    // WARNING: connector must be accessible

    await APClientConnectorOpenApi.tmpInitialize(connectorClientConfig);
    let result: TAPConnectorInfo | undefined;
    try {
      const apiAbout: About = await AdministrationService.about();
      const transformResult: TTransformApiAboutToAPConnectorAboutResult = APConnectorApiHelper.transformApiAboutToAPConnectorAbout(apiAbout);      
      if(transformResult.apError) {
        APLogger.error(APLogger.createLogEntry(logName, transformResult.apError));
      }
      result = {
        connectorAbout: transformResult.apConnectorAbout
      }
    } catch (e: any) {
      APClientConnectorOpenApi.logError(logName, e);
      result = undefined;
    } finally {
      await APClientConnectorOpenApi.tmpUninitialize();
      return result;
    }
  }

  public static getAsyncApiSpec = async(orgId: TAPOrganizationId, apiId: string, initialApiCallState: TApiCallState): Promise<TGetAsyncApiSpecResult> => {
    const funcName = 'getAsyncApiSpec';
    const logName = `${APConnectorApiCalls.name}.${funcName}()`;
    try { 
      const apiAny: any = await ApisService.getApi({
        organizationName: orgId, 
        apiName: apiId, 
        format: 'application/json'
      });
      // console.log(`${logName}: typeof(apiAny) = ${typeof(apiAny)}`);
      let api: object;
      if(typeof(apiAny) === 'string') {
        api = JSON.parse(apiAny);
      } else {
        api = apiAny
      }
      // console.log(`${logName}: api = ${JSON.stringify(api, null, 2)}`);
      const apiInfo: APIInfo = await ApisService.getApiInfo({
        organizationName: orgId, 
        apiName: apiId
      });
      return {
        apiCallState: initialApiCallState,
        asyncApiSpec: {
          format: EAPAsyncApiSpecFormat.JSON,
          spec: api
        },
        apiInfo: apiInfo
      }  
    } catch(e: any) {
      APClientConnectorOpenApi.logError(logName, e);
      return {
        apiCallState: ApiCallState.addErrorToApiCallState(e, initialApiCallState)
      }
    }
  }

}