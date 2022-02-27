import { ApiError, Developer, DevelopersService } from '@solace-iot-team/apim-connector-openapi-browser';
import { APClientConnectorOpenApi } from '../utils/APClientConnectorOpenApi';
import APEntityIdsService, { IAPEntityIdDisplay, TAPEntityId, TAPEntityIdList } from '../utils/APEntityIdsService';
import { APOrganizationsService } from '../utils/APOrganizationsService';
import APSearchContentService, { IAPSearchContent } from '../utils/APSearchContentService';
import { 
  APSBusinessGroupAuthRoleList,
  ApsBusinessGroupsService,
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
  apConfiguredBusinessGroupRoleEntityIdList: TAPEntityIdList;
  apCalculatedBusinessGroupRoleEntityIdList: TAPEntityIdList;
}
export type TAPMemberOfBusinessGroupDisplayList = Array<TAPMemberOfBusinessGroupDisplay>;

export type TAPMemberOfOrganizationGroupsDisplay = IAPEntityIdDisplay & {
  apMemberOfBusinessGroupDisplayList: TAPMemberOfBusinessGroupDisplayList;
}
export type TAPMemberOfOrganizationGroupsDisplayList = Array<TAPMemberOfOrganizationGroupsDisplay>;

// LEGACY
export type TAPLegacyMemberOfOrganizationRolesDisplay = IAPEntityIdDisplay & {
  apsOrganizationRolesResponse: APSOrganizationRolesResponse;
  apOrganizationAuthRoleEntityIdList: TAPEntityIdList;
}
export type TAPLegacyMemberOfOrganizationRolesDisplayList = Array<TAPLegacyMemberOfOrganizationRolesDisplay>;



