import { DataTableSortOrderType } from 'primereact/datatable';
import { APSUser, EAPSSortDirection } from '@solace-iot-team/apim-server-openapi-browser';
import { 
  APIProduct,
  AppEnvironment,
  AppPatch,
  AppResponse,
  ClientInformationGuaranteedMessaging, 
  CommonDisplayName, 
  CommonName, 
  Endpoint, 
  Protocol, 
  WebHook
} from '@solace-iot-team/apim-connector-openapi-browser';
import { TAPApiEntityRef } from './APApiObjectsCommon';


export type TAPApiCallState = {
  success: boolean;
  isApiError?: boolean;
  error?: any;
  context: {
    action: string;
    userDetail: string;
  }  
}
export type TAPUserMessage = {
  success: boolean,
  context: {
    internalAction: string,
    userAction: string,
    userMessage: string
  }
}
export type TAPOrganization = {
  displayName: string,
  name: TAPOrganizationId,
  type: string,
  solaceCloudToken?: string,
  hasEnvironments: boolean,
  hasApis: boolean,
  hasApiProducts: boolean,
  hasDevelopers: boolean,
  hasApps: boolean
}
export type TAPOrganizationList = Array<TAPOrganization>;
export type TAPOrganizationId = string;
export type TAPOrganizationIdList = Array<TAPOrganizationId>;
export type TAPEnvironmentName = string;
export enum EAPAsyncApiSpecFormat {
  JSON = 'application/json',
  YAML = 'application/x-yaml',
  UNKNOWN = 'application/x-unknown'
}
export type TAPAsyncApiSpec = {
  format: EAPAsyncApiSpecFormat,
  spec: any
}

// * client information *
export type TAPAppClientInformation = {
  guaranteedMessaging: ClientInformationGuaranteedMessaging
  apiProductName: CommonName,
  apiProductDisplayName: CommonDisplayName
}
export type TAPAppClientInformationList = Array<TAPAppClientInformation>;

// trusted CNs
export type TAPTrustedCN = string;
export type TAPTrustedCNList = Array<TAPTrustedCN>;

// * App *

export enum EAPManagedUserAppDisplay_Type {
  TAPDeveloperPortalUserAppDisplay = "TAPDeveloperPortalUserAppDisplay",
  TAPAdminPortalUserAppDisplay = "TAPAdminPortalUserAppDisplay"
}
type TAPManagedUserAppDisplay_Base = {
  appName: CommonName;
  appDisplayName: CommonDisplayName;
  apiAppResponse_smf: AppResponse;
  apiAppResponse_mqtt?: AppResponse;
  apiProductList: Array<APIProduct>;
  apAppClientInformationList: TAPAppClientInformationList;
  apManagedWebhookList: TAPManagedWebhookList;  
  isAppWebhookCapable: boolean;
}
export type TAPDeveloperPortalUserAppDisplay = TAPManagedUserAppDisplay_Base & {
  type: EAPManagedUserAppDisplay_Type
};
export type TAPAdminPortalUserAppDisplay = TAPManagedUserAppDisplay_Base & {
  type: EAPManagedUserAppDisplay_Type
  apsUser: APSUser;
}

export class APManagedUserAppDisplay {

  public static getAppEnvironmentDisplayName = (appEnv: AppEnvironment): CommonDisplayName => {
    const funcName = 'getAppEnvironmentDisplayName';
    const logName = `${APManagedUserAppDisplay.name}.${funcName}()`;
    if(!appEnv.name) throw new Error(`${logName}: appEnv.name is undefined`);
    return appEnv.displayName ? appEnv.displayName : appEnv.name;
  }

  public static isAppEnvironmentWebhookCapable = (appEnv: AppEnvironment): boolean => {
    let isCapable: boolean = false;
    if(appEnv.messagingProtocols) {
      const foundHttp = appEnv.messagingProtocols.find( (ep: Endpoint) => {
        if(ep.protocol) return (ep.protocol.name === Protocol.name.HTTP || ep.protocol.name === Protocol.name.HTTPS);
        return false;
      });
      if(foundHttp && appEnv.permissions && appEnv.permissions.subscribe) isCapable = true;
    }
    return isCapable;
  }

