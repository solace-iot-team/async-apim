import { 
  AdministrationService,
  ApiError,
  APIKeyAuthentication,
  BasicAuthentication,
  BearerTokenAuthentication,
  CloudToken, 
  Organization, 
  OrganizationResponse, 
  OrganizationStatus, 
  SempV2Authentication
} from '@solace-iot-team/apim-connector-openapi-browser';
import { 
  ApsAdministrationService, 
  APSOrganization, 
  APSOrganizationUpdate 
} from '../../_generated/@solace-iot-team/apim-server-openapi-browser';
import { APClientConnectorOpenApi } from '../../utils/APClientConnectorOpenApi';
import APEntityIdsService, { 
  IAPEntityIdDisplay, 
  TAPEntityId
} from '../../utils/APEntityIdsService';
import { Globals } from '../../utils/Globals';

export enum EAPCloudConnectivityConfigType {
  SIMPLE = 'Simple',
  ADVANCED = 'Advanced'
}
export type TAPCloudConnectivityConfigSimple = {
  configType: EAPCloudConnectivityConfigType.SIMPLE;
  cloudToken: string;
}
export type TAPEventPortalConfig = {
  baseUrl: string;
  cloudToken: string;
}
export type TAPSolaceCloudConfig = {
  baseUrl: string;
  cloudToken: string;
}
export type TAPCloudConnectivityConfigAdvanced = {
  configType: EAPCloudConnectivityConfigType.ADVANCED;
  apEventPortalConfig: TAPEventPortalConfig;
  apSolaceCloudConfig: TAPSolaceCloudConfig;
}
export type TAPCloudConnectivityConfig = TAPCloudConnectivityConfigSimple | TAPCloudConnectivityConfigAdvanced;

export enum EAPOrganizationOperationalStatus {
  UNDEFINED = "not available",
  UP = "up",
  DOWN = "down",
}
export type TAPOrganizationOperationalStatus = {
  cloudConnectivity: EAPOrganizationOperationalStatus;
  eventPortalConnectivity: EAPOrganizationOperationalStatus;
}
export enum EAPOrganizationSempv2AuthType {
  BASIC_AUTH = 'Basic Auth',
  API_KEY = 'API Key'
}
export type TAPOrganizationSempv2_BasicAuth = {
  apAuthType: EAPOrganizationSempv2AuthType.BASIC_AUTH;
}
export type TAPOrganizationSempv2_ApiKeyAuth = {
  apAuthType: EAPOrganizationSempv2AuthType.API_KEY;
  apiKeyLocation: SempV2Authentication.apiKeyLocation;
  apiKeyName: string;
}
export type TAPOrganizationSempv2Auth = TAPOrganizationSempv2_ApiKeyAuth | TAPOrganizationSempv2_BasicAuth;

export enum EAPNotificationHubAuthType {
  UNDEFINED = "UNDEFINED",
  BASIC_AUTH = 'Basic Auth',
  API_KEY_AUTH = 'API Key',
  BEARER_TOKEN_AUTH = "BEARER_TOKEN_AUTH",
}
export type TAPNotificationHub_Undefined = {
  apAuthType: EAPNotificationHubAuthType.UNDEFINED;
}
export type TAPNotificationHub_BasicAuth = {
  apAuthType: EAPNotificationHubAuthType.BASIC_AUTH;
  username: string;
  password: string;
}
export type TAPNotificationHub_ApiKeyAuth = {
  apAuthType: EAPNotificationHubAuthType.API_KEY_AUTH;
  apiKeyLocation: APIKeyAuthentication.location;
  apiKeyFieldName: string;
  apiKeyValue: string;
}
export type TAPNotificationHub_BearerTokenAuth = {
  apAuthType: EAPNotificationHubAuthType.BEARER_TOKEN_AUTH;
  token: string;
}
export type TAPNotificationHubAuth = TAPNotificationHub_Undefined | TAPNotificationHub_BasicAuth | TAPNotificationHub_ApiKeyAuth | TAPNotificationHub_BearerTokenAuth;

export type TAPNotificationHubConfig = {
  baseUrl: string;
  apNotificationHubAuth: TAPNotificationHubAuth;
}

export enum EAPOrganizationConfigStatus {
  UNDEFINED = "undefined",
  OPERATIONAL = "operational",
  NOT_OPERATIONAL = "not operational"
}

