
import { 
  About
} from '@solace-iot-team/apim-connector-openapi-browser';
import { 
  APSAbout, 
  ApsConfigService, 
  APSConnectorStatus, 
  ApsMonitorService, 
  APSStatus 
} from "../_generated/@solace-iot-team/apim-server-openapi-browser";
import { APClientRawError, APClientServerRaw } from './APClientRaw';
import { APClientConnectorOpenApi } from './APClientConnectorOpenApi';
import { EAppState, Globals, TAPConfigIssueList, TAPPortalAppAbout } from './Globals';
import { TAPConfigContext } from '../components/ConfigContextProvider/ConfigContextProvider';
import { TUserContext } from '../components/APContextProviders/APUserContextProvider';
import { APConnectorApiHelper, TAPConnectorAbout } from './APConnectorApiCalls';
import { APLogger } from './APLogger';
import { ApiCallState, TApiCallState } from './ApiCallState';
import { APError } from './APError';
import { APSClientOpenApi, APSClientOpenApiInfo } from './APSClientOpenApi';
import { APortalAppApiCalls, E_APORTAL_APP_CALL_STATE_ACTIONS } from './APortalApiCalls';


// ******************************************************
// * General
// ******************************************************
export enum EAPHealthCheckSuccess {
  PASS = "pass",
  FAIL = "fail",
  PASS_WITH_ISSUES = "pass (with issues)",
  UNDEFINED = "N/A"
}
export type TAPHealthCheckSummary = {
  performed: boolean;
  success: EAPHealthCheckSuccess;
  timestamp: number;
}
// ******************************************************
// * APConnector
// ******************************************************
export enum EAPConnectorHealthCheckLogEntryType {
  // GET_CONNECTOR_API_BASE = 'GET_CONNECTOR_API_BASE',
  GET_CONNECTOR_STATUS = 'GET_CONNECTOR_STATUS',
  GET_CONNECTOR_ABOUT = 'GET_CONNECTOR_ABOUT',
  GET_CONNECTOR_HEALTH_CHECK_ENDPOINT = 'GET_CONNECTOR_HEALTH_CHECK_ENDPOINT',
  GET_CONNECTOR_HEALTH_CHECK_CONFIGURATION = 'GET_CONNECTOR_HEALTH_CHECK_CONFIGURATION',
  // GET_CONNECTOR_HEALTH_CHECK_PLATFORM_ADMIN_CREDS = 'GET_CONNECTOR_HEALTH_CHECK_PLATFORM_ADMIN_CREDS', 
  // GET_CONNECTOR_HEALTH_CHECK_ORG_ADMIN_CREDS = 'GET_CONNECTOR_HEALTH_CHECK_ORG_ADMIN_CREDS'
}
export type TAPConnectorHealthCheckLogEntry_Base = {
  entryType: EAPConnectorHealthCheckLogEntryType;
  success: EAPHealthCheckSuccess;
  callState: TApiCallState;
}
// export type TAPConnectorHealthCheckLogEntry_ApiBase = TAPConnectorHealthCheckLogEntry_Base & {
//   openApiInfo: APConnectorClientOpenApiInfo;
//   apiBaseResult?: any;
// }
export type TAPConnectorHealthCheckLogEntry_ApiCallError = TAPConnectorHealthCheckLogEntry_Base & {
  error?: any;
}
export type TAPConnectorHealthCheckLogEntry_About = TAPConnectorHealthCheckLogEntry_Base & {
  about?: About;
}
export type TAPConnectorHealthCheckLogEntry_HealthCheckEndpoint = TAPConnectorHealthCheckLogEntry_Base & {
  status?: string;
}
export type TAPConnectorHealthCheckLogEntry_CheckConfiguration = TAPConnectorHealthCheckLogEntry_Base & {
  issueList?: TAPConfigIssueList;
}
// export type TAPConnectorHealthCheckLogEntry_CheckPlatformAdminCreds = TAPConnectorHealthCheckLogEntry_Base & {
// }
// export type TAPConnectorHealthCheckLogEntry_CheckOrgAdminCreds = TAPConnectorHealthCheckLogEntry_Base & {
// }
export type TAPConnectorHealthCheckLogEntry = 
  TAPConnectorHealthCheckLogEntry_About
  | TAPConnectorHealthCheckLogEntry_ApiCallError
  | TAPConnectorHealthCheckLogEntry_CheckConfiguration
  | TAPConnectorHealthCheckLogEntry_HealthCheckEndpoint;

