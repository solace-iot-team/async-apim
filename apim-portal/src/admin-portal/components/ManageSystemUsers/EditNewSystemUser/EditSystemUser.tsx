
import React from "react";
import { useHistory } from 'react-router-dom';

import { MenuItem } from "primereact/api";
import { TabPanel, TabView } from "primereact/tabview";

import { APComponentHeader } from "../../../../components/APComponentHeader/APComponentHeader";
import { ApiCallState, TApiCallState } from "../../../../utils/ApiCallState";
import { APSClientOpenApi } from "../../../../utils/APSClientOpenApi";
import { ApiCallStatusError } from "../../../../components/ApiCallStatusError/ApiCallStatusError";
import { TAPEntityId, TAPEntityIdList } from "../../../../utils/APEntityIdsService";
import { UserContext } from "../../../../components/APContextProviders/APUserContextProvider";
import { AuthContext } from "../../../../components/AuthContextProvider/AuthContextProvider";
import { OrganizationContext } from "../../../../components/APContextProviders/APOrganizationContextProvider";
import { SessionContext } from "../../../../components/APContextProviders/APSessionContextProvider";
import APContextsDisplayService from "../../../../displayServices/APContextsDisplayService";
import { EUICommonResourcePaths } from "../../../../utils/Globals";
import APSystemUsersDisplayService, { 
  TAPSystemUserDisplay 
} from "../../../../displayServices/APUsersDisplayService/APSystemUsersDisplayService";
import { EAction, E_CALL_STATE_ACTIONS } from "../ManageSystemUsersCommon";
import { 
  TAPUserActivationDisplay, 
  TAPUserAuthenticationDisplay, 
  TAPUserProfileDisplay 
} from "../../../../displayServices/APUsersDisplayService/APUsersDisplayService";
import { EditNewSystemUserProfile } from "./EditNewSystemUserProfile";
import { EditNewSystemUserAuthentication } from "./EditNewSystemUserAuthentication";
import { EditNewSystemUserActivationStatus } from "./EditNewSystemUserActivationStatus";
import { EditNewSystemUserSystemRoles } from "./EditNewSystemUserSystemRoles";
import APLoginUsersDisplayService from "../../../../displayServices/APUsersDisplayService/APLoginUsersDisplayService";

import '../../../../components/APComponents.css';
import "../ManageSystemUsers.css";

export interface IEditSystemUserProps {
  userEntityId: TAPEntityId;
  onError: (apiCallState: TApiCallState) => void;
  onSaveSuccess: (apiCallState: TApiCallState) => void;
  onCancel: () => void;
  onLoadingChange: (isLoading: boolean) => void;
  setBreadCrumbItemList: (itemList: Array<MenuItem>) => void;
}

