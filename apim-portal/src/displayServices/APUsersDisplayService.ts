import { ApiError, Developer, DevelopersService } from '@solace-iot-team/apim-connector-openapi-browser';
import { TViewAPSOrganizationRolesList } from '../admin-portal/components/ManageUsers/ManageUsersCommon';
import { APClientConnectorOpenApi } from '../utils/APClientConnectorOpenApi';
import APEntityIdsService, { IAPEntityIdDisplay, TAPEntityId, TAPEntityIdList } from '../utils/APEntityIdsService';
import { APOrganizationsService } from '../utils/APOrganizationsService';
import APSearchContentService, { IAPSearchContent } from '../utils/APSearchContentService';
import { 
  APSBusinessGroupAuthRoleList,
  APSListResponseMeta,
  APSMemberOfBusinessGroup,
  APSMemberOfOrganizationGroups,
  APSMemberOfOrganizationGroupsList,
  APSOrganizationRolesList,
  APSOrganizationRolesResponseList,
  APSSystemAuthRoleList,
  APSUser,
  APSUserProfile, 
  APSUserReplace, 
  APSUserResponse, 
  ApsUsersService,
  APSUserUpdate,
  EAPSOrganizationAuthRole,
  EAPSSortDirection,
  ListApsUsersResponse, 
} from '../_generated/@solace-iot-team/apim-server-openapi-browser';
import APBusinessGroupsDisplayService, { TAPBusinessGroupDisplay, TAPBusinessGroupDisplayList } from './APBusinessGroupsDisplayService';
import APRbacDisplayService from './APRbacDisplayService';
import APAssetDisplayService, { TAPOrganizationAssetInfoDisplayList } from './APAssetsDisplayService';
import { Globals } from '../utils/Globals';
import { DataTableSortOrderType } from 'primereact/datatable';

// TODO: create this type based on primereact TreeNode, replacing data:any with data: TAPMemberOfBusinessGroupDisplay
export type TAPMemberOfBusinessGroupTreeNodeDisplay = {
  key: string;
  label: string;
  data: TAPMemberOfBusinessGroupDisplay;
  children: TAPMemberOfBusinessGroupTreeNodeDisplayList;
}
export type TAPMemberOfBusinessGroupTreeNodeDisplayList = Array<TAPMemberOfBusinessGroupTreeNodeDisplay>;

export type TAPUserDisplayLazyLoadingTableParameters = {
  isInitialSetting: boolean; // differentiate between first time and subsequent times
  first: number; // index of the first row to be displayed
  rows: number; // number of rows to display per page
  page: number;
  // sortField: (keyof APSUser | keyof APSUserProfile);
  sortField: string;
  sortOrder: DataTableSortOrderType
}

export type TAPMemberOfBusinessGroupDisplay =  {
  apBusinessGroupDisplay: TAPBusinessGroupDisplay;
  apBusinessGroupRoleEntityIdList: TAPEntityIdList;
}
export type TAPMemberOfBusinessGroupDisplayList = Array<TAPMemberOfBusinessGroupDisplay>;

export type TAPMemberOfOrganizationGroupsDisplay = {
  apOrganizationEntityId: TAPEntityId;
  apMemberOfBusinessGroupDisplayList: TAPMemberOfBusinessGroupDisplayList;
}
export type TAPMemberOfOrganizationGroupsDisplayList = Array<TAPMemberOfOrganizationGroupsDisplay>;

export type TAPUserDisplay = IAPEntityIdDisplay & IAPSearchContent & {
  apsUserResponse: APSUserResponse;

  apSystemRoleEntityIdList: TAPEntityIdList;

  apMemberOfOrganizationNameListAsString: string;

  apOrganizationAssetInfoDisplayList: TAPOrganizationAssetInfoDisplayList;

  apMemberOfOrganizationGroupsDisplayList: TAPMemberOfOrganizationGroupsDisplayList;


  deprecated_viewMemberOfOrganizations: TViewAPSOrganizationRolesList;
  // apMemberOfGroups ... 
}
export type TAPUserDisplayList = Array<TAPUserDisplay>;
export type TAPUserDisplayListResponse = APSListResponseMeta & {
  apUserDisplayList: TAPUserDisplayList;
}

export type TAPUserProfileDisplay = IAPEntityIdDisplay & {
  apsUserProfile: APSUserProfile;
}
export type TAPUserCredentialsDisplay = IAPEntityIdDisplay & {
  password: string;
}

class LegacyManageUsers {
  private static ClassName = 'LegacyManageUsers';

  public static transformAPSOrganizationRolesResponseListToAPSOrganizationRolesList = (apsOrganizationRolesResponseList?: APSOrganizationRolesResponseList): APSOrganizationRolesList => {
    if(apsOrganizationRolesResponseList !== undefined) {
      const apsOrganizationRolesList: APSOrganizationRolesList = apsOrganizationRolesResponseList.map( (x) => {
        return {
          organizationId: x.organizationId,
          roles: x.roles
        }
      });
      return apsOrganizationRolesList;
    }
    return [];
  }

