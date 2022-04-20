import { 
  ApiError,
  AppsService, 
  WebHook,
  WebHookBasicAuth,
  WebHookHeaderAuth,
  WebHookNameList,
  WebHookStatus
} from '@solace-iot-team/apim-connector-openapi-browser';
import { APClientConnectorOpenApi } from '../../utils/APClientConnectorOpenApi';
import APEntityIdsService, { 
  IAPEntityIdDisplay, 
  TAPEntityId,
} from '../../utils/APEntityIdsService';
import APSearchContentService, { IAPSearchContent } from '../../utils/APSearchContentService';
import { Globals } from '../../utils/Globals';
import APEnvironmentsDisplayService, { TAPEnvironmentDisplayList } from '../APEnvironmentsDisplayService';
import { EAPApp_Type, TAPAppMeta } from './APAppsDisplayService';

export type TAPWebhookStatus = WebHookStatus;
export type TAPWebhookBasicAuth = WebHookBasicAuth;
export type TAPWebhookHeaderAuth = WebHookHeaderAuth;
/**
 * apEntityId.id = name
 * apEntityId.displayName = name
 */
export interface IAPAppWebhookDisplay extends IAPEntityIdDisplay, IAPSearchContent {
  // apAppMeta & apAppEntityId?
  devel_connectorWebhook: WebHook;
  apEnvironmentDisplayList: TAPEnvironmentDisplayList;
  apWebhookUri: string;
  // apWebhookStatus: TAPWebhookStatus;
  apWebhookMethod: WebHook.method;
  apWebhookMode: WebHook.mode;
  apWebhookBasicAuth?: TAPWebhookBasicAuth;
  apWebhookHeaderAuth?: TAPWebhookHeaderAuth;
}
export type TAPAppWebhookDisplayList = Array<IAPAppWebhookDisplay>;


export class APAppWebhooksDisplayService {
  private readonly BaseComponentName = "APAppWebhooksDisplayService";

  public nameOf<T extends IAPAppWebhookDisplay>(name: keyof T) {
    return name;
  }
  public nameOf_ApEntityId(name: keyof TAPEntityId) {
    return `${this.nameOf('apEntityId')}.${name}`;
  }

  private create_Empty_ConnectorWebHook(): WebHook {
    return {
      name: '',
      uri: '',
      method: WebHook.method.POST,
      mode: WebHook.mode.SERIAL,
    }
  }

  private create_Empty_ApWebhookBasicAuth(): TAPWebhookBasicAuth {
    return {
      username: '',
      password: '',
    };
  }

  private create_Empty_ApWebhookHeaderAuth(): TAPWebhookHeaderAuth {
    return {
      headerName: '',
      headerValue: ''
  };
  }

  public create_Empty_ApAppWebhookDisplay(): IAPAppWebhookDisplay {
    const apAppWebhookDisplay: IAPAppWebhookDisplay = {
      apEntityId: APEntityIdsService.create_EmptyObject_NoId(),
      apEnvironmentDisplayList: [],
      apWebhookUri: '',
      // apWebhookStatus: {},
      // apWebhookBasicAuth: this.create_Empty_ApWebhookBasicAuth(),
      // apWebhookHeaderAuth: this.create_Empty_ApWebhookHeaderAuth(),
      apWebhookMethod: WebHook.method.POST,
      apWebhookMode: WebHook.mode.SERIAL,
      devel_connectorWebhook: this.create_Empty_ConnectorWebHook(),
      apSearchContent: '',
    };
    return apAppWebhookDisplay;
  }

