import yaml from "js-yaml";
import { SemVer } from "semver";
import { v4 as uuidv4 } from 'uuid';

import { 
  APSAbout 
} from "../_generated/@solace-iot-team/apim-server-openapi-browser";

import { TAPConfigContext } from "../components/ConfigContextProvider/ConfigContextProvider";
import { APConnectorClientOpenApiInfo } from "./APClientConnectorOpenApi";
import { APSClientOpenApiInfo } from "./APSClientOpenApi";

export type TAPPortalAppAbout = {
  name: string;
  description: string;
  repository: {
      type: string;
      url: string;
      revision: {
          sha1: string
      }
  },
  issues_url: string;
  author: string;
  license: string;
  version: string;
  build_date: string;
  'apim-server-openapi-version': string;
  "apim-connector-openapi-version": string;
}

export type TAPPortalAppInfo = {
  connectorClientOpenApiInfo: APConnectorClientOpenApiInfo;
  portalAppServerClientOpenApiInfo: APSClientOpenApiInfo;
  adminPortalAppAbout?: TAPPortalAppAbout;
}
export enum EAPConfigIssueNames {
  CONNECTOR_OPENAPI_VERSION_MISMATCH = 'CONNECTOR_OPENAPI_VERSION_MISMATCH',
  APIM_SERVER_OPENAPI_VERSION_MISMATCH = 'APIM_SERVER_OPENAPI_VERSION_MISMATCH',
  APIM_PORTAL_APP_VERSION_MISMATCH = 'APIM_PORTAL_APP_VERSION_MISMATCH'
}
export type TAPConfigIssue = {
  issue: EAPConfigIssueNames,
  details: any
}
export type TAPConfigIssueList = Array<TAPConfigIssue>;
export enum EAppState {
  ADMIN_PORTAL = 'ADMIN_PORTAL',
  DEVELOPER_PORTAL = 'DEVELOPER_PORTAL',
  PUBLIC_DEVELOPER_PORTAL = 'PUBLIC_DEVELOPER_PORTAL',
  UNDEFINED = 'UNDEFINED'
}

export type TLocationStateAppState = {
  setAppState: boolean
}

export type EUICombinedResourcePaths = EUICommonResourcePaths | EUIAdminPortalResourcePaths | EUIDeveloperPortalResourcePaths;

export enum EUICommonResourcePaths {
  Home = '/',
  Unauthorized = '/unauthorized',
  NoOrganization = '/noorganization',
  Login = '/login',
  ManageUserAccount = '/manage/user/account',
  HealthCheckView = '/healthcheck/view'
}

export enum EUIAdminPortalResourcePaths {
  Home = '/admin-portal',
  UserHome = '/admin-portal/user/home',
  LoginAs = '/admin-portal/loginas',
  ManageOrganizationApps = '/admin-portal/manage/organization/apps',
  ManageOrganizationApiProducts = '/admin-portal/manage/organization/apiproducts',
  ManageOrganizationApis = '/admin-portal/manage/organization/apis',

  ManageOrganization = '/admin-portal/manage/organization',
  ManageOrganizationUsers = '/admin-portal/manage/organization/users',
  ManageOrganizationEnvironments = '/admin-portal/manage/organization/environments',
  ManageOrganizationSettings = '/admin-portal/manage/organization/settings',
  MonitorOrganizationStatus = '/admin-portal/monitor/organization/status',

  ManageSystem = '/admin-portal/manage/system',
  ManageSystemUsers = '/admin-portal/manage/system/users',
  ManageSystemTeams = '/admin-portal/manage/system/teams',
  ManageSystemOrganizations = '/admin-portal/manage/system/organizations',
  ManageSystemConfigConnectors = '/admin-portal/manage/system/config/connectors',
  ManageSystemConfigSettings = '/admin-portal/manage/system/config/settings',
  MonitorSystemHealth = '/admin-portal/monitor/system/health',
  AdminPortalConnectorUnavailable = '/admin-portal/healthcheck/view'
}

export enum EUIDeveloperPortalResourcePaths {
  Home = '/developer-portal',
  UserHome = '/developer-portal/user/home',
  ExploreApiProducts = '/developer-portal/explore/api-products',
  ExploreApis = '/developer-portal/explore/apis',
  ManageUserApplications = '/developer-portal/manage/user/applications',
  ManageTeamApplications = '/developer-portal/manage/team/applications',
  DeveloperPortalConnectorUnavailable = '/developer-portal/healthcheck/view'
}

export enum EUIPublicDeveloperPortalResourcePaths {
  Welcome = '/developer-portal/public/welcome',
  ExploreApiProducts = '/developer-portal/public/explore/api-products',
}