  public static create_ApsOrganizationRolesList_From_ApsMemberOfOrganizationGroupsList = async(organizationEntityId: TAPEntityId, apsMemberOfOrganizationGroupsList: APSMemberOfOrganizationGroupsList): Promise<APSOrganizationRolesList> => {
    const funcName = 'create_ApsOrganizationRolesList_From_ApsMemberOfOrganizationGroupsList';
    const logName = `${LegacyManageUsers.ClassName}.${funcName}()`;

    // TODO: fix this once removed
    return [
      {
        organizationId: organizationEntityId.id,
        roles: [
          EAPSOrganizationAuthRole.ORGANIZATION_ADMIN, EAPSOrganizationAuthRole.LOGIN_AS, EAPSOrganizationAuthRole.API_TEAM, EAPSOrganizationAuthRole.API_CONSUMER
        ]
      }
    ]
    // // get the business groups list
    // const apBusinessGroupDisplayList: TAPBusinessGroupDisplayList = await APBusinessGroupsDisplayService.listApBusinessGroupSystemDisplay({
    //   organizationId: organizationEntityId.id
    // });
    // // find the master
    // const rootBusinessGroupDisplay = apBusinessGroupDisplayList.find( (x) => {
    //   return x.apBusinessGroupParentEntityId === undefined;
    // });
    // if(rootBusinessGroupDisplay === undefined) throw new Error(`${logName}: rootBusinessGroupDisplay === undefined`);
    // rootBusinessGroupDisplay.apsBusinessGroupResponse.businessGroupId


    // // copy the roles of each master node
    // const apsOrganizationRolesList: APSOrganizationRolesList = []
    // for(const apsMemberOfOrganizationGroups of apsMemberOfOrganizationGroupsList) {
    //   // find the root
    //   const found = apsMemberOfOrganizationGroups.memberOfBusinessGroupList.find( (x) => {
    //     return x.
    //   });
    //   apsOrganizationRolesList.push({
    //     organizationId: apsMemberOfOrganizationGroups.organizationId,
    //     roles: []
    //   });
    // }
  }
}
class APUsersDisplayService {
  private readonly BaseComponentName = "APUsersDisplayService";

  // TODO: re-work to do deep property names generically
  public nameOf(name: keyof TAPUserDisplay) {
    return name;
  }
  public nameOf_ApsUserResponse(name: keyof APSUserResponse) {
    return `apsUserResponse.${name}`;
  }
  public nameOf_ApsUserResponse_ApsProfile(name: keyof APSUserProfile) {
    return `apsUserResponse.profile.${name}`;
  }
  public map_nameOf_To_APSUser_nameOf(name: string): string {
    if(name.startsWith('apsUserResponse.')) {
      return name.replace('apsUserResponse.', '');
    }
    return name;
  }

  // TODO: this is generic
  // returns the name as string of the property
  // public getPropertyNameString = <T extends Record<string, unknown>>(obj: T, selector: (x: Record<keyof T, keyof T>) => keyof T): keyof T => {
  //   const keyRecord = Object.keys(obj).reduce((res, key) => {
  //     const typedKey = key as keyof T
  //     res[typedKey] = typedKey
  //     return res
  //   }, {} as Record<keyof T, keyof T>)
  //   return selector(keyRecord)
  // }
  public getPropertyNameString = <T extends TAPUserDisplay>(obj: T, selector: (x: Record<keyof T, keyof T>) => keyof T): keyof T => {
    const keyRecord = Object.keys(obj).reduce((res, key) => {
      const typedKey = key as keyof T
      res[typedKey] = typedKey
      return res
    }, {} as Record<keyof T, keyof T>)
    return selector(keyRecord)
  }
  // END: TODO: re-work to do deep property names generically


  private create_EmptyProfile(): APSUserProfile {
    return {
      first: '',
      last: '',
      email: ''
    };
  }
  private create_EmptyApsUserResponse(): APSUserResponse {
    return {
      isActivated: false,
      userId: '',
      password: '',
      profile: this.create_EmptyProfile(),
      systemRoles: [],
      memberOfOrganizations: [],
      memberOfOrganizationGroups: []
    };
  }

