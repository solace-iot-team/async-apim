
import { 
  AdministrationService, 
  EnvironmentsService, 
  ApiError as APConnectorApiError, 
  Organization 
} from '@solace-iot-team/platform-api-openapi-client-fe';
import { APSConnectorClientConfig } from '@solace-iot-team/apim-server-openapi-browser';
import { APClientConnectorRaw } from './APClientConnectorRaw';
import { APClientConnectorOpenApi } from './APClientConnectorOpenApi';

export type THealthCheckLogEntry = {
  action: string,
  success: boolean
}
export type THealthCheckLog = Array<THealthCheckLogEntry>;
export type THealthCheckSummary = {
  performed: boolean,
  success: boolean
}
export type THealthCheckResult = {
  healthCheckLog: THealthCheckLog,
  summary: THealthCheckSummary
}

export class APConnectorHealthCheck {
  private static healthCheckResult: THealthCheckResult;

  private static checkUrlAccess = async(): Promise<boolean> => {
    const funcName = 'checkUrlAccess';
    const logName= `${APConnectorHealthCheck.name}.${funcName}()`;
    let success: boolean = true;
    try {
      const response: any = await APClientConnectorRaw.getBasePath();
    } catch(e) {
      success = false;
    } finally {
      // console.log(`${logName}: success=${success}`);
      return success;
    }
  }

  private static checkAbout = async(): Promise<boolean> => {
    let success: boolean = true;
    try {
      const response: any = await APClientConnectorRaw.getAbout();
    } catch(e) {
      success = false;
    } finally {
      return success;
    }
  }

  private static checkPlatformAdminCredentials = async(): Promise<boolean> => {
    const funcName = 'checkPlatformAdminCredentials';
    const logName= `${APConnectorHealthCheck.name}.${funcName}()`;
    try {
      await AdministrationService.listOrganizations();
      return true;
    } catch(e) {
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
        const testOrgResponse: Organization = await AdministrationService.getOrganization(testOrg.name);
      } catch (e) {
        doCreateOrg = true;
      } 
      if (doCreateOrg) await AdministrationService.createOrganization(testOrg);
    } catch(e) {
      APClientConnectorOpenApi.logError(logName, e);
      throw e;
    }  
    try {
      await EnvironmentsService.listEnvironments(testOrg.name);  
    } catch(e) {
      APClientConnectorOpenApi.logError(logName, e);
      apiError = e;
    }
    try {
      await AdministrationService.deleteOrganization(testOrg.name);
    } catch(e) {
      APClientConnectorOpenApi.logError(logName, e);
      throw e;
    }  
    if(apiError) {
      if(apiError?.status === 401) return false;
      else throw apiError;
    } else return true;
  } 

  public static doHealthCheck = async (connectorClientConfig: APSConnectorClientConfig): Promise<THealthCheckResult> => {
    const funcName = 'doHealthCheck';
    const logName= `${APConnectorHealthCheck.name}.${funcName}()`;
    APConnectorHealthCheck.healthCheckResult = {
      healthCheckLog: [],
      summary: { performed: true, success: true }
    };
    APClientConnectorOpenApi.tmpInitialize(connectorClientConfig);
    APClientConnectorRaw.initialize(connectorClientConfig);
    let success: boolean = false;
    try {
      success = await APConnectorHealthCheck.checkUrlAccess();
      APConnectorHealthCheck.healthCheckResult.healthCheckLog.push({ action: 'check connector url', success: success });
      if(!success) {
        APConnectorHealthCheck.healthCheckResult.summary.success = false;
        throw new Error('access url check failed');
      }
      success = await APConnectorHealthCheck.checkAbout();
      APConnectorHealthCheck.healthCheckResult.healthCheckLog.push({ action: 'check connector about', success: success });
      if(!success) APConnectorHealthCheck.healthCheckResult.summary.success = false;
      success = await APConnectorHealthCheck.checkPlatformAdminCredentials();
      APConnectorHealthCheck.healthCheckResult.healthCheckLog.push({ action: 'check service user credentials & role=platform-admin', success: success });
      if(!success) APConnectorHealthCheck.healthCheckResult.summary.success = false;
      success = await APConnectorHealthCheck.checkOrgAdminCredentials();
      APConnectorHealthCheck.healthCheckResult.healthCheckLog.push({ action: 'check service user credentials & role=org-admin', success: success });
      if(!success) APConnectorHealthCheck.healthCheckResult.summary.success = false;  
    } catch (e) {
      APClientConnectorOpenApi.logError(logName, e);
      throw e;
    } finally {
      APClientConnectorOpenApi.tmpUninitialize();
      return APConnectorHealthCheck.healthCheckResult;
    }
  }  


}