export type TAPUserDisplay = IAPEntityIdDisplay & IAPSearchContent & {
  apsUserResponse: APSUserResponse;

  apSystemRoleEntityIdList: TAPEntityIdList;

  apMemberOfOrganizationGroupsDisplayList: TAPMemberOfOrganizationGroupsDisplayList;

  apOrganizationAssetInfoDisplayList: TAPOrganizationAssetInfoDisplayList;

  // LEGACY
  apLegacy_MemberOfOrganizationRolesDisplayList: TAPLegacyMemberOfOrganizationRolesDisplayList;

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
export type TAPUserOrganizationRolesDisplay = IAPEntityIdDisplay & {
  apOrganizationAuthRoleEntityIdList: TAPEntityIdList;
}

export class APLegacyUserDisplayService {
  private static BaseComponentName = 'APLegacyUserDisplayService';

  public static create_ApLegacyMemberOfOrganizationRolesDisplayList({apsUserResponse}: {
    apsUserResponse: APSUserResponse;
  }): TAPLegacyMemberOfOrganizationRolesDisplayList {
    const list: TAPLegacyMemberOfOrganizationRolesDisplayList = [];
    if(apsUserResponse.memberOfOrganizations === undefined) return list;
    for(const apsOrganizationRolesResponse of apsUserResponse.memberOfOrganizations) {
      const elem: TAPLegacyMemberOfOrganizationRolesDisplay = {
        apEntityId: {
          id: apsOrganizationRolesResponse.organizationId,
          displayName: apsOrganizationRolesResponse.organizationDisplayName
        },
        apOrganizationAuthRoleEntityIdList: APRbacDisplayService.create_OrganizationRoles_EntityIdList(apsOrganizationRolesResponse.roles),
        apsOrganizationRolesResponse: apsOrganizationRolesResponse,
      };
      list.push(elem);
    }
    return list;
  }

  public static create_APSOrganizationRolesList_From_ApMemberOfOrganizationGroupsDisplayList({apMemberOfOrganizationGroupsDisplayList}:{
    apMemberOfOrganizationGroupsDisplayList: TAPMemberOfOrganizationGroupsDisplayList;
  }): APSOrganizationRolesList {
    const funcName = 'create_APSOrganizationRolesList_From_ApMemberOfOrganizationGroupsDisplayList';
    const logName = `${APLegacyUserDisplayService.BaseComponentName}.${funcName}()`;

    const list: APSOrganizationRolesList = [];
    for(const apMemberOfOrganizationGroupsDisplay of apMemberOfOrganizationGroupsDisplayList) {
      const organizationId = apMemberOfOrganizationGroupsDisplay.apEntityId.id;
      const combinedOrganizationAuthRolesList: APSOrganizationAuthRoleList = [];
      for(const apMemberOfBusinessGroupDisplay of apMemberOfOrganizationGroupsDisplay.apMemberOfBusinessGroupDisplayList) {
        // add them alll up 
        const rolesIdList: APSOrganizationAuthRoleList = apMemberOfBusinessGroupDisplay.apConfiguredBusinessGroupRoleEntityIdList.map( (x) => {
          return x.id as EAPSOrganizationAuthRole;
        });
        combinedOrganizationAuthRolesList.push(...rolesIdList);
      }
      // de-dup list
      const organizationAuthRolesList: APSOrganizationAuthRoleList = Globals.deDuplicateStringList(combinedOrganizationAuthRolesList) as APSOrganizationAuthRoleList;
      list.push({
        organizationId: organizationId,
        roles: organizationAuthRolesList
      });
    }
    return list;
  }

  public static find_LegacyMemberOfOrganizationRolesDisplay({organizationId, apLegacyMemberOfOrganizationRolesDisplayList}: {
    organizationId: string;
    apLegacyMemberOfOrganizationRolesDisplayList: TAPLegacyMemberOfOrganizationRolesDisplayList;
  }): TAPLegacyMemberOfOrganizationRolesDisplay {
    const funcName = 'find_LegacyMemberOfOrganizationRolesDisplay';
    const logName = `${APLegacyUserDisplayService.BaseComponentName}.${funcName}()`;

    const found = apLegacyMemberOfOrganizationRolesDisplayList.find( (x) => {
      return x.apEntityId.id === organizationId;
    });
    if(found === undefined) throw new Error(`${logName}: found === undefined`);
    return found;
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
        apEntityId: organizationEntityId,
        apMemberOfBusinessGroupDisplayList: [{
          apConfiguredBusinessGroupRoleEntityIdList: [],
          apCalculatedBusinessGroupRoleEntityIdList: [],
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

  public create_UserDisplayName(apsUserProfile: APSUserProfile): string {
    return `${apsUserProfile.first} ${apsUserProfile.last}`;
  }

  public create_MemberOfOrgananizationEntityIdList({apMemberOfOrganizationGroupsDisplayList}: {
    apMemberOfOrganizationGroupsDisplayList: TAPMemberOfOrganizationGroupsDisplayList
  }): TAPEntityIdList {
    return APEntityIdsService.sort_byDisplayName(APEntityIdsService.create_EntityIdList_From_ApDisplayObjectList(apMemberOfOrganizationGroupsDisplayList));
  }

  protected create_ApUserDisplay_From_ApiEntities({apsUserResponse, apOrganizationAssetInfoDisplayList, apMemberOfOrganizationGroupsDisplayList}: {
    apsUserResponse: APSUserResponse;
    apOrganizationAssetInfoDisplayList: TAPOrganizationAssetInfoDisplayList;
    apMemberOfOrganizationGroupsDisplayList: TAPMemberOfOrganizationGroupsDisplayList
  }): TAPUserDisplay {

    const base: TAPUserDisplay = {
      apEntityId: {
        id: apsUserResponse.userId,
        displayName: this.create_UserDisplayName(apsUserResponse.profile)
      },
      apsUserResponse: apsUserResponse,
      apSystemRoleEntityIdList: APRbacDisplayService.create_SystemRoles_EntityIdList(apsUserResponse.systemRoles),
      apOrganizationAssetInfoDisplayList: apOrganizationAssetInfoDisplayList,
      apMemberOfOrganizationGroupsDisplayList: apMemberOfOrganizationGroupsDisplayList,
      apLegacy_MemberOfOrganizationRolesDisplayList: APLegacyUserDisplayService.create_ApLegacyMemberOfOrganizationRolesDisplayList({apsUserResponse: apsUserResponse}),
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

  public find_ApMemberOfBusinessGroupDisplayList({organizationId, apUserDisplay }: {
    organizationId: string;
    apUserDisplay: TAPUserDisplay;
  }): TAPMemberOfBusinessGroupDisplayList {
    const funcName = 'find_ApMemberOfBusinessGroupDisplayList';
    const logName = `${this.BaseComponentName}.${funcName}()`;

    const found = apUserDisplay.apMemberOfOrganizationGroupsDisplayList.find( (x) => {
      return x.apEntityId.id === organizationId;
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

  public get_ApUserOrganizationRolesDisplay({ organizationId, apUserDisplay}: {
    organizationId: string;
    apUserDisplay: TAPUserDisplay;
  }): TAPUserOrganizationRolesDisplay {
    const funcName = 'get_ApUserOrganizationRolesDisplay';
    const logName = `${this.BaseComponentName}.${funcName}()`;
    const apMemberOfBusinessGroupDisplayList: TAPMemberOfBusinessGroupDisplayList = this.find_ApMemberOfBusinessGroupDisplayList({
      organizationId: organizationId,
      apUserDisplay: apUserDisplay
    });
    // this is the top level business group
    const apMemberOfBusinessGroupDisplay: TAPMemberOfBusinessGroupDisplay | undefined = apMemberOfBusinessGroupDisplayList.find( (x) => {
      return x.apBusinessGroupDisplay.apBusinessGroupParentEntityId === undefined;
    });
    if(apMemberOfBusinessGroupDisplay === undefined) throw new Error(`${logName}: apMemberOfBusinessGroupDisplay === undefined`);
    return {
      apEntityId: apUserDisplay.apEntityId,
      apOrganizationAuthRoleEntityIdList: apMemberOfBusinessGroupDisplay.apConfiguredBusinessGroupRoleEntityIdList
    };
  }

  // private create_ApMemberOfBusinessGroupTreeNodeDisplay_From_ApMemberOfBusinessGroupDisplay({apMemberOfBusinessGroupsDisplay}:{
  //   apMemberOfBusinessGroupsDisplay: TAPMemberOfBusinessGroupDisplay;
  // }): TAPMemberOfBusinessGroupTreeNodeDisplay {
  //   const tnDisplay: TAPMemberOfBusinessGroupTreeNodeDisplay = {
  //     key: apMemberOfBusinessGroupsDisplay.apBusinessGroupDisplay.apEntityId.id,
  //     label: apMemberOfBusinessGroupsDisplay.apBusinessGroupDisplay.apEntityId.displayName,
  //     data: apMemberOfBusinessGroupsDisplay,
  //     children: []
  //   };
  //   return tnDisplay;
  // }
  // private generate_ApMemberOfBusinessGroupsTreeNodeDisplay_From_ApMemberOfBusinessGroupsDisplay({apMemberOfBusinessGroupsDisplay, apMemberOfBusinessGroupsDisplayList}:{
  //   apMemberOfBusinessGroupsDisplay: TAPMemberOfBusinessGroupDisplay;
  //   apMemberOfBusinessGroupsDisplayList: TAPMemberOfBusinessGroupDisplayList;
  // }): TAPMemberOfBusinessGroupTreeNodeDisplay {
  //   const funcName = 'generate_ApMemberOfBusinessGroupsTreeNodeDisplay_From_ApMemberOfBusinessGroupsDisplay';
  //   const logName = `${this.BaseComponentName}.${funcName}()`;
  //   const thisTreeNode: TAPMemberOfBusinessGroupTreeNodeDisplay = this.create_ApMemberOfBusinessGroupTreeNodeDisplay_From_ApMemberOfBusinessGroupDisplay({
  //     apMemberOfBusinessGroupsDisplay: apMemberOfBusinessGroupsDisplay
  //   });
  //   for(const childEntityId of apMemberOfBusinessGroupsDisplay.apBusinessGroupDisplay.apBusinessGroupChildrenEntityIdList) {
  //     // find it and add it
  //     const found: TAPMemberOfBusinessGroupDisplay | undefined = apMemberOfBusinessGroupsDisplayList.find( (x) => {
  //       return x.apBusinessGroupDisplay.apEntityId.id === childEntityId.id;
  //     });
  //     // not a member if not found
  //     if(found !== undefined) {
  //       // recurse into child
  //       const childTreeNodeDisplay: TAPMemberOfBusinessGroupTreeNodeDisplay = this.generate_ApMemberOfBusinessGroupsTreeNodeDisplay_From_ApMemberOfBusinessGroupsDisplay({
  //         apMemberOfBusinessGroupsDisplay: found,
  //         apMemberOfBusinessGroupsDisplayList: apMemberOfBusinessGroupsDisplayList
  //       });
  //       thisTreeNode.children.push(childTreeNodeDisplay);
  //     }
  //   }
  //   return thisTreeNode;
  // }
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

  private async apsGet_ApMemberOfBusinessGroupDisplayList({organizationId, apsUserResponse, organization_ApBusinessGroupDisplayList }: {
    organizationId: string;
    apsUserResponse: APSUserResponse;
    organization_ApBusinessGroupDisplayList: TAPBusinessGroupDisplayList;
  }): Promise<TAPMemberOfBusinessGroupDisplayList> {
    const funcName = 'apsGet_ApMemberOfBusinessGroupDisplayList';
    const logName = `${this.BaseComponentName}.${funcName}()`;

    const found: APSMemberOfOrganizationGroups | undefined = apsUserResponse.memberOfOrganizationGroups?.find( (x: APSMemberOfOrganizationGroups) => {
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
        apBusinessGroupDisplay: apBusinessGroupDisplay,
        apConfiguredBusinessGroupRoleEntityIdList: APRbacDisplayService.create_BusinessGroupRoles_EntityIdList(apsMemberOfBusinessGroup.roles),
        apCalculatedBusinessGroupRoleEntityIdList: this.create_CalculatedBusinessGroupRoles_EntityIdList({
          businessGroupId: apsMemberOfBusinessGroup.businessGroupId,
          apBusinessGroupDisplayList: organization_ApBusinessGroupDisplayList,
          apsMemberOfOrganizationGroups: found
        })
      });
    }
    return apMemberOfBusinessGroupDisplayList;
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

  public async apsGet_ApUserDisplay({ userId, organizationId, organization_ApBusinessGroupDisplayList }: {
    userId: string;
    organizationId?: string;
    organization_ApBusinessGroupDisplayList?: TAPBusinessGroupDisplayList;
  }): Promise<TAPUserDisplay> {
    const funcName = 'apsGet_ApUserDisplay';
    const logName = `${this.BaseComponentName}.${funcName}()`;

    const apsUserResponse: APSUserResponse = await ApsUsersService.getApsUser({
      userId: userId
    });
    if(apsUserResponse.password !== undefined) apsUserResponse.password = '';
    const apOrganizationAssetInfoDisplayList: TAPOrganizationAssetInfoDisplayList = await this.apsGet_ApOrganizationAssetInfoDisplayList({
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
        if(organization_ApBusinessGroupDisplayList === undefined) organization_ApBusinessGroupDisplayList = await APBusinessGroupsDisplayService.apsGetList_ApBusinessGroupSystemDisplayList({
          organizationId: organizationEntityId.id
        });
        apMemberOfOrganizationGroupsDisplayList.push({
          apEntityId: organizationEntityId,
          apMemberOfBusinessGroupDisplayList: await this.apsGet_ApMemberOfBusinessGroupDisplayList({
            organizationId: organizationEntityId.id,
            apsUserResponse: apsUserResponse,
            organization_ApBusinessGroupDisplayList: organization_ApBusinessGroupDisplayList,
          })
        });
      }
    }
    return this.create_ApUserDisplay_From_ApiEntities({
      apsUserResponse: apsUserResponse,
      apOrganizationAssetInfoDisplayList: apOrganizationAssetInfoDisplayList,
      apMemberOfOrganizationGroupsDisplayList: apMemberOfOrganizationGroupsDisplayList
    });
  }

  public async apsGetList_ApUserDisplayListResponse({
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

    const funcName = 'apsGetList_ApUserDisplayListResponse';
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
      let organization_ApBusinessGroupDisplayList: TAPBusinessGroupDisplayList | undefined = undefined; 
      if(searchOrganizationId !== undefined) {
        organization_ApBusinessGroupDisplayList = await APBusinessGroupsDisplayService.apsGetList_ApBusinessGroupSystemDisplayList({
          organizationId: searchOrganizationId
        });  
      }
      const apUserDisplay: TAPUserDisplay = await this.apsGet_ApUserDisplay({
        organizationId: searchOrganizationId,
        userId: apsUserResponse.userId,
        organization_ApBusinessGroupDisplayList: organization_ApBusinessGroupDisplayList
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
        organizationId: apMemberOfOrganizationGroupsDisplay.apEntityId.id,
        memberOfBusinessGroupList: []
      }
      for(const apMemberOfBusinessGroupDisplay of apMemberOfOrganizationGroupsDisplay.apMemberOfBusinessGroupDisplayList) {
        const apsMemberOfBusinessGroup: APSMemberOfBusinessGroup = {
          businessGroupId: apMemberOfBusinessGroupDisplay.apBusinessGroupDisplay.apEntityId.id,
          roles: APEntityIdsService.create_IdList(apMemberOfBusinessGroupDisplay.apConfiguredBusinessGroupRoleEntityIdList) as APSBusinessGroupAuthRoleList,
        }
        apsMemberOfOrganizationGroups.memberOfBusinessGroupList.push(apsMemberOfBusinessGroup);
      }
      apsMemberOfOrganizationGroupsList.push(apsMemberOfOrganizationGroups);
    }
    return apsMemberOfOrganizationGroupsList;
  }

  public async deprecated_apsReplace_ApUserDisplay({
    userId,
    apUserDisplay
  }: {
    userId: string;
    apUserDisplay: TAPUserDisplay
  }): Promise<void> {
    const funcName = 'deprecated_apsReplace_ApUserDisplay';
    const logName = `${this.BaseComponentName}.${funcName}()`;

    const replace: APSUserReplace = {
      isActivated: apUserDisplay.apsUserResponse.isActivated,
      password: apUserDisplay.apsUserResponse.password,
      profile: apUserDisplay.apsUserResponse.profile,
      systemRoles: APEntityIdsService.create_IdList(apUserDisplay.apSystemRoleEntityIdList) as APSSystemAuthRoleList,
      memberOfOrganizationGroups: this.create_APSMemberOfOrganizationGroupsList_From_ApMemberOfOrganizationGroupsDisplayList(apUserDisplay.apMemberOfOrganizationGroupsDisplayList),
      // LEGACY
      memberOfOrganizations: APLegacyUserDisplayService.create_APSOrganizationRolesList_From_ApMemberOfOrganizationGroupsDisplayList({
        apMemberOfOrganizationGroupsDisplayList: apUserDisplay.apMemberOfOrganizationGroupsDisplayList
      })
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
  public async apsCreate_ApUserDisplay({
    apUserDisplay
  }: {
    apUserDisplay: TAPUserDisplay
  }): Promise<void> {
    const funcName = 'apsCreate_ApUserDisplay';
    const logName = `${this.BaseComponentName}.${funcName}()`;

    const create: APSUser = {
      userId: apUserDisplay.apEntityId.id,
      isActivated: apUserDisplay.apsUserResponse.isActivated,
      password: apUserDisplay.apsUserResponse.password,
      profile: apUserDisplay.apsUserResponse.profile,
      systemRoles: APEntityIdsService.create_IdList(apUserDisplay.apSystemRoleEntityIdList) as APSSystemAuthRoleList,
      memberOfOrganizationGroups: this.create_APSMemberOfOrganizationGroupsList_From_ApMemberOfOrganizationGroupsDisplayList(apUserDisplay.apMemberOfOrganizationGroupsDisplayList),
      // LEGACY
      memberOfOrganizations: APLegacyUserDisplayService.create_APSOrganizationRolesList_From_ApMemberOfOrganizationGroupsDisplayList({
        apMemberOfOrganizationGroupsDisplayList: apUserDisplay.apMemberOfOrganizationGroupsDisplayList
      })
    }
    await ApsUsersService.createApsUser({
      requestBody: create
    });
  }

  private async apsUpdate_ApsUserUpdate({
    userId, apsUserUpdate
  }: {
    userId: string;
    apsUserUpdate: APSUserUpdate,
  }): Promise<void> {
    const funcName = 'apsUpdate_ApsUserUpdate';
    const logName = `${this.BaseComponentName}.${funcName}()`;

    await ApsUsersService.updateApsUser({
      userId: userId, 
      requestBody: apsUserUpdate
    });
  }

  public async apsUpdate_ApUserProfileDisplay({
    apUserProfileDisplay
  }: {
    apUserProfileDisplay: TAPUserProfileDisplay,
  }): Promise<void> {
    const funcName = 'apsUpdate_ApUserProfileDisplay';
    const logName = `${this.BaseComponentName}.${funcName}()`;

    const update: APSUserUpdate = {
      profile: {
        email: apUserProfileDisplay.apsUserProfile.email,
        first: apUserProfileDisplay.apsUserProfile.first,
        last: apUserProfileDisplay.apsUserProfile.last,
      }
    }
    await this.apsUpdate_ApsUserUpdate({ 
      userId: apUserProfileDisplay.apEntityId.id,
      apsUserUpdate: update
    });
  }

  public async apsUpdate_ApUserCredentialsDisplay({
    apUserCredentialsDisplay
  }: {
    apUserCredentialsDisplay: TAPUserCredentialsDisplay  
  }): Promise<void> {
    const funcName = 'apsUpdate_ApUserCredentialsDisplay';
    const logName = `${this.BaseComponentName}.${funcName}()`;

    const update: APSUserUpdate = {
      password: apUserCredentialsDisplay.password
    }
    await this.apsUpdate_ApsUserUpdate({ 
      userId: apUserCredentialsDisplay.apEntityId.id,
      apsUserUpdate: update
    })
  }

  public async apsUpdate_ApUserOrganizationRolesDisplay({organizationEntityId, apUserDisplay, apUserOrganizationRolesDisplay}:{
    organizationEntityId: TAPEntityId;
    apUserOrganizationRolesDisplay: TAPUserOrganizationRolesDisplay;
    apUserDisplay: TAPUserDisplay;
  }): Promise<void> {
    // apEntityId is the userId
    // set the roles for top business group
    const funcName = 'apsUpdate_ApUserOrganizationRolesDisplay';
    const logName = `${this.BaseComponentName}.${funcName}()`;
    // replace in list
    const apMemberOfBusinessGroupDisplayList: TAPMemberOfBusinessGroupDisplayList = this.find_ApMemberOfBusinessGroupDisplayList({
      organizationId: organizationEntityId.id,
      apUserDisplay: apUserDisplay
    });
    // this is the top level business group
    const index = apMemberOfBusinessGroupDisplayList.findIndex( (x) => {
      return x.apBusinessGroupDisplay.apBusinessGroupParentEntityId === undefined;
    });
    if(index === -1) throw new Error(`${logName}: index === -1`);
    const newApMemmberOfBusinessGroupDisplay: TAPMemberOfBusinessGroupDisplay = {
      apBusinessGroupDisplay: apMemberOfBusinessGroupDisplayList[index].apBusinessGroupDisplay,
      apConfiguredBusinessGroupRoleEntityIdList: apUserOrganizationRolesDisplay.apOrganizationAuthRoleEntityIdList,
      apCalculatedBusinessGroupRoleEntityIdList: []
    }
    apMemberOfBusinessGroupDisplayList[index] = newApMemmberOfBusinessGroupDisplay;
    await this.apsUpdate_ApMemberOfBusinessGroupDisplayList({
      organizationEntityId: organizationEntityId,
      apUserDisplay: apUserDisplay,
      apMemberOfBusinessGroupDisplayList: apMemberOfBusinessGroupDisplayList
    });
  }

  public async apsUpdate_ApMemberOfBusinessGroupDisplayList({
    organizationEntityId,
    apUserDisplay,
    apMemberOfBusinessGroupDisplayList
  }: {
    organizationEntityId: TAPEntityId;
    apUserDisplay: TAPUserDisplay;
    apMemberOfBusinessGroupDisplayList: TAPMemberOfBusinessGroupDisplayList  
  }): Promise<void> {
    const funcName = 'apsUpdate_ApMemberOfBusinessGroupDisplayList';
    const logName = `${this.BaseComponentName}.${funcName}()`;

    const existingIndex = apUserDisplay.apMemberOfOrganizationGroupsDisplayList.findIndex( (apMemberOfOrganizationGroupsDisplay: TAPMemberOfOrganizationGroupsDisplay) => {
      return apMemberOfOrganizationGroupsDisplay.apEntityId.id === organizationEntityId.id;
    });
    if(existingIndex > -1) {
      // replace
      apUserDisplay.apMemberOfOrganizationGroupsDisplayList[existingIndex].apMemberOfBusinessGroupDisplayList = apMemberOfBusinessGroupDisplayList;
    } else {
      // add
      apUserDisplay.apMemberOfOrganizationGroupsDisplayList.push({
        apEntityId: organizationEntityId,
        apMemberOfBusinessGroupDisplayList: apMemberOfBusinessGroupDisplayList
      });      
    }
    const update: APSUserUpdate = {
      memberOfOrganizationGroups: this.create_APSMemberOfOrganizationGroupsList_From_ApMemberOfOrganizationGroupsDisplayList(apUserDisplay.apMemberOfOrganizationGroupsDisplayList),
      // LEGACY
      memberOfOrganizations: APLegacyUserDisplayService.create_APSOrganizationRolesList_From_ApMemberOfOrganizationGroupsDisplayList({
        apMemberOfOrganizationGroupsDisplayList: apUserDisplay.apMemberOfOrganizationGroupsDisplayList
      })
    }
    await this.apsUpdate_ApsUserUpdate({ 
      userId: apUserDisplay.apEntityId.id,
      apsUserUpdate: update
    })
  }
}

export default new APUsersDisplayService();
