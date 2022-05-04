import {
  AdministrationService,
  ApiError,
  APIKeyAuthentication,
  BasicAuthentication,
  BearerTokenAuthentication,
  CloudToken,
  CustomCloudEndpoint,
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

export enum EAPOrganizationConnectivityConfigType {
  SIMPLE = 'Simple',
  ADVANCED = 'Advanced'
}

export enum EAPEventPortalConnectivityConfigType {
  UNDEFINED = "undefined",
  CUSTOM = 'Custom',
}
export type TAPEventPortalConnectivityConfigUndefined = {
  configType: EAPEventPortalConnectivityConfigType.UNDEFINED;
  baseUrl: string;
}
export type TAPEventPortalConnectivityConfigCustom = {
  configType: EAPEventPortalConnectivityConfigType.CUSTOM;
  baseUrl: string;
  token: string;
}
export type TAPEventPortalConnectivityConfig = TAPEventPortalConnectivityConfigCustom | TAPEventPortalConnectivityConfigUndefined;

export enum EAPCloudConnectivityConfigType {
  UNDEFINED = "undefined",
  SOLACE_CLOUD = 'Solace Cloud',
  CUSTOM = 'Custom'
}
export type TAPCloudConnectivityConfigUndefined = {
  configType: EAPCloudConnectivityConfigType.UNDEFINED;
  baseUrl: string;
}
export type TAPCloudConnectivityConfigCustom = {
  configType: EAPCloudConnectivityConfigType.CUSTOM;
  baseUrl: string;
  token: string;
}
export type TAPCloudConnectivityConfigSolaceCloud = {
  configType: EAPCloudConnectivityConfigType.SOLACE_CLOUD;
  token: string;
}
export type TAPCloudConnectivityConfig = TAPCloudConnectivityConfigSolaceCloud | TAPCloudConnectivityConfigCustom | TAPCloudConnectivityConfigUndefined;

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
  // UNDEFINED = "undefined",
  BASIC_AUTH = 'Basic Auth',
  API_KEY = 'API Key'
}
// export type TAPOrganizationSempv2AuthConfig_Undefined = {
//   apAuthType: EAPOrganizationSempv2AuthType.UNDEFINED;
// }
export type TAPOrganizationSempv2AuthConfig_BasicAuth = {
  apAuthType: EAPOrganizationSempv2AuthType.BASIC_AUTH;
  // credentials from discovery service responses
}
export type TAPOrganizationSempv2AuthConfig_ApiKeyAuth = {
  apAuthType: EAPOrganizationSempv2AuthType.API_KEY;
  apiKeyLocation: SempV2Authentication.apiKeyLocation;
  apiKeyName: string;
}
export type TAPOrganizationSempv2AuthConfig = TAPOrganizationSempv2AuthConfig_ApiKeyAuth | TAPOrganizationSempv2AuthConfig_BasicAuth;

export enum EAPNotificationHubAuthType {
  UNDEFINED = "UNDEFINED",
  BASIC_AUTH = 'Basic Auth',
  API_KEY_AUTH = 'API Key',
  BEARER_TOKEN_AUTH = "Bearer Token",
}
export const EAPNotificationHubAuthType_Form_Select = {
  BASIC_AUTH: EAPNotificationHubAuthType.BASIC_AUTH,
  API_KEY_AUTH: EAPNotificationHubAuthType.API_KEY_AUTH,
  BEARER_TOKEN_AUTH: EAPNotificationHubAuthType.BEARER_TOKEN_AUTH
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
  apMaxNumApis_Per_ApiProduct: number; /** -1 = infinity, min = 1 (0 not allowed) */
  apAppCredentialsExpiryDuration_millis: number;
  // add more settings over time from APS

  apOrganizationConnectivityConfigType: EAPOrganizationConnectivityConfigType;
  apCloudConnectivityConfig: TAPCloudConnectivityConfig;
  apEventPortalConnectivityConfig: TAPEventPortalConnectivityConfig;

  apOrganizationSempv2AuthConfig: TAPOrganizationSempv2AuthConfig;
  apOrganizationOperationalStatus: TAPOrganizationOperationalStatus;

  apNotificationHubConfig?: TAPNotificationHubConfig;
}

export interface IAPOrganizationDisplay_General extends IAPEntityIdDisplay {
  apMaxNumApis_Per_ApiProduct: number;
  apAppCredentialsExpiryDuration_millis: number;
}
export interface IAPOrganizationDisplay_Connectivity extends IAPEntityIdDisplay {
  apOrganizationConnectivityConfigType: EAPOrganizationConnectivityConfigType;
  apCloudConnectivityConfig: TAPCloudConnectivityConfig;
  apEventPortalConnectivityConfig: TAPEventPortalConnectivityConfig;
  apOrganizationSempv2AuthConfig: TAPOrganizationSempv2AuthConfig;
}
export interface IAPOrganizationDisplay_Integration extends IAPEntityIdDisplay {
  apNotificationHubConfig?: TAPNotificationHubConfig;
}

