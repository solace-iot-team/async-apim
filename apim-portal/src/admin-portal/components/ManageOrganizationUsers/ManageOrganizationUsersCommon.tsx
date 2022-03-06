import { 
  APSOrganizationRolesList,
  APSOrganizationRolesResponse,
  APSOrganizationRolesResponseList,
  APSUserId,
  APSUserResponse,
} from "../../../_generated/@solace-iot-team/apim-server-openapi-browser";
import { Globals } from '../../../utils/Globals';
import { ConfigHelper } from '../../../components/ConfigContextProvider/ConfigHelper';
import { TAPConfigContext } from '../../../components/ConfigContextProvider/ConfigContextProvider';
import { EAPAssetType, TAPAssetInfoWithOrgList } from "../../../utils/APTypes";
import { 
  ApiError, 
  App, 
  AppsService, 
  CommonName, 
  DevelopersService 
} from "@solace-iot-team/apim-connector-openapi-browser";
import { APClientConnectorOpenApi } from "../../../utils/APClientConnectorOpenApi";
import { TAPEntityIdList } from "../../../utils/APEntityIdsService";

export type TManagedObjectId = APSUserId;

export type TViewApiObject = APSUserResponse;

export type TViewAPSOrganizationRoles = APSOrganizationRolesResponse & {
  rolesDisplayNameListAsString: string;
}
export type TViewAPSOrganizationRolesList = Array<TViewAPSOrganizationRoles>;
export type TViewManagedObject = {
  id: TManagedObjectId;
  displayName: string;
  globalSearch: string;
  apiObject: TViewApiObject;
  systemRoleDisplayNameListAsString: string;
  memberOfOrganizationNameListAsString: string;
  userAssetInfoList: TAPAssetInfoWithOrgList;
  viewMemberOfOrganizations: TViewAPSOrganizationRolesList;
}

export enum E_CALL_STATE_ACTIONS {
  API_DELETE_USER = "API_DELETE_USER",
  API_REMOVE_ORG = "API_REMOVE_ORG",
  API_GET_USER_LIST = "API_GET_USER_LIST",
  API_CREATE_USER = "API_CREATE_USER",
  API_GET_USER = "API_GET_USER",
  API_REPLACE_USER = "API_REPLACE_USER",
  API_GET_AVAILABE_ORGANIZATIONS = "API_GET_AVAILABE_ORGANIZATIONS",
  API_GET_ORGANIZATION = "API_GET_ORGANIZATION",
  API_ADD_USER_TO_ORG = "API_ADD_USER_TO_ORG",
  API_GET_BUSINESS_GROUP_LIST = "API_GET_BUSINESS_GROUP_LIST",
  API_UPDATE_USER_PROFILE = "API_UPDATE_USER_PROFILE",
  API_UPDATE_USER_CREDENTIALS = "API_UPDATE_USER_CREDENTIALS",
  API_UPDATE_USER_MEMBER_OF_BUSINESS_GROUPS = "API_UPDATE_USER_MEMBER_OF_BUSINESS_GROUPS",
  API_UPDATE_ORGANIZATION_ROLES = "API_UPDATE_ORGANIZATION_ROLES",
  API_CHECK_ORGANIZATION_USER_EXISTS = "API_CHECK_ORGANIZATION_USER_EXISTS",
}

export enum E_COMPONENT_STATE {
  UNDEFINED = "UNDEFINED",
  MANAGED_OBJECT_LIST_VIEW = "MANAGED_OBJECT_LIST_VIEW",
  MANAGED_OBJECT_VIEW = "MANAGED_OBJECT_VIEW",
  MANAGED_OBJECT_EDIT = "MANAGED_OBJECT_EDIT",
  MANAGED_OBJECT_DELETE = "MANAGED_OBJECT_DELETE",
  MANAGED_OBJECT_NEW = "MANAGED_OBJECT_NEW",
  MANAGED_OBJECT_ADD = "MANAGED_OBJECT_ADD"
}

export enum E_COMPONENT_STATE_NEW_USER {
  UNDEFINED = "UNDEFINED",
  PROFILE = "PROFILE",
  ROLES_AND_GROUPS = "ROLES_AND_GROUPS",
  AUTHENTICATION = "AUTHENTICATION",
  REVIEW = "REVIEW"
}

export enum E_COMPONENT_STATE_ADD_USER {
  UNDEFINED = "UNDEFINED",
  MANAGED_OBJECT_LIST_VIEW = "MANAGED_OBJECT_LIST_VIEW",
  MANAGED_OBJECT_EDIT_ROLES = "MANAGED_OBJECT_EDIT_ROLES",
}

