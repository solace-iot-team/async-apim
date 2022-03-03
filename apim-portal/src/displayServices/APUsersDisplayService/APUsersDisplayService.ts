import { DataTableSortOrderType } from 'primereact/datatable';

import { ApiError, Developer, DevelopersService } from '@solace-iot-team/apim-connector-openapi-browser';
import { APClientConnectorOpenApi } from '../../utils/APClientConnectorOpenApi';
import APEntityIdsService, { 
  IAPEntityIdDisplay, 
  TAPEntityId, 
  TAPEntityIdList 
} from '../../utils/APEntityIdsService';
import { APOrganizationsService } from '../../utils/APOrganizationsService';
import APSearchContentService, { 
  IAPSearchContent
 } from '../../utils/APSearchContentService';
import { 
  APSBusinessGroupAuthRoleList,
  APSListResponseMeta,
  APSMemberOfBusinessGroup,
  APSMemberOfOrganizationGroups,
  APSMemberOfOrganizationGroupsList,
  APSOrganizationAuthRoleList,
  APSOrganizationRolesList,
  APSOrganizationRolesResponse,
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
} from '../../_generated/@solace-iot-team/apim-server-openapi-browser';
import APBusinessGroupsDisplayService, { 
  TAPBusinessGroupDisplay, 
  TAPBusinessGroupDisplayList 
} from '../APBusinessGroupsDisplayService';
import APRbacDisplayService from '../APRbacDisplayService';
import APAssetDisplayService, { 
  TAPOrganizationAssetInfoDisplayList 
} from '../APAssetsDisplayService';
import { Globals } from '../../utils/Globals';
import { APSClientOpenApi } from '../../utils/APSClientOpenApi';
import { APLegacyUserDisplayService } from './APLegacyUserDisplayService';

/**
 * rework:
 * Base Class
 * ap does not have apsUserResponse in it
 * get, set for all sub-elements
 * clone to create a clone
 * generate_ tree nodes and reverse
 * create_from_apsApiEntities (when getting it)
 * transform to APSUserUpdate, APSUserCreate, ...
 * APOrganizationUserDisplay and APSystemUserDisplay
 */



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
  apConfiguredBusinessGroupRoleEntityIdList: TAPEntityIdList;
  apCalculatedBusinessGroupRoleEntityIdList: TAPEntityIdList;
}
export type TAPMemberOfBusinessGroupDisplayList = Array<TAPMemberOfBusinessGroupDisplay>;

export type TAPMemberOfOrganizationBusinessGroupsDisplay = IAPEntityIdDisplay & {
  apMemberOfBusinessGroupDisplayList: TAPMemberOfBusinessGroupDisplayList;
}
export type TAPMemberOfOrganizationBusinessGroupsDisplayList = Array<TAPMemberOfOrganizationBusinessGroupsDisplay>;

export type TAPMemberOfOrganizationRolesDisplay = IAPEntityIdDisplay & {
  apOrganizationAuthRoleEntityIdList: TAPEntityIdList;
}
export type TAPMemberOfOrganizationRolesDisplayList = Array<TAPMemberOfOrganizationRolesDisplay>;


export type TAPUserAuthenticationDisplay = {
  isActivated: boolean;
  password: string;
}

export interface IAPUserDisplay extends IAPEntityIdDisplay, IAPSearchContent {

  apUserProfileDisplay: TAPUserProfileDisplay;

  apUserAuthenticationDisplay: TAPUserAuthenticationDisplay;

  apSystemRoleEntityIdList: TAPEntityIdList;

  // TODO: only for system user
  // apMemberOfOrganizationRolesDisplayList: TAPMemberOfOrganizationRolesDisplayList;
  // apMemberOfOrganizationBusinessGroupsDisplayList: TAPMemberOfOrganizationBusinessGroupsDisplayList;


}
export type TAPUserDisplayList = Array<IAPUserDisplay>;
export type TAPUserDisplayListResponse = APSListResponseMeta & {
  apUserDisplayList: TAPUserDisplayList;
}

export type TAPUserProfileDisplay = IAPEntityIdDisplay & APSUserProfile;

