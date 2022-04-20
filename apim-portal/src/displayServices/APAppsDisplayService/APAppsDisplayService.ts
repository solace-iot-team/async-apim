import { 
  ApiError,
  AppConnectionStatus, 
  AppPatch, 
  AppResponse, 
  AppResponseGeneric, 
  AppsService, 
  AppStatus, 
  CommonTimestampInteger, 
  Credentials, 
  Secret
} from '@solace-iot-team/apim-connector-openapi-browser';
import APDeveloperPortalAppApiProductsDisplayService, { 
  EAPApp_ApiProduct_Status, 
  TAPDeveloperPortalAppApiProductDisplay, 
  TAPDeveloperPortalAppApiProductDisplayList 
} from '../../developer-portal/displayServices/APDeveloperPortalAppApiProductsDisplayService';
import { APClientConnectorOpenApi } from '../../utils/APClientConnectorOpenApi';
import APEntityIdsService, { 
  IAPEntityIdDisplay, 
  TAPEntityId
} from '../../utils/APEntityIdsService';
import { APOrganizationsService } from '../../utils/APOrganizationsService';
import { Globals } from '../../utils/Globals';
import { TAPControlledChannelParameterList } from '../APApiProductsDisplayService';
import APAttributesDisplayService, { IAPAttributeDisplay, TAPAttributeDisplayList, TAPRawAttributeList } from '../APAttributesDisplayService/APAttributesDisplayService';
import APEnvironmentsDisplayService, { TAPEnvironmentDisplayList } from '../APEnvironmentsDisplayService';
import { TAPAppApiDisplayList } from './APAppApisDisplayService';
import APAppEnvironmentsDisplayService, { 
  TAPAppEnvironmentDisplayList 
} from './APAppEnvironmentsDisplayService';

export type TAPTopicSyntax = 'smf' | 'mqtt';

export enum EAPApp_Status {
  UNKNOWN = "UNKNOWN",
  NO_API_PRODUCTS = "No API Products",
  LIVE = "live",
  PARTIALLY_LIVE = "partially live",
  APPROVAL_REQUIRED = "approval required",
}

export enum EAPApp_Type {
  UNKNOWN = "UNKNOWN",
  USER = "User App",
  TEAM = "Business Group App"
}
export enum EAPApp_OwnerType {
  UNKNOWN = "UNKNOWN",
  INTERNAL = "internal",
  EXTERNAL = "external"
}

export type TAPAppCredentialsDisplay = {
  apConsumerKeyExiresIn: number; /** duration in millseconds  */
  expiresAt: number; /** millis since epoch */
  issuedAt: CommonTimestampInteger; /** millis since epoch */
  secret: Secret;
  devel_calculated_expiresAt: number; /** devel: cross check correct expiresAt calculation */
  devel_connector_app_expires_in: number; /** devel: duration in millseconds */
}

export type TAPAppMeta = {
  apAppType: EAPApp_Type;
  appOwnerId: string;
  apAppOwnerType: EAPApp_OwnerType;
}

export type TAPAppChannelParameter = IAPAttributeDisplay;
export type TAPAppChannelParameterList = Array<TAPAppChannelParameter>;

export interface IAPAppDisplay extends IAPEntityIdDisplay {
  devel_connectorAppResponses: {
    smf: AppResponse,
    mqtt?: AppResponse,
    appConnectionStatus: AppConnectionStatus,
  },
  apAppInternalName: string;
  apAppMeta: TAPAppMeta;
  apAppStatus: EAPApp_Status;
  apAppCredentials: TAPAppCredentialsDisplay;
  apAppEnvironmentDisplayList: TAPAppEnvironmentDisplayList;
  apAppApiProductDisplayList: TAPDeveloperPortalAppApiProductDisplayList;
  apAppApiDisplayList: TAPAppApiDisplayList;
  apAppChannelParameterList: TAPAppChannelParameterList;
  apCustom_ApAttributeDisplayList: TAPAttributeDisplayList;

  // TODO:
  // appWebhookList: TAPAppWebhookDisplayList;
  // isAppWebhookCapable: boolean;
}

export type TAPAppDisplay_AllowedActions = {
  isMonitorStatsAllowed: boolean;
}

export type TAPAppDisplay_General = IAPEntityIdDisplay & {
  apAppMeta: TAPAppMeta;
}

export type TAPAppDisplay_Credentials = IAPEntityIdDisplay & {
  apAppMeta: TAPAppMeta;
  apAppCredentials: TAPAppCredentialsDisplay;
}