  protected create_ApAppWebhookDisplay_From_ApiEntities({ connector_WebHook, complete_apEnvironmentDisplayList }:{
    connector_WebHook: WebHook;
    complete_apEnvironmentDisplayList: TAPEnvironmentDisplayList;
  }): IAPAppWebhookDisplay {
    const funcName = 'create_ApAppCredentials_From_ApiEntities';
    const logName = `${this.BaseComponentName}.${funcName}()`;

    const id: string = connector_WebHook.name ? connector_WebHook.name : connector_WebHook.uri;
    const displayName: string = id;
    const apEnvironmentDisplayList: TAPEnvironmentDisplayList = APEntityIdsService.create_ApDisplayObjectList_FilteredBy_IdList({
      apDisplayObjectList: complete_apEnvironmentDisplayList,
      filterByIdList: connector_WebHook.environments ? connector_WebHook.environments : [],
    });
    let apWebhookBasicAuth: TAPWebhookBasicAuth | undefined = undefined;
    let apWebhookHeaderAuth: TAPWebhookHeaderAuth | undefined = undefined;
    if(connector_WebHook.authentication !== undefined && connector_WebHook.authentication.authMethod !== undefined) {
      switch(connector_WebHook.authentication.authMethod) {
        case WebHookBasicAuth.authMethod.BASIC:
          apWebhookBasicAuth = {
            username: connector_WebHook.authentication.username,
            password: connector_WebHook.authentication.password
          };
          break;
        case WebHookHeaderAuth.authMethod.HEADER:
          apWebhookHeaderAuth = {
            headerName: connector_WebHook.authentication.headerName,
            headerValue: connector_WebHook.authentication.headerValue
          };
          break;
        default:
          Globals.assertNever(logName, connector_WebHook.authentication.authMethod);
      }
    }
    const apAppWebhookDisplay: IAPAppWebhookDisplay = {
      apEntityId: {
        id: id,
        displayName: displayName
      },
      apEnvironmentDisplayList: apEnvironmentDisplayList,
      apWebhookUri: connector_WebHook.uri,
      apWebhookBasicAuth: apWebhookBasicAuth,
      apWebhookHeaderAuth: apWebhookHeaderAuth,
      // apWebhookStatus: connector_WebHookStatus,
      apWebhookMethod: connector_WebHook.method,
      apWebhookMode: connector_WebHook.mode,
      devel_connectorWebhook: connector_WebHook,
      apSearchContent: '',
    };
    return APSearchContentService.add_SearchContent<IAPAppWebhookDisplay>(apAppWebhookDisplay);
  }

  // private static getAPWebhookStatus = (envName: CommonName, appConnectionStatus: AppConnectionStatus): TAPWebhookStatus | undefined => {
  //   const funcName = 'getAPWebhookStatus';
  //   const logName = `${APManagedWebhook.name}.${funcName}()`;

  //   if(appConnectionStatus.environments === undefined) return undefined;

  //   const found = appConnectionStatus.environments.find( (appEnvStatus: AppEnvironmentStatus) => {
  //     return (envName === appEnvStatus.name);
  //   });
  //   if(found && found.webHooks) {
  //     if(found.webHooks.length !== 1) throw new Error(`${logName}: each environment can only have exactly 1 webhook, but it has ${found.webHooks.length} webhooks`);
  //     if(found.webHooks[0].up === undefined) throw new Error(`${logName}: found.webHooks[0].up is undefined`);
  //     const apWebhookStatus: TAPWebhookStatus = {
  //       summaryStatus: found.webHooks[0].up,
  //       apiWebhookStatus: found.webHooks[0]
  //     }
  //     return apWebhookStatus;
  //   }
  //   return undefined;
  // }


  // ********************************************************************************************************************************
  // API calls
  // ********************************************************************************************************************************

  public async apiCheck_AppWebhookId_Exists({ organizationId, appId, apAppMeta, webhookId }:{
    organizationId: string;
    appId: string;
    apAppMeta: TAPAppMeta;
    webhookId: string;
  }): Promise<boolean> {
    const funcName = 'apiCheck_AppWebhookId_Exists';
    const logName = `${this.BaseComponentName}.${funcName}()`;

    try {
      switch(apAppMeta.apAppType) {
        case EAPApp_Type.USER:
          await AppsService.getDeveloperAppWebHook({
            organizationName: organizationId,
            appName: appId,
            webhookName: webhookId,
            developerUsername: apAppMeta.appOwnerId,
          });
          return true;
        case EAPApp_Type.TEAM:
          await AppsService.getTeamAppWebHook({
            organizationName: organizationId,
            appName: appId,
            webhookName: webhookId,
            teamName: apAppMeta.appOwnerId
          });
          return true;
        case EAPApp_Type.UNKNOWN:
          throw new Error(`${logName}: apAppMeta.apAppType = EAPApp_Type.UNKNOWN`);
        default:
          Globals.assertNever(logName, apAppMeta.apAppType);
      }
    } catch(e: any) {
      if(APClientConnectorOpenApi.isInstanceOfApiError(e)) {
        const apiError: ApiError = e;
        if(apiError.status === 404) return false;
      }
      throw e;
    }
    return false;
  }