// export type TAPUserCredentialsDisplay = IAPEntityIdDisplay & {
//   password: string;
// }
// export type TAPUserOrganizationRolesDisplay = IAPEntityIdDisplay & {
//   apOrganizationAuthRoleEntityIdList: TAPEntityIdList;
// }

export type TAPCheckOrganizationUserExistsResult = {
  existsInOrganization: boolean;
  exists: boolean;
}

export class APUsersDisplayService {
  private readonly BaseComponentName = "APUsersDisplayService";

  // TODO: re-work to do deep property names generically
  public nameOf(name: keyof IAPUserDisplay) {
    return name;
  }
  public nameOf_ApUserProfileDisplay(name: keyof TAPUserProfileDisplay) {
    return `apUserProfileDisplay.${name}`;
  }
  public nameOf_ApUserAuthenticationDisplay(name: keyof TAPUserAuthenticationDisplay) {
    return `apUserAuthenticationDisplay.${name}`;
  }

  protected map_ApFieldName_To_ApsFieldName(apFieldName?: string): string | undefined {
    if(apFieldName === undefined) return undefined;
    if(apFieldName.startsWith('apUserProfileDisplay')) return apFieldName.replace('apUserProfileDisplay.', 'profile.');
    else if(apFieldName.startsWith('apUserAuthenticationDisplay')) return apFieldName.replace('apUserAuthenticationDisplay.', '');
    return apFieldName;
  }

  public map_ApUserDisplayFieldName_To_APSUserFieldName(apUserDisplayFieldName: string): string {
    if(apUserDisplayFieldName.startsWith('apUserProfileDisplay')) return apUserDisplayFieldName.replace('apUserProfileDisplay.', 'profile.');
    else if(apUserDisplayFieldName.startsWith('apUserAuthenticationDisplay')) return apUserDisplayFieldName.replace('apUserAuthenticationDisplay.', '');
    return apUserDisplayFieldName;
  }
  

  // public map_nameOf_To_APSUser_nameOf(name: string): string {
  //   if(name.startsWith('apsUserResponse.')) {
  //     return name.replace('apsUserResponse.', '');
  //   }
  //   return name;
  // }

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
  public getPropertyNameString = <T extends IAPUserDisplay>(obj: T, selector: (x: Record<keyof T, keyof T>) => keyof T): keyof T => {
    const keyRecord = Object.keys(obj).reduce((res, key) => {
      const typedKey = key as keyof T
      res[typedKey] = typedKey
      return res
    }, {} as Record<keyof T, keyof T>)
    return selector(keyRecord)
  }
  // END: TODO: re-work to do deep property names generically


  public create_Empty_ApUserProfileDisplay(): TAPUserProfileDisplay {
    return {
      apEntityId: APEntityIdsService.create_EmptyObject(),
      email: '',
      first: '',
      last: '',
    }
  }

  public create_Empty_ApUserAutheticationDisplay(): TAPUserAuthenticationDisplay {
    return {
      isActivated: false,
      password: '',
    };
  }

  public create_Empty_ApUserDisplay(): IAPUserDisplay {
    const apUserDisplay: IAPUserDisplay = {
      apEntityId: APEntityIdsService.create_EmptyObject(),
      apUserProfileDisplay: this.create_Empty_ApUserProfileDisplay(),
      apUserAuthenticationDisplay: this.create_Empty_ApUserAutheticationDisplay(),
      apSystemRoleEntityIdList: [],
      apSearchContent: '',
    };
    return apUserDisplay;
  }

  public create_UserEntityId({apsUserResponse}:{
    apsUserResponse: APSUserResponse;
  }): TAPEntityId {
    return { id: apsUserResponse.userId, displayName: this.create_UserDisplayName(apsUserResponse.profile)};
  }

  public create_UserDisplayName(apsUserProfile: APSUserProfile): string {
    return `${apsUserProfile.first} ${apsUserProfile.last}`;
  }

