
import React from "react";

import { Divider } from "primereact/divider";
import { MenuItem, MenuItemCommandParams } from "primereact/api";

import { APComponentHeader } from "../../../components/APComponentHeader/APComponentHeader";
import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { APSClientOpenApi } from "../../../utils/APSClientOpenApi";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { E_CALL_STATE_ACTIONS, E_COMPONENT_STATE } from "./ManageUsersCommon";
import { AuthHelper } from "../../../auth/AuthHelper";
import { AuthContext } from "../../../components/AuthContextProvider/AuthContextProvider";
import { EUIAdminPortalResourcePaths } from "../../../utils/Globals";
import APEntityIdsService, { TAPEntityId, TAPEntityIdList } from "../../../utils/APEntityIdsService";
import APUsersDisplayService, { 
  TAPMemberOfBusinessGroupDisplayList, 
  TAPUserDisplay 
} from "../../../displayServices/old.APUsersDisplayService";
import { APDisplayOrganizationAssetInfoDisplayList } from "../../../components/APDisplay/APDisplayOrganizationAssetInfoDisplayList";
import APAssetDisplayService from "../../../displayServices/APAssetsDisplayService";

import '../../../components/APComponents.css';
import "./ManageUsers.css";

export interface IViewUserProps {
  userEntityId: TAPEntityId;
  organizationId?: string; 
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
  setBreadCrumbItemList: (itemList: Array<MenuItem>) => void;
  onNavigateHere: (componentState: E_COMPONENT_STATE, userEntityId: TAPEntityId) => void;
}

