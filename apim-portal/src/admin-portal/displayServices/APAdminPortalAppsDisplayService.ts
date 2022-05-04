import { 
  ApiError,
  AppApiProducts,
  AppApiProductsComplex,
  AppConnectionStatus,
  AppListItem,
  AppPatch,
  AppResponse,
  AppResponseGeneric,
  AppsService,
  AppStatus,
} from '@solace-iot-team/apim-connector-openapi-browser';
import APDeveloperPortalAppApiProductsDisplayService, { 
  EAPApp_ApiProduct_Status,
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
  TAPOrganizationAppSettings, 
  TAPTopicSyntax
} from '../../displayServices/APAppsDisplayService/APAppsDisplayService';
import APBusinessGroupsDisplayService, { TAPBusinessGroupDisplay, TAPBusinessGroupDisplayList } from '../../displayServices/APBusinessGroupsDisplayService';
import APRbacDisplayService from '../../displayServices/APRbacDisplayService';
import APOrganizationUsersDisplayService, { 
  TAPCheckOrganizationUserIdExistsResult, TAPOrganizationUserDisplay, TAPOrganizationUserDisplayList
} from '../../displayServices/APUsersDisplayService/APOrganizationUsersDisplayService';
import { APClientConnectorOpenApi } from '../../utils/APClientConnectorOpenApi';
import { IAPEntityIdDisplay, TAPEntityIdList } from '../../utils/APEntityIdsService';
import APSearchContentService, { IAPSearchContent } from '../../utils/APSearchContentService';
import { Globals } from '../../utils/Globals';

export enum EAPAdminPortalApp_Status {
  UNKNOWN = "UNKNOWN",
  NO_API_PRODUCTS = "No API Products",
  LIVE = "live",
  APPROVAL_PENDING = "approval pending",
  APPROVAL_REVOKED = "approval revoked",
}

export type TAPAdminPortalAppDisplay_AllowedActions = TAPAppDisplay_AllowedActions & {
  // nothing to add for now
}
export type TAPAdminPortalAppDisplay = IAPAppDisplay & IAPSearchContent & {
  apAdminPortalAppStatus: EAPAdminPortalApp_Status;
}
/**
 * Display for list.
 */
