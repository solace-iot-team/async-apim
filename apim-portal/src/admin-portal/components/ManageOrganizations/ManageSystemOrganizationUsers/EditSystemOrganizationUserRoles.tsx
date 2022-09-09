
import React from "react";
import { useHistory } from 'react-router-dom';

import { Dialog } from "primereact/dialog";

import { ApiCallState, TApiCallState } from "../../../../utils/ApiCallState";
import { APSClientOpenApi } from "../../../../utils/APSClientOpenApi";
import { ApiCallStatusError } from "../../../../components/ApiCallStatusError/ApiCallStatusError";
import { TAPEntityId } from "../../../../utils/APEntityIdsService";
import { UserContext } from "../../../../components/APContextProviders/APUserContextProvider";
import { AuthContext } from "../../../../components/APContextProviders/AuthContextProvider";
import { OrganizationContext } from "../../../../components/APContextProviders/APOrganizationContextProvider";
import { SessionContext } from "../../../../components/APContextProviders/APSessionContextProvider";
import { EUICommonResourcePaths } from "../../../../utils/Globals";
import APOrganizationUsersDisplayService, { TAPOrganizationUserDisplay } from "../../../../displayServices/APUsersDisplayService/APOrganizationUsersDisplayService";
import { EditOrganizationUserOrganizationRoles, EEditOrganzationUserOrganizationRolesAction } from "../../ManageOrganizationUsers/EditNewOrganizationUser/EditOrganizationUserOrganizationRoles";
import APContextsDisplayService from "../../../../displayServices/APContextsDisplayService";
import { E_CALL_STATE_ACTIONS_USERS } from "../ManageOrganizationsCommon";

import '../../../../components/APComponents.css';
import "../ManageOrganizations.css";

export interface IEditSystemOrganizationUserRolesProps {
  organizationEntityId: TAPEntityId;
  userEntityId: TAPEntityId;
  onError: (apiCallState: TApiCallState) => void;
  onSaveSuccess: (apiCallState: TApiCallState) => void;
  onCancel: () => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const EditSystemOrganizationUserRoles: React.FC<IEditSystemOrganizationUserRolesProps> = (props: IEditSystemOrganizationUserRolesProps) => {
  const ComponentName = 'EditSystemOrganizationUserRoles';

  type TManagedObject = TAPOrganizationUserDisplay;

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
  // const [tabActiveIndex, setTabActiveIndex] = React.useState(0);
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);

  const navigateTo = (path: string): void => { history.push(path); }

  // * Api Calls *
  const apiGetManagedObject = async(userEntityId: TAPEntityId): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObject';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS_USERS.API_GET_USER, `retrieve details for user: ${userEntityId.id}`);
    try { 
      const apUserDisplay: TAPOrganizationUserDisplay = await APOrganizationUsersDisplayService.apsGet_ApOrganizationUserDisplay({
        organizationEntityId: props.organizationEntityId,
        userId: userEntityId.id,
        fetch_ApOrganizationAssetInfoDisplayList: false,
      });
      setManagedObject(apUserDisplay);
    } catch(e: any) {
      APSClientOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  // const apiLogout = async(userEntityId: TAPEntityId): Promise<TApiCallState> => {
  //   const funcName = 'apiLogout';
  //   const logName = `${ComponentName}.${funcName}()`;
  //   let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS_USERS.API_USER_LOGOUT, `logout user: ${userEntityId.id}`);
  //   try { 
  //     await APLoginUsersDisplayService.apsLogout({
  //       userId: userEntityId.id
  //     });
  //   } catch(e: any) {
  //     APSClientOpenApi.logError(logName, e);
  //     callState = ApiCallState.addErrorToApiCallState(e, callState);
  //   }
  //   setApiCallStatus(callState);
  //   return callState;
  // }

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
    // await apiLogout(props.userEntityId);
  }

  const doInitialize = async () => {
    props.onLoadingChange(true);
    await apiGetManagedObject(props.userEntityId);
    props.onLoadingChange(false);
  }

  // * useEffect Hooks *

  React.useEffect(() => {
    if(userContext.apLoginUserDisplay.apEntityId.id === props.userEntityId.id) setEditingYourself(true);
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) {
        if(apiCallStatus.context.action === E_CALL_STATE_ACTIONS_USERS.API_GET_USER) props.onError(apiCallStatus);
      }
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const onEditRolesSuccess = (apiCallState: TApiCallState) => {
    // re-map call state to this component
    const callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS_USERS.API_UPDATE_USER_ROLES, `update user roles for: ${props.userEntityId.id}`);
    props.onSaveSuccess(callState);
    doLogoutEditedUser();
  }

  const onEditRolesError = (apiCallState: TApiCallState) => {
    setApiCallStatus(apiCallState);
  }


  const renderEditDialog = (mo: TManagedObject) => {
    // const funcName = 'renderEditDialog';
    // const logName = `${ComponentName}.${funcName}()`;
   
    const dialogHeader = `Edit Organization Role(s) for user: ${props.userEntityId.id}`;

    return (
      <Dialog
        className="p-fluid"
        visible={true} 
        style={{ width: '60%' }} 
        header={dialogHeader}
        modal
        closable={true}
        onHide={()=> { props.onCancel(); }}
      >
        <ApiCallStatusError apiCallStatus={apiCallStatus} />

        {editingYourself && 
          <div className="p-mb-4" style={{ color: 'red'}}><b>Warning</b>: {EditingYourselfMessage}</div>
        }

        <EditOrganizationUserOrganizationRoles
          action={EEditOrganzationUserOrganizationRolesAction.EDIT_AND_SAVE}
          apOrganizationUserDisplay={mo}
          onSaveSuccess={onEditRolesSuccess}
          onCancel={props.onCancel}
          onError={onEditRolesError}
          onLoadingChange={props.onLoadingChange}
        />

      </Dialog>
    );
  }

  
  return (
    <div className="manage-users">

      {managedObject && 
        renderEditDialog(managedObject)
      }
    </div>
  );
}