export interface IAPOrganizationDisplay extends IAPEntityIdDisplay {
  connectorOrganizationResponse: OrganizationResponse;
  apOrganizationConfigStatus: EAPOrganizationConfigStatus;
  apNumApis2ApiProductRatio: number; /** -1 = infinity, min = 1 (0 not allowed) */
  apAppCredentialsExpiryDuration: number;
  // add more settings over time from APS
  apCloudConnectivityConfig: TAPCloudConnectivityConfig;
  apOrganizationSempv2Auth: TAPOrganizationSempv2Auth;
  apOrganizationOperationalStatus: TAPOrganizationOperationalStatus;
  apNotificationHubConfig?: TAPNotificationHubConfig;
  // TODO: OrganizationIntegrations
}

export interface IAPOrganizationDisplay_General extends IAPEntityIdDisplay {
  apNumApis2ApiProductRatio: number; 
  apAppCredentialsExpiryDuration: number;
}
export interface IAPOrganizationDisplay_Connectivity extends IAPEntityIdDisplay {
  // add members here when done
}
export interface IAPOrganizationDisplay_NofiticationHub extends IAPEntityIdDisplay {
  apNotificationHubConfig?: TAPNotificationHubConfig;
}
// export type TAPAppDisplay_AllowedActions = {
//   isMonitorStatsAllowed: boolean;
// }

export class APOrganizationsDisplayService {
  private readonly BaseComponentName = "APOrganizationsDisplayService";
  private readonly DefaultNumApis2ApiProductRatio: number = -1; /** any number of Apis */
  private readonly DefaultAppCredentialsExpiryDuration: number = (6 * 30 * 24 * 3600 * 1000); /** 6 months in milliseconds */
  private readonly SecretMask = '***';
  public readonly APOrganizationDisplay_EmptyString = "_APOrganizationDisplay_EmptyString_";

  public nameOf<T extends IAPOrganizationDisplay>(name: keyof T): string {
    return `${name}`;
  }
  public nameOf_ApEntityId(name: keyof TAPEntityId): string {
    return `${this.nameOf('apEntityId')}.${name}`;
  }

  private maskOrganizationSecrets({ organizationObject }:{
    organizationObject: any;
  }): any {
    const funcName = 'maskOrganizationSecrets';
    const logName = `${this.BaseComponentName}.${funcName}()`;
    // console.log(`${logName}: organizationObject=${JSON.stringify(organizationObject, null, 2)}`);
    // TODO: implement array traversal if required
    if(Array.isArray(organizationObject)) throw new Error(`${logName}: arrays are not supported`);
    const isObject = (obj:any ) => obj && typeof obj === 'object';
    Object.keys(organizationObject).forEach( key => {
      const value = organizationObject[key];
      const k = key.toLowerCase();
      if( k.includes('token') && typeof value === 'string') {
        organizationObject[key] = this.SecretMask;
      }
      if( k.includes('password') && typeof value === 'string') {
        organizationObject[key] = this.SecretMask;
      }
      if( k.includes('key') && typeof value === 'string') {
        organizationObject[key] = this.SecretMask;
      }
      if(Array.isArray(value) || isObject(value)) this.maskOrganizationSecrets({ organizationObject: value });
    });
    return organizationObject;
  }

  private create_Empty_ConnectorOrganizationResponse(): OrganizationResponse {
    return {
      name: ''
    }
  }
  
  public create_Empty_ApNotificationHubConfig(): TAPNotificationHubConfig {
    const apNotificationHubConfig: TAPNotificationHubConfig = {
      baseUrl: '',
      apNotificationHubAuth : {
        apAuthType: EAPNotificationHubAuthType.UNDEFINED
      }
    };
    return apNotificationHubConfig;
  }

  protected create_Empty_ApOrganizationDisplay(): IAPOrganizationDisplay {
    const apOrganizationDisplay: IAPOrganizationDisplay = {
      connectorOrganizationResponse: this.create_Empty_ConnectorOrganizationResponse(),
      apEntityId: APEntityIdsService.create_EmptyObject_NoId(),
      apNumApis2ApiProductRatio: this.DefaultNumApis2ApiProductRatio,
      apAppCredentialsExpiryDuration: this.DefaultAppCredentialsExpiryDuration,
      apCloudConnectivityConfig: {
        configType: EAPCloudConnectivityConfigType.SIMPLE,
        cloudToken: this.APOrganizationDisplay_EmptyString
      },
      apOrganizationSempv2Auth: {
        apAuthType: EAPOrganizationSempv2AuthType.BASIC_AUTH
      },
      apOrganizationOperationalStatus: {
        cloudConnectivity: EAPOrganizationOperationalStatus.UNDEFINED,
        eventPortalConnectivity: EAPOrganizationOperationalStatus.UNDEFINED
      },
      apOrganizationConfigStatus: EAPOrganizationConfigStatus.UNDEFINED,
      apNotificationHubConfig: undefined,
    };
    return apOrganizationDisplay;
  }

