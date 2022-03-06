
import React from "react";

import { TApiCallState } from "../../../../utils/ApiCallState";
import { ManageListOrganizationUserMemberOfBusinessGroups } from "./ManageListOrganizationUserMemberOfBusinessGroups";
import { TAPOrganizationUserDisplay } from "../../../../displayServices/APUsersDisplayService/APOrganizationUsersDisplayService";

import '../../../../components/APComponents.css';
import "../ManageOrganizationUsers.css";

export interface IEditOrganizationUserMemberOfBusinessGroupsProps {
  apOrganizationUserDisplay: TAPOrganizationUserDisplay;
  onError: (apiCallState: TApiCallState) => void;
  onSaveSuccess: (apiCallState: TApiCallState) => void;
  onCancel: () => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const EditOrganizationUserMemberOfBusinessGroups: React.FC<IEditOrganizationUserMemberOfBusinessGroupsProps> = (props: IEditOrganizationUserMemberOfBusinessGroupsProps) => {
  // const ComponentName = 'EditOrganizationUserMemberOfBusinessGroups';

  const renderManagedObject = () => {
    return (
      <React.Fragment>
        <ManageListOrganizationUserMemberOfBusinessGroups
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
      { renderManagedObject() }
    </div>
  );

}