// export enum E_ManageUsers_Scope {
//   ALL_USERS = "ALL_USERS",
//   ORG_USERS = "ORG_USERS"
// }

// export type TManageOrganizationUsersScope = {
//   type: E_ManageUsers_Scope.ORG_USERS;
//   organizationEntityId: TAPEntityId;
// }
// export type TManageAllUsersScope = {
//   type: E_ManageUsers_Scope.ALL_USERS;
// }
// export type TManageUsersScope = 
//   TManageOrganizationUsersScope
//   | TManageAllUsersScope;

export class ManageUsersCommon {

  public static addMemberOfOrganizationRoles = (currentMemberOfOrganizationRolesResponseList: APSOrganizationRolesResponseList | undefined, newMemberOfOrganizationRoles: APSOrganizationRolesResponse): APSOrganizationRolesResponseList => {
    const newMemberOfOrganizationRolesList: APSOrganizationRolesResponseList = currentMemberOfOrganizationRolesResponseList ? JSON.parse(JSON.stringify(currentMemberOfOrganizationRolesResponseList)) : [];
    const foundIndex = newMemberOfOrganizationRolesList.findIndex((apsOrganizationRoles: APSOrganizationRolesResponse) => {
      return apsOrganizationRoles.organizationId === newMemberOfOrganizationRoles.organizationId;
    });
    if(foundIndex > -1) {
      newMemberOfOrganizationRolesList[foundIndex] = newMemberOfOrganizationRoles;
    } else {
      return newMemberOfOrganizationRolesList.concat(newMemberOfOrganizationRoles);
    }
    return newMemberOfOrganizationRolesList;
  }

  public static removeMemberOfOrganizationRoles = (currentMemberOfOrganizationRolesResponseList: APSOrganizationRolesResponseList | undefined, removeOrgId: CommonName): APSOrganizationRolesResponseList => {
    const newMemberOfOrganizationRolesList: APSOrganizationRolesResponseList = currentMemberOfOrganizationRolesResponseList ? JSON.parse(JSON.stringify(currentMemberOfOrganizationRolesResponseList)) : [];
    const foundIndex = newMemberOfOrganizationRolesList.findIndex((apsOrganizationRoles: APSOrganizationRolesResponse) => {
      return apsOrganizationRoles.organizationId === removeOrgId;
    });
    if(foundIndex > -1) {
      newMemberOfOrganizationRolesList.splice(foundIndex, 1);
    }
    return newMemberOfOrganizationRolesList;
  }

  public static transformTableSortFieldNameToApiSortFieldName = (tableSortFieldName: string): string => {
    // const funcName = 'transformTableSortFieldNameToApiSortFieldName';
    // const logName = `${componentName}.${funcName}()`;
    // console.log(`${logName}: tableSortFieldName = ${tableSortFieldName}`);
    if(tableSortFieldName.startsWith('apiObject.')) {
      return tableSortFieldName.replace('apiObject.', '');
    }
    return tableSortFieldName;
  }

  private static generateGlobalSearchContent = (viewApiObject: TViewApiObject): string => {
    const filteredViewApiObject = {
      ...viewApiObject,
      password: undefined
    }
    return Globals.generateDeepObjectValuesString(filteredViewApiObject);
  }

  public static getOrganizationListAsString = (memberOfOrganizations: APSOrganizationRolesResponseList | undefined): string => {
    if(memberOfOrganizations === undefined) return 'None';
    const orgList: Array<string> = memberOfOrganizations.map( (x) => {
      return x.organizationId;
    });
    if(orgList.length > 0) return orgList.join(', ');
    else return 'None';
  }

  private static getViewMemberOfOrganizations = (configContext: TAPConfigContext, memberOfOrganizations: APSOrganizationRolesResponseList | undefined): TViewAPSOrganizationRolesList => {
    const list: TViewAPSOrganizationRolesList = [];
    if(memberOfOrganizations === undefined) return list;
    memberOfOrganizations.forEach((apsOrganizationRoles: APSOrganizationRolesResponse) => {
      const rolesDisplayNameList: Array<string> = ConfigHelper.getAuthorizedOrgRolesDisplayNameList(configContext, apsOrganizationRoles.roles);
      const viewRoles: TViewAPSOrganizationRoles = {
        ...apsOrganizationRoles,
        rolesDisplayNameListAsString: rolesDisplayNameList.length > 0 ? rolesDisplayNameList.join(', ') : 'None',
      }
      list.push(viewRoles);
    });
    return list;
  }

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

