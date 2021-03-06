import { DataTableSortOrderType } from 'primereact/datatable';
import APEntityIdsService, { 
  TAPEntityId, 
  TAPEntityIdList 
} from '../../utils/APEntityIdsService';
import { APSClientOpenApi } from '../../utils/APSClientOpenApi';
import { Globals } from '../../utils/Globals';
import { 
  ApiError,
  APSBusinessGroupAuthRoleList,
  APSListResponseMeta, 
  APSMemberOfBusinessGroup, 
  APSMemberOfOrganizationGroups, 
  APSMemberOfOrganizationGroupsList, 
  APSOrganizationAuthRoleList, 
  APSOrganizationRoles, 
  APSOrganizationRolesList, 
  APSOrganizationRolesResponse, 
  APSSystemAuthRoleList, 
  APSUserCreate, 
  APSUserProfile, 
  APSUserResponse, 
  ApsUsersService, 
  APSUserUpdate, 
  ListApsUsersResponse 
} from '../../_generated/@solace-iot-team/apim-server-openapi-browser';
import APAssetDisplayService, { 
  TAPOrganizationAssetInfoDisplayList 
} from '../APAssetsDisplayService';
import APBusinessGroupsDisplayService, { 
  TAPBusinessGroupDisplay,
  TAPBusinessGroupDisplayList 
} from '../APBusinessGroupsDisplayService';
import APDisplayUtils from '../APDisplayUtils';
import { APLegacyOrganizationRoles } from './APLegacyOrganizationRoles';
import APMemberOfService, { 
  TAPMemberOfBusinessGroupDisplay, 
  TAPMemberOfBusinessGroupDisplayList, 
  TAPMemberOfOrganizationDisplay 
} from './APMemberOfService';
import { TAPSystemUserDisplay } from './APSystemUsersDisplayService';
import { 
  APUsersDisplayService, 
  IAPUserDisplay,
  TAPUserAuthenticationDisplay,
  TAPUserProfileDisplay,
} from './APUsersDisplayService';

/**
 * Organization user memberOf information.
 */
export type TAPOrganizationUserMemberOfOrganizationDisplay = TAPMemberOfOrganizationDisplay & {
  /** source for view, create, update and for generating tree node lists */
  apMemberOfBusinessGroupDisplayList: TAPMemberOfBusinessGroupDisplayList;
}
export type TAPOrganizationUserDisplay = IAPUserDisplay & {
  organizationEntityId: TAPEntityId;
  memberOfOrganizationDisplay: TAPOrganizationUserMemberOfOrganizationDisplay;
  readonly completeOrganizationBusinessGroupDisplayList?: TAPBusinessGroupDisplayList;
  readonly organizationAssetInfoDisplayList?: TAPOrganizationAssetInfoDisplayList;
}
export type TAPOrganizationUserDisplayList = Array<TAPOrganizationUserDisplay>;
export type TAPOrganizationUserDisplayListResponse = APSListResponseMeta & {
  apOrganizationUserDisplayList: TAPOrganizationUserDisplayList;
}
/**
 * apOrganizationUserDisplay is set if existsInOrganization === true
 */
export type TAPCheckOrganizationUserIdExistsResult = {
  existsInOrganization: boolean;
  exists: boolean;
  apOrganizationUserDisplay?: TAPOrganizationUserDisplay;
}

class APOrganizationUsersDisplayService extends APUsersDisplayService {
  private readonly ComponentName = "APOrganizationUsersDisplayService";

    /**
   * @todo FUTURE: change setting the roles twice once server caught up
   */
  private apply_ApMemberOfOrganizationDisplay({ apOrganizationUserDisplay, apMemberOfOrganizationDisplay }: {
    apOrganizationUserDisplay: TAPOrganizationUserDisplay;
    apMemberOfOrganizationDisplay: TAPMemberOfOrganizationDisplay;    
  }): TAPOrganizationUserDisplay {
    const funcName = 'apply_ApMemberOfOrganizationDisplay';
    const logName = `${this.ComponentName}.${funcName}()`;
    // find the root business group
    // TODO: FUTURE: no need to set the root roles in future
    const apMemberOfBusinessGroupDisplay: TAPMemberOfBusinessGroupDisplay | undefined = apOrganizationUserDisplay.memberOfOrganizationDisplay.apMemberOfBusinessGroupDisplayList.find( (x) => {
      return x.apBusinessGroupDisplay.apBusinessGroupParentEntityId === undefined;
    });
    if(apMemberOfBusinessGroupDisplay === undefined) throw new Error(`${logName}: apMemberOfBusinessGroupDisplay === undefined`);
    // set the roles in the root business group
    // TODO: FUTURE: not required
    apMemberOfBusinessGroupDisplay.apConfiguredBusinessGroupRoleEntityIdList = apMemberOfOrganizationDisplay.apOrganizationRoleEntityIdList;
    // set the organization roles 
    apOrganizationUserDisplay.memberOfOrganizationDisplay.apOrganizationRoleEntityIdList = apMemberOfOrganizationDisplay.apOrganizationRoleEntityIdList;

    return apOrganizationUserDisplay;
  }

