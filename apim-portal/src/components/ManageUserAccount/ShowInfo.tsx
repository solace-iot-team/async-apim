
import React from "react";

import { UserContext } from "../APContextProviders/APUserContextProvider";
import { TAPLoginUserDisplay } from "../../displayServices/APUsersDisplayService/APLoginUsersDisplayService";
import { APDisplayUserProfile } from "../APDisplay/APDisplayUserProfile";
import { Divider } from "primereact/divider";
import APEntityIdsService, { TAPEntityId, TAPEntityIdList } from "../../utils/APEntityIdsService";
import { APDisplayUserOrganizationRoles } from "../APDisplay/APDisplayUserOrganizationRoles";

import "../APComponents.css";
import "./ManageUserAccount.css";

export interface IShowInfoProps {
  apLoginUserDisplay: TAPLoginUserDisplay;
}

export const ShowInfo: React.FC<IShowInfoProps> = (props: IShowInfoProps) => {
  // const ComponentName = 'ShowInfo';

  const [userContext] = React.useContext(UserContext);

  const renderSystemRoles = (apSystemRoleEntityIdList: TAPEntityIdList): string => {
    if(apSystemRoleEntityIdList.length === 0) return 'None.';
    return APEntityIdsService.getSortedDisplayNameList_As_String(apSystemRoleEntityIdList);
  }

  const renderCurrentOrganization = (currentOrganizationEntityId: TAPEntityId | undefined): JSX.Element => {
    if(currentOrganizationEntityId === undefined) return (<>None.</>);
    return (<>{currentOrganizationEntityId.displayName}</>);
  }

  const renderCurrentBusinessGroup = (currentBusinessGroupEntityId: TAPEntityId | undefined): JSX.Element => {
    if(currentBusinessGroupEntityId === undefined) return (<>None.</>);
    return (<>{currentBusinessGroupEntityId.displayName}</>);
  }

  const renderCurrentRoles = (currentRolesEntityIdList: TAPEntityIdList | undefined): JSX.Element => {
    if(currentRolesEntityIdList === undefined || currentRolesEntityIdList.length === 0) return (<>None.</>);
    return (<>{APEntityIdsService.create_DisplayNameList(APEntityIdsService.sort_byDisplayName(currentRolesEntityIdList)).join(', ')}</>);
  }

  const renderComponent = () => {

    return (
      <div className="p-col-12">
        <div className="view-user-info">
          <div><b>Id</b>: {props.apLoginUserDisplay.apEntityId.id}</div>

          <Divider />

          <APDisplayUserProfile
            apUserProfileDisplay={props.apLoginUserDisplay.apUserProfileDisplay}
          />

          <Divider />

          <div><b>System Roles</b>: {renderSystemRoles(props.apLoginUserDisplay.apSystemRoleEntityIdList)}</div>
      
          <div><b>Current Organization</b>: {renderCurrentOrganization(userContext.runtimeSettings.currentOrganizationEntityId)}</div>
          <div><b>Current Business Group</b>: {renderCurrentBusinessGroup(userContext.runtimeSettings.currentBusinessGroupEntityId)}</div>
          <div><b>Current Roles</b>: {renderCurrentRoles(userContext.runtimeSettings.currentRolesEntityIdList)}</div>
          
          <Divider />

          <div><b>Member of Organizations</b>:</div>
          <APDisplayUserOrganizationRoles
            apMemberOfOrganizationDisplayList={props.apLoginUserDisplay.apMemberOfOrganizationDisplayList}
            className="p-mt-2"
            displayInPanel={false}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="manage-user-account">

      { renderComponent() }

    </div>
  );
}