export type TAPConnectorHealthCheckLogEntryList = Array<TAPConnectorHealthCheckLogEntry>;
export type TAPConnectorHealthCheckResult = {
  summary: TAPHealthCheckSummary;
  healthCheckLog: TAPConnectorHealthCheckLogEntryList;
}
// ******************************************************
// * APPortal App
// ******************************************************
export enum EAPPortalAppHealthCheckLogEntryType {
  GET_PORTAL_APP_ABOUT = 'GET_PORTAL_APP_ABOUT',
  GET_PORTAL_APP_HEALTH_CHECK_CONFIGURATION = 'GET_PORTAL_APP_HEALTH_CHECK_CONFIGURATION'
}
export type TAPPortalAppHealthCheckLogEntry_Base = {
  entryType: EAPPortalAppHealthCheckLogEntryType;
  success: EAPHealthCheckSuccess;
  callState: TApiCallState;
}
export type TAPPortalAppHealthCheckLogEntry_About = TAPPortalAppHealthCheckLogEntry_Base & {
  apPortalAppAbout?: TAPPortalAppAbout;
}
export type TAPPortalAppHealthCheckLogEntry_CheckConfiguration = TAPPortalAppHealthCheckLogEntry_Base & {
  issueList?: TAPConfigIssueList;
}
export type TAPPortalAppHealthCheckLogEntry = 
  TAPPortalAppHealthCheckLogEntry_About
  | TAPPortalAppHealthCheckLogEntry_CheckConfiguration;
export type TAPPortalAppHealthCheckLogEntryList = Array<TAPPortalAppHealthCheckLogEntry>;
export type TAPPortalAppHealthCheckResult = {
  summary: TAPHealthCheckSummary;
  healthCheckLog: TAPPortalAppHealthCheckLogEntryList;
}

export class APPortalAppHealthCheck {
  private static componentName = 'APPortalAppHealthCheck';

  public static getInitializedHealthCheckResult = (): TAPPortalAppHealthCheckResult => {
    return {
      healthCheckLog: [],
      summary: { 
        performed: true, 
        success: EAPHealthCheckSuccess.PASS,
        timestamp: Date.now(),
      }
    };
  }

  public static getInitializedHealthCheckResult_NotPerformed = (): TAPPortalAppHealthCheckResult => {
    const initialized = APPortalAppHealthCheck.getInitializedHealthCheckResult();
    return {
      ...initialized,
      summary: {
        ...initialized.summary,
        performed: false,
        success: EAPHealthCheckSuccess.UNDEFINED
      }
    };
  }

