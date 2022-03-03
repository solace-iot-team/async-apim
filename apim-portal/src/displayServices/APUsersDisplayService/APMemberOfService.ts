
import APEntityIdsService, { 
  IAPEntityIdDisplay, 
  TAPEntityId, 
  TAPEntityIdList }
   from "../../utils/APEntityIdsService";
import { 
  APSMemberOfBusinessGroup, 
  APSMemberOfOrganizationGroups, 
  APSUserResponse 
} from "../../_generated/@solace-iot-team/apim-server-openapi-browser";
import APBusinessGroupsDisplayService, { 
  TAPBusinessGroupDisplay, TAPBusinessGroupDisplayList 
} from "../APBusinessGroupsDisplayService";
import APRbacDisplayService from "../APRbacDisplayService";


export type TAPMemberOfOrganizationDisplay =  IAPEntityIdDisplay & {
  apOrganizationRoleEntityIdList: TAPEntityIdList;
}

export type TAPMemberOfBusinessGroupDisplay =  {
  apBusinessGroupDisplay: TAPBusinessGroupDisplay;
  apConfiguredBusinessGroupRoleEntityIdList: TAPEntityIdList;
  apCalculatedBusinessGroupRoleEntityIdList: TAPEntityIdList;
}
export type TAPMemberOfBusinessGroupDisplayList = Array<TAPMemberOfBusinessGroupDisplay>;

export type TAPMemberOfBusinessGroupDisplayTreeNode = {
  apMemberOfBusinessGroupDisplay: TAPMemberOfBusinessGroupDisplay;
  children: TAPMemberOfBusinessGroupDisplayTreeNodeList;
}
export type TAPMemberOfBusinessGroupDisplayTreeNodeList = Array<TAPMemberOfBusinessGroupDisplayTreeNode>;

export type TAPMemberOfBusinessGroupTreeTableNode = {
  key: string;
  label: string;
  data: TAPMemberOfBusinessGroupDisplay;
  children: TAPMemberOfBusinessGroupTreeTableNodeList;
}
export type TAPMemberOfBusinessGroupTreeTableNodeList = Array<TAPMemberOfBusinessGroupTreeTableNode>;

class APMemberOfService {
  private readonly ComponentName = "APMemberOfService";

  public create_Empty_ApMemberOfOrganizationDisplay({organizationEntityId}:{
    organizationEntityId: TAPEntityId;
  }): TAPMemberOfOrganizationDisplay {
    const apMemberOfOrganizationDisplay: TAPMemberOfOrganizationDisplay = {
      apEntityId: organizationEntityId,
      apOrganizationRoleEntityIdList: []
    };
    return apMemberOfOrganizationDisplay;
  }

  public create_ApMemberOfBusinessGroupTreeTableNodeList({apMemberOfBusinessGroupDisplayTreeNodeList}:{
    apMemberOfBusinessGroupDisplayTreeNodeList: TAPMemberOfBusinessGroupDisplayTreeNodeList;
  }): TAPMemberOfBusinessGroupTreeTableNodeList {

    const apMemberOfBusinessGroupTreeTableNodeList: TAPMemberOfBusinessGroupTreeTableNodeList = [];

    for(const apMemberOfBusinessGroupDisplayTreeNode of apMemberOfBusinessGroupDisplayTreeNodeList) {
      const apBusinessGroupDisplay: TAPBusinessGroupDisplay = apMemberOfBusinessGroupDisplayTreeNode.apMemberOfBusinessGroupDisplay.apBusinessGroupDisplay;
      const apMemberOfBusinessGroupTreeTableNode: TAPMemberOfBusinessGroupTreeTableNode = {
        key: apBusinessGroupDisplay.apEntityId.id,
        label: apBusinessGroupDisplay.apEntityId.displayName,
        data: {
          apBusinessGroupDisplay: apBusinessGroupDisplay,
          apCalculatedBusinessGroupRoleEntityIdList: apMemberOfBusinessGroupDisplayTreeNode.apMemberOfBusinessGroupDisplay.apCalculatedBusinessGroupRoleEntityIdList,
          apConfiguredBusinessGroupRoleEntityIdList: apMemberOfBusinessGroupDisplayTreeNode.apMemberOfBusinessGroupDisplay.apConfiguredBusinessGroupRoleEntityIdList,
        },
        children: this.create_ApMemberOfBusinessGroupTreeTableNodeList({
          apMemberOfBusinessGroupDisplayTreeNodeList: apMemberOfBusinessGroupDisplayTreeNode.children,
        })
      };
      apMemberOfBusinessGroupTreeTableNodeList.push(apMemberOfBusinessGroupTreeTableNode);
    }
    return apMemberOfBusinessGroupTreeTableNodeList;
  }

