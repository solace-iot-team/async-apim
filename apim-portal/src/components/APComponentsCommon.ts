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
  EnvironmentResponse, 
  Protocol, 
  WebHook
} from '@solace-iot-team/apim-connector-openapi-browser';
import { TAPApiEntityRef } from './APApiObjectsCommon';
import { ApproveApp } from '../admin-portal/components/ManageApps/ApproveApp';
import { Globals } from '../utils/Globals';


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
  apiAppResponse_smf: AppResponse;
  apiAppResponse_mqtt: AppResponse;
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
    apiAppResponse_mqtt: AppResponse, 
    apiProductList: Array<APIProduct>, 
    apiAppEnvironmentResponseList: Array<EnvironmentResponse>,
    ): TAPManagedUserAppDisplay_Base => {
      // TODO: AppEnvironment.displayName
      // remove appEnvironmentResponseList from params when done
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
        apiAppResponse_smf: apiAppResponse_smf,
        apiAppResponse_mqtt: apiAppResponse_mqtt,
        apiProductList: apiProductList,
        apAppClientInformationList: _apAppClientInformationList,
        apManagedWebhookList: APManagedWebhook.createAPManagedWebhookListFromApiEntities(apiAppResponse_smf, apiAppEnvironmentResponseList),
        isAppWebhookCapable: APManagedUserAppDisplay.isAppWebhookCapable(apiAppResponse_smf.environments),
      }
      return _base;
  }

  public static createAPDeveloperPortalAppDisplayFromApiEntities = (
    apiAppResponse_smf: AppResponse, 
    apiAppResponse_mqtt: AppResponse, 
    apiProductList: Array<APIProduct>, 
    apiAppEnvironmentResponseList: Array<EnvironmentResponse>,
    ): TAPDeveloperPortalUserAppDisplay => {

      const _base = APManagedUserAppDisplay.createAPManagedUserAppDisplay_Base_From_ApiEntities(apiAppResponse_smf, apiAppResponse_mqtt, apiProductList, apiAppEnvironmentResponseList);
      return {
        ..._base,
        type: EAPManagedUserAppDisplay_Type.TAPDeveloperPortalUserAppDisplay
      }
    }
  
  public static createAPAdminPortalAppDisplayFromApiEntities = (
    apiAppResponse_smf: AppResponse, 
    apiAppResponse_mqtt: AppResponse, 
    apiProductList: Array<APIProduct>, 
    apiAppEnvironmentResponseList: Array<EnvironmentResponse>,
    apsUser: APSUser
    ): TAPAdminPortalUserAppDisplay => {

      const _base = APManagedUserAppDisplay.createAPManagedUserAppDisplay_Base_From_ApiEntities(apiAppResponse_smf, apiAppResponse_mqtt, apiProductList, apiAppEnvironmentResponseList);
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
  apiAppEnvironmentResponseList: Array<EnvironmentResponse>;
  apManagedWebhookList: TAPManagedWebhookList;  
}
export type TAPManagedWebhook = {
  references: {
    apiAppResponse: AppResponse;
    // TODO: AppEnvironment.displayName: remove reference
    apiAppEnvironmentResponseList: Array<EnvironmentResponse>;
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

  public static createAPManagedWebhookListFromApiWebhook = (apiWebhook: WebHook, appResponse: AppResponse, appEnvironmentResponseList: Array<EnvironmentResponse>): TAPManagedWebhookList => {
    // TODO: AppEnvironment.displayName
    // remove appEnvironmentResponseList from params when done
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

        // find the display name
        const envResponseWithDisplayName: EnvironmentResponse | undefined = appEnvironmentResponseList.find( (envResp: EnvironmentResponse) => {
          return (envName === envResp.name);
        });
        if(!envResponseWithDisplayName) throw new Error(`${logName}: envResponseWithDisplayName is undefined`);
        
        apManagedWebhookList.push({
          references: {
            apiAppResponse: appResponse,
            apiAppEnvironmentResponseList: appEnvironmentResponseList
          },
          webhookEnvironmentReference: {
            entityRef: {
              name: envName,
              displayName: envResponseWithDisplayName.displayName ? envResponseWithDisplayName.displayName : envName
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

        // find the display name
        const envResponseWithDisplayName: EnvironmentResponse | undefined = appEnvironmentResponseList.find( (envResp: EnvironmentResponse) => {
          return (appEnv.name === envResp.name);
        });
        if(!envResponseWithDisplayName) throw new Error(`${logName}: envResponseWithDisplayName is undefined`);

        apManagedWebhookList.push({
          references: {
            apiAppResponse: appResponse,
            apiAppEnvironmentResponseList: appEnvironmentResponseList
          },
          webhookEnvironmentReference: {
            entityRef: {
              name: appEnv.name,
              displayName: envResponseWithDisplayName.displayName ? envResponseWithDisplayName.displayName : envResponseWithDisplayName.name
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
  
  public static createAPManagedWebhookListFromApiEntities = (appResponse: AppResponse, appEnvironmentResponseList: Array<EnvironmentResponse>): TAPManagedWebhookList => {
    // TODO: AppEnvironment.displayName
    // remove appEnvironmentResponseList from params when done
    const funcName = 'createAPManagedWebhookListFromApiEntities';
    const logName = `${APManagedWebhook.name}.${funcName}()`;

    const apiAppWebhookList: Array<WebHook> = appResponse.webHooks ? appResponse.webHooks : [];
    let _apManagedWebhookList: TAPManagedWebhookList = [];
    apiAppWebhookList.forEach( (apiWebhook: WebHook) => {
      _apManagedWebhookList.push(
        ...APManagedWebhook.createAPManagedWebhookListFromApiWebhook(apiWebhook, appResponse, appEnvironmentResponseList)
      );
    });
    // now find the envs without a webhook and add a managedWebhook for each
    const appEnvList: Array<AppEnvironment> = appResponse.environments ? appResponse.environments : [];
    appEnvList.forEach( (appEnv: AppEnvironment) => {
      if(!appEnv.name) throw new Error(`${logName}: appEnv.name is undefined`);
      const found = _apManagedWebhookList.find( (wh: TAPManagedWebhook) => {
        return (wh.webhookEnvironmentReference.entityRef.name === appEnv.name);
      });
      if(!found) {

        // find the display name
        const envResponseWithDisplayName: EnvironmentResponse | undefined = appEnvironmentResponseList.find( (envResp: EnvironmentResponse) => {
          return (appEnv.name === envResp.name);
        });
        if(!envResponseWithDisplayName) throw new Error(`${logName}: envResponseWithDisplayName is undefined`);

        _apManagedWebhookList.push( {
          references: {
            apiAppResponse: appResponse,
            apiAppEnvironmentResponseList: appEnvironmentResponseList
          },
          webhookEnvironmentReference: {
            entityRef: {
              name: appEnv.name,
              displayName: envResponseWithDisplayName.displayName ? envResponseWithDisplayName.displayName : envResponseWithDisplayName.name
            },
            isEnvironmentWebhookCapable: APManagedUserAppDisplay.isAppEnvironmentWebhookCapable(appEnv)
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

  public static getNumberWebhooksUndefined4App = (existingAPManagedWebhookList: TAPManagedWebhookList, availableEnvResponseList: Array<EnvironmentResponse>): number => {
    // const funcName = 'getNumberWebhooksUndefined4App';
    // const logName = `${APManagedWebhook.name}.${funcName}()`;
    let envNameListWithWebhook: Array<string> = [];
    existingAPManagedWebhookList.forEach( (apManagedWebhook: TAPManagedWebhook) => {
      if(apManagedWebhook.webhookWithoutEnvs) envNameListWithWebhook.push(apManagedWebhook.webhookEnvironmentReference.entityRef.name);
    });
    // console.log(`${logName}: envNameListWithWebhook=${JSON.stringify(envNameListWithWebhook, null, 2)}`);
    let numberAvailableEnvs: number = 0;
    availableEnvResponseList.forEach( (envResponse: EnvironmentResponse) => {
      const found = envNameListWithWebhook.find( (envName: string) =>{
        return (envResponse.name === envName)
      });
      if(!found) numberAvailableEnvs++;
    });
    // console.log(`${logName}: numberAvailableEnvs = ${numberAvailableEnvs}`)
    return numberAvailableEnvs;
  }

  public static getNumberWebhooksDefined4App = (apManagedWebhookList: TAPManagedWebhookList): number => {
    // const funcName = 'getNumberWebhooksDefined4App';
    // const logName = `${APManagedWebhook.name}.${funcName}()`;
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
