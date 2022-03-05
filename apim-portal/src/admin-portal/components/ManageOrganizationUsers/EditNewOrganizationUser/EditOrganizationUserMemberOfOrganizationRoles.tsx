
import React from "react";
import { TApiCallState } from "../../../../utils/ApiCallState";
import { ManageOrganizationUserMemberOfOrganizationRoles } from "./ManageOrganizationUserMemberOfOrganizationRoles";
import { TAPOrganizationUserDisplay } from "../../../../displayServices/APUsersDisplayService/APOrganizationUsersDisplayService";

import '../../../../components/APComponents.css';
import "../ManageOrganizationUsers.css";

export interface IEditOrganizationUserMemberOfOrganizationRolesProps {
  apOrganizationUserDisplay: TAPOrganizationUserDisplay;
  onError: (apiCallState: TApiCallState) => void;
  onSaveSuccess: (apiCallState: TApiCallState) => void;
  onCancel: () => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const EditOrganizationUserMemberOfOrganizationRoles: React.FC<IEditOrganizationUserMemberOfOrganizationRolesProps> = (props: IEditOrganizationUserMemberOfOrganizationRolesProps) => {
  // const ComponentName = 'EditOrganizationUserMemberOfOrganizationRoles';

  const renderManagedObject = () => {
    return (
      <React.Fragment>
        <ManageOrganizationUserMemberOfOrganizationRoles
          organizationEntityId={props.apOrganizationUserDisplay.organizationEntityId}
          userEntityId={props.apOrganizationUserDisplay.apEntityId}
          onError={props.onError}
          onCancel={props.onCancel}
          onSaveSuccess={props.onSaveSuccess}
          onLoadingChange={props.onLoadingChange}        
        />
      </React.Fragment>
    );
  }
  
  return (
    <div className="manage-users">
      {renderManagedObject()}
    </div>
  );
}
