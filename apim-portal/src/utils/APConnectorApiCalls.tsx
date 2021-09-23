import { 
  APIInfo,
  ApisService, 
} from '@solace-iot-team/platform-api-openapi-client-fe';
import { TAPOrganizationId } from '../components/APComponentsCommon';
import { APClientConnectorOpenApi } from './APClientConnectorOpenApi';
import { ApiCallState, TApiCallState } from './ApiCallState';
import { EAPAsyncApiSpecFormat, TAPAsyncApiSpec } from '../components/APComponentsCommon';
import { Globals } from './Globals';

import yaml from "js-yaml";


export type TGetAsyncApiSpecResult = {
  apiCallState: TApiCallState,
  asyncApiSpec?: TAPAsyncApiSpec,
  apiInfo?: APIInfo
}

export class APConnectorApiHelper {

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

  public static getAsyncApiSpecJsonFromString = (asyncApiSpecJsonString: string): TAPAsyncApiSpec => {
    const funcName = 'getAsyncApiSpecJsonFromString';
    const logName = `${APConnectorApiHelper.name}.${funcName}()`;
    try {
      const specObject: any = JSON.parse(asyncApiSpecJsonString);
      return {
        format: EAPAsyncApiSpecFormat.JSON,
        spec: specObject
      }
    } catch(e:any) {
      throw new Error(`${logName}: cannot parse string as JSON, error=${e}`);
    }
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
          JSON.parse(asyncApiSpec.spec);
          return { format: EAPAsyncApiSpecFormat.JSON, spec: asyncApiSpec.spec };
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
  
  public static getAsyncApiSpec = async(orgId: TAPOrganizationId, apiId: string, apiSpecFormat: EAPAsyncApiSpecFormat, initialApiCallState: TApiCallState): Promise<TGetAsyncApiSpecResult> => {
    const funcName = 'getAsyncApiSpec';
    const logName = `${APConnectorApiCalls.name}.${funcName}()`;
    try { 
      const _apiSpecFormat: EAPAsyncApiSpecFormat.JSON | EAPAsyncApiSpecFormat.YAML = (apiSpecFormat === EAPAsyncApiSpecFormat.JSON || apiSpecFormat === EAPAsyncApiSpecFormat.YAML ? apiSpecFormat : EAPAsyncApiSpecFormat.JSON);
      const api: any = await ApisService.getApi(orgId, apiId, _apiSpecFormat);
      const apiInfo: APIInfo = await ApisService.getApiInfo(orgId, apiId);
      return {
        apiCallState: initialApiCallState,
        asyncApiSpec: {
          format: _apiSpecFormat,
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