  protected set_ApOrganizationConfigStatus({ apOrganizationDisplay }:{
    apOrganizationDisplay: IAPOrganizationDisplay;
  }): IAPOrganizationDisplay {
    apOrganizationDisplay.apOrganizationConfigStatus = EAPOrganizationConfigStatus.OPERATIONAL;
    if(apOrganizationDisplay.apCloudConnectivityConfig.configType === EAPCloudConnectivityConfigType.SIMPLE) {
      if(apOrganizationDisplay.apCloudConnectivityConfig.cloudToken === this.APOrganizationDisplay_EmptyString) apOrganizationDisplay.apOrganizationConfigStatus = EAPOrganizationConfigStatus.NOT_OPERATIONAL;
    }
    return apOrganizationDisplay;
  }

  private create_ApCloudConnectivityConfig_From_ApiEntities({ connectorCloudToken }:{
    connectorCloudToken: string | CloudToken | undefined;
  }): TAPCloudConnectivityConfig {
    const funcName = 'create_ApCloudConnectivityConfig_From_ApiEntities';
    const logName = `${this.BaseComponentName}.${funcName}()`;
    if(connectorCloudToken === undefined) {
      const apCloudConnectivityConfigSimple: TAPCloudConnectivityConfigSimple = {
        configType: EAPCloudConnectivityConfigType.SIMPLE,
        cloudToken: this.APOrganizationDisplay_EmptyString
      };
      return apCloudConnectivityConfigSimple;
    }
    if(typeof connectorCloudToken === 'string') {
      const apCloudConnectivityConfigSimple: TAPCloudConnectivityConfigSimple = {
        configType: EAPCloudConnectivityConfigType.SIMPLE,
        cloudToken: connectorCloudToken,
      };
      return apCloudConnectivityConfigSimple;
    } else {
      if(connectorCloudToken.eventPortal.token === undefined) throw new Error(`${logName}: connectorCloudToken.eventPortal.token === undefined`);
      if(connectorCloudToken.cloud.token === undefined) throw new Error(`${logName}: connectorCloudToken.cloud.token === undefined`);
      const apCloudConnectivityConfigAdvanced: TAPCloudConnectivityConfigAdvanced = {
        configType: EAPCloudConnectivityConfigType.ADVANCED,
        apEventPortalConfig: {
          baseUrl: connectorCloudToken.eventPortal.baseUrl,
          cloudToken: connectorCloudToken.eventPortal.token,
        },
        apSolaceCloudConfig: {
          baseUrl: connectorCloudToken.cloud.baseUrl,
          cloudToken: connectorCloudToken.cloud.token
        }
      };
      return apCloudConnectivityConfigAdvanced;
    }
  }

  private create_ApOrganizationOperationalStatus_From_ApiEntities({ connectorOrganizationStatus }:{
    connectorOrganizationStatus: OrganizationStatus | undefined;
  }): TAPOrganizationOperationalStatus {
    let cloudConnectivity: EAPOrganizationOperationalStatus = EAPOrganizationOperationalStatus.UNDEFINED;
    let eventPortalConnectivity: EAPOrganizationOperationalStatus = EAPOrganizationOperationalStatus.UNDEFINED;
    if(connectorOrganizationStatus !== undefined) {
      if(connectorOrganizationStatus.cloudConnectivity !== undefined && connectorOrganizationStatus.cloudConnectivity) cloudConnectivity = EAPOrganizationOperationalStatus.UP;
      else cloudConnectivity = EAPOrganizationOperationalStatus.DOWN;
      if(connectorOrganizationStatus.eventPortalConnectivity !== undefined && connectorOrganizationStatus.eventPortalConnectivity) eventPortalConnectivity = EAPOrganizationOperationalStatus.UP;
      else eventPortalConnectivity = EAPOrganizationOperationalStatus.DOWN;  
    }
    const apOrganizationOperationalStatus: TAPOrganizationOperationalStatus = {
      cloudConnectivity: cloudConnectivity,
      eventPortalConnectivity: eventPortalConnectivity
    };
    return apOrganizationOperationalStatus;
  }