  public static transformViewApiObjectToViewManagedObject = (configContext: TAPConfigContext, viewApiObject: TViewApiObject, userAssetInfoList: TAPAssetInfoWithOrgList): TViewManagedObject => {
    // const funcName = 'transformViewApiObjectToViewManagedObject';
    // const logName = `${ManageUsersCommon.name}.${funcName}()`;
    const systemRoleDisplayNameList: Array<string> = ConfigHelper.getAuthorizedSystemRolesDisplayNameList(configContext, viewApiObject.systemRoles);
    return {
      id: viewApiObject.userId,
      displayName: `${viewApiObject.profile.first} ${viewApiObject.profile.last}`,
      globalSearch: ManageUsersCommon.generateGlobalSearchContent(viewApiObject),
      apiObject: viewApiObject,
      systemRoleDisplayNameListAsString: systemRoleDisplayNameList.length > 0 ? systemRoleDisplayNameList.join(', ') : 'None',
      memberOfOrganizationNameListAsString: ManageUsersCommon.getOrganizationListAsString(viewApiObject.memberOfOrganizations),
      userAssetInfoList: userAssetInfoList,
      viewMemberOfOrganizations: ManageUsersCommon.getViewMemberOfOrganizations(configContext, viewApiObject.memberOfOrganizations)      
    }
  }

  public static isActiveBodyTemplate = (managedObject: TViewManagedObject) => {
    if (managedObject.apiObject.isActivated) return (<span className="pi pi-check badge-active" />)
    else return (<span className="pi pi-times badge-active" />)
  }

  public static organizationsTemplate = (mo: TViewManagedObject) => {
    return mo.memberOfOrganizationNameListAsString;
  }

  public static systemRolesTemplate = (mo: TViewManagedObject) => {
    return mo.systemRoleDisplayNameListAsString;
  }

  public static getUserAssetList = async (apsUserResponse: APSUserResponse, organizationId?: CommonName): Promise<TAPAssetInfoWithOrgList> => {
    const funcName = 'getUserAssetList';
    const logName = `${ManageUsersCommon.name}.${funcName}()`;

    let userAssetInfoList: TAPAssetInfoWithOrgList = [];
    const _orgEntityIdList: TAPEntityIdList = [];
    if(organizationId !== undefined) {
      const found = apsUserResponse.memberOfOrganizations?.find( (x) => {
        return x.organizationId === organizationId;
      });
      if(found === undefined) throw new Error(`${logName}: cannot find organizationId=${organizationId} in apsUserResponse.memberOfOrganizations=${JSON.stringify(apsUserResponse.memberOfOrganizations, null, 2)}`);
      _orgEntityIdList.push({
        id: found.organizationId,
        displayName: found.organizationDisplayName
      })
    } else {
      const list = apsUserResponse.memberOfOrganizations?.map((apsOrganizationRoles: APSOrganizationRolesResponse) => {
        return {
          id: apsOrganizationRoles.organizationId,
          displayName: apsOrganizationRoles.organizationDisplayName
        }
      });
      if(list !== undefined) _orgEntityIdList.push(...list);
    }
    if(_orgEntityIdList.length > 0) {
      for(const _orgEntityId of _orgEntityIdList) {
        let _userExistsInConnector = false;
        try {
          await DevelopersService.getDeveloper({
            organizationName: _orgEntityId.id, 
            developerUsername: apsUserResponse.userId
          });
          _userExistsInConnector = true;
        } catch(e: any) {
          if(APClientConnectorOpenApi.isInstanceOfApiError(e)) {
            const apiError: ApiError = e;
            if(apiError.status !== 404) throw e;
          } else throw e; 
        }
        if(_userExistsInConnector) {
          // check if user has any assets
          const _apiAppList: Array<App> = await AppsService.listDeveloperApps({
            organizationName: _orgEntityId.id,
            developerUsername: apsUserResponse.userId
          });
          for(const _apiApp of _apiAppList) {
            userAssetInfoList.push({
              assetType: EAPAssetType.DEVELOPER_APP,
              assetEntityId: {
                id: _apiApp.name,
                displayName: _apiApp.displayName ? _apiApp.displayName : _apiApp.name
              },
              organizationEntityId: _orgEntityId
            });
          }
        }
      }
    }
    return userAssetInfoList;
  } 
}