  public static isAppWebhookCapable = (appEnvList: Array<AppEnvironment> | undefined): boolean => {
    if(!appEnvList) return false;
    let isCapable: boolean = false;
    appEnvList.forEach( (appEnv: AppEnvironment) => {
      if(!isCapable && APManagedUserAppDisplay.isAppEnvironmentWebhookCapable(appEnv)) isCapable = true;
    });
    return isCapable;
  }

  private static createAPManagedUserAppDisplay_Base_From_ApiEntities = (
    apiAppResponse_smf: AppResponse, 
    apiProductList: Array<APIProduct>,
    apiAppResponse_mqtt?: AppResponse, 
    ): TAPManagedUserAppDisplay_Base => {
      const funcName = 'createAPManagedUserAppDisplayFromApiEntities';
      const logName = `${APManagedWebhook.name}.${funcName}()`;

      // add apiProductDisplayName to ClientInformation
      let _apAppClientInformationList: TAPAppClientInformationList = [];
      if(apiAppResponse_smf.clientInformation) {
        for (const ci of apiAppResponse_smf.clientInformation) {
          if(ci.guaranteedMessaging) {
            const found = apiProductList.find( (apiProduct: APIProduct) => {
              return (apiProduct.name === ci.guaranteedMessaging?.apiProduct)
            });
            if(!found) throw new Error(`${logName}: could not find ci.guaranteedMessaging.apiProduct=${ci.guaranteedMessaging.apiProduct} in apiProductList=${JSON.stringify(apiProductList)}`);
            const _apAppClientInformation: TAPAppClientInformation = {
              guaranteedMessaging: ci.guaranteedMessaging,
              apiProductName: found.name,
              apiProductDisplayName: found.displayName
            }
            _apAppClientInformationList.push(_apAppClientInformation);
          }
        }
      }
    
      const _base: TAPManagedUserAppDisplay_Base = {
        appName: apiAppResponse_smf.name,
        appDisplayName: apiAppResponse_smf.displayName ? apiAppResponse_smf.displayName : apiAppResponse_smf.name,
        apiAppResponse_smf: apiAppResponse_smf,
        apiAppResponse_mqtt: apiAppResponse_mqtt,
        apiProductList: apiProductList,
        apAppClientInformationList: _apAppClientInformationList,
        apManagedWebhookList: APManagedWebhook.createAPManagedWebhookListFromApiEntities(apiAppResponse_smf),
        isAppWebhookCapable: APManagedUserAppDisplay.isAppWebhookCapable(apiAppResponse_smf.environments),
      }
      return _base;
  }

  public static createAPDeveloperPortalAppDisplayFromApiEntities = (
    apiAppResponse_smf: AppResponse, 
    apiProductList: Array<APIProduct>,
    apiAppResponse_mqtt?: AppResponse 
    ): TAPDeveloperPortalUserAppDisplay => {

      const _base = APManagedUserAppDisplay.createAPManagedUserAppDisplay_Base_From_ApiEntities(apiAppResponse_smf, apiProductList, apiAppResponse_mqtt);
      return {
        ..._base,
        type: EAPManagedUserAppDisplay_Type.TAPDeveloperPortalUserAppDisplay
      }
    }
  
  public static createAPAdminPortalAppDisplayFromApiEntities = (
    apiAppResponse_smf: AppResponse, 
    apiAppResponse_mqtt: AppResponse, 
    apiProductList: Array<APIProduct>,
    apsUser: APSUser
    ): TAPAdminPortalUserAppDisplay => {

      const _base = APManagedUserAppDisplay.createAPManagedUserAppDisplay_Base_From_ApiEntities(apiAppResponse_smf, apiProductList, apiAppResponse_mqtt);
      return {
        ..._base,
        type: EAPManagedUserAppDisplay_Type.TAPAdminPortalUserAppDisplay,
        apsUser: apsUser
      }
    }    
}


