
import { 
  AdministrationService, 
  EnvironmentsService, 
  ApiError as APConnectorApiError, 
  Organization,
  About
} from '@solace-iot-team/apim-connector-openapi-browser';
import { APSConnectorClientConfig } from '@solace-iot-team/apim-server-openapi-browser';
import { APClientConnectorRaw } from './APClientConnectorRaw';
import { APClientConnectorOpenApi } from './APClientConnectorOpenApi';
import { Globals, TAPConfigIssueList, THealthCheckResult } from './Globals';
import { TAPConfigContext } from '../components/ConfigContextProvider/ConfigContextProvider';
import { APConnectorApiHelper, TAPConnectorAbout, TTransformApiAboutToAPConnectorAboutResult } from './APConnectorApiCalls';
import { APLogger } from './APLogger';

type TApiGetAboutResult = {
  success: boolean,
  connectorAbout?: TAPConnectorAbout
}
type TApiGetHealthCheckResult = {
  success: boolean,
  connectorStatus?: string
}

export class APConnectorHealthCheck {
  // private static healthCheckResult: THealthCheckResult;

  private static checkUrlAccess = async(): Promise<boolean> => {
    // const funcName = 'checkUrlAccess';
    // const logName= `${APConnectorHealthCheck.name}.${funcName}()`;
    let success: boolean = true;
    try {
      await APClientConnectorRaw.getBasePath();
    } catch(e) {
      success = false;
    } finally {
      // console.log(`${logName}: success=${success}`);
      return success;
    }
  }

  private static apiGetAbout = async(): Promise<TApiGetAboutResult> => {
    const funcName = 'apiGetAbout';
    const logName= `${APConnectorHealthCheck.name}.${funcName}()`;
    let success: boolean = true;
    let connectorAbout: TAPConnectorAbout | undefined = undefined;
    try {
      const apiAbout: About = await AdministrationService.about();
      const transformResult: TTransformApiAboutToAPConnectorAboutResult = APConnectorApiHelper.transformApiAboutToAPConnectorAbout(apiAbout);      
      if(transformResult.apError) {
        APLogger.error(APLogger.createLogEntry(logName, transformResult.apError));
        success = false;
      }
      connectorAbout = transformResult.apConnectorAbout;
    } catch(e: any) {
      APClientConnectorOpenApi.logError(logName, e);
      success = false;
    }
    const apiGetAboutResult: TApiGetAboutResult = {
      success: success,
      connectorAbout: connectorAbout
    }
    // console.log(`${logName}: apiGetAboutResult=${JSON.stringify(apiGetAboutResult, null, 2)}`);
    return apiGetAboutResult;
  }

  private static apiGetHealthCheck = async(): Promise<TApiGetHealthCheckResult> => {
    const funcName = 'apiGetHealthCheck';
    const logName= `${APConnectorHealthCheck.name}.${funcName}()`;
    let success: boolean = true;
    let connectorStatus: string | undefined = undefined;
    try {
      const apiHealthCheckStatus: { status: string } = await AdministrationService.healthcheck();
      connectorStatus = apiHealthCheckStatus.status;
    } catch(e: any) {
      APClientConnectorOpenApi.logError(logName, e);
      success = false;
    }
    return {
      success: success,
      connectorStatus: connectorStatus
    };
  }

  // private static checkAbout = async(): Promise<boolean> => {
  //   let success: boolean = true;
  //   try {
  //     await APClientConnectorRaw.getAbout();
  //   } catch(e) {
  //     success = false;
  //   } finally {
  //     return success;
  //   }
  // }

  private static checkConfiguration = (configContext: TAPConfigContext, connectorAbout: TAPConnectorAbout | undefined): boolean => {
    if(!connectorAbout) return false;
    const tmpConfigContext: TAPConfigContext = {
      ...configContext,
      connectorInfo: {
        connectorAbout: connectorAbout
      }
    }
    const issueList: TAPConfigIssueList = Globals.crossCheckConfiguration(tmpConfigContext);
    return (issueList.length === 0);
  }

