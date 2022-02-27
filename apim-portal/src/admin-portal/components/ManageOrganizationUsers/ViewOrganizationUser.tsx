
import React from "react";

import { MenuItem, MenuItemCommandParams } from "primereact/api";
import { TabPanel, TabView } from "primereact/tabview";

import { APComponentHeader } from "../../../components/APComponentHeader/APComponentHeader";
import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { APSClientOpenApi } from "../../../utils/APSClientOpenApi";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { E_CALL_STATE_ACTIONS, E_COMPONENT_STATE } from "./ManageOrganizationUsersCommon";
import { AuthHelper } from "../../../auth/AuthHelper";
import { AuthContext } from "../../../components/AuthContextProvider/AuthContextProvider";
import { EUIAdminPortalResourcePaths } from "../../../utils/Globals";
import APEntityIdsService, { TAPEntityId, TAPEntityIdList } from "../../../utils/APEntityIdsService";
import APUsersDisplayService, { APLegacyUserDisplayService, TAPLegacyMemberOfOrganizationRolesDisplay, TAPLegacyMemberOfOrganizationRolesDisplayList, TAPUserDisplay } from "../../../displayServices/APUsersDisplayService";
import APAssetDisplayService from "../../../displayServices/APAssetsDisplayService";
import { APDisplayOrganizationAssetInfoDisplayList } from "../../../components/APDisplay/APDisplayOrganizationAssetInfoDisplayList";
import { APDisplayUserProfile } from "../../../components/APDisplay/APDisplayUserProfile";
import { APDisplayOrganizationBusinessGroups } from "../../../components/APDisplay/APDisplayOrganizationBusinessGroups/APDisplayOrganizationBusinessGroups";
import APBusinessGroupsDisplayService, { TAPBusinessGroupDisplayList } from "../../../displayServices/APBusinessGroupsDisplayService";

import '../../../components/APComponents.css';
import "./ManageOrganizationUsers.css";

export interface IViewOrganizationUserProps {
  userEntityId: TAPEntityId;
  organizationEntityId: TAPEntityId;
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
  setBreadCrumbItemList: (itemList: Array<MenuItem>) => void;
  onNavigateHere: (componentState: E_COMPONENT_STATE, userEntityId: TAPEntityId) => void;
}

