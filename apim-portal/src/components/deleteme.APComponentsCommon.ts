import { DataTableSortOrderType } from 'primereact/datatable';
import { 
  APSUserResponse, 
  EAPSSortDirection 
} from "../_generated/@solace-iot-team/apim-server-openapi-browser";
import { 
  APIInfo,
  APIProduct,
  AppConnectionStatus,
  AppEnvironment,
  AppEnvironmentStatus,
  AppPatch,
  AppResponse,
  AppStatus,
  ClientInformationGuaranteedMessaging, 
  CommonDisplayName, 
  CommonEntityNameList, 
  CommonName, 
  Endpoint, 
  EnvironmentResponse, 
  Protocol, 
  WebHook,
  WebHookStatus
} from '@solace-iot-team/apim-connector-openapi-browser';
import { Globals } from '../utils/Globals';
import { APRenderUtils } from '../utils/APRenderUtils';
import { APContextError } from '../utils/APError';
import { TAPAsyncApiSpec } from '../utils/APTypes';
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
export type TAPOrganizationId = string;
export type TAPOrganizationIdList = Array<TAPOrganizationId>;
export type TAPEnvironmentName = string;

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

export enum EAPPortalDisplay_Type {
  TAPDeveloperPortalDisplay = "TAPDeveloperPortalDisplay",
  TAPAdminPortalDisplay = "TAPAdminPortalDisplay"
}

// * Apis *
type TAPManagedApiDisplay_Base = {
  apName: CommonName;
  apDisplayName: CommonDisplayName;
  apiApiInfo: APIInfo;
  apiUsedBy_ApiProductEntityNameList: CommonEntityNameList;
  apAsyncApiSpec?: TAPAsyncApiSpec;
}
export type TAPDeveloperPortalApiDisplay = TAPManagedApiDisplay_Base & {
  apPortalDisplayType: EAPPortalDisplay_Type;
};
// export type TAPAdminPortalApiDisplay = TAPManagedApiDisplay_Base & {
//   apPortalDisplayType: EAPPortalDisplay_Type;
// }
export type TAPApiDisplay = TAPDeveloperPortalApiProductDisplay;

// export type TAPAdminPortalApiDisplay = TAPManagedApiDisplay_Base & {
  //   apPortalDisplayType: EAPPortalDisplay_Type;
  // }
// export type TAPApiDisplay = TAPDeveloperPortalApiProductDisplay | TAPAdminPortalApiProductDisplay;
  
export class APManagedApiDisplay {

  private static createAPManagedApiDisplay_Base_From_ApiEntities = (apiInfo: APIInfo, apiApiProductEntityNameList: CommonEntityNameList, apAsyncApiSpec?: TAPAsyncApiSpec): TAPManagedApiDisplay_Base => {
      const _base: TAPManagedApiDisplay_Base = {
        apName: apiInfo.name,
        apDisplayName: apiInfo.name,
        apiApiInfo: apiInfo,
        apiUsedBy_ApiProductEntityNameList: apiApiProductEntityNameList,
        apAsyncApiSpec: apAsyncApiSpec
      }
      return _base;
  }
  public static createAPDeveloperPortalApiDisplayFromApiEntities = (apiInfo: APIInfo, apiApiProductEntityNameList: CommonEntityNameList, apAsyncApiSpec?: TAPAsyncApiSpec): TAPDeveloperPortalApiDisplay => {
    const _base: TAPManagedApiDisplay_Base = APManagedApiDisplay.createAPManagedApiDisplay_Base_From_ApiEntities(apiInfo, apiApiProductEntityNameList, apAsyncApiSpec);
    return {
      ..._base,
      apPortalDisplayType: EAPPortalDisplay_Type.TAPDeveloperPortalDisplay,
    }
  }

}