  /**
   * @todo FUTURE: no need to set the root group roles
   */
   private apply_ApMemberOfBusinessGroupDisplayList({ apOrganizationUserDisplay, apMemberOfBusinessGroupDisplayList }:{
    apOrganizationUserDisplay: TAPOrganizationUserDisplay;
    apMemberOfBusinessGroupDisplayList: TAPMemberOfBusinessGroupDisplayList;
  }): TAPOrganizationUserDisplay {
    const funcName = 'apply_ApMemberOfBusinessGroupDisplayList';
    const logName = `${this.ComponentName}.${funcName}()`;

    // find the root business group
    // TODO: FUTURE: no need to set the root roles in future
    const root_apMemberOfBusinessGroupDisplay: TAPMemberOfBusinessGroupDisplay | undefined = apOrganizationUserDisplay.memberOfOrganizationDisplay.apMemberOfBusinessGroupDisplayList.find( (x) => {
      return x.apBusinessGroupDisplay.apBusinessGroupParentEntityId === undefined;
    });
    if(root_apMemberOfBusinessGroupDisplay === undefined) throw new Error(`${logName}: root_apMemberOfBusinessGroupDisplay === undefined`);
    // set the roles in the root business group
    // TODO: FUTURE: not required
    root_apMemberOfBusinessGroupDisplay.apConfiguredBusinessGroupRoleEntityIdList = apOrganizationUserDisplay.memberOfOrganizationDisplay.apOrganizationRoleEntityIdList;

    // set the list
    apOrganizationUserDisplay.memberOfOrganizationDisplay.apMemberOfBusinessGroupDisplayList = apMemberOfBusinessGroupDisplayList;

    return apOrganizationUserDisplay;
  }

  private create_new_ApsMemberOfOrganizationGroupsList({ apOrganizationUserDisplay }:{
    apOrganizationUserDisplay: TAPOrganizationUserDisplay;
  }): APSMemberOfOrganizationGroupsList {

    const apsMemberOfBusinessGroupList: Array<APSMemberOfBusinessGroup> = [];
    for(const apMemberOfBusinessGroupDisplay of apOrganizationUserDisplay.memberOfOrganizationDisplay.apMemberOfBusinessGroupDisplayList) {
      const apsMemberOfBusinessGroup: APSMemberOfBusinessGroup = {
        businessGroupId: apMemberOfBusinessGroupDisplay.apBusinessGroupDisplay.apEntityId.id,
        roles: APEntityIdsService.create_IdList(apMemberOfBusinessGroupDisplay.apConfiguredBusinessGroupRoleEntityIdList) as APSBusinessGroupAuthRoleList,
      };
      apsMemberOfBusinessGroupList.push(apsMemberOfBusinessGroup);
    }
    const apsMemberOfOrganizationGroups: APSMemberOfOrganizationGroups = {
      organizationId: apOrganizationUserDisplay.organizationEntityId.id,
      memberOfBusinessGroupList: apsMemberOfBusinessGroupList,
    };
    return [apsMemberOfOrganizationGroups];
  }

  /**
   * @todo FUTURE: change to not async once API has changed to update roles for 1 organization
   */
  private async create_update_ApsMemberOfOrganizationGroupsList({ apOrganizationUserDisplay }:{
    apOrganizationUserDisplay: TAPOrganizationUserDisplay;
  }): Promise<APSMemberOfOrganizationGroupsList> {
    const funcName = 'create_update_ApsMemberOfOrganizationGroupsList';
    const logName = `${this.ComponentName}.${funcName}()`;

    // check that UI has set this correctly
    // alert(`${logName}: apOrganizationUserDisplay.memberOfOrganizationDisplay = ${JSON.stringify(apOrganizationUserDisplay.memberOfOrganizationDisplay, null, 2)}`);
    
    // TODO: workaround: get the user with all the organizations
    // FUTURE: API will provide a call to only update business group roles for 1 organization, so no need to get them all here
    const apsUserResponse: APSUserResponse = await ApsUsersService.getApsUser({
      userId: apOrganizationUserDisplay.apEntityId.id,
    });
    // create artificial entry:
    // - user may not be member of any org yet
    // - user may not be member of this org yet
    const x_apsMemberOfOrganizationGroups: APSMemberOfOrganizationGroups | undefined = apsUserResponse.memberOfOrganizationGroups.find( (x) => {
      return x.organizationId === apOrganizationUserDisplay.organizationEntityId.id;
    });
    if(apsUserResponse.memberOfOrganizationGroups.length === 0 || x_apsMemberOfOrganizationGroups === undefined) {
      // user is not member of any organization, create here the empty entry for this org
      const apsMemberOfBusinessGroup: APSMemberOfBusinessGroup = {
        businessGroupId: apOrganizationUserDisplay.organizationEntityId.id,
        roles: [] 
      };
      apsUserResponse.memberOfOrganizationGroups.push({
        organizationId: apOrganizationUserDisplay.organizationEntityId.id,
        memberOfBusinessGroupList: [apsMemberOfBusinessGroup]
      });
    }
    // find by org 
    const apsMemberOfOrganizationGroups: APSMemberOfOrganizationGroups | undefined = apsUserResponse.memberOfOrganizationGroups.find( (x) => {
      return x.organizationId === apOrganizationUserDisplay.organizationEntityId.id;
    });
    if(apsMemberOfOrganizationGroups === undefined) throw new Error(`${logName}: apsMemberOfOrganizationGroups === undefined`);
    
    const new_memberOfBusinessGroupList: Array<APSMemberOfBusinessGroup> = [];
    for(const apMemberOfBusinessGroupDisplay of apOrganizationUserDisplay.memberOfOrganizationDisplay.apMemberOfBusinessGroupDisplayList) {
      const apsMemberOfBusinessGroup: APSMemberOfBusinessGroup = {
        businessGroupId: apMemberOfBusinessGroupDisplay.apBusinessGroupDisplay.apEntityId.id,
        roles: APEntityIdsService.create_IdList(apMemberOfBusinessGroupDisplay.apConfiguredBusinessGroupRoleEntityIdList) as APSBusinessGroupAuthRoleList,
      }
      new_memberOfBusinessGroupList.push(apsMemberOfBusinessGroup);
    }
    // replace
    apsMemberOfOrganizationGroups.memberOfBusinessGroupList = new_memberOfBusinessGroupList;
    return apsUserResponse.memberOfOrganizationGroups;
  }

