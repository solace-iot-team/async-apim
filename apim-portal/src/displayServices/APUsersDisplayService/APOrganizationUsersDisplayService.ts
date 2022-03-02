import APEntityIdsService, { IAPEntityIdDisplay, TAPEntityId, TAPEntityIdList } from '../../utils/APEntityIdsService';
import APSearchContentService from '../../utils/APSearchContentService';
import { Globals } from '../../utils/Globals';
import { APSListResponseMeta, APSMemberOfBusinessGroup, APSMemberOfOrganizationGroups, APSUserResponse, ApsUsersService, EAPSSortDirection, ListApsUsersResponse } from '../../_generated/@solace-iot-team/apim-server-openapi-browser';
import APAssetDisplayService, { TAPOrganizationAssetInfoDisplayList } from '../APAssetsDisplayService';
import APBusinessGroupsDisplayService, { TAPBusinessGroupDisplay, TAPBusinessGroupDisplayList } from '../APBusinessGroupsDisplayService';
import APRbacDisplayService from '../APRbacDisplayService';
import { 
  APUsersDisplayService, 
  IAPUserDisplay, 
  TAPMemberOfBusinessGroupDisplay, 
  TAPMemberOfBusinessGroupDisplayList, 
  TAPMemberOfOrganizationBusinessGroupsDisplay, 
  TAPMemberOfOrganizationRolesDisplay, 
} from './APUsersDisplayService';

/**
 * rework:
 * APOrganizationUsersDisplayService extends APUsersDisplayService
 * Different types: with/without organizationEntityId
 * ap does not have apsUserResponse in it
 * get, set for all sub-elements
 * clone to create a clone
 * add complete business group list to it (even to emtpy object)
 * generate_ tree nodes and reverse
 * create_from_apsApiEntities (when getting it)
 * transform to APSUserUpdate, APSUserCreate, ...
 * APOrganizationUserDisplay and APSystemUserDisplay
 */


