import React from 'react';

import { 
  APSOrganizationIdList,
  APSUser, 
  APSUserId,
  EAPSAuthRoleList
} from '@solace-iot-team/apim-server-openapi-browser';
import { Globals } from '../../../utils/Globals';
import { ConfigHelper } from '../../../components/ConfigContextProvider/ConfigHelper';
import { TAPConfigContext } from '../../../components/ConfigContextProvider/ConfigContextProvider';

export type TManagedObjectId = APSUserId;

export type TViewApiObject = APSUser;

export type TViewManagedObject = {
  id: TManagedObjectId,
  displayName: string,
  globalSearch: string,
  apiObject: TViewApiObject,
  roleDisplayNameListAsString: string,
  memberOfOrganizationNameListAsString: string
}

export enum E_CALL_STATE_ACTIONS {
  API_DELETE_USER = "API_DELETE_USER",
  API_GET_USER_LIST = "API_GET_USER_LIST",
  API_CREATE_USER = "API_CREATE_USER",
  API_GET_USER = "API_GET_USER",
  API_REPLACE_USER = "API_REPLACE_USER",
  API_GET_AVAILABE_ORGANIZATIONS = "API_GET_AVAILABE_ORGANIZATIONS"
}

export class ManageUsersCommon {

  private static generateGlobalSearchContent = (viewApiObject: TViewApiObject): string => {
    const filteredViewApiObject = {
      ...viewApiObject,
      password: undefined
    }
    return Globals.generateDeepObjectValuesString(filteredViewApiObject);
  }

  public static getRoleDisplayNameListAsString = (configContext: TAPConfigContext, roles?: EAPSAuthRoleList, ): string => {
    return ConfigHelper.getAuthorizedRolesDisplayNameList(roles ? roles : [], configContext).join(', ');
  }

  public static getOrganizationListAsString = (organizationList?: APSOrganizationIdList): string => {
    if (organizationList) return organizationList.join(', ');
    else return '';
  }

  public static transformViewApiObjectToViewManagedObject = (configContext: TAPConfigContext, viewApiObject: TViewApiObject): TViewManagedObject => {
    // const funcName = 'transformViewApiObjectToViewManagedObject';
    // const logName = `${ManageUsersCommon.name}.${funcName}()`;
    return {
      id: viewApiObject.userId,
      displayName: `${viewApiObject.profile.first} ${viewApiObject.profile.last}`,
      globalSearch: ManageUsersCommon.generateGlobalSearchContent(viewApiObject),
      apiObject: viewApiObject,
      roleDisplayNameListAsString: ManageUsersCommon.getRoleDisplayNameListAsString(configContext, viewApiObject.roles),
      memberOfOrganizationNameListAsString: ManageUsersCommon.getOrganizationListAsString(viewApiObject.memberOfOrganizations)
    }
  }

  public static renderSubComponentHeader = (header: string): JSX.Element => {
    return (
      <React.Fragment>
        <h3>{header}</h3>
        {/* <Divider/> */}
      </React.Fragment>
    )
  }

  public static isActiveBodyTemplate = (managedObject: TViewManagedObject) => {
    if (managedObject.apiObject.isActivated) return (<span className="pi pi-check badge-active" />)
    else return (<span className="pi pi-times badge-active" />)
  }


}
