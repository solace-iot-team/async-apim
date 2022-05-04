
import React from "react";
import { useHistory } from 'react-router-dom';

import { Dialog } from "primereact/dialog";

import { TAPEntityId } from "../../../../../utils/APEntityIdsService";
import { ApiCallState, TApiCallState } from "../../../../../utils/ApiCallState";
import { ApiCallStatusError } from "../../../../../components/ApiCallStatusError/ApiCallStatusError";
import { EditOrganizationUserOrganizationRoles, EEditOrganzationUserOrganizationRolesAction } from "../../../ManageOrganizationUsers/EditNewOrganizationUser/EditOrganizationUserOrganizationRoles";
import APOrganizationUsersDisplayService, { TAPOrganizationUserDisplay } from "../../../../../displayServices/APUsersDisplayService/APOrganizationUsersDisplayService";
import { TAPSystemUserDisplay } from "../../../../../displayServices/APUsersDisplayService/APSystemUsersDisplayService";
import { UserContext } from "../../../../../components/APContextProviders/APUserContextProvider";
import { AuthContext } from "../../../../../components/AuthContextProvider/AuthContextProvider";
import { OrganizationContext } from "../../../../../components/APContextProviders/APOrganizationContextProvider";
import { APSClientOpenApi } from "../../../../../utils/APSClientOpenApi";
import APMemberOfService, { TAPMemberOfOrganizationDisplay } from "../../../../../displayServices/APUsersDisplayService/APMemberOfService";
import { EUICommonResourcePaths } from "../../../../../utils/Globals";
import APLoginUsersDisplayService from "../../../../../displayServices/APUsersDisplayService/APLoginUsersDisplayService";
import APContextsDisplayService from "../../../../../displayServices/APContextsDisplayService";

import '../../../../../components/APComponents.css';
import "../../ManageOrganizations.css";
import { E_CALL_STATE_ACTIONS_USERS } from "../../ManageOrganizationsCommon";

export interface IAddSystemOrganizationUserRolesProps {
  apSystemUserDisplay: TAPSystemUserDisplay;
  organizationEntityId: TAPEntityId;
  onError: (apiCallState: TApiCallState) => void;
  onAddSuccess: (apiCallState: TApiCallState) => void;
  onCancel: () => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const AddSystemOrganizationUserRoles: React.FC<IAddSystemOrganizationUserRolesProps> = (props: IAddSystemOrganizationUserRolesProps) => {
  const ComponentName = 'AddSystemOrganizationUserRoles';

  type TManagedObject = TAPOrganizationUserDisplay;

  const EditingYourselfMessage = 'You are editing yourself. You will need to login again afterwards.';
  const RolesNotValid_UserMessage = 'Specify at least 1 role.';
  const history = useHistory();

  const [managedObject, setManagedObject] = React.useState<TManagedObject>();
  const [userContext, dispatchUserContextAction] = React.useContext(UserContext);
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const [authContext, dispatchAuthContextAction] = React.useContext(AuthContext);
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const [organizationContext, dispatchOrganizationContextAction] = React.useContext(OrganizationContext);
  const [editingYourself, setEditingYourself] = React.useState<boolean>(false);
  // const [tabActiveIndex, setTabActiveIndex] = React.useState(0);
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [validationMessage, setValidationMessage] = React.useState<string>();

  const navigateTo = (path: string): void => { history.push(path); }

  // * Api Calls *
  const apiGetManagedObject = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObject';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS_USERS.API_CREATE_ORGANIZATION_USER_FROM_SYSTEM_USER, `retrieve details for user: ${props.apSystemUserDisplay.apEntityId.id}`);
    try { 
      const apOrganizationUserDisplay: TAPOrganizationUserDisplay = await APOrganizationUsersDisplayService.create_ApOrganizationUserDisplay_From_ApSystemUserDisplay({
        organizationEntityId: props.organizationEntityId,
        apSystemUserDisplay: props.apSystemUserDisplay,
      });
      setManagedObject(apOrganizationUserDisplay);  
    } catch(e: any) {
      APSClientOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const apiUpdateManagedObject = async(mo: TManagedObject): Promise<TApiCallState> => {
    const funcName = 'apiUpdateManagedObject';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS_USERS.API_ADD_USER_TO_ORG, `add user: ${mo.apEntityId.id}`);
    try {
      // console.log(`${logName}: mo.memberOfOrganizationDisplay = ${JSON.stringify(mo.memberOfOrganizationDisplay, null, 2)}`);
      await APOrganizationUsersDisplayService.apsUpdate_ApMemberOf({ 
        apOrganizationUserDisplay: mo,
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
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS_USERS.API_USER_LOGOUT, `logout user: ${userEntityId.id}`);
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
      });
      navigateTo(EUICommonResourcePaths.Login);
    }
    await apiLogout(props.apSystemUserDisplay.apEntityId);
  }