// * API Product *
type TAPManagedApiProductDisplay_Base = {
  apApiProductName: CommonName;
  apApiProductDisplayName: CommonDisplayName;
  apiApiProduct: APIProduct;
  apiEnvironmentList: Array<EnvironmentResponse>;
}
export type TAPDeveloperPortalApiProductDisplay = TAPManagedApiProductDisplay_Base & {
  apPortalDisplayType: EAPPortalDisplay_Type;
};
// export type TAPAdminPortalApiProductDisplay = TAPManagedApiProductDisplay_Base & {
//   apPortalDisplayType: EAPPortalDisplay_Type;
// }
// export type TAPApiProductDisplay = TAPDeveloperPortalApiProductDisplay | TAPAdminPortalApiProductDisplay;
export type TAPApiProductDisplay = TAPDeveloperPortalApiProductDisplay;

export class APManagedApiProductDisplay {
  public static generateGlobalSearchContent = (apManagedApiProductDisplay: TAPApiProductDisplay): string => {
    const filtered = {
      ...apManagedApiProductDisplay,
    }
    return Globals.generateDeepObjectValuesString(filtered).toLowerCase();
  }
  public static getApApiDisplayNameListAsString = (apiDisplayNameList: Array<CommonDisplayName> ): string => {
    if(apiDisplayNameList) return apiDisplayNameList.join(', ');
    else return '';
  }
  public static getApProtocolListAsString = (apiProtocolList?: Array<Protocol> ): string => {
    return APRenderUtils.getProtocolListAsString(apiProtocolList);
  }
  public static getApEnvironmentsAsDisplayList = (apiEnvironmentList: Array<EnvironmentResponse>): Array<string> => {
    return apiEnvironmentList.map( (envResp: EnvironmentResponse) => {
      return `${envResp.displayName} (${envResp.datacenterProvider}:${envResp.datacenterId})`
    });
  }
  private static createAPManagedApiProductDisplay_Base_From_ApiEntities = (apiApiProduct: APIProduct, apiEnvRespList: Array<EnvironmentResponse>): TAPManagedApiProductDisplay_Base => {
      const _base: TAPManagedApiProductDisplay_Base = {
        apApiProductName: apiApiProduct.name,
        apApiProductDisplayName: apiApiProduct.displayName,
        apiApiProduct: apiApiProduct,
        apiEnvironmentList: apiEnvRespList
      }
      return _base;
  }
  public static createAPDeveloperPortalApiProductDisplayFromApiEntities = (apiApiProduct: APIProduct, apiEnvRespList: Array<EnvironmentResponse>): TAPDeveloperPortalApiProductDisplay => {
    const _base = APManagedApiProductDisplay.createAPManagedApiProductDisplay_Base_From_ApiEntities(apiApiProduct, apiEnvRespList);
    return {
      ..._base,
      apPortalDisplayType: EAPPortalDisplay_Type.TAPDeveloperPortalDisplay,
    }
  }
}
 
// * App *
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
  apPortalDisplayType: EAPPortalDisplay_Type;
};
export type TAPAdminPortalUserAppDisplay = TAPManagedUserAppDisplay_Base & {
  apPortalDisplayType: EAPPortalDisplay_Type;
  apsUser: APSUserResponse;
}

export class APManagedUserAppDisplay {