  private create_ApOrganizationSempv2Auth_From_ApiEntities({ connectorSempV2Authentication }:{
    connectorSempV2Authentication?: SempV2Authentication;
  }): TAPOrganizationSempv2Auth {
    const funcName = 'create_ApOrganizationSempv2Auth_From_ApiEntities';
    const logName = `${this.BaseComponentName}.${funcName}()`;

    const apOrganizationSempv2_BasicAuth: TAPOrganizationSempv2_BasicAuth = {
      apAuthType: EAPOrganizationSempv2AuthType.BASIC_AUTH
    }
    
    if(connectorSempV2Authentication === undefined) return apOrganizationSempv2_BasicAuth;

    switch(connectorSempV2Authentication.authType) {
      case SempV2Authentication.authType.BASIC_AUTH:
        return apOrganizationSempv2_BasicAuth;
      case SempV2Authentication.authType.APIKEY:
        if(connectorSempV2Authentication.apiKeyName === undefined) throw new Error(`${logName}: connectorSempV2Authentication.apiKeyName === undefined`);
        const apOrganizationSempv2_ApiKeyAuth: TAPOrganizationSempv2_ApiKeyAuth = {
          apAuthType: EAPOrganizationSempv2AuthType.API_KEY,
          apiKeyLocation: connectorSempV2Authentication.apiKeyLocation,
          apiKeyName: connectorSempV2Authentication.apiKeyName
        };
        return apOrganizationSempv2_ApiKeyAuth;
      default:
        Globals.assertNever(logName, connectorSempV2Authentication.authType);
    }
    // should never get here
    return apOrganizationSempv2_BasicAuth
  }

  private create_ApNofiticationHubConfig_From_ApiEntities({ connectorOrganizationResponse }:{
    connectorOrganizationResponse: OrganizationResponse;
  }): TAPNotificationHubConfig | undefined {
    const funcName = 'create_ApNofiticationHubConfig_From_ApiEntities';
    const logName = `${this.BaseComponentName}.${funcName}()`;

    if(connectorOrganizationResponse.integrations === undefined) return undefined;
    if(connectorOrganizationResponse.integrations.notifications === undefined) return undefined;
    const connectorAuth: (BasicAuthentication | APIKeyAuthentication | BearerTokenAuthentication) = connectorOrganizationResponse.integrations.notifications.authentication;
    let apNotificationHubAuth: TAPNotificationHubAuth | undefined = undefined;
    // try basic auth
    const basicAuth: BasicAuthentication = connectorAuth as BasicAuthentication;
    if(basicAuth.userName !== undefined && basicAuth.password !== undefined) {
      const apNotificationHub_BasicAuth: TAPNotificationHub_BasicAuth = {
        apAuthType: EAPNotificationHubAuthType.BASIC_AUTH,
        username: basicAuth.userName,
        password: basicAuth.password
      };
      apNotificationHubAuth = apNotificationHub_BasicAuth;
    } else {
      // try api key auth
      const apiKeyAuth: APIKeyAuthentication = connectorAuth as APIKeyAuthentication;
      if(apiKeyAuth.location !== undefined && apiKeyAuth.key !== undefined && apiKeyAuth.name !== undefined) {
        const apNotificationHub_ApiKeyAuth: TAPNotificationHub_ApiKeyAuth = {
          apAuthType: EAPNotificationHubAuthType.API_KEY_AUTH,
          apiKeyLocation: apiKeyAuth.location,
          apiKeyFieldName: apiKeyAuth.name,
          apiKeyValue: apiKeyAuth.key
        };
        apNotificationHubAuth = apNotificationHub_ApiKeyAuth;  
      } else {
        // try bearer token auth
        const bearerTokenAuth: BearerTokenAuthentication = connectorAuth as BearerTokenAuthentication;
        if(bearerTokenAuth.token !== undefined) {
          const apNotificationHub_BearerTokenAuth: TAPNotificationHub_BearerTokenAuth = {
            apAuthType: EAPNotificationHubAuthType.BEARER_TOKEN_AUTH,
            token: bearerTokenAuth.token
          };
          apNotificationHubAuth = apNotificationHub_BearerTokenAuth;  
        }
      }
    }
    if(apNotificationHubAuth === undefined) throw new Error(`${logName}: unable to calculate OrganizationNotifier authentication, connectorAuth=${JSON.stringify(connectorAuth, null, 2)}`);

    const apNotificationHubConfig: TAPNotificationHubConfig = {
      baseUrl: connectorOrganizationResponse.integrations.notifications.baseUrl,
      apNotificationHubAuth: apNotificationHubAuth
    };
    return apNotificationHubConfig;
  }

