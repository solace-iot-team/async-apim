
import React from "react";

import { Divider } from "primereact/divider";
import { MenuItem, MenuItemCommandParams } from "primereact/api";

import { 
  ApsUsersService, 
  APSUserResponse,
  APSOrganizationRoles
} from "../../../_generated/@solace-iot-team/apim-server-openapi-browser";
import { CommonName } from "@solace-iot-team/apim-connector-openapi-browser";

import { APComponentHeader } from "../../../components/APComponentHeader/APComponentHeader";
import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { APSClientOpenApi } from "../../../utils/APSClientOpenApi";
import { ConfigContext } from '../../../components/ConfigContextProvider/ConfigContextProvider';
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { E_CALL_STATE_ACTIONS, E_COMPONENT_STATE, ManageUsersCommon, TManagedObjectId, TViewManagedObject } from "./ManageUsersCommon";
import { TAPAssetInfoWithOrgList, TAPOrgAsset, TAPOrgAssetList } from "../../../utils/APTypes";
import { APDisplayOrgAssetList } from "../../../components/APDisplay/APDisplayOrgAssetList";
import { AuthHelper } from "../../../auth/AuthHelper";
import { AuthContext } from "../../../components/AuthContextProvider/AuthContextProvider";
import { EUIAdminPortalResourcePaths } from "../../../utils/Globals";
import { APDisplayUserOrganizationRoles } from "../../../components/APDisplay/APDisplayUserOrganizationRoles";

import '../../../components/APComponents.css';
import "./ManageUsers.css";
import { ConfigHelper } from "../../../components/ConfigContextProvider/ConfigHelper";

export interface IViewUserProps {
  userId: TManagedObjectId;
  userDisplayName: string;
  organizationId?: CommonName; 
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
  setBreadCrumbItemList: (itemList: Array<MenuItem>) => void;
  onNavigateHere: (componentState: E_COMPONENT_STATE, userId: TManagedObjectId, userDisplayName: string) => void;
}