export const ViewUser: React.FC<IViewUserProps> = (props: IViewUserProps) => {
  const componentName = 'ViewUser';

  type TManagedObject = TAPUserDisplay;

  const [authContext] = React.useContext(AuthContext); 
  const [managedObject, setManagedObject] = React.useState<TManagedObject>();  
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);

  // * Api Calls *
  const apiGetManagedObject = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObject';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_USER, `retrieve details for user: ${props.userEntityId.id}`);
    try { 
      const apUserDisplay: TAPUserDisplay = await APUsersDisplayService.apsGet_ApUserDisplay({
        userId: props.userEntityId.id,
        organizationId: props.organizationId
      });
      setManagedObject(apUserDisplay);
    } catch(e: any) {
      APSClientOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const ViewUser_onNavigateHereCommand = (e: MenuItemCommandParams): void => {
    props.onNavigateHere(E_COMPONENT_STATE.MANAGED_OBJECT_VIEW, props.userEntityId);
  }

  // * useEffect Hooks *
  const doInitialize = async () => {
    props.onLoadingChange(true);
    await apiGetManagedObject();
    props.onLoadingChange(false);
  }

  React.useEffect(() => {
    props.setBreadCrumbItemList([{
      label: `User: ${props.userEntityId.displayName}`,
      command: ViewUser_onNavigateHereCommand
    }]);
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  // const transformUserAssetListToOrgAssetList = (userAssetList: TAPAssetInfoWithOrgList): TAPOrgAssetList => {
  //   const orgAssetList: TAPOrgAssetList = [];
  //   for (const _userAsset of userAssetList) {
  //     const foundOrgAsset = orgAssetList.find( (orgAsset: TAPOrgAsset) => {
  //       return orgAsset.organizationEntityId.id === _userAsset.organizationEntityId.id;
  //     });
  //     if(foundOrgAsset) {
  //       foundOrgAsset.assetInfoList.push({
  //         assetType: _userAsset.assetType,
  //         assetEntityId: _userAsset.assetEntityId
  //       });
  //     } else {
  //       const orgAsset: TAPOrgAsset = {
  //         organizationEntityId: _userAsset.organizationEntityId,
  //         assetInfoList: [{ 
  //           assetType: _userAsset.assetType,
  //           assetEntityId: _userAsset.assetEntityId
  //         }]
  //       };
  //       orgAssetList.push(orgAsset);
  //     }
  //   }
  //   return orgAssetList;
  // }
  // const renderAssets = () => {
  //   const funcName = 'renderAssets';
  //   const logName = `${componentName}.${funcName}()`;
  //   if(!managedObject) throw new Error(`${logName}: managedObject is undefined`);
    
  //   const orgAssetList = transformUserAssetListToOrgAssetList(managedObject.userAssetInfoList);

  //   return (
  //     <React.Fragment>
  //       <APDisplayOrgAssetList
  //         organizationId={props.organizationId}
  //         numberOfAssets={managedObject.userAssetInfoList.length}
  //         orgAssetList={orgAssetList}
  //         className="p-pt-2"
  //       />
  //       {/* <pre style={ { fontSize: '12px' }} >
  //         {JSON.stringify(orgAssetList, null, 2)}
  //       </pre> */}
  //     </React.Fragment>
  //   );
  // }

  const renderAssets = () => {
    const funcName = 'renderAssets';
    const logName = `${componentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);
    if(props.organizationId === undefined) throw new Error(`${logName}: props.organizationId === undefined`);

    return (
      <React.Fragment>
        <APDisplayOrganizationAssetInfoDisplayList
          apOrganizationAssetInfoDisplay={APAssetDisplayService.find_ApOrganizationAssetInfoDisplay({
            organizationId: props.organizationId,
            apOrganizationAssetInfoDisplayList: managedObject.apOrganizationAssetInfoDisplayList
          })}
          className="p-pt-2"
        />
        {/* <pre style={ { fontSize: '12px' }} >
          {JSON.stringify(orgAssetList, null, 2)}
        </pre> */}
      </React.Fragment>
    );
  }

  const renderSystemRoles = (apSystemRoleEntityIdList: TAPEntityIdList): string => {
    if(apSystemRoleEntityIdList.length === 0) return 'None';
    return APEntityIdsService.getSortedDisplayNameList_As_String(apSystemRoleEntityIdList);
  }
  const renderBusinessGroupRoles = (apSystemRoleEntityIdList: TAPEntityIdList): string => {
    if(apSystemRoleEntityIdList.length === 0) return 'None';
    return APEntityIdsService.getSortedDisplayNameList_As_String(apSystemRoleEntityIdList);
  }

  const renderOrganizations = () => {
    const funcName = 'renderOrganizations';
    const logName = `${componentName}.${funcName}()`;
    if(!managedObject) throw new Error(`${logName}: managedObject is undefined`);
    if(props.organizationId !== undefined) {
      // get the groups for this org
      const apMemberOfBusinessGroupDisplayList: TAPMemberOfBusinessGroupDisplayList = APUsersDisplayService.find_ApMemberOfBusinessGroupDisplayList({
        organizationId: props.organizationId,
        apUserDisplay: managedObject
      });

      // TODO: create separate display component
      // TODO: probably need a tree view
      const businessGroups_jsxList: Array<JSX.Element> = [];
      for(const apMemberOfBusinessGroupDisplay of apMemberOfBusinessGroupDisplayList) {
        businessGroups_jsxList.push(
          <div>
            <div>TODO: Business Groups: needs a panel with a tree table?</div>
            <div><b>Business Group</b>: {apMemberOfBusinessGroupDisplay.apBusinessGroupDisplay.apEntityId.displayName}</div>
            <div className="p-ml-2">Roles: {renderBusinessGroupRoles(apMemberOfBusinessGroupDisplay.apConfiguredBusinessGroupRoleEntityIdList)}</div>
          </div>
        );
      }
      return businessGroups_jsxList;
    }

    // TODO: build this one: 
    throw new Error(`${logName} - implement system users - multiple orgs display..`);
    // return (
    //   <React.Fragment>
    //     <APDisplayUserOrganizationRoles
    //       organizationId={props.organizationId}
    //       apsUserResponse={managedObject.apiObject}
    //       className="p-pt-2"
    //     />
    //   </React.Fragment>
    // );
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
              
              <div><b>Activated</b>: {String(managedObject.apsUserResponse.isActivated)}</div>

              <Divider />

              <div><b>E-mail</b>: {managedObject.apsUserResponse.profile.email}</div>

              <div><b>First</b>: {managedObject.apsUserResponse.profile.first}</div>

              <div><b>Last</b>: {managedObject.apsUserResponse.profile.last}</div>

              <Divider />

              { AuthHelper.isAuthorizedToAccessResource(authContext.authorizedResourcePathsAsString, EUIAdminPortalResourcePaths.ManageSystemUsers) &&
                <div><b>System Roles</b>: {renderSystemRoles(managedObject.apSystemRoleEntityIdList)}</div>
              }

              <div className="p-mt-2">{renderOrganizations()}</div>

              <div className="p-mt-2">{renderAssets()}</div>
              
            </div>
            <div className="detail-right">
              <div>Id: {managedObject.apEntityId.id}</div>
            </div>            
          </div>
        </div>  
      </React.Fragment>
    ); 
  }

  return (
    <div className="manage-users">

      { managedObject && 
        <APComponentHeader header={`User: ${managedObject.apEntityId.displayName}`} />
      }

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      {managedObject && renderManagedObject() }

      {/* DEBUG */}
      <pre style={ { fontSize: '12px' }} >
        {JSON.stringify(managedObject, null, 2)}
      </pre>

    </div>
  );
}