export interface IAPAdminPortalAppListDisplay extends IAPEntityIdDisplay, IAPSearchContent {
  connectorAppListItem: AppListItem;
  apAppMeta: TAPAppMeta;
  apAdminPortalAppStatus: EAPAdminPortalApp_Status;
}
export type TAPAdminPortalAppListDisplayList = Array<IAPAdminPortalAppListDisplay>;

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

  private create_ApAdminPortalAppStatus({ connectorAppStatus, connectorAppApiProductList }:{
    connectorAppStatus?: AppStatus;
    connectorAppApiProductList?: AppApiProducts;
  }): EAPAdminPortalApp_Status {
    const funcName = 'create_ApAdminPortalAppStatus';
    const logName = `${this.ComponentName}.${funcName}()`;
    if(connectorAppStatus === undefined) throw new Error(`${logName}: connectorAppStatus === undefined`);

    if(connectorAppApiProductList === undefined || connectorAppApiProductList.length === 0) return EAPAdminPortalApp_Status.NO_API_PRODUCTS;

    // get the individual api products statuses
    const numTotal: number = connectorAppApiProductList.length;
    let numLive: number = 0;
    let numApprovalPending: number = 0;
    let numApprovalRevoked: number = 0;

    for(const connectorAppApiProduct of connectorAppApiProductList) {

      const apApp_ApiProduct_Status: EAPApp_ApiProduct_Status = APDeveloperPortalAppApiProductsDisplayService.create_ApApp_ApiProduct_Status({
        connectorAppStatus: connectorAppStatus,
        connectorAppApiProduct: connectorAppApiProduct
      });

      switch(apApp_ApiProduct_Status) {
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
          throw new Error(`${logName}: apApp_ApiProduct_Status === ${apApp_ApiProduct_Status}`);
        default:
          Globals.assertNever(logName, apApp_ApiProduct_Status);
      }

      // test error handling
      // throw new Error(`${logName}: test error handling`);

    }

    let apAdminPortalAppStatus: EAPAdminPortalApp_Status = EAPAdminPortalApp_Status.UNKNOWN;
    if(numTotal === 0) apAdminPortalAppStatus = EAPAdminPortalApp_Status.NO_API_PRODUCTS;
    else {
      // alert(`${logName}: numTotal=${numTotal}\nnumLive=${numLive}\nnumApprovalPending=${numApprovalPending}\nnumApprovalRevoked=${numApprovalRevoked}`);
      if(numLive === numTotal) apAdminPortalAppStatus = EAPAdminPortalApp_Status.LIVE;
      else if(numLive > 0) apAdminPortalAppStatus = EAPAdminPortalApp_Status.APPROVAL_PENDING;
      if(numLive === 0 && (numApprovalPending > 0 || numApprovalRevoked > 0) ) apAdminPortalAppStatus = EAPAdminPortalApp_Status.APPROVAL_PENDING;
    }
    return apAdminPortalAppStatus;
  }

  private create_ApAdminPortalAppListDisplay_From_ApiEntities({ apAppMeta, apAdminPortalApp_Status, connectorAppListItem }:{
    apAppMeta: TAPAppMeta;
    apAdminPortalApp_Status: EAPAdminPortalApp_Status;
    connectorAppListItem: AppListItem;
  }): IAPAdminPortalAppListDisplay {
    const funcName = 'create_ApAdminPortalAppListDisplay_From_ApiEntities';
    const logName = `${this.ComponentName}.${funcName}()`;
    if(connectorAppListItem.name === undefined) throw new Error(`${logName}: connectorAppListItem.name === undefined`);

    const apAdminPortalAppListDisplay: IAPAdminPortalAppListDisplay = {
      connectorAppListItem: connectorAppListItem,
      apEntityId: {
        id: connectorAppListItem.name,
        displayName: connectorAppListItem.displayName ? connectorAppListItem.displayName : connectorAppListItem.name
      },
      apAppMeta: apAppMeta,
      apAdminPortalAppStatus: apAdminPortalApp_Status,
      apSearchContent: '' 
    };
    return APSearchContentService.add_SearchContent<IAPAdminPortalAppListDisplay>(apAdminPortalAppListDisplay);
  }

  private create_ApAdminPortalAppDisplay_From_ApiEntities({ 
    apAppMeta, 
    apAdminPortalApp_Status,
    connectorAppResponse_smf,
    connectorAppResponse_mqtt,
    connectorAppConnectionStatus,
    apApp_ApiProduct_DisplayList,
    apApp_Api_DisplayList,
    apOrganizationAppSettings,
  }: {
    apAppMeta: TAPAppMeta;
    apAdminPortalApp_Status: EAPAdminPortalApp_Status;
    connectorAppResponse_smf: AppResponse;
    connectorAppResponse_mqtt?: AppResponse;
    connectorAppConnectionStatus: AppConnectionStatus;
    apApp_ApiProduct_DisplayList: TAPDeveloperPortalAppApiProductDisplayList;
    apApp_Api_DisplayList: TAPAppApiDisplayList;
    apOrganizationAppSettings: TAPOrganizationAppSettings;
  }): TAPAdminPortalAppDisplay {

    const apAppDisplay: IAPAppDisplay = this.create_ApAppDisplay_From_ApiEntities({
      apAppMeta: apAppMeta,
      connectorAppConnectionStatus: connectorAppConnectionStatus,
      connectorAppResponse_smf: connectorAppResponse_smf,
      connectorAppResponse_mqtt: connectorAppResponse_mqtt,
      apAppApiProductDisplayList: apApp_ApiProduct_DisplayList,
      apAppApiDisplayList: apApp_Api_DisplayList,
      apOrganizationAppSettings: apOrganizationAppSettings
    });

    const apAdminPortalAppDisplay: TAPAdminPortalAppDisplay = {
      ...apAppDisplay,
      apAdminPortalAppStatus: apAdminPortalApp_Status,
      apSearchContent: '',      
    };
    return APSearchContentService.add_SearchContent<TAPAdminPortalAppDisplay>(apAdminPortalAppDisplay);
  }

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

  /**
   * Checks if ownerId (team or user) is internal. 
   * If it is a user and it is internal, update the cache if provided.
   */
  private async apiCheck_isOwnerIdInternal({ organizationId, ownerId, apAppType, cache_ApOrganizationUserDisplayList, complete_ApOrganizationBusinessGroupDisplayList }:{
    apAppType: EAPApp_Type;
    ownerId?: string;
    organizationId: string;
    cache_ApOrganizationUserDisplayList?: TAPOrganizationUserDisplayList;
    complete_ApOrganizationBusinessGroupDisplayList?: TAPBusinessGroupDisplayList;
  }): Promise<boolean> {
    const funcName = 'apiCheck_isOwnerIdInternal';
    const logName = `${this.ComponentName}.${funcName}()`;
    if(ownerId === undefined) throw new Error(`${logName}: ownerId === undefined`);
    switch(apAppType) {
      case EAPApp_Type.USER:
        // console.log(`${logName}: looking for userId=${ownerId}`);
        // check cache if defined
        if(cache_ApOrganizationUserDisplayList !== undefined) {
          const cached_ApOrganizationUserDisplay: TAPOrganizationUserDisplay | undefined = cache_ApOrganizationUserDisplayList.find( (x) => {
            return x.apEntityId.id === ownerId;
          });
          if(cached_ApOrganizationUserDisplay !== undefined) return true;
        }
        // console.log(`${logName}: not in cache, userId=${ownerId}`);
        // not in cache
        const result: TAPCheckOrganizationUserIdExistsResult = await APOrganizationUsersDisplayService.apsCheck_OrganizationUserIdExists({ 
          organizationId: organizationId, 
          userId: ownerId,
          complete_ApOrganizationBusinessGroupDisplayList: complete_ApOrganizationBusinessGroupDisplayList
        });
        if(cache_ApOrganizationUserDisplayList !== undefined && result.existsInOrganization && result.apOrganizationUserDisplay !== undefined) {
          // add to cache
          cache_ApOrganizationUserDisplayList.push(result.apOrganizationUserDisplay);
        }
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

  /**
   * Makes a call 
   */
  private async create_ApAdminPortalAppDisplay_ApAppMeta({ organizationId, connectorAppType, connectorOwnerId, isOwnerInternal, cache_ApOrganizationUserDisplayList, complete_ApOrganizationBusinessGroupDisplayList }:{
    organizationId: string;
    connectorAppType?: AppResponseGeneric.appType;
    connectorOwnerId?: string;
    isOwnerInternal?: boolean;
    cache_ApOrganizationUserDisplayList?: TAPOrganizationUserDisplayList;
    connectorAppApiProductList: AppApiProducts;
    complete_ApOrganizationBusinessGroupDisplayList?: TAPBusinessGroupDisplayList;
  }): Promise<TAPAppMeta> {
    const funcName = 'create_ApAdminPortalAppDisplay_ApAppMeta';
    const logName = `${this.ComponentName}.${funcName}()`;
    if(connectorOwnerId === undefined) throw new Error(`${logName}: connectorOwnerId === undefined`);

    const apAppType: EAPApp_Type = this.map_ConnectorAppType_To_ApAppType({ connectorAppType: connectorAppType });
    if(isOwnerInternal === undefined) isOwnerInternal = await this.apiCheck_isOwnerIdInternal({ 
      organizationId: organizationId, 
      apAppType: apAppType, 
      ownerId: connectorOwnerId,
      cache_ApOrganizationUserDisplayList: cache_ApOrganizationUserDisplayList,
      complete_ApOrganizationBusinessGroupDisplayList: complete_ApOrganizationBusinessGroupDisplayList
    });
    // need it to determined business group display name if a team app
    let appOwnerDisplayName: string = connectorOwnerId;
    if(apAppType === EAPApp_Type.TEAM && isOwnerInternal) {
      if(complete_ApOrganizationBusinessGroupDisplayList === undefined) {
        // get the organization business group list
        complete_ApOrganizationBusinessGroupDisplayList = await APBusinessGroupsDisplayService.apsGetList_ApBusinessGroupSystemDisplayList({
          organizationId: organizationId
        });  
      }
      const apOrganizationBusinessGroupDisplay: TAPBusinessGroupDisplay | undefined = complete_ApOrganizationBusinessGroupDisplayList.find( (x) => {
        return x.apEntityId.id === connectorOwnerId;
      });
      if(apOrganizationBusinessGroupDisplay === undefined) throw new Error(`${logName}: apOrganizationBusinessGroupDisplay === undefined`);
      if(apOrganizationBusinessGroupDisplay.apExternalReference !== undefined) appOwnerDisplayName = apOrganizationBusinessGroupDisplay.apExternalReference.displayName;
      else appOwnerDisplayName = apOrganizationBusinessGroupDisplay.apEntityId.displayName;
    }
  
    return {
      apAppType: apAppType,
      apAppOwnerType: isOwnerInternal ? EAPApp_OwnerType.INTERNAL : EAPApp_OwnerType.EXTERNAL,
      appOwnerId: connectorOwnerId,
      appOwnerDisplayName: appOwnerDisplayName
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

  public apiGet_ApAdminPortalAppDisplay = async({ organizationId, appId, apOrganizationAppSettings }:{
    organizationId: string;
    appId: string;
    apOrganizationAppSettings: TAPOrganizationAppSettings;
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
      connectorOwnerId: connectorAppResponseGeneric.ownerId,
      connectorAppApiProductList: connectorAppResponseGeneric.apiProducts
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
      apAdminPortalApp_Status: this.create_ApAdminPortalAppStatus({ connectorAppStatus: connectorAppResponse_smf.status, connectorAppApiProductList: connectorAppResponse_smf.apiProducts }),
      connectorAppResponse_smf: connectorAppResponse_smf,
      connectorAppResponse_mqtt: connectorAppResponse_mqtt,
      connectorAppConnectionStatus: connectorAppConnectionStatus,
      apApp_ApiProduct_DisplayList: apAppApiProductDisplayList,
      apApp_Api_DisplayList: apAppApiDisplayList,
      apOrganizationAppSettings: apOrganizationAppSettings
    });

    return apAdminPortalAppDisplay;

  }

  /**
   * Returns the entityId list of business group / team apps.
   * If team does not exist, returns empty list
   */
  public apiGetList_TeamAppEntityIdList = async({ organizationId, teamId }: {
    organizationId: string;
    teamId: string;
  }): Promise<TAPEntityIdList> => {
    try {
      const connectorTeamAppList: Array<AppResponse> = await AppsService.listTeamApps({
        organizationName: organizationId, 
        teamName: teamId
      });
      const list: TAPEntityIdList = connectorTeamAppList.map( (x) => {
        return {
          id: x.name,
          displayName: x.displayName ? x.displayName : x.name
        };
      });  
      return list;
    } catch(e: any) {
      if(APClientConnectorOpenApi.isInstanceOfApiError(e)) {
        const apiError: ApiError = e;
        if(apiError.status === 404) return [];
      }
      throw e;
    }
  }

  /**
   * Create a list of apps:
   * - if loggedIn user can manage external apps, include also external apps
   * - otherwise: only internal apps
   */
  public apiGetList_ApAdminPortalAppListDisplayList_For_Organization = async({ organizationId, loggedInUser_BusinessGroupRoleEntityIdList }: {
    organizationId: string;
    loggedInUser_BusinessGroupRoleEntityIdList: TAPEntityIdList;
  }): Promise<TAPAdminPortalAppListDisplayList> => {
    const funcName = 'apiGetList_ApAdminPortalAppListDisplayList_For_Organization';
    const logName = `${this.ComponentName}.${funcName}()`;

    // get the complete apBusinessGroupDisplayList once
    const complete_ApOrganizationBusinessGroupDisplayList: TAPBusinessGroupDisplayList = await APBusinessGroupsDisplayService.apsGetList_ApBusinessGroupSystemDisplayList({
      organizationId: organizationId
    });  

    // get the access levels
    const canManage_ExternalApps: boolean = APRbacDisplayService.hasAccess_BusinessGroupRoleEntityIdList_ManageAppAccess_For_External_Apps({
      businessGroupRoleEntityIdList: loggedInUser_BusinessGroupRoleEntityIdList
    });

    // keep a cache of known (internal) and not known(external) ownerIds
    const cache_Internal_OwnerIdList: Array<string> = [];
    const cache_External_OwnerIdList: Array<string> = [];
    // keep a cache for internal user details
    const cache_ApOrganizationUserDisplayList: TAPOrganizationUserDisplayList = [];

    const apAdminPortalAppListDisplayList: TAPAdminPortalAppListDisplayList = [];

    const connectorAppList: Array<AppListItem> = await AppsService.listApps({
      organizationName: organizationId, 
    });

    for(const connectorAppListItem of connectorAppList) {
      if(connectorAppListItem.name === undefined) throw new Error(`${logName}: connectorAppListItem.name === undefined`);
      if(connectorAppListItem.ownerId === undefined) throw new Error(`${logName}: connectorAppListItem.ownerId === undefined`);
      
      // check if ownerId is known (internal) or not known (external)
      let isOwnerInternal: boolean = false;
      const foundAppOwnerIdInternal = cache_Internal_OwnerIdList.find( (x) => {
        return x === connectorAppListItem.ownerId;
      });
      if(foundAppOwnerIdInternal !== undefined) isOwnerInternal = true;
      else {
        // check in cache if external
        const foundAppOwnerIdExternal = cache_External_OwnerIdList.find( (x) => {
          return x === connectorAppListItem.ownerId;
        });
        if(foundAppOwnerIdExternal !== undefined) isOwnerInternal = false;
        else {
          // check & add to correct cache
          isOwnerInternal = await this.apiCheck_isOwnerIdInternal({ 
            organizationId: organizationId, 
            apAppType: this.map_ConnectorAppType_To_ApAppType({ connectorAppType: connectorAppListItem.appType }), 
            ownerId: connectorAppListItem.ownerId,
            cache_ApOrganizationUserDisplayList: cache_ApOrganizationUserDisplayList,
            complete_ApOrganizationBusinessGroupDisplayList: complete_ApOrganizationBusinessGroupDisplayList
          });
          if(isOwnerInternal) cache_Internal_OwnerIdList.push(connectorAppListItem.ownerId);
          else cache_External_OwnerIdList.push(connectorAppListItem.ownerId);
        }  
      }

      const apAppMeta: TAPAppMeta = await this.create_ApAdminPortalAppDisplay_ApAppMeta({ 
        organizationId: organizationId, 
        connectorAppType: connectorAppListItem.appType,
        connectorOwnerId: connectorAppListItem.ownerId,
        isOwnerInternal: isOwnerInternal,
        cache_ApOrganizationUserDisplayList: cache_ApOrganizationUserDisplayList,
        connectorAppApiProductList: connectorAppListItem.apiProducts ? connectorAppListItem.apiProducts : [],
        complete_ApOrganizationBusinessGroupDisplayList: complete_ApOrganizationBusinessGroupDisplayList
      });

      let canManageApp: boolean = false;
      // external user or team apps 
      if(apAppMeta.apAppOwnerType === EAPApp_OwnerType.EXTERNAL && canManage_ExternalApps) canManageApp = true;
      // it is an internal app
      else canManageApp = true;

      if(canManageApp) {
        // add the app to list 
        const apAdminPortalAppListDisplay: IAPAdminPortalAppListDisplay = this.create_ApAdminPortalAppListDisplay_From_ApiEntities({
          apAppMeta: apAppMeta,
          connectorAppListItem: connectorAppListItem,
          apAdminPortalApp_Status: this.create_ApAdminPortalAppStatus({
            connectorAppApiProductList: connectorAppListItem.apiProducts,
            connectorAppStatus: connectorAppListItem.status
          }),
        });
        apAdminPortalAppListDisplayList.push(apAdminPortalAppListDisplay);
      }

    }

    return apAdminPortalAppListDisplayList;
  }


  /**
   * Create a list of IAPAdminPortalAppListDisplay objects with RBAC rules applied.
   * - if user is allowed to manage external apps: include them
   * - if owner of internal app belongs to the business group with API Consumer role: include them
   */
  public apiGetList_ApAdminPortalAppListDisplayList_For_BusinessGroup = async({ organizationId, businessGroupId, loggedInUser_BusinessGroupRoleEntityIdList }: {
    organizationId: string;
    businessGroupId: string;
    loggedInUser_BusinessGroupRoleEntityIdList: TAPEntityIdList;
  }): Promise<TAPAdminPortalAppListDisplayList> => {
    const funcName = 'apiGetList_ApAdminPortalAppListDisplayList_For_BusinessGroup';
    const logName = `${this.ComponentName}.${funcName}()`;

    // get the complete apBusinessGroupDisplayList once
    const complete_ApOrganizationBusinessGroupDisplayList: TAPBusinessGroupDisplayList = await APBusinessGroupsDisplayService.apsGetList_ApBusinessGroupSystemDisplayList({
      organizationId: organizationId
    });  

    // get the access levels
    const canManage_ExternalApps: boolean = APRbacDisplayService.hasAccess_BusinessGroupRoleEntityIdList_ManageAppAccess_For_External_Apps({
      businessGroupRoleEntityIdList: loggedInUser_BusinessGroupRoleEntityIdList
    });

    // keep a cache of known (internal) and not known(external) ownerIds
    const cache_Internal_OwnerIdList: Array<string> = [];
    const cache_External_OwnerIdList: Array<string> = [];
    // keep a cache of ownerIds which have Api consumer role in business group ==> user can manage apps for these owners
    const cache_CanManageApps_For_OwnerIdList: Array<string> = [];
    const cache_CannotManageApps_For_OwnerIdList: Array<string> = [];
    // keep a cache for internal user details
    const cache_ApOrganizationUserDisplayList: TAPOrganizationUserDisplayList = [];

    const apAdminPortalAppListDisplayList: TAPAdminPortalAppListDisplayList = [];

    const connectorAppList: Array<AppListItem> = await AppsService.listApps({
      organizationName: organizationId, 
    });

    for(const connectorAppListItem of connectorAppList) {
      if(connectorAppListItem.name === undefined) throw new Error(`${logName}: connectorAppListItem.name === undefined`);
      if(connectorAppListItem.ownerId === undefined) throw new Error(`${logName}: connectorAppListItem.ownerId === undefined`);
      
      // check if ownerId is known (internal) or not known (external)
      let isOwnerInternal: boolean = false;
      const foundAppOwnerIdInternal = cache_Internal_OwnerIdList.find( (x) => {
        return x === connectorAppListItem.ownerId;
      });
      if(foundAppOwnerIdInternal !== undefined) isOwnerInternal = true;
      else {
        // check in cache if external
        const foundAppOwnerIdExternal = cache_External_OwnerIdList.find( (x) => {
          return x === connectorAppListItem.ownerId;
        });
        if(foundAppOwnerIdExternal !== undefined) isOwnerInternal = false;
        else {
          // check & add to correct cache
          isOwnerInternal = await this.apiCheck_isOwnerIdInternal({ 
            organizationId: organizationId, 
            apAppType: this.map_ConnectorAppType_To_ApAppType({ connectorAppType: connectorAppListItem.appType }), 
            ownerId: connectorAppListItem.ownerId,
            cache_ApOrganizationUserDisplayList: cache_ApOrganizationUserDisplayList,
            complete_ApOrganizationBusinessGroupDisplayList: complete_ApOrganizationBusinessGroupDisplayList
          });
          if(isOwnerInternal) cache_Internal_OwnerIdList.push(connectorAppListItem.ownerId);
          else cache_External_OwnerIdList.push(connectorAppListItem.ownerId);
        }  
      }

      const apAppMeta: TAPAppMeta = await this.create_ApAdminPortalAppDisplay_ApAppMeta({ 
        organizationId: organizationId, 
        connectorAppType: connectorAppListItem.appType,
        connectorOwnerId: connectorAppListItem.ownerId,
        isOwnerInternal: isOwnerInternal,
        cache_ApOrganizationUserDisplayList: cache_ApOrganizationUserDisplayList,
        connectorAppApiProductList: connectorAppListItem.apiProducts ? connectorAppListItem.apiProducts : [],
        complete_ApOrganizationBusinessGroupDisplayList: complete_ApOrganizationBusinessGroupDisplayList
      });

      // determine if user is allowed to manage the app
      let canManageApp: boolean = false;
      // external user or team apps 
      if(apAppMeta.apAppOwnerType === EAPApp_OwnerType.EXTERNAL) {
        if(canManage_ExternalApps) canManageApp = true;
        else canManageApp = false;
      }
      // not external, team apps in this business group
      else if(apAppMeta.apAppType === EAPApp_Type.TEAM && businessGroupId === apAppMeta.appOwnerId) canManageApp = true;
      else if(apAppMeta.apAppType === EAPApp_Type.USER) {
        // it is a user app
        // check if ownerId has api consumer calculated roles in this business group
        // check the cache first
        const found_can: string | undefined = cache_CanManageApps_For_OwnerIdList.find( (x) => {
          return x === apAppMeta.appOwnerId;
        });
        if(found_can !== undefined) canManageApp = true;
        else {
          const found_cannot: string | undefined = cache_CannotManageApps_For_OwnerIdList.find( (x) => {
            return x === apAppMeta.appOwnerId;
          });
          if(found_cannot !== undefined) canManageApp = false;
          else {
            // get the details from the cache
            const apOrganizationUserDisplay: TAPOrganizationUserDisplay | undefined = cache_ApOrganizationUserDisplayList.find( (x) => {
              return x.apEntityId.id === apAppMeta.appOwnerId;
            });
            if(apOrganizationUserDisplay === undefined) throw new Error(`${logName}: apOrganizationUserDisplay === undefined, apAppMeta=${JSON.stringify(apAppMeta)}`);        
            const canManageAppsForOwnerId: boolean = APRbacDisplayService.canManage_UserApp_In_BusinessGroup({
              organizationId: organizationId,
              businessGroupId: businessGroupId,
              apOrganizationUserDisplay: apOrganizationUserDisplay,
            });
  
            if(canManageAppsForOwnerId) {
              cache_CanManageApps_For_OwnerIdList.push(apAppMeta.appOwnerId);
              canManageApp = true;
            } else {
              cache_CannotManageApps_For_OwnerIdList.push(apAppMeta.appOwnerId);
              canManageApp = false;
            }
          }  
        }
      }

      if(canManageApp) {
        // add the app to list 
        const apAdminPortalAppListDisplay: IAPAdminPortalAppListDisplay = this.create_ApAdminPortalAppListDisplay_From_ApiEntities({
          apAppMeta: apAppMeta,
          connectorAppListItem: connectorAppListItem,
          apAdminPortalApp_Status: this.create_ApAdminPortalAppStatus({
            connectorAppApiProductList: connectorAppListItem.apiProducts,
            connectorAppStatus: connectorAppListItem.status
          }),
        });
        apAdminPortalAppListDisplayList.push(apAdminPortalAppListDisplay);
      }
    }

    return apAdminPortalAppListDisplayList;
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

    // set to app to approved, apiProducts list is correctly set here
    const update: AppPatch = {
      status: AppStatus.APPROVED,
      apiProducts: connectorAppApiProductList,
    };

    await this.apiUpdate({
      organizationId: organizationId,
      appId: apAdminPortalAppDisplay.apEntityId.id,
      apAppMeta: apAdminPortalAppDisplay.apAppMeta,
      connectorAppPatch: update
    });

  }

}

export default new APAdminPortalAppsDisplayService();