  public static getEnvironmentDisplayNameListFromNameList = (envNameList: Array<CommonName>, appEnvList: Array<AppEnvironment>): Array<CommonDisplayName> => {
    const funcName = 'getEnvironmentDisplayNameListFromNameList';
    const logName = `${APManagedUserAppDisplay.name}.${funcName}()`;
    let appEnvDisplayNameList: Array<CommonDisplayName> = [];
    envNameList.forEach( (envName: CommonName) => {
      const found = appEnvList.find( (appEnv: AppEnvironment) => {
        return appEnv.name === envName;
      });
      if(!found) throw new Error(`${logName}: found is undefined`);
      if(!found.displayName) throw new Error(`${logName}: found.displayName is undefined`);
      appEnvDisplayNameList.push(found.displayName);
    });
    return appEnvDisplayNameList;
  }
  public static getAppEnvironmentDisplayNameList = (appEnvList: Array<AppEnvironment>): Array<CommonDisplayName> => {
    const funcName = 'getAppEnvironmentDisplayNameList';
    const logName = `${APManagedUserAppDisplay.name}.${funcName}()`;
    return appEnvList.map( (appEnv: AppEnvironment) => {
      if(!appEnv.displayName) throw new Error(`${logName}: appEnv.displayName is undefined`);
      return appEnv.displayName;
    });
  }
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
      if(foundHttp && appEnv.permissions && appEnv.permissions.publish && appEnv.permissions.publish.length > 0) isCapable = true;
    }
    return isCapable;
  }

  public static isAppLive = (apiAppResponse: AppResponse): boolean => {
    if(apiAppResponse.status && apiAppResponse.status === AppStatus.APPROVED) return true;
    return false;
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
    apiAppConnectionStatus: AppConnectionStatus,
    apiAppResponse_mqtt?: AppResponse
    ): TAPManagedUserAppDisplay_Base => {
      const funcName = 'createAPManagedUserAppDisplay_Base_From_ApiEntities';
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
        apManagedWebhookList: APManagedWebhook.createAPManagedWebhookListFromApiEntities(apiAppResponse_smf, apiAppConnectionStatus),
        isAppWebhookCapable: APManagedUserAppDisplay.isAppWebhookCapable(apiAppResponse_smf.environments),
      }
      return _base;
  }

  public static createAPDeveloperPortalAppDisplayFromApiEntities = (
    apiAppResponse_smf: AppResponse, 
    apiProductList: Array<APIProduct>,
    apiAppConnectionStatus: AppConnectionStatus,
    apiAppResponse_mqtt?: AppResponse
    ): TAPDeveloperPortalUserAppDisplay => {

      const _base = APManagedUserAppDisplay.createAPManagedUserAppDisplay_Base_From_ApiEntities(apiAppResponse_smf, apiProductList, apiAppConnectionStatus, apiAppResponse_mqtt);
      return {
        ..._base,
        apPortalDisplayType: EAPPortalDisplay_Type.TAPDeveloperPortalDisplay
      }
    }
  
  public static createAPAdminPortalAppDisplayFromApiEntities = (
    apiAppResponse_smf: AppResponse, 
    apiAppResponse_mqtt: AppResponse, 
    apiProductList: Array<APIProduct>,
    apiAppConnectionStatus: AppConnectionStatus,
    apsUser: APSUserResponse
    ): TAPAdminPortalUserAppDisplay => {

      const _base = APManagedUserAppDisplay.createAPManagedUserAppDisplay_Base_From_ApiEntities(apiAppResponse_smf, apiProductList, apiAppConnectionStatus, apiAppResponse_mqtt);
      return {
        ..._base,
        apPortalDisplayType: EAPPortalDisplay_Type.TAPAdminPortalDisplay,
        apsUser: apsUser
      }
    }    
}
  

