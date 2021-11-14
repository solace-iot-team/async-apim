import { DataTableSortOrderType } from 'primereact/datatable';
import { EAPSSortDirection } from '@solace-iot-team/apim-server-openapi-browser';
import { 
  AppPatch,
  AppResponse,
  ClientInformationGuaranteedMessaging, 
  CommonDisplayName, 
  CommonName, 
  EnvironmentResponse, 
  WebHook
} from '@solace-iot-team/apim-connector-openapi-browser';

export type TAPEntity = {
  name: string,
  displayName: string
}

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

// * webhook *
export type TAPWebhookStatus = {
  summaryStatus: boolean;
  details: any;
}
export type TAPViewManagedWebhook = {
  apSynthId: string;
  apiWebHook: WebHook;
  webhookApiEnvironmentResponseList: Array<EnvironmentResponse>;
  apiAppResponse: AppResponse;
  apWebhookStatus?: TAPWebhookStatus;
}
export type TAPViewManagedWebhookList = Array<TAPViewManagedWebhook>;

export type TAPManagedWebhook = {
  environment: TAPEntity,
  apiWebhookWithoutEnvs: WebHook
}
// export type TAPManagedWebhook = TAPManagedWebhookNoId & {
//   id: string;
// }
export type TAPManagedWebhookList = Array<TAPManagedWebhook>;

export type TAPTrustedCN = string;
export type TAPTrustedCNList = Array<TAPTrustedCN>;

export class APManagedWebhook {

  // private static createManagedWebhookId = (apManagedWebhook: TAPManagedWebhook): string => {
  //   return `${apManagedWebhook.environment.name}+${apManagedWebhook}`;
  // }
  private static createApiWebHooksFromManagedWebhookList = (apManagedWebhookList: TAPManagedWebhookList): Array<WebHook> => {
    let apiWebhookList: Array<WebHook> = [];
    apManagedWebhookList.forEach( (apManagedWebhook: TAPManagedWebhook) => {
      const apiWebHook: WebHook = {
        ...apManagedWebhook.apiWebhookWithoutEnvs,
        environments: [apManagedWebhook.environment.name]
      }
      apiWebhookList.push(apiWebHook);
    });
    return apiWebhookList;
  }
  public static createApiAppUpdateRequestBodyFromManagedWebhookList = (apiAppResponse: AppResponse, apManagedWebhookList: TAPManagedWebhookList): AppPatch => {
    const appPatch: AppPatch = {
        apiProducts: apiAppResponse.apiProducts,
        attributes: apiAppResponse.attributes,
        callbackUrl: apiAppResponse.callbackUrl,
        credentials: apiAppResponse.credentials,
        displayName: apiAppResponse.displayName,
        webHooks: APManagedWebhook.createApiWebHooksFromManagedWebhookList(apManagedWebhookList)
      };
    return appPatch;
  }
  public static createAPManagedWebhookListFromApiWebhook = (apiWebhook: WebHook, apiAppEnvironmentResponseList: Array<EnvironmentResponse>): TAPManagedWebhookList => {
    const funcName = 'createAPManagedWebhookListFromApiWebhook';
    const logName = `${APManagedWebhook.name}.${funcName}()`;
    let apManagedWebhookList: TAPManagedWebhookList = [];
    if(apiWebhook.environments) {
      apiWebhook.environments.forEach( (envName: CommonName) => {
        const found: EnvironmentResponse | undefined = apiAppEnvironmentResponseList.find( (envResp: EnvironmentResponse) => {
          return (envName === envResp.name);
        });
        if(!found) throw new Error(`${logName}: found is undefined`);
        // const mwhNoId: TAPManagedWebhookNoId = {
        //   environment: {
        //     name: envName,
        //     displayName: found.displayName ? found.displayName : envName
        //   },
        //   webhookWithoutEnvs: {
        //     ...apiWebhook,
        //     environments: undefined
        //   }
        // };
        // apManagedWebhookList.push({
        //   id: JSON.stringify(mwhNoId),
        //   ...mwhNoId
        // });
        apManagedWebhookList.push({
          environment: {
            name: envName,
            displayName: found.displayName ? found.displayName : envName
          },
          apiWebhookWithoutEnvs: {
            ...apiWebhook,
            environments: undefined
          }
        });
      });
    } else {
      apiAppEnvironmentResponseList.forEach( (envResp: EnvironmentResponse) => {
        // const mwhNoId: TAPManagedWebhookNoId = {
        //   environment: {
        //     name: envResp.name,
        //     displayName: envResp.displayName ? envResp.displayName : envResp.name
        //   },
        //   webhookWithoutEnvs: {
        //     ...apiWebhook
        //   }
        // };
        // apManagedWebhookList.push({
        //   id: JSON.stringify(mwhNoId),
        //   ...mwhNoId
        // })
        apManagedWebhookList.push({
          environment: {
            name: envResp.name,
            displayName: envResp.displayName ? envResp.displayName : envResp.name
          },
          apiWebhookWithoutEnvs: {
            ...apiWebhook
          }
        });
      });
    }
    return apManagedWebhookList;
  }
  public static createAPManagedWebhookListFromApiWebhookList = (apiWebhookList: Array<WebHook>, apiAppEnvironmentResponseList: Array<EnvironmentResponse>): TAPManagedWebhookList => {
    const funcName = 'createAPManagedWebhookListFromApiWebhookList';
    const logName = `${APManagedWebhook.name}.${funcName}()`;
    let apManagedWebhookList: TAPManagedWebhookList = [];
    apiWebhookList.forEach( (apiWebhook: WebHook) => {
      apManagedWebhookList.push(
        ...APManagedWebhook.createAPManagedWebhookListFromApiWebhook(apiWebhook, apiAppEnvironmentResponseList)
      );
    });
    return apManagedWebhookList;
  }