  /**
   * @todo FUTURE: change to not async once API has changed to update roles for 1 organization
   */
   private async create_ApsOrganizationRolesList({ apOrganizationUserDisplay }:{
    apOrganizationUserDisplay: TAPOrganizationUserDisplay;
  }): Promise<APSOrganizationRolesList> {
    const funcName = 'create_ApsOrganizationRolesList';
    const logName = `${this.ComponentName}.${funcName}()`;
    // TODO: workaround: get the user with all the organizations
    // FUTURE: API will provide a call to only update roles for 1 organization, so no need to get them all here
    const apsUserResponse: APSUserResponse = await ApsUsersService.getApsUser({
      userId: apOrganizationUserDisplay.apEntityId.id,
    });
    // find by org
    const apsOrganizationRolesResponse: APSOrganizationRolesResponse | undefined = apsUserResponse.memberOfOrganizations.find( (x) => {
      return x.organizationId === apOrganizationUserDisplay.organizationEntityId.id;
    });
    if(apsOrganizationRolesResponse === undefined) throw new Error(`${logName}: apsOrganizationRolesResponse === undefined`);
    // replace
    apsOrganizationRolesResponse.roles = APEntityIdsService.create_IdList(apOrganizationUserDisplay.memberOfOrganizationDisplay.apOrganizationRoleEntityIdList) as APSOrganizationAuthRoleList;
    return apsUserResponse.memberOfOrganizations;
  }

  public create_MemberOfBusinessGroupEntityIdList({apOrganizationUserMemberOfOrganizationDisplay}: {
    apOrganizationUserMemberOfOrganizationDisplay: TAPOrganizationUserMemberOfOrganizationDisplay;
  }): TAPEntityIdList {
    return apOrganizationUserMemberOfOrganizationDisplay.apMemberOfBusinessGroupDisplayList.map( (apMemberOfBusinessGroupDisplay: TAPMemberOfBusinessGroupDisplay) => {
      return apMemberOfBusinessGroupDisplay.apBusinessGroupDisplay.apEntityId;
    });
  }

  /**
   * Create empty business group list. Adds the root business group to the list with empty roles.
   */
  private create_Empty_ApMemberOfBusinessGroupDisplayList({ apCompleteBusinessGroupDisplayList }:{
    apCompleteBusinessGroupDisplayList: TAPBusinessGroupDisplayList;
  }): TAPMemberOfBusinessGroupDisplayList {
    const root: TAPBusinessGroupDisplay = APBusinessGroupsDisplayService.find_root_ApBusinessGroupDisplay({ completeApOrganizationBusinessGroupDisplayList: apCompleteBusinessGroupDisplayList });
    const list: TAPMemberOfBusinessGroupDisplayList = [{
      apBusinessGroupDisplay: root,
      apConfiguredBusinessGroupRoleEntityIdList: [],
      apCalculatedBusinessGroupRoleEntityIdList: [],
    }];
    return list;
  }

  private create_Empty_ApOrganizationUserMemberOfOrganizationDisplay({ organizationEntityId, apCompleteBusinessGroupDisplayList }:{
    organizationEntityId: TAPEntityId;
    apCompleteBusinessGroupDisplayList: TAPBusinessGroupDisplayList;
  }): TAPOrganizationUserMemberOfOrganizationDisplay {
    const base = APMemberOfService.create_Empty_ApMemberOfOrganizationDisplay({ organizationEntityId: organizationEntityId });
    const apOrganizationUserMemberOfOrganizationDisplay: TAPOrganizationUserMemberOfOrganizationDisplay = {
      ...base,
      apMemberOfBusinessGroupDisplayList: this.create_Empty_ApMemberOfBusinessGroupDisplayList({
        apCompleteBusinessGroupDisplayList: apCompleteBusinessGroupDisplayList
      })
    };
    return apOrganizationUserMemberOfOrganizationDisplay;
  }

  public async create_Empty_ApOrganizationUserDisplay({organizationEntityId}: {
    organizationEntityId: TAPEntityId;
  }): Promise<TAPOrganizationUserDisplay> {

    const apCompleteBusinessGroupDisplayList: TAPBusinessGroupDisplayList = await APBusinessGroupsDisplayService.apsGetList_ApBusinessGroupSystemDisplayList({
      organizationId: organizationEntityId.id,
    });

    const base: IAPUserDisplay = super.create_Empty_ApUserDisplay();
    const apOrganizationUserDisplay: TAPOrganizationUserDisplay = {
      ...base,
      organizationEntityId: organizationEntityId,
      memberOfOrganizationDisplay: this.create_Empty_ApOrganizationUserMemberOfOrganizationDisplay({
        organizationEntityId: organizationEntityId,
        apCompleteBusinessGroupDisplayList: apCompleteBusinessGroupDisplayList
      }),
      completeOrganizationBusinessGroupDisplayList: apCompleteBusinessGroupDisplayList,
    }
    return apOrganizationUserDisplay;    
  }