// export type TAPOrganizationUserDisplay = Omit<IAPUserDisplay, "" | ""> & {
export type TAPOrganizationUserDisplay = IAPUserDisplay & {
  apOrganizationEntityId: TAPEntityId;
  apMemberOfOrganizationRolesDisplay: TAPMemberOfOrganizationRolesDisplay;
  apMemberOfOrganizationBusinessGroupsDisplay: TAPMemberOfOrganizationBusinessGroupsDisplay;
  readonly apCompleteBusinessGroupDisplayList?: TAPBusinessGroupDisplayList;
  readonly apOrganizationAssetInfoDisplayList: TAPOrganizationAssetInfoDisplayList;
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

  private create_Empty_ApMemberOfOrganizationRolesDisplay({organizationEntityId}:{
    organizationEntityId: TAPEntityId;
  }): TAPMemberOfOrganizationRolesDisplay {
    const apMemberOfOrganizationGroupsDisplay: TAPMemberOfOrganizationRolesDisplay = {
      apEntityId: organizationEntityId,
      apOrganizationAuthRoleEntityIdList: []
    };
    return apMemberOfOrganizationGroupsDisplay;
  }

  private async create_Empty_ApMemberOfOrganizationBusinessGroupsDisplay({organizationEntityId}:{
    organizationEntityId: TAPEntityId;
  }): Promise<TAPMemberOfOrganizationBusinessGroupsDisplay> {

    const rootBusinessGroupDisplay: TAPBusinessGroupDisplay = await APBusinessGroupsDisplayService.getRootApBusinessGroupDisplay({
      organizationId: organizationEntityId.id,
    });
    const apMemberOfBusinessGroupDisplay: TAPMemberOfBusinessGroupDisplay = {
      apBusinessGroupDisplay: rootBusinessGroupDisplay,
      apCalculatedBusinessGroupRoleEntityIdList: [],
      apConfiguredBusinessGroupRoleEntityIdList: []
    }
    const apMemberOfOrganizationGroupsDisplay: TAPMemberOfOrganizationBusinessGroupsDisplay = {
      apEntityId: organizationEntityId,
      apMemberOfBusinessGroupDisplayList: [apMemberOfBusinessGroupDisplay],
    };
    return apMemberOfOrganizationGroupsDisplay;
  }

  private create_Empty_ApMemberOfOrganizationBusinessGroupsDisplay_With_CompleteApOrganizationBusinessGroupList({
    organizationEntityId,
    completeApOrganizationBusinessGroupDisplayList,
  }:{
    organizationEntityId: TAPEntityId;
    completeApOrganizationBusinessGroupDisplayList: TAPBusinessGroupDisplayList;

  }): TAPMemberOfOrganizationBusinessGroupsDisplay {
    const rootApBusinesGroupDisplay: TAPBusinessGroupDisplay = APBusinessGroupsDisplayService.find_root_ApBusinessGroupDisplay({ 
      completeApOrganizationBusinessGroupDisplayList: completeApOrganizationBusinessGroupDisplayList
    });
    const apMemberOfBusinessGroupDisplay: TAPMemberOfBusinessGroupDisplay = {
      apBusinessGroupDisplay: rootApBusinesGroupDisplay,
      apCalculatedBusinessGroupRoleEntityIdList: [],
      apConfiguredBusinessGroupRoleEntityIdList: []
    }
    const apMemberOfOrganizationGroupsDisplay: TAPMemberOfOrganizationBusinessGroupsDisplay = {
      apEntityId: organizationEntityId,
      apMemberOfBusinessGroupDisplayList: [apMemberOfBusinessGroupDisplay],
    };
    return apMemberOfOrganizationGroupsDisplay;
  }

  public async create_Empty_ApOrganizationUserDisplay({organizationEntityId}: {
    organizationEntityId: TAPEntityId;
  }): Promise<TAPOrganizationUserDisplay> {

    const base: IAPUserDisplay = super.create_Empty_ApUserDisplay();
    const apOrganizationUserDisplay: TAPOrganizationUserDisplay = {
      ...base,
      apOrganizationEntityId: organizationEntityId,
      apCompleteBusinessGroupDisplayList: await APBusinessGroupsDisplayService.apsGetList_ApBusinessGroupSystemDisplayList({
        organizationId: organizationEntityId.id
      }),
      apMemberOfOrganizationBusinessGroupsDisplay: await this.create_Empty_ApMemberOfOrganizationBusinessGroupsDisplay({ organizationEntityId: organizationEntityId }),
      apMemberOfOrganizationRolesDisplay: this.create_Empty_ApMemberOfOrganizationRolesDisplay({organizationEntityId: organizationEntityId}),
      apOrganizationAssetInfoDisplayList: [],
    }
    return apOrganizationUserDisplay;    
  }

  // private async apsGet_ApOrganizationAssetInfoDisplayList({apsUserResponse, organizationId}: {
  //   apsUserResponse: APSUserResponse;
  //   organizationId?: string;
  // }): Promise<TAPOrganizationAssetInfoDisplayList> {
  //   const funcName = 'apsGet_ApOrganizationAssetInfoDisplayList';
  //   const logName = `${this.ComponentName}.${funcName}()`;

  //   // create the org list
  //   let organizationIdList: Array<string> = [];
  //   if(organizationId !== undefined) {
  //     // one org only
  //     const found = apsUserResponse.memberOfOrganizationGroups?.find( (apsMemberOfOrganizationGroups: APSMemberOfOrganizationGroups) => {
  //       return apsMemberOfOrganizationGroups.organizationId === organizationId;
  //     });
  //     if(found === undefined) throw new Error(`${logName}: cannot find organizationId=${organizationId} in apsUserResponse.memberOfOrganizationGroups=${JSON.stringify(apsUserResponse.memberOfOrganizationGroups, null, 2)}`);
  //     organizationIdList.push(found.organizationId);
  //   } else {
  //     // all orgs
  //     const list = apsUserResponse.memberOfOrganizationGroups?.map( (apsMemberOfOrganizationGroups: APSMemberOfOrganizationGroups) => {
  //       return apsMemberOfOrganizationGroups.organizationId;
  //     });
  //     if(list !== undefined) organizationIdList = list;
  //   }
  //   const organizationEntityIdList: TAPEntityIdList = await APOrganizationsService.listOrganizationEntityIdList_For_OrganizationIdList({
  //     organizationIdList: organizationIdList
  //   });

  //   const apOrganizationAssetInfoDisplayList: TAPOrganizationAssetInfoDisplayList = await APAssetDisplayService.getApAssetInfoListForUser({
  //     organizationEntityIdList: organizationEntityIdList,
  //     userId: apsUserResponse.userId
  //   });
  //   return apOrganizationAssetInfoDisplayList;
  // }

  private create_ApMemberOfOrganizationRolesDisplay({organizationEntityId, apsUserResponse, completeApOrganizationBusinessGroupDisplayList}:{
    organizationEntityId: TAPEntityId;
    apsUserResponse: APSUserResponse;
    completeApOrganizationBusinessGroupDisplayList: TAPBusinessGroupDisplayList;
  }): TAPMemberOfOrganizationRolesDisplay {
    const funcName = 'create_ApMemberOfOrganizationRolesDisplay';
    const logName = `${this.ComponentName}.${funcName}()`;

    // find the entry for this organization
    if(apsUserResponse.memberOfOrganizationGroups !== undefined) {
      const apsMemberOfOrganizationGroups: APSMemberOfOrganizationGroups | undefined = apsUserResponse.memberOfOrganizationGroups.find( (x) => {
        return x.organizationId === organizationEntityId.id;
      });
      if(apsMemberOfOrganizationGroups === undefined) throw new Error(`${logName}: apsMemberOfOrganizationGroups === undefined`);
      // get the top-level business group
      const rootApBusinesGroupDisplay: TAPBusinessGroupDisplay = APBusinessGroupsDisplayService.find_root_ApBusinessGroupDisplay({ completeApOrganizationBusinessGroupDisplayList: completeApOrganizationBusinessGroupDisplayList});
      // find the roles for the topLevel business group
      const apsMemberOfBusinessGroup: APSMemberOfBusinessGroup | undefined = apsMemberOfOrganizationGroups.memberOfBusinessGroupList.find( (x) => {
        return x.businessGroupId === rootApBusinesGroupDisplay.apEntityId.id;
      });
      if(apsMemberOfBusinessGroup === undefined || apsMemberOfBusinessGroup.roles.length === 0) return this.create_Empty_ApMemberOfOrganizationRolesDisplay({ organizationEntityId: organizationEntityId });
      const apMemberOfOrganizationRolesDisplay: TAPMemberOfOrganizationRolesDisplay = {
        apEntityId: organizationEntityId,
        apOrganizationAuthRoleEntityIdList: APRbacDisplayService.create_BusinessGroupRoles_EntityIdList(apsMemberOfBusinessGroup.roles)
      };
      return apMemberOfOrganizationRolesDisplay;
    } else return this.create_Empty_ApMemberOfOrganizationRolesDisplay({ organizationEntityId: organizationEntityId });
  }

  private create_ApMemberOfOrganizationBusinessGroupDisplay({organizationEntityId, apsUserResponse, completeApOrganizationBusinessGroupDisplayList}:{
    organizationEntityId: TAPEntityId;
    apsUserResponse: APSUserResponse;
    completeApOrganizationBusinessGroupDisplayList: TAPBusinessGroupDisplayList;
  }): TAPMemberOfOrganizationBusinessGroupsDisplay {
    const funcName = 'create_ApMemberOfOrganizationBusinessGroupDisplay';
    const logName = `${this.ComponentName}.${funcName}()`;

    // find the entry for this organization
    if(apsUserResponse.memberOfOrganizationGroups !== undefined) {
      const apsMemberOfOrganizationGroups: APSMemberOfOrganizationGroups | undefined = apsUserResponse.memberOfOrganizationGroups.find( (x) => {
        return x.organizationId === organizationEntityId.id;
      });
      if(apsMemberOfOrganizationGroups === undefined) throw new Error(`${logName}: apsMemberOfOrganizationGroups === undefined`);
      // get all the business groups and their roles
      const apMemberOfBusinessGroupDisplayList: TAPMemberOfBusinessGroupDisplayList = apsMemberOfOrganizationGroups.memberOfBusinessGroupList.map((apsMemberOfBusinessGroup: APSMemberOfBusinessGroup) => {
        const apBusinessGroupDisplay: TAPBusinessGroupDisplay = APBusinessGroupsDisplayService.find_ApBusinessGroupDisplay_by_id({
          businessGroupId: apsMemberOfBusinessGroup.businessGroupId,
          apBusinessGroupDisplayList: completeApOrganizationBusinessGroupDisplayList
        });
        const apMemberOfBusinessGroupDisplay: TAPMemberOfBusinessGroupDisplay = {
          apBusinessGroupDisplay: apBusinessGroupDisplay,
          apConfiguredBusinessGroupRoleEntityIdList: APRbacDisplayService.create_BusinessGroupRoles_EntityIdList(apsMemberOfBusinessGroup.roles),
          apCalculatedBusinessGroupRoleEntityIdList: this.create_CalculatedBusinessGroupRoles_EntityIdList({
            businessGroupId: apsMemberOfBusinessGroup.businessGroupId,
            apBusinessGroupDisplayList: completeApOrganizationBusinessGroupDisplayList,
            apsMemberOfOrganizationGroups: apsMemberOfOrganizationGroups
          })
        };
        return apMemberOfBusinessGroupDisplay;
      });
      const apMemberOfOrganizationBusinessGroupsDisplay: TAPMemberOfOrganizationBusinessGroupsDisplay = {
        apEntityId: organizationEntityId,
        apMemberOfBusinessGroupDisplayList: apMemberOfBusinessGroupDisplayList
      };
      return apMemberOfOrganizationBusinessGroupsDisplay;
    } else return this.create_Empty_ApMemberOfOrganizationBusinessGroupsDisplay_With_CompleteApOrganizationBusinessGroupList({ 
      organizationEntityId: organizationEntityId,
      completeApOrganizationBusinessGroupDisplayList: completeApOrganizationBusinessGroupDisplayList,
    });

    // const x: TAPMemberOfOrganizationBusinessGroupsDisplay = {
    //   apEntityId: organizationEntityId,
    //   apMemberOfBusinessGroupDisplayList
    // }
  }

  private async create_ApOrganizationUserDisplay_From_ApiEntities({
    organizationEntityId, 
    apsUserResponse,
    completeApOrganizationBusinessGroupDisplayList,
  }: {
    organizationEntityId: TAPEntityId;
    apsUserResponse: APSUserResponse;
    completeApOrganizationBusinessGroupDisplayList: TAPBusinessGroupDisplayList;
  }): Promise<TAPOrganizationUserDisplay> {
    const apOrganizationAssetInfoDisplayList: TAPOrganizationAssetInfoDisplayList = await APAssetDisplayService.getApAssetInfoListForUser({
      organizationEntityIdList: [organizationEntityId],
      userId: apsUserResponse.userId
    });
    // TODO: what is different to above call?
    // const apOrganizationAssetInfoDisplayList: TAPOrganizationAssetInfoDisplayList = await this.apsGet_ApOrganizationAssetInfoDisplayList({
    //   apsUserResponse: apsUserResponse,
    //   organizationId: organizationEntityId.id
    // });

    // get the organization roles from top level business groups
    const apMemberOfOrganizationRolesDisplay: TAPMemberOfOrganizationRolesDisplay = this.create_ApMemberOfOrganizationRolesDisplay({ 
      organizationEntityId: organizationEntityId,
      apsUserResponse: apsUserResponse,
      completeApOrganizationBusinessGroupDisplayList: completeApOrganizationBusinessGroupDisplayList
    });
    // get the roles for every business group
    const apMemberOfOrganizationBusinessGroupsDisplay: TAPMemberOfOrganizationBusinessGroupsDisplay = this.create_ApMemberOfOrganizationBusinessGroupDisplay({
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
      apMemberOfOrganizationRolesDisplay: apMemberOfOrganizationRolesDisplay,
      apMemberOfOrganizationBusinessGroupsDisplay: apMemberOfOrganizationBusinessGroupsDisplay,
      apCompleteBusinessGroupDisplayList: completeApOrganizationBusinessGroupDisplayList,
      apOrganizationAssetInfoDisplayList: apOrganizationAssetInfoDisplayList,
    }
    return APSearchContentService.add_SearchContent<TAPOrganizationUserDisplay>(apOrganizationUserDisplay);
  }

  // public find_ApMemberOfBusinessGroupDisplayList({organizationId, apUserDisplay }: {
  //   organizationId: string;
  //   apUserDisplay: IAPUserDisplay;
  // }): TAPMemberOfBusinessGroupDisplayList {
  //   const funcName = 'find_ApMemberOfBusinessGroupDisplayList';
  //   const logName = `${this.BaseComponentName}.${funcName}()`;

  //   const found = apUserDisplay.apMemberOfOrganizationGroupsDisplayList.find( (x) => {
  //     return x.apEntityId.id === organizationId;
  //   });
  //   if(found === undefined) throw new Error(`${logName}: found === undefined`);
  //   return found.apMemberOfBusinessGroupDisplayList;
  // }

  // public get_ApOrganizationUserOrganizationRolesDisplay({ organizationId, apUserDisplay}: {
  //   organizationId: string;
  //   apUserDisplay: IAPUserDisplay;
  // }): TAPUserOrganizationRolesDisplay {
  //   const funcName = 'get_ApOrganizationUserOrganizationRolesDisplay';
  //   const logName = `${this.ComponentName}.${funcName}()`;
  //   const apMemberOfBusinessGroupDisplayList: TAPMemberOfBusinessGroupDisplayList = this.find_ApMemberOfBusinessGroupDisplayList({
  //     organizationId: organizationId,
  //     apUserDisplay: apUserDisplay
  //   });
  //   // this is the top level business group
  //   const apMemberOfBusinessGroupDisplay: TAPMemberOfBusinessGroupDisplay | undefined = apMemberOfBusinessGroupDisplayList.find( (x) => {
  //     return x.apBusinessGroupDisplay.apBusinessGroupParentEntityId === undefined;
  //   });
  //   if(apMemberOfBusinessGroupDisplay === undefined) throw new Error(`${logName}: apMemberOfBusinessGroupDisplay === undefined`);
  //   return {
  //     apEntityId: apUserDisplay.apEntityId,
  //     apOrganizationAuthRoleEntityIdList: apMemberOfBusinessGroupDisplay.apConfiguredBusinessGroupRoleEntityIdList
  //   };
  // }

  // public validate_Update_OrganizationUser_With_OrganizationRoles({organizationId, currentApUserDisplay, updateApUserOrganizationRolesDisplay }: {
  //   organizationId: string;
  //   currentApUserDisplay: IAPUserDisplay;
  //   updateApUserOrganizationRolesDisplay: TAPUserOrganizationRolesDisplay;
  // }): boolean {
  //   const funcName = 'validate_Update_OrganizationUser_With_OrganizationRoles';
  //   const logName = `${this.BaseComponentName}.${funcName}()`;
  //   if(updateApUserOrganizationRolesDisplay.apOrganizationAuthRoleEntityIdList.length > 0) return true;
  //   // apply the new roles
  //   const apMemberOfBusinessGroupDisplayList: TAPMemberOfBusinessGroupDisplayList = this.apply_ApUserOrganiztionRolesDisplay_To_ApUserDisplay({
  //     organizationId: organizationId,
  //     apUserDisplay: currentApUserDisplay,
  //     apUserOrganizationRolesDisplay: updateApUserOrganizationRolesDisplay
  //   });
  //   // check if any other business groups with roles in them
  //   // if not, then return false
  //   for(const apMemberOfBusinessGroupDisplay of apMemberOfBusinessGroupDisplayList) {
  //     // alert(`${logName}: apMemberOfBusinessGroupDisplay.apConfiguredBusinessGroupRoleEntityIdList = ${JSON.stringify(apMemberOfBusinessGroupDisplay.apConfiguredBusinessGroupRoleEntityIdList, null, 2)}`);
  //     if(apMemberOfBusinessGroupDisplay.apConfiguredBusinessGroupRoleEntityIdList.length > 0) return true;
  //   }
  //   return false;
  // }

  // public validate_Update_OrganizationUser_With_ApMemberOfBusinessGroupDisplayList({organizationEntityId, currentApUserDisplay, updateApUserMemberOfBusinessGroupDisplayList}: {
  //   organizationEntityId: TAPEntityId;
  //   currentApUserDisplay: IAPUserDisplay;
  //   updateApUserMemberOfBusinessGroupDisplayList: TAPMemberOfBusinessGroupDisplayList;
  // }): boolean {
  //   const funcName = 'validate_Update_OrganizationUser_With_ApMemberOfBusinessGroupDisplayList';
  //   const logName = `${this.BaseComponentName}.${funcName}()`;
  //   // make a copy
  //   const copyOfCurrentApUserDisplay: IAPUserDisplay = JSON.parse(JSON.stringify(currentApUserDisplay));
  //   const newList: TAPMemberOfOrganizationBusinessGroupsDisplayList = this.apply_ApMemberOfOrganizationGroupDisplayList_To_ApsUserDisplay({
  //     organizationEntityId: organizationEntityId,
  //     apUserDisplay: copyOfCurrentApUserDisplay,
  //     apMemberOfBusinessGroupDisplayList: updateApUserMemberOfBusinessGroupDisplayList
  //   });
  //   const apsOrganizationRolesList: APSOrganizationRolesList = APLegacyUserDisplayService.create_APSOrganizationRolesList_From_ApMemberOfOrganizationGroupsDisplayList({
  //     apMemberOfOrganizationGroupsDisplayList: newList
  //   });
  //   if(apsOrganizationRolesList.length !== 1) throw new Error(`${logName}: apsOrganizationRolesList.length !== 1`);
  //   if(apsOrganizationRolesList[0].roles.length === 0) return false;
  //   return true;
  // }

  // public set_ApUserOrganizationRolesDisplay({organizationEntityId, apUserDisplay, apUserOrganizationRolesDisplay}:{
  //   organizationEntityId: TAPEntityId;
  //   apUserDisplay: TAPUserDisplay;
  //   apUserOrganizationRolesDisplay: TAPUserOrganizationRolesDisplay;
  // }): TAPUserDisplay {

  //   const apMemberOfBusinessGroupDisplayList: TAPMemberOfBusinessGroupDisplayList = this.apply_ApUserOrganiztionRolesDisplay_To_ApUserDisplay({
  //     apUserDisplay: apUserDisplay,
  //     apUserOrganizationRolesDisplay: apUserOrganizationRolesDisplay,
  //     organizationId: organizationEntityId.id,
  //   });
  //   const apMemberOfOrganizationGroupsDisplayList: TAPMemberOfOrganizationGroupsDisplayList = this.apply_ApMemberOfOrganizationGroupDisplayList_To_ApsUserDisplay({
  //     organizationEntityId: organizationEntityId,
  //     apUserDisplay: apUserDisplay,
  //     apMemberOfBusinessGroupDisplayList: apMemberOfBusinessGroupDisplayList
  //   });
  //   apUserDisplay.apMemberOfOrganizationGroupsDisplayList = apMemberOfOrganizationGroupsDisplayList;
  //   return apUserDisplay;
  // }

  // private apply_ApUserOrganiztionRolesDisplay_To_ApUserDisplay({organizationId, apUserDisplay, apUserOrganizationRolesDisplay}: {
  //   organizationId: string;
  //   apUserDisplay: TAPUserDisplay;
  //   apUserOrganizationRolesDisplay: TAPUserOrganizationRolesDisplay;
  // }): TAPMemberOfBusinessGroupDisplayList {
  //   const funcName = 'apply_ApUserOrganiztionRolesDisplay_To_ApUserDisplay';
  //   const logName = `${this.BaseComponentName}.${funcName}()`;

  //   const apMemberOfBusinessGroupDisplayList: TAPMemberOfBusinessGroupDisplayList = this.find_ApMemberOfBusinessGroupDisplayList({
  //     organizationId: organizationId,
  //     apUserDisplay: apUserDisplay
  //   });
  //   // this is the top level business group
  //   const index = apMemberOfBusinessGroupDisplayList.findIndex( (x) => {
  //     return x.apBusinessGroupDisplay.apBusinessGroupParentEntityId === undefined;
  //   });
  //   if(index === -1) throw new Error(`${logName}: index === -1`);
  //   const newApMemmberOfBusinessGroupDisplay: TAPMemberOfBusinessGroupDisplay = {
  //     apBusinessGroupDisplay: apMemberOfBusinessGroupDisplayList[index].apBusinessGroupDisplay,
  //     apConfiguredBusinessGroupRoleEntityIdList: apUserOrganizationRolesDisplay.apOrganizationAuthRoleEntityIdList,
  //     apCalculatedBusinessGroupRoleEntityIdList: []
  //   }
  //   apMemberOfBusinessGroupDisplayList[index] = newApMemmberOfBusinessGroupDisplay;
  //   return apMemberOfBusinessGroupDisplayList;
  // }

  // private apply_ApMemberOfOrganizationGroupDisplayList_To_ApsUserDisplay({organizationEntityId, apUserDisplay, apMemberOfBusinessGroupDisplayList}:{
  //   organizationEntityId: TAPEntityId;
  //   apUserDisplay: TAPUserDisplay;
  //   apMemberOfBusinessGroupDisplayList: TAPMemberOfBusinessGroupDisplayList;  
  // }): TAPMemberOfOrganizationGroupsDisplayList {
  //   const funcName = 'apply_ApMemberOfOrganizationGroupDisplayList_To_ApsUserDisplay';
  //   const logName = `${this.BaseComponentName}.${funcName}()`;

  //   const list: TAPMemberOfOrganizationGroupsDisplayList = apUserDisplay.apMemberOfOrganizationGroupsDisplayList;
  //   const existingIndex = list.findIndex( (apMemberOfOrganizationGroupsDisplay: TAPMemberOfOrganizationGroupsDisplay) => {
  //     return apMemberOfOrganizationGroupsDisplay.apEntityId.id === organizationEntityId.id;
  //   });
  //   if(existingIndex > -1) {
  //     // replace
  //     list[existingIndex].apMemberOfBusinessGroupDisplayList = apMemberOfBusinessGroupDisplayList;
  //   } else {
  //     // add
  //     list.push({
  //       apEntityId: organizationEntityId,
  //       apMemberOfBusinessGroupDisplayList: apMemberOfBusinessGroupDisplayList
  //     });      
  //   }
  //   return list;
  // }


  // private async apsGet_ApMemberOfBusinessGroupDisplayList({organizationId, apsUserResponse, organization_ApBusinessGroupDisplayList }: {
  //   organizationId: string;
  //   apsUserResponse: APSUserResponse;
  //   organization_ApBusinessGroupDisplayList: TAPBusinessGroupDisplayList;
  // }): Promise<TAPMemberOfBusinessGroupDisplayList> {
  //   const funcName = 'apsGet_ApMemberOfBusinessGroupDisplayList';
  //   const logName = `${this.BaseComponentName}.${funcName}()`;

  //   const found: APSMemberOfOrganizationGroups | undefined = apsUserResponse.memberOfOrganizationGroups?.find( (x: APSMemberOfOrganizationGroups) => {
  //     return x.organizationId === organizationId;
  //   });
  //   if(found === undefined) throw new Error(`${logName}: found === undefined`);
  //   const apMemberOfBusinessGroupDisplayList: TAPMemberOfBusinessGroupDisplayList = [];
  //   for(const apsMemberOfBusinessGroup of found.memberOfBusinessGroupList) {
  //     const apBusinessGroupDisplay: TAPBusinessGroupDisplay = await APBusinessGroupsDisplayService.getApBusinessGroupDisplay({
  //       organizationId: organizationId,
  //       businessGroupId: apsMemberOfBusinessGroup.businessGroupId
  //     });
  //     apMemberOfBusinessGroupDisplayList.push({
  //       apBusinessGroupDisplay: apBusinessGroupDisplay,
  //       apConfiguredBusinessGroupRoleEntityIdList: APRbacDisplayService.create_BusinessGroupRoles_EntityIdList(apsMemberOfBusinessGroup.roles),
  //       apCalculatedBusinessGroupRoleEntityIdList: this.create_CalculatedBusinessGroupRoles_EntityIdList({
  //         businessGroupId: apsMemberOfBusinessGroup.businessGroupId,
  //         apBusinessGroupDisplayList: organization_ApBusinessGroupDisplayList,
  //         apsMemberOfOrganizationGroups: found
  //       })
  //     });
  //   }
  //   return apMemberOfBusinessGroupDisplayList;
  // }

  public async apsGetList_ApOrganizationUserDisplayListResponse({
    organizationEntityId,
    pageSize = 20,
    pageNumber = 1,
    sortFieldName,
    sortDirection,
    searchWordList,
  }: {
    organizationEntityId: TAPEntityId;
    pageSize?: number,
    pageNumber?: number,
    sortFieldName?: string,
    sortDirection?: EAPSSortDirection,
    searchWordList?: string,
  }): Promise<TAPOrganizationUserDisplayListResponse> {
  
    // change this call once aps has a the new organization user resource
    const listApsUsersResponse: ListApsUsersResponse = await ApsUsersService.listApsUsers({
      pageSize: pageSize,
      pageNumber: pageNumber,
      sortFieldName: sortFieldName,
      sortDirection: sortDirection,
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
      });
      apOrganizationUserDisplayList.push(apOrganizationUserDisplay);
    }
    const response: TAPOrganizationUserDisplayListResponse = {
      apOrganizationUserDisplayList: apOrganizationUserDisplayList,
      meta: listApsUsersResponse.meta
    };
    return response;


    // const apUserDisplayListResponse: TAPUserDisplayListResponse = await this.apsGetList_ApUserDisplayListResponse({
    //   pageSize: pageSize,
    //   pageNumber: pageNumber,
    //   sortFieldName: sortFieldName,
    //   sortDirection: sortDirection,
    //   searchWordList: searchWordList,
    //   searchOrganizationId: organizationEntityId.id
    // });
    // const apOrganizationUserDisplayList: TAPOrganizationUserDisplayList = apUserDisplayListResponse.apUserDisplayList.map( (x) => {
    //   return {
    //     ...x,
    //     apOrganizationEntityId: organizationEntityId
    //   };
    // });
    // const response: TAPOrganizationUserDisplayListResponse = {
    //   apOrganizationUserDisplayList: apOrganizationUserDisplayList,
    //   meta: apUserDisplayListResponse.meta
    // };
    // return response;
  }
  

}

export default new APOrganizationUsersDisplayService();
