import { 
  AppApiProductsComplex,
  AppConnectionStatus,
  AppListItem,
  AppPatch,
  AppResponse,
  AppResponseGeneric,
  AppsService,
} from '@solace-iot-team/apim-connector-openapi-browser';
import APDeveloperPortalAppApiProductsDisplayService, { 
  TAPDeveloperPortalAppApiProductDisplayList 
} from '../../developer-portal/displayServices/APDeveloperPortalAppApiProductsDisplayService';
import APAppApisDisplayService, { 
  TAPAppApiDisplayList }
   from '../../displayServices/APAppsDisplayService/APAppApisDisplayService';
import { 
  APAppsDisplayService,
  EAPApp_OwnerType, 
  EAPApp_Type, 
  IAPAppDisplay, 
  TAPAppDisplay_AllowedActions, 
  TAPAppMeta, 
  TAPTopicSyntax
} from '../../displayServices/APAppsDisplayService/APAppsDisplayService';
import APBusinessGroupsDisplayService from '../../displayServices/APBusinessGroupsDisplayService';
import APRbacDisplayService from '../../displayServices/APRbacDisplayService';
import APLoginUsersDisplayService from '../../displayServices/APUsersDisplayService/APLoginUsersDisplayService';
import APMemberOfService, { TAPMemberOfBusinessGroupDisplay, TAPMemberOfBusinessGroupDisplayTreeNodeList } from '../../displayServices/APUsersDisplayService/APMemberOfService';
import APOrganizationUsersDisplayService, { 
  TAPCheckOrganizationUserIdExistsResult, TAPOrganizationUserDisplay 
} from '../../displayServices/APUsersDisplayService/APOrganizationUsersDisplayService';
import { APUsersDisplayService } from '../../displayServices/APUsersDisplayService/APUsersDisplayService';
import { TAPEntityId, TAPEntityIdList } from '../../utils/APEntityIdsService';
import APSearchContentService, { IAPSearchContent } from '../../utils/APSearchContentService';
import { Globals } from '../../utils/Globals';
import { EAPSBusinessGroupAuthRole, EAPSOrganizationAuthRole } from '../../_generated/@solace-iot-team/apim-server-openapi-browser';

export type TAPAdminPortalAppDisplay_AllowedActions = TAPAppDisplay_AllowedActions & {
  // nothing to add for now
}

export type TAPAdminPortalAppDisplay = IAPAppDisplay & IAPSearchContent & {
  // nothing to add for now
}
export type TAPAdminPortalAppDisplayList = Array<TAPAdminPortalAppDisplay>;

// export type TAPDeveloperPortalUserAppDisplay_AllowedActions = {
//   isManageWebhooksAllowed: boolean;
//   isMonitorStatsAllowed: boolean;
// }

class APAdminPortalAppsDisplayService extends APAppsDisplayService {
  private readonly ComponentName = "APAdminPortalAppsDisplayService";

  private map_ConnectorAppType_To_ApAppType({ connectorAppType }:{
    connectorAppType?: AppListItem.appType;
  }): EAPApp_Type {
    const funcName = 'map_ConnectorAppType_To_ApAppType';
    const logName = `${this.ComponentName}.${funcName}()`;
    if(connectorAppType === undefined) throw new Error(`${logName}: connectorAppType === undefined`);

    switch(connectorAppType) {
      case AppListItem.appType.DEVELOPER:
        return EAPApp_Type.USER;
      case AppListItem.appType.TEAM:
        return EAPApp_Type.TEAM;
      default:
        Globals.assertNever(logName, connectorAppType);
    }
    throw new Error(`${logName}: unknown connectorAppType=${connectorAppType}`);
  }