// * webhook *
export type TAPWebhookStatus = {
  summaryStatus: boolean;
  details: any;
}
export type TAPManagedAppWebhooks = {
  appId: CommonName;
  appDisplayName: CommonDisplayName;
  apiAppResponse: AppResponse;
  apManagedWebhookList: TAPManagedWebhookList;  
}
export type TAPManagedWebhook = {
  references: {
    apiAppResponse: AppResponse;
  }
  webhookEnvironmentReference: {
    entityRef: TAPApiEntityRef;
    isEnvironmentWebhookCapable: boolean;
  };
  webhookWithoutEnvs?: WebHook; // if undefined, a potential webhook for the env
  webhookStatus?: TAPWebhookStatus;
}
export type TAPManagedWebhookList = Array<TAPManagedWebhook>;

export class APManagedWebhook {

  public static createAPManagedWebhookListFromApiWebhook = (apiWebhook: WebHook, appResponse: AppResponse): TAPManagedWebhookList => {
    const funcName = 'createAPManagedWebhookListFromApiWebhook';
    const logName = `${APManagedWebhook.name}.${funcName}()`;
    const appEnvList: Array<AppEnvironment> = appResponse.environments ? appResponse.environments : [];
    let apManagedWebhookList: TAPManagedWebhookList = [];
    if(apiWebhook.environments) {
      apiWebhook.environments.forEach( (envName: CommonName) => {
        const appEnv: AppEnvironment | undefined = appEnvList.find( (appEnv: AppEnvironment) => {
          return (envName === appEnv.name);
        });
        if(!appEnv) throw new Error(`${logName}: appEnv is undefined`);
        
        apManagedWebhookList.push({
          references: {
            apiAppResponse: appResponse,
          },
          webhookEnvironmentReference: {
            entityRef: {
              name: envName,
              displayName: appEnv.displayName ? appEnv.displayName : envName
            },
            isEnvironmentWebhookCapable: APManagedUserAppDisplay.isAppEnvironmentWebhookCapable(appEnv)
          },
          webhookWithoutEnvs: {
            ...apiWebhook,
            environments: undefined
          }
        });
      });
    } else {
      // create one for every environment
      appEnvList.forEach( (appEnv: AppEnvironment) => {
        if(!appEnv.name) throw new Error(`${logName}: appEnv.name is undefined`);
        apManagedWebhookList.push({
          references: {
            apiAppResponse: appResponse,
          },
          webhookEnvironmentReference: {
            entityRef: {
              name: appEnv.name,
              displayName: appEnv.displayName ? appEnv.displayName : appEnv.name
            },
            isEnvironmentWebhookCapable: APManagedUserAppDisplay.isAppEnvironmentWebhookCapable(appEnv)
          },
          webhookWithoutEnvs: {
            ...apiWebhook,
            environments: undefined
          }
        });
      });
    }
    return apManagedWebhookList;
  }
  
  public static createAPManagedWebhookListFromApiEntities = (appResponse: AppResponse): TAPManagedWebhookList => {
    const funcName = 'createAPManagedWebhookListFromApiEntities';
    const logName = `${APManagedWebhook.name}.${funcName}()`;

    const apiAppWebhookList: Array<WebHook> = appResponse.webHooks ? appResponse.webHooks : [];
    let _apManagedWebhookList: TAPManagedWebhookList = [];
    apiAppWebhookList.forEach( (apiWebhook: WebHook) => {
      _apManagedWebhookList.push(
        ...APManagedWebhook.createAPManagedWebhookListFromApiWebhook(apiWebhook, appResponse)
      );
    });
    // now find the envs without a webhook and add a managedWebhook for each, if env is webhook capable
    const appEnvList: Array<AppEnvironment> = appResponse.environments ? appResponse.environments : [];
    appEnvList.forEach( (appEnv: AppEnvironment) => {
      const _isAppEnvWebhookCapable: boolean = APManagedUserAppDisplay.isAppEnvironmentWebhookCapable(appEnv);
      if(!_isAppEnvWebhookCapable) return;
      if(!appEnv.name) throw new Error(`${logName}: appEnv.name is undefined`);
      const found = _apManagedWebhookList.find( (wh: TAPManagedWebhook) => {
        return (wh.webhookEnvironmentReference.entityRef.name === appEnv.name);
      });
      if(!found) {
        _apManagedWebhookList.push( {
          references: {
            apiAppResponse: appResponse,
          },
          webhookEnvironmentReference: {
            entityRef: {
              name: appEnv.name,
              displayName: appEnv.displayName ? appEnv.displayName : appEnv.name
            },
            isEnvironmentWebhookCapable: true
          },
          webhookWithoutEnvs: undefined,
          webhookStatus: undefined,
        })
      }
    });
    return _apManagedWebhookList;
  }