  const doInitialize = async () => {
    props.onLoadingChange(true);
    await apiGetManagedObject();
    props.onLoadingChange(false);
  }

  const doUpdateUser = async () => {
    const funcName = 'doUpdateUser';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);
    props.onLoadingChange(true);
    await apiUpdateManagedObject(managedObject);
    props.onLoadingChange(false);
    doLogoutEditedUser();
  }

  // * useEffect Hooks *

  React.useEffect(() => {
    if(userContext.apLoginUserDisplay.apEntityId.id === props.apSystemUserDisplay.apEntityId.id) setEditingYourself(true);
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) {
        if(apiCallStatus.context.action === E_CALL_STATE_ACTIONS_USERS.API_CREATE_ORGANIZATION_USER_FROM_SYSTEM_USER) props.onError(apiCallStatus);
      }
      else {
        // re-map call state to parent component
        const callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS_USERS.API_UPDATE_USER_ROLES, `add user to organization: ${props.apSystemUserDisplay.apEntityId.id}`);
        if(apiCallStatus.context.action === E_CALL_STATE_ACTIONS_USERS.API_ADD_USER_TO_ORG) props.onAddSuccess(callState);
      }
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const onEditRolesSuccess = (updated_ApMemberOfOrganizationDisplay: TAPMemberOfOrganizationDisplay) => {
    const funcName = 'onEditRolesSuccess';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);
    
    setValidationMessage(undefined);

    const newApUserDisplay: TAPOrganizationUserDisplay = APOrganizationUsersDisplayService.set_ApMemberOfOrganizationDisplay({
      apOrganizationUserDisplay: managedObject,
      apMemberOfOrganizationDisplay: updated_ApMemberOfOrganizationDisplay
    });

    // calculate the legacy org roles for display 
    newApUserDisplay.memberOfOrganizationDisplay.apLegacyOrganizationRoleEntityIdList = APMemberOfService.create_ApLegacyOrganizationRoleEntityIdList({
      apOrganizationUserMemberOfOrganizationDisplay: newApUserDisplay.memberOfOrganizationDisplay,
    });

    if(!APOrganizationUsersDisplayService.validate_MemberOf_Roles({ apOrganizationUserDisplay: managedObject })) {
      setValidationMessage(RolesNotValid_UserMessage);
      return;
    }
    setValidationMessage(undefined);
    doUpdateUser();
  }

  const onEditRolesError = (apiCallState: TApiCallState) => {
    setApiCallStatus(apiCallState);
  }

  const renderValidationMessage = () => {
    if(validationMessage !== undefined) return(
      <div className="p-mt-4 p-ml-2" style={{ color: 'red' }}>
        <b>{validationMessage}</b>
      </div>
    );
  }

  const renderEditDialog = (mo: TManagedObject) => {
   
    const dialogHeader = `Specify Organization Role(s) for user: ${props.apSystemUserDisplay.apEntityId.id}`;

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

        {renderValidationMessage()}

        <EditOrganizationUserOrganizationRoles
          action={EEditOrganzationUserOrganizationRolesAction.EDIT_AND_RETURN_NO_VALIDATION}
          apOrganizationUserDisplay={mo}
          onEditSuccess={onEditRolesSuccess}
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