  private create_ApAdminPortalAppDisplay_From_ApiEntities({ 
    apAppMeta, 
    connectorAppResponse_smf,
    connectorAppResponse_mqtt,
    connectorAppConnectionStatus,
    apApp_ApiProduct_DisplayList,
    apApp_Api_DisplayList,
  }: {
    apAppMeta: TAPAppMeta;
    connectorAppResponse_smf: AppResponse;
    connectorAppResponse_mqtt?: AppResponse;
    connectorAppConnectionStatus: AppConnectionStatus;
    apApp_ApiProduct_DisplayList: TAPDeveloperPortalAppApiProductDisplayList;
    apApp_Api_DisplayList: TAPAppApiDisplayList;
  }): TAPAdminPortalAppDisplay {

    const apAppDisplay: IAPAppDisplay = this.create_ApAppDisplay_From_ApiEntities({
      apAppMeta: apAppMeta,
      connectorAppConnectionStatus: connectorAppConnectionStatus,
      connectorAppResponse_smf: connectorAppResponse_smf,
      connectorAppResponse_mqtt: connectorAppResponse_mqtt,
      apAppApiProductDisplayList: apApp_ApiProduct_DisplayList,
      apAppApiDisplayList: apApp_Api_DisplayList
    });

    const apAdminPortalAppDisplay: TAPAdminPortalAppDisplay = {
      ...apAppDisplay,
      apSearchContent: '',      
    };
    return APSearchContentService.add_SearchContent<TAPAdminPortalAppDisplay>(apAdminPortalAppDisplay);
  }

  // public get_ApDeveloperPortalApp_ApiProductDisplayList({ apDeveloperPortalUserAppDisplay }:{
  //   apDeveloperPortalUserAppDisplay: TAPDeveloperPortalUserAppDisplay;
  // }): TAPDeveloperPortalAppApiProductDisplayList {
  //   return apDeveloperPortalUserAppDisplay.apDeveloperPortalUserApp_ApiProductDisplayList;
  // }

  // public set_ApDeveloperPortalApp_ApiProductDisplayList({ apDeveloperPortalUserAppDisplay, apDeveloperPortalUserApp_ApiProductDisplayList }:{
  //   apDeveloperPortalUserAppDisplay: TAPDeveloperPortalUserAppDisplay;
  //   apDeveloperPortalUserApp_ApiProductDisplayList: TAPDeveloperPortalAppApiProductDisplayList;
  // }): TAPDeveloperPortalUserAppDisplay {
  //   apDeveloperPortalUserAppDisplay.apDeveloperPortalUserApp_ApiProductDisplayList = apDeveloperPortalUserApp_ApiProductDisplayList;
  //   return apDeveloperPortalUserAppDisplay;
  // }

  public get_Empty_AllowedActions(): TAPAdminPortalAppDisplay_AllowedActions {
    return {
      ...super.get_Empty_AllowedActions(),
    };
  }

  public get_AllowedActions({ apAppDisplay }: {
    apAppDisplay: IAPAppDisplay;
  }): TAPAdminPortalAppDisplay_AllowedActions {
    const allowedActions: TAPAdminPortalAppDisplay_AllowedActions = {
      ...super.get_AllowedActions({ apAppDisplay: apAppDisplay }),
    };
    return allowedActions;
  }

  // ********************************************************************************************************************************
  // API calls
  // ********************************************************************************************************************************

  private async apiCheck_isOwnerIdInternal({ organizationId, ownerId, apAppType }:{
    apAppType: EAPApp_Type;
    ownerId: string;
    organizationId: string;
  }): Promise<boolean> {
    const funcName = 'apiCheck_isOwnerIdInternal';
    const logName = `${this.ComponentName}.${funcName}()`;
    switch(apAppType) {
      case EAPApp_Type.USER:
        const result: TAPCheckOrganizationUserIdExistsResult = await APOrganizationUsersDisplayService.apsCheck_OrganizationUserIdExists({ organizationId: organizationId, userId: ownerId });
        return result.existsInOrganization;
      case EAPApp_Type.TEAM:
        return await APBusinessGroupsDisplayService.apsCheck_BusinessGroupIdExists({ organizationId: organizationId, businessGroupId: ownerId });
      case EAPApp_Type.UNKNOWN:
        throw new Error(`${logName}: apAppType=${apAppType}`);  
      default:
        Globals.assertNever(logName, apAppType);
    }
    throw new Error(`${logName}: unknown apAppType=${apAppType}`);
  }

  private async create_ApAdminPortalAppDisplay_ApAppMeta({ organizationId, connectorAppType, connectorOwnerId }:{
    organizationId: string;
    connectorAppType?: AppResponseGeneric.appType;
    connectorOwnerId?: string;
  }): Promise<TAPAppMeta> {
    const funcName = 'create_ApAppMeta';
    const logName = `${this.ComponentName}.${funcName}()`;
    if(connectorOwnerId === undefined) throw new Error(`${logName}: connectorOwnerId === undefined`);
    const apAppType: EAPApp_Type = this.map_ConnectorAppType_To_ApAppType({ connectorAppType: connectorAppType });
    const isOwnerInternal: boolean = await this.apiCheck_isOwnerIdInternal({ organizationId: organizationId, apAppType: apAppType, ownerId: connectorOwnerId });
    return {
      apAppType: apAppType,
      apAppOwnerType: isOwnerInternal ? EAPApp_OwnerType.INTERNAL : EAPApp_OwnerType.EXTERNAL,
      appOwnerId: connectorOwnerId
    };
  }

