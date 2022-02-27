
import React from "react";

import APEntityIdsService from "../../../utils/APEntityIdsService";
import { 
  TAPMemberOfBusinessGroupTreeNodeDisplay, 
} from "../../../displayServices/APUsersDisplayService";

import "../../APComponents.css";

export interface IAPDisplayOrganizationBusinessGroupRolesProps {
  apMemberOfBusinessGroupTreeNodeDisplay: TAPMemberOfBusinessGroupTreeNodeDisplay;
  className?: string;
}

export const APDisplayOrganizationBusinessGroupRoles: React.FC<IAPDisplayOrganizationBusinessGroupRolesProps> = (props: IAPDisplayOrganizationBusinessGroupRolesProps) => {
  // const ComponentName='APDisplayOrganizationBusinessGroupRoles';

  const renderComponent = (node: TAPMemberOfBusinessGroupTreeNodeDisplay): JSX.Element => {
    const configured = node.data.apConfiguredBusinessGroupRoleEntityIdList.length > 0 ? APEntityIdsService.getSortedDisplayNameList_As_String(node.data.apConfiguredBusinessGroupRoleEntityIdList) : 'None.';
    const resulting = node.data.apCalculatedBusinessGroupRoleEntityIdList.length > 0 ? APEntityIdsService.getSortedDisplayNameList_As_String(node.data.apCalculatedBusinessGroupRoleEntityIdList) : 'None.';
    return (
      <React.Fragment>
        <div>Configured: {configured}</div>
        {node.data.apBusinessGroupDisplay.apBusinessGroupParentEntityId !== undefined &&
          <div>Calculated: {resulting}</div>
        }
      </React.Fragment>
    );
  }

  return (
    <div className={props.className ? props.className : 'card'}>
      { renderComponent(props.apMemberOfBusinessGroupTreeNodeDisplay) }
    </div>
  );
}