  public apiGet_ApAppWebhookDisplay = async({ organizationId, appId, apAppMeta, webhookId, complete_apEnvironmentDisplayList }:{
    organizationId: string;
    appId: string;
    apAppMeta: TAPAppMeta;
    webhookId: string;
    complete_apEnvironmentDisplayList?: TAPEnvironmentDisplayList;
  }): Promise<IAPAppWebhookDisplay> => {
    const funcName = 'apiGet_ApAppWebhookDisplay';
    const logName = `${this.BaseComponentName}.${funcName}()`;

    let connector_WebHook: WebHook = this.create_Empty_ConnectorWebHook();
    switch(apAppMeta.apAppType) {
      case EAPApp_Type.USER:
        connector_WebHook = await AppsService.getDeveloperAppWebHook({
          organizationName: organizationId,
          appName: appId,
          webhookName: webhookId,
          developerUsername: apAppMeta.appOwnerId,
        });
        break;
      case EAPApp_Type.TEAM:
        connector_WebHook = await AppsService.getTeamAppWebHook({
          organizationName: organizationId,
          appName: appId,
          webhookName: webhookId,
          teamName: apAppMeta.appOwnerId,
        });
        break;
      case EAPApp_Type.UNKNOWN:
        throw new Error(`${logName}: apAppMeta.apAppType = EAPApp_Type.UNKNOWN`);
      default:
        Globals.assertNever(logName, apAppMeta.apAppType);
    }

    // get the complete env list for reference
    if(complete_apEnvironmentDisplayList === undefined) {
      complete_apEnvironmentDisplayList = await APEnvironmentsDisplayService.apiGetList_ApEnvironmentDisplay({
        organizationId: organizationId
      });  
    }
    return this.create_ApAppWebhookDisplay_From_ApiEntities({
      connector_WebHook: connector_WebHook,
      complete_apEnvironmentDisplayList
    });

  }

  public apiGetList_ApAppWebhookDisplayList = async({ organizationId, appId, apAppMeta }:{
    organizationId: string;
    appId: string;
    apAppMeta: TAPAppMeta;
  }): Promise<TAPAppWebhookDisplayList> => {
    const funcName = 'apiGetList_ApAppWebhookDisplayList';
    const logName = `${this.BaseComponentName}.${funcName}()`;

    let webHookNameList: WebHookNameList = [];
    switch(apAppMeta.apAppType) {
      case EAPApp_Type.USER:
        webHookNameList = await AppsService.listDeveloperAppWebHooks({
          organizationName: organizationId,
          appName: appId,
          developerUsername: apAppMeta.appOwnerId
        });
        break;
      case EAPApp_Type.TEAM:
        webHookNameList = await AppsService.listTeamAppWebHooks({
          organizationName: organizationId,
          appName: appId,
          teamName: apAppMeta.appOwnerId
        });
        break;
      case EAPApp_Type.UNKNOWN:
        throw new Error(`${logName}: apAppMeta.apAppType = EAPApp_Type.UNKNOWN`);
      default:
        Globals.assertNever(logName, apAppMeta.apAppType);
    }

    const apAppWebhookDisplayList: TAPAppWebhookDisplayList = [];

    // get the complete env list for reference
    const complete_apEnvironmentDisplayList: TAPEnvironmentDisplayList = await APEnvironmentsDisplayService.apiGetList_ApEnvironmentDisplay({
      organizationId: organizationId
    });  
    // get each webhook
    for(const webHookName of webHookNameList) {
      if(webHookName.name === undefined && webHookName.uri === undefined) throw new Error(`${logName}: webHookName.name === undefined && webHookName.uri === undefined`);
      let webhookId: string = '';
      if(webHookName.name) webhookId = webHookName.name;
      else if(webHookName.uri) webhookId = webHookName.uri;
      const apAppWebhookDisplay: IAPAppWebhookDisplay = await this.apiGet_ApAppWebhookDisplay({
        organizationId: organizationId,
        appId: appId,
        apAppMeta: apAppMeta,
        webhookId: webhookId,
        complete_apEnvironmentDisplayList: complete_apEnvironmentDisplayList
      });
      apAppWebhookDisplayList.push(apAppWebhookDisplay);
    }

    // TEST downstream error handling
    // throw new Error(`${logName}: test error handling`);

    return apAppWebhookDisplayList;
  }