export enum EUIDeveloperToolsResourcePaths {
  TestRoles = '/devel/roles',
  TestErrors = '/devel/test/errors',
  ViewContexts = '/devel/view/contexts',
}

export class Globals {
  private static AppUrl = process.env.PUBLIC_URL + '/';
  public static IssuesUrl = "https://github.com/solace-iot-team/async-apim/issues";

  public static getUUID = (): string => {
    return uuidv4();
  }
  public static getHealthCheckOrgName = (): string => {
    return '__HEALTH_CHECK_ORG__';
  }
  public static reloadApp = () => {
    window.location.href = Globals.AppUrl;
  }

  public static openUrlInNewTab = (url: string) => {
    const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
    if(newWindow) newWindow.opener = null;
  }

  public static assertNever = (extLogName: string, x: never): never => {
    const funcName = 'assertNever';
    const logName = `${Globals.name}.${funcName}()`;
    throw new Error(`${logName}:${extLogName}: unexpected object: ${JSON.stringify(x)}`);
  }

  public static getCurrentHomePath = (isUserLoggedIn: boolean, currentAppState: EAppState): string => {
    const funcName = 'getCurrentHomePath';
    const logName = `${Globals.name}.${funcName}()`;
    switch(currentAppState) {
      case EAppState.ADMIN_PORTAL:
        if(isUserLoggedIn) return EUIAdminPortalResourcePaths.UserHome;
        else return EUIAdminPortalResourcePaths.Home;
      case EAppState.DEVELOPER_PORTAL:
        if(isUserLoggedIn) return EUIDeveloperPortalResourcePaths.UserHome;
        else return EUIDeveloperPortalResourcePaths.Home;
      case EAppState.PUBLIC_DEVELOPER_PORTAL:
        return EUIPublicDeveloperPortalResourcePaths.Welcome;
      case EAppState.UNDEFINED:
        throw new Error(`${logName}: undefined currentAppState=${currentAppState}`);          
      default:
        Globals.assertNever(logName, currentAppState);  
    }
    throw new Error(`${logName}: should never get here`);
    // if(currentAppState === EAppState.ADMIN_PORTAL) {
    //   if(isUserLoggedIn) return EUIAdminPortalResourcePaths.UserHome;
    //   else return EUIAdminPortalResourcePaths.Home;
    // }
    // else if(currentAppState === EAppState.DEVELOPER_PORTAL) {
    //   if(isUserLoggedIn) return EUIDeveloperPortalResourcePaths.UserHome;
    //   else return EUIDeveloperPortalResourcePaths.Home;
    // }
    // else throw new Error(`${logName}: unknown currentAppState=${currentAppState}`);
  }

  public static getOriginHomePath = (originAppState: EAppState): string => {
    const funcName = 'getOriginHomePath';
    const logName = `${Globals.name}.${funcName}()`;
    if(originAppState === EAppState.ADMIN_PORTAL) return EUIAdminPortalResourcePaths.Home;
    else if(originAppState === EAppState.DEVELOPER_PORTAL) return EUIDeveloperPortalResourcePaths.Home;
    else throw new Error(`${logName}: unknown originAppState=${originAppState}`);
  }

  public static sleep = async(millis = 500) => {
    if(millis > 0) await new Promise(resolve => setTimeout(resolve, millis));
  }

  public static generateDeepObjectValuesString = (source: any, result: string = ''): string => {
    const isObject = (obj:any ) => obj && typeof obj === 'object';

    Object.keys(source).forEach( key => {
      const value = source[key];
      if (Array.isArray(value)) result += Globals.generateDeepObjectValuesString(value);
      else if (isObject(value)) result += Globals.generateDeepObjectValuesString(value);
      else result += value + ',';
    });

    return result;
  }

