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
    return JSON.stringify(asyncApiSpec.spec);
  }

  public static getAsyncApiSpecAsJson = (asyncApiSpec: TAPAsyncApiSpec): TAPAsyncApiSpec | string => {
    const funcName = 'getAsyncApiSpecAsJson';
    const logName = `${APConnectorApiHelper.name}.${funcName}()`;
    switch (asyncApiSpec.format) {
      case EAPAsyncApiSpecFormat.JSON:
        return asyncApiSpec;
      case EAPAsyncApiSpecFormat.YAML: {
        // return `${logName}: implement conversion from YAML to JSON`;
        try {
          const doc: any = yaml.load(asyncApiSpec.spec);
          try {
            JSON.parse(JSON.stringify(doc));
            return { format: EAPAsyncApiSpecFormat.JSON, spec: doc };
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
        } catch(e) {
          try {
            const doc: any = yaml.load(asyncApiSpec.spec);
            // console.log(`${logName}: doc = ${JSON.stringify(doc, null, 2)}`);
            try {
              JSON.parse(JSON.stringify(doc));
            } catch (e) {
              return `unable to parse as JSON or YAML, e=${e}`;
            }
            return { format: EAPAsyncApiSpecFormat.YAML, spec: asyncApiSpec.spec };
          } catch(e) {
            return `unable to parse as JSON or YAML, e=${e}`;
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