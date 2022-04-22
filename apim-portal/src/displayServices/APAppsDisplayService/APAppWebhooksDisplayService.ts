import { 
  ApiError,
  AppsService, 
  WebHook,
  WebHookAuth,
  WebHookBasicAuth,
  WebHookHeaderAuth,
  WebHookNameList,
  WebHookStatus
} from '@solace-iot-team/apim-connector-openapi-browser';
import { APClientConnectorOpenApi } from '../../utils/APClientConnectorOpenApi';
import APEntityIdsService, { 
  IAPEntityIdDisplay, 
  TAPEntityId,
  TAPEntityIdList,
} from '../../utils/APEntityIdsService';
import APSearchContentService, { IAPSearchContent } from '../../utils/APSearchContentService';
import { Globals } from '../../utils/Globals';
import { TAPAppEnvironmentDisplayList } from './APAppEnvironmentsDisplayService';
import { EAPApp_Type, IAPAppDisplay, TAPAppMeta } from './APAppsDisplayService';

export enum EAPWebhookAuthMethodSelectIdNone { 
  NONE = 'None'
}
export type TAPWebhookAuthMethodSelectId = 
  EAPWebhookAuthMethodSelectIdNone 
  | WebHookBasicAuth.authMethod.BASIC 
  | WebHookHeaderAuth.authMethod.HEADER;
export const EAPWebhookAuthMethodSelectId = { 
  ...EAPWebhookAuthMethodSelectIdNone, 
  ...WebHookBasicAuth.authMethod, 
  ...WebHookHeaderAuth.authMethod 
}

