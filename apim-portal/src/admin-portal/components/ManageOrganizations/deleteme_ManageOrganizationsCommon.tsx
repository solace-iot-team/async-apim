import { 
  CloudToken,
  CommonDisplayName,
  CommonName,
  SempV2Authentication, 
} from '@solace-iot-team/apim-connector-openapi-browser';
import { TAPOrganization } from '../../../utils/deleteme_APOrganizationsService';
import { Globals } from '../../../utils/Globals';

export enum EAPReverseProxySempV2AuthType {
  BASIC_AUTH = 'HTTP Basic Auth',
  API_KEY = 'API Key'
}
export enum EAPReverseProxySempV2ApiKeyLocation {
  HEADER = 'header',
  QUERY = 'query'
}
export enum EAPBrokerServiceDiscoveryProvisioningType {
  SOLACE_CLOUD = 'Solace Cloud',
  REVERSE_PROXY = 'Reverse Proxy'
}
export type TAPBrokerServiceDiscoveryProvioning_SolaceCloud = {
  baseUrl: string;
  cloudToken: string;
}
export type TAPBrokerServiceDiscoveryProvioning_ReverseProxy = {
  baseUrl: string;
  token: string;
  sempV2AuthType: EAPReverseProxySempV2AuthType;    
  sempV2AuthType_Basic: TAPReverseProxySempV2AuthenticationBasic;
  sempV2AuthType_ApiKey: TAPReverseProxySempV2AuthenticationApiKey;
}
export type TAPReverseProxySempV2AuthenticationBasic = {
  // authType: EAPReverseProxySempV2AuthType.BASIC_AUTH;
}
export type TAPReverseProxySempV2AuthenticationApiKey = {
  // authType: EAPReverseProxySempV2AuthType.API_KEY;
  apiKeyLocation: EAPReverseProxySempV2ApiKeyLocation;
  apiKeyName: string;
}
export type TAPOrganizationConfigSimple = {
  cloudToken: string;
}
export type TAPOrganizationConfigAdvancedServiceDiscoveryProvisioning = {
  bsdp_Type: EAPBrokerServiceDiscoveryProvisioningType;
  bsdp_SolaceCloud: TAPBrokerServiceDiscoveryProvioning_SolaceCloud;
  bsdp_ReverseProxy: TAPBrokerServiceDiscoveryProvioning_ReverseProxy;
}
export type TAPOrganizationConfigEventPortal = {
  isConfigured: boolean;
  baseUrl: string;
  cloudToken: string;
}
export enum EAPOrganizationConfigType {
  SIMPLE = 'Simple',
  ADVANCED = 'Advanced'
}
export type TAPOrganizationConfig = {
  apOrganization: TAPOrganization;
  name: CommonName;
  displayName: CommonDisplayName;
  configType: EAPOrganizationConfigType;
  configSimple: TAPOrganizationConfigSimple;
  configAdvancedServiceDiscoveryProvisioning: TAPOrganizationConfigAdvancedServiceDiscoveryProvisioning;
  configAdvancedEventPortal: TAPOrganizationConfigEventPortal;
}

export enum E_COMPONENT_STATE {
  UNDEFINED = "UNDEFINED",
  MANAGED_OBJECT_LIST_VIEW = "MANAGED_OBJECT_LIST_VIEW",
  MANAGED_OBJECT_VIEW = "MANAGED_OBJECT_VIEW",
  MANAGED_OBJECT_EDIT = "MANAGED_OBJECT_EDIT",
  MANAGED_OBJECT_DELETE = "MANAGED_OBJECT_DELETE",
  MANAGED_OBJECT_NEW = "MANAGED_OBJECT_NEW",
  MONITOR_OBJECT = "MONITOR_OBJECT",
  MANAGE_ORGANIZATION_USERS = "MANAGE_ORGANIZATION_USERS",
  MANAGE_IMPORT_ORGANIZATIONS = "MANAGE_IMPORT_ORGANIZATIONS",
  MANAGED_OBJECT_IMPORT_EDIT = "MANAGED_OBJECT_IMPORT_EDIT"
}

