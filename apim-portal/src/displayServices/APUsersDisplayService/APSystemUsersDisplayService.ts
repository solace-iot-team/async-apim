import { DataTableSortOrderType } from 'primereact/datatable';
import { TAPEntityId } from '../../utils/APEntityIdsService';
import { 
  APSListResponseMeta, 
  APSUserResponse, 
  ApsUsersService, 
  APSUserUpdate, 
  ListApsUsersResponse
} from '../../_generated/@solace-iot-team/apim-server-openapi-browser';
import APBusinessGroupsDisplayService, { TAPBusinessGroupDisplayList } from '../APBusinessGroupsDisplayService';
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
   * Returns list of users in the system.
   */
  public async apsGetList_ApSystemUserDisplayListResponse({
    pageSize = 20,
    pageNumber = 1,
    apSortFieldName,
    sortDirection,
    searchWordList,
  }: {
    pageSize?: number;
    pageNumber?: number;
    apSortFieldName?: string;
    sortDirection?: DataTableSortOrderType;
    searchWordList?: string;
  }): Promise<TAPSystemUserDisplayListResponse> {
  
    // map UI sortField to 
    const apsSortFieldName = this.map_ApFieldName_To_ApsFieldName(apSortFieldName);
    const apsSortDirection = APDisplayUtils.transformTableSortDirectionToApiSortDirection(sortDirection);
    const listApsUsersResponse: ListApsUsersResponse = await ApsUsersService.listApsUsers({
      pageSize: pageSize,
      pageNumber: pageNumber,
      sortFieldName: apsSortFieldName,
      sortDirection: apsSortDirection,
      searchWordList: searchWordList
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
}

export default new APSystemUsersDisplayService();
