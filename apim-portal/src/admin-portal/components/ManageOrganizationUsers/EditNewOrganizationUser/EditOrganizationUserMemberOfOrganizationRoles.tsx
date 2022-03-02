
import React from "react";
import { TApiCallState } from "../../../../utils/ApiCallState";
import { 
  TAPUserDisplay,
} from "../../../../displayServices/old.APUsersDisplayService";
import { TAPEntityId } from "../../../../utils/APEntityIdsService";
import { ManageOrganizationUserMemberOfOrganizationRoles } from "./ManageOrganizationUserMemberOfOrganizationRoles";

import '../../../../components/APComponents.css';
import "../ManageOrganizationUsers.css";

export interface IEditOrganizationUserMemberOfOrganizationRolesProps {
  organizationEntityId: TAPEntityId;
  apUserDisplay: TAPUserDisplay;
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
          organizationEntityId={props.organizationEntityId}
          userEntityId={props.apUserDisplay.apEntityId}
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
