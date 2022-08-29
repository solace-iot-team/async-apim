import { 
  About,
} from '@solace-iot-team/apim-connector-openapi-browser';
import { APConnectorApiMismatchError, APError } from './APError';

export type TAPConnectorPortalAbout = {
  isEventPortalApisProxyMode: boolean;
  eventPortalVersion: string;
  connectorServerVersionStr?: string
  connectorOpenApiVersionStr?: string;
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
          isEventPortalApisProxyMode: apiAbout.APIS_PROXY_MODE ? apiAbout.APIS_PROXY_MODE : false,
          eventPortalVersion: apiAbout.EVENT_PORTAL_VERSION,
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