  public create_MemberOfOrganizationEntityIdList({apMemberOfOrganizationBusinessGroupsDisplayList}: {
    apMemberOfOrganizationBusinessGroupsDisplayList: TAPMemberOfOrganizationBusinessGroupsDisplayList
  }): TAPEntityIdList {
    return APEntityIdsService.sort_byDisplayName(APEntityIdsService.create_EntityIdList_From_ApDisplayObjectList(apMemberOfOrganizationBusinessGroupsDisplayList));
  }

  protected create_ApUserProfileDisplay({userEntityId, apsUserProfile}:{
    userEntityId: TAPEntityId;
    apsUserProfile: APSUserProfile
  }): TAPUserProfileDisplay {
    const apUserProfileDisplay: TAPUserProfileDisplay = {
      apEntityId: userEntityId,
      email: apsUserProfile.email,
      first: apsUserProfile.first,
      last: apsUserProfile.last
    };
    return apUserProfileDisplay;
  }
  protected create_ApUserAuthenticationDisplay({apsUserResponse}:{
    apsUserResponse: APSUserResponse;
  }): TAPUserAuthenticationDisplay {
    const apUserAuthenticationDisplay: TAPUserAuthenticationDisplay = {
      isActivated: apsUserResponse.isActivated,
      password: '***',
    };
    return apUserAuthenticationDisplay;
  }
  protected create_ApUserDisplay_From_ApiEntities({apsUserResponse}: {
    apsUserResponse: APSUserResponse;
  }): IAPUserDisplay {
    const userEntityId: TAPEntityId = this.create_UserEntityId({ apsUserResponse: apsUserResponse});
    const base: IAPUserDisplay = {
      apEntityId: userEntityId,
      apUserProfileDisplay: this.create_ApUserProfileDisplay({ userEntityId: userEntityId, apsUserProfile: apsUserResponse.profile}),
      apUserAuthenticationDisplay: this.create_ApUserAuthenticationDisplay({ apsUserResponse: apsUserResponse }),
      apSystemRoleEntityIdList: APRbacDisplayService.create_SystemRoles_EntityIdList(apsUserResponse.systemRoles),
      apSearchContent: ''
    };
    return base;
  }

  public create_ApBusinessGroupEntityIdList_From_ApMemberOfBusinessGroupDisplayList({apMemberOfBusinessGroupDisplayList}: {
    apMemberOfBusinessGroupDisplayList: TAPMemberOfBusinessGroupDisplayList
  }): TAPEntityIdList {
    return apMemberOfBusinessGroupDisplayList.map( (apMemberOfBusinessGroupDisplay: TAPMemberOfBusinessGroupDisplay) => {
      return apMemberOfBusinessGroupDisplay.apBusinessGroupDisplay.apEntityId
    });
  }

  public create_CalculatedBusinessGroupRoles_EntityIdList({businessGroupId, apBusinessGroupDisplayList, apsMemberOfOrganizationGroups}:{
    businessGroupId: string;
    apBusinessGroupDisplayList: TAPBusinessGroupDisplayList;
    apsMemberOfOrganizationGroups: APSMemberOfOrganizationGroups
  }): TAPEntityIdList {
    const funcName = 'create_CalculatedBusinessGroupRoles_EntityIdList';
    const logName = `${this.BaseComponentName}.${funcName}()`;

    const _create_EntityIdList = (businessGroupId: string, apBusinessGroupDisplayList: TAPBusinessGroupDisplayList, apsMemberOfOrganizationGroups: APSMemberOfOrganizationGroups) => {
      // collect roles, walk up parent tree & collect roles, then de-dup
      const thisMemberOfBusinessGroup: APSMemberOfBusinessGroup | undefined = apsMemberOfOrganizationGroups.memberOfBusinessGroupList.find( (x) => {
        return x.businessGroupId === businessGroupId;
      });
      // user may not have roles in every parent group
      const thisRolesEntityIdList: TAPEntityIdList = [];
      if(thisMemberOfBusinessGroup !== undefined) thisRolesEntityIdList.push(...APRbacDisplayService.create_BusinessGroupRoles_EntityIdList(thisMemberOfBusinessGroup.roles));
      // collect the parent roles
      const apBusinessGroupDisplay: TAPBusinessGroupDisplay | undefined = apBusinessGroupDisplayList.find( (x) => {
        return x.apEntityId.id === businessGroupId;
      });
      if(apBusinessGroupDisplay === undefined) throw new Error(`${logName}: apBusinessGroupDisplay === undefined`);
      if(apBusinessGroupDisplay.apBusinessGroupParentEntityId !== undefined) {
        // alert(`${logName}: apBusinessGroupDisplay.apBusinessGroupParentEntityId = ${JSON.stringify(apBusinessGroupDisplay.apBusinessGroupParentEntityId)}`);
        thisRolesEntityIdList.push(...this.create_CalculatedBusinessGroupRoles_EntityIdList({
          businessGroupId: apBusinessGroupDisplay.apBusinessGroupParentEntityId.id,
          apBusinessGroupDisplayList: apBusinessGroupDisplayList,
          apsMemberOfOrganizationGroups: apsMemberOfOrganizationGroups
        }));
      }
      return thisRolesEntityIdList;
    }
    const dupRolesEntityIdList: TAPEntityIdList = _create_EntityIdList(businessGroupId, apBusinessGroupDisplayList, apsMemberOfOrganizationGroups);
    // de-dup list
    return APEntityIdsService.create_deduped_EntityIdList(dupRolesEntityIdList);
  }