  public async create_ApOrganizationUserDisplay_From_ApSystemUserDisplay({ organizationEntityId, apSystemUserDisplay }:{
    organizationEntityId: TAPEntityId;
    apSystemUserDisplay: TAPSystemUserDisplay;
  }): Promise<TAPOrganizationUserDisplay> {
    
    const created: TAPOrganizationUserDisplay = await this.create_Empty_ApOrganizationUserDisplay({ 
      organizationEntityId: organizationEntityId,
    });

    this.set_ApUserProfileDisplay({ 
      apUserDisplay: created,
      apUserProfileDisplay: apSystemUserDisplay.apUserProfileDisplay
    });

    return created;
  }

  /**
   * Create organization roles and business group / roles tree.
   */
  private create_ApOrganizationUserMemberOfOrganizationDisplay({organizationEntityId, apsUserResponse, completeApOrganizationBusinessGroupDisplayList}:{
    organizationEntityId: TAPEntityId;
    apsUserResponse: APSUserResponse;
    completeApOrganizationBusinessGroupDisplayList: TAPBusinessGroupDisplayList;
  }): TAPOrganizationUserMemberOfOrganizationDisplay {

    const base: TAPMemberOfOrganizationDisplay = APMemberOfService.create_ApMemberOfOrganizationDisplay({ 
      organizationEntityId: organizationEntityId,
      apsUserResponse: apsUserResponse,
      completeApOrganizationBusinessGroupDisplayList: completeApOrganizationBusinessGroupDisplayList,
    });

    const apMemberOfBusinessGroupDisplayList: TAPMemberOfBusinessGroupDisplayList = APMemberOfService.create_ApMemberOfBusinessGroupDisplayList({
      organizationEntityId: organizationEntityId,
      apsUserResponse: apsUserResponse,
      completeApOrganizationBusinessGroupDisplayList: completeApOrganizationBusinessGroupDisplayList,
    });

    const apOrganizationUserMemberOfOrganizationDisplay: TAPOrganizationUserMemberOfOrganizationDisplay = {
      ...base,
      apMemberOfBusinessGroupDisplayList: apMemberOfBusinessGroupDisplayList,
    }
    return apOrganizationUserMemberOfOrganizationDisplay;
  }
  
  private async create_ApOrganizationUserDisplay_From_ApiEntities({
    organizationEntityId, 
    apsUserResponse,
    completeApOrganizationBusinessGroupDisplayList,
    fetch_ApOrganizationAssetInfoDisplayList,
  }: {
    organizationEntityId: TAPEntityId;
    apsUserResponse: APSUserResponse;
    completeApOrganizationBusinessGroupDisplayList: TAPBusinessGroupDisplayList;
    fetch_ApOrganizationAssetInfoDisplayList?: boolean;
  }): Promise<TAPOrganizationUserDisplay> {

    // get user asset list if required
    let apOrganizationAssetInfoDisplayList: TAPOrganizationAssetInfoDisplayList | undefined = undefined;
    if(fetch_ApOrganizationAssetInfoDisplayList !== undefined && fetch_ApOrganizationAssetInfoDisplayList) {
      apOrganizationAssetInfoDisplayList = await APAssetDisplayService.getApAssetInfoListForUser({
        organizationEntityIdList: [organizationEntityId],
        userId: apsUserResponse.userId
      });
    }

    const apOrganizationUserMemberOfOrganizationDisplay: TAPOrganizationUserMemberOfOrganizationDisplay = this.create_ApOrganizationUserMemberOfOrganizationDisplay({
      organizationEntityId: organizationEntityId,
      apsUserResponse: apsUserResponse,
      completeApOrganizationBusinessGroupDisplayList: completeApOrganizationBusinessGroupDisplayList
    });

    const base: IAPUserDisplay = this.create_ApUserDisplay_From_ApiEntities({
      apsUserResponse: apsUserResponse,
    });
    const apOrganizationUserDisplay: TAPOrganizationUserDisplay = {
      ...base,
      organizationEntityId: organizationEntityId,
      memberOfOrganizationDisplay: apOrganizationUserMemberOfOrganizationDisplay,
      completeOrganizationBusinessGroupDisplayList: completeApOrganizationBusinessGroupDisplayList,
      organizationAssetInfoDisplayList: apOrganizationAssetInfoDisplayList,
    }
    return apOrganizationUserDisplay;
  }

  public get_ApOrganizationUserMemberOfOrganizationDisplay({ apOrganizationUserDisplay }: {
    apOrganizationUserDisplay: TAPOrganizationUserDisplay;
  }): TAPOrganizationUserMemberOfOrganizationDisplay {
    // const funcName = 'get_ApOrganizationUserMemberOfOrganizationDisplay';
    // const logName = `${this.ComponentName}.${funcName}()`;
    return apOrganizationUserDisplay.memberOfOrganizationDisplay;
  }

  public get_ApOrganizationRoleEntityIdList({ apOrganizationUserDisplay }:{
    apOrganizationUserDisplay: TAPOrganizationUserDisplay;
  }): TAPEntityIdList {
    return apOrganizationUserDisplay.memberOfOrganizationDisplay.apOrganizationRoleEntityIdList;
  }

  public get_ApMemberOfBusinessGroupDisplay({ apOrganizationUserDisplay, businessGroupEntityId }:{
    apOrganizationUserDisplay: TAPOrganizationUserDisplay;
    businessGroupEntityId: TAPEntityId;
  }): TAPMemberOfBusinessGroupDisplay {
    return APMemberOfService.get_ApMemberOfBusinessGroupDisplay({ 
      apMemberOfBusinessGroupDisplayList: apOrganizationUserDisplay.memberOfOrganizationDisplay.apMemberOfBusinessGroupDisplayList,
      businessGroupEntityId: businessGroupEntityId,
    });
  }