export class APOrganizationsDisplayService {
  private readonly BaseComponentName = "APOrganizationsDisplayService";
  private readonly UnlimitedMaxNumApis_Per_ApiProduct: number = -1; /** any number of Apis */
  private readonly DefaultAppCredentialsExpiryDuration_Millis: number = -1; /** no expiry */
  private readonly SecretMask = '***';
  private readonly DefaultSolaceCloudBaseUrlStr: string = 'https://api.solace.cloud/api/v0';
  private readonly DefaultEventPortalBaseUrlStr: string = 'https://api.solace.cloud/api/v0/eventPortal';

  public nameOf<T extends IAPOrganizationDisplay>(name: keyof T): string {
    return `${name}`;
  }
  public nameOf_ApEntityId(name: keyof TAPEntityId): string {
    return `${this.nameOf('apEntityId')}.${name}`;
  }

  public get_DefaultMaxNumApis_Per_ApiProduct(): number { return this.UnlimitedMaxNumApis_Per_ApiProduct; }
  public is_NumApis_Per_ApiProduct_Limited(maxNumApisPerApiProduct: number): boolean { 
    return maxNumApisPerApiProduct !== this.UnlimitedMaxNumApis_Per_ApiProduct; 
  }
  public get_DefaultAppCredentialsExpiryDuration_Millis(): number { return this.DefaultAppCredentialsExpiryDuration_Millis; }
  public get_SecretMask(): string { return this.SecretMask; }
  public get_DefaultSolaceCloudBaseUrlStr(): string { return this.DefaultSolaceCloudBaseUrlStr; }
  public get_DefaultEventPortalBaseUrlStr(): string { return this.DefaultEventPortalBaseUrlStr; }

