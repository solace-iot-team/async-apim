import { 
  AdministrationService,
  ApiError,
  AppConnectionStatus, 
  AppPatch, 
  AppResponse, 
  AppResponseGeneric, 
  AppsService, 
  CommonTimestampInteger, 
  Credentials, 
  OrganizationResponse, 
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
import { APOrganizationsService } from '../../utils/deleteme_APOrganizationsService';
import { Globals } from '../../utils/Globals';
import { ApsAdministrationService, APSOrganization } from '../../_generated/@solace-iot-team/apim-server-openapi-browser';
import { TAPControlledChannelParameterList } from '../APApiProductsDisplayService';
import APAttributesDisplayService, { IAPAttributeDisplay, TAPAttributeDisplayList, TAPRawAttributeList } from '../APAttributesDisplayService/APAttributesDisplayService';
import { TAPBusinessGroupDisplayList } from '../APBusinessGroupsDisplayService';
import APEnvironmentsDisplayService, { TAPEnvironmentDisplayList } from '../APEnvironmentsDisplayService';


// export enum EAPApp_Status {
//   UNKNOWN = "UNKNOWN",
//   NO_API_PRODUCTS = "No API Products",
//   LIVE = "live",
//   PARTIALLY_LIVE = "partially live",
//   APPROVAL_REQUIRED = "approval required",
// }

// export enum EAPApp_Type {
//   UNKNOWN = "UNKNOWN",
//   USER = "User App",
//   TEAM = "Business Group App"
// }
// export enum EAPApp_OwnerType {
//   UNKNOWN = "UNKNOWN",
//   INTERNAL = "internal",
//   EXTERNAL = "external"
// }

// export type TAPAppCredentialsDisplay = {
//   apConsumerKeyExiresIn: number; /** duration in millseconds  */
//   expiresAt: number; /** millis since epoch */
//   issuedAt: CommonTimestampInteger; /** millis since epoch */
//   secret: Secret;
//   devel_calculated_expiresAt: number; /** devel: cross check correct expiresAt calculation */
//   devel_connector_app_expires_in: number; /** devel: duration in millseconds */
// }

// export type TAPAppMeta = {
//   apAppType: EAPApp_Type;
//   appOwnerId: string;
//   appOwnerDisplayName: string;
//   apAppOwnerType: EAPApp_OwnerType;
// }

// export type TAPAppChannelParameter = IAPAttributeDisplay;
// export type TAPAppChannelParameterList = Array<TAPAppChannelParameter>;


export interface IAPOrganizationDisplay extends IAPEntityIdDisplay {
  connectorOrganizationResponse: OrganizationResponse;
  apNumApis2ApiProductRatio: number; /** -1 = infinity, min = 1 (0 not allowed) */
  apDefaultAppCredentialsExpiryDuration: number;
  // add more settings over time from APS
}

// export type TAPAppDisplay_AllowedActions = {
//   isMonitorStatsAllowed: boolean;
// }

// export type TAPAppDisplay_General = IAPEntityIdDisplay & {
//   apAppMeta: TAPAppMeta;
// }

// export type TAPAppDisplay_Credentials = IAPEntityIdDisplay & {
//   apAppMeta: TAPAppMeta;
//   apAppCredentials: TAPAppCredentialsDisplay;
// }

// export type TAPAppDisplay_ChannelParameters = IAPEntityIdDisplay & {
//   apAppMeta: TAPAppMeta;
//   apAppChannelParameterList: TAPAppChannelParameterList;
//   combined_ApAppApiProductsControlledChannelParameterList: TAPControlledChannelParameterList;
// }


// export type TAPAppDisplayList = Array<IAPAppDisplay>;

export class APOrganizationsDisplayService {
  private readonly BaseComponentName = "APOrganizationsDisplayService";
  private readonly DefaultNumApis2ApiProductRatio: number = -1; /** any number of Apis */
  private readonly DefaultAppCredentialsExpiryDuration: number = (6 * 30 * 24 * 3600 * 1000); /** 6 months in milliseconds */
  private readonly SecretMask = '***';

  public nameOf<T extends IAPOrganizationDisplay>(name: keyof T): string {
    return `${name}`;
  }
  public nameOf_ApEntityId(name: keyof TAPEntityId): string {
    return `${this.nameOf('apEntityId')}.${name}`;
  }

  private maskOrganizationSecrets({ organizationObject }:{
    organizationObject: any;
  }): any {
    const funcName = 'maskOrganizationSecrets';
    const logName = `${this.BaseComponentName}.${funcName}()`;
    // console.log(`${logName}: organizationObject=${JSON.stringify(organizationObject, null, 2)}`);
    // TODO: implement array traversal if required
    if(Array.isArray(organizationObject)) throw new Error(`${logName}: arrays are not supported`);
    const isObject = (obj:any ) => obj && typeof obj === 'object';
    Object.keys(organizationObject).forEach( key => {
      const value = organizationObject[key];
      const k = key.toLowerCase();
      if( k.includes('token') && typeof value === 'string') {
        organizationObject[key] = this.SecretMask;
      }
      if(Array.isArray(value) || isObject(value)) this.maskOrganizationSecrets({ organizationObject: value });
    });
    return organizationObject;
  }

  private create_Empty_ConnectorOrganizationResponse(): OrganizationResponse {
    return {
      name: ''
    }
  }
  
  protected create_Empty_ApOrganizationDisplay(): IAPOrganizationDisplay {
    const apOrganizationDisplay: IAPOrganizationDisplay = {
      connectorOrganizationResponse: this.create_Empty_ConnectorOrganizationResponse(),
      apEntityId: APEntityIdsService.create_EmptyObject_NoId(),
      apNumApis2ApiProductRatio: this.DefaultNumApis2ApiProductRatio,
      apDefaultAppCredentialsExpiryDuration: this.DefaultAppCredentialsExpiryDuration,
    };
    return apOrganizationDisplay;
  }

  protected create_ApOrganizationDisplay_From_ApiEntities({ apsOrganization, connectorOrganizationResponse }: {
    connectorOrganizationResponse: OrganizationResponse;
    apsOrganization: APSOrganization;
  }): IAPOrganizationDisplay {

    const apOrganizationDisplay: IAPOrganizationDisplay = {
      connectorOrganizationResponse: connectorOrganizationResponse,
      apEntityId: { id: apsOrganization.organizationId, displayName: apsOrganization.displayName },
      // TODO: from apsOrganization
      apNumApis2ApiProductRatio: this.DefaultNumApis2ApiProductRatio,
      apDefaultAppCredentialsExpiryDuration: this.DefaultAppCredentialsExpiryDuration,
    };
    return apOrganizationDisplay;
  }

  public get_DefaultAppCredentailsExpiryDuration(): number {
    return this.DefaultAppCredentialsExpiryDuration;
  }

  // protected is_MonitorStats_Allowed({ apAppDisplay }: {
  //   apAppDisplay: IAPAppDisplay;
  // }): boolean {
  //   if(apAppDisplay.apAppStatus === EAPApp_Status.LIVE || apAppDisplay.apAppStatus === EAPApp_Status.PARTIALLY_LIVE) return true;
  //   return false;
  // }
  
  // protected get_Empty_AllowedActions(): TAPAppDisplay_AllowedActions {
  //   return {
  //     isMonitorStatsAllowed: false
  //   };
  // }

  // protected get_AllowedActions({ apAppDisplay }: {
  //   apAppDisplay: IAPAppDisplay;
  // }): TAPAppDisplay_AllowedActions {
  //   const allowedActions: TAPAppDisplay_AllowedActions = {
  //     isMonitorStatsAllowed: this.is_MonitorStats_Allowed({ apAppDisplay: apAppDisplay }),
  //   };
  //   return allowedActions;
  // }

  // public get_ApAppDisplay_General({ apAppDisplay }: {
  //   apAppDisplay: IAPAppDisplay;
  // }): TAPAppDisplay_General {
  //   return {
  //     apEntityId: apAppDisplay.apEntityId,
  //     apAppMeta: apAppDisplay.apAppMeta,
  //   };
  // }
  // public set_ApAppDisplay_General({ apAppDisplay, apAppDisplay_General }:{
  //   apAppDisplay: IAPAppDisplay;
  //   apAppDisplay_General: TAPAppDisplay_General;
  // }): IAPAppDisplay {
  //   apAppDisplay.apEntityId = apAppDisplay_General.apEntityId;
  //   return apAppDisplay;
  // }

  // public get_ApAppDisplay_Credentials({ apAppDisplay }: {
  //   apAppDisplay: IAPAppDisplay;
  // }): TAPAppDisplay_Credentials {
  //   return {
  //     apEntityId: apAppDisplay.apEntityId,
  //     apAppMeta: apAppDisplay.apAppMeta,
  //     apAppCredentials: apAppDisplay.apAppCredentials,
  //   };
  // }
  // public set_ApAppDisplay_Credentials({ apAppDisplay, apAppDisplay_Credentials }:{
  //   apAppDisplay: IAPAppDisplay;
  //   apAppDisplay_Credentials: TAPAppDisplay_Credentials;
  // }): IAPAppDisplay {
  //   apAppDisplay.apAppCredentials = apAppDisplay_Credentials.apAppCredentials;
  //   return apAppDisplay;
  // }

  // ********************************************************************************************************************************
  // API calls
  // ********************************************************************************************************************************

  // public async apiCheck_AppId_Exists({ organizationId, appId }:{
  //   organizationId: string;
  //   appId: string;
  // }): Promise<boolean> {
  //   try {
  //     await AppsService.getApp({
  //       organizationName: organizationId,
  //       appName: appId
  //     });
  //     return true;
  //   } catch(e: any) {
  //     if(APClientConnectorOpenApi.isInstanceOfApiError(e)) {
  //       const apiError: ApiError = e;
  //       if(apiError.status === 404) return false;
  //     }
  //     throw e;
  //   }
  // }

  protected apiGet_ConnectorOrganizationResponse = async({ organizationId }:{
    organizationId: string;
  }): Promise<OrganizationResponse> => {
    const organizationResponse: OrganizationResponse = await AdministrationService.getOrganization({
      organizationName: organizationId
    });
    return this.maskOrganizationSecrets({ organizationObject: organizationResponse });
  }

  public apiGet_ApOrganizationDisplay = async({ organizationId }:{
    organizationId: string;
  }): Promise<IAPOrganizationDisplay> => {
    const funcName = 'apiGet_ApOrganizationDisplay';
    const logName = `${this.BaseComponentName}.${funcName}()`;

    // // TEST upstream error handling
    // throw new Error(`${logName}: test error handling`);

    // get the APS organzation first
    const apsOrganization: APSOrganization = await ApsAdministrationService.getApsOrganization({
      organizationId: organizationId
    });
    // get the connector organzations
    const connectorOrganizationResponse: OrganizationResponse = await this.apiGet_ConnectorOrganizationResponse({ organizationId: organizationId });

    const apOrganizationDisplay: IAPOrganizationDisplay = this.create_ApOrganizationDisplay_From_ApiEntities({
      apsOrganization: apsOrganization,
      connectorOrganizationResponse: connectorOrganizationResponse
    });

    return apOrganizationDisplay;
  }


  // protected async apiUpdate({ organizationId, appId, apAppMeta, connectorAppPatch, apRawAttributeList }: {
  //   organizationId: string;
  //   appId: string;
  //   apAppMeta: TAPAppMeta;
  //   connectorAppPatch: AppPatch;
  //   apRawAttributeList?: TAPRawAttributeList;
  // }): Promise<void> {
  //   const funcName = 'apiUpdate';
  //   const logName = `${this.BaseComponentName}.${funcName}()`;

  //   const requestBody: AppPatch = {
  //     ...connectorAppPatch,
  //     attributes: apRawAttributeList
  //   };

  //   switch(apAppMeta.apAppType) {
  //     case EAPApp_Type.USER:
  //       await AppsService.updateDeveloperApp({
  //         organizationName: organizationId,
  //         developerUsername: apAppMeta.appOwnerId,
  //         appName: appId,
  //         requestBody: requestBody
  //       });  
  //       break;
  //     case EAPApp_Type.TEAM:
  //       await AppsService.updateTeamApp({
  //         organizationName: organizationId,
  //         teamName: apAppMeta.appOwnerId,
  //         appName: appId,
  //         requestBody: requestBody
  //       });  
  //       break;
  //     case EAPApp_Type.UNKNOWN:
  //       throw new Error(`${logName}: apAppMeta.apAppType = EAPApp_Type.UNKNOWN`);
  //     default:
  //       Globals.assertNever(logName, apAppMeta.apAppType);
  //   }

  // }

  // public async apiUpdate_ApAppDisplay_General({ organizationId, apAppDisplay_General }:{
  //   organizationId: string;
  //   apAppDisplay_General: TAPAppDisplay_General;
  // }): Promise<void> {

  //   const update: AppPatch = {
  //     displayName: apAppDisplay_General.apEntityId.displayName
  //   }

  //   await this.apiUpdate({
  //     organizationId: organizationId,
  //     apAppMeta: apAppDisplay_General.apAppMeta,
  //     appId: apAppDisplay_General.apEntityId.id,
  //     connectorAppPatch: update
  //   });

  // }

  // public async apiDelete_ApAppDisplay({ organizationId, appId }:{
  //   organizationId: string;
  //   appId: string;
  // }): Promise<void> {
  //   const funcName = 'apiDelete_ApAppDisplay';
  //   const logName = `${this.BaseComponentName}.${funcName}()`;

  //   // what kind of app is it?
  //   const connectorAppResponseGeneric: AppResponseGeneric = await AppsService.getApp({
  //     organizationName: organizationId,
  //     appName: appId
  //   });
  //   if(connectorAppResponseGeneric.appType === undefined) throw new Error(`${logName}: connectorAppResponseGeneric.appType === undefined`);
  //   if(connectorAppResponseGeneric.ownerId === undefined) throw new Error(`${logName}: connectorAppResponseGeneric.ownerId === undefined`);

  //   switch(connectorAppResponseGeneric.appType) {
  //     case AppResponseGeneric.appType.DEVELOPER:
  //       await AppsService.deleteDeveloperApp({
  //         organizationName: organizationId,
  //         developerUsername: connectorAppResponseGeneric.ownerId,
  //         appName: appId
  //       });
  //       break;
  //     case AppResponseGeneric.appType.TEAM:
  //       await AppsService.deleteTeamApp({
  //         organizationName: organizationId,
  //         teamName: connectorAppResponseGeneric.ownerId,
  //         appName: appId
  //       });
  //       break;
  //     default:
  //       Globals.assertNever(logName, connectorAppResponseGeneric.appType);
  //   }
  // }

}

export default new APOrganizationsDisplayService();
