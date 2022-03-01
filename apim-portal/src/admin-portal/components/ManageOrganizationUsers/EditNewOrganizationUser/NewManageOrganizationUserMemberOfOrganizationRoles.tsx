
import React from "react";

import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Divider } from "primereact/divider";

import APEntityIdsService, { 
  TAPEntityId,  
} from "../../../../utils/APEntityIdsService";
import APUsersDisplayService, { 
  TAPUserDisplay,
  TAPUserOrganizationRolesDisplay
} from "../../../../displayServices/APUsersDisplayService";
import { ApiCallState, TApiCallState } from "../../../../utils/ApiCallState";
import { E_CALL_STATE_ACTIONS } from "../ManageOrganizationUsersCommon";
import { APSClientOpenApi } from "../../../../utils/APSClientOpenApi";
import { ApiCallStatusError } from "../../../../components/ApiCallStatusError/ApiCallStatusError";
import { 
  EditOrganizationUserOrganizationRoles, 
  EEditOrganzationUserOrganizationRolesAction 
} from "./EditOrganizationUserOrganizationRoles";

import '../../../../components/APComponents.css';
import "../ManageOrganizationUsers.css";

export interface INewManageOrganizationUserMemberOfOrganizationRolesProps {
  organizationEntityId: TAPEntityId;
  apUserDisplay: TAPUserDisplay;
  onError: (apiCallState: TApiCallState) => void;
  onEditSuccess: (updatedApUserOrganizationRolesDisplay: TAPUserOrganizationRolesDisplay) => void;
  onCancel: () => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const NewManageOrganizationUserMemberOfOrganizationRoles: React.FC<INewManageOrganizationUserMemberOfOrganizationRolesProps> = (props: INewManageOrganizationUserMemberOfOrganizationRolesProps) => {
  const ComponentName = 'NewManageOrganizationUserMemberOfOrganizationRoles';

  type TManagedObject = TAPUserOrganizationRolesDisplay;

  // const [apUserDisplay, setApUserDisplay] = React.useState<TAPUserDisplay>();
  const [managedObject, setManagedObject] = React.useState<TManagedObject>();
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [showEditDialog, setShowEditDialog] = React.useState<boolean>(false);
  const [showRemoveDialog, setShowRemoveDialog] = React.useState<boolean>(false);

  const doInitialize = async () => {
    setManagedObject(APUsersDisplayService.get_ApUserOrganizationRolesDisplay({
      organizationId: props.organizationEntityId.id,
      apUserDisplay: props.apUserDisplay
    }));
  }

  // * useEffect Hooks *

  React.useEffect(() => {
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  // React.useEffect(() => {
  //   if (apiCallStatus !== null) {
  //     if(!apiCallStatus.success) props.onError(apiCallStatus);
  //     else {
  //       if(apiCallStatus.context.action === E_CALL_STATE_ACTIONS.API_UPDATE_ORGANIZATION_ROLES) props.onSaveSuccess(apiCallStatus);
  //     }
  //   }
  // }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

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
    const orgRolesString = managedObject.apOrganizationAuthRoleEntityIdList.length > 0 ? APEntityIdsService.create_DisplayNameList(managedObject.apOrganizationAuthRoleEntityIdList).join(', ') : 'None.';
    const isRemovePossible: boolean = managedObject.apOrganizationAuthRoleEntityIdList.length > 0;
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
  const onEditSuccess = (updatedApUserOrganizationRolesDisplay: TAPUserOrganizationRolesDisplay) => {
    setShowEditDialog(false);
    setManagedObject(updatedApUserOrganizationRolesDisplay);    
    props.onEditSuccess(updatedApUserOrganizationRolesDisplay);
  }

  const renderEditDialog = () => {
    const funcName = 'renderEditDialog';
    const logName = `${ComponentName}.${funcName}()`;
   
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
          action={EEditOrganzationUserOrganizationRolesAction.EDIT_AND_RETURN}
          organizationEntityId={props.organizationEntityId}
          apUserDisplay={props.apUserDisplay}
          onEditSuccess={onEditSuccess}
          onCancel={onEditCancel}
          onError={props.onError}
          onLoadingChange={props.onLoadingChange}
        />
      </Dialog>
    );
  }

  const onRemoveCancel = () => {
    setShowRemoveDialog(false);
  }
  const onRemoveSuccess = (updatedApUserOrganizationRolesDisplay: TAPUserOrganizationRolesDisplay) => {
    setShowRemoveDialog(false);
    setManagedObject(updatedApUserOrganizationRolesDisplay);    
    props.onEditSuccess(updatedApUserOrganizationRolesDisplay);
  }

  const renderRemoveDialog = () => {
    const funcName = 'renderRemoveDialog';
    const logName = `${ComponentName}.${funcName}()`;
   
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
          action={EEditOrganzationUserOrganizationRolesAction.REMOVE_AND_RETURN}
          organizationEntityId={props.organizationEntityId}
          apUserDisplay={props.apUserDisplay}
          onEditSuccess={onRemoveSuccess}
          onCancel={onRemoveCancel}
          onError={props.onError}
          onLoadingChange={props.onLoadingChange}

          // apUserDisplay={apUserDisplay}
          // onSaveSuccess={onRemoveSaveSuccess}
          // onCancel={onRemoveCancel}
          // onError={onRemoveError}
          // onLoadingChange={props.onLoadingChange}
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
