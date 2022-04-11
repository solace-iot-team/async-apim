import { 
  AppConnectionStatus, 
  AppResponse, 
  CommonTimestampInteger, 
  Credentials,
  Secret
} from '@solace-iot-team/apim-connector-openapi-browser';
import { EAPApp_ApiProduct_Status, TAPDeveloperPortalAppApiProductDisplay, TAPDeveloperPortalAppApiProductDisplayList } from '../../developer-portal/displayServices/APDeveloperPortalAppApiProductsDisplayService';
import APEntityIdsService, { 
  IAPEntityIdDisplay, 
  TAPEntityId
} from '../../utils/APEntityIdsService';
import { Globals } from '../../utils/Globals';

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

export enum EAPApp_Status {
  UNKNOWN = "UNKNOWN",
  LIVE = "live",
  PARTIALLY_LIVE = "partially live",
  APPROVAL_REQUIRED = "approval required",
}

export type TAPAppCredentialsDisplay = {
  expiresAt: number;
  issuedAt: CommonTimestampInteger;
  secret: Secret;
}

export interface IAPAppDisplay extends IAPEntityIdDisplay {
  devel_connectorAppResponses: {
    smf: AppResponse,
    mqtt?: AppResponse,
    appConnectionStatus: AppConnectionStatus,
  },
  appStatus: EAPApp_Status;
  appCredentials: TAPAppCredentialsDisplay;

  // TODO:
  // appEnvironmentList: TAPAppEnvironmentDisplayList;
  // appClientInformationList: TAPAppClientInformationDisplayList;
  // appWebhookList: TAPAppWebhookDisplayList;
  // isAppWebhookCapable: boolean;
}
export type TAPAppDisplayList = Array<IAPAppDisplay>;

// export type TAPManagedAssetDisplay_AccessAndState = {
//   apBusinessGroupInfo: TAPManagedAssetBusinessGroupInfo;
//   apOwnerInfo: TAPManagedAssetOwnerInfo;
// }

export class APAppsDisplayService {
  private readonly BaseComponentName = "APAppsDisplayService";

  public nameOf<T extends IAPAppDisplay>(name: keyof T) {
    return name;
  }
  public nameOf_ApEntityId(name: keyof TAPEntityId) {
    return `${this.nameOf('apEntityId')}.${name}`;
  }
  public nameOf_ApAppCredentialsDisplay(name: keyof TAPAppCredentialsDisplay) {
    return name;
  }
  public nameOf_ApAppCredentialsDisplay_Secret(name: keyof Secret) {
    return `${this.nameOf_ApAppCredentialsDisplay('secret')}.${name}`;
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
  private create_Empty_ApCredentialsDisplay(): TAPAppCredentialsDisplay {
    return {
      expiresAt: -1,
      issuedAt: -1,
      secret: {
        consumerKey: '',
        consumerSecret: ''
      }
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
      appStatus: EAPApp_Status.UNKNOWN,
      appCredentials: this.create_Empty_ApCredentialsDisplay(),
    };
    return apAppDisplay;
  }

  protected create_ApAppDisplay_From_ApiEntities({ connectorAppResponse_smf, connectorAppResponse_mqtt, connectorAppConnectionStatus, apDeveloperPortalUserApp_ApiProductDisplayList }: {
    connectorAppResponse_smf: AppResponse;
    connectorAppResponse_mqtt?: AppResponse;
    connectorAppConnectionStatus: AppConnectionStatus;
    apDeveloperPortalUserApp_ApiProductDisplayList: TAPDeveloperPortalAppApiProductDisplayList;
  }): IAPAppDisplay {
    const funcName = 'create_ApAppDisplay_From_ApiEntities';
    const logName = `${this.BaseComponentName}.${funcName}()`;

    // calculate the app status from the individual api product app statuses
    const numTotal: number = apDeveloperPortalUserApp_ApiProductDisplayList.length;
    let numLive: number = 0;
    let numApprovalPending: number = 0;
    let numApprovalRevoked: number = 0;

    apDeveloperPortalUserApp_ApiProductDisplayList.forEach( (apDeveloperPortalUserApp_ApiProductDisplay: TAPDeveloperPortalAppApiProductDisplay) => {
      switch(apDeveloperPortalUserApp_ApiProductDisplay.apApp_ApiProduct_Status) {
        case EAPApp_ApiProduct_Status.LIVE:
          numLive++;
          break;
        case EAPApp_ApiProduct_Status.APPROVAL_PENDING:
          numApprovalPending++;
          break;
        case EAPApp_ApiProduct_Status.APPROVAL_REVOKED:
          numApprovalRevoked++;
          break;
        case EAPApp_ApiProduct_Status.UNKNOWN:
          throw new Error(`${logName}: apDeveloperPortalUserApp_ApiProductDisplay.apApp_ApiProduct_Status === EAPApp_ApiProduct_Status.UNKNOWN`);
        default:
          Globals.assertNever(logName, apDeveloperPortalUserApp_ApiProductDisplay.apApp_ApiProduct_Status);
      }
    });
    let appStatus: EAPApp_Status = EAPApp_Status.UNKNOWN;
    if(numLive === numTotal) appStatus = EAPApp_Status.LIVE;
    if(numLive > 0) appStatus = EAPApp_Status.PARTIALLY_LIVE;
    if(numLive === 0 && (numApprovalPending > 0 || numApprovalRevoked > 0) ) appStatus = EAPApp_Status.APPROVAL_REQUIRED;
    if(appStatus === EAPApp_Status.UNKNOWN) throw new Error(`${logName}: appStatus === EAPApp_Status.UNKNOWN`);


    const appCredentials: TAPAppCredentialsDisplay = this.create_Empty_ApCredentialsDisplay();
    appCredentials.expiresAt = connectorAppResponse_smf.credentials.expiresAt;
    if(connectorAppResponse_smf.credentials.issuedAt) appCredentials.issuedAt = connectorAppResponse_smf.credentials.issuedAt;
    if(connectorAppResponse_smf.credentials.secret) {
      appCredentials.secret.consumerKey = connectorAppResponse_smf.credentials.secret.consumerKey;
      appCredentials.secret.consumerSecret = connectorAppResponse_smf.credentials.secret.consumerSecret;
    }

    return {
      apEntityId: {
        id: connectorAppResponse_smf.name,
        displayName: connectorAppResponse_smf.displayName ? connectorAppResponse_smf.displayName : connectorAppResponse_smf.name
      },
      devel_connectorAppResponses: {
        smf: connectorAppResponse_smf,
        mqtt: connectorAppResponse_mqtt,
        appConnectionStatus: connectorAppConnectionStatus
      },
      appStatus: appStatus,
      appCredentials: appCredentials,
    }
  }

  public get_ApAppCredentialsDisplay({ apAppDisplay }:{
    apAppDisplay: IAPAppDisplay;
  }): TAPAppCredentialsDisplay {
    return apAppDisplay.appCredentials;
  }

  public set_ApAppCredentialsDisplay({ apAppDisplay, apAppCredentialsDisplay }:{
    apAppDisplay: IAPAppDisplay;
    apAppCredentialsDisplay: TAPAppCredentialsDisplay;
  }): IAPAppDisplay {
    apAppDisplay.appCredentials = apAppCredentialsDisplay;
    return apAppDisplay;
  }

  // ********************************************************************************************************************************
  // API calls
  // ********************************************************************************************************************************


}

export default new APAppsDisplayService();
