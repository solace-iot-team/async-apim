
import { 
  AdministrationService, 
  EnvironmentsService, 
  ApiError as APConnectorApiError, 
  Organization,
  About
} from '@solace-iot-team/apim-connector-openapi-browser';
import { 
  APSAbout, 
  ApsConfigService, 
  APSConnectorClientConfig, 
  ApsMonitorService, 
  APSStatus 
} from "../_generated/@solace-iot-team/apim-server-openapi-browser";
import { APClientConnectorRaw, APClientRawError, APClientServerRaw } from './APClientRaw';
import { APClientConnectorOpenApi, APConnectorClientOpenApiInfo } from './APClientConnectorOpenApi';
import { Globals, TAPConfigIssueList } from './Globals';
import { TAPConfigContext } from '../components/ConfigContextProvider/ConfigContextProvider';
import { APConnectorApiHelper, TAPConnectorAbout } from './APConnectorApiCalls';
import { APLogger } from './APLogger';
import { ApiCallState, TApiCallState } from './ApiCallState';
import { APError } from './APError';
import { APSClientOpenApi, APSClientOpenApiInfo } from './APSClientOpenApi';


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
  GET_CONNECTOR_API_BASE = 'GET_CONNECTOR_API_BASE',
  GET_CONNECTOR_ABOUT = 'GET_CONNECTOR_ABOUT',
  GET_CONNECTOR_HEALTH_CHECK_ENDPOINT = 'GET_CONNECTOR_HEALTH_CHECK_ENDPOINT',
  GET_CONNECTOR_HEALTH_CHECK_CONFIGURATION = 'GET_CONNECTOR_HEALTH_CHECK_CONFIGURATION',
  GET_CONNECTOR_HEALTH_CHECK_PLATFORM_ADMIN_CREDS = 'GET_CONNECTOR_HEALTH_CHECK_PLATFORM_ADMIN_CREDS', 
  GET_CONNECTOR_HEALTH_CHECK_ORG_ADMIN_CREDS = 'GET_CONNECTOR_HEALTH_CHECK_ORG_ADMIN_CREDS'
}
export type TAPConnectorHealthCheckLogEntry_Base = {
  entryType: EAPConnectorHealthCheckLogEntryType;
  success: EAPHealthCheckSuccess;
  callState: TApiCallState;
}
export type TAPConnectorHealthCheckLogEntry_ApiBase = TAPConnectorHealthCheckLogEntry_Base & {
  openApiInfo: APConnectorClientOpenApiInfo;
  apiBaseResult?: any;
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
export type TAPConnectorHealthCheckLogEntry_CheckPlatformAdminCreds = TAPConnectorHealthCheckLogEntry_Base & {
}
export type TAPConnectorHealthCheckLogEntry_CheckOrgAdminCreds = TAPConnectorHealthCheckLogEntry_Base & {
}
export type TAPConnectorHealthCheckLogEntry = 
  TAPConnectorHealthCheckLogEntry_About
  | TAPConnectorHealthCheckLogEntry_ApiBase
  | TAPConnectorHealthCheckLogEntry_CheckConfiguration
  | TAPConnectorHealthCheckLogEntry_HealthCheckEndpoint
  | TAPConnectorHealthCheckLogEntry_CheckPlatformAdminCreds
  | TAPConnectorHealthCheckLogEntry_CheckOrgAdminCreds;

export type TAPConnectorHealthCheckLogEntryList = Array<TAPConnectorHealthCheckLogEntry>;
export type TAPConnectorHealthCheckResult = {
  summary: TAPHealthCheckSummary;
  healthCheckLog: TAPConnectorHealthCheckLogEntryList;
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
    let issueList: TAPConfigIssueList | undefined = undefined;
    let callState: TApiCallState = ApiCallState.getInitialCallState(EAPServerHealthCheckLogEntryType.GET_SERVER_HEALTH_CHECK_CONFIGURATION, `check server configuration`);
    if(!apsAbout) {
      callState.success = false;
      callState.error = { reason: 'apsAbout is undefined'}
    } else if(!configContext.portalInfo) {
      callState.success = false;
      callState.error = { reason: 'portalInfo is undefined'}
    } else {
      issueList = Globals.crossCheckConfiguration_Portal_X_Server(configContext.portalInfo, apsAbout);
    }
    let _success: EAPHealthCheckSuccess = EAPHealthCheckSuccess.UNDEFINED;
    if(callState.success) {
      if(issueList && issueList.length > 0) _success = EAPHealthCheckSuccess.PASS_WITH_ISSUES;
      else _success = EAPHealthCheckSuccess.PASS;
    } else _success = EAPHealthCheckSuccess.FAIL;
    const logEntry: TAPServerHealthCheckLogEntry_CheckConfiguration = {
      entryType: EAPServerHealthCheckLogEntryType.GET_SERVER_HEALTH_CHECK_CONFIGURATION,
      success: _success,
      callState: callState,
      issueList: issueList
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
        // abort check
        throw new APError(logName, 'access url check failed');
      }
      // call api: GET /about
      const apiGetAboutLogEntry: TAPServerHealthCheckLogEntry_About = await APServerHealthCheck.apiGetAbout();
      healthCheckResult.healthCheckLog.push(apiGetAboutLogEntry);
      if(apiGetAboutLogEntry.success !== EAPHealthCheckSuccess.PASS) {
        healthCheckResult.summary.success = apiGetAboutLogEntry.success;
        // abort check
        throw new APError(logName, 'about check failed');
      }

      // healthcheck endpoint
      const apiGetHealthCheckLogEntry = await APServerHealthCheck.apiGetHealthCheckEndpoint();
      healthCheckResult.healthCheckLog.push(apiGetHealthCheckLogEntry);

      // configuration check
      const checkConfigurationLogEntry: TAPServerHealthCheckLogEntry_CheckConfiguration = APServerHealthCheck.checkConfiguration(configContext, apiGetAboutLogEntry.apsAbout);
      healthCheckResult.healthCheckLog.push(checkConfigurationLogEntry);

      // set overall summary
      let _summarySuccess: EAPHealthCheckSuccess = EAPHealthCheckSuccess.PASS;
      healthCheckResult.healthCheckLog.forEach( (logEntry: TAPServerHealthCheckLogEntry) => {
        if(logEntry.success === EAPHealthCheckSuccess.FAIL) _summarySuccess = EAPHealthCheckSuccess.FAIL;
        else if(_summarySuccess !== EAPHealthCheckSuccess.FAIL && logEntry.success === EAPHealthCheckSuccess.PASS_WITH_ISSUES ) _summarySuccess = EAPHealthCheckSuccess.PASS_WITH_ISSUES;
      });
      healthCheckResult.summary.success = _summarySuccess;

    } catch (e) {
      APLogger.error(APLogger.createLogEntry(logName, e));
      throw e;
    } finally {
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

  private static apiCheckBaseAccess = async(): Promise<TAPConnectorHealthCheckLogEntry_ApiBase> => {
    const funcName = 'apiCheckBaseAccess';
    const logName= `${APConnectorHealthCheck.componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(EAPConnectorHealthCheckLogEntryType.GET_CONNECTOR_API_BASE, `get connector api base`);
    let apiBaseResult: any = undefined;
    try {
      apiBaseResult = await APClientConnectorRaw.httpGET_BasePath();
      // must not return content but always unauthorized
      throw new APError(logName, `GET ${APClientConnectorRaw.getBasePath()} must not return content but always unauthorized`);
    } catch(e: any) {
      if(e instanceof APClientRawError) {
        const apiRawError: APClientRawError = e;
        if(apiRawError.apError.status === 401) {
          // unauthorized = good, url is reachable
          callState.success = true;
        } else {
          APClientConnectorOpenApi.logError(logName, e);
          callState = ApiCallState.addErrorToApiCallState(e, callState);
        }
      } else if(e instanceof APError) {
        APLogger.error(APLogger.createLogEntry(logName, e));
        callState = ApiCallState.addErrorToApiCallState(e, callState);
      }
      else {
        APClientConnectorOpenApi.logError(logName, e);
        callState = ApiCallState.addErrorToApiCallState(e, callState);
      }
    }
    const logEntry: TAPConnectorHealthCheckLogEntry_ApiBase = {
      entryType: EAPConnectorHealthCheckLogEntryType.GET_CONNECTOR_API_BASE,
      success: (callState.success ? EAPHealthCheckSuccess.PASS : EAPHealthCheckSuccess.FAIL),
      callState: callState,
      openApiInfo: APClientConnectorOpenApi.getOpenApiInfo(),
      apiBaseResult: apiBaseResult
    }
    return logEntry;
  }

  private static apiGetAbout = async(): Promise<TAPConnectorHealthCheckLogEntry_About> => {
    const funcName = 'apiGetAbout';
    const logName= `${APConnectorHealthCheck.componentName}.${funcName}()`;
    let apiAbout: About | undefined = undefined;
    let callState: TApiCallState = ApiCallState.getInitialCallState(EAPConnectorHealthCheckLogEntryType.GET_CONNECTOR_ABOUT, `get connector about`);
    try {
      apiAbout = await AdministrationService.about();
    } catch(e: any) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    const logEntry: TAPConnectorHealthCheckLogEntry_About = {
      entryType: EAPConnectorHealthCheckLogEntryType.GET_CONNECTOR_ABOUT,
      success: (callState.success ? EAPHealthCheckSuccess.PASS : EAPHealthCheckSuccess.FAIL),
      callState: callState,
      about: apiAbout
    }
    return logEntry;
  }

  private static apiGetHealthCheckEndpoint = async(): Promise<TAPConnectorHealthCheckLogEntry_HealthCheckEndpoint> => {
    const funcName = 'apiGetHealthCheckEndpoint';
    const logName= `${APConnectorHealthCheck.componentName}.${funcName}()`;
    let connectorStatus: string | undefined = undefined;
    let callState: TApiCallState = ApiCallState.getInitialCallState(EAPConnectorHealthCheckLogEntryType.GET_CONNECTOR_HEALTH_CHECK_ENDPOINT, `get connector healthcheck endpoint`);
    try {
      const apiHealthCheckStatus: { status: string } = await AdministrationService.healthcheck();
      connectorStatus = apiHealthCheckStatus.status;
      if(connectorStatus !== 'ok') callState.success = false;
    } catch(e: any) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    const logEntry: TAPConnectorHealthCheckLogEntry_HealthCheckEndpoint = {
      entryType: EAPConnectorHealthCheckLogEntryType.GET_CONNECTOR_HEALTH_CHECK_ENDPOINT,
      success: (callState.success ? EAPHealthCheckSuccess.PASS : EAPHealthCheckSuccess.FAIL),
      callState: callState,
      status: connectorStatus
    }
    return logEntry;
  }

  private static checkConfiguration = (configContext: TAPConfigContext, connectorAbout: TAPConnectorAbout | undefined): TAPConnectorHealthCheckLogEntry_CheckConfiguration => {
    let issueList: TAPConfigIssueList | undefined = undefined;
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
      issueList = Globals.crossCheckConfiguration_Portal_X_Connector(tmpConfigContext);
    }
    let _success: EAPHealthCheckSuccess = EAPHealthCheckSuccess.UNDEFINED;
    if(callState.success) {
      if(issueList && issueList.length > 0) _success = EAPHealthCheckSuccess.PASS_WITH_ISSUES;
      else _success = EAPHealthCheckSuccess.PASS;
    } else _success = EAPHealthCheckSuccess.FAIL;
    const logEntry: TAPConnectorHealthCheckLogEntry_CheckConfiguration = {
      entryType: EAPConnectorHealthCheckLogEntryType.GET_CONNECTOR_HEALTH_CHECK_CONFIGURATION,
      success: _success,
      callState: callState,
      issueList: issueList
    }
    return logEntry;
  }

  private static checkPlatformAdminCredentials = async(): Promise<TAPConnectorHealthCheckLogEntry_CheckPlatformAdminCreds> => {
    const funcName = 'checkPlatformAdminCredentials';
    const logName= `${APConnectorHealthCheck.componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(EAPConnectorHealthCheckLogEntryType.GET_CONNECTOR_HEALTH_CHECK_PLATFORM_ADMIN_CREDS, `check connector platform admin creds`);
    try {
      await AdministrationService.listOrganizations({});
      callState.success = true;
    } catch(e: any) {
      APClientConnectorOpenApi.logError(logName, e);
      const apiError: APConnectorApiError = e;
      if(apiError.status === 401) callState.success = false;
      else {
        APClientConnectorOpenApi.logError(logName, e);
        callState = ApiCallState.addErrorToApiCallState(e, callState);
      }
    }
    const logEntry: TAPConnectorHealthCheckLogEntry_CheckPlatformAdminCreds = {
      entryType: EAPConnectorHealthCheckLogEntryType.GET_CONNECTOR_HEALTH_CHECK_PLATFORM_ADMIN_CREDS,
      success: (callState.success ? EAPHealthCheckSuccess.PASS : EAPHealthCheckSuccess.FAIL),
      callState: callState
    }
    return logEntry;
  } 

  private static checkOrgAdminCredentials = async(): Promise<TAPConnectorHealthCheckLogEntry_CheckOrgAdminCreds> => {
    const funcName = 'checkOrgAdminCredentials';
    const logName= `${APConnectorHealthCheck.componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(EAPConnectorHealthCheckLogEntryType.GET_CONNECTOR_HEALTH_CHECK_ORG_ADMIN_CREDS, `check connector organization admin creds`);
    const testOrg: Organization = {
      name: '__HEALTH_CHECK_ORG__'
    }
    let apiError: APConnectorApiError | undefined = undefined;
    try {
      let doCreateOrg: boolean = false;
      try {
        await AdministrationService.getOrganization({
          organizationName: testOrg.name
        });
      } catch (e) {
        doCreateOrg = true;
      } 
      if (doCreateOrg) await AdministrationService.createOrganization({
        requestBody: testOrg
      });
    } catch(e) {
      APClientConnectorOpenApi.logError(logName, e);
      throw e;
    }  
    try {
      await EnvironmentsService.listEnvironments({
        organizationName: testOrg.name
      });  
    } catch(e: any) {
      APClientConnectorOpenApi.logError(logName, e);
      apiError = e;
    }
    try {
      await AdministrationService.deleteOrganization({
        organizationName: testOrg.name
      });
    } catch(e) {
      APClientConnectorOpenApi.logError(logName, e);
      throw e;
    }  
    if(apiError) {
      if(apiError.status === 401) callState.success = false;
      else {
        APClientConnectorOpenApi.logError(logName, apiError);
        callState = ApiCallState.addErrorToApiCallState(apiError, callState);
      }
    } else {
      callState.success = true;
    };
    const logEntry: TAPConnectorHealthCheckLogEntry_CheckOrgAdminCreds = {
      entryType: EAPConnectorHealthCheckLogEntryType.GET_CONNECTOR_HEALTH_CHECK_ORG_ADMIN_CREDS,
      success: (callState.success ? EAPHealthCheckSuccess.PASS : EAPHealthCheckSuccess.FAIL),
      callState: callState
    }
    return logEntry;
  } 

  public static doHealthCheck = async (configContext: TAPConfigContext, connectorClientConfig: APSConnectorClientConfig): Promise<TAPConnectorHealthCheckResult> => {
    const funcName = 'doHealthCheck';
    const logName= `${APConnectorHealthCheck.componentName}.${funcName}()`;
    let healthCheckResult: TAPConnectorHealthCheckResult = APConnectorHealthCheck.getInitializedHealthCheckResult();

    await APClientConnectorOpenApi.tmpInitialize(connectorClientConfig);
    await APClientConnectorRaw.initialize(connectorClientConfig);
    try {
      // call api: GET /v1
      const apiCheckBaseLogEntry: TAPConnectorHealthCheckLogEntry_ApiBase = await APConnectorHealthCheck.apiCheckBaseAccess();
      healthCheckResult.healthCheckLog.push(apiCheckBaseLogEntry);
      if(apiCheckBaseLogEntry.success !== EAPHealthCheckSuccess.PASS) {
        healthCheckResult.summary.success = apiCheckBaseLogEntry.success;
        // abort check
        throw new APError(logName, 'access url check failed');
      }
      // call api: GET /about
      const apiGetAboutLogEntry: TAPConnectorHealthCheckLogEntry_About = await APConnectorHealthCheck.apiGetAbout();
      healthCheckResult.healthCheckLog.push(apiGetAboutLogEntry);
      if(apiGetAboutLogEntry.success !== EAPHealthCheckSuccess.PASS) {
        healthCheckResult.summary.success = apiGetAboutLogEntry.success;
        // abort check
        throw new APError(logName, 'about check failed');
      }

      // healthcheck endpoint
      const apiGetHealthCheckLogEntry = await APConnectorHealthCheck.apiGetHealthCheckEndpoint();
      healthCheckResult.healthCheckLog.push(apiGetHealthCheckLogEntry);

      // configuration check
      if(!apiGetAboutLogEntry.about) throw new APError(logName, 'apiGetAboutLogEntry.about is undefined');
      const checkConfigurationLogEntry: TAPConnectorHealthCheckLogEntry_CheckConfiguration = APConnectorHealthCheck.checkConfiguration(configContext, APConnectorApiHelper.transformApiAboutToAPConnectorAbout(apiGetAboutLogEntry.about).apConnectorAbout);
      healthCheckResult.healthCheckLog.push(checkConfigurationLogEntry);

      // check platform admin credentials
      const checkPlatformAdminLogEntry: TAPConnectorHealthCheckLogEntry_CheckPlatformAdminCreds = await APConnectorHealthCheck.checkPlatformAdminCredentials();
      healthCheckResult.healthCheckLog.push(checkPlatformAdminLogEntry);

      // check org admin credentials
      const checkOrgAdminLogEntry: TAPConnectorHealthCheckLogEntry_CheckOrgAdminCreds = await APConnectorHealthCheck.checkOrgAdminCredentials();
      healthCheckResult.healthCheckLog.push(checkOrgAdminLogEntry);

      // set overall summary
      let _summarySuccess: EAPHealthCheckSuccess = EAPHealthCheckSuccess.PASS;
      healthCheckResult.healthCheckLog.forEach( (logEntry: TAPConnectorHealthCheckLogEntry) => {
        if(logEntry.success === EAPHealthCheckSuccess.FAIL) _summarySuccess = EAPHealthCheckSuccess.FAIL;
        else if(_summarySuccess !== EAPHealthCheckSuccess.FAIL && logEntry.success === EAPHealthCheckSuccess.PASS_WITH_ISSUES ) _summarySuccess = EAPHealthCheckSuccess.PASS_WITH_ISSUES;
      });
      healthCheckResult.summary.success = _summarySuccess;

    } catch (e) {
      APLogger.error(APLogger.createLogEntry(logName, e));
      throw e;
    } finally {
      await APClientConnectorOpenApi.tmpUninitialize();
      await APClientConnectorRaw.unInitialize();
      return healthCheckResult;
    }
  }  
}