  /**
   * Calculates roles for each business group in the tree:
   * - each group inherits all organization level roles 
   * - each child inherits all roles from parent in addition to organization level roles
   * @returns TAPMemberOfBusinessGroupDisplayTreeNodeList - same list with calculated roles set
   */
   public calculate_BusinessGroupRoles({apMemberOfBusinessGroupDisplayTreeNodeList, apOrganizationRoleEntityIdList, parentCalculatedRoles}: {
    apMemberOfBusinessGroupDisplayTreeNodeList: TAPMemberOfBusinessGroupDisplayTreeNodeList;
    apOrganizationRoleEntityIdList: TAPEntityIdList;
    parentCalculatedRoles?: TAPEntityIdList;
  }): TAPMemberOfBusinessGroupDisplayTreeNodeList {
    const funcName = 'calculate_BusinessGroupRoles';
    const logName = `${this.ComponentName}.${funcName}()`;

    for(const apMemberOfBusinessGroupDisplayTreeNode of apMemberOfBusinessGroupDisplayTreeNodeList) {
      const configuredRoles: TAPEntityIdList = apMemberOfBusinessGroupDisplayTreeNode.apMemberOfBusinessGroupDisplay.apConfiguredBusinessGroupRoleEntityIdList;
      const calculatedRoles: TAPEntityIdList = APEntityIdsService.create_deduped_EntityIdList(configuredRoles.concat(apOrganizationRoleEntityIdList, configuredRoles, parentCalculatedRoles ? parentCalculatedRoles : []));
      apMemberOfBusinessGroupDisplayTreeNode.apMemberOfBusinessGroupDisplay.apCalculatedBusinessGroupRoleEntityIdList = calculatedRoles;
      this.calculate_BusinessGroupRoles({
        apMemberOfBusinessGroupDisplayTreeNodeList: apMemberOfBusinessGroupDisplayTreeNode.children,
        apOrganizationRoleEntityIdList: apOrganizationRoleEntityIdList,
        parentCalculatedRoles: calculatedRoles
      });
    }
    return apMemberOfBusinessGroupDisplayTreeNodeList;
  }

  /**
   * Create organzation roles from root business group for the organization in APSUserResponse.
   * 
   */
  public create_ApMemberOfOrganizationDisplay({organizationEntityId, apsUserResponse, completeApOrganizationBusinessGroupDisplayList}:{
    organizationEntityId: TAPEntityId;
    apsUserResponse: APSUserResponse;
    completeApOrganizationBusinessGroupDisplayList: TAPBusinessGroupDisplayList;
  }): TAPMemberOfOrganizationDisplay {
    const funcName = 'create_ApMemberOfOrganizationDisplay';
    const logName = `${this.ComponentName}.${funcName}()`;

    // find the root business group
    const rootApBusinesGroupDisplay: TAPBusinessGroupDisplay = APBusinessGroupsDisplayService.find_root_ApBusinessGroupDisplay({ completeApOrganizationBusinessGroupDisplayList: completeApOrganizationBusinessGroupDisplayList});

    // find the business group entry for this organization - there must be at least a root business group with the organization roles.
    // NOTE: future: may not be member of any group. get it from a different field in APSUserResponse
    if(apsUserResponse.memberOfOrganizationGroups === undefined) throw new Error(`${logName}: apsUserResponse.memberOfOrganizationGroups === undefined`);

    if(apsUserResponse.memberOfOrganizationGroups !== undefined) {
      const apsMemberOfOrganizationGroups: APSMemberOfOrganizationGroups | undefined = apsUserResponse.memberOfOrganizationGroups.find( (x) => {
        return x.organizationId === organizationEntityId.id;
      });
      if(apsMemberOfOrganizationGroups === undefined) throw new Error(`${logName}: apsMemberOfOrganizationGroups === undefined`);
      // find the roles for the root business group
      const apsMemberOfBusinessGroup: APSMemberOfBusinessGroup | undefined = apsMemberOfOrganizationGroups.memberOfBusinessGroupList.find( (x) => {
        return x.businessGroupId === rootApBusinesGroupDisplay.apEntityId.id;
      });
      if(apsMemberOfBusinessGroup === undefined || apsMemberOfBusinessGroup.roles.length === 0) return this.create_Empty_ApMemberOfOrganizationDisplay({ organizationEntityId: organizationEntityId });

      const apMemberOfOrganizationDisplay: TAPMemberOfOrganizationDisplay = {
        apEntityId: organizationEntityId,
        apOrganizationRoleEntityIdList: APRbacDisplayService.create_BusinessGroupRoles_EntityIdList({apsBusinessGroupAuthRoleList: apsMemberOfBusinessGroup.roles}),
      };
      return apMemberOfOrganizationDisplay;

    } else {
      return this.create_Empty_ApMemberOfOrganizationDisplay({ organizationEntityId: organizationEntityId });
    }
  }