  private async apiGet_ConnectorAppResponse({ organizationId, apAppType, ownerId, appId, apTopicSyntax }:{
    organizationId: string;
    apAppType: EAPApp_Type;
    ownerId: string;
    appId: string;
    apTopicSyntax: TAPTopicSyntax;
  }): Promise<AppResponse> {
    const funcName = 'apiGet_ConnectorAppResponse';
    const logName = `${this.ComponentName}.${funcName}()`;
    let connectorAppResponse: AppResponse | undefined = undefined;
    switch(apAppType) {
      case EAPApp_Type.USER:
        connectorAppResponse = await AppsService.getDeveloperApp({
          organizationName: organizationId,
          developerUsername: ownerId,
          appName: appId,
          topicSyntax: apTopicSyntax
        });
        break;
      case EAPApp_Type.TEAM:
        connectorAppResponse = await AppsService.getTeamApp({
          organizationName: organizationId,
          teamName: ownerId,
          appName: appId,
          topicSyntax: apTopicSyntax
        });
        break;
      case EAPApp_Type.UNKNOWN:
        throw new Error(`${logName}: apAppType = ${apAppType}`);
      default:
        Globals.assertNever(logName, apAppType);
    }
    if(connectorAppResponse === undefined) throw new Error(`${logName}: connectorAppResponse === undefined`);
    return connectorAppResponse;
  }

  public apiGet_ApAdminPortalAppDisplay = async({ organizationId, appId }:{
    organizationId: string;
    appId: string;
  }): Promise<TAPAdminPortalAppDisplay> => {
    // const funcName = 'apiGet_ApAdminPortalAppDisplay';
    // const logName = `${this.ComponentName}.${funcName}()`;
    // TEST upstream error handling
    // throw new Error(`${logName}: test error handling`);

    const connectorAppResponseGeneric: AppResponseGeneric = await AppsService.getApp({
      organizationName: organizationId,
      appName: appId
    });

    const apAppMeta: TAPAppMeta = await this.create_ApAdminPortalAppDisplay_ApAppMeta({ 
      organizationId: organizationId, 
      connectorAppType: connectorAppResponseGeneric.appType,
      connectorOwnerId: connectorAppResponseGeneric.ownerId
    });

    const connectorAppResponse_smf: AppResponse = await this.apiGet_ConnectorAppResponse({
      organizationId: organizationId,
      apAppType: apAppMeta.apAppType,
      apTopicSyntax: 'smf',
      appId: connectorAppResponseGeneric.name,
      ownerId: apAppMeta.appOwnerId
    });

    const connectorAppResponse_mqtt: AppResponse = await this.apiGet_ConnectorAppResponse({
      organizationId: organizationId,
      apAppType: apAppMeta.apAppType,
      apTopicSyntax: 'mqtt',
      appId: connectorAppResponseGeneric.name,
      ownerId: apAppMeta.appOwnerId
    });

    const apAppApiProductDisplayList: TAPDeveloperPortalAppApiProductDisplayList = await this.apiGet_ApDeveloperPortalAppApiProductDisplayList({
      organizationId: organizationId,
      ownerId: apAppMeta.appOwnerId,
      connectorAppResponse: connectorAppResponse_smf,
    });

    const connectorAppConnectionStatus: AppConnectionStatus = await AppsService.getAppStatus({
      organizationName: organizationId,
      appName: appId
    });  

    const apAppApiDisplayList: TAPAppApiDisplayList = await APAppApisDisplayService.apiGetList_ApAppApiDisplay({
      organizationId: organizationId,
      appId: appId,
      apApp_ApiProductDisplayList: apAppApiProductDisplayList,
    });


    const apAdminPortalAppDisplay: TAPAdminPortalAppDisplay = this.create_ApAdminPortalAppDisplay_From_ApiEntities({
      apAppMeta: apAppMeta,
      connectorAppResponse_smf: connectorAppResponse_smf,
      connectorAppResponse_mqtt: connectorAppResponse_mqtt,
      connectorAppConnectionStatus: connectorAppConnectionStatus,
      apApp_ApiProduct_DisplayList: apAppApiProductDisplayList,
      apApp_Api_DisplayList: apAppApiDisplayList,
    });

    return apAdminPortalAppDisplay;

  }


