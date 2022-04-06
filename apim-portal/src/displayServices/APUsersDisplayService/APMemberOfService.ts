
import APEntityIdsService, { 
  IAPEntityIdDisplay, 
  TAPEntityId, 
  TAPEntityIdList }
   from "../../utils/APEntityIdsService";
import { 
  APSMemberOfBusinessGroup, 
  APSMemberOfOrganizationGroups, 
  APSOrganizationRolesResponse, 
  APSOrganizationSessionInfo, 
  APSOrganizationSessionInfoList, 
  APSUserResponse 
} from "../../_generated/@solace-iot-team/apim-server-openapi-browser";
import APBusinessGroupsDisplayService, { 
  TAPBusinessGroupDisplay, TAPBusinessGroupDisplayList 
} from "../APBusinessGroupsDisplayService";
import APRbacDisplayService from "../APRbacDisplayService";
import { TAPOrganizationUserMemberOfOrganizationDisplay } from "./APOrganizationUsersDisplayService";

export type TAPSessionInfoDisplay = {
  // organizationEntityId: TAPEntityId;
  /** if undefined, no business group selected */
  businessGroupId?: string;  
}
// export type TAPOrganizationSessionInfoDisplayList = Array<TAPOrganizationSessionInfoDisplay>;

/**
 * Organization roles and session info for a user.
 * @property {TAPEntityId} apEntityId - the organization
 */
export type TAPMemberOfOrganizationDisplay =  IAPEntityIdDisplay & {
  /** list of organization roles, can be empty */
  apOrganizationRoleEntityIdList: TAPEntityIdList;
  /** session info for this organization */
  apOrganizationSessionInfoDisplay: TAPSessionInfoDisplay;
  /** the legacy organization roles, will disappear in FUTURE */
  apLegacyOrganizationRoleEntityIdList: TAPEntityIdList;
}
export type TAPMemberOfOrganizationDisplayList = Array<TAPMemberOfOrganizationDisplay>;

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
  selectable?: boolean;
  style?: object;
}
export type TAPMemberOfBusinessGroupTreeTableNodeList = Array<TAPMemberOfBusinessGroupTreeTableNode>;

class APMemberOfService {
  private readonly ComponentName = "APMemberOfService";

  public nameOf_TAPMemberOfOrganizationDisplay(name: keyof TAPMemberOfOrganizationDisplay) {
    return name;
  }
  public nameOf_TAPMemberOfOrganizationDisplay_Entity(name: keyof TAPEntityId) {
    return `apEntityId.${name}`;
  }

  private create_Empty_ApSessionInfoDisplay(): TAPSessionInfoDisplay {
    return {
      businessGroupId: undefined
    }
  }

  public create_Empty_ApMemberOfOrganizationDisplay({ organizationEntityId , apsOrganizationRolesResponse, apsOrganizationSessionInfoList }:{
    organizationEntityId: TAPEntityId;
    apsOrganizationRolesResponse?: APSOrganizationRolesResponse;
    apsOrganizationSessionInfoList?: APSOrganizationSessionInfoList;
  }): TAPMemberOfOrganizationDisplay {
    const apMemberOfOrganizationDisplay: TAPMemberOfOrganizationDisplay = {
      apEntityId: organizationEntityId,
      apOrganizationRoleEntityIdList: [],
      apLegacyOrganizationRoleEntityIdList: apsOrganizationRolesResponse !== undefined ? APRbacDisplayService.create_OrganizationRoles_EntityIdList(apsOrganizationRolesResponse.roles) : [],
      apOrganizationSessionInfoDisplay: apsOrganizationSessionInfoList ? this.create_ApSessionInfoDisplay({ organizationId: organizationEntityId.id, apsOrganizationSessionInfoList: apsOrganizationSessionInfoList }): this.create_Empty_ApSessionInfoDisplay(),
    };
    return apMemberOfOrganizationDisplay;
  }