  private maskOrganizationSecrets({ organizationObject }: {
    organizationObject: any;
  }): any {
    const funcName = 'maskOrganizationSecrets';
    const logName = `${this.BaseComponentName}.${funcName}()`;
    // console.log(`${logName}: organizationObject=${JSON.stringify(organizationObject, null, 2)}`);
    // TODO: implement array traversal if required
    if (Array.isArray(organizationObject)) throw new Error(`${logName}: arrays are not supported`);
    const isObject = (obj: any) => obj && typeof obj === 'object';
    Object.keys(organizationObject).forEach(key => {
      const value = organizationObject[key];
      const k = key.toLowerCase();
      if (k.includes('token') && typeof value === 'string') {
        organizationObject[key] = this.SecretMask;
      }
      if (k.includes('password') && typeof value === 'string') {
        organizationObject[key] = this.SecretMask;
      }
      if (k === 'key' && typeof value === 'string') {
        organizationObject[key] = this.SecretMask;
      }
      if (Array.isArray(value) || isObject(value)) this.maskOrganizationSecrets({ organizationObject: value });
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
      apNotificationHubAuth: {
        apAuthType: EAPNotificationHubAuthType.UNDEFINED
      }
    };
    return apNotificationHubConfig;
  }

  private create_Emtpy_ApCloudConnectivityConfig(): TAPCloudConnectivityConfigUndefined {
    return {
      configType: EAPCloudConnectivityConfigType.UNDEFINED,
      baseUrl: this.DefaultSolaceCloudBaseUrlStr,
    };
  }
  private create_Emtpy_ApEventPortalConnectivityConfig(): TAPEventPortalConnectivityConfigUndefined {
    return {
      configType: EAPEventPortalConnectivityConfigType.UNDEFINED,
      baseUrl: this.DefaultEventPortalBaseUrlStr,
    };
  }
  private create_Emtpy_ApOrganizationSempv2AuthConfig(): TAPOrganizationSempv2AuthConfig {
    return {
      apAuthType: EAPOrganizationSempv2AuthType.BASIC_AUTH,
    };
  }
  public create_Empty_ApOrganizationDisplay_Connectivity({ organizationEntityId }: {
    organizationEntityId: TAPEntityId;
  }): IAPOrganizationDisplay_Connectivity {
    const apConnectivity: IAPOrganizationDisplay_Connectivity = {
      apEntityId: organizationEntityId,
      apOrganizationConnectivityConfigType: EAPOrganizationConnectivityConfigType.SIMPLE,
      apCloudConnectivityConfig: this.create_Emtpy_ApCloudConnectivityConfig(),
      apEventPortalConnectivityConfig: this.create_Emtpy_ApEventPortalConnectivityConfig(),
      apOrganizationSempv2AuthConfig: this.create_Emtpy_ApOrganizationSempv2AuthConfig()
    };
    return apConnectivity;
  }

  protected create_Empty_ApOrganizationDisplay(): IAPOrganizationDisplay {
    const apOrganizationDisplay: IAPOrganizationDisplay = {
      connectorOrganizationResponse: this.create_Empty_ConnectorOrganizationResponse(),
      apEntityId: APEntityIdsService.create_EmptyObject_NoId(),
      apMaxNumApis_Per_ApiProduct: this.get_DefaultMaxNumApis_Per_ApiProduct(),
      apAppCredentialsExpiryDuration_millis: this.DefaultAppCredentialsExpiryDuration_Millis,

      apOrganizationConnectivityConfigType: EAPOrganizationConnectivityConfigType.SIMPLE,
      apCloudConnectivityConfig: this.create_Emtpy_ApCloudConnectivityConfig(),
      apEventPortalConnectivityConfig: this.create_Emtpy_ApEventPortalConnectivityConfig(),
      apOrganizationSempv2AuthConfig: this.create_Emtpy_ApOrganizationSempv2AuthConfig(),

      apOrganizationOperationalStatus: {
        cloudConnectivity: EAPOrganizationOperationalStatus.UNDEFINED,
        eventPortalConnectivity: EAPOrganizationOperationalStatus.UNDEFINED
      },
      apOrganizationConfigStatus: EAPOrganizationConfigStatus.UNDEFINED,
      apNotificationHubConfig: undefined,
    };
    return apOrganizationDisplay;
  }

  protected set_ApOrganizationConfigStatus({ apOrganizationDisplay }: {
    apOrganizationDisplay: IAPOrganizationDisplay;
  }): IAPOrganizationDisplay {
    apOrganizationDisplay.apOrganizationConfigStatus = EAPOrganizationConfigStatus.OPERATIONAL;
    if (apOrganizationDisplay.apCloudConnectivityConfig.configType === EAPCloudConnectivityConfigType.UNDEFINED) {
      apOrganizationDisplay.apOrganizationConfigStatus = EAPOrganizationConfigStatus.NOT_OPERATIONAL;
    }
    return apOrganizationDisplay;
  }

  private create_ApCloudConnectivityConfig_From_ApiEntities({ connectorCloudToken }: {
    connectorCloudToken: string | CloudToken | undefined;
  }): TAPCloudConnectivityConfig {
    const funcName = 'create_ApCloudConnectivityConfig_From_ApiEntities';
    const logName = `${this.BaseComponentName}.${funcName}()`;
    if (connectorCloudToken === undefined) {
      return this.create_Emtpy_ApCloudConnectivityConfig();
    }
    if (typeof connectorCloudToken === 'string') {
      const apCloudConnectivityConfigSolaceCloud: TAPCloudConnectivityConfigSolaceCloud = {
        configType: EAPCloudConnectivityConfigType.SOLACE_CLOUD,
        token: connectorCloudToken,
      };
      return apCloudConnectivityConfigSolaceCloud;
    } else {
      // it is a CustomCloudEndpoint
      if (connectorCloudToken.cloud.token === undefined) {
        return this.create_Emtpy_ApCloudConnectivityConfig();
      } else {
        const apCloudConnectivityConfigCustom: TAPCloudConnectivityConfigCustom = {
          configType: EAPCloudConnectivityConfigType.CUSTOM,
          baseUrl: connectorCloudToken.cloud.baseUrl,
          token: connectorCloudToken.cloud.token
        };
        return apCloudConnectivityConfigCustom;
      }
    }
  }

  private create_ApEventPortalConnectivityConfig_From_ApiEntities({ connectorCloudToken }: {
    connectorCloudToken: string | CloudToken | undefined;
  }): TAPEventPortalConnectivityConfig {
    const funcName = 'create_ApEventPortalConnectivityConfig_From_ApiEntities';
    const logName = `${this.BaseComponentName}.${funcName}()`;
    if (connectorCloudToken === undefined) {
      return this.create_Emtpy_ApEventPortalConnectivityConfig();
    }
    if (typeof connectorCloudToken === 'string') {
      // shared with solace cloud
      const apConfig: TAPEventPortalConnectivityConfigUndefined = {
        configType: EAPEventPortalConnectivityConfigType.UNDEFINED,
        baseUrl: this.DefaultEventPortalBaseUrlStr
      };
      return apConfig;
    } else {
      // it is a CustomCloudEndpoint
      if (connectorCloudToken.eventPortal.token === undefined) {
        return this.create_Emtpy_ApEventPortalConnectivityConfig();
      } else {
        const apConfig: TAPEventPortalConnectivityConfigCustom = {
          configType: EAPEventPortalConnectivityConfigType.CUSTOM,
          baseUrl: connectorCloudToken.eventPortal.baseUrl,
          token: connectorCloudToken.eventPortal.token
        }
        return apConfig;
      }
    }
  }

  private create_ApOrganizationOperationalStatus_From_ApiEntities({ connectorOrganizationStatus }: {
    connectorOrganizationStatus: OrganizationStatus | undefined;
  }): TAPOrganizationOperationalStatus {
    let cloudConnectivity: EAPOrganizationOperationalStatus = EAPOrganizationOperationalStatus.UNDEFINED;
    let eventPortalConnectivity: EAPOrganizationOperationalStatus = EAPOrganizationOperationalStatus.UNDEFINED;
    if (connectorOrganizationStatus !== undefined) {
      if (connectorOrganizationStatus.cloudConnectivity !== undefined && connectorOrganizationStatus.cloudConnectivity) cloudConnectivity = EAPOrganizationOperationalStatus.UP;
      else cloudConnectivity = EAPOrganizationOperationalStatus.DOWN;
      if (connectorOrganizationStatus.eventPortalConnectivity !== undefined && connectorOrganizationStatus.eventPortalConnectivity) eventPortalConnectivity = EAPOrganizationOperationalStatus.UP;
      else eventPortalConnectivity = EAPOrganizationOperationalStatus.DOWN;
    }
    const apOrganizationOperationalStatus: TAPOrganizationOperationalStatus = {
      cloudConnectivity: cloudConnectivity,
      eventPortalConnectivity: eventPortalConnectivity
    };
    return apOrganizationOperationalStatus;
  }

  private create_ApOrganizationSempv2AuthConfig_From_ApiEntities({ connectorSempV2Authentication }: {
    connectorSempV2Authentication?: SempV2Authentication;
  }): TAPOrganizationSempv2AuthConfig {
    const funcName = 'create_ApOrganizationSempv2AuthConfig_From_ApiEntities';
    const logName = `${this.BaseComponentName}.${funcName}()`;

    const apOrganizationSempv2AuthConfig_BasicAuth: TAPOrganizationSempv2AuthConfig_BasicAuth = {
      apAuthType: EAPOrganizationSempv2AuthType.BASIC_AUTH
    }

    if (connectorSempV2Authentication === undefined) return apOrganizationSempv2AuthConfig_BasicAuth;

    switch (connectorSempV2Authentication.authType) {
      case SempV2Authentication.authType.BASIC_AUTH:
        return apOrganizationSempv2AuthConfig_BasicAuth;
      case SempV2Authentication.authType.APIKEY:
        if (connectorSempV2Authentication.apiKeyName === undefined) throw new Error(`${logName}: connectorSempV2Authentication.apiKeyName === undefined`);
        const apOrganizationSempv2AuthConfig_ApiKeyAuth: TAPOrganizationSempv2AuthConfig_ApiKeyAuth = {
          apAuthType: EAPOrganizationSempv2AuthType.API_KEY,
          apiKeyLocation: connectorSempV2Authentication.apiKeyLocation,
          apiKeyName: connectorSempV2Authentication.apiKeyName
        };
        return apOrganizationSempv2AuthConfig_ApiKeyAuth;
      default:
        Globals.assertNever(logName, connectorSempV2Authentication.authType);
    }
    // should never get here
    return apOrganizationSempv2AuthConfig_BasicAuth;
  }

  private create_ApNofiticationHubConfig_From_ApiEntities({ connectorOrganizationResponse }: {
    connectorOrganizationResponse: OrganizationResponse;
  }): TAPNotificationHubConfig | undefined {
    const funcName = 'create_ApNofiticationHubConfig_From_ApiEntities';
    const logName = `${this.BaseComponentName}.${funcName}()`;

    if (connectorOrganizationResponse.integrations === undefined) return undefined;
    if (connectorOrganizationResponse.integrations.notifications === undefined) return undefined;
    const connectorAuth: (BasicAuthentication | APIKeyAuthentication | BearerTokenAuthentication) = connectorOrganizationResponse.integrations.notifications.authentication;
    let apNotificationHubAuth: TAPNotificationHubAuth | undefined = undefined;
    // try basic auth
    const basicAuth: BasicAuthentication = connectorAuth as BasicAuthentication;
    if (basicAuth.userName !== undefined && basicAuth.password !== undefined) {
      const apNotificationHub_BasicAuth: TAPNotificationHub_BasicAuth = {
        apAuthType: EAPNotificationHubAuthType.BASIC_AUTH,
        username: basicAuth.userName,
        password: basicAuth.password
      };
      apNotificationHubAuth = apNotificationHub_BasicAuth;
    } else {
      // try api key auth
      const apiKeyAuth: APIKeyAuthentication = connectorAuth as APIKeyAuthentication;
      if (apiKeyAuth.location !== undefined && apiKeyAuth.key !== undefined && apiKeyAuth.name !== undefined) {
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
        if (bearerTokenAuth.token !== undefined) {
          const apNotificationHub_BearerTokenAuth: TAPNotificationHub_BearerTokenAuth = {
            apAuthType: EAPNotificationHubAuthType.BEARER_TOKEN_AUTH,
            token: bearerTokenAuth.token
          };
          apNotificationHubAuth = apNotificationHub_BearerTokenAuth;
        }
      }
    }
    if (apNotificationHubAuth === undefined) throw new Error(`${logName}: unable to calculate OrganizationNotifier authentication, connectorAuth=${JSON.stringify(connectorAuth, null, 2)}`);

    const apNotificationHubConfig: TAPNotificationHubConfig = {
      baseUrl: connectorOrganizationResponse.integrations.notifications.baseUrl,
      apNotificationHubAuth: apNotificationHubAuth
    };
    return apNotificationHubConfig;
  }

  private calculate_ApConnectivityConfigType({ apCloudConnectivityConfig }: {
    apCloudConnectivityConfig: TAPCloudConnectivityConfig;
  }): EAPOrganizationConnectivityConfigType {
    if (apCloudConnectivityConfig.configType === EAPCloudConnectivityConfigType.CUSTOM) return EAPOrganizationConnectivityConfigType.ADVANCED;
    return EAPOrganizationConnectivityConfigType.SIMPLE;
  }

  protected create_ApOrganizationDisplay_From_ApiEntities({ apsOrganization, connectorOrganizationResponse }: {
    connectorOrganizationResponse: OrganizationResponse;
    apsOrganization: APSOrganization;
  }): IAPOrganizationDisplay {

    const apOrganizationDisplay: IAPOrganizationDisplay = {
      connectorOrganizationResponse: connectorOrganizationResponse,
      apEntityId: { id: apsOrganization.organizationId, displayName: apsOrganization.displayName },

      apMaxNumApis_Per_ApiProduct: apsOrganization.maxNumApisPerApiProduct,
      apAppCredentialsExpiryDuration_millis: apsOrganization.appCredentialsExpiryDuration,

      apOrganizationConnectivityConfigType: EAPOrganizationConnectivityConfigType.SIMPLE,
      apCloudConnectivityConfig: this.create_ApCloudConnectivityConfig_From_ApiEntities({ connectorCloudToken: connectorOrganizationResponse['cloud-token'] }),
      apEventPortalConnectivityConfig: this.create_ApEventPortalConnectivityConfig_From_ApiEntities({ connectorCloudToken: connectorOrganizationResponse['cloud-token'] }),
      apOrganizationSempv2AuthConfig: this.create_ApOrganizationSempv2AuthConfig_From_ApiEntities({ connectorSempV2Authentication: connectorOrganizationResponse.sempV2Authentication }),

      apOrganizationOperationalStatus: this.create_ApOrganizationOperationalStatus_From_ApiEntities({ connectorOrganizationStatus: connectorOrganizationResponse.status }),
      apNotificationHubConfig: this.create_ApNofiticationHubConfig_From_ApiEntities({ connectorOrganizationResponse: connectorOrganizationResponse }),
      apOrganizationConfigStatus: EAPOrganizationConfigStatus.UNDEFINED,
    };
    // set the connectivity config type now
    apOrganizationDisplay.apOrganizationConnectivityConfigType = this.calculate_ApConnectivityConfigType({
      apCloudConnectivityConfig: apOrganizationDisplay.apCloudConnectivityConfig
    });
    return this.set_ApOrganizationConfigStatus({
      apOrganizationDisplay: apOrganizationDisplay
    });
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
      apAppCredentialsExpiryDuration_millis: apOrganizationDisplay.apAppCredentialsExpiryDuration_millis,
      apMaxNumApis_Per_ApiProduct: apOrganizationDisplay.apMaxNumApis_Per_ApiProduct
    };
  }