export enum E_CALL_STATE_ACTIONS {
  API_DELETE_ORGANIZATION = "API_DELETE_ORGANIZATION",
  API_GET_ORGANIZATION_LIST = "API_GET_ORGANIZATION_LIST",
  API_CREATE_ORGANIZATION = "API_CREATE_ORGANIZATION",
  API_GET_ORGANIZATION = "API_GET_ORGANIZATION",
  API_UPDATE_ORGANIZATION = "API_UPDATE_ORGANIZATION",
  API_GET_ORGANIZATION_ASSETS = "API_GET_ORGANIZATION_ASSETS",
  API_LOGOUT_ORGANIZATION_ALL = "API_LOGOUT_ORGANIZATION_ALL",
}

export enum E_COMPONENT_STATE_USERS {
  UNDEFINED = "UNDEFINED",
  MANAGED_OBJECT_LIST_VIEW = "MANAGED_OBJECT_LIST_VIEW",
  MANAGED_OBJECT_EDIT_ROLES = "MANAGED_OBJECT_EDIT_ROLES",
  MANAGED_OBJECT_ADD = "MANAGED_OBJECT_ADD",
}

export enum E_COMPONENT_STATE_ADD_USER {
  UNDEFINED = "UNDEFINED",
  SYSTEM_USER_LIST_VIEW = "SYSTEM_USER_LIST_VIEW",
  EDIT_USER_ROLES = "EDIT_USER_ROLES",
}

export enum E_CALL_STATE_ACTIONS_USERS {
  API_GET_USER_LIST = "API_GET_USER_LIST",
  API_GET_USER = "API_GET_USER",
  API_UPDATE_USER_ROLES = "API_UPDATE_USER_ROLES",
  API_ADD_USER = "API_ADD_USER",
  API_CREATE_ORGANIZATION_USER_FROM_SYSTEM_USER = "API_CREATE_ORGANIZATION_USER_FROM_SYSTEM_USER",
  API_ADD_USER_TO_ORG = "API_ADD_USER_TO_ORG",
  API_USER_LOGOUT = "API_USER_LOGOUT"
}

export class ManageOrganizationsCommon {

  private static CDefaultSolaceCloudBaseUrlStr: string = 'https://api.solace.cloud/api/v0';
  private static CDefaultEventPortalBaseUrlStr: string = 'https://api.solace.cloud/api/v0/eventPortal';

  private static CEmptyOrganizationConfig: TAPOrganizationConfig = {
    apOrganization: {
      name: '',
      displayName: ''
    },
    name: '',
    displayName: '',
    configType: EAPOrganizationConfigType.SIMPLE,
    configSimple: {
      cloudToken: ''
    },
    configAdvancedServiceDiscoveryProvisioning: {
      bsdp_Type: EAPBrokerServiceDiscoveryProvisioningType.SOLACE_CLOUD,
      bsdp_SolaceCloud: {
        baseUrl: ManageOrganizationsCommon.CDefaultSolaceCloudBaseUrlStr,
        cloudToken: ''
      },
      bsdp_ReverseProxy: {
        baseUrl: '',
        token: '',
        sempV2AuthType: EAPReverseProxySempV2AuthType.BASIC_AUTH,
        sempV2AuthType_Basic: {},
        sempV2AuthType_ApiKey: {
          apiKeyLocation: EAPReverseProxySempV2ApiKeyLocation.HEADER,
          apiKeyName: 'apiKey'
        }
      }
    },
    configAdvancedEventPortal: {
      isConfigured: false,
      baseUrl: ManageOrganizationsCommon.CDefaultEventPortalBaseUrlStr,
      cloudToken: ''
    }
  };

  public static createEmptyOrganizationConfig = (): TAPOrganizationConfig => {
    return JSON.parse(JSON.stringify(ManageOrganizationsCommon.CEmptyOrganizationConfig));
  }