  private static apiGetAbout = async(currentAppState: EAppState): Promise<TAPPortalAppHealthCheckLogEntry_About> => {
    const funcName = 'apiGetAbout';
    const logName= `${APPortalAppHealthCheck.componentName}.${funcName}()`;

    const getAction = (currentAppState: EAppState): E_APORTAL_APP_CALL_STATE_ACTIONS => {
      switch(currentAppState) {
        case EAppState.ADMIN_PORTAL:
        case EAppState.UNDEFINED:
          return E_APORTAL_APP_CALL_STATE_ACTIONS.API_GET_ADMIN_PORTAL_APP_ABOUT;
        case EAppState.DEVELOPER_PORTAL:
        case EAppState.PUBLIC_DEVELOPER_PORTAL:
          return E_APORTAL_APP_CALL_STATE_ACTIONS.API_GET_DEVELOPER_PORTAL_APP_ABOUT;
        default:
          Globals.assertNever(logName, currentAppState);
      }
      return E_APORTAL_APP_CALL_STATE_ACTIONS.API_GET_ADMIN_PORTAL_APP_ABOUT;
    }

    let apiAbout: TAPPortalAppAbout | undefined = undefined;
    let callState: TApiCallState = ApiCallState.getInitialCallState(EAPPortalAppHealthCheckLogEntryType.GET_PORTAL_APP_ABOUT, `get portal app about`);
    try {
      const result = await APortalAppApiCalls.apiGetPortalAppAbout(getAction(currentAppState));
      apiAbout = result.apPortalAppAbout;
      callState = result.callState;
    } catch(e: any) {
      APSClientOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    const logEntry: TAPPortalAppHealthCheckLogEntry_About = {
      entryType: EAPPortalAppHealthCheckLogEntryType.GET_PORTAL_APP_ABOUT,
      success: (callState.success ? EAPHealthCheckSuccess.PASS : EAPHealthCheckSuccess.FAIL),
      callState: callState,
      apPortalAppAbout: apiAbout
    }
    return logEntry;
  }

  private static checkConfiguration = (configContext: TAPConfigContext, apPortalAbout: TAPPortalAppAbout | undefined): TAPPortalAppHealthCheckLogEntry_CheckConfiguration => {
    let issueList: TAPConfigIssueList | undefined = undefined;
    let callState: TApiCallState = ApiCallState.getInitialCallState(EAPPortalAppHealthCheckLogEntryType.GET_PORTAL_APP_HEALTH_CHECK_CONFIGURATION, `check portal app configuration`);
    // check first if configContext is fully initialized
    if(!configContext.portalAppInfo || !configContext.portalAppInfo.adminPortalAppAbout) {
      callState.success = true;
    }
    else if(!apPortalAbout) {
      callState.success = false;
      callState.error = { reason: 'apPortalAbout is undefined'}
    } 
    else {
      issueList = Globals.crossCheckConfiguration_PortalAppLoaded_X_PortalAppOnServer(configContext.portalAppInfo.adminPortalAppAbout, apPortalAbout);
    }
    let _success: EAPHealthCheckSuccess = EAPHealthCheckSuccess.UNDEFINED;
    if(callState.success) {
      if(issueList && issueList.length > 0) _success = EAPHealthCheckSuccess.FAIL;
      else _success = EAPHealthCheckSuccess.PASS;
    } else _success = EAPHealthCheckSuccess.FAIL;
    const logEntry: TAPPortalAppHealthCheckLogEntry_CheckConfiguration = {
      entryType: EAPPortalAppHealthCheckLogEntryType.GET_PORTAL_APP_HEALTH_CHECK_CONFIGURATION,
      success: _success,
      callState: callState,
      issueList: issueList
    }
    return logEntry;
  }

  public static doHealthCheck = async (configContext: TAPConfigContext, userContext: TUserContext): Promise<TAPPortalAppHealthCheckResult> => {
    const funcName = 'doHealthCheck';
    const logName= `${APPortalAppHealthCheck.componentName}.${funcName}()`;
    let healthCheckResult: TAPPortalAppHealthCheckResult = APPortalAppHealthCheck.getInitializedHealthCheckResult();
    try {
      // call api: GET about
      const apiGetAboutLogEntry: TAPPortalAppHealthCheckLogEntry_About = await APPortalAppHealthCheck.apiGetAbout(userContext.currentAppState);
      healthCheckResult.healthCheckLog.push(apiGetAboutLogEntry);
      if(apiGetAboutLogEntry.success !== EAPHealthCheckSuccess.PASS) {
        healthCheckResult.summary.success = apiGetAboutLogEntry.success;
        // abort check
        throw new APError(logName, 'about check failed');
      }

      // configuration check
      const checkConfigurationLogEntry: TAPPortalAppHealthCheckLogEntry_CheckConfiguration = APPortalAppHealthCheck.checkConfiguration(configContext, apiGetAboutLogEntry.apPortalAppAbout);
      healthCheckResult.healthCheckLog.push(checkConfigurationLogEntry);
      
    } catch (e) {
      APLogger.error(APLogger.createLogEntry(logName, e));
      throw e;
    } finally {
      // set overall summary
      let _summarySuccess: EAPHealthCheckSuccess = EAPHealthCheckSuccess.PASS;
      healthCheckResult.healthCheckLog.forEach( (logEntry: TAPPortalAppHealthCheckLogEntry) => {
        if(logEntry.success === EAPHealthCheckSuccess.FAIL) _summarySuccess = EAPHealthCheckSuccess.FAIL;
        else if(_summarySuccess !== EAPHealthCheckSuccess.FAIL && logEntry.success === EAPHealthCheckSuccess.PASS_WITH_ISSUES ) _summarySuccess = EAPHealthCheckSuccess.PASS_WITH_ISSUES;
      });
      healthCheckResult.summary.success = _summarySuccess;
      return healthCheckResult;
    }
  }  
}

// ******************************************************
// * APServer
// ******************************************************
export enum EAPServerHealthCheckLogEntryType {
  GET_SERVER_API_BASE = 'GET_SERVER_API_BASE',
  GET_SERVER_ABOUT = 'GET_SERVER_ABOUT',
  GET_SERVER_HEALTH_CHECK_ENDPOINT = 'GET_SERVER_HEALTH_CHECK_ENDPOINT',
  GET_SERVER_HEALTH_CHECK_CONFIGURATION = 'GET_SERVER_HEALTH_CHECK_CONFIGURATION',
}
export type TAPServerHealthCheckLogEntry_Base = {
  entryType: EAPServerHealthCheckLogEntryType;
  success: EAPHealthCheckSuccess;
  callState: TApiCallState;
}
export type TAPServerHealthCheckLogEntry_ApiBase = TAPServerHealthCheckLogEntry_Base & {
  openApiInfo: APSClientOpenApiInfo;
  apiBaseResult?: any;
}
export type TAPServerHealthCheckLogEntry_About = TAPServerHealthCheckLogEntry_Base & {
  apsAbout?: APSAbout;
}
export type TAPServerHealthCheckLogEntry_HealthCheckEndpoint = TAPServerHealthCheckLogEntry_Base & {
  apsStatus?: APSStatus;
}
export type TAPServerHealthCheckLogEntry_CheckConfiguration = TAPServerHealthCheckLogEntry_Base & {
  issueList?: TAPConfigIssueList;
}
export type TAPServerHealthCheckLogEntry = 
  TAPServerHealthCheckLogEntry_ApiBase
  | TAPServerHealthCheckLogEntry_About
  | TAPServerHealthCheckLogEntry_HealthCheckEndpoint
  | TAPServerHealthCheckLogEntry_CheckConfiguration;
export type TAPServerHealthCheckLogEntryList = Array<TAPServerHealthCheckLogEntry>;
export type TAPServerHealthCheckResult = {
  summary: TAPHealthCheckSummary;
  healthCheckLog: TAPServerHealthCheckLogEntryList;
}

export class APServerHealthCheck {
  private static componentName = 'APServerHealthCheck';