  public set_ApOrganizationDisplay_General<T extends IAPOrganizationDisplay, K extends IAPOrganizationDisplay_General>({
    apOrganizationDisplay,
    apOrganizationDisplay_General
  }: {
    apOrganizationDisplay: T;
    apOrganizationDisplay_General: K;
  }): T {
    apOrganizationDisplay.apEntityId = apOrganizationDisplay_General.apEntityId;
    apOrganizationDisplay.apAppCredentialsExpiryDuration_millis = apOrganizationDisplay_General.apAppCredentialsExpiryDuration_millis;
    apOrganizationDisplay.apMaxNumApis_Per_ApiProduct = apOrganizationDisplay_General.apMaxNumApis_Per_ApiProduct;
    return apOrganizationDisplay;
  }

  public get_ApOrganizationDisplay_Connectivity<T extends IAPOrganizationDisplay>({ apOrganizationDisplay }: {
    apOrganizationDisplay: T;
  }): IAPOrganizationDisplay_Connectivity {
    return {
      apEntityId: apOrganizationDisplay.apEntityId,
      apOrganizationConnectivityConfigType: this.calculate_ApConnectivityConfigType({ apCloudConnectivityConfig: apOrganizationDisplay.apCloudConnectivityConfig }),
      apCloudConnectivityConfig: apOrganizationDisplay.apCloudConnectivityConfig,
      apEventPortalConnectivityConfig: apOrganizationDisplay.apEventPortalConnectivityConfig,
      apOrganizationSempv2AuthConfig: apOrganizationDisplay.apOrganizationSempv2AuthConfig
    };
  }