export const ViewUser: React.FC<IViewUserProps> = (props: IViewUserProps) => {
  const componentName = 'ViewUser';

  type TManagedObject = TViewManagedObject;

  const [configContext] = React.useContext(ConfigContext); 
  const [authContext] = React.useContext(AuthContext); 
  const [managedObject, setManagedObject] = React.useState<TManagedObject>();  
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);

  // * Api Calls *
  const apiGetManagedObject = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObject';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_USER, `retrieve details for user: ${props.userId}`);
    try { 
      const apsUserResponse: APSUserResponse = await ApsUsersService.getApsUser({
        userId: props.userId
      });
      let userAssetInfoList: TAPAssetInfoWithOrgList = await ManageUsersCommon.getUserAssetList(apsUserResponse, props.organizationId);
      setManagedObject(ManageUsersCommon.transformViewApiObjectToViewManagedObject(configContext, apsUserResponse, userAssetInfoList));
    } catch(e: any) {
      APSClientOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const ViewUser_onNavigateHereCommand = (e: MenuItemCommandParams): void => {
    props.onNavigateHere(E_COMPONENT_STATE.MANAGED_OBJECT_VIEW, props.userId, props.userDisplayName);
  }

  // * useEffect Hooks *
  const doInitialize = async () => {
    props.onLoadingChange(true);
    await apiGetManagedObject();
    props.onLoadingChange(false);
  }

  React.useEffect(() => {
    props.setBreadCrumbItemList([{
      label: `User: ${props.userDisplayName}`,
      command: ViewUser_onNavigateHereCommand
    }]);
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const transformUserAssetListToOrgAssetList = (userAssetList: TAPAssetInfoWithOrgList): TAPOrgAssetList => {
    const orgAssetList: TAPOrgAssetList = [];
    for (const _userAsset of userAssetList) {
      const foundOrgAsset = orgAssetList.find( (orgAsset: TAPOrgAsset) => {
        return orgAsset.organizationEntityId.id === _userAsset.organizationEntityId.id;
      });
      if(foundOrgAsset) {
        foundOrgAsset.assetInfoList.push({
          assetType: _userAsset.assetType,
          assetEntityId: _userAsset.assetEntityId
        });
      } else {
        const orgAsset: TAPOrgAsset = {
          organizationEntityId: _userAsset.organizationEntityId,
          assetInfoList: [{ 
            assetType: _userAsset.assetType,
            assetEntityId: _userAsset.assetEntityId
          }]
        };
        orgAssetList.push(orgAsset);
      }
    }
    return orgAssetList;
  }
  const renderAssets = () => {
    const funcName = 'renderAssets';
    const logName = `${componentName}.${funcName}()`;
    if(!managedObject) throw new Error(`${logName}: managedObject is undefined`);
    
    const orgAssetList = transformUserAssetListToOrgAssetList(managedObject.userAssetInfoList);

    return (
      <React.Fragment>
        <APDisplayOrgAssetList
          organizationId={props.organizationId}
          numberOfAssets={managedObject.userAssetInfoList.length}
          orgAssetList={orgAssetList}
          className="p-pt-2"
        />
        {/* <pre style={ { fontSize: '12px' }} >
          {JSON.stringify(orgAssetList, null, 2)}
        </pre> */}
      </React.Fragment>
    );
  }
  const renderOrganizations = () => {
    const funcName = 'renderOrganizations';
    const logName = `${componentName}.${funcName}()`;
    if(!managedObject) throw new Error(`${logName}: managedObject is undefined`);
    if(props.organizationId) {
      if(!managedObject.apiObject.memberOfOrganizations) throw new Error(`${logName}: managedObject.apiObject.memberOfOrganizations is undefined`);
      const apsOrganizationRoles = managedObject.apiObject.memberOfOrganizations.find((apsOrganizationRoles: APSOrganizationRoles) => {
        return props.organizationId === apsOrganizationRoles.organizationId;
      });
      if(!apsOrganizationRoles) throw new Error(`${logName}: apsOrganizationRoles is undefined`);
      return (
        <div><b>Roles</b>: {ConfigHelper.getAuthorizedOrgRolesDisplayNameList(configContext, apsOrganizationRoles.roles).join(', ')}</div>
      );
    }
    return (
      <React.Fragment>
        <APDisplayUserOrganizationRoles
          organizationId={props.organizationId}
          apsUserResponse={managedObject.apiObject}
          className="p-pt-2"
        />
      </React.Fragment>
    );

  }

  const renderManagedObject = () => {
    const funcName = 'renderManagedObject';
    const logName = `${componentName}.${funcName}()`;
    if(!managedObject) throw new Error(`${logName}: managedObject is undefined`);

    return (
      <React.Fragment>
        <div className="p-col-12">
          <div className="user-view">
            <div className="detail-left">
              
              <div><b>Activated</b>: {String(managedObject.apiObject.isActivated)}</div>

              <Divider />

              <div><b>E-mail</b>: {managedObject.apiObject.profile.email}</div>

              <div><b>First</b>: {managedObject.apiObject.profile.first}</div>

              <div><b>Last</b>: {managedObject.apiObject.profile.last}</div>

              <Divider />

              { AuthHelper.isAuthorizedToAccessResource(authContext.authorizedResourcePathsAsString, EUIAdminPortalResourcePaths.ManageSystemUsers) &&
                <div><b>System Roles</b>: {managedObject.systemRoleDisplayNameListAsString ? managedObject.systemRoleDisplayNameListAsString : 'None'}</div>
              }

              <div className="p-mt-2">{renderOrganizations()}</div>

              <div className="p-mt-2">{renderAssets()}</div>
              
            </div>
            <div className="detail-right">
              <div>Id: {managedObject.id}</div>
            </div>            
          </div>
        </div>  
      </React.Fragment>
    ); 
  }

  return (
    <div className="manage-users">

      { managedObject && 
        <APComponentHeader header={`User: ${managedObject.displayName}`} />
      }

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      {managedObject && renderManagedObject() }

      {/* DEBUG */}
      {/* <pre style={ { fontSize: '12px' }} >
        {JSON.stringify(managedObject, null, 2)}
      </pre> */}

    </div>
  );
}
