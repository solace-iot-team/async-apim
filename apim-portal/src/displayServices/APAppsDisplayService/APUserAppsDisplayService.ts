
import { ApiError, AppConnectionStatus, AppResponse, DevelopersService } from "@solace-iot-team/apim-connector-openapi-browser";
import { TAPDeveloperPortalAppApiProductDisplayList } from "../../developer-portal/displayServices/APDeveloperPortalAppApiProductsDisplayService";
import { APClientConnectorOpenApi } from "../../utils/APClientConnectorOpenApi";
import { APAppsDisplayService, IAPAppDisplay } from "./APAppsDisplayService";

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


}