export enum E_APProtocol {
  HTTP = "http",
  HTTPS = 'https'
}
export type TAPDecomposedUri = {
  protocol: E_APProtocol;
  host: string;
  port: number;
  resource: string;
}

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
  apAppEnvironmentDisplayList: TAPAppEnvironmentDisplayList;
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

  private create_ApiWebhookId = (webhookId: string): string => {
    try {
      const url = new URL(webhookId);
      return encodeURIComponent(webhookId);
    } catch (e: any) {
      return webhookId;
    }
  }

  private create_Empty_ConnectorWebHook(): WebHook {
    return {
      name: '',
      uri: '',
      method: WebHook.method.POST,
      mode: WebHook.mode.SERIAL,
    }
  }

  public create_Empty_ApWebhookBasicAuth(): TAPWebhookBasicAuth {
    return {
      authMethod: WebHookBasicAuth.authMethod.BASIC,
      username: '',
      password: '',
    };
  }

  public create_Empty_ApWebhookHeaderAuth(): TAPWebhookHeaderAuth {
    return {
      authMethod: WebHookHeaderAuth.authMethod.HEADER,
      headerName: '',
      headerValue: ''
  };
  }

  public create_Empty_ApAppWebhookDisplay(): IAPAppWebhookDisplay {
    const apAppWebhookDisplay: IAPAppWebhookDisplay = {
      apEntityId: APEntityIdsService.create_EmptyObject_NoId(),
      apAppEnvironmentDisplayList: [],
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

  protected create_ApAppWebhookDisplay_From_ApiEntities({ connector_WebHook, apAppEnvironmentDisplayList }:{
    connector_WebHook: WebHook;
    apAppEnvironmentDisplayList: TAPAppEnvironmentDisplayList;
  }): IAPAppWebhookDisplay {
    const funcName = 'create_ApAppCredentials_From_ApiEntities';
    const logName = `${this.BaseComponentName}.${funcName}()`;

    const id: string = connector_WebHook.name ? connector_WebHook.name : connector_WebHook.uri;
    const displayName: string = id;
    const filtered_apAppEnvironmentDisplayList: TAPAppEnvironmentDisplayList = APEntityIdsService.create_ApDisplayObjectList_FilteredBy_IdList({
      apDisplayObjectList: apAppEnvironmentDisplayList,
      filterByIdList: connector_WebHook.environments ? connector_WebHook.environments : [],
    });
    let apWebhookBasicAuth: TAPWebhookBasicAuth | undefined = undefined;
    let apWebhookHeaderAuth: TAPWebhookHeaderAuth | undefined = undefined;
    if(connector_WebHook.authentication !== undefined && connector_WebHook.authentication.authMethod !== undefined) {
      switch(connector_WebHook.authentication.authMethod) {
        case WebHookBasicAuth.authMethod.BASIC:
          apWebhookBasicAuth = {
            authMethod: WebHookBasicAuth.authMethod.BASIC,
            username: connector_WebHook.authentication.username,
            password: connector_WebHook.authentication.password
          };
          break;
        case WebHookHeaderAuth.authMethod.HEADER:
          apWebhookHeaderAuth = {
            authMethod: WebHookHeaderAuth.authMethod.HEADER,
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
      apAppEnvironmentDisplayList: filtered_apAppEnvironmentDisplayList,
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

  private create_ConnectorRequestBody = ({ apAppWebhookDisplay }:{
    apAppWebhookDisplay: IAPAppWebhookDisplay;
  }): WebHook => {

    let auth: WebHookAuth | undefined = undefined;
    if(apAppWebhookDisplay.apWebhookBasicAuth !== undefined) {
      const basicAuth: WebHookBasicAuth = {
        username: apAppWebhookDisplay.apWebhookBasicAuth.username,
        password: apAppWebhookDisplay.apWebhookBasicAuth.password,
        authMethod: WebHookBasicAuth.authMethod.BASIC,
      };
      auth = basicAuth;
    } else if(apAppWebhookDisplay.apWebhookHeaderAuth !== undefined) {
      const headerAuth: WebHookHeaderAuth = {
        headerName: apAppWebhookDisplay.apWebhookHeaderAuth.headerName,
        headerValue: apAppWebhookDisplay.apWebhookHeaderAuth.headerValue,
        authMethod: WebHookHeaderAuth.authMethod.HEADER,
      };
      auth = headerAuth;
    }
    const requestBody: WebHook = {
      uri: apAppWebhookDisplay.apWebhookUri,
      name: apAppWebhookDisplay.apEntityId.id,
      environments: APEntityIdsService.create_IdList_From_ApDisplayObjectList(apAppWebhookDisplay.apAppEnvironmentDisplayList),
      method: apAppWebhookDisplay.apWebhookMethod,
      mode: apAppWebhookDisplay.apWebhookMode,
      authentication: auth,
      // add if still required
      tlsOptions: undefined
    };
    return requestBody;
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

  public get_decomposedUri(uri: string): TAPDecomposedUri {
    const decomposedUri: TAPDecomposedUri = {
      protocol: E_APProtocol.HTTP,
      host: '',
      port: 80,
      resource: ''
    };
    if(uri === '') return decomposedUri;
    const url: URL = new URL(uri);
    decomposedUri.protocol = url.protocol === 'http:' ? E_APProtocol.HTTP : E_APProtocol.HTTPS;
    decomposedUri.host = url.hostname;
    if(url.port) decomposedUri.port = parseInt(url.port);  
    decomposedUri.resource = `${url.pathname}${url.search}`; 
    return decomposedUri;
  }

  public get_composedUri(apDecomposedUri: TAPDecomposedUri): string {
    let url: URL;
    const base: string = `${apDecomposedUri.protocol}://${apDecomposedUri.host}:${apDecomposedUri.port}`;
    if(apDecomposedUri.resource !== '') url = new URL(apDecomposedUri.resource, base);
    else url = new URL(base);
    return url.toString();
  }


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

    const _webhookId: string = this.create_ApiWebhookId(webhookId);

    try {
      switch(apAppMeta.apAppType) {
        case EAPApp_Type.USER:
          await AppsService.getDeveloperAppWebHook({
            organizationName: organizationId,
            appName: appId,
            webhookName: _webhookId,
            developerUsername: apAppMeta.appOwnerId,
          });
          return true;
        case EAPApp_Type.TEAM:
          await AppsService.getTeamAppWebHook({
            organizationName: organizationId,
            appName: appId,
            webhookName: _webhookId,
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

  public apiGet_ApAppWebhookDisplay = async({ organizationId, appId, apAppMeta, webhookId, apAppEnvironmentDisplayList }:{
    organizationId: string;
    appId: string;
    apAppMeta: TAPAppMeta;
    webhookId: string;
    apAppEnvironmentDisplayList: TAPAppEnvironmentDisplayList;
  }): Promise<IAPAppWebhookDisplay> => {
    const funcName = 'apiGet_ApAppWebhookDisplay';
    const logName = `${this.BaseComponentName}.${funcName}()`;

    const _webhookId: string = this.create_ApiWebhookId(webhookId);

    let connector_WebHook: WebHook = this.create_Empty_ConnectorWebHook();
    switch(apAppMeta.apAppType) {
      case EAPApp_Type.USER:
        connector_WebHook = await AppsService.getDeveloperAppWebHook({
          organizationName: organizationId,
          appName: appId,
          webhookName: _webhookId,
          developerUsername: apAppMeta.appOwnerId,
        });
        break;
      case EAPApp_Type.TEAM:
        connector_WebHook = await AppsService.getTeamAppWebHook({
          organizationName: organizationId,
          appName: appId,
          webhookName: _webhookId,
          teamName: apAppMeta.appOwnerId,
        });
        break;
      case EAPApp_Type.UNKNOWN:
        throw new Error(`${logName}: apAppMeta.apAppType = EAPApp_Type.UNKNOWN`);
      default:
        Globals.assertNever(logName, apAppMeta.apAppType);
    }

    return this.create_ApAppWebhookDisplay_From_ApiEntities({
      connector_WebHook: connector_WebHook,
      apAppEnvironmentDisplayList: apAppEnvironmentDisplayList,
    });

  }

  public apiGetList_ApAppWebhookDisplayList = async({ organizationId, appId, apAppMeta, apAppEnvironmentDisplayList }:{
    organizationId: string;
    appId: string;
    apAppMeta: TAPAppMeta;
    apAppEnvironmentDisplayList: TAPAppEnvironmentDisplayList;
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

    // get each webhook
    for(const webHookName of webHookNameList) {
      if(webHookName.name === undefined && webHookName.uri === undefined) throw new Error(`${logName}: webHookName.name === undefined && webHookName.uri === undefined`);
      let webhookId: string = '';
      // try name first, then uri
      if(webHookName.name) webhookId = webHookName.name;
      else if(webHookName.uri) webhookId = webHookName.uri;
      const apAppWebhookDisplay: IAPAppWebhookDisplay = await this.apiGet_ApAppWebhookDisplay({
        organizationId: organizationId,
        appId: appId,
        apAppMeta: apAppMeta,
        webhookId: webhookId,
        apAppEnvironmentDisplayList: apAppEnvironmentDisplayList,
      });
      apAppWebhookDisplayList.push(apAppWebhookDisplay);
    }

    // TEST downstream error handling
    // throw new Error(`${logName}: test error handling`);

    return apAppWebhookDisplayList;
  }

  public apiGetList_WebhookAvailableApEnvironmentDisplayList_For_ApAppDisplay = async({ organizationId, apAppDisplay, webhookId }:{
    organizationId: string;
    apAppDisplay: IAPAppDisplay;
    webhookId?: string;
  }): Promise<TAPAppEnvironmentDisplayList> => {

    // get all the existing webhooks
    const apAppWebhookDisplayList: TAPAppWebhookDisplayList = await this.apiGetList_ApAppWebhookDisplayList({
      organizationId: organizationId,
      appId: apAppDisplay.apEntityId.id,
      apAppMeta: apAppDisplay.apAppMeta,
      apAppEnvironmentDisplayList: apAppDisplay.apAppEnvironmentDisplayList
    });

    const notAvailable_ApAppEnvironmentDisplayEntityIdList: TAPEntityIdList = [];
    for(const apAppWebhookDisplay of apAppWebhookDisplayList) {
      for(const apAppEnvironmentDisplay of apAppWebhookDisplay.apAppEnvironmentDisplayList) {
        if(webhookId !== apAppWebhookDisplay.apEntityId.id) {
          notAvailable_ApAppEnvironmentDisplayEntityIdList.push(apAppEnvironmentDisplay.apEntityId);
        }
      } 
    }
    const apAppEnvironmentDisplayList: TAPAppEnvironmentDisplayList = APEntityIdsService.create_ApDisplayObjectList_FilteredBy_NotEntityIdList({
      apDisplayObjectList: apAppDisplay.apAppEnvironmentDisplayList,
      filterBy_NotEntityIdList: notAvailable_ApAppEnvironmentDisplayEntityIdList,
    });

    return apAppEnvironmentDisplayList;
  }

  public apiCreate_ApAppWebhookDisplay = async({ organizationId, appId, apAppMeta, apAppWebhookDisplay }:{
    organizationId: string;
    appId: string;
    apAppMeta: TAPAppMeta;
    apAppWebhookDisplay: IAPAppWebhookDisplay;
  }): Promise<void> => {
    const funcName = 'apiCreate_ApAppWebhookDisplay';
    const logName = `${this.BaseComponentName}.${funcName}()`;

    switch(apAppMeta.apAppType) {
      case EAPApp_Type.USER:
        await AppsService.createDeveloperAppWebHook({
          organizationName: organizationId,
          appName: appId,
          developerUsername: apAppMeta.appOwnerId,
          requestBody: this.create_ConnectorRequestBody({ apAppWebhookDisplay: apAppWebhookDisplay }),
        });
        break;
      case EAPApp_Type.TEAM:
        await AppsService.createTeamAppWebHook({
          organizationName: organizationId,
          appName: appId,
          teamName: apAppMeta.appOwnerId,
          requestBody: this.create_ConnectorRequestBody({ apAppWebhookDisplay: apAppWebhookDisplay }),
        });
        break;
      case EAPApp_Type.UNKNOWN:
        throw new Error(`${logName}: apAppMeta.apAppType = EAPApp_Type.UNKNOWN`);
      default:
        Globals.assertNever(logName, apAppMeta.apAppType);
    }

  }

  public apiUpdate_ApAppWebhookDisplay = async({ organizationId, appId, apAppMeta, apAppWebhookDisplay }:{
    organizationId: string;
    appId: string;
    apAppMeta: TAPAppMeta;
    apAppWebhookDisplay: IAPAppWebhookDisplay;
  }): Promise<void> => {
    const funcName = 'apiUpdate_ApAppWebhookDisplay';
    const logName = `${this.BaseComponentName}.${funcName}()`;

    const _webhookId: string = this.create_ApiWebhookId(apAppWebhookDisplay.apEntityId.id);

    switch(apAppMeta.apAppType) {
      case EAPApp_Type.USER:
        await AppsService.updateDeveloperAppWebHook({
          organizationName: organizationId,
          appName: appId,
          developerUsername: apAppMeta.appOwnerId,
          webhookName: _webhookId,
          requestBody: this.create_ConnectorRequestBody({ apAppWebhookDisplay: apAppWebhookDisplay }),
        });
        break;
      case EAPApp_Type.TEAM:
        await AppsService.updateTeamAppWebHook({
          organizationName: organizationId,
          appName: appId,
          teamName: apAppMeta.appOwnerId,
          webhookName: _webhookId,
          requestBody: this.create_ConnectorRequestBody({ apAppWebhookDisplay: apAppWebhookDisplay }),
        });
        break;
      case EAPApp_Type.UNKNOWN:
        throw new Error(`${logName}: apAppMeta.apAppType = EAPApp_Type.UNKNOWN`);
      default:
        Globals.assertNever(logName, apAppMeta.apAppType);
    }

  }

  public apiDelete_ApAppWebhookDisplay = async({ organizationId, appId, apAppMeta, webhookId }:{
    organizationId: string;
    appId: string;
    apAppMeta: TAPAppMeta;
    webhookId: string;
  }): Promise<void> => {
    const funcName = 'apiDelete_ApAppWebhookDisplay';
    const logName = `${this.BaseComponentName}.${funcName}()`;

    const _webhookId: string = this.create_ApiWebhookId(webhookId);

    switch(apAppMeta.apAppType) {
      case EAPApp_Type.USER:
        await AppsService.deleteDeveloperAppWebHook({
          organizationName: organizationId,
          appName: appId,
          developerUsername: apAppMeta.appOwnerId,
          webhookName: _webhookId,
        });
        break;
      case EAPApp_Type.TEAM:
        await AppsService.deleteTeamAppWebHook({
          organizationName: organizationId,
          appName: appId,
          teamName: apAppMeta.appOwnerId,
          webhookName: _webhookId,
        });
        break;
      case EAPApp_Type.UNKNOWN:
        throw new Error(`${logName}: apAppMeta.apAppType = EAPApp_Type.UNKNOWN`);
      default:
        Globals.assertNever(logName, apAppMeta.apAppType);
    }

  }

}

export default new APAppWebhooksDisplayService();