export const EditSystemUser: React.FC<IEditSystemUserProps> = (props: IEditSystemUserProps) => {
  const ComponentName = 'EditSystemUser';

  type TManagedObject = TAPSystemUserDisplay;

  const EditingYourselfMessage = 'You are editing yourself. You will need to login again afterwards.';
  const history = useHistory();

  const [managedObject, setManagedObject] = React.useState<TManagedObject>();
  const [userContext, dispatchUserContextAction] = React.useContext(UserContext);
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const [authContext, dispatchAuthContextAction] = React.useContext(AuthContext);
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const [organizationContext, dispatchOrganizationContextAction] = React.useContext(OrganizationContext);
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const [sessionContext, dispatchSessionContextAction] = React.useContext(SessionContext);
  const [editingYourself, setEditingYourself] = React.useState<boolean>(false);
  const [tabActiveIndex, setTabActiveIndex] = React.useState(0);
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);

  const navigateTo = (path: string): void => { history.push(path); }

  // * Api Calls *
  const apiGetManagedObject = async(userEntityId: TAPEntityId): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObject';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_USER, `retrieve details for user: ${userEntityId.id}`);
    try { 
      const apUserDisplay: TAPSystemUserDisplay = await APSystemUsersDisplayService.apsGet_ApSystemUserDisplay({
        userId: userEntityId.id,
      });
      setManagedObject(apUserDisplay);
    } catch(e: any) {
      APSClientOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const apiUpdateUserProfile = async(apUserProfileDisplay: TAPUserProfileDisplay): Promise<TApiCallState> => {
    const funcName = 'apiUpdateUserProfile';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_UPDATE_USER, `update profile for user: ${props.userEntityId.id}`);
    try {
      await APSystemUsersDisplayService.apsUpdate_ApUserProfileDisplay({
        apUserProfileDisplay: apUserProfileDisplay,
      });
    } catch(e: any) {
      APSClientOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const apiUpdateUserAuthentication = async(apUserAuthenticationDisplay: TAPUserAuthenticationDisplay): Promise<TApiCallState> => {
    const funcName = 'apiUpdateUserAuthentication';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_UPDATE_USER, `update authentication for user: ${props.userEntityId.id}`);
    try {
      await APSystemUsersDisplayService.apsUpdate_ApUserAuthenticationDisplay({
        userId: props.userEntityId.id,
        apUserAuthenticationDisplay: apUserAuthenticationDisplay
      });
    } catch(e: any) {
      APSClientOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const apiUpdateUserSystemRoles = async(apSystemRoleEntityIdList: TAPEntityIdList): Promise<TApiCallState> => {
    const funcName = 'apiUpdateUserSystemRoles';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_UPDATE_USER, `update system roles for user: ${props.userEntityId.id}`);
    try {
      await APSystemUsersDisplayService.apsUpdate_ApSystemRoleEntityIdList({
        userId: props.userEntityId.id,
        apSystemRoleEntityIdList: apSystemRoleEntityIdList,
      });
    } catch(e: any) {
      APSClientOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const apiUpdateUserActivationStatus = async(apUserActivationDisplay: TAPUserActivationDisplay): Promise<TApiCallState> => {
    const funcName = 'apiUpdateUserActivationStatus';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_UPDATE_USER, `update activation status for user: ${props.userEntityId.id}`);
    try {
      await APSystemUsersDisplayService.apsUpdate_ApUserActivationDisplay({
        userId: props.userEntityId.id,
        apUserActivationDisplay: apUserActivationDisplay
      });
    } catch(e: any) {
      APSClientOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const apiLogout = async(userEntityId: TAPEntityId): Promise<TApiCallState> => {
    const funcName = 'apiLogout';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_USER_LOGOUT, `logout user: ${userEntityId.id}`);
    try { 
      await APLoginUsersDisplayService.apsLogout({
        userId: userEntityId.id
      });
    } catch(e: any) {
      APSClientOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const doLogoutEditedUser = async() => {
    if(editingYourself) {
      APContextsDisplayService.clear_LoginContexts({
        dispatchAuthContextAction: dispatchAuthContextAction,
        dispatchUserContextAction: dispatchUserContextAction,
        dispatchOrganizationContextAction: dispatchOrganizationContextAction,
        dispatchSessionContextAction: dispatchSessionContextAction,
      });
      // navigateTo(EUICommonResourcePaths.deleteme_Login);
      navigateTo(EUICommonResourcePaths.SecLogin);
    }
    await apiLogout(props.userEntityId);
  }


  const doInitialize = async () => {
    props.onLoadingChange(true);
    await apiGetManagedObject(props.userEntityId);
    props.onLoadingChange(false);
  }

  const doSaveUserProfile = async (apUserProfileDisplay: TAPUserProfileDisplay) => {
    await apiUpdateUserProfile(apUserProfileDisplay);
    doLogoutEditedUser();
  }

  const doSaveUserAuthentication = async(apUserAuthenticationDisplay: TAPUserAuthenticationDisplay) => {
    await apiUpdateUserAuthentication(apUserAuthenticationDisplay);
    doLogoutEditedUser();
  }

  const doSaveUserSystemRoles = async(apSystemRoleEntityIdList: TAPEntityIdList) => {
    await apiUpdateUserSystemRoles(apSystemRoleEntityIdList);
    doLogoutEditedUser();
  }

  const doSaveUserActivationStatus = async(apUserActivationDisplay: TAPUserActivationDisplay) => {
    await apiUpdateUserActivationStatus(apUserActivationDisplay);
    doLogoutEditedUser();
  }

  // * useEffect Hooks *

  React.useEffect(() => {
    props.setBreadCrumbItemList([{
      label: 'Edit'
    }]);
    if(userContext.apLoginUserDisplay.apEntityId.id === props.userEntityId.id) setEditingYourself(true);
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
      else {
        if(apiCallStatus.context.action === E_CALL_STATE_ACTIONS.API_UPDATE_USER) props.onSaveSuccess(apiCallStatus);
      }
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const onError_SubComponent = (apiCallState: TApiCallState) => {
    setApiCallStatus(apiCallState);
  }

  const onSaveUserProfile = (apUserProfileDisplay: TAPUserProfileDisplay) => {
    doSaveUserProfile(apUserProfileDisplay);
  }

  const onSaveUserAuthentication = (apUserAuthenticationDisplay: TAPUserAuthenticationDisplay) => {
    doSaveUserAuthentication(apUserAuthenticationDisplay);
  }
  const onSaveUserSystemRoles = (apSystemRoleEntityIdList: TAPEntityIdList) => {
    doSaveUserSystemRoles(apSystemRoleEntityIdList);
  }
  const onSaveUserActivationStatus = (apUserActivationDisplay: TAPUserActivationDisplay) => {
    doSaveUserActivationStatus(apUserActivationDisplay);
  }

  const renderContent = (mo: TManagedObject) => {
    return (
      <React.Fragment>
        {editingYourself && 
          <div className="p-mt-4" style={{ color: 'red'}}><b>Warning</b>: {EditingYourselfMessage}</div>
        }

        <TabView className="p-mt-4" activeIndex={tabActiveIndex} onTabChange={(e) => setTabActiveIndex(e.index)}>
          <TabPanel header='Profile'>
            <React.Fragment>
              <EditNewSystemUserProfile
                action={EAction.EDIT}
                apSystemUserDisplay={mo}
                onSave={onSaveUserProfile}
                onError={onError_SubComponent}
                onCancel={props.onCancel}
              />
            </React.Fragment>
          </TabPanel>
          <TabPanel header='Authentication'>
            <React.Fragment>
              <EditNewSystemUserAuthentication
                action={EAction.EDIT}
                apSystemUserDisplay={mo}
                onSave={onSaveUserAuthentication}
                onError={onError_SubComponent}
                onCancel={props.onCancel}
                onBack={() => {}}
              />
            </React.Fragment>
          </TabPanel>
          <TabPanel header='System Roles'>
            <React.Fragment>
              <EditNewSystemUserSystemRoles
                action={EAction.EDIT}
                apSystemUserDisplay={mo}
                onSave={onSaveUserSystemRoles}
                onError={onError_SubComponent}
                onCancel={props.onCancel}
                onBack={() =>{}}
              />
            </React.Fragment>
          </TabPanel>
          <TabPanel header='Activation Status'>
            <React.Fragment>
              <EditNewSystemUserActivationStatus
                action={EAction.EDIT}
                apSystemUserDisplay={mo}
                onSave={onSaveUserActivationStatus}
                onError={onError_SubComponent}
                onCancel={props.onCancel} 
                onBack={() => {}}
              />
            </React.Fragment>
          </TabPanel>
        </TabView>
      </React.Fragment>
    ); 
  }
  
  return (
    <div className="manage-users">

      <APComponentHeader header={`Edit User: ${props.userEntityId.id}`} />

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      {managedObject && 
        renderContent(managedObject)
      }
    </div>
  );
}