  protected create_ApOrganizationDisplay_From_ApiEntities({ apsOrganization, connectorOrganizationResponse }: {
    connectorOrganizationResponse: OrganizationResponse;
    apsOrganization: APSOrganization;
  }): IAPOrganizationDisplay {

    const apOrganizationDisplay: IAPOrganizationDisplay = {
      connectorOrganizationResponse: connectorOrganizationResponse,
      apEntityId: { id: apsOrganization.organizationId, displayName: apsOrganization.displayName },
      // TODO: from apsOrganization
      apNumApis2ApiProductRatio: this.DefaultNumApis2ApiProductRatio,
      apAppCredentialsExpiryDuration: this.DefaultAppCredentialsExpiryDuration,
      apCloudConnectivityConfig: this.create_ApCloudConnectivityConfig_From_ApiEntities({ connectorCloudToken: connectorOrganizationResponse['cloud-token']}),
      apOrganizationSempv2Auth: this.create_ApOrganizationSempv2Auth_From_ApiEntities({ connectorSempV2Authentication: connectorOrganizationResponse.sempV2Authentication }),
      apOrganizationOperationalStatus: this.create_ApOrganizationOperationalStatus_From_ApiEntities({ connectorOrganizationStatus: connectorOrganizationResponse.status}),
      apNotificationHubConfig: this.create_ApNofiticationHubConfig_From_ApiEntities({ connectorOrganizationResponse: connectorOrganizationResponse }),
      apOrganizationConfigStatus: EAPOrganizationConfigStatus.UNDEFINED,
    };
    return this.set_ApOrganizationConfigStatus({
      apOrganizationDisplay: apOrganizationDisplay
    });
  }

  public get_DefaultAppCredentailsExpiryDuration(): number {
    return this.DefaultAppCredentialsExpiryDuration;
  }

  // protected is_MonitorStats_Allowed({ apAppDisplay }: {
  //   apAppDisplay: IAPAppDisplay;
  // }): boolean {
  //   if(apAppDisplay.apAppStatus === EAPApp_Status.LIVE || apAppDisplay.apAppStatus === EAPApp_Status.PARTIALLY_LIVE) return true;
  //   return false;
  // }
  
  // protected get_Empty_AllowedActions(): TAPAppDisplay_AllowedActions {
  //   return {
  //     isMonitorStatsAllowed: false
  //   };
  // }

  // protected get_AllowedActions({ apAppDisplay }: {
  //   apAppDisplay: IAPAppDisplay;
  // }): TAPAppDisplay_AllowedActions {
  //   const allowedActions: TAPAppDisplay_AllowedActions = {
  //     isMonitorStatsAllowed: this.is_MonitorStats_Allowed({ apAppDisplay: apAppDisplay }),
  //   };
  //   return allowedActions;
  // }

  public get_ApOrganizationDisplay_General<T extends IAPOrganizationDisplay>({ apOrganizationDisplay }: {
    apOrganizationDisplay: T;
  }): IAPOrganizationDisplay_General {
    return {
      apEntityId: apOrganizationDisplay.apEntityId,
      apAppCredentialsExpiryDuration: apOrganizationDisplay.apAppCredentialsExpiryDuration,
      apNumApis2ApiProductRatio: apOrganizationDisplay.apNumApis2ApiProductRatio
    };
  }

  public set_ApOrganizationDisplay_General<T extends IAPOrganizationDisplay, K extends IAPOrganizationDisplay_General>({ 
    apOrganizationDisplay,
    apOrganizationDisplay_General
  }:{
    apOrganizationDisplay: T;
    apOrganizationDisplay_General: K;
  }): T {
    apOrganizationDisplay.apEntityId = apOrganizationDisplay_General.apEntityId;
    apOrganizationDisplay.apAppCredentialsExpiryDuration = apOrganizationDisplay_General.apAppCredentialsExpiryDuration;
    apOrganizationDisplay.apNumApis2ApiProductRatio = apOrganizationDisplay_General.apNumApis2ApiProductRatio;
    return apOrganizationDisplay;
  }