  public get_ApUserProfileDisplay({apUserDisplay}: {
    apUserDisplay: IAPUserDisplay;
  }): TAPUserProfileDisplay {
    return apUserDisplay.apUserProfileDisplay;
  }

  public set_ApUserProfileDisplay({ apUserDisplay, apUserProfileDisplay }: {
    apUserDisplay: IAPUserDisplay;
    apUserProfileDisplay: TAPUserProfileDisplay;
  }): IAPUserDisplay {
    apUserDisplay.apEntityId = apUserProfileDisplay.apEntityId;
    apUserDisplay.apUserProfileDisplay = apUserProfileDisplay;
    return apUserDisplay;
  }

  public get_ApUserAuthenticationDisplay({ apUserDisplay}: {
    apUserDisplay: IAPUserDisplay;
  }): TAPUserAuthenticationDisplay {
    return apUserDisplay.apUserAuthenticationDisplay;
  }

  public set_ApUserAuthenticationDisplay({ apUserDisplay, apUserAuthenticationDisplay }: {
    apUserDisplay: IAPUserDisplay;
    apUserAuthenticationDisplay: TAPUserAuthenticationDisplay;
  }): IAPUserDisplay {
    apUserDisplay.apUserAuthenticationDisplay = apUserAuthenticationDisplay;
    return apUserDisplay;
  }

  public get_isActivated({ apUserDisplay }: {
    apUserDisplay: IAPUserDisplay;
  }): boolean {
    return apUserDisplay.apUserAuthenticationDisplay.isActivated;
  }