  // protected async apiUpdate({ organizationId, appId, apAppMeta, connectorAppPatch, apRawAttributeList }: {
  //   organizationId: string;
  //   appId: string;
  //   apAppMeta: TAPAppMeta;
  //   connectorAppPatch: AppPatch;
  //   apRawAttributeList?: TAPRawAttributeList;
  // }): Promise<void> {
  //   const funcName = 'apiUpdate';
  //   const logName = `${this.BaseComponentName}.${funcName}()`;

  //   // always set the App to approved
  //   const requestBody: AppPatch = {
  //     ...connectorAppPatch,
  //     status: AppStatus.APPROVED,
  //     attributes: apRawAttributeList
  //   };

  //   switch(apAppMeta.apAppType) {
  //     case EAPApp_Type.USER:
  //       await AppsService.updateDeveloperApp({
  //         organizationName: organizationId,
  //         developerUsername: apAppMeta.appOwnerId,
  //         appName: appId,
  //         requestBody: requestBody
  //       });  
  //       break;
  //     case EAPApp_Type.TEAM:
  //       await AppsService.updateTeamApp({
  //         organizationName: organizationId,
  //         teamName: apAppMeta.appOwnerId,
  //         appName: appId,
  //         requestBody: requestBody
  //       });  
  //       break;
  //     case EAPApp_Type.UNKNOWN:
  //       throw new Error(`${logName}: apAppMeta.apAppType = EAPApp_Type.UNKNOWN`);
  //     default:
  //       Globals.assertNever(logName, apAppMeta.apAppType);
  //   }

  // }

  // public async apiDelete_ApAppDisplay({ organizationId, appId }:{
  //   organizationId: string;
  //   appId: string;
  // }): Promise<void> {
  //   const funcName = 'apiDelete_ApAppDisplay';
  //   const logName = `${this.BaseComponentName}.${funcName}()`;

  //   // what kind of app is it?
  //   const connectorAppResponseGeneric: AppResponseGeneric = await AppsService.getApp({
  //     organizationName: organizationId,
  //     appName: appId
  //   });
  //   if(connectorAppResponseGeneric.appType === undefined) throw new Error(`${logName}: connectorAppResponseGeneric.appType === undefined`);
  //   if(connectorAppResponseGeneric.ownerId === undefined) throw new Error(`${logName}: connectorAppResponseGeneric.ownerId === undefined`);

  //   switch(connectorAppResponseGeneric.appType) {
  //     case AppResponseGeneric.appType.DEVELOPER:
  //       await AppsService.deleteDeveloperApp({
  //         organizationName: organizationId,
  //         developerUsername: connectorAppResponseGeneric.ownerId,
  //         appName: appId
  //       });
  //       break;
  //     case AppResponseGeneric.appType.TEAM:
  //       await AppsService.deleteTeamApp({
  //         organizationName: organizationId,
  //         teamName: connectorAppResponseGeneric.ownerId,
  //         appName: appId
  //       });
  //       break;
  //     default:
  //       Globals.assertNever(logName, connectorAppResponseGeneric.appType);
  //   }
  // }

}

export default new APAppWebhooksDisplayService();