  private static mapAPReverseProxySempv2AuthTypeToApiAuthType = (apAuthType: EAPReverseProxySempV2AuthType): SempV2Authentication.authType => {
    const funcName = 'mapAPReverseProxySempv2AuthTypeToApiAuthType';
    const logName = `${ManageOrganizationsCommon.name}.${funcName}()`;
    switch (apAuthType) {
      case EAPReverseProxySempV2AuthType.BASIC_AUTH:
        return SempV2Authentication.authType.BASIC_AUTH;
      case EAPReverseProxySempV2AuthType.API_KEY:
        return SempV2Authentication.authType.APIKEY;
      default:
        Globals.assertNever(logName, apAuthType);
    }
    throw new Error(`${logName}: must never get here`);
  }
  private static mapApiSempv2AuthTypeToAPReverseProxySempv2AuthType = (apiAuthType: SempV2Authentication.authType): EAPReverseProxySempV2AuthType => {
    const funcName = 'mapApiSempv2AuthTypeToAPReverseProxySempv2AuthType';
    const logName = `${ManageOrganizationsCommon.name}.${funcName}()`;
    switch (apiAuthType) {
      case SempV2Authentication.authType.BASIC_AUTH:
        return EAPReverseProxySempV2AuthType.BASIC_AUTH;
      case SempV2Authentication.authType.APIKEY:
        return EAPReverseProxySempV2AuthType.API_KEY;
      default:
        Globals.assertNever(logName, apiAuthType);
    }
    throw new Error(`${logName}: must never get here`);
  }
  private static mapAPReverseProxyApiKeyLocationToApiKeyLocation = (apKeyLocation: EAPReverseProxySempV2ApiKeyLocation): SempV2Authentication.apiKeyLocation  => {
    const funcName = 'mapAPReverseProxyApiKeyLocationToApiKeyLocation';
    const logName = `${ManageOrganizationsCommon.name}.${funcName}()`;
    switch(apKeyLocation) {
      case EAPReverseProxySempV2ApiKeyLocation.HEADER:
        return SempV2Authentication.apiKeyLocation.HEADER;
      case EAPReverseProxySempV2ApiKeyLocation.QUERY:
        return SempV2Authentication.apiKeyLocation.QUERY;
      default:
        Globals.assertNever(logName, apKeyLocation);
    }
    throw new Error(`${logName}: must never get here`);
  }
  private static mapApiSempv2KeyLocationToAPReverseProxyApiKeyLocation = (apiKeyLocation: SempV2Authentication.apiKeyLocation): EAPReverseProxySempV2ApiKeyLocation   => {
    const funcName = 'mapApiSempv2KeyLocationToAPReverseProxyApiKeyLocation';
    const logName = `${ManageOrganizationsCommon.name}.${funcName}()`;
    switch(apiKeyLocation) {
      case SempV2Authentication.apiKeyLocation.HEADER:
        return EAPReverseProxySempV2ApiKeyLocation.HEADER;
      case SempV2Authentication.apiKeyLocation.QUERY:
        return EAPReverseProxySempV2ApiKeyLocation.QUERY;
      default:
        Globals.assertNever(logName, apiKeyLocation);
    }
    throw new Error(`${logName}: must never get here`);
  }