  private hasManageAppAccess_For_External_Apps = (businessGroupRoleEntityIdList: TAPEntityIdList): boolean => {
    return APRbacDisplayService.includes_Role({
      businessGroupRoleEntityIdList: businessGroupRoleEntityIdList,
      role: EAPSOrganizationAuthRole.ORGANIZATION_ADMIN
    });
  }

  // TODO: move to APOrganizationUserDisplayService
  private hasUser_ApiConsumer_Role_In_BusinessGroup = async({ organizationId, businessGroupId, userId }:{
    organizationId: string;
    businessGroupId: string;
    userId: string;
  }): Promise<boolean> => {
    const funcName = 'hasUser_ApiConsumer_Role_In_BusinessGroup';
    const logName = `${this.ComponentName}.${funcName}()`;

    const organizationEntityId: TAPEntityId = { id: organizationId, displayName: organizationId };
    const apOrganizationUserDisplay: TAPOrganizationUserDisplay = await APOrganizationUsersDisplayService.apsGet_ApOrganizationUserDisplay({
      userId: userId,
      organizationEntityId: organizationEntityId,
      fetch_ApOrganizationAssetInfoDisplayList: false,
    });
    if(apOrganizationUserDisplay.completeOrganizationBusinessGroupDisplayList === undefined) throw new Error(`${logName}: apOrganizationUserDisplay.completeOrganizationBusinessGroupDisplayList === undefined`);

    const apMemberOfBusinessGroupDisplayTreeNodeList: TAPMemberOfBusinessGroupDisplayTreeNodeList = APMemberOfService.create_ApMemberOfBusinessGroupDisplayTreeNodeList({
      organizationEntityId: organizationEntityId,
      apMemberOfBusinessGroupDisplayList: apOrganizationUserDisplay.memberOfOrganizationDisplay.apMemberOfBusinessGroupDisplayList,
      apOrganizationRoleEntityIdList: apOrganizationUserDisplay.memberOfOrganizationDisplay.apOrganizationRoleEntityIdList,
      completeApOrganizationBusinessGroupDisplayList: apOrganizationUserDisplay.completeOrganizationBusinessGroupDisplayList,
      pruneBusinessGroupsNotAMemberOf: false,
      accessOnly_To_BusinessGroupManageAssets: false,
    });

    const apMemberOfBusinessGroupDisplay: TAPMemberOfBusinessGroupDisplay = APMemberOfService.get_ApMemberOfBusinessGroupDisplay_From_ApMemberOfBusinessGroupDisplayTreeNodeList({
      apMemberOfBusinessGroupDisplayTreeNodeList: apMemberOfBusinessGroupDisplayTreeNodeList,
      businessGroupId: businessGroupId
    });
    if(apMemberOfBusinessGroupDisplay.apCalculatedBusinessGroupRoleEntityIdList === undefined) throw new Error(`${logName}: apMemberOfBusinessGroupDisplay.apCalculatedBusinessGroupRoleEntityIdList === undefined`);
    const isApiConsumer: boolean = APRbacDisplayService.includes_Role({
      businessGroupRoleEntityIdList: apMemberOfBusinessGroupDisplay.apCalculatedBusinessGroupRoleEntityIdList,
      role: EAPSBusinessGroupAuthRole.API_CONSUMER
    }); 
    return isApiConsumer;
  }

