import { 
  AppConnectionStatus, 
  AppResponse, 
  Credentials
} from '@solace-iot-team/apim-connector-openapi-browser';
import APEntityIdsService, { 
  IAPEntityIdDisplay, 
  TAPEntityId
} from '../../utils/APEntityIdsService';

// export type TAPManagedAssetDisplay_Attributes = IAPEntityIdDisplay & {
//   apExternal_ApAttributeDisplayList: TAPAttributeDisplayList;
//   apCustom_ApAttributeDisplayList: TAPAttributeDisplayList;
// }
// export enum E_ManagedAssetDisplay_BusinessGroupSharing_AccessType {
//   READONLY = "readonly",
//   FULL_ACCESS = "full-access",
// }

// export type TAPManagedAssetBusinessGroupInfo = {
//   apOwningBusinessGroupEntityId: TAPEntityId;
//   apBusinessGroupSharingList: TAPManagedAssetDisplay_BusinessGroupSharingList;
// }
// export type TAPManagedAssetOwnerInfo = TAPEntityId;

// export type TAPManagedAssetLifecycleInfo = {
//   apLifecycleState: EAPLifecycleState;
// }

export interface IAPAppDisplay extends IAPEntityIdDisplay {
  devel_connectorAppResponses: {
    smf: AppResponse,
    mqtt?: AppResponse,
    appConnectionStatus: AppConnectionStatus,
  },
  // apDeveloperPortalApiProductDisplayList: TAPDeveloperPortalApiProductDisplayList;
  // apAppClientInformationList: TAPAppClientInformationList;
  // apManagedWebhookList: TAPManagedWebhookList;  
  // isAppWebhookCapable: boolean;
}
export type TAPAppDisplayList = Array<IAPAppDisplay>;

// export type TAPManagedAssetDisplay_AccessAndState = {
//   apBusinessGroupInfo: TAPManagedAssetBusinessGroupInfo;
//   apOwnerInfo: TAPManagedAssetOwnerInfo;
// }

export abstract class APAppsDisplayService {
  private readonly BaseComponentName = "APAppsDisplayService";

  public nameOf<T extends IAPAppDisplay>(name: keyof T) {
    return name;
  }
  public nameOf_ApEntityId(name: keyof TAPEntityId) {
    return `${this.nameOf('apEntityId')}.${name}`;
  }

  private create_Empty_ConnectorAppResponse(): AppResponse {
    const create_Empty_Credentials = (): Credentials => {
      return {
        expiresAt: -1,
      };
    }
    return {
      apiProducts: [],
      credentials: create_Empty_Credentials(),
      name: '',
      displayName: '',
    }
  }
  private create_Empty_ConnectorAppConnectionStatus(): AppConnectionStatus {
    return {
    }
  }
  protected create_Empty_ApAppDisplay(): IAPAppDisplay {
    const apAppDisplay: IAPAppDisplay = {
      apEntityId: APEntityIdsService.create_EmptyObject(),
      devel_connectorAppResponses: {
        smf: this.create_Empty_ConnectorAppResponse(),
        mqtt: this.create_Empty_ConnectorAppResponse(),
        appConnectionStatus: this.create_Empty_ConnectorAppConnectionStatus()
      },
    };
    return apAppDisplay;
  }

  protected create_ApAppDisplay_From_ApiEntities({ connectorAppResponse_smf, connectorAppResponse_mqtt, connectorAppConnectionStatus }: {
    connectorAppResponse_smf: AppResponse;
    connectorAppResponse_mqtt?: AppResponse;
    connectorAppConnectionStatus: AppConnectionStatus;
  }): IAPAppDisplay {
    // const funcName = 'create_ApManagedAssetDisplay';
    // const logName = `${this.BaseComponentName}.${funcName}()`;

    return {
      apEntityId: {
        id: connectorAppResponse_smf.name,
        displayName: connectorAppResponse_smf.displayName ? connectorAppResponse_smf.displayName : connectorAppResponse_smf.name
      },
      devel_connectorAppResponses: {
        smf: connectorAppResponse_smf,
        mqtt: connectorAppResponse_mqtt,
        appConnectionStatus: connectorAppConnectionStatus
      }
    }
  }

  // ********************************************************************************************************************************
  // API calls
  // ********************************************************************************************************************************


}