  public static transformAPOrganizationToAPOrganizationConfig = (apObject: TAPOrganization): TAPOrganizationConfig => {
    const funcName = 'transformAPOrganizationToAPOrganizationConfig';
    const logName = `${ManageOrganizationsCommon.name}.${funcName}()`;

    if(apObject["cloud-token"] === undefined) throw new Error(`${logName}: apObject["cloud-token"] is undefined`);
    let oc: TAPOrganizationConfig = ManageOrganizationsCommon.createEmptyOrganizationConfig();
    oc.name = apObject.name;
    oc.displayName = apObject.displayName;
    oc.apOrganization = apObject;
    if( typeof apObject["cloud-token"] === 'string' ) {
      oc.configType = EAPOrganizationConfigType.SIMPLE;
      oc.configSimple = { 
        cloudToken: apObject["cloud-token"]
      };
      return oc;
    } else if( typeof apObject["cloud-token"] === 'object') {
      oc.configType = EAPOrganizationConfigType.ADVANCED;
      if(apObject['cloud-token'].cloud.token === undefined) throw new Error(`${logName}: apObject['cloud-token'].cloud.token is undefined`);
      if(apObject['cloud-token'].eventPortal.token === undefined) throw new Error(`${logName}: apObject['cloud-token'].eventPortal.token is undefined`);
      if(!apObject.sempV2Authentication) {
        // Solace cloud
        oc.configAdvancedServiceDiscoveryProvisioning.bsdp_Type = EAPBrokerServiceDiscoveryProvisioningType.SOLACE_CLOUD;
        oc.configAdvancedServiceDiscoveryProvisioning.bsdp_SolaceCloud = {
          baseUrl: apObject['cloud-token'].cloud.baseUrl,
          cloudToken: apObject['cloud-token'].cloud.token
        };
        oc.configAdvancedEventPortal = {
          isConfigured: apObject['cloud-token'].eventPortal.token !== undefined,
          baseUrl: apObject['cloud-token'].eventPortal.baseUrl,
          cloudToken: apObject['cloud-token'].eventPortal.token
        };
        return oc;
      } else {        
        // reverse proxy
        oc.configAdvancedServiceDiscoveryProvisioning.bsdp_Type = EAPBrokerServiceDiscoveryProvisioningType.REVERSE_PROXY;
        const sempV2AuthType: EAPReverseProxySempV2AuthType = ManageOrganizationsCommon.mapApiSempv2AuthTypeToAPReverseProxySempv2AuthType(apObject.sempV2Authentication.authType);
        let sempV2AuthType_Basic: TAPReverseProxySempV2AuthenticationBasic = oc.configAdvancedServiceDiscoveryProvisioning.bsdp_ReverseProxy.sempV2AuthType_Basic;
        let sempV2AuthType_ApiKey: TAPReverseProxySempV2AuthenticationApiKey = oc.configAdvancedServiceDiscoveryProvisioning.bsdp_ReverseProxy.sempV2AuthType_ApiKey;
        switch(sempV2AuthType) {
          case EAPReverseProxySempV2AuthType.BASIC_AUTH:
            sempV2AuthType_Basic = {};
            break;
          case EAPReverseProxySempV2AuthType.API_KEY:
            if(!apObject.sempV2Authentication.apiKeyName) throw new Error(`${logName}: apObject.sempV2Authentication.apiKeyName is undefined`);
            sempV2AuthType_ApiKey = {
              apiKeyLocation: ManageOrganizationsCommon.mapApiSempv2KeyLocationToAPReverseProxyApiKeyLocation(apObject.sempV2Authentication.apiKeyLocation),
              apiKeyName: apObject.sempV2Authentication.apiKeyName
            };
            break;
          default:
            Globals.assertNever(logName, sempV2AuthType);
        }
        oc.configAdvancedServiceDiscoveryProvisioning.bsdp_ReverseProxy = {
          baseUrl: apObject['cloud-token'].cloud.baseUrl,
          token: apObject['cloud-token'].cloud.token,
          sempV2AuthType: sempV2AuthType,
          sempV2AuthType_Basic: sempV2AuthType_Basic,
          sempV2AuthType_ApiKey: sempV2AuthType_ApiKey
        }
        return oc;
      }
    } else throw new Error(`${logName}: cannot determine type of organization config from apiObject=${JSON.stringify(apObject, null, 2)}`);
  }

  private static createSimple = (name: CommonName, displayName: CommonDisplayName, configSimple: TAPOrganizationConfigSimple): TAPOrganization => {
    const apOrganization: TAPOrganization = {
      name: name,
      displayName: displayName,
      "cloud-token": configSimple.cloudToken
    }
    return apOrganization;  
  }

