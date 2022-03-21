import { DataTableSortOrderType } from 'primereact/datatable';
import APEntityIdsService, { TAPEntityId } from '../../utils/APEntityIdsService';
import { 
  APSListResponseMeta, 
  APSSystemAuthRoleList, 
  APSUserCreate, 
  APSUserProfile, 
  APSUserResponse, 
  ApsUsersService, 
  APSUserUpdate, 
  ListApsUsersResponse
} from '../../_generated/@solace-iot-team/apim-server-openapi-browser';
import APDisplayUtils from '../APDisplayUtils';
import APMemberOfService, { TAPMemberOfOrganizationDisplayList } from './APMemberOfService';
import { 
  APUsersDisplayService, 
  IAPUserDisplay, 
} from './APUsersDisplayService';

export type TAPSystemUserDisplay = IAPUserDisplay & {
  apMemberOfOrganizationDisplayList: TAPMemberOfOrganizationDisplayList;
};
export type TAPSystemUserDisplayList = Array<TAPSystemUserDisplay>;
export type TAPSystemUserDisplayListResponse = APSListResponseMeta & {
  apSystemUserDisplayList: TAPSystemUserDisplayList;
}

class APSystemUsersDisplayService extends APUsersDisplayService {
  private readonly ComponentName = "APSystemUsersDisplayService";

  public nameOf_ApSystemUserDisplay(name: keyof TAPSystemUserDisplay) {
    return name;
  }

  protected map_ApFieldName_To_ApsFieldName(apFieldName?: string): string | undefined {
    if(apFieldName === undefined) return undefined;
    if(apFieldName.startsWith('apMemberOfOrganizationDisplayList')) return apFieldName.replace('apMemberOfOrganizationDisplayList', 'systemRoles');
    return super.map_ApFieldName_To_ApsFieldName(apFieldName);
  }

  private create_ApSystemUserDisplay_From_ApiEntities_EmptyRoles({ apsUserResponse }: {
    apsUserResponse: APSUserResponse;
  }): TAPSystemUserDisplay {

    const base: IAPUserDisplay = this.create_ApUserDisplay_From_ApiEntities({
      apsUserResponse: apsUserResponse,
    });
    const apSystemUserDisplay: TAPSystemUserDisplay = {
      ...base,
      apMemberOfOrganizationDisplayList: APMemberOfService.create_ApMemberOfOrganizationDisplayList_EmptyRoles({
        apsUserResponse: apsUserResponse,
      })
    }
    return apSystemUserDisplay;
  }

  /**
   * with roles
   */
  private create_ApSystemUserDisplay_From_ApiEntities({ apsUserResponse }: {
    apsUserResponse: APSUserResponse;
  }): TAPSystemUserDisplay {

    const base: IAPUserDisplay = this.create_ApUserDisplay_From_ApiEntities({
      apsUserResponse: apsUserResponse,
    });
    const apSystemUserDisplay: TAPSystemUserDisplay = {
      ...base,
      apMemberOfOrganizationDisplayList: APMemberOfService.create_ApMemberOfOrganizationDisplayList({
        apsUserResponse: apsUserResponse,
      })
    }
    return apSystemUserDisplay;
  }

  public async create_Empty_ApSystemUserDisplay(): Promise<TAPSystemUserDisplay> {
    const base: IAPUserDisplay = super.create_Empty_ApUserDisplay();
    const apSystemUserDisplay: TAPSystemUserDisplay = {
      ...base,
      apMemberOfOrganizationDisplayList: []
    }
    return apSystemUserDisplay;    
  }

  // ********************************************************************************************************************************
  // APS API calls
  // ********************************************************************************************************************************

  protected async apsUpdate_ApsUserUpdate({
    userId, apsUserUpdate
  }: {
    userId: string;
    apsUserUpdate: APSUserUpdate,
  }): Promise<void> {
    // const funcName = 'apsUpdate_ApsUserUpdate';
    // const logName = `${this.ComponentName}.${funcName}()`;

    await ApsUsersService.updateApsUser({
      userId: userId, 
      requestBody: apsUserUpdate
    });
  }

