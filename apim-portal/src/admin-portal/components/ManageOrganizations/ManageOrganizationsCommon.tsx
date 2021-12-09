import { 
  CloudToken,
  CommonName,
  Organization,
  SempV2Authentication, 
} from '@solace-iot-team/apim-connector-openapi-browser';

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
  baseUrl: string;
  cloudToken: string;
}
export enum EAPOrganizationConfigType {
  SIMPLE = 'Simple',
  ADVANCED = 'Advanced'
}
export type TAPOrganizationConfig = {
  name: CommonName;
  configType: EAPOrganizationConfigType;
  configSimple: TAPOrganizationConfigSimple;
  configAdvancedServiceDiscoveryProvisioning: TAPOrganizationConfigAdvancedServiceDiscoveryProvisioning;
  configAdvancedEventPortal: TAPOrganizationConfigEventPortal;
}

export enum E_CALL_STATE_ACTIONS {
  API_DELETE_ORGANIZATION = "API_DELETE_ORGANIZATION",
  API_GET_ORGANIZATION_LIST = "API_GET_ORGANIZATION_LIST",
  API_CREATE_ORGANIZATION = "API_CREATE_ORGANIZATION",
  API_GET_ORGANIZATION = "API_GET_ORGANIZATION",
  API_UPDATE_ORGANIZATION = "API_UPDATE_ORGANIZATION",
}

export class ManageOrganizationsCommon {

  private static CDefaultSolaceCloudBaseUrlStr: string = 'https://api.solace.cloud/api/v0';
  private static CDefaultEventPortalBaseUrlStr: string = 'https://api.solace.cloud/api/v0/eventPortal';