  private static createAdvanced = (name: CommonName, displayName: CommonDisplayName, configAdvancedServiceDiscoveryProvisioning: TAPOrganizationConfigAdvancedServiceDiscoveryProvisioning, configAdvancedEventPortal: TAPOrganizationConfigEventPortal): TAPOrganization => {
    const funcName = 'createAdvanced';
    const logName = `${ManageOrganizationsCommon.name}.${funcName}()`;

    if(configAdvancedServiceDiscoveryProvisioning.bsdp_Type === EAPBrokerServiceDiscoveryProvisioningType.SOLACE_CLOUD) {
      const ct: CloudToken = {
        cloud: {
          baseUrl: configAdvancedServiceDiscoveryProvisioning.bsdp_SolaceCloud.baseUrl,
          token: configAdvancedServiceDiscoveryProvisioning.bsdp_SolaceCloud.cloudToken
        },
        eventPortal: {
          baseUrl: configAdvancedEventPortal.baseUrl,
          token: configAdvancedEventPortal.cloudToken
        }
      };
      const apOrganization: TAPOrganization = {
        name: name,
        displayName: displayName,
        "cloud-token": ct
      }
      return apOrganization;  
    } else if (configAdvancedServiceDiscoveryProvisioning.bsdp_Type === EAPBrokerServiceDiscoveryProvisioningType.REVERSE_PROXY) {
      const ct: CloudToken = {
        cloud: {
          baseUrl: configAdvancedServiceDiscoveryProvisioning.bsdp_ReverseProxy.baseUrl,
          token: configAdvancedServiceDiscoveryProvisioning.bsdp_ReverseProxy.token
        },
        eventPortal: {
          baseUrl: configAdvancedEventPortal.baseUrl,
          token: configAdvancedEventPortal.cloudToken
        }
      };
      const sempv2Auth: SempV2Authentication = {
        authType: ManageOrganizationsCommon.mapAPReverseProxySempv2AuthTypeToApiAuthType(configAdvancedServiceDiscoveryProvisioning.bsdp_ReverseProxy.sempV2AuthType),
        apiKeyLocation: ManageOrganizationsCommon.mapAPReverseProxyApiKeyLocationToApiKeyLocation(configAdvancedServiceDiscoveryProvisioning.bsdp_ReverseProxy.sempV2AuthType_ApiKey.apiKeyLocation),
        apiKeyName: configAdvancedServiceDiscoveryProvisioning.bsdp_ReverseProxy.sempV2AuthType_ApiKey.apiKeyName
      }
      const apOrganization: TAPOrganization = {
        name: name,
        displayName: displayName,
        "cloud-token": ct,
        sempV2Authentication: sempv2Auth
      }
      return apOrganization;    
    } else throw new Error(`${logName}: unknown configAdvancedServiceDiscoveryProvisioning.bsdp_Type=${configAdvancedServiceDiscoveryProvisioning.bsdp_Type}`);
  }

  public static transformAPOrganizationConfigToAPOrganization = (oc: TAPOrganizationConfig): TAPOrganization => {
    const funcName = 'transformAPOrganizationConfigToAPOrganization';
    const logName = `${ManageOrganizationsCommon.name}.${funcName}()`;
    switch(oc.configType) {
      case EAPOrganizationConfigType.SIMPLE:
        return ManageOrganizationsCommon.createSimple(oc.name, oc.displayName, oc.configSimple);
      case EAPOrganizationConfigType.ADVANCED:
        return ManageOrganizationsCommon.createAdvanced(oc.name, oc.displayName, oc.configAdvancedServiceDiscoveryProvisioning, oc.configAdvancedEventPortal);
      default:
        Globals.assertNever(logName, oc.configType);
    }
    throw new Error(`${logName}: must never get here`);
  }
}