  public async create_EmptyObject({organizationId}: {
    organizationId: string | undefined
  }): Promise<TAPUserDisplay> {

    const emptyApsUserResponse: APSUserResponse = this.create_EmptyApsUserResponse();
    const emptyApMemberOfOrganizationGroupDisplayList: TAPMemberOfOrganizationGroupsDisplayList = [];
    if(organizationId !== undefined) {
      const organizationEntityId: TAPEntityId = await APOrganizationsService.getOrganizationEntityId(organizationId);
      emptyApsUserResponse.memberOfOrganizations = [
        {
          organizationId: organizationId,
          organizationDisplayName: organizationEntityId.displayName,
          roles: []
        }
      ];
      const rootBusinessGroupDisplay: TAPBusinessGroupDisplay = await APBusinessGroupsDisplayService.getRootApBusinessGroupDisplay({
        organizationId: organizationId,
      });
      emptyApMemberOfOrganizationGroupDisplayList.push({
        apOrganizationEntityId: organizationEntityId,
        apMemberOfBusinessGroupDisplayList: [{
          apBusinessGroupRoleEntityIdList: [],
          apBusinessGroupDisplay: rootBusinessGroupDisplay,
        }]
      });
    }

    return this.create_ApUserDisplay_From_ApiEntities({
      apsUserResponse: emptyApsUserResponse,
      apOrganizationAssetInfoDisplayList: [],
      apMemberOfOrganizationGroupsDisplayList: emptyApMemberOfOrganizationGroupDisplayList
    });
  }

  public createUserDisplayName(apsUserProfile: APSUserProfile): string {
    return `${apsUserProfile.first} ${apsUserProfile.last}`;
  }
  protected create_ApUserDisplay_From_ApiEntities({apsUserResponse, apOrganizationAssetInfoDisplayList, apMemberOfOrganizationGroupsDisplayList}: {
    apsUserResponse: APSUserResponse;
    apOrganizationAssetInfoDisplayList: TAPOrganizationAssetInfoDisplayList;
    apMemberOfOrganizationGroupsDisplayList: TAPMemberOfOrganizationGroupsDisplayList
  }): TAPUserDisplay {

    const base: TAPUserDisplay = {
      apEntityId: {
        id: apsUserResponse.userId,
        displayName: this.createUserDisplayName(apsUserResponse.profile)
      },
      apsUserResponse: apsUserResponse,
      apSystemRoleEntityIdList: APRbacDisplayService.getSystemRolesEntityIdList(apsUserResponse.systemRoles),
      apMemberOfOrganizationNameListAsString: 'todo',
      apOrganizationAssetInfoDisplayList: apOrganizationAssetInfoDisplayList,
      apMemberOfOrganizationGroupsDisplayList: apMemberOfOrganizationGroupsDisplayList,
      deprecated_viewMemberOfOrganizations: [],
      apSearchContent: ''
    };
    return APSearchContentService.add_SearchContent<TAPUserDisplay>(base);
  }

  public create_ApBusinessGroupEntityIdList_From_ApMemberOfBusinessGroupDisplayList({apMemberOfBusinessGroupDisplayList}: {
    apMemberOfBusinessGroupDisplayList: TAPMemberOfBusinessGroupDisplayList
  }): TAPEntityIdList {
    return apMemberOfBusinessGroupDisplayList.map( (apMemberOfBusinessGroupDisplay: TAPMemberOfBusinessGroupDisplay) => {
      return apMemberOfBusinessGroupDisplay.apBusinessGroupDisplay.apEntityId
    });
  }

  public find_ApMemberOfBusinessGroupDisplayList({organizationId, apUserDisplay }: {
    organizationId: string;
    apUserDisplay: TAPUserDisplay;
  }): TAPMemberOfBusinessGroupDisplayList {
    const funcName = 'find_ApMemberOfBusinessGroupDisplayList';
    const logName = `${this.BaseComponentName}.${funcName}()`;

    const found = apUserDisplay.apMemberOfOrganizationGroupsDisplayList.find( (x) => {
      return x.apOrganizationEntityId.id === organizationId;
    });
    if(found === undefined) throw new Error(`${logName}: found === undefined`);
    return found.apMemberOfBusinessGroupDisplayList;
  }

  public get_ApUserProfileDisplay({apUserDisplay}: {
    apUserDisplay: TAPUserDisplay;
  }): TAPUserProfileDisplay {
    return {
      apEntityId: apUserDisplay.apEntityId,
      apsUserProfile: apUserDisplay.apsUserResponse.profile,
    };
  }

  public get_ApUserCredentialsDisplay({ apUserDisplay}: {
    apUserDisplay: TAPUserDisplay;
  }): TAPUserCredentialsDisplay {
    return {
      apEntityId: apUserDisplay.apEntityId,
      password: apUserDisplay.apsUserResponse.password,
    };
  }

