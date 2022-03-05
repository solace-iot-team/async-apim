
import React from "react";

import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Divider } from "primereact/divider";

import APEntityIdsService, { 
  TAPEntityId,  
} from "../../../../utils/APEntityIdsService";
import { ApiCallState, TApiCallState } from "../../../../utils/ApiCallState";
import { E_CALL_STATE_ACTIONS } from "../ManageOrganizationUsersCommon";
import { APSClientOpenApi } from "../../../../utils/APSClientOpenApi";
import { ApiCallStatusError } from "../../../../components/ApiCallStatusError/ApiCallStatusError";
import { 
  EditOrganizationUserOrganizationRoles, 
  EEditOrganzationUserOrganizationRolesAction 
} from "./EditOrganizationUserOrganizationRoles";
import APOrganizationUsersDisplayService, { 
  TAPOrganizationUserDisplay, 
  TAPOrganizationUserMemberOfOrganizationDisplay, 
} from "../../../../displayServices/APUsersDisplayService/APOrganizationUsersDisplayService";

import '../../../../components/APComponents.css';
import "../ManageOrganizationUsers.css";

export interface IManageOrganizationUserMemberOfOrganizationRolesProps {
  organizationEntityId: TAPEntityId;
  userEntityId: TAPEntityId;
  onError: (apiCallState: TApiCallState) => void;
  onSaveSuccess: (apiCallState: TApiCallState) => void;
  onCancel: () => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const ManageOrganizationUserMemberOfOrganizationRoles: React.FC<IManageOrganizationUserMemberOfOrganizationRolesProps> = (props: IManageOrganizationUserMemberOfOrganizationRolesProps) => {
  const ComponentName = 'ManageOrganizationUserMemberOfOrganizationRoles';

  type TManagedObject = TAPOrganizationUserMemberOfOrganizationDisplay;

  const [apUserDisplay, setApUserDisplay] = React.useState<TAPOrganizationUserDisplay>();
  const [managedObject, setManagedObject] = React.useState<TManagedObject>();
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [showEditDialog, setShowEditDialog] = React.useState<boolean>(false);
  const [showRemoveDialog, setShowRemoveDialog] = React.useState<boolean>(false);

  // * Api Calls *
  const apiGetManagedObject = async(userEntityId: TAPEntityId): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObject';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_USER, `retrieve details for user: ${userEntityId.id}`);
    try { 
      const apUserDisplay: TAPOrganizationUserDisplay = await APOrganizationUsersDisplayService.apsGet_ApOrganizationUserDisplay({
        organizationEntityId: props.organizationEntityId,
        userId: userEntityId.id,
        fetch_ApOrganizationAssetInfoDisplayList: false,
      });
      setApUserDisplay(apUserDisplay);
      setManagedObject(APOrganizationUsersDisplayService.get_ApOrganizationUserMemberOfOrganizationDisplay({ apOrganizationUserDisplay: apUserDisplay }));
    } catch(e: any) {
      APSClientOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const doInitialize = async () => {
    props.onLoadingChange(true);
    await apiGetManagedObject(props.userEntityId);
    props.onLoadingChange(false);
  }

  // * useEffect Hooks *

  React.useEffect(() => {
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
      else {
        if(apiCallStatus.context.action === E_CALL_STATE_ACTIONS.API_UPDATE_ORGANIZATION_ROLES) props.onSaveSuccess(apiCallStatus);
      }
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const onEdit = (mo: TManagedObject) => {
    setShowEditDialog(true);
  }

  const onRemove = (mo: TManagedObject) => {
    setShowRemoveDialog(true);
  }

  const renderComponent = (): JSX.Element => {
    const funcName = 'renderComponent';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);
    const orgRolesString = managedObject.apOrganizationRoleEntityIdList.length > 0 ? APEntityIdsService.create_DisplayNameList(managedObject.apOrganizationRoleEntityIdList).join(', ') : 'None.';
    const isRemovePossible: boolean = managedObject.apOrganizationRoleEntityIdList.length > 0;
    return (
      <React.Fragment>
        <div className="p-col-12"  style={{ padding: 'none' }}>
          <Divider />
          <div className="org-roles-view">
            <div className="detail-left p-as-center">
              <div><b>Organization Roles</b>: {orgRolesString}</div>
            </div>
            <div className="detail-right">
              <div className="p-ml-2 p-as-center p-mr-4">
                <Button key={ComponentName+'Edit'} icon="pi pi-pencil" className="p-button-text p-button-plain" onClick={() => onEdit(managedObject)}/>
                <Button key={ComponentName+'Remove'} icon="pi pi-times" className="p-button-text p-button-plain" onClick={() => onRemove(managedObject)} disabled={!isRemovePossible}/>
              </div>
            </div>            
          </div>
          <Divider />
        </div>  
      </React.Fragment>
    );
  }

  const onEditCancel = () => {
    setShowEditDialog(false);
  }

  const onEditSaveSuccess = (apiCallState: TApiCallState) => {
    setShowEditDialog(false);
    props.onSaveSuccess(apiCallState);
  }

  const onEditError = (apiCallState: TApiCallState) => {
    setApiCallStatus(apiCallState);
    setShowEditDialog(false);
  }

  const renderEditDialog = () => {
    const funcName = 'renderEditDialog';
    const logName = `${ComponentName}.${funcName}()`;
   
    if(apUserDisplay === undefined) throw new Error(`${logName}: apUserDisplay === undefined`);
    const dialogHeader = 'Edit Organization Role(s)';

    return (
      <Dialog
        className="p-fluid"
        visible={showEditDialog} 
        style={{ width: '60%' }} 
        header={dialogHeader}
        modal
        closable={true}
        onHide={()=> { onEditCancel(); }}
      >
        <EditOrganizationUserOrganizationRoles
          action={EEditOrganzationUserOrganizationRolesAction.EDIT_AND_SAVE}
          apOrganizationUserDisplay={apUserDisplay}
          onSaveSuccess={onEditSaveSuccess}
          onCancel={onEditCancel}
          onError={onEditError}
          onLoadingChange={props.onLoadingChange}
        />
        <ApiCallStatusError apiCallStatus={apiCallStatus} />
      </Dialog>
    );
  }

  const onRemoveCancel = () => {
    setShowRemoveDialog(false);
  }

  const onRemoveSaveSuccess = (apiCallState: TApiCallState) => {
    setShowRemoveDialog(false);
    props.onSaveSuccess(apiCallState);
  }

  const onRemoveError = (apiCallState: TApiCallState) => {
    setApiCallStatus(apiCallState);
    setShowRemoveDialog(false);
  }

  const renderRemoveDialog = () => {
    const funcName = 'renderRemoveDialog';
    const logName = `${ComponentName}.${funcName}()`;
   
    if(apUserDisplay === undefined) throw new Error(`${logName}: apUserDisplay === undefined`);
    const dialogHeader = 'Remove Organization Role(s)';

    return (
      <Dialog
        className="p-fluid"
        visible={showRemoveDialog} 
        style={{ width: '60%' }} 
        header={dialogHeader}
        modal
        closable={true}
        onHide={()=> { onRemoveCancel(); }}
      >
        <EditOrganizationUserOrganizationRoles
          action={EEditOrganzationUserOrganizationRolesAction.REMOVE_AND_SAVE}
          apOrganizationUserDisplay={apUserDisplay}
          onSaveSuccess={onRemoveSaveSuccess}
          onCancel={onRemoveCancel}
          onError={onRemoveError}
          onLoadingChange={props.onLoadingChange}
        />
        <ApiCallStatusError apiCallStatus={apiCallStatus} />
      </Dialog>
    );
  }

  return (
    <div className="manage-users">

      {managedObject && 
        renderComponent()
      }

      {showEditDialog &&
        renderEditDialog()
      }

      {showRemoveDialog &&
        renderRemoveDialog()
      }

    </div>
  );

}