  public set_ApOrganizationDisplay_Connectivity<T extends IAPOrganizationDisplay, K extends IAPOrganizationDisplay_Connectivity>({
    apOrganizationDisplay,
    apOrganizationDisplay_Connectivity
  }: {
    apOrganizationDisplay: T;
    apOrganizationDisplay_Connectivity: K;
  }): T {
    apOrganizationDisplay.apOrganizationConnectivityConfigType = apOrganizationDisplay_Connectivity.apOrganizationConnectivityConfigType;
    apOrganizationDisplay.apCloudConnectivityConfig = apOrganizationDisplay_Connectivity.apCloudConnectivityConfig;
    apOrganizationDisplay.apEventPortalConnectivityConfig = apOrganizationDisplay_Connectivity.apEventPortalConnectivityConfig;
    apOrganizationDisplay.apOrganizationSempv2AuthConfig = apOrganizationDisplay_Connectivity.apOrganizationSempv2AuthConfig;
    return apOrganizationDisplay;
  }

  public has_EventPortalConnectivity<T extends IAPOrganizationDisplay>({ apOrganizationDisplay }: {
    apOrganizationDisplay: T;
  }): boolean {
    return (apOrganizationDisplay.apOrganizationOperationalStatus.eventPortalConnectivity === EAPOrganizationOperationalStatus.UP);
  }