  private create_ApMemberOfBusinessGroupDisplayTreeNode({apBusinessGroupDisplay, apsMemberOfBusinessGroup}:{
    apBusinessGroupDisplay: TAPBusinessGroupDisplay;
    apsMemberOfBusinessGroup?: APSMemberOfBusinessGroup;
  }): TAPMemberOfBusinessGroupDisplayTreeNode {

    const apConfiguredBusinessGroupRoleEntityIdList: TAPEntityIdList = apsMemberOfBusinessGroup ? APRbacDisplayService.create_BusinessGroupRoles_EntityIdList({
      apsBusinessGroupAuthRoleList: apsMemberOfBusinessGroup.roles
    }) : [];

    const apMemberOfBusinessGroupDisplay: TAPMemberOfBusinessGroupDisplay = {
      apBusinessGroupDisplay: apBusinessGroupDisplay,
      apConfiguredBusinessGroupRoleEntityIdList: apConfiguredBusinessGroupRoleEntityIdList,
      apCalculatedBusinessGroupRoleEntityIdList: [],
    }
    const apMemberOfBusinessGroupDisplayTreeNode: TAPMemberOfBusinessGroupDisplayTreeNode = {
      apMemberOfBusinessGroupDisplay: apMemberOfBusinessGroupDisplay,
      children: []
    };
    return apMemberOfBusinessGroupDisplayTreeNode;
  }

  private create_ApMemberOfBusinessGroupDisplayTreeNode_From_ApsMemberOfBusinessGroupsList({apBusinessGroupDisplay, apsMemberOfBusinessGroupList, completeApOrganizationBusinessGroupDisplayList}:{
    apBusinessGroupDisplay: TAPBusinessGroupDisplay;
    apsMemberOfBusinessGroupList: APSMemberOfBusinessGroup[];
    completeApOrganizationBusinessGroupDisplayList: TAPBusinessGroupDisplayList;
  }): TAPMemberOfBusinessGroupDisplayTreeNode {
    const funcName = 'create_ApMemberOfBusinessGroupDisplayTreeNode_From_ApsMemberOfBusinessGroupsList';
    const logName = `${this.ComponentName}.${funcName}()`;

    // find the business group
    const apsMemberOfBusinessGroup: APSMemberOfBusinessGroup | undefined = apsMemberOfBusinessGroupList.find( (x) => {
      return x.businessGroupId === apBusinessGroupDisplay.apEntityId.id;
    });
    // create this tree ndoe
    const thisTreeNode: TAPMemberOfBusinessGroupDisplayTreeNode = this.create_ApMemberOfBusinessGroupDisplayTreeNode({
      apBusinessGroupDisplay: apBusinessGroupDisplay,
      apsMemberOfBusinessGroup: apsMemberOfBusinessGroup,
    });
    // add all the children
    for(const childEntityId of apBusinessGroupDisplay.apBusinessGroupChildrenEntityIdList) {
      // find the business group
      const child_apBusinessGroupDisplay: TAPBusinessGroupDisplay | undefined = completeApOrganizationBusinessGroupDisplayList.find( (x) => {
        return x.apEntityId.id === childEntityId.id;
      });
      if(child_apBusinessGroupDisplay === undefined) throw new Error(`${logName}: child_apBusinessGroupDisplay === undefined`);
      // recurse into child
      const childTreeNodeDisplay: TAPMemberOfBusinessGroupDisplayTreeNode = this.create_ApMemberOfBusinessGroupDisplayTreeNode_From_ApsMemberOfBusinessGroupsList({
        apBusinessGroupDisplay: child_apBusinessGroupDisplay,
        apsMemberOfBusinessGroupList: apsMemberOfBusinessGroupList,
        completeApOrganizationBusinessGroupDisplayList: completeApOrganizationBusinessGroupDisplayList,
      });
      thisTreeNode.children.push(childTreeNodeDisplay);
    }
    return thisTreeNode;
  }

