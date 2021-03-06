
import React from "react";

import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Divider } from "primereact/divider";

import APEntityIdsService, { 
  TAPEntityIdList,  
} from "../../../../utils/APEntityIdsService";
import { TApiCallState } from "../../../../utils/ApiCallState";
import { 
  EditOrganizationUserOrganizationRoles, 
  EEditOrganzationUserOrganizationRolesAction 
} from "./EditOrganizationUserOrganizationRoles";
import APOrganizationUsersDisplayService, { 
  TAPOrganizationUserDisplay, 
} from "../../../../displayServices/APUsersDisplayService/APOrganizationUsersDisplayService";
import { TAPMemberOfOrganizationDisplay } from "../../../../displayServices/APUsersDisplayService/APMemberOfService";

import '../../../../components/APComponents.css';
import "../ManageOrganizationUsers.css";

export interface INewManageOrganizationUserMemberOfOrganizationRolesProps {
  apOrganizationUserDisplay: TAPOrganizationUserDisplay;
  onError: (apiCallState: TApiCallState) => void;
  onEditSuccess: (updated_ApMemberOfOrganizationDisplay: TAPMemberOfOrganizationDisplay) => void;
  onCancel: () => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const NewManageOrganizationUserMemberOfOrganizationRoles: React.FC<INewManageOrganizationUserMemberOfOrganizationRolesProps> = (props: INewManageOrganizationUserMemberOfOrganizationRolesProps) => {
  const ComponentName = 'NewManageOrganizationUserMemberOfOrganizationRoles';

  const [showEditDialog, setShowEditDialog] = React.useState<boolean>(false);
  const [showRemoveDialog, setShowRemoveDialog] = React.useState<boolean>(false);

  const onEdit = () => {
    setShowEditDialog(true);
  }

  const onRemove = () => {
    setShowRemoveDialog(true);
  }

  const renderComponent = (): JSX.Element => {
    const organizationRoleEntityIdList: TAPEntityIdList = APOrganizationUsersDisplayService.get_ApOrganizationRoleEntityIdList({ apOrganizationUserDisplay: props.apOrganizationUserDisplay});
    const orgRolesString = organizationRoleEntityIdList.length > 0 ? APEntityIdsService.create_DisplayNameList(organizationRoleEntityIdList).join(', ') : 'None.';
    
    // alert(`${ComponentName}: rendering, orgRolesString=${orgRolesString}`);
    
    const isRemovePossible: boolean = organizationRoleEntityIdList.length > 0;
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
                <Button key={ComponentName+'Edit'} icon="pi pi-pencil" className="p-button-text p-button-plain" onClick={() => onEdit()}/>
                <Button key={ComponentName+'Remove'} icon="pi pi-times" className="p-button-text p-button-plain" onClick={() => onRemove()} disabled={!isRemovePossible}/>
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
  const onEditSuccess = (update_ApMemberOfOrganizationDisplay: TAPMemberOfOrganizationDisplay) => {
    setShowEditDialog(false);
    props.onEditSuccess(update_ApMemberOfOrganizationDisplay);
  }

  const renderEditDialog = () => {

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
        <React.Fragment>
          <EditOrganizationUserOrganizationRoles
            action={EEditOrganzationUserOrganizationRolesAction.EDIT_AND_RETURN_NO_VALIDATION}
            apOrganizationUserDisplay={props.apOrganizationUserDisplay}
            onEditSuccess={onEditSuccess}
            onCancel={onEditCancel}
            onError={props.onError}
            onLoadingChange={props.onLoadingChange}
          />
        </React.Fragment>
      </Dialog>
    );
  }

  const onRemoveCancel = () => {
    setShowRemoveDialog(false);
  }
  const onRemoveSuccess = (update_ApMemberOfOrganizationDisplay: TAPMemberOfOrganizationDisplay) => {
    setShowRemoveDialog(false);
    props.onEditSuccess(update_ApMemberOfOrganizationDisplay);
  }

  const renderRemoveDialog = () => {

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
        <React.Fragment>
          <EditOrganizationUserOrganizationRoles
            action={EEditOrganzationUserOrganizationRolesAction.REMOVE_AND_RETURN_NO_VALIDATION}
            apOrganizationUserDisplay={props.apOrganizationUserDisplay}
            onEditSuccess={onRemoveSuccess}
            onCancel={onRemoveCancel}
            onError={props.onError}
            onLoadingChange={props.onLoadingChange}
          />
        </React.Fragment>
      </Dialog>
    );
  }

  return (
    <div className="manage-users">

      {/* {managedObject && 
        renderComponent()
      } */}

      { renderComponent() }

      {showEditDialog &&
        renderEditDialog()
      }

      {showRemoveDialog &&
        renderRemoveDialog()
      }

    </div>
  );

}