  private create_ApMemberOfBusinessGroupTreeNodeDisplay_From_ApMemberOfBusinessGroupDisplay({apMemberOfBusinessGroupsDisplay}:{
    apMemberOfBusinessGroupsDisplay: TAPMemberOfBusinessGroupDisplay;
  }): TAPMemberOfBusinessGroupTreeNodeDisplay {
    const tnDisplay: TAPMemberOfBusinessGroupTreeNodeDisplay = {
      key: apMemberOfBusinessGroupsDisplay.apBusinessGroupDisplay.apEntityId.id,
      label: apMemberOfBusinessGroupsDisplay.apBusinessGroupDisplay.apEntityId.displayName,
      data: apMemberOfBusinessGroupsDisplay,
      children: []
    };
    return tnDisplay;
  }
  private generate_ApMemberOfBusinessGroupsTreeNodeDisplay_From_ApMemberOfBusinessGroupsDisplay({apMemberOfBusinessGroupsDisplay, apMemberOfBusinessGroupsDisplayList}:{
    apMemberOfBusinessGroupsDisplay: TAPMemberOfBusinessGroupDisplay;
    apMemberOfBusinessGroupsDisplayList: TAPMemberOfBusinessGroupDisplayList;
  }): TAPMemberOfBusinessGroupTreeNodeDisplay {
    const funcName = 'generate_ApMemberOfBusinessGroupsTreeNodeDisplay_From_ApMemberOfBusinessGroupsDisplay';
    const logName = `${this.BaseComponentName}.${funcName}()`;
    const thisTreeNode: TAPMemberOfBusinessGroupTreeNodeDisplay = this.create_ApMemberOfBusinessGroupTreeNodeDisplay_From_ApMemberOfBusinessGroupDisplay({
      apMemberOfBusinessGroupsDisplay: apMemberOfBusinessGroupsDisplay
    });
    for(const childEntityId of apMemberOfBusinessGroupsDisplay.apBusinessGroupDisplay.apBusinessGroupChildrenEntityIdList) {
      // find it and add it
      const found: TAPMemberOfBusinessGroupDisplay | undefined = apMemberOfBusinessGroupsDisplayList.find( (x) => {
        return x.apBusinessGroupDisplay.apEntityId.id === childEntityId.id;
      });
      // not a member if not found
      if(found !== undefined) {
        // recurse into child
        const childTreeNodeDisplay: TAPMemberOfBusinessGroupTreeNodeDisplay = this.generate_ApMemberOfBusinessGroupsTreeNodeDisplay_From_ApMemberOfBusinessGroupsDisplay({
          apMemberOfBusinessGroupsDisplay: found,
          apMemberOfBusinessGroupsDisplayList: apMemberOfBusinessGroupsDisplayList
        });
        thisTreeNode.children.push(childTreeNodeDisplay);
      }
    }
    return thisTreeNode;
  }
  private create_ApMemberOfBusinessGroupTreeNodeDisplay({apBusinessGroupDisplay, apMemberOfBusinessGroupsDisplay}:{
    apBusinessGroupDisplay: TAPBusinessGroupDisplay;
    apMemberOfBusinessGroupsDisplay?: TAPMemberOfBusinessGroupDisplay;
  }): TAPMemberOfBusinessGroupTreeNodeDisplay {
    const tnDisplay: TAPMemberOfBusinessGroupTreeNodeDisplay = {
      key: apBusinessGroupDisplay.apEntityId.id,
      label: apBusinessGroupDisplay.apEntityId.displayName,
      data: {
        apBusinessGroupDisplay: apBusinessGroupDisplay,
        apBusinessGroupRoleEntityIdList: apMemberOfBusinessGroupsDisplay ? apMemberOfBusinessGroupsDisplay.apBusinessGroupRoleEntityIdList : []
      },
      children: []
    };
    return tnDisplay;
  }
  private generate_ApMemberOfBusinessGroupsTreeNodeDisplay_From_ApBusinessGroupDisplay({
    apBusinessGroupDisplay,
    apMemberOfBusinessGroupDisplayList,
    apBusinessGroupDisplayList        
  }:{
    apBusinessGroupDisplay: TAPBusinessGroupDisplay;
    apMemberOfBusinessGroupDisplayList: TAPMemberOfBusinessGroupDisplayList;
    apBusinessGroupDisplayList: TAPBusinessGroupDisplayList;
  }): TAPMemberOfBusinessGroupTreeNodeDisplay {
    const funcName = 'generate_ApMemberOfBusinessGroupsTreeNodeDisplay_From_ApBusinessGroupDisplay';
    const logName = `${this.BaseComponentName}.${funcName}()`;

    const found: TAPMemberOfBusinessGroupDisplay | undefined = apMemberOfBusinessGroupDisplayList.find( (x) => {
      return x.apBusinessGroupDisplay.apEntityId.id === apBusinessGroupDisplay.apEntityId.id;
    });
    const thisTreeNode: TAPMemberOfBusinessGroupTreeNodeDisplay = this.create_ApMemberOfBusinessGroupTreeNodeDisplay({
      apBusinessGroupDisplay: apBusinessGroupDisplay,
      apMemberOfBusinessGroupsDisplay: found
    });
    for(const childEntityId of apBusinessGroupDisplay.apBusinessGroupChildrenEntityIdList) {
      // find it and add it
      const found: TAPBusinessGroupDisplay | undefined = apBusinessGroupDisplayList.find( (x) => {
        return x.apEntityId.id === childEntityId.id;
      });
      if(found === undefined) throw new Error(`${logName}: found === undefined`);
      // recurse into child
      const childTreeNodeDisplay: TAPMemberOfBusinessGroupTreeNodeDisplay = this.generate_ApMemberOfBusinessGroupsTreeNodeDisplay_From_ApBusinessGroupDisplay({
        apBusinessGroupDisplay: found,
        apMemberOfBusinessGroupDisplayList: apMemberOfBusinessGroupDisplayList,
        apBusinessGroupDisplayList: apBusinessGroupDisplayList,
      });
      thisTreeNode.children.push(childTreeNodeDisplay);
    }
    return thisTreeNode;
  }
  public generate_ApMemberOfBusinessGroupsTreeNodeDisplay({ apMemberOfBusinessGroupDisplayList, apBusinessGroupDisplayList }:{
    apMemberOfBusinessGroupDisplayList: TAPMemberOfBusinessGroupDisplayList;
    apBusinessGroupDisplayList: TAPBusinessGroupDisplayList;
  }): TAPMemberOfBusinessGroupTreeNodeDisplayList {
    const list: TAPMemberOfBusinessGroupTreeNodeDisplayList = [];
    // create complete tree of all business groups, with empty roles list where empty
    for(const apBusinessGroupDisplay of apBusinessGroupDisplayList) {
      if(apBusinessGroupDisplay.apBusinessGroupParentEntityId === undefined) {
        const masterTreeNode: TAPMemberOfBusinessGroupTreeNodeDisplay = this.generate_ApMemberOfBusinessGroupsTreeNodeDisplay_From_ApBusinessGroupDisplay({
          apBusinessGroupDisplay: apBusinessGroupDisplay,
          apMemberOfBusinessGroupDisplayList: apMemberOfBusinessGroupDisplayList,
          apBusinessGroupDisplayList: apBusinessGroupDisplayList,
        });
        list.push(masterTreeNode);
      }      
    }
    // alert(`list still has the root node as top node, flattten me...`)
    return list;

    // for(const apMemberOfBusinessGroupsDisplay of apMemberOfBusinessGroupsDisplayList) {
    //   if(apMemberOfBusinessGroupsDisplay.apBusinessGroupDisplay.apBusinessGroupParentEntityId === undefined) {
    //     const masterTreeNode: TAPMemberOfBusinessGroupTreeNodeDisplay = this.generate_ApMemberOfBusinessGroupsTreeNodeDisplay_From_ApMemberOfBusinessGroupsDisplay({
    //       apMemberOfBusinessGroupsDisplay: apMemberOfBusinessGroupsDisplay,
    //       apMemberOfBusinessGroupsDisplayList: apMemberOfBusinessGroupsDisplayList,
    //     });
    //     list.push(masterTreeNode);
    //   }
    // }
    // // if only 1 master, flatten without master
    // if(list.length === 1) {
    //   const finalList: TAPMemberOfBusinessGroupTreeNodeDisplayList = [];
    //   const master: TAPMemberOfBusinessGroupTreeNodeDisplay = list[0];
    //   for(const child of master.children) {
    //     finalList.push(child);
    //   }
    //   return finalList;
    // } else {
    //   return list;
    // }
  }