  public validate_RequestedUpdateOf_ApOrganizationUserDisplay_With_ApMemberOfOrganizationDisplay({ current_ApOrganizationUserDisplay, requestedUpdateWith_apMemberOfOrganizationDisplay }: {
    current_ApOrganizationUserDisplay: TAPOrganizationUserDisplay;
    requestedUpdateWith_apMemberOfOrganizationDisplay: TAPMemberOfOrganizationDisplay;
  }): boolean {
    // const funcName = 'validate_RequestedUpdateOf_ApOrganizationUserDisplay_With_ApMemberOfOrganizationDisplay';
    // const logName = `${this.ComponentName}.${funcName}()`;

    if(requestedUpdateWith_apMemberOfOrganizationDisplay.apOrganizationRoleEntityIdList.length > 0) return true;  
    // create a copy
    const cloneOf_current_ApOrganizationUserDisplay: TAPOrganizationUserDisplay = JSON.parse(JSON.stringify(current_ApOrganizationUserDisplay));
    // apply the new roles to clone
    const updated_apOrganizationUserDisplay: TAPOrganizationUserDisplay = this.apply_ApMemberOfOrganizationDisplay({
      apOrganizationUserDisplay: cloneOf_current_ApOrganizationUserDisplay,
      apMemberOfOrganizationDisplay: requestedUpdateWith_apMemberOfOrganizationDisplay,
    });
    // check if any other business groups with roles in them
    // if not, then return false
    for(const apMemberOfBusinessGroupDisplay of updated_apOrganizationUserDisplay.memberOfOrganizationDisplay.apMemberOfBusinessGroupDisplayList) {
      // alert(`${logName}: apMemberOfBusinessGroupDisplay.apConfiguredBusinessGroupRoleEntityIdList = ${JSON.stringify(apMemberOfBusinessGroupDisplay.apConfiguredBusinessGroupRoleEntityIdList, null, 2)}`);
      if(apMemberOfBusinessGroupDisplay.apConfiguredBusinessGroupRoleEntityIdList.length > 0) return true;
    }
    return false;
  }

  /**
   * Validate that requested update still leaves user with at least 1 role overall.
   */
  public validate_RequestedUpdateOf_ApOrganizationUserDisplay_With_ApMemberOfBusinessGroupDisplayList({ current_ApOrganizationUserDisplay, requestedUpdateWith_apMemberOfBusinessGroupDisplayList }:{
    current_ApOrganizationUserDisplay: TAPOrganizationUserDisplay;
    requestedUpdateWith_apMemberOfBusinessGroupDisplayList: TAPMemberOfBusinessGroupDisplayList;
  }): boolean {
    // const funcName = 'validate_RequestedUpdateOf_ApOrganizationUserDisplay_With_ApMemberOfBusinessGroupDisplayList';
    // const logName = `${this.ComponentName}.${funcName}()`;
    // if organization level roles are defined, validation ok
    if(current_ApOrganizationUserDisplay.memberOfOrganizationDisplay.apOrganizationRoleEntityIdList.length > 0) return true;
    // now check if any business group has configured roles
    for(const apMemberOfBusinessGroupDisplay of requestedUpdateWith_apMemberOfBusinessGroupDisplayList) {
      if(apMemberOfBusinessGroupDisplay.apConfiguredBusinessGroupRoleEntityIdList.length > 0) return true;
    }
    return false;
  }

  /** Validates if at least 1 roles is configured at organization level or any business group */
  public validate_MemberOf_Roles({ apOrganizationUserDisplay }: {
    apOrganizationUserDisplay: TAPOrganizationUserDisplay;
  }): boolean {
    if(apOrganizationUserDisplay.memberOfOrganizationDisplay.apOrganizationRoleEntityIdList.length > 0) return true;
    for(const apMemberOfBusinessGroupDisplay of apOrganizationUserDisplay.memberOfOrganizationDisplay.apMemberOfBusinessGroupDisplayList) {
      if(apMemberOfBusinessGroupDisplay.apConfiguredBusinessGroupRoleEntityIdList.length > 0) return true;
    }
    return false;    
  }

  public set_ApOrganizationUserProfileDisplay({ apOrganizationUserDisplay, apUserProfileDisplay }: {
    apOrganizationUserDisplay: TAPOrganizationUserDisplay;
    apUserProfileDisplay: TAPUserProfileDisplay;
  }): TAPOrganizationUserDisplay {
    return super.set_ApUserProfileDisplay({
      apUserDisplay: apOrganizationUserDisplay,
      apUserProfileDisplay: apUserProfileDisplay
    }) as TAPOrganizationUserDisplay;
  }

  public set_ApOrganizationUserAuthenticationDisplay({ apOrganizationUserDisplay, apUserAuthenticationDisplay }: {
    apOrganizationUserDisplay: TAPOrganizationUserDisplay;
    apUserAuthenticationDisplay: TAPUserAuthenticationDisplay;
  }): TAPOrganizationUserDisplay {
    return super.set_ApUserAuthenticationDisplay({
      apUserDisplay: apOrganizationUserDisplay,
      apUserAuthenticationDisplay: apUserAuthenticationDisplay
    }) as TAPOrganizationUserDisplay;
  }