// * webhook *
export type TAPWebhookStatus = {
  summaryStatus: boolean;
  apiWebhookStatus: WebHookStatus;
}
export type TAPManagedAppWebhooks = {
  appId: CommonName;
  appDisplayName: CommonDisplayName;
  apiAppResponse: AppResponse;
  apManagedWebhookList: TAPManagedWebhookList;  
  apiAppConnectionStatus?: AppConnectionStatus
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

  private static getAPWebhookStatus = (envName: CommonName, appConnectionStatus: AppConnectionStatus): TAPWebhookStatus | undefined => {
    const funcName = 'getAPWebhookStatus';
    const logName = `${APManagedWebhook.name}.${funcName}()`;

    if(appConnectionStatus.environments === undefined) return undefined;

    const found = appConnectionStatus.environments.find( (appEnvStatus: AppEnvironmentStatus) => {
      return (envName === appEnvStatus.name);
    });
    if(found && found.webHooks) {
      if(found.webHooks.length !== 1) throw new Error(`${logName}: each environment can only have exactly 1 webhook, but it has ${found.webHooks.length} webhooks`);
      if(found.webHooks[0].up === undefined) throw new Error(`${logName}: found.webHooks[0].up is undefined`);
      const apWebhookStatus: TAPWebhookStatus = {
        summaryStatus: found.webHooks[0].up,
        apiWebhookStatus: found.webHooks[0]
      }
      return apWebhookStatus;
    }
    return undefined;
  }
  public static createAPManagedWebhookListFromApiWebhook = (apiWebhook: WebHook, appResponse: AppResponse, appConnectionStatus: AppConnectionStatus): TAPManagedWebhookList => {
    const funcName = 'createAPManagedWebhookListFromApiWebhook';
    const logName = `${APManagedWebhook.name}.${funcName}()`;
    const appEnvList: Array<AppEnvironment> = appResponse.environments ? appResponse.environments : [];
    let apManagedWebhookList: TAPManagedWebhookList = [];
    if(apiWebhook.environments) {
      apiWebhook.environments.forEach( (envName: CommonName) => {
        const appEnv: AppEnvironment | undefined = appEnvList.find( (appEnv: AppEnvironment) => {
          return (envName === appEnv.name);
        });
        if(!appEnv) throw new APContextError(logName, 'appEnv is undefined', { apiWebhook: apiWebhook, appResponse: appResponse });        
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
          },
          webhookStatus: APManagedWebhook.getAPWebhookStatus(envName, appConnectionStatus)
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
  
  public static createAPManagedWebhookListFromApiEntities = (appResponse: AppResponse, appConnectionStatus: AppConnectionStatus): TAPManagedWebhookList => {
    const funcName = 'createAPManagedWebhookListFromApiEntities';
    const logName = `${APManagedWebhook.name}.${funcName}()`;

    const apiAppWebhookList: Array<WebHook> = appResponse.webHooks ? appResponse.webHooks : [];
    let _apManagedWebhookList: TAPManagedWebhookList = [];
    apiAppWebhookList.forEach( (apiWebhook: WebHook) => {
      _apManagedWebhookList.push(
        ...APManagedWebhook.createAPManagedWebhookListFromApiWebhook(apiWebhook, appResponse, appConnectionStatus)
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
  public static createApiAppWebhookUpdateRequestBodyFromAPManagedAppWebhooks = (_apManagedAppWebhooks: TAPManagedAppWebhooks, newManagedWebhookList: TAPManagedWebhookList): AppPatch => {
    const appPatch: AppPatch = {
        webHooks: APManagedWebhook.createApiWebHookListFromAPManagedWebhookList(newManagedWebhookList)
      };
    return appPatch;
  }
  // public static createApiAppUpdateRequestBodyFromAPManagedAppWebhooks = (apManagedAppWebhooks: TAPManagedAppWebhooks, newManagedWebhookList: TAPManagedWebhookList): AppPatch => {
  //   const appResponse = apManagedAppWebhooks.apiAppResponse;
  //   const appPatch: AppPatch = {
  //       apiProducts: appResponse.apiProducts,
  //       attributes: appResponse.attributes,
  //       callbackUrl: appResponse.callbackUrl,
  //       credentials: appResponse.credentials,
  //       displayName: appResponse.displayName,
  //       webHooks: APManagedWebhook.createApiWebHookListFromAPManagedWebhookList(newManagedWebhookList)
  //     };
  //   return appPatch;
  // }
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

// export enum EFileDownloadType {
//   JSON='application/json',
//   YAML='application/x-yaml'
// }
// export enum EFileExtension {
//   JSON='json',
//   YAML='yaml'
// }

export class APComponentsCommon {

  // TODO: delete me: moved to APDisplayUtils.tsx
  public static transformTableSortDirectionToApiSortDirection = (tableSortDirection: DataTableSortOrderType): EAPSSortDirection => {
    return tableSortDirection === 1 ? EAPSSortDirection.ASC : EAPSSortDirection.DESC;
  }

  public static transformSelectItemListToSelectItemIdList = (selectItemList: TApiEntitySelectItemList): TApiEntitySelectItemIdList => {
    return selectItemList.map( (selectItem: TApiEntitySelectItem) => {
      return selectItem.id;
    });
  }
  
}