  private async get_ApMemberOfBusinessGroupDisplayList({organizationId, apsUserResponse }: {
    organizationId: string;
    apsUserResponse: APSUserResponse;
  }): Promise<TAPMemberOfBusinessGroupDisplayList> {
    const funcName = 'get_ApMemberOfBusinessGroupDisplayList';
    const logName = `${this.BaseComponentName}.${funcName}()`;
    const found = apsUserResponse.memberOfOrganizationGroups?.find( (x: APSMemberOfOrganizationGroups) => {
      return x.organizationId === organizationId;
    });
    if(found === undefined) throw new Error(`${logName}: found === undefined`);
    const apMemberOfBusinessGroupDisplayList: TAPMemberOfBusinessGroupDisplayList = [];
    for(const apsMemberOfBusinessGroup of found.memberOfBusinessGroupList) {
      const apBusinessGroupDisplay: TAPBusinessGroupDisplay = await APBusinessGroupsDisplayService.getApBusinessGroupDisplay({
        organizationId: organizationId,
        businessGroupId: apsMemberOfBusinessGroup.businessGroupId
      });
      apMemberOfBusinessGroupDisplayList.push({
        // businessGroupId: apsMemberOfBusinessGroup.businessGroupId,
        apBusinessGroupDisplay: apBusinessGroupDisplay,
        apBusinessGroupRoleEntityIdList: APRbacDisplayService.getBusinessGroupRolesEntityIdList(apsMemberOfBusinessGroup.roles)
      });
    }
    return apMemberOfBusinessGroupDisplayList;
  }

  public async getConnectorUser({ organizationId, userId}: {
    organizationId: string;
    userId: string;
  }): Promise<Developer | undefined> {
    try {
      const connectorDeveloper: Developer = await DevelopersService.getDeveloper({
        organizationName: organizationId, 
        developerUsername: userId
      });
      return connectorDeveloper;
    } catch(e: any) {
      if(APClientConnectorOpenApi.isInstanceOfApiError(e)) {
        const apiError: ApiError = e;
        if(apiError.status !== 404) throw e;
      } else throw e; 
    }
    return undefined;
  }