  public apiGetList_ApAdminPortalAppDisplayList_With_Rbac = async({ organizationId, businessGroupId, businessGroupRoleEntityIdList }: {
    organizationId: string;
    businessGroupId: string;
    businessGroupRoleEntityIdList: TAPEntityIdList;
  }): Promise<TAPAdminPortalAppDisplayList> => {
    const funcName = 'apiGetList_ApAdminPortalAppDisplayList_With_Rbac';
    const logName = `${this.ComponentName}.${funcName}()`;

    // get the access levels
    const canManage_ExternalApps: boolean = this.hasManageAppAccess_For_External_Apps(businessGroupRoleEntityIdList);
    // keep a cache of ownerIds which have Api consumer role in business group
    const apiConsumer_OwnerIdList: Array<string> = [];

    const apAdminPortalAppDisplayList: TAPAdminPortalAppDisplayList = [];

    const connectorAppList: Array<AppListItem> = await AppsService.listApps({
      organizationName: organizationId, 
    });

    for(const connectorAppListItem of connectorAppList) {
      if(connectorAppListItem.name === undefined) throw new Error(`${logName}: connectorAppListItem.name === undefined`);

      const apAppMeta: TAPAppMeta = await this.create_ApAdminPortalAppDisplay_ApAppMeta({ 
        organizationId: organizationId, 
        connectorAppType: connectorAppListItem.appType,
        connectorOwnerId: connectorAppListItem.ownerId
      });

      // re-write?
      // add it to the list?
      let canManageApp: boolean = false;
      // external user or team apps 
      if(apAppMeta.apAppOwnerType === EAPApp_OwnerType.EXTERNAL && canManage_ExternalApps) canManageApp = true;
      // team apps in this business group
      else if(apAppMeta.apAppType === EAPApp_Type.TEAM && businessGroupId === apAppMeta.appOwnerId) canManageApp = true;
      else if(apAppMeta.apAppType === EAPApp_Type.USER) {
        // it is a user app
        // check if ownerId has api consumer calculated roles in this business group
        // check the cache first
        const found = apiConsumer_OwnerIdList.find( (x) => {
          return x === apAppMeta.appOwnerId;
        });
        if(found) canManageApp = true;
        else {
          const hasApiConsumerRole: boolean = await this.hasUser_ApiConsumer_Role_In_BusinessGroup({
            organizationId: organizationId,
            businessGroupId: businessGroupId,
            userId: apAppMeta.appOwnerId
          });
          if(hasApiConsumerRole) {
            apiConsumer_OwnerIdList.push(apAppMeta.appOwnerId);
            canManageApp = true;
          }
        }
      }

      if(canManageApp) {
        const connectorAppResponse_smf: AppResponse = await this.apiGet_ConnectorAppResponse({
          organizationId: organizationId,
          apAppType: apAppMeta.apAppType,
          apTopicSyntax: 'smf',
          appId: connectorAppListItem.name,
          ownerId: apAppMeta.appOwnerId
        });
    
        // required to calculate the app status
        const apApp_ApiProduct_DisplayList: TAPDeveloperPortalAppApiProductDisplayList = await this.apiGet_ApDeveloperPortalAppApiProductDisplayList({
          organizationId: organizationId,
          ownerId: apAppMeta.appOwnerId,
          connectorAppResponse: connectorAppResponse_smf,
        });
  
        const apAdminPortalAppDisplay: TAPAdminPortalAppDisplay = this.create_ApAdminPortalAppDisplay_From_ApiEntities({
          apAppMeta: apAppMeta,
          connectorAppResponse_smf: connectorAppResponse_smf,
          connectorAppConnectionStatus: {},
          apApp_ApiProduct_DisplayList: apApp_ApiProduct_DisplayList,
          apApp_Api_DisplayList: [],
        });
        apAdminPortalAppDisplayList.push(apAdminPortalAppDisplay);  
      }
    }

    return apAdminPortalAppDisplayList;
  }

  /**
   * Get a list of user or team apps. Internal user / team or External user/team.
   * Includes:
   * - smf
   * - api products
   * Does not include:
   * - mqtt
   * - apis
   * - app status
   * @param param0 
   * @returns 
   */
  public apiGetList_ApAdminPortalAppDisplayList = async({ organizationId }: {
    organizationId: string;
  }): Promise<TAPAdminPortalAppDisplayList> => {
    const funcName = 'apiGetList_ApAdminPortalAppDisplayList';
    const logName = `${this.ComponentName}.${funcName}()`;

    const apAdminPortalAppDisplayList: TAPAdminPortalAppDisplayList = [];

    const connectorAppList: Array<AppListItem> = await AppsService.listApps({
      organizationName: organizationId, 
    });

    for(const connectorAppListItem of connectorAppList) {
      if(connectorAppListItem.name === undefined) throw new Error(`${logName}: connectorAppListItem.name === undefined`);

      const apAppMeta: TAPAppMeta = await this.create_ApAdminPortalAppDisplay_ApAppMeta({ 
        organizationId: organizationId, 
        connectorAppType: connectorAppListItem.appType,
        connectorOwnerId: connectorAppListItem.ownerId
      });

      const connectorAppResponse_smf: AppResponse = await this.apiGet_ConnectorAppResponse({
        organizationId: organizationId,
        apAppType: apAppMeta.apAppType,
        apTopicSyntax: 'smf',
        appId: connectorAppListItem.name,
        ownerId: apAppMeta.appOwnerId
      });
  
      // required to calculate the app status
      const apApp_ApiProduct_DisplayList: TAPDeveloperPortalAppApiProductDisplayList = await this.apiGet_ApDeveloperPortalAppApiProductDisplayList({
        organizationId: organizationId,
        ownerId: apAppMeta.appOwnerId,
        connectorAppResponse: connectorAppResponse_smf,
      });

      const apAdminPortalAppDisplay: TAPAdminPortalAppDisplay = this.create_ApAdminPortalAppDisplay_From_ApiEntities({
        apAppMeta: apAppMeta,
        connectorAppResponse_smf: connectorAppResponse_smf,
        connectorAppConnectionStatus: {},
        apApp_ApiProduct_DisplayList: apApp_ApiProduct_DisplayList,
        apApp_Api_DisplayList: [],
      });
      apAdminPortalAppDisplayList.push(apAdminPortalAppDisplay);
    }

    return apAdminPortalAppDisplayList;
  }

