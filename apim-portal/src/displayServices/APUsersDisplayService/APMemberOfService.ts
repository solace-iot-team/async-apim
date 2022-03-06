
import APEntityIdsService, { 
  IAPEntityIdDisplay, 
  TAPEntityId, 
  TAPEntityIdList }
   from "../../utils/APEntityIdsService";
import { 
  APSMemberOfBusinessGroup, 
  APSMemberOfOrganizationGroups, 
  APSOrganizationRolesResponse, 
  APSUserResponse 
} from "../../_generated/@solace-iot-team/apim-server-openapi-browser";
import APBusinessGroupsDisplayService, { 
  TAPBusinessGroupDisplay, TAPBusinessGroupDisplayList 
} from "../APBusinessGroupsDisplayService";
import APRbacDisplayService from "../APRbacDisplayService";

/**
 * Organization & organization roles for a user.
 * @property {TAPEntityId} apEntityId - the organization
 */
export type TAPMemberOfOrganizationDisplay =  IAPEntityIdDisplay & {
  /** list of organization roles, can be empty */
  apOrganizationRoleEntityIdList: TAPEntityIdList;
  /** the legacy organization roles, will disappear in FUTURE */
  apLegacyOrganizationRoleEntityIdList: TAPEntityIdList;
}

export type TAPMemberOfBusinessGroupDisplay =  {
  apBusinessGroupDisplay: TAPBusinessGroupDisplay;
  apConfiguredBusinessGroupRoleEntityIdList: TAPEntityIdList;
  /** the calculated roles, if undefined, not calculated */
  apCalculatedBusinessGroupRoleEntityIdList?: TAPEntityIdList;
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

  // public nameOf_ApMemberOfBusinessGroupTreeTableNode(name: keyof TAPMemberOfBusinessGroupTreeTableNode) {
  //   return `node.${name}`;
  // }

  public create_Empty_ApMemberOfOrganizationDisplay({organizationEntityId}:{
    organizationEntityId: TAPEntityId;
  }): TAPMemberOfOrganizationDisplay {
    const apMemberOfOrganizationDisplay: TAPMemberOfOrganizationDisplay = {
      apEntityId: organizationEntityId,
      apOrganizationRoleEntityIdList: [],
      apLegacyOrganizationRoleEntityIdList: [],
    };
    return apMemberOfOrganizationDisplay;
  }

  /**
   * Create organzation roles from root business group for the organization in APSUserResponse.
   */
  public create_ApMemberOfOrganizationDisplay({organizationEntityId, apsUserResponse, completeApOrganizationBusinessGroupDisplayList}:{
    organizationEntityId: TAPEntityId;
    apsUserResponse: APSUserResponse;
    completeApOrganizationBusinessGroupDisplayList: TAPBusinessGroupDisplayList;
  }): TAPMemberOfOrganizationDisplay {
    const funcName = 'create_ApMemberOfOrganizationDisplay';
    const logName = `${this.ComponentName}.${funcName}()`;

    // LEGACY: find the organizationId and get the legacy roles
    const apsOrganizationRolesResponse: APSOrganizationRolesResponse | undefined = apsUserResponse.memberOfOrganizations.find( (x) => {
      return x.organizationId === organizationEntityId.id;
    });
    if(apsOrganizationRolesResponse === undefined) throw new Error(`${logName}: apsOrganizationRolesResponse === undefined`);

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
        apLegacyOrganizationRoleEntityIdList: APRbacDisplayService.create_OrganizationRoles_EntityIdList(apsOrganizationRolesResponse.roles),
      };
      return apMemberOfOrganizationDisplay;

    } else {
      return this.create_Empty_ApMemberOfOrganizationDisplay({ organizationEntityId: organizationEntityId });
    }
  }

  /** Create flat list of business groups and roles from APSUserResponse */
  public create_ApMemberOfBusinessGroupDisplayList({organizationEntityId, apsUserResponse, completeApOrganizationBusinessGroupDisplayList}:{
    organizationEntityId: TAPEntityId;
    apsUserResponse: APSUserResponse;
    completeApOrganizationBusinessGroupDisplayList: TAPBusinessGroupDisplayList;
  }): TAPMemberOfBusinessGroupDisplayList {

    if(apsUserResponse.memberOfOrganizationGroups.length === 0) return [];

    // find the organization
    const apsMemberOfOrganizationGroups: APSMemberOfOrganizationGroups | undefined = apsUserResponse.memberOfOrganizationGroups.find( (x) => {
      return x.organizationId === organizationEntityId.id;
    });
    if(apsMemberOfOrganizationGroups === undefined) return [];

    // in case we need to get it at some point
    // if(organization_ApBusinessGroupDisplayList === undefined) organization_ApBusinessGroupDisplayList = await APBusinessGroupsDisplayService.apsGetList_ApBusinessGroupSystemDisplayList({
    //   organizationId: organizationEntityId.id
    // });
  
    const apMemberOfBusinessGroupDisplayList: TAPMemberOfBusinessGroupDisplayList = [];

    for(const apsMemberOfBusinessGroup of apsMemberOfOrganizationGroups.memberOfBusinessGroupList) {
      const apMemberOfBusinessGroupDisplay: TAPMemberOfBusinessGroupDisplay = {
        apBusinessGroupDisplay: APBusinessGroupsDisplayService.find_ApBusinessGroupDisplay_by_id({ 
          apBusinessGroupDisplayList: completeApOrganizationBusinessGroupDisplayList, 
          businessGroupId: apsMemberOfBusinessGroup.businessGroupId
        }),
        apConfiguredBusinessGroupRoleEntityIdList: APRbacDisplayService.create_BusinessGroupRoles_EntityIdList({apsBusinessGroupAuthRoleList: apsMemberOfBusinessGroup.roles}),
      };
      apMemberOfBusinessGroupDisplayList.push(apMemberOfBusinessGroupDisplay);
    }
    return apMemberOfBusinessGroupDisplayList;
  }

  /**
   * Calculates roles for each business group in the tree:
   * - each group inherits all organization level roles 
   * - each child inherits all roles from parent in addition to organization level roles
   * @returns TAPMemberOfBusinessGroupDisplayTreeNodeList - same list with calculated roles set
   */
   private calculate_BusinessGroupRoles({apMemberOfBusinessGroupDisplayTreeNodeList, apOrganizationRoleEntityIdList, parentCalculatedRoles}: {
    apMemberOfBusinessGroupDisplayTreeNodeList: TAPMemberOfBusinessGroupDisplayTreeNodeList;
    apOrganizationRoleEntityIdList: TAPEntityIdList;
    parentCalculatedRoles?: TAPEntityIdList;
  }): TAPMemberOfBusinessGroupDisplayTreeNodeList {
    // const funcName = 'calculate_BusinessGroupRoles';
    // const logName = `${this.ComponentName}.${funcName}()`;

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

  /** Create the tree node object / contents */
  private create_ApMemberOfBusinessGroupDisplayTreeNodeObject({apBusinessGroupDisplay, configuredRoleList}:{
    apBusinessGroupDisplay: TAPBusinessGroupDisplay;
    configuredRoleList: TAPEntityIdList;
  }): TAPMemberOfBusinessGroupDisplayTreeNode {

    const apMemberOfBusinessGroupDisplay: TAPMemberOfBusinessGroupDisplay = {
      apBusinessGroupDisplay: apBusinessGroupDisplay,
      apConfiguredBusinessGroupRoleEntityIdList: configuredRoleList,
      apCalculatedBusinessGroupRoleEntityIdList: [],
    }
    const apMemberOfBusinessGroupDisplayTreeNode: TAPMemberOfBusinessGroupDisplayTreeNode = {
      apMemberOfBusinessGroupDisplay: apMemberOfBusinessGroupDisplay,
      children: []
    };
    return apMemberOfBusinessGroupDisplayTreeNode;
  }

  /** Recursively create the tree node */
  private create_ApMemberOfBusinessGroupDisplayTreeNode({apBusinessGroupDisplay, configuredRoleList, completeApMemberOfBusinessGroupDisplayList, completeApOrganizationBusinessGroupDisplayList}:{
    apBusinessGroupDisplay: TAPBusinessGroupDisplay;
    configuredRoleList: TAPEntityIdList;
    completeApMemberOfBusinessGroupDisplayList: TAPMemberOfBusinessGroupDisplayList;
    completeApOrganizationBusinessGroupDisplayList: TAPBusinessGroupDisplayList;
  }): TAPMemberOfBusinessGroupDisplayTreeNode {
    const funcName = 'create_ApMemberOfBusinessGroupDisplayTreeNode';
    const logName = `${this.ComponentName}.${funcName}()`;

    // create this tree node
    const thisTreeNode: TAPMemberOfBusinessGroupDisplayTreeNode = this.create_ApMemberOfBusinessGroupDisplayTreeNodeObject({
      apBusinessGroupDisplay: apBusinessGroupDisplay,
      configuredRoleList: configuredRoleList,
    });
    // add all the children
    for(const childEntityId of apBusinessGroupDisplay.apBusinessGroupChildrenEntityIdList) {
      // find the business group
      const child_apBusinessGroupDisplay: TAPBusinessGroupDisplay | undefined = completeApOrganizationBusinessGroupDisplayList.find( (x) => {
        return x.apEntityId.id === childEntityId.id;
      });
      if(child_apBusinessGroupDisplay === undefined) throw new Error(`${logName}: child_apBusinessGroupDisplay === undefined`);
      // find memberOf
      const apMemberOfBusinessGroupDisplay: TAPMemberOfBusinessGroupDisplay | undefined = completeApMemberOfBusinessGroupDisplayList.find( (x) => {
        return x.apBusinessGroupDisplay.apEntityId.id === child_apBusinessGroupDisplay.apEntityId.id;
      });
      const configuredRoleList: TAPEntityIdList = apMemberOfBusinessGroupDisplay ? apMemberOfBusinessGroupDisplay.apConfiguredBusinessGroupRoleEntityIdList : [];
      // recurse into child
      const childTreeNodeDisplay: TAPMemberOfBusinessGroupDisplayTreeNode = this.create_ApMemberOfBusinessGroupDisplayTreeNode({
        apBusinessGroupDisplay: child_apBusinessGroupDisplay,
        configuredRoleList: configuredRoleList,
        completeApMemberOfBusinessGroupDisplayList: completeApMemberOfBusinessGroupDisplayList,
        completeApOrganizationBusinessGroupDisplayList: completeApOrganizationBusinessGroupDisplayList,
      });
      thisTreeNode.children.push(childTreeNodeDisplay);
    }
    return thisTreeNode;
  }

  /**
   * Create a list without the groups user is not a member of.
   */
  private create_pruned_ApMemberOfBusinessGroupDisplayTreeNodeList({apMemberOfBusinessGroupDisplayTreeNodeList, parent_apMemberOfBusinessGroupDisplayTreeNode}:{
    apMemberOfBusinessGroupDisplayTreeNodeList: TAPMemberOfBusinessGroupDisplayTreeNodeList;
    parent_apMemberOfBusinessGroupDisplayTreeNode?: TAPMemberOfBusinessGroupDisplayTreeNode;
  }): TAPMemberOfBusinessGroupDisplayTreeNodeList {
    // const funcName = 'create_pruned_ApMemberOfBusinessGroupDisplayTreeNodeList';
    // const logName = `${this.ComponentName}.${funcName}()`;

    const thisList: TAPMemberOfBusinessGroupDisplayTreeNodeList = [];
    for(const apMemberOfBusinessGroupDisplayTreeNode of apMemberOfBusinessGroupDisplayTreeNodeList) {
      const children = apMemberOfBusinessGroupDisplayTreeNode.children;
      apMemberOfBusinessGroupDisplayTreeNode.children = [];
      if(children.length > 0) {
        thisList.push(
          ...this.create_pruned_ApMemberOfBusinessGroupDisplayTreeNodeList({
            apMemberOfBusinessGroupDisplayTreeNodeList: children,
            parent_apMemberOfBusinessGroupDisplayTreeNode: apMemberOfBusinessGroupDisplayTreeNode,
          })
        );
      }
      // we are in a leaf node
      if(apMemberOfBusinessGroupDisplayTreeNode.apMemberOfBusinessGroupDisplay.apConfiguredBusinessGroupRoleEntityIdList.length > 0) {
        // alert(`${logName}: leaf group with roles: ${JSON.stringify({
        //   name: apMemberOfBusinessGroupDisplayTreeNode.apMemberOfBusinessGroupDisplay.apBusinessGroupDisplay.apEntityId.displayName,
        //   configuredRoles: APEntityIdsService.create_DisplayNameList(apMemberOfBusinessGroupDisplayTreeNode.apMemberOfBusinessGroupDisplay.apConfiguredBusinessGroupRoleEntityIdList)
        // })}`);
        // thisList.push(apMemberOfBusinessGroupDisplayTreeNode);
        // tell the parent we are their child
        if(parent_apMemberOfBusinessGroupDisplayTreeNode !== undefined) {
          // const parent = {
          //   displayName: parent_apMemberOfBusinessGroupDisplayTreeNode.apMemberOfBusinessGroupDisplay.apBusinessGroupDisplay.apEntityId.displayName,
          //   childrenLength: parent_apMemberOfBusinessGroupDisplayTreeNode.children.length
          // }
          // alert(`${logName}: parent=${JSON.stringify(parent, null, 2)}`);
          parent_apMemberOfBusinessGroupDisplayTreeNode.children.push(apMemberOfBusinessGroupDisplayTreeNode);
          const found = thisList.find( (x) => {
            return x.apMemberOfBusinessGroupDisplay.apBusinessGroupDisplay.apEntityId.id === parent_apMemberOfBusinessGroupDisplayTreeNode.apMemberOfBusinessGroupDisplay.apBusinessGroupDisplay.apEntityId.id;
          });
          if(found === undefined) thisList.push(parent_apMemberOfBusinessGroupDisplayTreeNode);
        }
      } 
    }
    // console.log(`${logName}: returning thisList=${JSON.stringify(thisList, null, 2)}`);
    return thisList;
  }


  /** 
   * Create the tree node list of business groups for an organization user.
   * Includes the calculated roles.
   * @param pruneBusinessGroupsNotAMemberOf - prune the tree node list of groups user is not member of (has no roles)
   */
  public create_ApMemberOfBusinessGroupDisplayTreeNodeList({organizationEntityId, apMemberOfBusinessGroupDisplayList, completeApOrganizationBusinessGroupDisplayList, apOrganizationRoleEntityIdList, pruneBusinessGroupsNotAMemberOf}: {
    organizationEntityId: TAPEntityId;
    apMemberOfBusinessGroupDisplayList: TAPMemberOfBusinessGroupDisplayList;
    completeApOrganizationBusinessGroupDisplayList: TAPBusinessGroupDisplayList;
    apOrganizationRoleEntityIdList: TAPEntityIdList;
    pruneBusinessGroupsNotAMemberOf: boolean;
  }): TAPMemberOfBusinessGroupDisplayTreeNodeList {
    // const funcName = 'create_ApMemberOfBusinessGroupDisplayTreeNodeList';
    // const logName = `${this.ComponentName}.${funcName}()`;
    // // * BEGIN DEBUG *
    // const businessGroupConfiguredRoles = apMemberOfBusinessGroupDisplayList.map( (x) => {
    //   return {
    //     businessGroupId: x.apBusinessGroupDisplay.apEntityId.id,
    //     configuredRoles: x.apConfiguredBusinessGroupRoleEntityIdList
    //   }
    // });
    // console.log(`${logName}: businessGroupConfiguredRoles=${JSON.stringify(businessGroupConfiguredRoles, null, 2)}`);
    // // * END DEBUG *

    const list: TAPMemberOfBusinessGroupDisplayTreeNodeList = [];

    // walk through every business group in the organization
    for(const apBusinessGroupDisplay of completeApOrganizationBusinessGroupDisplayList) {
      if(apBusinessGroupDisplay.apBusinessGroupParentEntityId === undefined) {
        // find memberOf
        const apMemberOfBusinessGroupDisplay: TAPMemberOfBusinessGroupDisplay | undefined = apMemberOfBusinessGroupDisplayList.find( (x) => {
          return x.apBusinessGroupDisplay.apEntityId.id === apBusinessGroupDisplay.apEntityId.id;
        });
        const configuredRoleList: TAPEntityIdList = apMemberOfBusinessGroupDisplay ? apMemberOfBusinessGroupDisplay.apConfiguredBusinessGroupRoleEntityIdList : [];
        const rootTreeNode: TAPMemberOfBusinessGroupDisplayTreeNode = this.create_ApMemberOfBusinessGroupDisplayTreeNode({
          apBusinessGroupDisplay: apBusinessGroupDisplay,
          configuredRoleList: configuredRoleList,
          completeApMemberOfBusinessGroupDisplayList: apMemberOfBusinessGroupDisplayList,
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

    // prune the tree - remove all entries without configured roles ==> not a member
    if(pruneBusinessGroupsNotAMemberOf) {
      const prunedList: TAPMemberOfBusinessGroupDisplayTreeNodeList = this.create_pruned_ApMemberOfBusinessGroupDisplayTreeNodeList({
        apMemberOfBusinessGroupDisplayTreeNodeList: interimList,  
      });
      // console.log(`${logName}: prunedList = ${JSON.stringify(prunedList, null, 2)}`);
      interimList = prunedList;
    }
    // calculate roles in all business groups
    const finalList: TAPMemberOfBusinessGroupDisplayTreeNodeList = this.calculate_BusinessGroupRoles({
      apMemberOfBusinessGroupDisplayTreeNodeList: interimList,
      apOrganizationRoleEntityIdList: apOrganizationRoleEntityIdList,
    });
    return finalList;
  }
  
  /**
   * Create the tree table node list for business groups the user is a member of.
   *
   * @param pruneBusinessGroupsNotAMemberOf - if true, the tree table node list is pruned to only contain the paths of groups where a user is actually memmber of. Otherwise the entire tree table node list.
   * @returns TAPMemberOfBusinessGroupTreeTableNodeList - the tree table node list.
   * 
   */
  public create_ApMemberOfBusinessGroupTreeTableNodeList({organizationEntityId, apMemberOfBusinessGroupDisplayList, completeApOrganizationBusinessGroupDisplayList, apOrganizationRoleEntityIdList, pruneBusinessGroupsNotAMemberOf}:{
    organizationEntityId: TAPEntityId;
    apMemberOfBusinessGroupDisplayList: TAPMemberOfBusinessGroupDisplayList;
    completeApOrganizationBusinessGroupDisplayList: TAPBusinessGroupDisplayList;
    apOrganizationRoleEntityIdList: TAPEntityIdList;
    pruneBusinessGroupsNotAMemberOf: boolean;
  }): TAPMemberOfBusinessGroupTreeTableNodeList {
    // const funcName = 'create_ApMemberOfBusinessGroupTreeTableNodeList';
    // const logName = `${this.ComponentName}.${funcName}()`;

    // // * BEGIN DEBUG *
    // const businessGroupConfiguredRoles = apMemberOfBusinessGroupDisplayList.map( (x) => {
    //   return {
    //     businessGroupId: x.apBusinessGroupDisplay.apEntityId.id,
    //     configuredRoles: x.apConfiguredBusinessGroupRoleEntityIdList
    //   }
    // });
    // console.log(`${logName}: businessGroupConfiguredRoles=${JSON.stringify(businessGroupConfiguredRoles, null, 2)}`);
    // // * END DEBUG *

    const create_TreeTableNode = (treeNode: TAPMemberOfBusinessGroupDisplayTreeNode): TAPMemberOfBusinessGroupTreeTableNode => {
      return {
        key: treeNode.apMemberOfBusinessGroupDisplay.apBusinessGroupDisplay.apEntityId.id,
        label: treeNode.apMemberOfBusinessGroupDisplay.apBusinessGroupDisplay.apEntityId.displayName,
        data: treeNode.apMemberOfBusinessGroupDisplay,
        children: create_TreeTableNodeList(treeNode.children)
      };
    }

    const create_TreeTableNodeList = (treeNodeList: TAPMemberOfBusinessGroupDisplayTreeNodeList): TAPMemberOfBusinessGroupTreeTableNodeList => {
      const treeTableNodeList: TAPMemberOfBusinessGroupTreeTableNodeList = [];
      for(const treeNode of treeNodeList) {
        const treeTableNode = create_TreeTableNode(treeNode);
        treeTableNodeList.push(treeTableNode);
      }
      return treeTableNodeList;
    }

    const treeNodeList: TAPMemberOfBusinessGroupDisplayTreeNodeList = this.create_ApMemberOfBusinessGroupDisplayTreeNodeList({
      organizationEntityId: organizationEntityId,
      apMemberOfBusinessGroupDisplayList: apMemberOfBusinessGroupDisplayList,
      completeApOrganizationBusinessGroupDisplayList: completeApOrganizationBusinessGroupDisplayList,
      apOrganizationRoleEntityIdList: apOrganizationRoleEntityIdList,
      pruneBusinessGroupsNotAMemberOf: pruneBusinessGroupsNotAMemberOf,
    });
    
    // // * DEBUG *
    // console.log(`${logName}: treeNodeList=${JSON.stringify(treeNodeList, null, 2)}`);

    return create_TreeTableNodeList(treeNodeList);
  }

  public clone_ApMemberOfBusinessGroupDisplayList({ apMemberOfBusinessGroupDisplayList }: {
    apMemberOfBusinessGroupDisplayList: TAPMemberOfBusinessGroupDisplayList;
  }): TAPMemberOfBusinessGroupDisplayList {
    return JSON.parse(JSON.stringify(apMemberOfBusinessGroupDisplayList));
  }

}

export default new APMemberOfService();