  private async getUserAssetList({apsUserResponse, organizationId}: {
    apsUserResponse: APSUserResponse;
    organizationId?: string;
  }): Promise<TAPOrganizationAssetInfoDisplayList> {
    const funcName = 'getUserAssetList';
    const logName = `${this.BaseComponentName}.${funcName}()`;

    // create the org list
    let organizationIdList: Array<string> = [];
    if(organizationId !== undefined) {
      // one org only
      const found = apsUserResponse.memberOfOrganizationGroups?.find( (apsMemberOfOrganizationGroups: APSMemberOfOrganizationGroups) => {
        return apsMemberOfOrganizationGroups.organizationId === organizationId;
      });
      if(found === undefined) throw new Error(`${logName}: cannot find organizationId=${organizationId} in apsUserResponse.memberOfOrganizationGroups=${JSON.stringify(apsUserResponse.memberOfOrganizationGroups, null, 2)}`);
      organizationIdList.push(found.organizationId);
    } else {
      // all orgs
      const list = apsUserResponse.memberOfOrganizationGroups?.map( (apsMemberOfOrganizationGroups: APSMemberOfOrganizationGroups) => {
        return apsMemberOfOrganizationGroups.organizationId;
      });
      if(list !== undefined) organizationIdList = list;
    }
    const organizationEntityIdList: TAPEntityIdList = await APOrganizationsService.listOrganizationEntityIdList_For_OrganizationIdList({
      organizationIdList: organizationIdList
    });

    const apOrganizationAssetInfoDisplayList: TAPOrganizationAssetInfoDisplayList = await APAssetDisplayService.getApAssetInfoListForUser({
      organizationEntityIdList: organizationEntityIdList,
      userId: apsUserResponse.userId
    });
    return apOrganizationAssetInfoDisplayList;
  }

  public async getApUserDisplay({ userId, organizationId }: {
    userId: string;
    organizationId?: string;
  }): Promise<TAPUserDisplay> {
    const funcName = 'getApUserDisplay';
    const logName = `${this.BaseComponentName}.${funcName}()`;

    const apsUserResponse: APSUserResponse = await ApsUsersService.getApsUser({
      userId: userId
    });
    if(apsUserResponse.password !== undefined) apsUserResponse.password = '';
    const apOrganizationAssetInfoDisplayList: TAPOrganizationAssetInfoDisplayList = await this.getUserAssetList({
      apsUserResponse: apsUserResponse,
      organizationId: organizationId
    });
    const apOrganizationEntityIdList: TAPEntityIdList = await APOrganizationsService.listOrganizationEntityIdList();
    const apMemberOfOrganizationGroupsDisplayList: TAPMemberOfOrganizationGroupsDisplayList = [];
    if(apsUserResponse.memberOfOrganizationGroups !== undefined) {
      for(const apsMemberOfOrganizationGroups of apsUserResponse.memberOfOrganizationGroups) {
        const organizationEntityId: TAPEntityId | undefined = apOrganizationEntityIdList.find( (x) => {
          return x.id === apsMemberOfOrganizationGroups.organizationId;
        });
        if(organizationEntityId === undefined) throw new Error(`${logName}: organizationEntityId === undefined`);

        apMemberOfOrganizationGroupsDisplayList.push({
          apOrganizationEntityId: organizationEntityId,
          apMemberOfBusinessGroupDisplayList: await this.get_ApMemberOfBusinessGroupDisplayList({
            organizationId: organizationEntityId.id,
            apsUserResponse: apsUserResponse
          })
        });


        // for(const apsMemberOfBusinessGroup of apsMemberOfOrganizationGroups.memberOfBusinessGroupList) {
        //   apMemberOfOrganizationGroupsDisplayList.push({
        //     apOrganizationEntityId: organizationEntityId,
        //     apMemberOfBusinessGroupDisplayList: await this.get_ApMemberOfBusinessGroupDisplayList({
        //       organizationId: organizationEntityId.id,
        //       apsUserResponse: apsUserResponse
        //     })
        //   })
        // }
      }
    }
    return this.create_ApUserDisplay_From_ApiEntities({
      apsUserResponse: apsUserResponse,
      apOrganizationAssetInfoDisplayList: apOrganizationAssetInfoDisplayList,
      apMemberOfOrganizationGroupsDisplayList: apMemberOfOrganizationGroupsDisplayList
    });
  }