  public static getInitializedHealthCheckResult = (): TAPServerHealthCheckResult => {
    return {
      healthCheckLog: [],
      summary: { 
        performed: true, 
        success: EAPHealthCheckSuccess.PASS,
        timestamp: Date.now(),
      }
    };
  }

  public static getInitializedHealthCheckResult_NotPerformed = (): TAPServerHealthCheckResult => {
    const initialized = APServerHealthCheck.getInitializedHealthCheckResult();
    return {
      ...initialized,
      summary: {
        ...initialized.summary,
        performed: false,
        success: EAPHealthCheckSuccess.UNDEFINED
      }
    };
  }

  public static apiCheckBaseAccess = async(): Promise<TAPServerHealthCheckLogEntry_ApiBase> => {
    const funcName = 'apiCheckBaseAccess';
    const logName= `${APServerHealthCheck.componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(EAPServerHealthCheckLogEntryType.GET_SERVER_API_BASE, `get server api base`);
    let apiBaseResult: any = undefined;
    try {
      apiBaseResult = await APClientServerRaw.httpGET_BasePath();
      throw new APError(logName, `GET ${APClientServerRaw.getBasePath()} must not return content but not found`);
      // // must not return content but always unauthorized
      // throw new APError(logName, `GET ${APClientServerRaw.getBasePath()} must not return content but always unauthorized`);
    } catch(e: any) {
      if(e instanceof APClientRawError) {
        const apiRawError: APClientRawError = e;
        if(apiRawError.apError.status === 404) {
          // good, url is reachable
          callState.success = true;
        } else {
          APSClientOpenApi.logError(logName, e);
          callState = ApiCallState.addErrorToApiCallState(e, callState);
        }
      } else if(e instanceof APError) {
        APLogger.error(APLogger.createLogEntry(logName, e));
        callState = ApiCallState.addErrorToApiCallState(e, callState);
      }
      else {
        APSClientOpenApi.logError(logName, e);
        callState = ApiCallState.addErrorToApiCallState(e, callState);
      }
    }
    const logEntry: TAPServerHealthCheckLogEntry_ApiBase = {
      entryType: EAPServerHealthCheckLogEntryType.GET_SERVER_API_BASE,
      success: (callState.success ? EAPHealthCheckSuccess.PASS : EAPHealthCheckSuccess.FAIL),
      callState: callState,
      openApiInfo: APSClientOpenApi.getOpenApiInfo(),
      apiBaseResult: apiBaseResult
    }
    return logEntry;
  }

  private static apiGetAbout = async(): Promise<TAPServerHealthCheckLogEntry_About> => {
    const funcName = 'apiGetAbout';
    const logName= `${APServerHealthCheck.componentName}.${funcName}()`;
    let apiAbout: APSAbout | undefined = undefined;
    let callState: TApiCallState = ApiCallState.getInitialCallState(EAPServerHealthCheckLogEntryType.GET_SERVER_ABOUT, `get server about`);
    try {
      apiAbout = await ApsConfigService.getApsAbout();
    } catch(e: any) {
      APSClientOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    const logEntry: TAPServerHealthCheckLogEntry_About = {
      entryType: EAPServerHealthCheckLogEntryType.GET_SERVER_ABOUT,
      success: (callState.success ? EAPHealthCheckSuccess.PASS : EAPHealthCheckSuccess.FAIL),
      callState: callState,
      apsAbout: apiAbout
    }
    return logEntry;
  }

  private static apiGetHealthCheckEndpoint = async(): Promise<TAPServerHealthCheckLogEntry_HealthCheckEndpoint> => {
    const funcName = 'apiGetHealthCheckEndpoint';
    const logName= `${APServerHealthCheck.componentName}.${funcName}()`;
    let apiHealthCheckStatus: APSStatus | undefined = undefined;
    let callState: TApiCallState = ApiCallState.getInitialCallState(EAPServerHealthCheckLogEntryType.GET_SERVER_HEALTH_CHECK_ENDPOINT, `get server healthcheck endpoint`);
    try {
      apiHealthCheckStatus = await ApsMonitorService.getApsStatus();
      callState.success = apiHealthCheckStatus.isReady;
    } catch(e: any) {
      APSClientOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    const logEntry: TAPServerHealthCheckLogEntry_HealthCheckEndpoint = {
      entryType: EAPServerHealthCheckLogEntryType.GET_SERVER_HEALTH_CHECK_ENDPOINT,
      success: (callState.success ? EAPHealthCheckSuccess.PASS : EAPHealthCheckSuccess.FAIL),
      callState: callState,
      apsStatus: apiHealthCheckStatus
    }
    return logEntry;
  }

  private static checkConfiguration = (configContext: TAPConfigContext, apsAbout: APSAbout | undefined): TAPServerHealthCheckLogEntry_CheckConfiguration => {
    let configIssueList: TAPConfigIssueList | undefined = undefined;
    let callState: TApiCallState = ApiCallState.getInitialCallState(EAPServerHealthCheckLogEntryType.GET_SERVER_HEALTH_CHECK_CONFIGURATION, `check server configuration`);
    if(!apsAbout) {
      callState.success = false;
      callState.error = { reason: 'apsAbout is undefined'}
    } else if(!configContext.portalAppInfo) {
      callState.success = false;
      callState.error = { reason: 'portalAppInfo is undefined'}
    } else {
      const {success, issueList } = Globals.crossCheckConfiguration_PortalApp_X_Server(configContext.portalAppInfo, apsAbout);
      configIssueList = issueList;
      callState.success = success;
    }
    let _success: EAPHealthCheckSuccess = EAPHealthCheckSuccess.UNDEFINED;
    if(callState.success) {
      if(configIssueList && configIssueList.length > 0) _success = EAPHealthCheckSuccess.PASS_WITH_ISSUES;
      else _success = EAPHealthCheckSuccess.PASS;
    } else _success = EAPHealthCheckSuccess.FAIL;
    const logEntry: TAPServerHealthCheckLogEntry_CheckConfiguration = {
      entryType: EAPServerHealthCheckLogEntryType.GET_SERVER_HEALTH_CHECK_CONFIGURATION,
      success: _success,
      callState: callState,
      issueList: configIssueList
    }
    return logEntry;
  }

  public static doHealthCheck = async (configContext: TAPConfigContext): Promise<TAPServerHealthCheckResult> => {
    const funcName = 'doHealthCheck';
    const logName= `${APServerHealthCheck.componentName}.${funcName}()`;
    let healthCheckResult: TAPServerHealthCheckResult = APServerHealthCheck.getInitializedHealthCheckResult();
    try {
      // call api: GET /v1
      const apiCheckBaseLogEntry: TAPServerHealthCheckLogEntry_ApiBase = await APServerHealthCheck.apiCheckBaseAccess();
      healthCheckResult.healthCheckLog.push(apiCheckBaseLogEntry);
      if(apiCheckBaseLogEntry.success !== EAPHealthCheckSuccess.PASS) {
        healthCheckResult.summary.success = apiCheckBaseLogEntry.success;
        APLogger.error(APLogger.createLogEntry(logName, apiCheckBaseLogEntry));
        // abort check
        throw new APError(logName, 'access url check failed');
      }
      // call api: GET /about
      const apiGetAboutLogEntry: TAPServerHealthCheckLogEntry_About = await APServerHealthCheck.apiGetAbout();
      healthCheckResult.healthCheckLog.push(apiGetAboutLogEntry);
      if(apiGetAboutLogEntry.success !== EAPHealthCheckSuccess.PASS) {
        healthCheckResult.summary.success = apiGetAboutLogEntry.success;
        APLogger.error(APLogger.createLogEntry(logName, apiGetAboutLogEntry));
        // abort check
        throw new APError(logName, 'about check failed');
      }

      // healthcheck endpoint
      const apiGetHealthCheckLogEntry = await APServerHealthCheck.apiGetHealthCheckEndpoint();
      healthCheckResult.healthCheckLog.push(apiGetHealthCheckLogEntry);
      if(apiGetHealthCheckLogEntry.success !== EAPHealthCheckSuccess.PASS) APLogger.error(APLogger.createLogEntry(logName, apiGetHealthCheckLogEntry));

      // configuration check
      const checkConfigurationLogEntry: TAPServerHealthCheckLogEntry_CheckConfiguration = APServerHealthCheck.checkConfiguration(configContext, apiGetAboutLogEntry.apsAbout);
      healthCheckResult.healthCheckLog.push(checkConfigurationLogEntry);
      if(checkConfigurationLogEntry.success !== EAPHealthCheckSuccess.PASS) APLogger.error(APLogger.createLogEntry(logName, checkConfigurationLogEntry));

    } catch (e) {
      APLogger.error(APLogger.createLogEntry(logName, e));
      throw e;
    } finally {
      // set overall summary
      let _summarySuccess: EAPHealthCheckSuccess = EAPHealthCheckSuccess.PASS;
      healthCheckResult.healthCheckLog.forEach( (logEntry: TAPServerHealthCheckLogEntry) => {
        if(logEntry.success === EAPHealthCheckSuccess.FAIL) _summarySuccess = EAPHealthCheckSuccess.FAIL;
        else if(_summarySuccess !== EAPHealthCheckSuccess.FAIL && logEntry.success === EAPHealthCheckSuccess.PASS_WITH_ISSUES ) _summarySuccess = EAPHealthCheckSuccess.PASS_WITH_ISSUES;
      });
      healthCheckResult.summary.success = _summarySuccess;
      return healthCheckResult;
    }
  }  
}

export class APConnectorHealthCheck {
  private static componentName = 'APConnectorHealthCheck';

  public static getInitializedHealthCheckResult_NotPerformed = (): TAPConnectorHealthCheckResult => {
    const initialized = APConnectorHealthCheck.getInitializedHealthCheckResult();
    return {
      ...initialized,
      summary: {
        ...initialized.summary,
        performed: false,
        success: EAPHealthCheckSuccess.UNDEFINED
      }
    };
  }

  public static getInitializedHealthCheckResult = (): TAPConnectorHealthCheckResult => {
    return {
      healthCheckLog: [],
      summary: { 
        performed: true, 
        success: EAPHealthCheckSuccess.PASS,
        timestamp: Date.now()
      }
    };
  }

  private static readAbout = (apsConnectorStatus: APSConnectorStatus): TAPConnectorHealthCheckLogEntry_About => {
    const funcName = 'apiGetAbout';
    const logName= `${APConnectorHealthCheck.componentName}.${funcName}()`;
    let apiAbout: About | undefined = undefined;
    let callState: TApiCallState = ApiCallState.getInitialCallState(EAPConnectorHealthCheckLogEntryType.GET_CONNECTOR_ABOUT, `get connector about`);
    if(apsConnectorStatus.connectorAbout === undefined) {
      const e = new Error(`apsConnectorStatus.connectorAbout === undefined`);
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    } else {
      apiAbout = apsConnectorStatus.connectorAbout;
    }
    const logEntry: TAPConnectorHealthCheckLogEntry_About = {
      entryType: EAPConnectorHealthCheckLogEntryType.GET_CONNECTOR_ABOUT,
      success: (callState.success ? EAPHealthCheckSuccess.PASS : EAPHealthCheckSuccess.FAIL),
      callState: callState,
      about: apiAbout
    };
    return logEntry;
  }

  private static readHealthCheckStatus = (apsConnectorStatus: APSConnectorStatus): TAPConnectorHealthCheckLogEntry_HealthCheckEndpoint => {
    const funcName = 'readHealthCheckStatus';
    const logName= `${APConnectorHealthCheck.componentName}.${funcName}()`;
    let connectorStatus: string | undefined = undefined;
    let callState: TApiCallState = ApiCallState.getInitialCallState(EAPConnectorHealthCheckLogEntryType.GET_CONNECTOR_HEALTH_CHECK_ENDPOINT, `get connector healthcheck endpoint`);
    if(apsConnectorStatus.connectorHealthCheckStatus === undefined) {
      const e = new Error(`apsConnectorStatus.connectorHealthCheckStatus === undefined`);
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    } else {
      connectorStatus = apsConnectorStatus.connectorHealthCheckStatus;
      if(connectorStatus !== 'ok') callState.success = false;
    }
    const logEntry: TAPConnectorHealthCheckLogEntry_HealthCheckEndpoint = {
      entryType: EAPConnectorHealthCheckLogEntryType.GET_CONNECTOR_HEALTH_CHECK_ENDPOINT,
      success: (callState.success ? EAPHealthCheckSuccess.PASS : EAPHealthCheckSuccess.FAIL),
      callState: callState,
      status: connectorStatus
    };
    return logEntry;
  }

  private static checkConfiguration = (configContext: TAPConfigContext, connectorAbout: TAPConnectorAbout | undefined): TAPConnectorHealthCheckLogEntry_CheckConfiguration => {
    let configIssueList: TAPConfigIssueList | undefined = undefined;
    let callState: TApiCallState = ApiCallState.getInitialCallState(EAPConnectorHealthCheckLogEntryType.GET_CONNECTOR_HEALTH_CHECK_CONFIGURATION, `check connector configuration`);
    if(!connectorAbout) {
      callState.success = false;
      callState.error = { reason: 'connectorAbout is undefined'}
    } else {
      const tmpConfigContext: TAPConfigContext = {
        ...configContext,
        connectorInfo: {
          connectorAbout: connectorAbout
        }
      };
      const {success, issueList } = Globals.crossCheckConfiguration_PortalApp_X_Connector(tmpConfigContext);
      configIssueList = issueList;
      callState.success = success;
    }
    let _success: EAPHealthCheckSuccess = EAPHealthCheckSuccess.UNDEFINED;
    if(callState.success) {
      if(configIssueList && configIssueList.length > 0) _success = EAPHealthCheckSuccess.PASS_WITH_ISSUES;
      else _success = EAPHealthCheckSuccess.PASS;
    } else _success = EAPHealthCheckSuccess.FAIL;
    const logEntry: TAPConnectorHealthCheckLogEntry_CheckConfiguration = {
      entryType: EAPConnectorHealthCheckLogEntryType.GET_CONNECTOR_HEALTH_CHECK_CONFIGURATION,
      success: _success,
      callState: callState,
      issueList: configIssueList
    }
    return logEntry;
  }

  public static doHealthCheck = async ({ configContext, connectorId }:{
    configContext: TAPConfigContext;
    connectorId: string | undefined;
  }): Promise<TAPConnectorHealthCheckResult> => {
    const funcName = 'doHealthCheck';
    const logName= `${APConnectorHealthCheck.componentName}.${funcName}()`;
    let healthCheckResult: TAPConnectorHealthCheckResult = APConnectorHealthCheck.getInitializedHealthCheckResult();
    try {
      // call apim server connectorStatus
      let callState: TApiCallState = ApiCallState.getInitialCallState(EAPConnectorHealthCheckLogEntryType.GET_CONNECTOR_STATUS, `get connector status`);
      let apsConnectorStatus: APSConnectorStatus | undefined = undefined;
      try {
        apsConnectorStatus = await ApsMonitorService.getApsConnectorStatus({ optionalConnectorId: connectorId });
      } catch(e: any) {
        APClientConnectorOpenApi.logError(logName, e);
        callState = ApiCallState.addErrorToApiCallState(e, callState);
      }
      if(apsConnectorStatus !== undefined) {
        // read about
        const apiGetAboutLogEntry: TAPConnectorHealthCheckLogEntry_About = APConnectorHealthCheck.readAbout(apsConnectorStatus);
        healthCheckResult.healthCheckLog.push(apiGetAboutLogEntry);
        if(apiGetAboutLogEntry.success !== EAPHealthCheckSuccess.PASS) {
          healthCheckResult.summary.success = apiGetAboutLogEntry.success;
          // abort check
          throw new APError(logName, 'about check failed');
        }
        // healthcheck endpoint
        const apiGetHealthCheckLogEntry = APConnectorHealthCheck.readHealthCheckStatus(apsConnectorStatus);
        healthCheckResult.healthCheckLog.push(apiGetHealthCheckLogEntry);
        if(apiGetHealthCheckLogEntry.success !== EAPHealthCheckSuccess.PASS) {
          healthCheckResult.summary.success = apiGetHealthCheckLogEntry.success;
          // abort check
          throw new APError(logName, 'health endpoint check failed');
        }
        // configuration check
        if(!apiGetAboutLogEntry.about) throw new APError(logName, 'apiGetAboutLogEntry.about is undefined');
        const checkConfigurationLogEntry: TAPConnectorHealthCheckLogEntry_CheckConfiguration = APConnectorHealthCheck.checkConfiguration(configContext, APConnectorApiHelper.transformApiAboutToAPConnectorAbout(apiGetAboutLogEntry.about).apConnectorAbout);
        healthCheckResult.healthCheckLog.push(checkConfigurationLogEntry);
      } else {
        const logEntry: TAPConnectorHealthCheckLogEntry_ApiCallError = {
          entryType: EAPConnectorHealthCheckLogEntryType.GET_CONNECTOR_STATUS,
          success: (callState.success ? EAPHealthCheckSuccess.PASS : EAPHealthCheckSuccess.FAIL),
          callState: callState,
        };
        healthCheckResult.healthCheckLog.push(logEntry);    
      }

    } catch (e) {
      APLogger.error(APLogger.createLogEntry(logName, e));
      throw e;
    } finally {
      // set overall summary
      let _summarySuccess: EAPHealthCheckSuccess = EAPHealthCheckSuccess.PASS;
      healthCheckResult.healthCheckLog.forEach( (logEntry: TAPConnectorHealthCheckLogEntry) => {
        if(logEntry.success === EAPHealthCheckSuccess.FAIL) _summarySuccess = EAPHealthCheckSuccess.FAIL;
        else if(_summarySuccess !== EAPHealthCheckSuccess.FAIL && logEntry.success === EAPHealthCheckSuccess.PASS_WITH_ISSUES ) _summarySuccess = EAPHealthCheckSuccess.PASS_WITH_ISSUES;
      });
      healthCheckResult.summary.success = _summarySuccess;
      return healthCheckResult;
    }
  }  
}