  public create_ApMemberOfBusinessGroupDisplayTreeNodeList({organizationEntityId, apsUserResponse, completeApOrganizationBusinessGroupDisplayList, apOrganizationRoleEntityIdList}: {
    organizationEntityId: TAPEntityId;
    apsUserResponse: APSUserResponse;
    completeApOrganizationBusinessGroupDisplayList: TAPBusinessGroupDisplayList;
    apOrganizationRoleEntityIdList: TAPEntityIdList;
  }): TAPMemberOfBusinessGroupDisplayTreeNodeList {
    const funcName = 'create_ApMemberOfBusinessGroupDisplayTreeNodeList';
    const logName = `${this.ComponentName}.${funcName}()`;

    if(apsUserResponse.memberOfOrganizationGroups === undefined) return [];
    // get the roles for this organization
    const apsMemberOfOrganizationGroups: APSMemberOfOrganizationGroups | undefined = apsUserResponse.memberOfOrganizationGroups.find( (x) => {
      return x.organizationId === organizationEntityId.id;
    });
    if(apsMemberOfOrganizationGroups === undefined) throw new Error(`${logName}: apsMemberOfOrganizationGroups === undefined`);

    const list: TAPMemberOfBusinessGroupDisplayTreeNodeList = [];

    for(const apBusinessGroupDisplay of completeApOrganizationBusinessGroupDisplayList) {
      if(apBusinessGroupDisplay.apBusinessGroupParentEntityId === undefined) {
        // const rootTreeNode: TAPMemberOfBusinessGroupDisplayTreeNode = this.generate_ApMemberOfBusinessGroupsTreeNodeDisplay_From_ApBusinessGroupDisplay({
        const rootTreeNode: TAPMemberOfBusinessGroupDisplayTreeNode = this.create_ApMemberOfBusinessGroupDisplayTreeNode_From_ApsMemberOfBusinessGroupsList({
          apBusinessGroupDisplay: apBusinessGroupDisplay,
          apsMemberOfBusinessGroupList: apsMemberOfOrganizationGroups.memberOfBusinessGroupList,
          completeApOrganizationBusinessGroupDisplayList: completeApOrganizationBusinessGroupDisplayList,          
        });
        list.push(rootTreeNode);
      }
    }
    // remove the single root node if there is only one and if this has same id as organization ==> future compatibility
    let interimList: TAPMemberOfBusinessGroupDisplayTreeNodeList = [];
    if(list.length === 1 && list[0].apMemberOfBusinessGroupDisplay.apBusinessGroupDisplay.apEntityId.id === organizationEntityId.id) {
        interimList.push(...list[0].children);
    } else interimList = list;
    // calculate roles in all business groups
    const finalList: TAPMemberOfBusinessGroupDisplayTreeNodeList = this.calculate_BusinessGroupRoles({
      apMemberOfBusinessGroupDisplayTreeNodeList: interimList,
      apOrganizationRoleEntityIdList: apOrganizationRoleEntityIdList,
    });
    return finalList;
  }