export type TAPAppDisplay_ChannelParameters = IAPEntityIdDisplay & {
  apAppMeta: TAPAppMeta;
  apAppChannelParameterList: TAPAppChannelParameterList;
  combined_ApAppApiProductsControlledChannelParameterList: TAPControlledChannelParameterList;
}


export type TAPAppDisplayList = Array<IAPAppDisplay>;

export class APAppsDisplayService {
  private readonly BaseComponentName = "APAppsDisplayService";

  public nameOf<T extends IAPAppDisplay>(name: keyof T) {
    return name;
  }
  public nameOf_ApEntityId(name: keyof TAPEntityId) {
    return `${this.nameOf('apEntityId')}.${name}`;
  }
  public nameOf_ApAppMeta(name: keyof TAPAppMeta) {
    return `${this.nameOf('apAppMeta')}.${name}`;
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
  private create_Empty_ApAppMeta(): TAPAppMeta {
    return {
      apAppType: EAPApp_Type.UNKNOWN,
      appOwnerId: '',
      apAppOwnerType: EAPApp_OwnerType.UNKNOWN
    }
  }
  private create_Empty_ApCredentialsDisplay(): TAPAppCredentialsDisplay {
    return {
      expiresAt: -1,
      issuedAt: -1,
      secret: {
        consumerKey: '',
        consumerSecret: ''
      },
      apConsumerKeyExiresIn: APOrganizationsService.get_Default_DeveloperPortalApp_CredentailsExpiryDuration(),
      devel_calculated_expiresAt: -1,
      devel_connector_app_expires_in: -1,
    }
  }
  protected create_Empty_ApAppDisplay({ apAppMeta }:{
    apAppMeta?: TAPAppMeta;
  }): IAPAppDisplay {
    const apAppDisplay: IAPAppDisplay = {
      apEntityId: APEntityIdsService.create_EmptyObject(),
      apAppInternalName: '',
      apAppMeta: apAppMeta ? apAppMeta : this.create_Empty_ApAppMeta(),
      devel_connectorAppResponses: {
        smf: this.create_Empty_ConnectorAppResponse(),
        mqtt: this.create_Empty_ConnectorAppResponse(),
        appConnectionStatus: this.create_Empty_ConnectorAppConnectionStatus()
      },
      apAppStatus: EAPApp_Status.UNKNOWN,
      apAppCredentials: this.create_Empty_ApCredentialsDisplay(),
      apAppEnvironmentDisplayList: [],
      apAppApiProductDisplayList: [],
      apAppApiDisplayList: [],
      apAppChannelParameterList: [],
      apCustom_ApAttributeDisplayList: [],
    };
    return apAppDisplay;
  }

  private create_ApAppStatus({ apAppApiProductDisplayList }:{
    apAppApiProductDisplayList: TAPDeveloperPortalAppApiProductDisplayList;
  }): EAPApp_Status {
    const funcName = 'create_ApAppStatus';
    const logName = `${this.BaseComponentName}.${funcName}()`;

    // calculate the app status from the individual api product app statuses
    const numTotal: number = apAppApiProductDisplayList.length;
    let numLive: number = 0;
    let numApprovalPending: number = 0;
    let numApprovalRevoked: number = 0;

    apAppApiProductDisplayList.forEach( (apApp_ApiProductDisplay: TAPDeveloperPortalAppApiProductDisplay) => {
      switch(apApp_ApiProductDisplay.apApp_ApiProduct_Status) {
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
        case EAPApp_ApiProduct_Status.WILL_AUTO_PROVISIONED:
        case EAPApp_ApiProduct_Status.WILL_REQUIRE_APPROVAL:
          throw new Error(`${logName}: apDeveloperPortalUserApp_ApiProductDisplay.apApp_ApiProduct_Status === ${apApp_ApiProductDisplay.apApp_ApiProduct_Status}`);
        default:
          Globals.assertNever(logName, apApp_ApiProductDisplay.apApp_ApiProduct_Status);
      }
    });
    let appStatus: EAPApp_Status = EAPApp_Status.UNKNOWN;
    if(numTotal === 0) appStatus = EAPApp_Status.NO_API_PRODUCTS;
    else {
      if(numLive === numTotal) appStatus = EAPApp_Status.LIVE;
      else if(numLive > 0) appStatus = EAPApp_Status.PARTIALLY_LIVE;
      if(numLive === 0 && (numApprovalPending > 0 || numApprovalRevoked > 0) ) appStatus = EAPApp_Status.APPROVAL_REQUIRED;
      if(appStatus === EAPApp_Status.UNKNOWN) throw new Error(`${logName}: appStatus === EAPApp_Status.UNKNOWN`);  
    }
    return appStatus;
  }

  private create_Complete_ApRawAttributeList({ apAppDisplay }:{
    apAppDisplay: IAPAppDisplay;
  }): TAPRawAttributeList {
    // work on copies
    // note: concat creates a new list
    // concat channel parameters and custom attributes
    const complete_ApAttributeList: TAPAttributeDisplayList = apAppDisplay.apAppChannelParameterList.concat(apAppDisplay.apCustom_ApAttributeDisplayList);

    const rawAttributeList: TAPRawAttributeList = APAttributesDisplayService.create_ApRawAttributeList({
      apAttributeDisplayList: complete_ApAttributeList
    });
    return rawAttributeList;
  }

  private extract_ApAppChannelParameterList({ apAttributeDisplayList, combined_ApApiProductControlledChannelParameterList }:{
    apAttributeDisplayList: TAPAttributeDisplayList;
    combined_ApApiProductControlledChannelParameterList: TAPControlledChannelParameterList;
  }): TAPAppChannelParameterList {
    const apAppChannelParameterList: TAPAppChannelParameterList = APAttributesDisplayService.extract_ByEntityIdList({
      apAttributeDisplayList: apAttributeDisplayList,
      idList_To_extract: APEntityIdsService.create_IdList_From_ApDisplayObjectList<TAPAppChannelParameter>(combined_ApApiProductControlledChannelParameterList)
    });
    return apAppChannelParameterList;
  }

  private create_ApAppCredentials_From_ApiEntities({ connectorAppResponse }:{
    connectorAppResponse: AppResponse;
  }): TAPAppCredentialsDisplay {
    const funcName = 'create_ApAppCredentials_From_ApiEntities';
    const logName = `${this.BaseComponentName}.${funcName}()`;
    // TODO: console.log off
    console.log(`${logName}: connectorAppResponse.credentials=${JSON.stringify(connectorAppResponse.credentials, null, 2)}, \nconnectorAppResponse.expiresIn=${connectorAppResponse.expiresIn}`);

    const appCredentials: TAPAppCredentialsDisplay = this.create_Empty_ApCredentialsDisplay();
    if(connectorAppResponse.credentials.expiresAt) appCredentials.expiresAt = connectorAppResponse.credentials.expiresAt;
    if(connectorAppResponse.credentials.issuedAt) appCredentials.issuedAt = connectorAppResponse.credentials.issuedAt;
    if(connectorAppResponse.credentials.secret) {
      appCredentials.secret.consumerKey = connectorAppResponse.credentials.secret.consumerKey;
      appCredentials.secret.consumerSecret = connectorAppResponse.credentials.secret.consumerSecret;
    }
    if(connectorAppResponse.expiresIn) appCredentials.apConsumerKeyExiresIn = connectorAppResponse.expiresIn;
    // devel:
    appCredentials.devel_calculated_expiresAt = appCredentials.issuedAt + appCredentials.apConsumerKeyExiresIn;
    appCredentials.devel_connector_app_expires_in = connectorAppResponse.expiresIn ? connectorAppResponse.expiresIn : -1;
    return appCredentials;
  }

  protected create_ApAppDisplay_From_ApiEntities({ 
    connectorAppResponse_smf, 
    connectorAppResponse_mqtt, 
    connectorAppConnectionStatus, 
    apAppMeta, 
    apAppApiProductDisplayList,
    apAppApiDisplayList,
  }: {
    connectorAppResponse_smf: AppResponse;
    connectorAppResponse_mqtt?: AppResponse;
    connectorAppConnectionStatus: AppConnectionStatus;
    apAppMeta: TAPAppMeta;
    apAppApiProductDisplayList: TAPDeveloperPortalAppApiProductDisplayList;
    apAppApiDisplayList: TAPAppApiDisplayList;
  }): IAPAppDisplay {

    const appCredentials: TAPAppCredentialsDisplay = this.create_ApAppCredentials_From_ApiEntities({ connectorAppResponse: connectorAppResponse_smf });

    // map raw attributes to ApAppDisplay entities
    // create the working list
    const working_ApAttributeDisplayList: TAPAttributeDisplayList = APAttributesDisplayService.create_ApAttributeDisplayList({
      apRawAttributeList: connectorAppResponse_smf.attributes ? connectorAppResponse_smf.attributes : []
    });
    // extract channel parameters from list
    const combined_ApApiProductControlledChannelParameterList: TAPControlledChannelParameterList = APDeveloperPortalAppApiProductsDisplayService.create_Combined_ApControlledChannelParameterList({
      apApiProductDisplayList: apAppApiProductDisplayList
    });
    const apAppChannelParameterList: TAPAppChannelParameterList = this.extract_ApAppChannelParameterList({
      apAttributeDisplayList: working_ApAttributeDisplayList,
      combined_ApApiProductControlledChannelParameterList: combined_ApApiProductControlledChannelParameterList
    });
    // rest are custom attributes
    const apCustom_ApAttributeDisplayList: TAPAttributeDisplayList = working_ApAttributeDisplayList;
    
    return {
      apEntityId: {
        id: connectorAppResponse_smf.name,
        displayName: connectorAppResponse_smf.displayName ? connectorAppResponse_smf.displayName : connectorAppResponse_smf.name
      },
      apAppInternalName: connectorAppResponse_smf.internalName ? connectorAppResponse_smf.internalName : '',
      apAppMeta: apAppMeta,
      devel_connectorAppResponses: {
        smf: connectorAppResponse_smf,
        mqtt: connectorAppResponse_mqtt,
        appConnectionStatus: connectorAppConnectionStatus
      },
      apAppStatus: this.create_ApAppStatus({ apAppApiProductDisplayList: apAppApiProductDisplayList }),
      apAppCredentials: appCredentials,
      apAppEnvironmentDisplayList: APAppEnvironmentsDisplayService.create_ApAppEnvironmentDisplayList_From_ApiEntities({
        connectorAppEnvironments_smf: connectorAppResponse_smf.environments,
        connectorAppEnvironments_mqtt: connectorAppResponse_mqtt?.environments
      }),
      apAppApiProductDisplayList: apAppApiProductDisplayList,
      apAppApiDisplayList: apAppApiDisplayList,
      apAppChannelParameterList: apAppChannelParameterList,
      apCustom_ApAttributeDisplayList: apCustom_ApAttributeDisplayList
    }
  }

  protected is_MonitorStats_Allowed({ apAppDisplay }: {
    apAppDisplay: IAPAppDisplay;
  }): boolean {
    if(apAppDisplay.apAppStatus === EAPApp_Status.LIVE || apAppDisplay.apAppStatus === EAPApp_Status.PARTIALLY_LIVE) return true;
    return false;
  }
  
  protected get_Empty_AllowedActions(): TAPAppDisplay_AllowedActions {
    return {
      isMonitorStatsAllowed: false
    };
  }

  protected get_AllowedActions({ apAppDisplay }: {
    apAppDisplay: IAPAppDisplay;
  }): TAPAppDisplay_AllowedActions {
    const allowedActions: TAPAppDisplay_AllowedActions = {
      isMonitorStatsAllowed: this.is_MonitorStats_Allowed({ apAppDisplay: apAppDisplay }),
    };
    return allowedActions;
  }

  public get_ApAppDisplay_General({ apAppDisplay }: {
    apAppDisplay: IAPAppDisplay;
  }): TAPAppDisplay_General {
    return {
      apEntityId: apAppDisplay.apEntityId,
      apAppMeta: apAppDisplay.apAppMeta,
    };
  }
  public set_ApAppDisplay_General({ apAppDisplay, apAppDisplay_General }:{
    apAppDisplay: IAPAppDisplay;
    apAppDisplay_General: TAPAppDisplay_General;
  }): IAPAppDisplay {
    apAppDisplay.apEntityId = apAppDisplay_General.apEntityId;
    return apAppDisplay;
  }

  public get_ApAppDisplay_Credentials({ apAppDisplay }: {
    apAppDisplay: IAPAppDisplay;
  }): TAPAppDisplay_Credentials {
    return {
      apEntityId: apAppDisplay.apEntityId,
      apAppMeta: apAppDisplay.apAppMeta,
      apAppCredentials: apAppDisplay.apAppCredentials,
    };
  }
  public set_ApAppDisplay_Credentials({ apAppDisplay, apAppDisplay_Credentials }:{
    apAppDisplay: IAPAppDisplay;
    apAppDisplay_Credentials: TAPAppDisplay_Credentials;
  }): IAPAppDisplay {
    apAppDisplay.apAppCredentials = apAppDisplay_Credentials.apAppCredentials;
    return apAppDisplay;
  }

  public set_ApApp_ApiProductDisplayList({ apAppDisplay, apDeveloperPortalUserApp_ApiProductDisplayList }:{
    apAppDisplay: IAPAppDisplay;
    apDeveloperPortalUserApp_ApiProductDisplayList: TAPDeveloperPortalAppApiProductDisplayList;
  }): IAPAppDisplay {
    apAppDisplay.apAppApiProductDisplayList = apDeveloperPortalUserApp_ApiProductDisplayList;
    return apAppDisplay;
  }

  public get_ApAppDisplay_ChannelParameters({ apAppDisplay }: {
    apAppDisplay: IAPAppDisplay;
  }): TAPAppDisplay_ChannelParameters {
    return {
      apEntityId: apAppDisplay.apEntityId,
      apAppMeta: apAppDisplay.apAppMeta,
      apAppChannelParameterList: apAppDisplay.apAppChannelParameterList,
      combined_ApAppApiProductsControlledChannelParameterList: APDeveloperPortalAppApiProductsDisplayService.create_Combined_ApControlledChannelParameterList({
        apApiProductDisplayList: apAppDisplay.apAppApiProductDisplayList
      }),
    };
  }
  public set_ApAppDisplay_ChannelParameters({ apAppDisplay, apAppDisplay_ChannelParameters }:{
    apAppDisplay: IAPAppDisplay;
    apAppDisplay_ChannelParameters: TAPAppDisplay_ChannelParameters;
  }): IAPAppDisplay {
    apAppDisplay.apAppChannelParameterList = apAppDisplay_ChannelParameters.apAppChannelParameterList;
    return apAppDisplay;
  }


  // ********************************************************************************************************************************
  // API calls
  // ********************************************************************************************************************************

  public async apiCheck_AppId_Exists({ organizationId, appId }:{
    organizationId: string;
    appId: string;
  }): Promise<boolean> {
    try {
      await AppsService.getApp({
        organizationName: organizationId,
        appName: appId
      });
      return true;
    } catch(e: any) {
      if(APClientConnectorOpenApi.isInstanceOfApiError(e)) {
        const apiError: ApiError = e;
        if(apiError.status === 404) return false;
      }
      throw e;
    }
  }

  protected apiGet_ApDeveloperPortalAppApiProductDisplayList = async({ organizationId, ownerId, connectorAppResponse }:{
    organizationId: string;
    ownerId: string;
    connectorAppResponse: AppResponse;
  }): Promise<TAPDeveloperPortalAppApiProductDisplayList> => {
    // const funcName = 'apiGet_ApDeveloperPortalAppApiProductDisplayList';
    // const logName = `${this.ComponentName}.${funcName}()`;

    // get the complete env list for reference
    const complete_apEnvironmentDisplayList: TAPEnvironmentDisplayList = await APEnvironmentsDisplayService.apiGetList_ApEnvironmentDisplay({
      organizationId: organizationId
    });
    
    const apDeveloperPortalAppApiProductDisplayList: TAPDeveloperPortalAppApiProductDisplayList = [];
    
    for(const connectorAppApiProduct of connectorAppResponse.apiProducts) {
      const apDeveloperPortalAppApiProductDisplay: TAPDeveloperPortalAppApiProductDisplay = await APDeveloperPortalAppApiProductsDisplayService.apiGet_DeveloperPortalApAppApiProductDisplay({
        organizationId: organizationId,
        ownerId: ownerId,
        connectorAppApiProduct: connectorAppApiProduct,
        connectorAppResponse: connectorAppResponse,
        complete_apEnvironmentDisplayList: complete_apEnvironmentDisplayList
      });
      apDeveloperPortalAppApiProductDisplayList.push(apDeveloperPortalAppApiProductDisplay);
    }

    return apDeveloperPortalAppApiProductDisplayList;
  }

  protected async apiUpdate({ organizationId, appId, apAppMeta, connectorAppPatch, apRawAttributeList }: {
    organizationId: string;
    appId: string;
    apAppMeta: TAPAppMeta;
    connectorAppPatch: AppPatch;
    apRawAttributeList?: TAPRawAttributeList;
  }): Promise<void> {
    const funcName = 'apiUpdate';
    const logName = `${this.BaseComponentName}.${funcName}()`;

    // always set the App to approved
    const requestBody: AppPatch = {
      ...connectorAppPatch,
      status: AppStatus.APPROVED,
      attributes: apRawAttributeList
    };

    switch(apAppMeta.apAppType) {
      case EAPApp_Type.USER:
        await AppsService.updateDeveloperApp({
          organizationName: organizationId,
          developerUsername: apAppMeta.appOwnerId,
          appName: appId,
          requestBody: requestBody
        });  
        break;
      case EAPApp_Type.TEAM:
        await AppsService.updateTeamApp({
          organizationName: organizationId,
          teamName: apAppMeta.appOwnerId,
          appName: appId,
          requestBody: requestBody
        });  
        break;
      case EAPApp_Type.UNKNOWN:
        throw new Error(`${logName}: apAppMeta.apAppType = EAPApp_Type.UNKNOWN`);
      default:
        Globals.assertNever(logName, apAppMeta.apAppType);
    }

  }

  public async apiUpdate_ApAppDisplay_General({ organizationId, apAppDisplay_General }:{
    organizationId: string;
    apAppDisplay_General: TAPAppDisplay_General;
  }): Promise<void> {

    const update: AppPatch = {
      displayName: apAppDisplay_General.apEntityId.displayName
    }

    await this.apiUpdate({
      organizationId: organizationId,
      apAppMeta: apAppDisplay_General.apAppMeta,
      appId: apAppDisplay_General.apEntityId.id,
      connectorAppPatch: update
    });

  }

  public async apiUpdate_ApAppDisplay_ChannelParameters({ organizationId, apAppDisplay, apAppDisplay_ChannelParameters }:{
    organizationId: string;
    apAppDisplay: IAPAppDisplay;
    apAppDisplay_ChannelParameters: TAPAppDisplay_ChannelParameters;
  }): Promise<void> {

    await this.apiUpdate({
      organizationId: organizationId,
      apAppMeta: apAppDisplay_ChannelParameters.apAppMeta,
      appId: apAppDisplay_ChannelParameters.apEntityId.id,
      connectorAppPatch: {},
      apRawAttributeList: this.create_Complete_ApRawAttributeList({
        apAppDisplay: this.set_ApAppDisplay_ChannelParameters({ apAppDisplay: apAppDisplay, apAppDisplay_ChannelParameters: apAppDisplay_ChannelParameters })
      })
    });

  }

  /**
   * Re-generate app credentials
   */
  public async apiUpdate_ApAppDisplay_Credentials({ organizationId, apAppDisplay_Credentials }:{
    organizationId: string;
    apAppDisplay_Credentials: TAPAppDisplay_Credentials;
  }): Promise<void> {

    // update expiresIn in case it is not set
    const update: AppPatch = {
      expiresIn: apAppDisplay_Credentials.apAppCredentials.apConsumerKeyExiresIn,
      credentials: {
        secret: {
          consumerKey: apAppDisplay_Credentials.apAppCredentials.secret.consumerKey,
          consumerSecret: undefined, // ensures it is re-generated          
        }
      }
    }

    await this.apiUpdate({
      organizationId: organizationId,
      apAppMeta: apAppDisplay_Credentials.apAppMeta,
      appId: apAppDisplay_Credentials.apEntityId.id,
      connectorAppPatch: update
    });

  }

  public async apiDelete_ApAppDisplay({ organizationId, appId }:{
    organizationId: string;
    appId: string;
  }): Promise<void> {
    const funcName = 'apiDelete_ApAppDisplay';
    const logName = `${this.BaseComponentName}.${funcName}()`;

    // what kind of app is it?
    const connectorAppResponseGeneric: AppResponseGeneric = await AppsService.getApp({
      organizationName: organizationId,
      appName: appId
    });
    if(connectorAppResponseGeneric.appType === undefined) throw new Error(`${logName}: connectorAppResponseGeneric.appType === undefined`);
    if(connectorAppResponseGeneric.ownerId === undefined) throw new Error(`${logName}: connectorAppResponseGeneric.ownerId === undefined`);

    switch(connectorAppResponseGeneric.appType) {
      case AppResponseGeneric.appType.DEVELOPER:
        await AppsService.deleteDeveloperApp({
          organizationName: organizationId,
          developerUsername: connectorAppResponseGeneric.ownerId,
          appName: appId
        });
        break;
      case AppResponseGeneric.appType.TEAM:
        await AppsService.deleteTeamApp({
          organizationName: organizationId,
          teamName: connectorAppResponseGeneric.ownerId,
          appName: appId
        });
        break;
      default:
        Globals.assertNever(logName, connectorAppResponseGeneric.appType);
    }
  }

}

export default new APAppsDisplayService();