  public get_ApOrganizationDisplay_Connectivity<T extends IAPOrganizationDisplay>({ apOrganizationDisplay }: {
    apOrganizationDisplay: T;
  }): IAPOrganizationDisplay_Connectivity {
    return {
      apEntityId: apOrganizationDisplay.apEntityId,
      // more here
    };
  }

  public set_ApOrganizationDisplay_Connectivity<T extends IAPOrganizationDisplay, K extends IAPOrganizationDisplay_Connectivity>({ 
    apOrganizationDisplay,
    apOrganizationDisplay_Connectivity
  }:{
    apOrganizationDisplay: T;
    apOrganizationDisplay_Connectivity: K;
  }): T {
    // set properties
    return apOrganizationDisplay;
  }

  public get_ApOrganizationDisplay_NotificationHub<T extends IAPOrganizationDisplay>({ apOrganizationDisplay }: {
    apOrganizationDisplay: T;
  }): IAPOrganizationDisplay_NofiticationHub {
    return {
      apEntityId: apOrganizationDisplay.apEntityId,
      apNotificationHubConfig: apOrganizationDisplay.apNotificationHubConfig
    };
  }

  public set_ApOrganizationDisplay_NotificationHub<T extends IAPOrganizationDisplay, K extends IAPOrganizationDisplay_NofiticationHub>({ 
    apOrganizationDisplay,
    apOrganizationDisplay_NotificationHub
  }:{
    apOrganizationDisplay: T;
    apOrganizationDisplay_NotificationHub: K;
  }): T {
    apOrganizationDisplay.apNotificationHubConfig = apOrganizationDisplay_NotificationHub.apNotificationHubConfig;
    return apOrganizationDisplay;
  }

  // ********************************************************************************************************************************
  // API calls
  // ********************************************************************************************************************************

  public async apiCheck_OrganizationId_Exists({ organizationId }:{
    organizationId: string;
  }): Promise<boolean> {
    try {
      await ApsAdministrationService.getApsOrganization({ organizationId: organizationId });
      return  true;
    } catch(e: any) {
      if(APClientConnectorOpenApi.isInstanceOfApiError(e)) {
        const apiError: ApiError = e;
        if(apiError.status === 404) return false;
      }
      throw e;
    }
  }

  protected apiGet_ConnectorOrganizationResponse = async({ organizationId }:{
    organizationId: string;
  }): Promise<OrganizationResponse> => {
    const organizationResponse: OrganizationResponse = await AdministrationService.getOrganization({
      organizationName: organizationId
    });
    return this.maskOrganizationSecrets({ organizationObject: organizationResponse });
  }

  public apiGet_ApOrganizationDisplay = async({ organizationId }:{
    organizationId: string;
  }): Promise<IAPOrganizationDisplay> => {
    const funcName = 'apiGet_ApOrganizationDisplay';
    const logName = `${this.BaseComponentName}.${funcName}()`;

    // // TEST upstream error handling
    // throw new Error(`${logName}: test error handling`);

    // get the APS organzation first
    const apsOrganization: APSOrganization = await ApsAdministrationService.getApsOrganization({
      organizationId: organizationId
    });
    // get the connector organzations
    const connectorOrganizationResponse: OrganizationResponse = await this.apiGet_ConnectorOrganizationResponse({ organizationId: organizationId });

    const apOrganizationDisplay: IAPOrganizationDisplay = this.create_ApOrganizationDisplay_From_ApiEntities({
      apsOrganization: apsOrganization,
      connectorOrganizationResponse: connectorOrganizationResponse
    });

    return apOrganizationDisplay;
  }

  protected async apiUpdate({ organizationId, apsUpdate, connectorOrganization }: {
    organizationId: string;
    apsUpdate?: APSOrganizationUpdate;
    connectorOrganization?: Organization;
  }): Promise<void> {
    const funcName = 'apiUpdate';
    const logName = `${this.BaseComponentName}.${funcName}()`;
    // test downstream error handling
    // throw new Error(`${logName}: test error handling`);

    if(apsUpdate === undefined && connectorOrganization === undefined) throw new Error(`${logName}: apsUpdate === undefined && connectorOrganization === undefined`);

    if(apsUpdate !== undefined) {
      await ApsAdministrationService.updateApsOrganization({
        organizationId: organizationId,
        requestBody: apsUpdate
      });  
    }

    if(connectorOrganization !== undefined) {
      await AdministrationService.updateOrganization({
        organizationName: organizationId, 
        requestBody: connectorOrganization
      });  
    }

  }

