import { 
  APSOrganizationIdList,
  APSUser, 
  APSUserId,
  EAPSAuthRoleList
} from "../../../_generated/@solace-iot-team/apim-server-openapi-browser";
import { Globals } from '../../../utils/Globals';
import { ConfigHelper } from '../../../components/ConfigContextProvider/ConfigHelper';
import { TAPConfigContext } from '../../../components/ConfigContextProvider/ConfigContextProvider';
import { EAPAssetType, TAPAssetInfoWithOrgList } from "../../../utils/APTypes";
import { ApiError, App, AppsService, CommonDisplayName, CommonName, DevelopersService } from "@solace-iot-team/apim-connector-openapi-browser";
import { APClientConnectorOpenApi } from "../../../utils/APClientConnectorOpenApi";

export type TManagedObjectId = APSUserId;

export type TViewApiObject = APSUser;

export type TViewManagedObject = {
  id: TManagedObjectId;
  displayName: string;
  globalSearch: string;
  apiObject: TViewApiObject;
  roleDisplayNameListAsString: string;
  memberOfOrganizationNameListAsString: string;
  userAssetInfoList: TAPAssetInfoWithOrgList;
}

export enum E_CALL_STATE_ACTIONS {
  API_DELETE_USER = "API_DELETE_USER",
  API_REMOVE_ORG = "API_REMOVE_ORG",
  API_GET_USER_LIST = "API_GET_USER_LIST",
  API_CREATE_USER = "API_CREATE_USER",
  API_GET_USER = "API_GET_USER",
  API_REPLACE_USER = "API_REPLACE_USER",
  API_GET_AVAILABE_ORGANIZATIONS = "API_GET_AVAILABE_ORGANIZATIONS",
  API_ADD_USER_TO_ORG = "API_ADD_USER_TO_ORG"
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

export enum E_ManageUsers_Scope {
  ALL_USERS = "ALL_USERS",
  ORG_USERS = "ORG_USERS"
}

export type TManageOrganizationUsersScope = {
  type: E_ManageUsers_Scope.ORG_USERS;
  organizationId: CommonName;
  organizationDisplayName: CommonDisplayName;
}
export type TManageAllUsersScope = {
  type: E_ManageUsers_Scope.ALL_USERS;
}
export type TManageUsersScope = 
  TManageOrganizationUsersScope
  | TManageAllUsersScope;

export class ManageUsersCommon {

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

  public static getRoleDisplayNameListAsString = (configContext: TAPConfigContext, roles?: EAPSAuthRoleList): string => {
    return ConfigHelper.getAuthorizedRolesDisplayNameList(roles ? roles : [], configContext).join(', ');
  }

  public static getOrganizationListAsString = (organizationList?: APSOrganizationIdList): string => {
    if (organizationList) return organizationList.join(', ');
    else return '';
  }

  public static transformViewApiObjectToViewManagedObject = (configContext: TAPConfigContext, viewApiObject: TViewApiObject, userAssetInfoList: TAPAssetInfoWithOrgList): TViewManagedObject => {
    // const funcName = 'transformViewApiObjectToViewManagedObject';
    // const logName = `${ManageUsersCommon.name}.${funcName}()`;
    return {
      id: viewApiObject.userId,
      displayName: `${viewApiObject.profile.first} ${viewApiObject.profile.last}`,
      globalSearch: ManageUsersCommon.generateGlobalSearchContent(viewApiObject),
      apiObject: viewApiObject,
      roleDisplayNameListAsString: ManageUsersCommon.getRoleDisplayNameListAsString(configContext, viewApiObject.roles),
      memberOfOrganizationNameListAsString: ManageUsersCommon.getOrganizationListAsString(viewApiObject.memberOfOrganizations),
      userAssetInfoList: userAssetInfoList
    }
  }

  public static isActiveBodyTemplate = (managedObject: TViewManagedObject) => {
    if (managedObject.apiObject.isActivated) return (<span className="pi pi-check badge-active" />)
    else return (<span className="pi pi-times badge-active" />)
  }

  public static getUserAssetList = async (apsUser: APSUser, organizationId?: CommonName): Promise<TAPAssetInfoWithOrgList> => {
    let userAssetInfoList: TAPAssetInfoWithOrgList = [];
    const _orgList = organizationId !== undefined ? [organizationId] : apsUser.memberOfOrganizations; 
    if(_orgList) {
      for(const _orgId of _orgList) {
        let _userExistsInConnector = false;
        try {
          await DevelopersService.getDeveloper({
            organizationName: _orgId, 
            developerUsername: apsUser.userId
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
            organizationName: _orgId,
            developerUsername: apsUser.userId
          });
          const _orgEntityId = {
            id: _orgId,
            displayName: _orgId
          };
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
