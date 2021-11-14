import { 
  AppEnvironment, 
  AppResponse, 
  CommonDisplayName, 
  CommonName, 
  Endpoint, 
  EnvironmentResponse, 
  Protocol, 
} from "@solace-iot-team/apim-connector-openapi-browser";
import { 
  TApiEntitySelectItemList, 
  TAPViewManagedWebhook, 
  TAPViewManagedWebhookList,
  TAPWebhookStatus
} from "../../../../components/APComponentsCommon";

export type TManagedObjectId = CommonName;
export type TManagedObjectDisplayName = CommonDisplayName;

// export type TAPInterimApiWebHook = WebHook & {
//   trustedCNList: TAPTrustedCNList
// }
// export type TViewManagedWebhook = {
//   apSynthId: string;
//   apiWebHook: TAPInterimApiWebHook;
//   webhookApiEnvironmentResponseList: Array<EnvironmentResponse>;
//   apiAppResponse: AppResponse
// }
export type TViewManagedAppWebhookList = {
  appId: CommonName;
  appDisplayName: CommonDisplayName;
  apiAppResponse: AppResponse;
  apiAppEnvironmentResponseList: Array<EnvironmentResponse>;
  managedWebhookList: Array<TAPViewManagedWebhook>;
  apWebhookStatus?: TAPWebhookStatus;
}

export enum EWebhookAuthMethodSelectIdNone { 
  NONE = 'None'
}

export enum E_CALL_STATE_ACTIONS {
  API_GET_USER_APP = "API_GET_USER_APP",
  API_UPDATE_USER_APP = "API_UPDATE_USER_APP",
}

const componentName = 'DeveloperPortalManageUserAppWebhooksCommon';

export const areWebhooksAvailable4App = (appEnvList: Array<AppEnvironment> | undefined): boolean => {
  if(!appEnvList) return false;
  let areAvailable: boolean = false;
  appEnvList.forEach( (appEnv: AppEnvironment) => {
    if(!areAvailable && appEnv.messagingProtocols) {
      const foundHttp = appEnv.messagingProtocols.find( (ep: Endpoint) => {
        if(ep.protocol) return (ep.protocol.name === Protocol.name.HTTP || ep.protocol.name === Protocol.name.HTTPS);
        return false;
      });
      if(foundHttp && appEnv.permissions && appEnv.permissions.subscribe) areAvailable = true;
    }
  });
  return areAvailable;
}
export const getNumberWebhooksUndefined4App = (definedApViewManagedWebhookList: TAPViewManagedWebhookList, availableEnvResponseList: Array<EnvironmentResponse>): number => {
  const funcName = 'getNumberWebhooksUndefined4App';
  const logName = `${componentName}.${funcName}()`;
  let envNameListWithWebhook: Array<string> = [];
  definedApViewManagedWebhookList.forEach( (apViewManagedWebhook: TAPViewManagedWebhook) => {
    apViewManagedWebhook.webhookApiEnvironmentResponseList.forEach( (envResponse: EnvironmentResponse) => {
      envNameListWithWebhook.push(envResponse.name);
    })
  });
  console.log(`${logName}: envNameListWithWebhook=${JSON.stringify(envNameListWithWebhook, null, 2)}`);
  let numberAvailableEnvs: number = 0;
  availableEnvResponseList.forEach( (envResponse: EnvironmentResponse) => {
    const found = envNameListWithWebhook.find( (envName: string) =>{
      return (envResponse.name === envName)
    });
    if(!found) numberAvailableEnvs++;
  });
  console.log(`${logName}: numberAvailableEnvs = ${numberAvailableEnvs}`)
  return numberAvailableEnvs;
}
export const createWebhookEnabledEnvironmentList = (appEnvList: Array<AppEnvironment> | undefined, envResponseList: Array<EnvironmentResponse>): TApiEntitySelectItemList => {
  const funcName = 'createWebhookEnabledEnvironmentList';
  const logName = `${componentName}.${funcName}()`;
  let entitySelectItemList: TApiEntitySelectItemList = [];
  if(!appEnvList) return entitySelectItemList;
  appEnvList.forEach( (appEnv: AppEnvironment) => {
    if(!appEnv.name) throw new Error(`${logName}: appEnv.name is undefined`);
    const envName = appEnv.name;
    const envResponse = envResponseList.find( (envResponse: EnvironmentResponse) => { return envResponse.name === envName; });
    const envDisplayName = envResponse && envResponse.displayName ? envResponse.displayName : envName;
    if(appEnv.messagingProtocols) {
      const foundHttp = appEnv.messagingProtocols.find( (ep: Endpoint) => {
        if(ep.protocol) return (ep.protocol.name === Protocol.name.HTTP || ep.protocol.name === Protocol.name.HTTPS);
        return false;
      });
      if(foundHttp) {
        if(appEnv.permissions) {
          if(appEnv.permissions.subscribe) {
            entitySelectItemList.push({
              id: appEnv.name,
              displayName: envDisplayName
            });
          }
        }
      }
    }
  });
  return entitySelectItemList;
}