  public async apiUpdate_ApOrganizationDisplay_General({ apOrganizationDisplay_General }:{
    apOrganizationDisplay_General: IAPOrganizationDisplay_General;
  }): Promise<void> {
    const apsUpdate: APSOrganizationUpdate = {
      displayName: apOrganizationDisplay_General.apEntityId.displayName
    };
    await this.apiUpdate({ 
      organizationId: apOrganizationDisplay_General.apEntityId.id,
      apsUpdate: apsUpdate
    });
  }

  public async apiUpdate_ApOrganizationDisplay_NotificationHub({ apOrganizationDisplay_NotificationHub }:{
    apOrganizationDisplay_NotificationHub: IAPOrganizationDisplay_NofiticationHub;
  }): Promise<void> {
    const funcName = 'apiUpdate_ApOrganizationDisplay_NotificationHub';
    const logName = `${this.BaseComponentName}.${funcName}()`;

    if(apOrganizationDisplay_NotificationHub.apNotificationHubConfig === undefined) return;

    let connectorAuth: (BasicAuthentication | APIKeyAuthentication | BearerTokenAuthentication | undefined) = undefined;
    const apNotificationHubAuthType: EAPNotificationHubAuthType = apOrganizationDisplay_NotificationHub.apNotificationHubConfig.apNotificationHubAuth.apAuthType;
    switch(apNotificationHubAuthType) {
      case EAPNotificationHubAuthType.BASIC_AUTH:
        const apNotificationHub_BasicAuth: TAPNotificationHub_BasicAuth = apOrganizationDisplay_NotificationHub.apNotificationHubConfig.apNotificationHubAuth as TAPNotificationHub_BasicAuth;
        const basicAuth: BasicAuthentication = {
          userName: apNotificationHub_BasicAuth.username,
          password: apNotificationHub_BasicAuth.password
        }
        connectorAuth = basicAuth;
        break;
      case EAPNotificationHubAuthType.API_KEY_AUTH:
        const apNotificationHub_ApiKeyAuth: TAPNotificationHub_ApiKeyAuth = apOrganizationDisplay_NotificationHub.apNotificationHubConfig.apNotificationHubAuth as TAPNotificationHub_ApiKeyAuth;
        const apiKeyAuth: APIKeyAuthentication = {
          location: apNotificationHub_ApiKeyAuth.apiKeyLocation,
          name: apNotificationHub_ApiKeyAuth.apiKeyFieldName,
          key: apNotificationHub_ApiKeyAuth.apiKeyValue,
        }
        connectorAuth = apiKeyAuth;
        break;
      case EAPNotificationHubAuthType.BEARER_TOKEN_AUTH:
        const apNotificationHub_BearerTokenAuth: TAPNotificationHub_BearerTokenAuth = apOrganizationDisplay_NotificationHub.apNotificationHubConfig.apNotificationHubAuth as TAPNotificationHub_BearerTokenAuth;
        const bearerAuth: BearerTokenAuthentication = {
          token: apNotificationHub_BearerTokenAuth.token,
        }
        connectorAuth = bearerAuth;
        break;
      case EAPNotificationHubAuthType.UNDEFINED:
        throw new Error(`${logName}: apNotificationHubAuthType=${apNotificationHubAuthType}`);
      default:
        Globals.assertNever(logName, apNotificationHubAuthType);
    }
    if(connectorAuth === undefined) throw new Error(`${logName}: connectorAuth === undefined`);

    const connectorOrganizationUpdate: Organization = {
      name: apOrganizationDisplay_NotificationHub.apEntityId.id,
      integrations: {
        importers: undefined,
        notifications: {
          baseUrl: apOrganizationDisplay_NotificationHub.apNotificationHubConfig.baseUrl,
          authentication: connectorAuth
        }
      }
    };

    await this.apiUpdate({ 
      organizationId: apOrganizationDisplay_NotificationHub.apEntityId.id,
      connectorOrganization: connectorOrganizationUpdate
    });
  }

}

export default new APOrganizationsDisplayService();