  public set_ApMemberOfOrganizationDisplay({ apOrganizationUserDisplay, apMemberOfOrganizationDisplay }:{
    apOrganizationUserDisplay: TAPOrganizationUserDisplay;
    apMemberOfOrganizationDisplay: TAPMemberOfOrganizationDisplay;
  }): TAPOrganizationUserDisplay {
    return this.apply_ApMemberOfOrganizationDisplay({
      apOrganizationUserDisplay: apOrganizationUserDisplay,
      apMemberOfOrganizationDisplay: apMemberOfOrganizationDisplay,
    });
  }

  public set_ApMemberOfBusinessGroupDisplayList({ apOrganizationUserDisplay, apMemberOfBusinessGroupDisplayList }:{
    apOrganizationUserDisplay: TAPOrganizationUserDisplay;
    apMemberOfBusinessGroupDisplayList: TAPMemberOfBusinessGroupDisplayList;
  }): TAPOrganizationUserDisplay {
    return this.apply_ApMemberOfBusinessGroupDisplayList({
      apOrganizationUserDisplay: apOrganizationUserDisplay,
      apMemberOfBusinessGroupDisplayList: apMemberOfBusinessGroupDisplayList,
    });
  }


  // ********************************************************************************************************************************
  // APS API calls
  // ********************************************************************************************************************************
  
  public async apsCheck_OrganizationUserIdExists({ userId, organizationId, complete_ApOrganizationBusinessGroupDisplayList}: {
    organizationId: string;
    userId: string;
    complete_ApOrganizationBusinessGroupDisplayList?: TAPBusinessGroupDisplayList;
  }): Promise<TAPCheckOrganizationUserIdExistsResult> {
    // const funcName = 'apsCheck_OrganizationUserIdExists';
    // const logName = `${this.BaseComponentName}.${funcName}()`;
    try {
      // throw new Error(`${logName}: test error handling upstream`);
      const apsUserResponse: APSUserResponse = await ApsUsersService.getApsUser({
        userId: userId
      });
      const existsInOrganization: boolean = APMemberOfService.is_ApsUserMemberOfOrganization({ organizationId: organizationId, apsUserResponse: apsUserResponse});
      let apOrganizationUserDisplay: TAPOrganizationUserDisplay | undefined = undefined;
      if(existsInOrganization) {
        apOrganizationUserDisplay = await this.apsGet_ApOrganizationUserDisplay({
          userId: userId,
          organizationEntityId: { id: organizationId, displayName: organizationId },
          fetch_ApOrganizationAssetInfoDisplayList: false,
          apsUserResponse: apsUserResponse,
          complete_ApOrganizationBusinessGroupDisplayList: complete_ApOrganizationBusinessGroupDisplayList
        });  
      }
      return {
        exists: true,
        existsInOrganization: existsInOrganization,
        apOrganizationUserDisplay: apOrganizationUserDisplay,
      }
     } catch(e: any) {
      if(APSClientOpenApi.isInstanceOfApiError(e)) {
        const apiError: ApiError = e;
        if(apiError.status === 404) return { exists: false, existsInOrganization: false };
      }
      throw e;
    }
  }

  public async apsGet_ApOrganizationUserDisplay({ organizationEntityId, userId, fetch_ApOrganizationAssetInfoDisplayList, apsUserResponse, complete_ApOrganizationBusinessGroupDisplayList }:{
    organizationEntityId: TAPEntityId;
    userId: string;
    fetch_ApOrganizationAssetInfoDisplayList: boolean;
    apsUserResponse?: APSUserResponse;
    complete_ApOrganizationBusinessGroupDisplayList?: TAPBusinessGroupDisplayList;
  }): Promise<TAPOrganizationUserDisplay> {

    if(apsUserResponse === undefined) {
      // TODO: change this call once aps has the new organization user resource
      apsUserResponse = await ApsUsersService.getApsUser({
        userId: userId
      });
    }
    if(complete_ApOrganizationBusinessGroupDisplayList === undefined) {
    // get the organization business group list
      complete_ApOrganizationBusinessGroupDisplayList = await APBusinessGroupsDisplayService.apsGetList_ApBusinessGroupSystemDisplayList({
        organizationId: organizationEntityId.id
      });  
    }
    // create
    const apOrganizationUserDisplay: TAPOrganizationUserDisplay = await this.create_ApOrganizationUserDisplay_From_ApiEntities({
      apsUserResponse: apsUserResponse,
      organizationEntityId: organizationEntityId,
      completeApOrganizationBusinessGroupDisplayList: complete_ApOrganizationBusinessGroupDisplayList,
      fetch_ApOrganizationAssetInfoDisplayList: fetch_ApOrganizationAssetInfoDisplayList
    });
    return apOrganizationUserDisplay;
  }

