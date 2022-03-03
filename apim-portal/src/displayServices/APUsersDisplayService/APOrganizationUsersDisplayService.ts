import { DataTableSortOrderType } from 'primereact/datatable';
import { 
  IAPEntityIdDisplay, 
  TAPEntityId, 
  TAPEntityIdList 
} from '../../utils/APEntityIdsService';
import APSearchContentService from '../../utils/APSearchContentService';
import { Globals } from '../../utils/Globals';
import { 
  APSListResponseMeta, 
  APSUserResponse, 
  ApsUsersService, 
  ListApsUsersResponse 
} from '../../_generated/@solace-iot-team/apim-server-openapi-browser';
import APAssetDisplayService, { 
  TAPOrganizationAssetInfoDisplayList 
} from '../APAssetsDisplayService';
import APBusinessGroupsDisplayService, { 
  TAPBusinessGroupDisplayList 
} from '../APBusinessGroupsDisplayService';
import APDisplayUtils from '../APDisplayUtils';
import { TAPMemberOfBusinessGroupDisplayList } from '../old.APUsersDisplayService';
import APMemberOfService, { 
  TAPMemberOfBusinessGroupDisplay, 
  TAPMemberOfBusinessGroupDisplayTreeNodeList, 
  TAPMemberOfOrganizationDisplay 
} from './APMemberOfService';
import { 
  APUsersDisplayService, 
  IAPUserDisplay, 
} from './APUsersDisplayService';

export type TAPOrganizationUserMemberOfOrganizationDisplay = TAPMemberOfOrganizationDisplay & {
  apMemberOfBusinessGroupDisplayList: TAPMemberOfBusinessGroupDisplayList;
  apMemberOfBusinessGroupDisplayTreeNodeList: TAPMemberOfBusinessGroupDisplayTreeNodeList;
}
// export type TAPOrganizationUserDisplay = Omit<IAPUserDisplay, "" | ""> & {
export type TAPOrganizationUserDisplay = IAPUserDisplay & {
  apOrganizationEntityId: TAPEntityId;
  apOrganizationUserMemberOfOrganizationDisplay: TAPOrganizationUserMemberOfOrganizationDisplay;
  readonly apCompleteBusinessGroupDisplayList?: TAPBusinessGroupDisplayList;
  readonly apOrganizationAssetInfoDisplayList?: TAPOrganizationAssetInfoDisplayList;
}
export type TAPOrganizationUserDisplayList = Array<TAPOrganizationUserDisplay>;
export type TAPOrganizationUserDisplayListResponse = APSListResponseMeta & {
  apOrganizationUserDisplayList: TAPOrganizationUserDisplayList;
}
export type TAPUserOrganizationRolesDisplay = IAPEntityIdDisplay & {
  apOrganizationAuthRoleEntityIdList: TAPEntityIdList;
}

class APOrganizationUsersDisplayService extends APUsersDisplayService {
  private readonly ComponentName = "APOrganizationUsersDisplayService";

  public create_MemberOfBusinessGroupEntityIdList({apOrganizationUserMemberOfOrganizationDisplay}: {
    apOrganizationUserMemberOfOrganizationDisplay: TAPOrganizationUserMemberOfOrganizationDisplay;
  }): TAPEntityIdList {
    return apOrganizationUserMemberOfOrganizationDisplay.apMemberOfBusinessGroupDisplayList.map( (apMemberOfBusinessGroupDisplay: TAPMemberOfBusinessGroupDisplay) => {
      return apMemberOfBusinessGroupDisplay.apBusinessGroupDisplay.apEntityId;
    });
  }

  private create_Empty_ApOrganizationUserMemberOfOrganizationDisplay({organizationEntityId}:{
    organizationEntityId: TAPEntityId;

  }): TAPOrganizationUserMemberOfOrganizationDisplay {
    const base = APMemberOfService.create_Empty_ApMemberOfOrganizationDisplay({ organizationEntityId: organizationEntityId });
    const apOrganizationUserMemberOfOrganizationDisplay: TAPOrganizationUserMemberOfOrganizationDisplay = {
      ...base,
      apMemberOfBusinessGroupDisplayTreeNodeList: [],
      apMemberOfBusinessGroupDisplayList: [],
    };
    return apOrganizationUserMemberOfOrganizationDisplay;
  }

  public async create_Empty_ApOrganizationUserDisplay({organizationEntityId, apCompleteBusinessGroupDisplayList}: {
    organizationEntityId: TAPEntityId;
    apCompleteBusinessGroupDisplayList?: TAPBusinessGroupDisplayList;
  }): Promise<TAPOrganizationUserDisplay> {

    const base: IAPUserDisplay = super.create_Empty_ApUserDisplay();
    const apOrganizationUserDisplay: TAPOrganizationUserDisplay = {
      ...base,
      apOrganizationEntityId: organizationEntityId,
      apOrganizationUserMemberOfOrganizationDisplay: this.create_Empty_ApOrganizationUserMemberOfOrganizationDisplay({organizationEntityId: organizationEntityId}),
      apCompleteBusinessGroupDisplayList: apCompleteBusinessGroupDisplayList === undefined ? await APBusinessGroupsDisplayService.apsGetList_ApBusinessGroupSystemDisplayList({
        organizationId: organizationEntityId.id
      }): apCompleteBusinessGroupDisplayList,
    }
    return apOrganizationUserDisplay;    
  }

  /**
   * Create organization roles and business group / roles tree.
   * 
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

    const apMemberOfBusinessGroupDisplayTreeNodeList: TAPMemberOfBusinessGroupDisplayTreeNodeList = APMemberOfService.create_ApMemberOfBusinessGroupDisplayTreeNodeList({
      organizationEntityId: organizationEntityId,
      apsUserResponse: apsUserResponse,
      completeApOrganizationBusinessGroupDisplayList: completeApOrganizationBusinessGroupDisplayList,
      apOrganizationRoleEntityIdList: base.apOrganizationRoleEntityIdList
    });

    const apMemberOfBusinessGroupDisplayList: TAPMemberOfBusinessGroupDisplayList = APMemberOfService.create_ApMemberOfBusinessGroupDisplayList({
      apMemberOfBusinessGroupDisplayTreeNodeList: apMemberOfBusinessGroupDisplayTreeNodeList
    });

    const apOrganizationUserMemberOfOrganizationDisplay: TAPOrganizationUserMemberOfOrganizationDisplay = {
      ...base,
      apMemberOfBusinessGroupDisplayTreeNodeList: apMemberOfBusinessGroupDisplayTreeNodeList,
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
      apOrganizationEntityId: organizationEntityId,
      apOrganizationUserMemberOfOrganizationDisplay: apOrganizationUserMemberOfOrganizationDisplay,
      apCompleteBusinessGroupDisplayList: completeApOrganizationBusinessGroupDisplayList,
      apOrganizationAssetInfoDisplayList: apOrganizationAssetInfoDisplayList,
    }
    return APSearchContentService.add_SearchContent<TAPOrganizationUserDisplay>(apOrganizationUserDisplay);
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
  
}

export default new APOrganizationUsersDisplayService();