  private static checkPlatformAdminCredentials = async(): Promise<boolean> => {
    const funcName = 'checkPlatformAdminCredentials';
    const logName= `${APConnectorHealthCheck.name}.${funcName}()`;
    try {
      await AdministrationService.listOrganizations({});
      return true;
    } catch(e: any) {
      APClientConnectorOpenApi.logError(logName, e);
      const apiError: APConnectorApiError = e;
      if(apiError.status === 401) return false;
      else throw e;
    }
  } 

  private static checkOrgAdminCredentials = async(): Promise<boolean> => {
    const funcName = 'checkOrgAdminCredentials';
    const logName= `${APConnectorHealthCheck.name}.${funcName}()`;
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
      if(apiError?.status === 401) return false;
      else throw apiError;
    } else return true;
  } 

  public static doHealthCheck = async (configContext: TAPConfigContext, connectorClientConfig: APSConnectorClientConfig): Promise<THealthCheckResult> => {
    const funcName = 'doHealthCheck';
    const logName= `${APConnectorHealthCheck.name}.${funcName}()`;
    let healthCheckResult: THealthCheckResult = {
      healthCheckLog: [],
      summary: { 
        performed: true, 
        success: true,
        timestamp: Date.now()
      }
    };
    await APClientConnectorOpenApi.tmpInitialize(connectorClientConfig);
    await APClientConnectorRaw.initialize(connectorClientConfig);
    let success: boolean = false;
    try {
      success = await APConnectorHealthCheck.checkUrlAccess();
      healthCheckResult.healthCheckLog.push({ action: 'check connector url', success: success, details: APClientConnectorOpenApi.getOpenApiInfo() });
      if(!success) {
        healthCheckResult.summary.success = false;
        throw new Error('access url check failed');
      }

      // // call URL: GET /about 
      // success = await APConnectorHealthCheck.checkAbout();
      // APConnectorHealthCheck.healthCheckResult.healthCheckLog.push({ action: 'check connector about', success: success });
      // if(!success) APConnectorHealthCheck.healthCheckResult.summary.success = false;

      // call api: GET /about
      const apiGetAboutResult = await APConnectorHealthCheck.apiGetAbout();
      success = apiGetAboutResult.success;
      healthCheckResult.healthCheckLog.push({ action: 'get connector about', success: success, details: APClientConnectorOpenApi.getOpenApiInfo() });
      if(!success) healthCheckResult.summary.success = false;

      // healthcheck
      const apiGetHealthCheckResult = await APConnectorHealthCheck.apiGetHealthCheck();
      healthCheckResult.healthCheckLog.push({ action: 'connector health check', success: success, details: APClientConnectorOpenApi.getOpenApiInfo() });
      if(!success) healthCheckResult.summary.success = false;

      // configuration check
      success = APConnectorHealthCheck.checkConfiguration(configContext, apiGetAboutResult.connectorAbout);
      healthCheckResult.healthCheckLog.push({ action: 'configuration cross check', success: success, details: APClientConnectorOpenApi.getOpenApiInfo() });
      if(!success) healthCheckResult.summary.success = false;

      success = await APConnectorHealthCheck.checkPlatformAdminCredentials();
      healthCheckResult.healthCheckLog.push({ action: 'check service user credentials & role=platform-admin', success: success, details: APClientConnectorOpenApi.getOpenApiInfo() });
      if(!success) healthCheckResult.summary.success = false;

      success = await APConnectorHealthCheck.checkOrgAdminCredentials();
      healthCheckResult.healthCheckLog.push({ action: 'check service user credentials & role=org-admin', success: success, details: APClientConnectorOpenApi.getOpenApiInfo() });
      if(!success) healthCheckResult.summary.success = false;  

    } catch (e) {
      APClientConnectorOpenApi.logError(logName, e);
      throw e;
    } finally {
      await APClientConnectorOpenApi.tmpUninitialize();
      await APClientConnectorRaw.unInitialize();
      return healthCheckResult;
    }
  }  


}
