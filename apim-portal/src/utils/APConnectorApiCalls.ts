import { 
  About,
  AdministrationService,
} from '@solace-iot-team/apim-connector-openapi-browser';
import { 
  APSConnectorClientConfig 
} from "../_generated/@solace-iot-team/apim-server-openapi-browser";
import { APClientConnectorOpenApi } from './APClientConnectorOpenApi';
import { APConnectorApiMismatchError, APError } from './APError';
import { APLogger } from './APLogger';

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

export type TTransformApiAboutToAPConnectorAboutResult = {
  apConnectorAbout: TAPConnectorAbout,
  apError?: APError
}


// TODO: create a APConnectorDisplayService.ts

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
}

export class APConnectorApiCalls {
  
  public static getConnectorInfo = async(connectorClientConfig: APSConnectorClientConfig): Promise<TAPConnectorInfo | undefined> => {
    const funcName = 'getConnectorInfo';
    const logName= `${APConnectorApiCalls.name}.${funcName}()`;

    // WARNING: connector must be accessible

    // await APClientConnectorOpenApi.tmpInitialize(connectorClientConfig);
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
      // await APClientConnectorOpenApi.tmpUninitialize();
      return result;
    }
  }

}