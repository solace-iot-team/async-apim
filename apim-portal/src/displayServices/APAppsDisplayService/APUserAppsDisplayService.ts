
// export type TAPManagedAssetDisplay_Attributes = IAPEntityIdDisplay & {
//   apExternal_ApAttributeDisplayList: TAPAttributeDisplayList;
//   apCustom_ApAttributeDisplayList: TAPAttributeDisplayList;
// }
// export enum E_ManagedAssetDisplay_BusinessGroupSharing_AccessType {
//   READONLY = "readonly",
//   FULL_ACCESS = "full-access",
// }

import { ApiError, AppConnectionStatus, AppResponse, DevelopersService } from "@solace-iot-team/apim-connector-openapi-browser";
import { APClientConnectorOpenApi } from "../../utils/APClientConnectorOpenApi";
import { APAppsDisplayService, IAPAppDisplay } from "./APAppsDisplayService";

// export type TAPManagedAssetBusinessGroupInfo = {
//   apOwningBusinessGroupEntityId: TAPEntityId;
//   apBusinessGroupSharingList: TAPManagedAssetDisplay_BusinessGroupSharingList;
// }
// export type TAPManagedAssetOwnerInfo = TAPEntityId;

// export type TAPManagedAssetLifecycleInfo = {
//   apLifecycleState: EAPLifecycleState;
// }

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
    connectorAppConnectionStatus 
  }: {
    userId: string;
    connectorAppResponse_smf: AppResponse;
    connectorAppResponse_mqtt?: AppResponse;
    connectorAppConnectionStatus: AppConnectionStatus;
  }): IAPUserAppDisplay {
    return {
      ...this.create_ApAppDisplay_From_ApiEntities({
        connectorAppResponse_smf: connectorAppResponse_smf,
        connectorAppResponse_mqtt: connectorAppResponse_mqtt,
        connectorAppConnectionStatus: connectorAppConnectionStatus
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