  /**
   * Returns list of active users NOT in the organization.
   */
  public async apsGetList_ActiveUsersNotInOrganization_ApSystemUserDisplayListResponse({
    excludeOrganizationEntityId,
    pageSize = 20,
    pageNumber = 1,
    apSortFieldName,
    sortDirection,
    searchUserId,
  }: {
    excludeOrganizationEntityId: TAPEntityId;
    searchUserId?: string;
    pageSize?: number;
    pageNumber?: number;
    apSortFieldName?: string;
    sortDirection?: DataTableSortOrderType;
  }): Promise<TAPSystemUserDisplayListResponse> {
  
    // map UI sortField to 
    const apsSortFieldName = this.map_ApFieldName_To_ApsFieldName(apSortFieldName);
    const apsSortDirection = APDisplayUtils.transformTableSortDirectionToApiSortDirection(sortDirection);
    const listApsUsersResponse: ListApsUsersResponse = await ApsUsersService.listApsUsers({
      pageSize: pageSize,
      pageNumber: pageNumber,
      sortFieldName: apsSortFieldName,
      sortDirection: apsSortDirection,
      searchUserId: searchUserId ? searchUserId : undefined,
      excludeSearchOrganizationId: excludeOrganizationEntityId.id,
      searchIsActivated: true,
    });
    const apSystemUserDisplayList: TAPSystemUserDisplayList = [];
    for(const apsUserResponse of listApsUsersResponse.list) {
      const apSystemUserDisplay: TAPSystemUserDisplay = this.create_ApSystemUserDisplay_From_ApiEntities_EmptyRoles({
        apsUserResponse: apsUserResponse,
      });
      apSystemUserDisplayList.push(apSystemUserDisplay);
    }
    const response: TAPSystemUserDisplayListResponse = {
      apSystemUserDisplayList: apSystemUserDisplayList,
      meta: listApsUsersResponse.meta
    };
    return response;
  }

  /**
   * Returns list of users in the system. Can be filtered by organization.
   */
  public async apsGetList_ApSystemUserDisplayListResponse({
    pageSize = 20,
    pageNumber = 1,
    apSortFieldName,
    sortDirection,
    searchWordList,
    organizationEntityId,
    includeOrganizationRoles = false,
  }: {
    pageSize?: number;
    pageNumber?: number;
    apSortFieldName?: string;
    sortDirection?: DataTableSortOrderType;
    searchWordList?: string;
    organizationEntityId?: TAPEntityId;
    includeOrganizationRoles?: boolean;
  }): Promise<TAPSystemUserDisplayListResponse> {
  
    // map UI sortField to 
    const apsSortFieldName = this.map_ApFieldName_To_ApsFieldName(apSortFieldName);
    const apsSortDirection = APDisplayUtils.transformTableSortDirectionToApiSortDirection(sortDirection);
    const listApsUsersResponse: ListApsUsersResponse = await ApsUsersService.listApsUsers({
      pageSize: pageSize,
      pageNumber: pageNumber,
      sortFieldName: apsSortFieldName,
      sortDirection: apsSortDirection,
      searchWordList: searchWordList,
      searchOrganizationId: organizationEntityId ? organizationEntityId.id : undefined,
    });

    const apSystemUserDisplayList: TAPSystemUserDisplayList = [];
    for(const apsUserResponse of listApsUsersResponse.list) {
      let apSystemUserDisplay: TAPSystemUserDisplay;
      if(includeOrganizationRoles) {
        apSystemUserDisplay = this.create_ApSystemUserDisplay_From_ApiEntities({
          apsUserResponse: apsUserResponse,
        });
      } else {
        apSystemUserDisplay = this.create_ApSystemUserDisplay_From_ApiEntities_EmptyRoles({
          apsUserResponse: apsUserResponse,
        });
      }
      apSystemUserDisplayList.push(apSystemUserDisplay);
    }
    const response: TAPSystemUserDisplayListResponse = {
      apSystemUserDisplayList: apSystemUserDisplayList,
      meta: listApsUsersResponse.meta
    };
    return response;
  }

  public async apsGet_ApSystemUserDisplay({ userId }:{
    userId: string;
  }): Promise<TAPSystemUserDisplay> {

    const apsUserResponse: APSUserResponse = await ApsUsersService.getApsUser({
      userId: userId
    });

    const apSystemUserDisplay: TAPSystemUserDisplay = this.create_ApSystemUserDisplay_From_ApiEntities({
      apsUserResponse: apsUserResponse,
    });

    return apSystemUserDisplay;
  }

  public async apsCreate_ApSystemUserDisplay({ apSystemUserDisplay }: {
    apSystemUserDisplay: TAPSystemUserDisplay;
  }): Promise<void> {

    const apsProfile: APSUserProfile = {
      email: apSystemUserDisplay.apUserProfileDisplay.email,
      first: apSystemUserDisplay.apUserProfileDisplay.first,
      last: apSystemUserDisplay.apUserProfileDisplay.last,
    };

    const create: APSUserCreate = {
      userId: apSystemUserDisplay.apEntityId.id,
      isActivated: apSystemUserDisplay.apUserActivationDisplay.isActivated,
      password: apSystemUserDisplay.apUserAuthenticationDisplay.password,
      profile: apsProfile,
      systemRoles: APEntityIdsService.create_IdList(apSystemUserDisplay.apSystemRoleEntityIdList) as APSSystemAuthRoleList,
      memberOfOrganizationGroups: [],
      // LEGACY
      memberOfOrganizations: [],
    };

    await ApsUsersService.createApsUser({
      requestBody: create
    });
  }

  public async apsDelete_ApSystemUserDisplay({ apSystemUserDisplay }:{
    apSystemUserDisplay: TAPSystemUserDisplay;
  }): Promise<void> {
    await ApsUsersService.deleteApsUser({
      userId: apSystemUserDisplay.apEntityId.id,
    });
  }
}

export default new APSystemUsersDisplayService();