  public create_ApMemberOfBusinessGroupDisplayList({apMemberOfBusinessGroupDisplayTreeNodeList}:{
    apMemberOfBusinessGroupDisplayTreeNodeList: TAPMemberOfBusinessGroupDisplayTreeNodeList;
  }): TAPMemberOfBusinessGroupDisplayList {
    const apMemberOfBusinessGroupDisplayList: TAPMemberOfBusinessGroupDisplayList = [];

    for(const apMemberOfBusinessGroupDisplayTreeNode of apMemberOfBusinessGroupDisplayTreeNodeList) {
      if(apMemberOfBusinessGroupDisplayTreeNode.apMemberOfBusinessGroupDisplay.apConfiguredBusinessGroupRoleEntityIdList.length > 0) {
        apMemberOfBusinessGroupDisplayList.push(apMemberOfBusinessGroupDisplayTreeNode.apMemberOfBusinessGroupDisplay);
      }
      // collect the children
      apMemberOfBusinessGroupDisplayList.push(
        ...this.create_ApMemberOfBusinessGroupDisplayList({ apMemberOfBusinessGroupDisplayTreeNodeList: apMemberOfBusinessGroupDisplayTreeNode.children})
      ); 
    }
    return apMemberOfBusinessGroupDisplayList;
  }


  // public create_ApMemberOfBusinessGroupDisplayList({organizationEntityId, apsUserResponse, completeApOrganizationBusinessGroupDisplayList}:{
  //   organizationEntityId: TAPEntityId;
  //   apsUserResponse: APSUserResponse;
  //   completeApOrganizationBusinessGroupDisplayList: TAPBusinessGroupDisplayList;
  // }): TAPMemberOfBusinessGroupDisplayList {

  //   if(apsUserResponse.memberOfOrganizationGroups === undefined) return [];

  //   const apsMemberOfOrganizationGroups: APSMemberOfOrganizationGroups | undefined = apsUserResponse.memberOfOrganizationGroups.find( (x) => {
  //     return x.organizationId === organizationEntityId.id;
  //   });
  //   if(apsMemberOfOrganizationGroups === undefined) return [];

  //   // in case we need to get it at some point
  //   // if(organization_ApBusinessGroupDisplayList === undefined) organization_ApBusinessGroupDisplayList = await APBusinessGroupsDisplayService.apsGetList_ApBusinessGroupSystemDisplayList({
  //   //   organizationId: organizationEntityId.id
  //   // });
  
  //   const apMemberOfBusinessGroupDisplayList: TAPMemberOfBusinessGroupDisplayList = [];

  //   for(const apsMemberOfBusinessGroup of apsMemberOfOrganizationGroups.memberOfBusinessGroupList) {
  //     apMemberOfBusinessGroupDisplayList.push({
  //       apBusinessGroupDisplay: APBusinessGroupsDisplayService.find_ApBusinessGroupDisplay_by_id({ 
  //         apBusinessGroupDisplayList: completeApOrganizationBusinessGroupDisplayList, 
  //         businessGroupId: apsMemberOfBusinessGroup.businessGroupId
  //       }),
  //       apConfiguredBusinessGroupRoleEntityIdList: APRbacDisplayService.create_BusinessGroupRoles_EntityIdList({apsBusinessGroupAuthRoleList: apsMemberOfBusinessGroup.roles}),
  //       apCalculatedBusinessGroupRoleEntityIdList: {},
  //     });
  //   }
  //   return apMemberOfBusinessGroupDisplayList;
  // }

  // apEntityId: organizationEntityId,
  // apMemberOfBusinessGroupDisplayList: await this.apsGet_ApMemberOfBusinessGroupDisplayList({
  //   organizationId: organizationEntityId.id,
  //   apsUserResponse: apsUserResponse,
  //   organization_ApBusinessGroupDisplayList: organization_ApBusinessGroupDisplayList,

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

  // const rootBusinessGroupDisplay: TAPBusinessGroupDisplay = await APBusinessGroupsDisplayService.getRootApBusinessGroupDisplay({
  //   organizationId: organizationEntityId.id,
  // });
  // const apMemberOfBusinessGroupDisplay: TAPMemberOfBusinessGroupDisplay = {
  //   apBusinessGroupDisplay: rootBusinessGroupDisplay,
  //   apCalculatedBusinessGroupRoleEntityIdList: [],
  //   apConfiguredBusinessGroupRoleEntityIdList: []
  // }
  // const apMemberOfOrganizationGroupsDisplay: TAPMemberOfOrganizationBusinessGroupsDisplay = {
  //   apEntityId: organizationEntityId,
  //   apMemberOfBusinessGroupDisplayList: [apMemberOfBusinessGroupDisplay],
  // };
  // return apMemberOfOrganizationGroupsDisplay;

  
}

export default new APMemberOfService();