  public static encodeRFC5987ValueChars = (str: string): string => {
    return encodeURIComponent(str)
    // Note that although RFC3986 reserves "!", RFC5987 does not,
    // so we do not need to escape it
    .replace(/['()]/g, escape) // i.e., %27 %28 %29
    .replace(/\*/g, '%2A')
        // The following are not required for percent-encoding per RFC5987,
        // so we can allow for a little better readability over the wire: |`^
        .replace(/%(?:7C|60|5E)/g, unescape);
  }

  public static getObjectAsDisplayYamlString = (jsonObject: any): string => {
    return yaml.dump(jsonObject);
  }

  public static logError = (logName: string, e: any): void => {
    console.error(`${logName}:\n${JSON.stringify(e, null, 2)}`);
  }

  public static crossCheckConfiguration_PortalApp_X_Connector = (configContext: TAPConfigContext): { success: boolean, issueList: TAPConfigIssueList } => {
    let issueList: TAPConfigIssueList = [];
    let success: boolean = true;

    // use SemVer and do the actual comparison 
    const connectorServerOpenApiVersionStr = configContext.connectorInfo?.connectorAbout.portalAbout.connectorOpenApiVersionStr;
    const portalAppConnectorClientOpenApiVersionStr = configContext.portalAppInfo?.connectorClientOpenApiInfo.versionStr;
    if(connectorServerOpenApiVersionStr && portalAppConnectorClientOpenApiVersionStr) {
      const connectorServerOpenApiSemVer: SemVer = new SemVer(connectorServerOpenApiVersionStr);
      const portalAppConnectorClientOpenApiSemVer: SemVer = new SemVer(portalAppConnectorClientOpenApiVersionStr);
      const versionCompare = portalAppConnectorClientOpenApiSemVer.compare(connectorServerOpenApiSemVer);
      if(versionCompare === 1) success = false;
      if(versionCompare !== 0) {
        const i1: TAPConfigIssue = {
          issue: EAPConfigIssueNames.CONNECTOR_OPENAPI_VERSION_MISMATCH,
          details: {
            connectorServerOpenApiVersion: configContext.connectorInfo?.connectorAbout.portalAbout.connectorOpenApiVersionStr,
            connectorClientOpenApiVersion: configContext.portalAppInfo?.connectorClientOpenApiInfo.versionStr
          }
        };
        issueList.push(i1);  
      }
    }    
    return {
      success: success,
      issueList: issueList
    }
  }

  public static crossCheckConfiguration_PortalApp_X_Server = (apPortalAppInfo: TAPPortalAppInfo, apsAbout: APSAbout): { success: boolean, issueList: TAPConfigIssueList } => {
    let issueList: TAPConfigIssueList = [];
    let success: boolean = true;
  
    // use SemVer and do the actual comparison 
    const portalAppServerOpenApiVersionStr = apPortalAppInfo.portalAppServerClientOpenApiInfo.versionStr;
    const apimServerOpenApiVersionStr = apsAbout.versions["apim-server-openapi"];
    if(portalAppServerOpenApiVersionStr && apimServerOpenApiVersionStr) {
      const portalAppServerOpenApiSemVer: SemVer = new SemVer(portalAppServerOpenApiVersionStr);
      const apimServerOpenApiSemVer: SemVer = new SemVer(apimServerOpenApiVersionStr);
      const versionCompare = portalAppServerOpenApiSemVer.compare(apimServerOpenApiSemVer);
      if(versionCompare === 1) success = false;
      if(versionCompare !== 0) {
        const i1: TAPConfigIssue = {
          issue: EAPConfigIssueNames.APIM_SERVER_OPENAPI_VERSION_MISMATCH,
          details: {
            portalAppServerOpenApiVersion: portalAppServerOpenApiVersionStr,
            apimServerOpenApiVersion: apimServerOpenApiVersionStr
          }
        };
        issueList.push(i1);  
      }
    }    
    return {
      success: success,
      issueList: issueList
    }
  }  

  public static crossCheckConfiguration_PortalAppLoaded_X_PortalAppOnServer = (apPortalAppLoadedAbout: TAPPortalAppAbout, apPortalAppOnServerAbout: TAPPortalAppAbout): TAPConfigIssueList => {
    let issueList: TAPConfigIssueList = [];

    // use SemVer and do the actual comparison 
    const portalAppLoadedVersionStr = apPortalAppLoadedAbout.version;
    const portalAppOnServerVersionStr = apPortalAppOnServerAbout.version;
    if(portalAppLoadedVersionStr && portalAppOnServerVersionStr) {
      const portalAppLoadedSemVer: SemVer = new SemVer(portalAppLoadedVersionStr);
      const portalAppOnServerSemVer: SemVer = new SemVer(portalAppOnServerVersionStr);
      if(portalAppLoadedSemVer.compare(portalAppOnServerSemVer) !== 0) {
        const i1: TAPConfigIssue = {
          issue: EAPConfigIssueNames.APIM_PORTAL_APP_VERSION_MISMATCH,
          details: {
            portalAppLoadedVersion: portalAppLoadedVersionStr,
            portalAppOnServerVersion: portalAppOnServerVersionStr
          }
        };
        issueList.push(i1);  
      }
    }    
    return issueList;
  }

  public static deDuplicateStringList = (stringList: Array<string>): Array<string> => {
    const unique = new Map<string, number>();
    let distinct = [];
    for(let i=0; i < stringList.length; i++) {
      if(!unique.has(stringList[i])) {
        distinct.push(stringList[i]);
        unique.set(stringList[i], 1);
      }
    }
    return distinct;
  }
}

export class GlobalElementStyles {
  public static breadcrumbLink = (): any => {
    return {
      'textDecoration': 'underline'
    }
  }
}