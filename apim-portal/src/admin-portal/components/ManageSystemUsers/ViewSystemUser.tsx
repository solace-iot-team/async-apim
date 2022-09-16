
import React from "react";

import { MenuItem, MenuItemCommandParams } from "primereact/api";
import { Divider } from "primereact/divider";

import { APComponentHeader } from "../../../components/APComponentHeader/APComponentHeader";
import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { APSClientOpenApi } from "../../../utils/APSClientOpenApi";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { AuthHelper } from "../../../auth/AuthHelper";
import { AuthContext } from "../../../components/APContextProviders/AuthContextProvider";
import { EUIAdminPortalResourcePaths } from "../../../utils/Globals";
import APEntityIdsService, { 
  TAPEntityId, 
  TAPEntityIdList 
} from "../../../utils/APEntityIdsService";
import { APDisplayUserProfile } from "../../../components/APDisplay/APDisplayUserProfile";
import { E_CALL_STATE_ACTIONS, E_COMPONENT_STATE } from "./ManageSystemUsersCommon";
import APSystemUsersDisplayService, { TAPSystemUserDisplay } from "../../../displayServices/APUsersDisplayService/APSystemUsersDisplayService";
import { APDisplayUserOrganizationRoles } from "../../../components/APDisplay/APDisplayUserOrganizationRoles";

import '../../../components/APComponents.css';
import "./ManageSystemUsers.css";

export interface IViewSystemUserProps {
  userEntityId: TAPEntityId;
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
  setBreadCrumbItemList: (itemList: Array<MenuItem>) => void;
  onNavigateHere: (componentState: E_COMPONENT_STATE, userEntityId: TAPEntityId) => void;
}

export const ViewSystemUser: React.FC<IViewSystemUserProps> = (props: IViewSystemUserProps) => {
  const ComponentName = 'ViewSystemUser';

  type TManagedObject = TAPSystemUserDisplay;

  const [authContext] = React.useContext(AuthContext); 
  const [managedObject, setManagedObject] = React.useState<TManagedObject>();  
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);

  // * Api Calls *
  const apiGetManagedObject = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObject';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_USER, `retrieve details for user: ${props.userEntityId.id}`);
    try { 
      const apUserDisplay: TAPSystemUserDisplay = await APSystemUsersDisplayService.apsGet_ApSystemUserDisplay({
        userId: props.userEntityId.id,
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

  const renderManagedObjectDisplay = () => {
    const funcName = 'renderManagedObjectDisplay';
    const logName = `${ComponentName}.${funcName}()`;

    if(managedObject === undefined) throw new Error(`${logName}: managedObject is undefined`);

    return (
      <React.Fragment>
        <div className="p-col-12">
          <div className="user-view">
            <div className="detail-left">

              <div><b>Activation Status</b>: {APSystemUsersDisplayService.get_ApUserActivationDisplay({apUserDisplay: managedObject}).activationStatusDisplayString}</div>

              <Divider />

              <APDisplayUserProfile
                apUserProfileDisplay={APSystemUsersDisplayService.get_ApUserProfileDisplay({ apUserDisplay: managedObject })}
              />

              <Divider />

              { AuthHelper.isAuthorizedToAccessResource(authContext.authorizedResourcePathsAsString, EUIAdminPortalResourcePaths.ManageSystemUsers) &&
                <div><b>System Roles</b>: {renderSystemRoles(managedObject.apSystemRoleEntityIdList)}</div>
              }

              <div><b>Organizations</b>:</div>
              <APDisplayUserOrganizationRoles
                apMemberOfOrganizationDisplayList={managedObject.apMemberOfOrganizationDisplayList}
                className="p-mt-2"
                displayInPanel={false}
              />

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

      {managedObject && renderManagedObjectDisplay() }

      {/* DEBUG */}
      {/* <pre style={ { fontSize: '12px' }} >
        {JSON.stringify(managedObject, null, 2)}
      </pre> */}

    </div>
  );
}