  public set_isActivated({ apUserDisplay, isActivated }: {
    apUserDisplay: IAPUserDisplay;
    isActivated: boolean;
  }): IAPUserDisplay {
    apUserDisplay.apUserAuthenticationDisplay.isActivated = isActivated;
    return apUserDisplay;
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
        apConfiguredBusinessGroupRoleEntityIdList: apMemberOfBusinessGroupsDisplay ? apMemberOfBusinessGroupsDisplay.apConfiguredBusinessGroupRoleEntityIdList : [],
        apCalculatedBusinessGroupRoleEntityIdList: apMemberOfBusinessGroupsDisplay ? apMemberOfBusinessGroupsDisplay.apCalculatedBusinessGroupRoleEntityIdList : [],
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
        const rootTreeNode: TAPMemberOfBusinessGroupTreeNodeDisplay = this.generate_ApMemberOfBusinessGroupsTreeNodeDisplay_From_ApBusinessGroupDisplay({
          apBusinessGroupDisplay: apBusinessGroupDisplay,
          apMemberOfBusinessGroupDisplayList: apMemberOfBusinessGroupDisplayList,
          apBusinessGroupDisplayList: apBusinessGroupDisplayList,
        });
        list.push(...rootTreeNode.children);
      }      
    }
    return list;
  }

  public async connectorGet_Developer({ organizationId, userId}: {
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

  private async apsGet_ApOrganizationAssetInfoDisplayList({apsUserResponse, organizationId}: {
    apsUserResponse: APSUserResponse;
    organizationId?: string;
  }): Promise<TAPOrganizationAssetInfoDisplayList> {
    const funcName = 'apsGet_ApOrganizationAssetInfoDisplayList';
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

  private get_isApsUserMemberOfOrganization({ organizationId, apsUserResponse }: {
    organizationId: string;
    apsUserResponse: APSUserResponse;
  }): boolean {
    if(apsUserResponse.memberOfOrganizations === undefined) return false;
    const found = apsUserResponse.memberOfOrganizations.find( (x) => {
      return x.organizationId === organizationId;
    });
    return found !== undefined;
  }

  public async apsCheck_OrganizationUserIdExists({userId, organizationId}: {
    organizationId: string;
    userId: string;
  }): Promise<TAPCheckOrganizationUserExistsResult> {
    const funcName = 'apsCheck_OrganizationUserIdExists';
    const logName = `${this.BaseComponentName}.${funcName}()`;
    try {
      // throw new Error(`${logName}: test error handling upstream`);
      const apsUserResponse: APSUserResponse = await ApsUsersService.getApsUser({
        userId: userId
      });
      return {
        exists: true,
        existsInOrganization: this.get_isApsUserMemberOfOrganization({ organizationId: organizationId, apsUserResponse: apsUserResponse})
      }
     } catch(e: any) {
      if(APSClientOpenApi.isInstanceOfApiError(e)) {
        const apiError: ApiError = e;
        if(apiError.status === 404) return { exists: false, existsInOrganization: false };
      }
      throw e;
    }
  }
  // public async apsGet_ApUserDisplay({ userId, organizationId, organization_ApBusinessGroupDisplayList }: {
  //   userId: string;
  //   organizationId?: string;
  //   organization_ApBusinessGroupDisplayList?: TAPBusinessGroupDisplayList;
  // }): Promise<IAPUserDisplay> {
  //   const funcName = 'apsGet_ApUserDisplay';
  //   const logName = `${this.BaseComponentName}.${funcName}()`;

  //   const apsUserResponse: APSUserResponse = await ApsUsersService.getApsUser({
  //     userId: userId
  //   });
  //   if(apsUserResponse.password !== undefined) apsUserResponse.password = '';
  //   const apOrganizationAssetInfoDisplayList: TAPOrganizationAssetInfoDisplayList = await this.apsGet_ApOrganizationAssetInfoDisplayList({
  //     apsUserResponse: apsUserResponse,
  //     organizationId: organizationId
  //   });
  //   const apOrganizationEntityIdList: TAPEntityIdList = await APOrganizationsService.listOrganizationEntityIdList();
  //   const apMemberOfOrganizationBusinessGroupsDisplayList: TAPMemberOfOrganizationBusinessGroupsDisplayList = [];
  //   if(apsUserResponse.memberOfOrganizationGroups !== undefined) {
  //     for(const apsMemberOfOrganizationGroups of apsUserResponse.memberOfOrganizationGroups) {
  //       const organizationEntityId: TAPEntityId | undefined = apOrganizationEntityIdList.find( (x) => {
  //         return x.id === apsMemberOfOrganizationGroups.organizationId;
  //       });
  //       if(organizationEntityId === undefined) throw new Error(`${logName}: organizationEntityId === undefined`);
  //       if(organization_ApBusinessGroupDisplayList === undefined) organization_ApBusinessGroupDisplayList = await APBusinessGroupsDisplayService.apsGetList_ApBusinessGroupSystemDisplayList({
  //         organizationId: organizationEntityId.id
  //       });
  //       apMemberOfOrganizationBusinessGroupsDisplayList.push({
  //         apEntityId: organizationEntityId,
  //         apMemberOfBusinessGroupDisplayList: await this.apsGet_ApMemberOfBusinessGroupDisplayList({
  //           organizationId: organizationEntityId.id,
  //           apsUserResponse: apsUserResponse,
  //           organization_ApBusinessGroupDisplayList: organization_ApBusinessGroupDisplayList,
  //         })
  //       });
  //     }
  //   }
  //   return this.create_ApUserDisplay_From_ApiEntities({
  //     apsUserResponse: apsUserResponse,
  //     apOrganizationAssetInfoDisplayList: apOrganizationAssetInfoDisplayList,
  //     apMemberOfOrganizationBusinessGroupsDisplayList: apMemberOfOrganizationBusinessGroupsDisplayList
  //   });
  // }

  // public async apsGetList_ApUserDisplayListResponse({
  //   pageSize = 20,
  //   pageNumber = 1,
  //   sortFieldName,
  //   sortDirection,
  //   searchWordList,
  //   searchOrganizationId,
  //   excludeSearchOrganizationId,
  //   searchIsActivated,
  //   searchUserId,
  // }: {
  //   pageSize?: number,
  //   pageNumber?: number,
  //   sortFieldName?: string,
  //   sortDirection?: EAPSSortDirection,
  //   searchWordList?: string,
  //   searchOrganizationId?: string,
  //   excludeSearchOrganizationId?: string,
  //   searchIsActivated?: boolean,
  //   searchUserId?: string,
  // }): Promise<TAPUserDisplayListResponse> {

  //   const funcName = 'apsGetList_ApUserDisplayListResponse';
  //   const logName = `${this.BaseComponentName}.${funcName}()`;

  //   const listApsUsersResponse: ListApsUsersResponse = await ApsUsersService.listApsUsers({
  //     pageSize: pageSize,
  //     pageNumber: pageNumber,
  //     sortFieldName: sortFieldName,
  //     sortDirection: sortDirection,
  //     searchWordList: searchWordList ? Globals.encodeRFC5987ValueChars(searchWordList) : undefined,
  //     searchOrganizationId: searchOrganizationId,
  //   });
  
  //   const list: TAPUserDisplayList = [];
  //   for(const apsUserResponse of listApsUsersResponse.list) {
  //     let organization_ApBusinessGroupDisplayList: TAPBusinessGroupDisplayList | undefined = undefined; 
  //     if(searchOrganizationId !== undefined) {
  //       organization_ApBusinessGroupDisplayList = await APBusinessGroupsDisplayService.apsGetList_ApBusinessGroupSystemDisplayList({
  //         organizationId: searchOrganizationId
  //       });  
  //     }
  //     const apUserDisplay: TAPUserDisplay = await this.apsGet_ApUserDisplay({
  //       organizationId: searchOrganizationId,
  //       userId: apsUserResponse.userId,
  //       organization_ApBusinessGroupDisplayList: organization_ApBusinessGroupDisplayList
  //     });
  //     list.push(apUserDisplay);
  //   }
  //   return {
  //     meta: listApsUsersResponse.meta,
  //     apUserDisplayList: list
  //   };
  // }

  // private create_APSMemberOfOrganizationGroupsList_From_ApMemberOfOrganizationGroupsDisplayList(apMemberOfOrganizationGroupsDisplayList: TAPMemberOfOrganizationGroupsDisplayList): APSMemberOfOrganizationGroupsList {
  //   const apsMemberOfOrganizationGroupsList: APSMemberOfOrganizationGroupsList = [];
  //   for(const apMemberOfOrganizationGroupsDisplay of apMemberOfOrganizationGroupsDisplayList) {
  //     const apsMemberOfOrganizationGroups: APSMemberOfOrganizationGroups = {
  //       organizationId: apMemberOfOrganizationGroupsDisplay.apEntityId.id,
  //       memberOfBusinessGroupList: []
  //     }
  //     for(const apMemberOfBusinessGroupDisplay of apMemberOfOrganizationGroupsDisplay.apMemberOfBusinessGroupDisplayList) {
  //       const apsMemberOfBusinessGroup: APSMemberOfBusinessGroup = {
  //         businessGroupId: apMemberOfBusinessGroupDisplay.apBusinessGroupDisplay.apEntityId.id,
  //         roles: APEntityIdsService.create_IdList(apMemberOfBusinessGroupDisplay.apConfiguredBusinessGroupRoleEntityIdList) as APSBusinessGroupAuthRoleList,
  //       }
  //       apsMemberOfOrganizationGroups.memberOfBusinessGroupList.push(apsMemberOfBusinessGroup);
  //     }
  //     apsMemberOfOrganizationGroupsList.push(apsMemberOfOrganizationGroups);
  //   }
  //   return apsMemberOfOrganizationGroupsList;
  // }

  // public async deprecated_apsReplace_ApUserDisplay({
  //   userId,
  //   apUserDisplay
  // }: {
  //   userId: string;
  //   apUserDisplay: IAPUserDisplay
  // }): Promise<void> {
  //   const funcName = 'deprecated_apsReplace_ApUserDisplay';
  //   const logName = `${this.BaseComponentName}.${funcName}()`;

  //   const replace: APSUserReplace = {
  //     isActivated: apUserDisplay.apsUserResponse.isActivated,
  //     password: apUserDisplay.apsUserResponse.password,
  //     profile: apUserDisplay.apsUserResponse.profile,
  //     systemRoles: APEntityIdsService.create_IdList(apUserDisplay.apSystemRoleEntityIdList) as APSSystemAuthRoleList,
  //     memberOfOrganizationGroups: this.create_APSMemberOfOrganizationGroupsList_From_ApMemberOfOrganizationGroupsDisplayList(apUserDisplay.apMemberOfOrganizationGroupsDisplayList),
  //     // LEGACY
  //     memberOfOrganizations: APLegacyUserDisplayService.create_APSOrganizationRolesList_From_ApMemberOfOrganizationGroupsDisplayList({
  //       apMemberOfOrganizationGroupsDisplayList: apUserDisplay.apMemberOfOrganizationGroupsDisplayList
  //     })
  //   }
  //   await ApsUsersService.replaceApsUser({
  //     userId: userId, 
  //     requestBody: replace
  //   });
  // }

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
  // public async apsCreate_ApUserDisplay({
  //   apUserDisplay
  // }: {
  //   apUserDisplay: IAPUserDisplay
  // }): Promise<void> {
  //   const funcName = 'apsCreate_ApUserDisplay';
  //   const logName = `${this.BaseComponentName}.${funcName}()`;

  //   const create: APSUser = {
  //     userId: apUserDisplay.apEntityId.id,
  //     isActivated: apUserDisplay.apsUserResponse.isActivated,
  //     password: apUserDisplay.apsUserResponse.password,
  //     profile: apUserDisplay.apsUserResponse.profile,
  //     systemRoles: APEntityIdsService.create_IdList(apUserDisplay.apSystemRoleEntityIdList) as APSSystemAuthRoleList,
  //     memberOfOrganizationGroups: this.create_APSMemberOfOrganizationGroupsList_From_ApMemberOfOrganizationGroupsDisplayList(apUserDisplay.apMemberOfOrganizationGroupsDisplayList),
  //     // LEGACY
  //     memberOfOrganizations: APLegacyUserDisplayService.create_APSOrganizationRolesList_From_ApMemberOfOrganizationGroupsDisplayList({
  //       apMemberOfOrganizationGroupsDisplayList: apUserDisplay.apMemberOfOrganizationGroupsDisplayList
  //     })
  //   }
  //   await ApsUsersService.createApsUser({
  //     requestBody: create
  //   });
  // }

  // private async apsUpdate_ApsUserUpdate({
  //   userId, apsUserUpdate
  // }: {
  //   userId: string;
  //   apsUserUpdate: APSUserUpdate,
  // }): Promise<void> {
  //   const funcName = 'apsUpdate_ApsUserUpdate';
  //   const logName = `${this.BaseComponentName}.${funcName}()`;

  //   await ApsUsersService.updateApsUser({
  //     userId: userId, 
  //     requestBody: apsUserUpdate
  //   });
  // }

  // public async apsUpdate_ApUserProfileDisplay({
  //   apUserProfileDisplay
  // }: {
  //   apUserProfileDisplay: TAPUserProfileDisplay,
  // }): Promise<void> {
  //   const funcName = 'apsUpdate_ApUserProfileDisplay';
  //   const logName = `${this.BaseComponentName}.${funcName}()`;

  //   const update: APSUserUpdate = {
  //     profile: {
  //       email: apUserProfileDisplay.apsUserProfile.email,
  //       first: apUserProfileDisplay.apsUserProfile.first,
  //       last: apUserProfileDisplay.apsUserProfile.last,
  //     }
  //   }
  //   await this.apsUpdate_ApsUserUpdate({ 
  //     userId: apUserProfileDisplay.apEntityId.id,
  //     apsUserUpdate: update
  //   });
  // }

  // public async apsUpdate_ApUserCredentialsDisplay({
  //   apUserCredentialsDisplay
  // }: {
  //   apUserCredentialsDisplay: TAPUserCredentialsDisplay  
  // }): Promise<void> {
  //   const funcName = 'apsUpdate_ApUserCredentialsDisplay';
  //   const logName = `${this.BaseComponentName}.${funcName}()`;

  //   const update: APSUserUpdate = {
  //     password: apUserCredentialsDisplay.password
  //   }
  //   await this.apsUpdate_ApsUserUpdate({ 
  //     userId: apUserCredentialsDisplay.apEntityId.id,
  //     apsUserUpdate: update
  //   })
  // }

  // public async apsUpdate_ApUserOrganizationRolesDisplay({organizationEntityId, apUserDisplay, apUserOrganizationRolesDisplay}:{
  //   organizationEntityId: TAPEntityId;
  //   apUserOrganizationRolesDisplay: TAPUserOrganizationRolesDisplay;
  //   apUserDisplay: TAPUserDisplay;
  // }): Promise<void> {
  //   // apEntityId is the userId
  //   // set the roles for top business group
  //   const funcName = 'apsUpdate_ApUserOrganizationRolesDisplay';
  //   const logName = `${this.BaseComponentName}.${funcName}()`;
  //   await this.apsUpdate_ApMemberOfBusinessGroupDisplayList({
  //     organizationEntityId: organizationEntityId,
  //     apUserDisplay: apUserDisplay,
  //     apMemberOfBusinessGroupDisplayList: this.apply_ApUserOrganiztionRolesDisplay_To_ApUserDisplay({
  //       organizationId: organizationEntityId.id,
  //       apUserDisplay: apUserDisplay,
  //       apUserOrganizationRolesDisplay: apUserOrganizationRolesDisplay
  //     })
  //   });
  // }

  // public async apsUpdate_ApMemberOfBusinessGroupDisplayList({
  //   organizationEntityId,
  //   apUserDisplay,
  //   apMemberOfBusinessGroupDisplayList
  // }: {
  //   organizationEntityId: TAPEntityId;
  //   apUserDisplay: TAPUserDisplay;
  //   apMemberOfBusinessGroupDisplayList: TAPMemberOfBusinessGroupDisplayList;  
  // }): Promise<void> {
  //   const funcName = 'apsUpdate_ApMemberOfBusinessGroupDisplayList';
  //   const logName = `${this.BaseComponentName}.${funcName}()`;

  //   const newList = this.apply_ApMemberOfOrganizationGroupDisplayList_To_ApsUserDisplay({
  //     organizationEntityId: organizationEntityId,
  //     apUserDisplay: apUserDisplay,
  //     apMemberOfBusinessGroupDisplayList: apMemberOfBusinessGroupDisplayList
  //   });
  //   const update: APSUserUpdate = {
  //     memberOfOrganizationGroups: this.create_APSMemberOfOrganizationGroupsList_From_ApMemberOfOrganizationGroupsDisplayList(newList),
  //     // LEGACY
  //     memberOfOrganizations: APLegacyUserDisplayService.create_APSOrganizationRolesList_From_ApMemberOfOrganizationGroupsDisplayList({
  //       apMemberOfOrganizationGroupsDisplayList: apUserDisplay.apMemberOfOrganizationGroupsDisplayList
  //     })
  //   }
  //   await this.apsUpdate_ApsUserUpdate({ 
  //     userId: apUserDisplay.apEntityId.id,
  //     apsUserUpdate: update
  //   })
  // }
}

export default new APUsersDisplayService();