  public async apsGetList_ApOrganizationUserDisplayListResponse({
    organizationEntityId,
    pageSize = 20,
    pageNumber = 1,
    apSortFieldName,
    sortDirection,
    searchWordList,
  }: {
    organizationEntityId: TAPEntityId;
    pageSize?: number;
    pageNumber?: number;
    apSortFieldName?: string;
    sortDirection?: DataTableSortOrderType;
    searchWordList?: string;
  }): Promise<TAPOrganizationUserDisplayListResponse> {
  
    // TODO: change this call once aps has a the new organization user resource
    // map UI sortField to 
    const apsSortFieldName = this.map_ApFieldName_To_ApsFieldName(apSortFieldName);
    const apsSortDirection = APDisplayUtils.transformTableSortDirectionToApiSortDirection(sortDirection);
    const listApsUsersResponse: ListApsUsersResponse = await ApsUsersService.listApsUsers({
      pageSize: pageSize,
      pageNumber: pageNumber,
      sortFieldName: apsSortFieldName,
      sortDirection: apsSortDirection,
      searchWordList: searchWordList ? Globals.encodeRFC5987ValueChars(searchWordList) : undefined,
      searchOrganizationId: organizationEntityId.id,
    });
    // get the organization business group list
    const completeApOrganizationBusinessGroupDisplayList: TAPBusinessGroupDisplayList = await APBusinessGroupsDisplayService.apsGetList_ApBusinessGroupSystemDisplayList({
      organizationId: organizationEntityId.id
    });  
    const apOrganizationUserDisplayList: TAPOrganizationUserDisplayList = [];
    for(const apsUserResponse of listApsUsersResponse.list) {
      const apOrganizationUserDisplay: TAPOrganizationUserDisplay = await this.create_ApOrganizationUserDisplay_From_ApiEntities({
        apsUserResponse: apsUserResponse,
        organizationEntityId: organizationEntityId,
        completeApOrganizationBusinessGroupDisplayList: completeApOrganizationBusinessGroupDisplayList,
        fetch_ApOrganizationAssetInfoDisplayList: true
      });
      apOrganizationUserDisplayList.push(apOrganizationUserDisplay);
    }
    const response: TAPOrganizationUserDisplayListResponse = {
      apOrganizationUserDisplayList: apOrganizationUserDisplayList,
      meta: listApsUsersResponse.meta
    };
    return response;
  }

  public async apsCreate_ApOrganizationUserDisplay({ apOrganizationUserDisplay }: {
    apOrganizationUserDisplay: TAPOrganizationUserDisplay;
  }): Promise<void> {
    // const funcName = 'apsCreate_ApOrganizationUserDisplay';
    // const logName = `${this.ComponentName}.${funcName}()`;

    const apsProfile: APSUserProfile = {
      email: apOrganizationUserDisplay.apUserProfileDisplay.email,
      first: apOrganizationUserDisplay.apUserProfileDisplay.first,
      last: apOrganizationUserDisplay.apUserProfileDisplay.last,
    };

    // new user: does not have existing memberships 
    const apsMemberOfOrganizationGroupsList: APSMemberOfOrganizationGroupsList = this.create_new_ApsMemberOfOrganizationGroupsList({
      apOrganizationUserDisplay: apOrganizationUserDisplay,
    });

    // create the legacy memberOfOrganizations roles
    // TODO: FUTURE: remove
    const legacy_apOrganizationRolesList: TAPEntityIdList = APMemberOfService.create_ApLegacyOrganizationRoleEntityIdList({
      apOrganizationUserMemberOfOrganizationDisplay: apOrganizationUserDisplay.memberOfOrganizationDisplay,
    });
    const legacy_apsOrganizationRoles: APSOrganizationRoles = {
      organizationId: apOrganizationUserDisplay.organizationEntityId.id,
      roles: APEntityIdsService.create_IdList(legacy_apOrganizationRolesList) as APSOrganizationAuthRoleList,
    };
    // alert(`${logName}: legacy_apsOrganizationRoles = ${JSON.stringify(legacy_apsOrganizationRoles, null, 2)}`);
      
    const create: APSUserCreate = {
      userId: apOrganizationUserDisplay.apEntityId.id,
      isActivated: apOrganizationUserDisplay.apUserActivationDisplay.isActivated,
      password: apOrganizationUserDisplay.apUserAuthenticationDisplay.password,
      profile: apsProfile,
      systemRoles: APEntityIdsService.create_IdList(apOrganizationUserDisplay.apSystemRoleEntityIdList) as APSSystemAuthRoleList,
      memberOfOrganizationGroups: apsMemberOfOrganizationGroupsList,
      // LEGACY
      memberOfOrganizations: [legacy_apsOrganizationRoles],
    };

    await ApsUsersService.createApsUser({
      requestBody: create
    });
  }
  
  protected async apsUpdate_ApsUserUpdate({ userId, apsUserUpdate }: {
    userId: string;
    apsUserUpdate: APSUserUpdate,
  }): Promise<void> {
    // const funcName = 'apsUpdate_ApsUserUpdate';
    // const logName = `${this.ComponentName}.${funcName}()`;

    // TODO: call ApsOrganzizationUserService in the future
    await ApsUsersService.updateApsUser({
      userId: userId, 
      requestBody: apsUserUpdate
    });
  }
  