  public static createFullyQualifiedApiWebhook = (apiWebhook: WebHook, apiAppEnvironmentResponseList: Array<EnvironmentResponse>): WebHook => {
    // adds all environments to apiWebhook if none defined
    if(!apiWebhook.environments) {
      return  {
        ...apiWebhook,
        environments: apiAppEnvironmentResponseList.map( (envResp: EnvironmentResponse) => {
          return envResp.name;
        })
      };
    } else {
      return apiWebhook;
    }
  }
  public static createFullyQualifiedApiWebhookList = (apiWebhookList: Array<WebHook>, apiAppEnvironmentResponseList: Array<EnvironmentResponse>): Array<WebHook> => {
    // adds all environments to apiWebhooks if none defined
    return apiWebhookList.map( (apiWebhook: WebHook) => {
      if(!apiWebhook.environments) {
        return {
          ...apiWebhook,
          environments: apiAppEnvironmentResponseList.map( (envResp: EnvironmentResponse) => {
            return envResp.name;
          })
        }
      } else {
        return apiWebhook;
      }
    });
  }

  public static createManagedWebhook = (apiAppResponse: AppResponse, apiWebHook: WebHook, apiAppEnvironmentResponseList: Array<EnvironmentResponse>): TAPViewManagedWebhook => {
    const funcName = 'createManagedWebhook';
    const logName = `${APManagedWebhook.name}.${funcName}()`;
    let _webhookApiEnvironmentResponseList: Array<EnvironmentResponse> = [];
    if(!apiWebHook.environments){
      // this means ALL environments
      _webhookApiEnvironmentResponseList = apiAppEnvironmentResponseList;
    } else {
      apiWebHook.environments?.forEach( (envName: string) => {
        const found: EnvironmentResponse | undefined = apiAppEnvironmentResponseList.find( (envResponse: EnvironmentResponse) => {
          return (envResponse.name === envName)
        });
        if(!found) throw new Error(`${logName}: cound not find webhook env=${envName} in app environment list: ${JSON.stringify(apiAppEnvironmentResponseList)}`);
        _webhookApiEnvironmentResponseList.push(found);
      });
    }
    const viewManagedWebhook: TAPViewManagedWebhook = {
      apSynthId: JSON.stringify(apiWebHook),
      apiWebHook: apiWebHook,
      webhookApiEnvironmentResponseList: _webhookApiEnvironmentResponseList,
      apiAppResponse: apiAppResponse
    }
    return viewManagedWebhook;
  }
  
  public static createManagedWebhookList = (apiAppResponse: AppResponse, apiAppEnvironmentResponseList: Array<EnvironmentResponse>): TAPViewManagedWebhookList => {
    const apiAppWebhookList: Array<WebHook> = apiAppResponse.webHooks ? apiAppResponse.webHooks : [];
    let _managedWebhookList: TAPViewManagedWebhookList = [];
    apiAppWebhookList.forEach( (apiAppWebHook: WebHook) => {
      const viewManagedWebhook: TAPViewManagedWebhook = APManagedWebhook.createManagedWebhook(apiAppResponse, apiAppWebHook, apiAppEnvironmentResponseList);
      _managedWebhookList.push(viewManagedWebhook);
    });
    return _managedWebhookList;
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