  public get_ApOrganizationDisplay_Integration<T extends IAPOrganizationDisplay>({ apOrganizationDisplay }: {
    apOrganizationDisplay: T;
  }): IAPOrganizationDisplay_Integration {
    return {
      apEntityId: apOrganizationDisplay.apEntityId,
      apNotificationHubConfig: apOrganizationDisplay.apNotificationHubConfig
    };
  }

  public set_ApOrganizationDisplay_Integration<T extends IAPOrganizationDisplay, K extends IAPOrganizationDisplay_Integration>({
    apOrganizationDisplay,
    apOrganizationDisplay_Integration
  }: {
    apOrganizationDisplay: T;
    apOrganizationDisplay_Integration: K;
  }): T {
    apOrganizationDisplay.apNotificationHubConfig = apOrganizationDisplay_Integration.apNotificationHubConfig;
    return apOrganizationDisplay;
  }

  // ********************************************************************************************************************************
  // API calls
  // ********************************************************************************************************************************

  public async apiCheck_OrganizationId_Exists({ organizationId }: {
    organizationId: string;
  }): Promise<boolean> {
    try {
      await ApsAdministrationService.getApsOrganization({ organizationId: organizationId });
      return true;
    } catch (e: any) {
      if (APClientConnectorOpenApi.isInstanceOfApiError(e)) {
        const apiError: ApiError = e;
        if (apiError.status === 404) return false;
      }
      throw e;
    }
  }

  protected apiGet_ConnectorOrganizationResponse = async ({ organizationId }: {
    organizationId: string;
  }): Promise<OrganizationResponse> => {
    try {
      const organizationResponse: OrganizationResponse = await AdministrationService.getOrganization({
        organizationName: organizationId
      });
      return this.maskOrganizationSecrets({ organizationObject: organizationResponse });
    } catch (e: any) {
      return this.create_Empty_ConnectorOrganizationResponse();
    }
  }

  public apiGet_ApOrganizationDisplay = async ({ organizationId }: {
    organizationId: string;
  }): Promise<IAPOrganizationDisplay> => {
    // const funcName = 'apiGet_ApOrganizationDisplay';
    // const logName = `${this.BaseComponentName}.${funcName}()`;
    // TEST upstream error handling
    // throw new Error(`${logName}: test error handling`);

    // get the APS organzation first
    const apsOrganization: APSOrganization = await ApsAdministrationService.getApsOrganization({
      organizationId: organizationId
    });
    // get the connector organzation
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

    if (apsUpdate === undefined && connectorOrganization === undefined) throw new Error(`${logName}: apsUpdate === undefined && connectorOrganization === undefined`);

    if (apsUpdate !== undefined) {
      await ApsAdministrationService.updateApsOrganization({
        organizationId: organizationId,
        requestBody: apsUpdate
      });
    }

    // handle the case where connector organization does not exist
    if (connectorOrganization !== undefined) {
      try {
        await AdministrationService.updateOrganization({
          organizationName: organizationId,
          requestBody: connectorOrganization
        });
      } catch (e: any) {
        if (APClientConnectorOpenApi.isInstanceOfApiError(e)) {
          const apiError: ApiError = e;
          if (apiError.status === 404) {
            // try a create
            await AdministrationService.createOrganization({
              requestBody: connectorOrganization
            });
          } else throw e;
        } else throw e;
      }
    }

  }

  public async apiUpdate_ApOrganizationDisplay_General({ apOrganizationDisplay_General }: {
    apOrganizationDisplay_General: IAPOrganizationDisplay_General;
  }): Promise<void> {
    const apsUpdate: APSOrganizationUpdate = {
      displayName: apOrganizationDisplay_General.apEntityId.displayName,
      appCredentialsExpiryDuration: apOrganizationDisplay_General.apAppCredentialsExpiryDuration_millis,
      maxNumApisPerApiProduct: apOrganizationDisplay_General.apMaxNumApis_Per_ApiProduct,
    };
    await this.apiUpdate({
      organizationId: apOrganizationDisplay_General.apEntityId.id,
      apsUpdate: apsUpdate
    });
  }