  private static createApiWebHookListFromAPManagedWebhookList = (apManagedWebhookList: TAPManagedWebhookList): Array<WebHook> => {
    let apiWebhookList: Array<WebHook> = [];
    apManagedWebhookList.forEach( (apManagedWebhook: TAPManagedWebhook) => {
      if(apManagedWebhook.webhookWithoutEnvs) {
        const apiWebHook: WebHook = {
          ...apManagedWebhook.webhookWithoutEnvs,
          environments: [apManagedWebhook.webhookEnvironmentReference.entityRef.name],
        }
        apiWebhookList.push(apiWebHook);
      }
    });
    return apiWebhookList;
  }
  public static createApiAppUpdateRequestBodyFromAPManagedAppWebhooks = (apManagedAppWebhooks: TAPManagedAppWebhooks, newManagedWebhookList: TAPManagedWebhookList): AppPatch => {
    const appResponse = apManagedAppWebhooks.apiAppResponse;
    const appPatch: AppPatch = {
        apiProducts: appResponse.apiProducts,
        attributes: appResponse.attributes,
        callbackUrl: appResponse.callbackUrl,
        credentials: appResponse.credentials,
        displayName: appResponse.displayName,
        webHooks: APManagedWebhook.createApiWebHookListFromAPManagedWebhookList(newManagedWebhookList)
      };
    return appPatch;
  }
  public static createNewManagedWebhookList = (apManagedAppWebhooks: TAPManagedAppWebhooks, newManagedWebhook: TAPManagedWebhook): TAPManagedWebhookList => {
    // creates a new array
    const _newMWHList: TAPManagedWebhookList = apManagedAppWebhooks.apManagedWebhookList.concat([]);
    const idx: number = _newMWHList.findIndex( (mwh: TAPManagedWebhook) => {
      return (mwh.webhookEnvironmentReference.entityRef.name === newManagedWebhook.webhookEnvironmentReference.entityRef.name);
    });
    if(idx > -1) _newMWHList.splice(idx, 1, newManagedWebhook);
    else _newMWHList.push(newManagedWebhook);
    return _newMWHList;
  }

  public static getNumberWebhooksDefined4App = (apManagedWebhookList: TAPManagedWebhookList): number => {
    let numDefined: number = 0;
    apManagedWebhookList.forEach( (mhw: TAPManagedWebhook) => {
      if(mhw.webhookWithoutEnvs) numDefined++;
    });
    return numDefined;
  }
}

export type TAPLazyLoadingTableParameters = {
  isInitialSetting: boolean, // differentiate between first time and subsequent times
  first: number, // index of the first row to be displayed
  rows: number, // number of rows to display per page
  page: number,
  sortField: string,
  sortOrder: DataTableSortOrderType
}

export type TApiEntitySelectItem = {
  id: string,
  displayName: string
}
export type TApiEntitySelectItemList = Array<TApiEntitySelectItem>;
export type TApiEntitySelectItemIdList = Array<string>;

export enum EFileDownloadType {
  JSON='application/json',
  YAML='application/x-yaml'
}
export enum EFileExtension {
  JSON='json',
  YAML='yaml'
}

export class APComponentsCommon {

  public static transformTableSortDirectionToApiSortDirection = (tableSortDirection: DataTableSortOrderType): EAPSSortDirection => {
    return tableSortDirection === 1 ? EAPSSortDirection.ASC : EAPSSortDirection.DESC;
  }

  public static transformSelectItemListToSelectItemIdList = (selectItemList: TApiEntitySelectItemList): TApiEntitySelectItemIdList => {
    return selectItemList.map( (selectItem: TApiEntitySelectItem) => {
      return selectItem.id;
    });
  }
  
}