  /** Create session info for an organization from APSUserResponse */
  private create_ApSessionInfoDisplay({ organizationId, apsOrganizationSessionInfoList }:{
    organizationId: string;
    apsOrganizationSessionInfoList: APSOrganizationSessionInfoList;
  }): TAPSessionInfoDisplay {
    // const funcName = 'create_ApSessionInfoDisplay';
    // const logName = `${this.ComponentName}.${funcName}()`;
    // alert(`${logName}: apsOrganizationSessionInfoList = ${JSON.stringify(apsOrganizationSessionInfoList, null, 2)}`);

    const apsOrganizationSessionInfo: APSOrganizationSessionInfo | undefined = apsOrganizationSessionInfoList.find( (x) => {
      return x.organizationId === organizationId;
    });
    const apSessionInfoDisplay: TAPSessionInfoDisplay = {
      businessGroupId: apsOrganizationSessionInfo ? apsOrganizationSessionInfo.lastSessionInfo.businessGroupId : undefined
    };
    return apSessionInfoDisplay;
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
    if(apsOrganizationRolesResponse.roles.length === 0) throw new Error(`${logName}: apsOrganizationRolesResponse.roles.length === 0`);
    // alert(`${logName}: apsOrganizationRolesResponse.roles = ${JSON.stringify(apsOrganizationRolesResponse.roles, null, 2)}`);

    // find the root business group
    const rootApBusinesGroupDisplay: TAPBusinessGroupDisplay = APBusinessGroupsDisplayService.find_root_ApBusinessGroupDisplay({ completeApOrganizationBusinessGroupDisplayList: completeApOrganizationBusinessGroupDisplayList});

    // find the business group entry for this organization - there must be at least a root business group with the organization roles.
    // NOTE: future: may not be member of any group. get it from a different field in APSUserResponse
    if(apsUserResponse.memberOfOrganizationGroups === undefined) throw new Error(`${logName}: apsUserResponse.memberOfOrganizationGroups === undefined, userId=${apsUserResponse.userId}`);

    if(apsUserResponse.memberOfOrganizationGroups !== undefined) {
      const apsMemberOfOrganizationGroups: APSMemberOfOrganizationGroups | undefined = apsUserResponse.memberOfOrganizationGroups.find( (x) => {
        return x.organizationId === organizationEntityId.id;
      });
      if(apsMemberOfOrganizationGroups === undefined) throw new Error(`${logName}: apsMemberOfOrganizationGroups === undefined, userId=${apsUserResponse.userId}`);
      // find the roles for the root business group
      const apsMemberOfBusinessGroup: APSMemberOfBusinessGroup | undefined = apsMemberOfOrganizationGroups.memberOfBusinessGroupList.find( (x) => {
        return x.businessGroupId === rootApBusinesGroupDisplay.apEntityId.id;
      });

      if(apsMemberOfBusinessGroup === undefined || apsMemberOfBusinessGroup.roles.length === 0) return this.create_Empty_ApMemberOfOrganizationDisplay({ 
        organizationEntityId: organizationEntityId,
        apsOrganizationRolesResponse: apsOrganizationRolesResponse,
        apsOrganizationSessionInfoList: apsUserResponse.organizationSessionInfoList,
      });

      const apMemberOfOrganizationDisplay: TAPMemberOfOrganizationDisplay = {
        apEntityId: organizationEntityId,
        apOrganizationRoleEntityIdList: APRbacDisplayService.create_BusinessGroupRoles_EntityIdList({apsBusinessGroupAuthRoleList: apsMemberOfBusinessGroup.roles}),
        apLegacyOrganizationRoleEntityIdList: apsOrganizationRolesResponse !== undefined ? APRbacDisplayService.create_OrganizationRoles_EntityIdList(apsOrganizationRolesResponse.roles) : [],
        apOrganizationSessionInfoDisplay: this.create_ApSessionInfoDisplay({ organizationId: organizationEntityId.id, apsOrganizationSessionInfoList: apsUserResponse.organizationSessionInfoList }),
      };
      return apMemberOfOrganizationDisplay;

    } else {
      return this.create_Empty_ApMemberOfOrganizationDisplay({ 
        organizationEntityId: organizationEntityId,
        apsOrganizationRolesResponse: apsOrganizationRolesResponse, 
        apsOrganizationSessionInfoList: apsUserResponse.organizationSessionInfoList,
      });
    }
  }

  /**
   * Create a list of organizations (with empty roles) user is member of
   */
  public create_ApMemberOfOrganizationDisplayList_EmptyRoles({ apsUserResponse }: {
    apsUserResponse: APSUserResponse;
  }): TAPMemberOfOrganizationDisplayList {
    const apMemberOfOrganizationDisplayList: TAPMemberOfOrganizationDisplayList = [];
    for(const apsOrganizationRolesResponse of apsUserResponse.memberOfOrganizations) {
      apMemberOfOrganizationDisplayList.push({
        apEntityId: {
          id: apsOrganizationRolesResponse.organizationId,
          displayName: apsOrganizationRolesResponse.organizationDisplayName,
        },
        apOrganizationRoleEntityIdList: [],
        apLegacyOrganizationRoleEntityIdList: [],
        apOrganizationSessionInfoDisplay: {
          businessGroupId: undefined
        }
      });
    }
    return apMemberOfOrganizationDisplayList;
  }

  /**
   * with roles
   */
  public create_ApMemberOfOrganizationDisplayList({ apsUserResponse }: {
    apsUserResponse: APSUserResponse;
  }): TAPMemberOfOrganizationDisplayList {
    const funcName = 'create_ApMemberOfOrganizationDisplayList';
    const logName = `${this.ComponentName}.${funcName}()`;

    const apMemberOfOrganizationDisplayList: TAPMemberOfOrganizationDisplayList = [];

    // REFACTOR_OUT_LEGACY: iterate over apsUserResponse.memberOfOrganizationGroups instead of apsUserResponse.memberOfOrganizations
    for(const apsOrganizationRolesResponse of apsUserResponse.memberOfOrganizations) {

      // find the business groups entry for the organization id
      let apsMemberOfOrganizationGroups: APSMemberOfOrganizationGroups | undefined = apsUserResponse.memberOfOrganizationGroups.find( (x) => {
        return x.organizationId === apsOrganizationRolesResponse.organizationId;
      });
      // today: at least 1 business group (root business group) must exist, root business group contains the organization roles
      if(apsMemberOfOrganizationGroups === undefined) {
        // to catch migration errors, show alert instead, convert to error in FUTURE
        alert(`${logName}: MIGRATION ERROR: apsMemberOfOrganizationGroups === undefined`);
        apsMemberOfOrganizationGroups = {
          organizationId: apsOrganizationRolesResponse.organizationId,
          memberOfBusinessGroupList: []
        };
        // throw new Error(`${logName}: apsMemberOfOrganizationGroups === undefined`);
      }
      const apsMemberOfBusinessGroup: APSMemberOfBusinessGroup | undefined = apsMemberOfOrganizationGroups.memberOfBusinessGroupList.find( (x) => {
        return x.businessGroupId === apsOrganizationRolesResponse.organizationId;
      });
      // today: at least 1 business group (root business group) must exist, root business group contains the organization roles
      // to catch migration errors, show alert instead, convert to error in FUTURE
      let apOrganizationRoleEntityIdList: TAPEntityIdList = [];
      if(apsMemberOfBusinessGroup === undefined) {
        alert(`${logName}: MIGRATION ERROR: apsMemberOfBusinessGroup === undefined`)
        // throw new Error(`${logName}: apsMemberOfBusinessGroup === undefined`);
      } else {
        apOrganizationRoleEntityIdList = APRbacDisplayService.create_BusinessGroupRoles_EntityIdList({apsBusinessGroupAuthRoleList: apsMemberOfBusinessGroup.roles});
      }

      apMemberOfOrganizationDisplayList.push({
        apEntityId: {
          id: apsOrganizationRolesResponse.organizationId,
          displayName: apsOrganizationRolesResponse.organizationDisplayName,
        },
        apOrganizationRoleEntityIdList: apOrganizationRoleEntityIdList,
        apLegacyOrganizationRoleEntityIdList: APRbacDisplayService.create_OrganizationRoles_EntityIdList(apsOrganizationRolesResponse.roles),
        apOrganizationSessionInfoDisplay: this.create_ApSessionInfoDisplay({ organizationId: apsOrganizationRolesResponse.organizationId, apsOrganizationSessionInfoList: apsUserResponse.organizationSessionInfoList }),
      });
    }
    return apMemberOfOrganizationDisplayList;
  }