  protected create_ConnectorSempv2Authentication({ apOrganizationSempv2AuthConfig }: {
    apOrganizationSempv2AuthConfig: TAPOrganizationSempv2AuthConfig;
  }): SempV2Authentication | undefined {
    const funcName = 'create_ConnectorSempv2Authentication';
    const logName = `${this.BaseComponentName}.${funcName}()`;
    // if(apOrganizationSempv2AuthConfig.apAuthType === EAPOrganizationSempv2AuthType.UNDEFINED) return undefined;

    const apOrganizationSempv2AuthType: EAPOrganizationSempv2AuthType = apOrganizationSempv2AuthConfig.apAuthType;
    switch (apOrganizationSempv2AuthType) {
      case EAPOrganizationSempv2AuthType.API_KEY:
        const apiKeyAuth: TAPOrganizationSempv2AuthConfig_ApiKeyAuth = apOrganizationSempv2AuthConfig as TAPOrganizationSempv2AuthConfig_ApiKeyAuth;
        return {
          authType: SempV2Authentication.authType.APIKEY,
          apiKeyLocation: apiKeyAuth.apiKeyLocation,
          apiKeyName: apiKeyAuth.apiKeyName
        };
      case EAPOrganizationSempv2AuthType.BASIC_AUTH:
        // const apBasicAuth: TAPOrganizationSempv2AuthConfig_BasicAuth = apOrganizationSempv2AuthConfig as TAPOrganizationSempv2AuthConfig_BasicAuth;
        return {
          authType: SempV2Authentication.authType.BASIC_AUTH,
          // unsure if this makes sense / is ever used by connector for basic auth
          apiKeyLocation: SempV2Authentication.apiKeyLocation.HEADER,
          // apiKeyName: 'is this ever used'
        };
      default:
        Globals.assertNever(logName, apOrganizationSempv2AuthType);
    }
  }

  protected create_ConnectorCloudToken({ apCloudConnectivityConfig, apEventPortalConnectivityConfig }: {
    apCloudConnectivityConfig: TAPCloudConnectivityConfig;
    apEventPortalConnectivityConfig: TAPEventPortalConnectivityConfig;
  }): string | CloudToken | undefined {
    const funcName = 'create_ConnectorCloudToken';
    const logName = `${this.BaseComponentName}.${funcName}()`;

    if (apCloudConnectivityConfig.configType === EAPCloudConnectivityConfigType.UNDEFINED) return undefined;

    let solaceCloudCustomCloudEndpoint: CustomCloudEndpoint | undefined;
    const apCloudConfigType: EAPCloudConnectivityConfigType = apCloudConnectivityConfig.configType;
    switch (apCloudConfigType) {
      case EAPCloudConnectivityConfigType.SOLACE_CLOUD:
        const apSolaceCloud: TAPCloudConnectivityConfigSolaceCloud = apCloudConnectivityConfig as TAPCloudConnectivityConfigSolaceCloud;
        // for update: can be undefined
        return apSolaceCloud.token === '' ? undefined : apSolaceCloud.token;
      case EAPCloudConnectivityConfigType.CUSTOM:
        const apCustom: TAPCloudConnectivityConfigCustom = apCloudConnectivityConfig as TAPCloudConnectivityConfigCustom;
        solaceCloudCustomCloudEndpoint = {
          baseUrl: apCustom.baseUrl,
          // for update: can be undefined
          token: apCustom.token === '' ? undefined : apCustom.token
        };
        break;
      default:
        Globals.assertNever(logName, apCloudConfigType);
    }

    let eventPortalCustomCloudEndpoint: CustomCloudEndpoint | undefined;
    const apEPConfigType: EAPEventPortalConnectivityConfigType = apEventPortalConnectivityConfig.configType;
    switch (apEPConfigType) {
      case EAPEventPortalConnectivityConfigType.CUSTOM:
        const apEPCustom: TAPEventPortalConnectivityConfigCustom = apEventPortalConnectivityConfig as TAPEventPortalConnectivityConfigCustom;
        eventPortalCustomCloudEndpoint = {
          baseUrl: apEPCustom.baseUrl,
          // for update: can be undefined
          token: apEPCustom.token === '' ? undefined : apEPCustom.token
        };
        break;
      case EAPEventPortalConnectivityConfigType.UNDEFINED:
        throw new Error(`${logName}: unable to handle apEPConfigType=${apEPConfigType}`);
      default:
        Globals.assertNever(logName, apEPConfigType);
    }

    // now returning CloudToken
    if (solaceCloudCustomCloudEndpoint === undefined) throw new Error(`${logName}: solaceCloudCustomCloudEndpoint === undefined`);
    if (eventPortalCustomCloudEndpoint === undefined) throw new Error(`${logName}: eventPortalCustomCloudEndpoint === undefined`);
    const connectorCloudToken: CloudToken = {
      cloud: solaceCloudCustomCloudEndpoint,
      eventPortal: eventPortalCustomCloudEndpoint
    };
    return connectorCloudToken;
  }