  public async listApUserDisplay({
    pageSize = 20,
    pageNumber = 1,
    sortFieldName,
    sortDirection,
    searchWordList,
    searchOrganizationId,
    excludeSearchOrganizationId,
    searchIsActivated,
    searchUserId,
  }: {
    pageSize?: number,
    pageNumber?: number,
    sortFieldName?: string,
    sortDirection?: EAPSSortDirection,
    searchWordList?: string,
    searchOrganizationId?: string,
    excludeSearchOrganizationId?: string,
    searchIsActivated?: boolean,
    searchUserId?: string,
  }): Promise<TAPUserDisplayListResponse> {

    const funcName = 'listApUserDisplay';
    const logName = `${this.BaseComponentName}.${funcName}()`;

    const listApsUsersResponse: ListApsUsersResponse = await ApsUsersService.listApsUsers({
      pageSize: pageSize,
      pageNumber: pageNumber,
      sortFieldName: sortFieldName,
      sortDirection: sortDirection,
      searchWordList: searchWordList ? Globals.encodeRFC5987ValueChars(searchWordList) : undefined,
      searchOrganizationId: searchOrganizationId,
    });
  
    const list: TAPUserDisplayList = [];
    for(const apsUserResponse of listApsUsersResponse.list) {
      const apUserDisplay: TAPUserDisplay = await this.getApUserDisplay({
        organizationId: searchOrganizationId,
        userId: apsUserResponse.userId
      });
      list.push(apUserDisplay);
    }
    return {
      meta: listApsUsersResponse.meta,
      apUserDisplayList: list
    };
  }

  private create_APSMemberOfOrganizationGroupsList_From_ApMemberOfOrganizationGroupsDisplayList(apMemberOfOrganizationGroupsDisplayList: TAPMemberOfOrganizationGroupsDisplayList): APSMemberOfOrganizationGroupsList {
    const apsMemberOfOrganizationGroupsList: APSMemberOfOrganizationGroupsList = [];
    for(const apMemberOfOrganizationGroupsDisplay of apMemberOfOrganizationGroupsDisplayList) {
      const apsMemberOfOrganizationGroups: APSMemberOfOrganizationGroups = {
        organizationId: apMemberOfOrganizationGroupsDisplay.apOrganizationEntityId.id,
        memberOfBusinessGroupList: []
      }
      for(const apMemberOfBusinessGroupDisplay of apMemberOfOrganizationGroupsDisplay.apMemberOfBusinessGroupDisplayList) {
        const apsMemberOfBusinessGroup: APSMemberOfBusinessGroup = {
          businessGroupId: apMemberOfBusinessGroupDisplay.apBusinessGroupDisplay.apEntityId.id,
          roles: APEntityIdsService.create_IdList(apMemberOfBusinessGroupDisplay.apBusinessGroupRoleEntityIdList) as APSBusinessGroupAuthRoleList,
        }
        apsMemberOfOrganizationGroups.memberOfBusinessGroupList.push(apsMemberOfBusinessGroup);
      }
      apsMemberOfOrganizationGroupsList.push(apsMemberOfOrganizationGroups);
    }
    return apsMemberOfOrganizationGroupsList;
  }

  public async replaceApUserDisplay({
    userId,
    apUserDisplay
  }: {
    userId: string;
    apUserDisplay: TAPUserDisplay
  }): Promise<void> {
    const funcName = 'replaceApUserDisplay';
    const logName = `${this.BaseComponentName}.${funcName}()`;

    const replace: APSUserReplace = {
      isActivated: apUserDisplay.apsUserResponse.isActivated,
      password: apUserDisplay.apsUserResponse.password,
      profile: apUserDisplay.apsUserResponse.profile,
      systemRoles: APEntityIdsService.create_IdList(apUserDisplay.apSystemRoleEntityIdList) as APSSystemAuthRoleList,
      memberOfOrganizationGroups: this.create_APSMemberOfOrganizationGroupsList_From_ApMemberOfOrganizationGroupsDisplayList(apUserDisplay.apMemberOfOrganizationGroupsDisplayList),
      // TODO: remove once removed
      memberOfOrganizations: LegacyManageUsers.transformAPSOrganizationRolesResponseListToAPSOrganizationRolesList(apUserDisplay.apsUserResponse.memberOfOrganizations),
    }
    await ApsUsersService.replaceApsUser({
      userId: userId, 
      requestBody: replace
    });
  }