  public async apiDelete_ApDeveloperPortalUserAppDisplay({ organizationId, userId, appId }:{
    organizationId: string;
    userId: string;
    appId: string;
  }): Promise<void> {

    await AppsService.deleteDeveloperApp({
      organizationName: organizationId,
      developerUsername: userId,
      appName: appId
    });

  }
  
  public async apiUpdate_ApAdminPortalAppDisplay_ApAppApiProductDisplayList_Status({ organizationId, apAdminPortalAppDisplay, apDeveloperPortalAppApiProductDisplayList }:{
    organizationId: string;
    apAdminPortalAppDisplay: TAPAdminPortalAppDisplay;
    apDeveloperPortalAppApiProductDisplayList: TAPDeveloperPortalAppApiProductDisplayList;
  }): Promise<void> {
    this.set_ApApp_ApiProductDisplayList({ 
      apAppDisplay: apAdminPortalAppDisplay,
      apDeveloperPortalUserApp_ApiProductDisplayList: apDeveloperPortalAppApiProductDisplayList
    });

    const connectorAppApiProductList: Array<AppApiProductsComplex> = APDeveloperPortalAppApiProductsDisplayService.create_ConnectorApiProductList({
      apDeveloperPortalAppApiProductDisplayList: apDeveloperPortalAppApiProductDisplayList
    });

    const update: AppPatch = {
      apiProducts: connectorAppApiProductList,
    };

    await this.apiUpdate({
      organizationId: organizationId,
      appId: apAdminPortalAppDisplay.apEntityId.id,
      apAppMeta: apAdminPortalAppDisplay.apAppMeta,
      connectorAppPatch: update
    });

  }
  // public async apiUpdate_ApDeveloperPortalUserAppDisplay_AppApiProductDisplayList({ organizationId, apDeveloperPortalUserAppDisplay, apDeveloperPortalAppApiProductDisplayList }:{
  //   organizationId: string;
  //   apDeveloperPortalUserAppDisplay: TAPDeveloperPortalUserAppDisplay;
  //   apDeveloperPortalAppApiProductDisplayList: TAPDeveloperPortalAppApiProductDisplayList;
  // }): Promise<void> {
  //   // const funcName = 'apiUpdate_AppApiProductDisplayList';
  //   // const logName = `${this.ComponentName}.${funcName}()`;
  //   // test downstream error handling
  //   // throw new Error(`${logName}: test error handling`);

  //   const connectorAppApiProductList: Array<AppApiProductsComplex> = APDeveloperPortalAppApiProductsDisplayService.create_ConnectorApiProductList({
  //     apDeveloperPortalAppApiProductDisplayList: apDeveloperPortalAppApiProductDisplayList
  //   });
  //   const update: AppPatch = {
  //     apiProducts: connectorAppApiProductList,
  //   }

  //   // alert(`${logName}: update api product list, update=${JSON.stringify(update, null, 2)}`);

  //   await this.apiUpdate({
  //     organizationId: organizationId,
  //     appId: apDeveloperPortalUserAppDisplay.apEntityId.id,
  //     apAppMeta: apDeveloperPortalUserAppDisplay.apAppMeta,
  //     update: update
  //   });

  // }

}

export default new APAdminPortalAppsDisplayService();