  protected create_ConnectorOrganizationProperties_For_Connectivity({ apOrganizationDisplay_Connectivity }: {
    apOrganizationDisplay_Connectivity: IAPOrganizationDisplay_Connectivity;
  }): Organization {

    const connectorOrganization: Organization = {
      name: apOrganizationDisplay_Connectivity.apEntityId.id,
      sempV2Authentication: this.create_ConnectorSempv2Authentication({ apOrganizationSempv2AuthConfig: apOrganizationDisplay_Connectivity.apOrganizationSempv2AuthConfig }),
      "cloud-token": this.create_ConnectorCloudToken({
        apCloudConnectivityConfig: apOrganizationDisplay_Connectivity.apCloudConnectivityConfig,
        apEventPortalConnectivityConfig: apOrganizationDisplay_Connectivity.apEventPortalConnectivityConfig
      })
    };
    return connectorOrganization;
  }

  public async apiUpdate_ApOrganizationDisplay_Connectivity({ apOrganizationDisplay_Connectivity }: {
    apOrganizationDisplay_Connectivity: IAPOrganizationDisplay_Connectivity;
  }): Promise<void> {

    const connectorOrganization: Organization = {
      name: apOrganizationDisplay_Connectivity.apEntityId.id,
      "cloud-token": this.create_ConnectorCloudToken({
        apCloudConnectivityConfig: apOrganizationDisplay_Connectivity.apCloudConnectivityConfig,
        apEventPortalConnectivityConfig: apOrganizationDisplay_Connectivity.apEventPortalConnectivityConfig
      }),
      sempV2Authentication: this.create_ConnectorSempv2Authentication({
        apOrganizationSempv2AuthConfig: apOrganizationDisplay_Connectivity.apOrganizationSempv2AuthConfig
      }),
    };

    await this.apiUpdate({
      organizationId: apOrganizationDisplay_Connectivity.apEntityId.id,
      connectorOrganization: connectorOrganization
    });

  }

  public async apiUpdate_ApOrganizationDisplay_Integration({ apOrganizationDisplay_Integration }: {
    apOrganizationDisplay_Integration: IAPOrganizationDisplay_Integration;
  }): Promise<void> {
    const funcName = 'apiUpdate_ApOrganizationDisplay_NotificationHub';
    const logName = `${this.BaseComponentName}.${funcName}()`;

    if (apOrganizationDisplay_Integration.apNotificationHubConfig === undefined) return;

    let connectorAuth: (BasicAuthentication | APIKeyAuthentication | BearerTokenAuthentication | undefined) = undefined;
    const apNotificationHubAuthType: EAPNotificationHubAuthType = apOrganizationDisplay_Integration.apNotificationHubConfig.apNotificationHubAuth.apAuthType;
    switch (apNotificationHubAuthType) {
      case EAPNotificationHubAuthType.BASIC_AUTH:
        const apNotificationHub_BasicAuth: TAPNotificationHub_BasicAuth = apOrganizationDisplay_Integration.apNotificationHubConfig.apNotificationHubAuth as TAPNotificationHub_BasicAuth;
        const basicAuth: BasicAuthentication = {
          userName: apNotificationHub_BasicAuth.username,
          password: apNotificationHub_BasicAuth.password
        }
        connectorAuth = basicAuth;
        break;
      case EAPNotificationHubAuthType.API_KEY_AUTH:
        const apNotificationHub_ApiKeyAuth: TAPNotificationHub_ApiKeyAuth = apOrganizationDisplay_Integration.apNotificationHubConfig.apNotificationHubAuth as TAPNotificationHub_ApiKeyAuth;
        const apiKeyAuth: APIKeyAuthentication = {
          location: apNotificationHub_ApiKeyAuth.apiKeyLocation,
          name: apNotificationHub_ApiKeyAuth.apiKeyFieldName,
          key: apNotificationHub_ApiKeyAuth.apiKeyValue,
        }
        connectorAuth = apiKeyAuth;
        break;
      case EAPNotificationHubAuthType.BEARER_TOKEN_AUTH:
        const apNotificationHub_BearerTokenAuth: TAPNotificationHub_BearerTokenAuth = apOrganizationDisplay_Integration.apNotificationHubConfig.apNotificationHubAuth as TAPNotificationHub_BearerTokenAuth;
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
    if (connectorAuth === undefined) throw new Error(`${logName}: connectorAuth === undefined`);

    const connectorOrganizationUpdate: Organization = {
      name: apOrganizationDisplay_Integration.apEntityId.id,
      integrations: {
        importers: undefined,
        notifications: {
          baseUrl: apOrganizationDisplay_Integration.apNotificationHubConfig.baseUrl,
          authentication: connectorAuth
        }
      }
    };

    await this.apiUpdate({
      organizationId: apOrganizationDisplay_Integration.apEntityId.id,
      connectorOrganization: connectorOrganizationUpdate
    });
  }

}

export default new APOrganizationsDisplayService();