  /**
   * Create APSUser from a TAPUserDisplay.
   * 
   * Maps:
   * - userId: apUserDisplay.apEntity.id
   * - isActivated: apUserDisplay.apsUserResponse.isActivated,
   * - password: apUserDisplay.apsUserResponse.password,
   * - profile: apUserDisplay.apsUserResponse.profile,
   * - systemRoles: apUserDisplay.apSystemRoleEntityIdList
   * - memberOfOrganizationGroups: apUserDisplay.apMemberOfOrganizationGroupsDisplayList
   * @return void
   * @throws ApiError
   */
  public async createApUserDisplay({
    apUserDisplay
  }: {
    apUserDisplay: TAPUserDisplay
  }): Promise<void> {
    const funcName = 'createApUserDisplay';
    const logName = `${this.BaseComponentName}.${funcName}()`;

    const create: APSUser = {
      userId: apUserDisplay.apEntityId.id,
      isActivated: apUserDisplay.apsUserResponse.isActivated,
      password: apUserDisplay.apsUserResponse.password,
      profile: apUserDisplay.apsUserResponse.profile,
      systemRoles: APEntityIdsService.create_IdList(apUserDisplay.apSystemRoleEntityIdList) as APSSystemAuthRoleList,
      memberOfOrganizationGroups: this.create_APSMemberOfOrganizationGroupsList_From_ApMemberOfOrganizationGroupsDisplayList(apUserDisplay.apMemberOfOrganizationGroupsDisplayList),
      // TODO: remove once removed
      memberOfOrganizations: LegacyManageUsers.transformAPSOrganizationRolesResponseListToAPSOrganizationRolesList(apUserDisplay.apsUserResponse.memberOfOrganizations),
    }
    await ApsUsersService.createApsUser({
      requestBody: create
    });
  }

  private async updateApsUser({
    userId, apsUserUpdate
  }: {
    userId: string;
    apsUserUpdate: APSUserUpdate,
  }): Promise<void> {
    const funcName = 'updateApsUser';
    const logName = `${this.BaseComponentName}.${funcName}()`;

    await ApsUsersService.updateApsUser({
      userId: userId, 
      requestBody: apsUserUpdate
    });
  }

  public async updateApUserProfileDisplay({
    apUserProfileDisplay
  }: {
    apUserProfileDisplay: TAPUserProfileDisplay,
  }): Promise<void> {
    const funcName = 'updateApUserDisplay';
    const logName = `${this.BaseComponentName}.${funcName}()`;

    const update: APSUserUpdate = {
      profile: {
        email: apUserProfileDisplay.apsUserProfile.email,
        first: apUserProfileDisplay.apsUserProfile.first,
        last: apUserProfileDisplay.apsUserProfile.last,
      }
    }
    await this.updateApsUser({ 
      userId: apUserProfileDisplay.apEntityId.id,
      apsUserUpdate: update
    });
  }

  public async updateApUserCredentialsDisplay({
    apUserCredentialsDisplay
  }: {
    apUserCredentialsDisplay: TAPUserCredentialsDisplay  
  }): Promise<void> {
    const funcName = 'updateApUserCredentialsDisplay';
    const logName = `${this.BaseComponentName}.${funcName}()`;

    const update: APSUserUpdate = {
      password: apUserCredentialsDisplay.password
    }
    await this.updateApsUser({ 
      userId: apUserCredentialsDisplay.apEntityId.id,
      apsUserUpdate: update
    })
  }

  public async updateApMemberOfBusinessGroupDisplayList({
    organizationEntityId,
    apUserDisplay,
    apMemberOfBusinessGroupDisplayList
  }: {
    organizationEntityId: TAPEntityId;
    apUserDisplay: TAPUserDisplay;
    apMemberOfBusinessGroupDisplayList: TAPMemberOfBusinessGroupDisplayList  
  }): Promise<void> {
    const funcName = 'updateApMemberOfBusinessGroupDisplayList';
    const logName = `${this.BaseComponentName}.${funcName}()`;

    const existingIndex = apUserDisplay.apMemberOfOrganizationGroupsDisplayList.findIndex( (apMemberOfOrganizationGroupsDisplay: TAPMemberOfOrganizationGroupsDisplay) => {
      return apMemberOfOrganizationGroupsDisplay.apOrganizationEntityId.id === organizationEntityId.id;
    });
    if(existingIndex > -1) {
      // replace
      apUserDisplay.apMemberOfOrganizationGroupsDisplayList[existingIndex].apMemberOfBusinessGroupDisplayList = apMemberOfBusinessGroupDisplayList;
    } else {
      // add
      apUserDisplay.apMemberOfOrganizationGroupsDisplayList.push({
        apOrganizationEntityId: organizationEntityId,
        apMemberOfBusinessGroupDisplayList: apMemberOfBusinessGroupDisplayList
      });      
    }
    const apsMemberOfOrganizationGroupsList: APSMemberOfOrganizationGroupsList = this.create_APSMemberOfOrganizationGroupsList_From_ApMemberOfOrganizationGroupsDisplayList(apUserDisplay.apMemberOfOrganizationGroupsDisplayList);
    const legacyApsOrganizationRolesList: APSOrganizationRolesList = await LegacyManageUsers.create_ApsOrganizationRolesList_From_ApsMemberOfOrganizationGroupsList(organizationEntityId, apsMemberOfOrganizationGroupsList);
    const update: APSUserUpdate = {
      memberOfOrganizationGroups: apsMemberOfOrganizationGroupsList,
      // TODO: remove once removed
      memberOfOrganizations: legacyApsOrganizationRolesList,
    }
    await this.updateApsUser({ 
      userId: apUserDisplay.apEntityId.id,
      apsUserUpdate: update
    })
  }
}

export default new APUsersDisplayService();