  private static CEmptyOrganizationConfig: TAPOrganizationConfig = {
    name: '',
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

  public static transformApiOrganizationToAPOrganizationConfig = (apiObject: Organization): TAPOrganizationConfig => {
    const funcName = 'transformApiOrganizationToAPOrganizationConfig';
    const logName = `${ManageOrganizationsCommon.name}.${funcName}()`;

    if(!apiObject["cloud-token"]) throw new Error(`${logName}: apiObject["cloud-token"] is undefined`);
    let oc: TAPOrganizationConfig = ManageOrganizationsCommon.createEmptyOrganizationConfig();
    oc.name = apiObject.name;
    if( typeof apiObject["cloud-token"] === 'string' ) {
      oc.configType = EAPOrganizationConfigType.SIMPLE;
      oc.configSimple = { 
        cloudToken: apiObject["cloud-token"]
      };
      return oc;
    } else if( typeof apiObject["cloud-token"] === 'object') {
      oc.configType = EAPOrganizationConfigType.ADVANCED;
      if(!apiObject['cloud-token'].cloud.token) throw new Error(`${logName}: apiObject['cloud-token'].cloud.token is undefined`);
      if(!apiObject['cloud-token'].eventPortal.token) throw new Error(`${logName}: apiObject['cloud-token'].eventPortal.token is undefined`);
      if(!apiObject.sempV2Authentication) {
        // Solace cloud
        oc.configAdvancedServiceDiscoveryProvisioning.bsdp_Type = EAPBrokerServiceDiscoveryProvisioningType.SOLACE_CLOUD;
        oc.configAdvancedServiceDiscoveryProvisioning.bsdp_SolaceCloud = {
          baseUrl: apiObject['cloud-token'].cloud.baseUrl,
          cloudToken: apiObject['cloud-token'].cloud.token
        };
        oc.configAdvancedEventPortal = {
          baseUrl: apiObject['cloud-token'].eventPortal.baseUrl,
          cloudToken: apiObject['cloud-token'].eventPortal.token
        };
        return oc;
      } else {        
        // reverse proxy
        oc.configAdvancedServiceDiscoveryProvisioning.bsdp_Type = EAPBrokerServiceDiscoveryProvisioningType.REVERSE_PROXY;
        const sempV2AuthType: EAPReverseProxySempV2AuthType = ManageOrganizationsCommon.mapApiSempv2AuthTypeToAPReverseProxySempv2AuthType(apiObject.sempV2Authentication.authType);
        let sempV2AuthType_Basic: TAPReverseProxySempV2AuthenticationBasic = oc.configAdvancedServiceDiscoveryProvisioning.bsdp_ReverseProxy.sempV2AuthType_Basic;
        let sempV2AuthType_ApiKey: TAPReverseProxySempV2AuthenticationApiKey = oc.configAdvancedServiceDiscoveryProvisioning.bsdp_ReverseProxy.sempV2AuthType_ApiKey;
        switch(sempV2AuthType) {
          case EAPReverseProxySempV2AuthType.BASIC_AUTH:
            sempV2AuthType_Basic = {};
            break;
          case EAPReverseProxySempV2AuthType.API_KEY:
            if(!apiObject.sempV2Authentication.apiKeyName) throw new Error(`${logName}: apiObject.sempV2Authentication.apiKeyName is undefined`);
            sempV2AuthType_ApiKey = {
              apiKeyLocation: ManageOrganizationsCommon.mapApiSempv2KeyLocationToAPReverseProxyApiKeyLocation(apiObject.sempV2Authentication.apiKeyLocation),
              apiKeyName: apiObject.sempV2Authentication.apiKeyName
            };
            break;
          default:
            Globals.assertNever(logName, sempV2AuthType);
        }
        oc.configAdvancedServiceDiscoveryProvisioning.bsdp_ReverseProxy = {
          baseUrl: apiObject['cloud-token'].cloud.baseUrl,
          token: apiObject['cloud-token'].cloud.token,
          sempV2AuthType: sempV2AuthType,
          sempV2AuthType_Basic: sempV2AuthType_Basic,
          sempV2AuthType_ApiKey: sempV2AuthType_ApiKey
        }
        return oc;
      }
    } else throw new Error(`${logName}: cannot determine type of organization config from apiObject=${JSON.stringify(apiObject, null, 2)}`);
  }

  private static createSimple = (name: CommonName, configSimple: TAPOrganizationConfigSimple): Organization => {
    const apiOrganization: Organization = {
      name: name,
      "cloud-token": configSimple.cloudToken
    }
    return apiOrganization;  
  }

  private static createAdvanced = (name: CommonName, configAdvancedServiceDiscoveryProvisioning: TAPOrganizationConfigAdvancedServiceDiscoveryProvisioning, configAdvancedEventPortal: TAPOrganizationConfigEventPortal): Organization => {
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
      const apiOrganization: Organization = {
        name: name,
        "cloud-token": ct
      }
      return apiOrganization;  
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
      const apiOrganization: Organization = {
        name: name,
        "cloud-token": ct,
        sempV2Authentication: sempv2Auth
      }
      return apiOrganization;    
    } else throw new Error(`${logName}: unknown configAdvancedServiceDiscoveryProvisioning.bsdp_Type=${configAdvancedServiceDiscoveryProvisioning.bsdp_Type}`);
  }

  public static transformAPOrganizationConfigToApiOrganization = (oc: TAPOrganizationConfig): Organization => {
    const funcName = 'transformAPOrganizationConfigToApiOrganization';
    const logName = `${ManageOrganizationsCommon.name}.${funcName}()`;
    switch(oc.configType) {
      case EAPOrganizationConfigType.SIMPLE:
        return ManageOrganizationsCommon.createSimple(oc.name, oc.configSimple);
      case EAPOrganizationConfigType.ADVANCED:
        return ManageOrganizationsCommon.createAdvanced(oc.name, oc.configAdvancedServiceDiscoveryProvisioning, oc.configAdvancedEventPortal);
      default:
        Globals.assertNever(logName, oc.configType);
    }
    throw new Error(`${logName}: must never get here`);
  }
}