  private async apsUpdate_internal_ApMemberOf({ apOrganizationUserDisplay }: {
    apOrganizationUserDisplay: TAPOrganizationUserDisplay;
  }): Promise<void> {
    // const funcName = 'apsUpdate_ApMemberOf';
    // const logName = `${this.ComponentName}.${funcName}()`;

    const updated_apsMemberOfOrganizationGroupsList: APSMemberOfOrganizationGroupsList = await this.create_update_ApsMemberOfOrganizationGroupsList({
      apOrganizationUserDisplay: apOrganizationUserDisplay,
    });

    // create the legacy memberOfOrganizations roles
    // REFACTOR_OUT_LEGACY: legacy_apOrganizationRolesList
    const legacy_apOrganizationRolesList: TAPEntityIdList = APMemberOfService.create_ApLegacyOrganizationRoleEntityIdList({
      apOrganizationUserMemberOfOrganizationDisplay: apOrganizationUserDisplay.memberOfOrganizationDisplay,
    });
    const legacy_apsOrganizationRoles: APSOrganizationRoles = {
      organizationId: apOrganizationUserDisplay.organizationEntityId.id,
      roles: APEntityIdsService.create_IdList(legacy_apOrganizationRolesList) as APSOrganizationAuthRoleList,
    };

    // alert(`${logName}: legacy_apsOrganizationRoles=${JSON.stringify(legacy_apsOrganizationRoles, null, 2)}`);
    // replace in existing list
    const legacy_updated_apsOrganizationRolesList: APSOrganizationRolesList = await APLegacyOrganizationRoles.update_ApsOrganizationRolesList({
      apOrganizationUserDisplay: apOrganizationUserDisplay,
      update_ApsOrganizationRoles: legacy_apsOrganizationRoles
    });

    // alert(`${logName}: legacy_updated_apsOrganizationRolesList=${JSON.stringify(legacy_updated_apsOrganizationRolesList, null, 2)}`);

    const update: APSUserUpdate = {
      memberOfOrganizations: legacy_updated_apsOrganizationRolesList,
      memberOfOrganizationGroups: updated_apsMemberOfOrganizationGroupsList,
    }

    await this.apsUpdate_ApsUserUpdate({
      userId: apOrganizationUserDisplay.apEntityId.id,
      apsUserUpdate: update
    });

  }

  public async apsUpdate_ApMemberOf({ apOrganizationUserDisplay }:{
    apOrganizationUserDisplay: TAPOrganizationUserDisplay;
  }): Promise<void> {

    await this.apsUpdate_internal_ApMemberOf({
      apOrganizationUserDisplay: apOrganizationUserDisplay
    });
  }

  public async apsUpdate_ApMemberOfBusinessGroupDisplayList({ apOrganizationUserDisplay, apMemberOfBusinessGroupDisplayList }:{
    apOrganizationUserDisplay: TAPOrganizationUserDisplay;
    apMemberOfBusinessGroupDisplayList: TAPMemberOfBusinessGroupDisplayList
  }): Promise<void> {
    // const funcName = 'apsUpdate_ApMemberOfBusinessGroupDisplayList';
    // const logName = `${this.ComponentName}.${funcName}()`;

    const updated_apOrganizationUserDisplay: TAPOrganizationUserDisplay = this.apply_ApMemberOfBusinessGroupDisplayList({
      apOrganizationUserDisplay: apOrganizationUserDisplay,
      apMemberOfBusinessGroupDisplayList: apMemberOfBusinessGroupDisplayList,
    });

    await this.apsUpdate_internal_ApMemberOf({ apOrganizationUserDisplay: updated_apOrganizationUserDisplay });

  }

  public async apsUpdate_ApMemberOfOrganizationDisplay({ apOrganizationUserDisplay, apMemberOfOrganizationDisplay }:{
    apOrganizationUserDisplay: TAPOrganizationUserDisplay;
    apMemberOfOrganizationDisplay: TAPMemberOfOrganizationDisplay;
  }): Promise<void> {
    // const funcName = 'apsUpdate_ApMemberOfOrganizationDisplay';
    // const logName = `${this.ComponentName}.${funcName}()`;

    const updated_apOrganizationUserDisplay: TAPOrganizationUserDisplay = this.apply_ApMemberOfOrganizationDisplay({
      apOrganizationUserDisplay: apOrganizationUserDisplay,
      apMemberOfOrganizationDisplay: apMemberOfOrganizationDisplay,
    });

    await this.apsUpdate_internal_ApMemberOf({ apOrganizationUserDisplay: updated_apOrganizationUserDisplay });

  }

  public async apsDelete_ApOrganizationUserDisplay({ apOrganizationUserDisplay }:{
    apOrganizationUserDisplay: TAPOrganizationUserDisplay;
  }): Promise<void> {
    // const funcName = 'apsDelete_ApOrganizationUserDisplay';
    // const logName = `${this.ComponentName}.${funcName}()`;

    const apsUserResponse: APSUserResponse = await ApsUsersService.getApsUser({
      userId: apOrganizationUserDisplay.apEntityId.id
    });

    // create the new list 
    const update_memberOfOrganizations: APSOrganizationRolesList = [];
    for(const apsOrganizationRolesResponse of apsUserResponse.memberOfOrganizations) {
      if(apsOrganizationRolesResponse.organizationId !== apOrganizationUserDisplay.organizationEntityId.id) {
        update_memberOfOrganizations.push({
          organizationId: apsOrganizationRolesResponse.organizationId,
          roles: apsOrganizationRolesResponse.roles
        });
      }
    }
    
    const update_apsMemberOfOrganizationGroupsList: APSMemberOfOrganizationGroupsList = [];
    for(const apsMemberOfOrganizationGroups of apsUserResponse.memberOfOrganizationGroups) {
      if(apsMemberOfOrganizationGroups.organizationId !== apOrganizationUserDisplay.organizationEntityId.id) {
        update_apsMemberOfOrganizationGroupsList.push(apsMemberOfOrganizationGroups);
      }
    }

    const update: APSUserUpdate = {
      memberOfOrganizations: update_memberOfOrganizations,
      memberOfOrganizationGroups: update_apsMemberOfOrganizationGroupsList,
    }

    await this.apsUpdate_ApsUserUpdate({
      userId: apOrganizationUserDisplay.apEntityId.id,
      apsUserUpdate: update
    });

  }

}

export default new APOrganizationUsersDisplayService();