  public create_ApLegacyOrganizationRoleEntityIdList({ apOrganizationUserMemberOfOrganizationDisplay }:{
    apOrganizationUserMemberOfOrganizationDisplay: TAPOrganizationUserMemberOfOrganizationDisplay;
  }): TAPEntityIdList {

    const combinedList: TAPEntityIdList = [];
    // add all business group roles 
    for(const apMemberOfBusinessGroupDisplay of apOrganizationUserMemberOfOrganizationDisplay.apMemberOfBusinessGroupDisplayList) {
      combinedList.push(...apMemberOfBusinessGroupDisplay.apConfiguredBusinessGroupRoleEntityIdList);
    }
    // add the organization roles
    combinedList.push(...apOrganizationUserMemberOfOrganizationDisplay.apOrganizationRoleEntityIdList);
    // regturn de-duped list
    return APEntityIdsService.create_deduped_EntityIdList(combinedList);
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
   * Create a list of business group ids to keep based on:
   * - user has business group access 
   * - user has business group access to any of it's children
   * 
   * Populates idList2Keep as it recurses into the tree.
   * 
   */
  private _create_idList2Keep_ApMemberOfBusinessGroupDisplayTreeNodeList({ list, idList2Keep, accessOnly_To_BusinessGroupManageAssets }:{
    list: TAPMemberOfBusinessGroupDisplayTreeNodeList;
    idList2Keep: Array<string>;
    accessOnly_To_BusinessGroupManageAssets: boolean;
  }): void {
    // const funcName = '_create_idList2Keep_ApMemberOfBusinessGroupDisplayTreeNodeList';
    // const logName = `${this.ComponentName}.${funcName}()`;

    for(let idx=0; idx < list.length; idx++) {
      if(list[idx].children.length > 0) {
        // console.log(`${logName}: parent node = ${JSON.stringify(list[idx].apMemberOfBusinessGroupDisplay.apBusinessGroupDisplay.apEntityId.displayName, null, 2)}`);
        this._create_idList2Keep_ApMemberOfBusinessGroupDisplayTreeNodeList({
          list: list[idx].children,
          idList2Keep: idList2Keep,
          accessOnly_To_BusinessGroupManageAssets: accessOnly_To_BusinessGroupManageAssets
        });
        // check if user has access to this one
        if(this.hasBusinessGroupRolesAccess({
          apMemberOfBusinessGroupDisplay: list[idx].apMemberOfBusinessGroupDisplay,
          accessOnly_To_BusinessGroupManageAssets: accessOnly_To_BusinessGroupManageAssets
        })) {
          idList2Keep.push(list[idx].apMemberOfBusinessGroupDisplay.apBusinessGroupDisplay.apEntityId.id);
        } else {
          // check if any child to be kept, if so, keep this one too
          for(const child of list[idx].children) {
            const found = idList2Keep.find( (x) => { return x === child.apMemberOfBusinessGroupDisplay.apBusinessGroupDisplay.apEntityId.id});
            if(found) idList2Keep.push(list[idx].apMemberOfBusinessGroupDisplay.apBusinessGroupDisplay.apEntityId.id);
          }
        }
      } else {
        // we are in a leaf node
        // const leaf_node_name = list[idx].apMemberOfBusinessGroupDisplay.apBusinessGroupDisplay.apEntityId.displayName;
        // console.log(`${logName}: leaf_node_name = ${leaf_node_name}`);
        if(this.hasBusinessGroupRolesAccess({
          apMemberOfBusinessGroupDisplay: list[idx].apMemberOfBusinessGroupDisplay,
          accessOnly_To_BusinessGroupManageAssets: accessOnly_To_BusinessGroupManageAssets
        })) {
          // keep it
          idList2Keep.push(list[idx].apMemberOfBusinessGroupDisplay.apBusinessGroupDisplay.apEntityId.id);
        }
        // if(list[idx].apMemberOfBusinessGroupDisplay.apConfiguredBusinessGroupRoleEntityIdList.length > 0) {
        //   // keep it
        //   idList2Keep.push(list[idx].apMemberOfBusinessGroupDisplay.apBusinessGroupDisplay.apEntityId.id);
        // }
      }
    }
  }

  /**
   * Create a list without the groups user is not a member of.
   */
  public create_pruned_ApMemberOfBusinessGroupDisplayTreeNodeList({ apMemberOfBusinessGroupDisplayTreeNodeList, accessOnly_To_BusinessGroupManageAssets }:{
    apMemberOfBusinessGroupDisplayTreeNodeList: TAPMemberOfBusinessGroupDisplayTreeNodeList;
    accessOnly_To_BusinessGroupManageAssets: boolean;
  }): TAPMemberOfBusinessGroupDisplayTreeNodeList {
    // const funcName = 'create_pruned_ApMemberOfBusinessGroupDisplayTreeNodeList';
    // const logName = `${this.ComponentName}.${funcName}()`;
    // alert(`${logName}: pruning should look at calculated roles, not configured roles`);

    const _create_pruned_ApMemberOfBusinessGroupDisplayTreeNodeList = ({ list }:{
      list: TAPMemberOfBusinessGroupDisplayTreeNodeList;
    }): TAPMemberOfBusinessGroupDisplayTreeNodeList => {
      const prunedList: TAPMemberOfBusinessGroupDisplayTreeNodeList = [];
      for(const elem of list) {
        const found = idList2Keep.find( (x) => { return x === elem.apMemberOfBusinessGroupDisplay.apBusinessGroupDisplay.apEntityId.id });
        if(found) {
          // go into children
          elem.children = _create_pruned_ApMemberOfBusinessGroupDisplayTreeNodeList({
            list: elem.children
          });
          prunedList.push(elem);
        }
      }
      return prunedList;
    }
  
    // console.log(`${logName}: starting ............`);
    
    const idList2Keep: Array<string> = [];
    this._create_idList2Keep_ApMemberOfBusinessGroupDisplayTreeNodeList({
      list: apMemberOfBusinessGroupDisplayTreeNodeList,
      idList2Keep: idList2Keep,
      accessOnly_To_BusinessGroupManageAssets: accessOnly_To_BusinessGroupManageAssets
    });

    // console.log(`${logName}: idList2Keep = ${JSON.stringify(idList2Keep, null, 2)}`);

    const prunedList: TAPMemberOfBusinessGroupDisplayTreeNodeList = _create_pruned_ApMemberOfBusinessGroupDisplayTreeNodeList({
      list: apMemberOfBusinessGroupDisplayTreeNodeList
    });

    return prunedList;
  }

  /** 
   * Create the tree node list of business groups for an organization user WITHOUT the root business group (=organization).
   * Includes the calculated roles.
   * @param pruneBusinessGroupsNotAMemberOf - prune the tree node list of groups user is not member of (has no roles)
   */
  public create_ApMemberOfBusinessGroupDisplayTreeNodeList_WithoutRoot({organizationEntityId, apMemberOfBusinessGroupDisplayList, completeApOrganizationBusinessGroupDisplayList, apOrganizationRoleEntityIdList, pruneBusinessGroupsNotAMemberOf, accessOnly_To_BusinessGroupManageAssets }: {
    organizationEntityId: TAPEntityId;
    apMemberOfBusinessGroupDisplayList: TAPMemberOfBusinessGroupDisplayList;
    completeApOrganizationBusinessGroupDisplayList: TAPBusinessGroupDisplayList;
    apOrganizationRoleEntityIdList: TAPEntityIdList;
    pruneBusinessGroupsNotAMemberOf: boolean;
    accessOnly_To_BusinessGroupManageAssets: boolean;
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
      // alert(`${logName}: check console for interimList & prunedList`);
      // console.log(`${logName}: interimList = ${JSON.stringify(interimList, null, 2)}`);
      const prunedList: TAPMemberOfBusinessGroupDisplayTreeNodeList = this.create_pruned_ApMemberOfBusinessGroupDisplayTreeNodeList({
        apMemberOfBusinessGroupDisplayTreeNodeList: interimList,  
        accessOnly_To_BusinessGroupManageAssets: accessOnly_To_BusinessGroupManageAssets
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
   * Create the tree node list of business groups for an organization user INCLUDING the root business group (=organization).
   * Includes the calculated roles.
   * @param pruneBusinessGroupsNotAMemberOf - prune the tree node list of groups user is not member of (has no roles)
   */
  public create_ApMemberOfBusinessGroupDisplayTreeNodeList({organizationEntityId, apMemberOfBusinessGroupDisplayList, completeApOrganizationBusinessGroupDisplayList, apOrganizationRoleEntityIdList, pruneBusinessGroupsNotAMemberOf, accessOnly_To_BusinessGroupManageAssets }: {
    organizationEntityId: TAPEntityId;
    apMemberOfBusinessGroupDisplayList: TAPMemberOfBusinessGroupDisplayList;
    completeApOrganizationBusinessGroupDisplayList: TAPBusinessGroupDisplayList;
    apOrganizationRoleEntityIdList: TAPEntityIdList;
    pruneBusinessGroupsNotAMemberOf: boolean;
    accessOnly_To_BusinessGroupManageAssets: boolean;
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

    let list: TAPMemberOfBusinessGroupDisplayTreeNodeList = [];

    // start with the root
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

    // prune the tree - remove all entries without configured roles ==> not a member
    if(pruneBusinessGroupsNotAMemberOf) {
      // alert(`${logName}: check console for interimList & prunedList`);
      // console.log(`${logName}: interimList = ${JSON.stringify(interimList, null, 2)}`);
      const prunedList: TAPMemberOfBusinessGroupDisplayTreeNodeList = this.create_pruned_ApMemberOfBusinessGroupDisplayTreeNodeList({
        apMemberOfBusinessGroupDisplayTreeNodeList: list,  
        accessOnly_To_BusinessGroupManageAssets: accessOnly_To_BusinessGroupManageAssets
      });
      // console.log(`${logName}: prunedList = ${JSON.stringify(prunedList, null, 2)}`);
      list = prunedList;
    }
    // calculate roles in all business groups
    const finalList: TAPMemberOfBusinessGroupDisplayTreeNodeList = this.calculate_BusinessGroupRoles({
      apMemberOfBusinessGroupDisplayTreeNodeList: list,
      apOrganizationRoleEntityIdList: apOrganizationRoleEntityIdList,
    });
    return finalList;
  }

  /**
   * Check for calculated roles that include business group roles only
   */
  private hasBusinessGroupRolesAccess = ({ apMemberOfBusinessGroupDisplay, accessOnly_To_BusinessGroupManageAssets }:{
    apMemberOfBusinessGroupDisplay: TAPMemberOfBusinessGroupDisplay;
    accessOnly_To_BusinessGroupManageAssets: boolean;
  }): boolean => {      
    const funcName = 'hasBusinessGroupRolesAccess';
    const logName = `${this.ComponentName}.${funcName}()`;  
    if(apMemberOfBusinessGroupDisplay.apCalculatedBusinessGroupRoleEntityIdList === undefined) throw new Error(`${logName}: apMemberOfBusinessGroupDisplay.apCalculatedBusinessGroupRoleEntityIdList === undefined`);

    if(accessOnly_To_BusinessGroupManageAssets) {
      if(APRbacDisplayService.filter_RolesEntityIdList_By_BusinessGroupRoles_ManageAssets({
        combinedRoles: apMemberOfBusinessGroupDisplay.apCalculatedBusinessGroupRoleEntityIdList
      }).length > 0) return true;
    } else {
      if(APRbacDisplayService.filter_RolesEntityIdList_By_BusinessGroupRoles({
        combinedRoles: apMemberOfBusinessGroupDisplay.apCalculatedBusinessGroupRoleEntityIdList
      }).length > 0) return true;  
    }
    return false;
  }
  
  private create_TreeTableNode({ apMemberOfBusinessGroupDisplayTreeNode, includeBusinessGroupIsSelectable, accessOnly_To_BusinessGroupManageAssets }: {
    apMemberOfBusinessGroupDisplayTreeNode: TAPMemberOfBusinessGroupDisplayTreeNode;
    includeBusinessGroupIsSelectable?: boolean;
    accessOnly_To_BusinessGroupManageAssets: boolean;
  }): TAPMemberOfBusinessGroupTreeTableNode {

    const hasAccess: boolean = this.hasBusinessGroupRolesAccess({
      apMemberOfBusinessGroupDisplay: apMemberOfBusinessGroupDisplayTreeNode.apMemberOfBusinessGroupDisplay,
      accessOnly_To_BusinessGroupManageAssets: accessOnly_To_BusinessGroupManageAssets,
    });

    return {
      key: apMemberOfBusinessGroupDisplayTreeNode.apMemberOfBusinessGroupDisplay.apBusinessGroupDisplay.apEntityId.id,
      label: apMemberOfBusinessGroupDisplayTreeNode.apMemberOfBusinessGroupDisplay.apBusinessGroupDisplay.apEntityId.displayName,
      data: apMemberOfBusinessGroupDisplayTreeNode.apMemberOfBusinessGroupDisplay,
      selectable: hasAccess,
      style: hasAccess ? { color: 'black'} : { color: 'gray' },
      children: this.create_TreeTableNodeList({
        apMemberOfBusinessGroupDisplayTreeNodeList: apMemberOfBusinessGroupDisplayTreeNode.children,
        includeBusinessGroupIsSelectable: includeBusinessGroupIsSelectable,
        accessOnly_To_BusinessGroupManageAssets: accessOnly_To_BusinessGroupManageAssets
      })
    };
  }

  private create_TreeTableNodeList({ apMemberOfBusinessGroupDisplayTreeNodeList, includeBusinessGroupIsSelectable, accessOnly_To_BusinessGroupManageAssets }: {
    apMemberOfBusinessGroupDisplayTreeNodeList: TAPMemberOfBusinessGroupDisplayTreeNodeList;
    includeBusinessGroupIsSelectable?: boolean;
    accessOnly_To_BusinessGroupManageAssets: boolean;
  }): TAPMemberOfBusinessGroupTreeTableNodeList {
    const treeTableNodeList: TAPMemberOfBusinessGroupTreeTableNodeList = [];
    for(const treeNode of apMemberOfBusinessGroupDisplayTreeNodeList) {
      const treeTableNode = this.create_TreeTableNode({
        apMemberOfBusinessGroupDisplayTreeNode: treeNode,
        includeBusinessGroupIsSelectable: includeBusinessGroupIsSelectable,
        accessOnly_To_BusinessGroupManageAssets: accessOnly_To_BusinessGroupManageAssets
      });
      treeTableNodeList.push(treeTableNode);
    }
    return treeTableNodeList;
  }

  /**
   * Create the tree table node list for business groups the user is a member of.
   *
   * @param pruneBusinessGroupsNotAMemberOf - if true, the tree table node list is pruned to only contain the paths of groups where a user is actually memmber of. Otherwise the entire tree table node list.
   * @returns TAPMemberOfBusinessGroupTreeTableNodeList - the tree table node list.
   * 
   */
  public create_ApMemberOfBusinessGroupTreeTableNodeList({organizationEntityId, apMemberOfBusinessGroupDisplayList, completeApOrganizationBusinessGroupDisplayList, apOrganizationRoleEntityIdList, pruneBusinessGroupsNotAMemberOf, accessOnly_To_BusinessGroupManageAssets}:{
    organizationEntityId: TAPEntityId;
    apMemberOfBusinessGroupDisplayList: TAPMemberOfBusinessGroupDisplayList;
    completeApOrganizationBusinessGroupDisplayList: TAPBusinessGroupDisplayList;
    apOrganizationRoleEntityIdList: TAPEntityIdList;
    pruneBusinessGroupsNotAMemberOf: boolean;
    accessOnly_To_BusinessGroupManageAssets: boolean;
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

    // const treeNodeList: TAPMemberOfBusinessGroupDisplayTreeNodeList = this.create_ApMemberOfBusinessGroupDisplayTreeNodeList({
    const treeNodeList: TAPMemberOfBusinessGroupDisplayTreeNodeList = this.create_ApMemberOfBusinessGroupDisplayTreeNodeList({
      organizationEntityId: organizationEntityId,
      apMemberOfBusinessGroupDisplayList: apMemberOfBusinessGroupDisplayList,
      completeApOrganizationBusinessGroupDisplayList: completeApOrganizationBusinessGroupDisplayList,
      apOrganizationRoleEntityIdList: apOrganizationRoleEntityIdList,
      pruneBusinessGroupsNotAMemberOf: pruneBusinessGroupsNotAMemberOf,
      accessOnly_To_BusinessGroupManageAssets: accessOnly_To_BusinessGroupManageAssets
    });
    
    // // * DEBUG *
    // console.log(`${logName}: treeNodeList=${JSON.stringify(treeNodeList, null, 2)}`);

    return this.create_TreeTableNodeList({
      apMemberOfBusinessGroupDisplayTreeNodeList: treeNodeList,
      accessOnly_To_BusinessGroupManageAssets: accessOnly_To_BusinessGroupManageAssets
    });
  }

  public create_ApMemberOfBusinessGroupTreeTableNodeList_From_ApMemberOfBusinessGroupDisplayTreeNodeList({ apMemberOfBusinessGroupDisplayTreeNodeList, includeBusinessGroupIsSelectable, accessOnly_To_BusinessGroupManageAssets }:{
    apMemberOfBusinessGroupDisplayTreeNodeList: TAPMemberOfBusinessGroupDisplayTreeNodeList;
    includeBusinessGroupIsSelectable: boolean;
    accessOnly_To_BusinessGroupManageAssets: boolean;
  }): TAPMemberOfBusinessGroupTreeTableNodeList {

    return this.create_TreeTableNodeList({
      apMemberOfBusinessGroupDisplayTreeNodeList: apMemberOfBusinessGroupDisplayTreeNodeList,
      includeBusinessGroupIsSelectable: includeBusinessGroupIsSelectable,
      accessOnly_To_BusinessGroupManageAssets: accessOnly_To_BusinessGroupManageAssets
    });

  }

  public clone_ApMemberOfBusinessGroupDisplayList({ apMemberOfBusinessGroupDisplayList }: {
    apMemberOfBusinessGroupDisplayList: TAPMemberOfBusinessGroupDisplayList;
  }): TAPMemberOfBusinessGroupDisplayList {
    return JSON.parse(JSON.stringify(apMemberOfBusinessGroupDisplayList));
  }

  /** 
   * Returns the found business group entity.
   * @throws if not found
   * 
  */
  public get_ApMemberOfBusinessGroupDisplay({ apMemberOfBusinessGroupDisplayList, businessGroupEntityId }:{
    apMemberOfBusinessGroupDisplayList: TAPMemberOfBusinessGroupDisplayList;
    businessGroupEntityId: TAPEntityId;
  }): TAPMemberOfBusinessGroupDisplay {
    const funcName = 'get_ApMemberOfBusinessGroupDisplay';
    const logName = `${this.ComponentName}.${funcName}()`;
    const found: TAPMemberOfBusinessGroupDisplay | undefined = this.find_ApMemberOfBusinessGroupDisplay({
      apMemberOfBusinessGroupDisplayList: apMemberOfBusinessGroupDisplayList,
      businessGroupEntityId: businessGroupEntityId,
    });
    if(found === undefined) throw new Error(`${logName}: found === undefined`);
    return found;
  }

  /** 
   * Returns the found business group display object within the tree.
   * @throws if not found
   */
  public get_ApMemberOfBusinessGroupDisplay_From_ApMemberOfBusinessGroupDisplayTreeNodeList({ apMemberOfBusinessGroupDisplayTreeNodeList, businessGroupId }:{
    apMemberOfBusinessGroupDisplayTreeNodeList: TAPMemberOfBusinessGroupDisplayTreeNodeList;
    businessGroupId: string;
  }): TAPMemberOfBusinessGroupDisplay {
    const funcName = 'get_ApMemberOfBusinessGroupDisplay_From_ApMemberOfBusinessGroupDisplayTreeNodeList';
    const logName = `${this.ComponentName}.${funcName}()`;
    // console.log(`${logName}: looking for businessGroupId=${JSON.stringify(businessGroupId)}`);
    // console.log(`${logName}: apMemberOfBusinessGroupDisplayTreeNodeList = ${JSON.stringify(apMemberOfBusinessGroupDisplayTreeNodeList, null, 2)}`);

    const found: TAPMemberOfBusinessGroupDisplay | undefined = this.find_ApMemberOfBusinessGroupDisplay_From_ApMemberOfBusinessGroupDisplayTreeNodeList({
      apMemberOfBusinessGroupDisplayTreeNodeList: apMemberOfBusinessGroupDisplayTreeNodeList,
      businessGroupId: businessGroupId,
    });
    if(found === undefined) throw new Error(`${logName}: found === undefined`);
    return found;
  }

  /**
   * Returns the business group display object from last session or tries to figure out a default one.
   */
  public get_ApMemberOfBusinessGroupDisplay_For_Session({ apMemberOfBusinessGroupDisplayTreeNodeList, apOrganizationSessionInfoDisplay, accessOnly_To_BusinessGroupManageAssets }:{
    apMemberOfBusinessGroupDisplayTreeNodeList: TAPMemberOfBusinessGroupDisplayTreeNodeList;
    apOrganizationSessionInfoDisplay: TAPSessionInfoDisplay;
    accessOnly_To_BusinessGroupManageAssets: boolean;
  }): TAPMemberOfBusinessGroupDisplay | undefined {

    // const funcName = 'get_ApMemberOfBusinessGroupDisplay_For_Session';
    // const logName = `${this.ComponentName}.${funcName}()`;
    // alert(`${logName}: apOrganizationSessionInfoDisplay.businessGroupId = ${apOrganizationSessionInfoDisplay.businessGroupId}`);

    // check if we have a business group id from last session
    if(apOrganizationSessionInfoDisplay.businessGroupId !== undefined) {
      return this.get_ApMemberOfBusinessGroupDisplay_From_ApMemberOfBusinessGroupDisplayTreeNodeList({
          apMemberOfBusinessGroupDisplayTreeNodeList: apMemberOfBusinessGroupDisplayTreeNodeList,
          businessGroupId: apOrganizationSessionInfoDisplay.businessGroupId
        });
    }
    // try find a default one
    return this.find_default_ApMemberOfBusinessGroupDisplay({
      apMemberOfBusinessGroupDisplayTreeNodeList: apMemberOfBusinessGroupDisplayTreeNodeList,
      accessOnly_To_BusinessGroupManageAssets: accessOnly_To_BusinessGroupManageAssets
    });

  }

  public get_ApMemberOfOrganizationEntityIdList({ apMemberOfOrganizationDisplayList }:{
    apMemberOfOrganizationDisplayList: TAPMemberOfOrganizationDisplayList;
  }): TAPEntityIdList {
    return APEntityIdsService.create_EntityIdList_From_ApDisplayObjectList(apMemberOfOrganizationDisplayList); 
  }

  public get_ApMemberOfOrganizationDisplay({ apMemberOfOrganizationDisplayList, organizationId }:{
    apMemberOfOrganizationDisplayList: TAPMemberOfOrganizationDisplayList;
    organizationId: string;
  }): TAPMemberOfOrganizationDisplay {
    const funcName = 'get_ApMemberOfOrganizationDisplay';
    const logName = `${this.ComponentName}.${funcName}()`;
    const found: TAPMemberOfOrganizationDisplay | undefined = apMemberOfOrganizationDisplayList.find( (x) => {
      return x.apEntityId.id === organizationId;
    });
    if(found === undefined) throw new Error(`${logName}: found === undefined`);
    return found;
  }

  public is_ApsUserMemberOfOrganization({ organizationId, apsUserResponse }: {
    organizationId: string;
    apsUserResponse: APSUserResponse;
  }): boolean {
    if(apsUserResponse.memberOfOrganizations === undefined) return false;
    const found = apsUserResponse.memberOfOrganizations.find( (x) => {
      return x.organizationId === organizationId;
    });
    return found !== undefined;
  }


  /**
   * Returns the found business group entity or undefined if not found.
   */
  public find_ApMemberOfBusinessGroupDisplay({ apMemberOfBusinessGroupDisplayList, businessGroupEntityId }:{
    apMemberOfBusinessGroupDisplayList: TAPMemberOfBusinessGroupDisplayList;
    businessGroupEntityId: TAPEntityId;
  }): TAPMemberOfBusinessGroupDisplay | undefined {
    const found: TAPMemberOfBusinessGroupDisplay | undefined = apMemberOfBusinessGroupDisplayList.find( (x) => {
      return x.apBusinessGroupDisplay.apEntityId.id === businessGroupEntityId.id;
    });
    return found;
  }

  public find_ApMemberOfBusinessGroupDisplay_From_ApMemberOfBusinessGroupDisplayTreeNodeList({ apMemberOfBusinessGroupDisplayTreeNodeList, businessGroupId }: {
    apMemberOfBusinessGroupDisplayTreeNodeList: TAPMemberOfBusinessGroupDisplayTreeNodeList;
    businessGroupId: string;
  }): TAPMemberOfBusinessGroupDisplay | undefined {

    const find = (treeNode: TAPMemberOfBusinessGroupDisplayTreeNode): TAPMemberOfBusinessGroupDisplay | undefined => {
      if(treeNode.children.length > 0) return find_list(treeNode.children);
      else return undefined;
    }

    const find_list = (treeNodeList: TAPMemberOfBusinessGroupDisplayTreeNodeList): TAPMemberOfBusinessGroupDisplay | undefined => {
      for(const treeNode of treeNodeList) {
        if(treeNode.apMemberOfBusinessGroupDisplay.apBusinessGroupDisplay.apEntityId.id === businessGroupId) {
          return treeNode.apMemberOfBusinessGroupDisplay;
        }
        const found: TAPMemberOfBusinessGroupDisplay | undefined = find(treeNode);
        if(found !== undefined) return found;
      }
      return undefined;
    }
    return find_list(apMemberOfBusinessGroupDisplayTreeNodeList);
  } 

  /** 
   * Return the first ApMemberOfBusinessGroupDisplay in the tree that user has access to.
  */
  private find_default_ApMemberOfBusinessGroupDisplay({ apMemberOfBusinessGroupDisplayTreeNodeList, accessOnly_To_BusinessGroupManageAssets }:{
    apMemberOfBusinessGroupDisplayTreeNodeList: TAPMemberOfBusinessGroupDisplayTreeNodeList;
    accessOnly_To_BusinessGroupManageAssets: boolean;
  }): TAPMemberOfBusinessGroupDisplay | undefined {
    // const funcName = 'find_default_ApMemberOfBusinessGroupDisplay';
    // const logName = `${this.ComponentName}.${funcName}()`;
    // alert(`${logName}: change to finding the first group user has calculated roles = Business Group roles in `);

    // /**
    //  * Check for calculated roles.
    //  */
    // const hasAccess = (apMemberOfBusinessGroupDisplay: TAPMemberOfBusinessGroupDisplay): boolean => {      
    //   // if(apMemberOfBusinessGroupDisplay.apConfiguredBusinessGroupRoleEntityIdList && apMemberOfBusinessGroupDisplay.apConfiguredBusinessGroupRoleEntityIdList.length > 0)  return true;
    //   if(apMemberOfBusinessGroupDisplay.apCalculatedBusinessGroupRoleEntityIdList === undefined) return false;
    //   if(apMemberOfBusinessGroupDisplay.apCalculatedBusinessGroupRoleEntityIdList.length > 0)  return true;
    //   return false;
    // }
    const find_ApMemberOfBusinessGroupDisplay_with_Access = (treeNode: TAPMemberOfBusinessGroupDisplayTreeNode): TAPMemberOfBusinessGroupDisplay | undefined => {
      if(treeNode.children.length > 0) return find_list_ApMemberOfBusinessGroupDisplay_with_Access(treeNode.children);
      else return undefined;
    }
    const find_list_ApMemberOfBusinessGroupDisplay_with_Access = (treeNodeList: TAPMemberOfBusinessGroupDisplayTreeNodeList): TAPMemberOfBusinessGroupDisplay | undefined => {
      for(const treeNode of treeNodeList) {
        if(this.hasBusinessGroupRolesAccess({
          apMemberOfBusinessGroupDisplay: treeNode.apMemberOfBusinessGroupDisplay,
          accessOnly_To_BusinessGroupManageAssets: accessOnly_To_BusinessGroupManageAssets
        })) return treeNode.apMemberOfBusinessGroupDisplay;
        // if(hasAccess(treeNode.apMemberOfBusinessGroupDisplay)) return  treeNode.apMemberOfBusinessGroupDisplay;
        const found: TAPMemberOfBusinessGroupDisplay | undefined = find_ApMemberOfBusinessGroupDisplay_with_Access(treeNode);
        if(found !== undefined) return found;
      }
      return undefined;
    }
    return find_list_ApMemberOfBusinessGroupDisplay_with_Access(apMemberOfBusinessGroupDisplayTreeNodeList);
  }

  /** Updates existing apMemberOfBusinessGroupDisplayList and returns modified list */
  public update_ApMemberOfBusinessGroupDisplayList({ apMemberOfBusinessGroupDisplayList, businessGroupEntityId, new_apConfiguredBusinessGroupRoleEntityIdList, completeApOrganizationBusinessGroupDisplayList }:{
    apMemberOfBusinessGroupDisplayList: TAPMemberOfBusinessGroupDisplayList;
    businessGroupEntityId: TAPEntityId;
    new_apConfiguredBusinessGroupRoleEntityIdList: TAPEntityIdList;
    completeApOrganizationBusinessGroupDisplayList: TAPBusinessGroupDisplayList;
  }): TAPMemberOfBusinessGroupDisplayList {

    const existingIndex = apMemberOfBusinessGroupDisplayList.findIndex( (apMemberOfBusinessGroupDisplay: TAPMemberOfBusinessGroupDisplay ) => {
      return apMemberOfBusinessGroupDisplay.apBusinessGroupDisplay.apEntityId.id === businessGroupEntityId.id;
    });
    if(new_apConfiguredBusinessGroupRoleEntityIdList.length === 0) {
      // remove group
      if(existingIndex > -1) apMemberOfBusinessGroupDisplayList.splice(existingIndex, 1);  
    } else {
      // add/replace group
      if(existingIndex > -1) apMemberOfBusinessGroupDisplayList[existingIndex].apConfiguredBusinessGroupRoleEntityIdList = new_apConfiguredBusinessGroupRoleEntityIdList;
      else {
        apMemberOfBusinessGroupDisplayList.push({
          apBusinessGroupDisplay: APBusinessGroupsDisplayService.find_ApBusinessGroupDisplay_by_id({
            apBusinessGroupDisplayList: completeApOrganizationBusinessGroupDisplayList,
            businessGroupId: businessGroupEntityId.id
          }),
          apConfiguredBusinessGroupRoleEntityIdList: new_apConfiguredBusinessGroupRoleEntityIdList,
          apCalculatedBusinessGroupRoleEntityIdList: []
        });
      }
    }
    return apMemberOfBusinessGroupDisplayList;
  }

}

export default new APMemberOfService();