export const ViewOrganizationUser: React.FC<IViewOrganizationUserProps> = (props: IViewOrganizationUserProps) => {
  const ComponentName = 'ViewOrganizationUser';

  type TManagedObject = TAPUserDisplay;

  const [authContext] = React.useContext(AuthContext); 
  const [managedObject, setManagedObject] = React.useState<TManagedObject>();  
  const [completeOrganizationApBusinessGroupDisplayList, setCompleteOrganizationApBusinessGroupDisplayList] = React.useState<TAPBusinessGroupDisplayList>([]);
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [tabActiveIndex, setTabActiveIndex] = React.useState(0);

  // * Api Calls *
  const apiGetManagedObject = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObject';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_USER, `retrieve details for user: ${props.userEntityId.displayName}`);
    try { 
      const apUserDisplay: TAPUserDisplay = await APUsersDisplayService.apsGet_ApUserDisplay({
        userId: props.userEntityId.id,
        organizationId: props.organizationEntityId.id
      });
      setManagedObject(apUserDisplay);
    } catch(e: any) {
      APSClientOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }
  const apiGetCompleteApBusinessGroupDisplayList = async(organizationId: string): Promise<TApiCallState> => {
    const funcName = 'apiGetCompleteApBusinessGroupDisplayList';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_BUSINESS_GROUP_LIST, 'retrieve list of business groups');
    try {
      const list: TAPBusinessGroupDisplayList = await APBusinessGroupsDisplayService.apsGetList_ApBusinessGroupSystemDisplayList({
        organizationId: organizationId
      });
      setCompleteOrganizationApBusinessGroupDisplayList(list);
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
    await apiGetCompleteApBusinessGroupDisplayList(props.organizationEntityId.id);
    await apiGetManagedObject();
    props.onLoadingChange(false);
  }

  React.useEffect(() => {
    props.setBreadCrumbItemList([{
      label: `User: ${props.userEntityId.id}`,
      command: ViewUser_onNavigateHereCommand
    }]);
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const renderSystemRoles = (apSystemRoleEntityIdList: TAPEntityIdList): string => {
    if(apSystemRoleEntityIdList.length === 0) return 'None.';
    return APEntityIdsService.getSortedDisplayNameList_As_String(apSystemRoleEntityIdList);
  }

  const renderLegacyOrganzationRoles = (apLegacy_MemberOfOrganizationRolesDisplayList: TAPLegacyMemberOfOrganizationRolesDisplayList): string => {
    const apLegacyMemberOfOrganizationRolesDisplay: TAPLegacyMemberOfOrganizationRolesDisplay = APLegacyUserDisplayService.find_LegacyMemberOfOrganizationRolesDisplay({ 
      organizationId: props.organizationEntityId.id,
      apLegacyMemberOfOrganizationRolesDisplayList: apLegacy_MemberOfOrganizationRolesDisplayList
    });
    return APEntityIdsService.getSortedDisplayNameList_As_String(apLegacyMemberOfOrganizationRolesDisplay.apOrganizationAuthRoleEntityIdList);
  }

  const renderManagedObjectDisplay = () => {
    const funcName = 'renderManagedObjectDisplay';
    const logName = `${ComponentName}.${funcName}()`;

    if(!managedObject) throw new Error(`${logName}: managedObject is undefined`);
    
    return (
      <React.Fragment>
        <div className="p-col-12">
          <div className="user-view">
            <div className="detail-left">
              <div><b>Activated</b>: {String(managedObject.apsUserResponse.isActivated)}</div>

              <TabView className="p-mt-4" activeIndex={tabActiveIndex} onTabChange={(e) => setTabActiveIndex(e.index)}>
                <TabPanel header='Profile'>
                  <APDisplayUserProfile 
                    apsUserProfile={managedObject.apsUserResponse.profile}
                    // header="Profile"
                  />
                </TabPanel>
                <TabPanel header='Roles & Groups'>
                  <React.Fragment>
                    { AuthHelper.isAuthorizedToAccessResource(authContext.authorizedResourcePathsAsString, EUIAdminPortalResourcePaths.ManageSystemUsers) &&
                      <div><b>System Roles</b>: {renderSystemRoles(managedObject.apSystemRoleEntityIdList)}</div>
                    }
                    <div className="p-mt-2"><b>Legacy Organzation Roles</b>: {renderLegacyOrganzationRoles(managedObject.apLegacy_MemberOfOrganizationRolesDisplayList)}.</div>                    
                    <APDisplayOrganizationBusinessGroups
                      organizationEntityId={props.organizationEntityId}
                      completeOrganizationApBusinessGroupDisplayList={completeOrganizationApBusinessGroupDisplayList}
                      apMemberOfOrganizationGroupsDisplayList={APUsersDisplayService.find_ApMemberOfBusinessGroupDisplayList({
                        organizationId: props.organizationEntityId.id,
                        apUserDisplay: managedObject
                      })}
                      className="card p-mt-2"
                    />

                  </React.Fragment>
                </TabPanel>
                <TabPanel header='Assets'>
                  <React.Fragment>
                    <APDisplayOrganizationAssetInfoDisplayList
                      apOrganizationAssetInfoDisplay={APAssetDisplayService.find_ApOrganizationAssetInfoDisplay({
                        organizationId: props.organizationEntityId.id,
                        apOrganizationAssetInfoDisplayList: managedObject.apOrganizationAssetInfoDisplayList
                      })}
                      className="p-pt-2"
                    />
                  </React.Fragment>
                </TabPanel>
              </TabView>
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

      {managedObject && completeOrganizationApBusinessGroupDisplayList.length > 0 && renderManagedObjectDisplay() }

      {/* DEBUG */}
      {/* <pre style={ { fontSize: '12px' }} >
        {JSON.stringify(managedObject, null, 2)}
      </pre> */}

    </div>
  );
}
