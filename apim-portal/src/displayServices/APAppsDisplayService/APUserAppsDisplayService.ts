
import { 
  ApiError, 
  AppConnectionStatus, 
  AppPatch, 
  AppResponse, 
  AppsService, 
  DevelopersService 
} from "@solace-iot-team/apim-connector-openapi-browser";
import { TAPDeveloperPortalAppApiProductDisplayList } from "../../developer-portal/displayServices/APDeveloperPortalAppApiProductsDisplayService";
import { APClientConnectorOpenApi } from "../../utils/APClientConnectorOpenApi";
import { 
  APAppsDisplayService, 
  IAPAppDisplay, 
  TAPAppDisplay_Credentials, 
  TAPAppDisplay_General 
} from "./APAppsDisplayService";

export interface IAPUserAppDisplay extends IAPAppDisplay {
  userId: string;
}
export type TAPUserAppDisplayList = Array<IAPUserAppDisplay>;

export abstract class APUserAppsDisplayService extends APAppsDisplayService {
  private readonly MiddleComponentName = "APUserAppsDisplayService";

  protected create_Empty_ApUserAppDisplay({ userId }:{
    userId: string;
  }): IAPUserAppDisplay {
    const apUserAppDisplay: IAPUserAppDisplay = {
      ...this.create_Empty_ApAppDisplay(),
      userId: userId,
    }
    return apUserAppDisplay;
  }

  protected create_ApUserAppDisplay_From_ApiEntities({ 
    userId, 
    connectorAppResponse_smf, 
    connectorAppResponse_mqtt, 
    connectorAppConnectionStatus,
    apDeveloperPortalUserApp_ApiProductDisplayList,
  }: {
    userId: string;
    connectorAppResponse_smf: AppResponse;
    connectorAppResponse_mqtt?: AppResponse;
    connectorAppConnectionStatus: AppConnectionStatus;
    apDeveloperPortalUserApp_ApiProductDisplayList: TAPDeveloperPortalAppApiProductDisplayList;
  }): IAPUserAppDisplay {
    return {
      ...this.create_ApAppDisplay_From_ApiEntities({
        connectorAppResponse_smf: connectorAppResponse_smf,
        connectorAppResponse_mqtt: connectorAppResponse_mqtt,
        connectorAppConnectionStatus: connectorAppConnectionStatus,
        apDeveloperPortalUserApp_ApiProductDisplayList: apDeveloperPortalUserApp_ApiProductDisplayList
      }),
      userId: userId,
    }
  }

  // ********************************************************************************************************************************
  // API calls
  // ********************************************************************************************************************************

  public async apiCheck_UserIdExists({ organizationId, userId }:{
    organizationId: string;
    userId: string;
  }): Promise<boolean> {
    const funcName = 'apiCheck_UserIdExists';
    const logName = `${this.MiddleComponentName}.${funcName}()`;

    let anyError: any = undefined;
    try {
      await DevelopersService.getDeveloper({
        organizationName: organizationId, 
        developerUsername: userId
      });
      return true;
    } catch(e: any) {
      if(APClientConnectorOpenApi.isInstanceOfApiError(e)) {
        const apiError: ApiError = e;
        if(apiError.status === 404) return false;
        else anyError = e;
      } else anyError = e;
    }
    if(anyError) {
      APClientConnectorOpenApi.logError(logName, anyError);
      throw anyError;
    }    
    return false;
  }

  public async apiUpdate_ApAppDisplay_General({ organizationId, userId, apAppDisplay_General }:{
    organizationId: string;
    userId: string;
    apAppDisplay_General: TAPAppDisplay_General;
  }): Promise<void> {

    const update: AppPatch = {
      displayName: apAppDisplay_General.apEntityId.displayName
    }
    await AppsService.updateDeveloperApp({
      organizationName: organizationId,
      developerUsername: userId,
      appName: apAppDisplay_General.apEntityId.id,
      requestBody: update
    });
  }

  public async apiUpdate_ApAppDisplay_Credentials({ organizationId, userId, apAppDisplay_Credentials }:{
    organizationId: string;
    userId: string;
    apAppDisplay_Credentials: TAPAppDisplay_Credentials;
  }): Promise<void> {

    const crutchExpiresAtCalculation = (expiresIn: number): number => {
      const d = new Date(Date.now() + expiresIn);
      return d.getUTCMilliseconds();
    }
    const test_Secret = (): string => {
      return `newSecretAt_${Date.now()}`;
      // const d = new Date(Date.now());
      // return d.toUTCString();
    }
    const update: AppPatch = {
      // expiresIn: apAppDisplay_Credentials.apAppCredentials.apConsumerKeyExiresIn
      credentials: {
        expiresAt: crutchExpiresAtCalculation(apAppDisplay_Credentials.apAppCredentials.apConsumerKeyExiresIn),
        secret: {
          consumerKey: apAppDisplay_Credentials.apAppCredentials.secret.consumerKey,
          consumerSecret: test_Secret()
          // consumerSecret: undefined, // ensures it is re-generated          
        }
      }
    }
    await AppsService.updateDeveloperApp({
      organizationName: organizationId,
      developerUsername: userId,
      appName: apAppDisplay_Credentials.apEntityId.id,
      requestBody: update
    });
  }

}