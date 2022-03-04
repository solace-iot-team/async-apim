
import React from "react";
import { TAPMemberOfBusinessGroupTreeTableNode } from "../../../displayServices/APUsersDisplayService/APMemberOfService";
import APEntityIdsService from "../../../utils/APEntityIdsService";

import "../../APComponents.css";

export interface IAPDisplayOrganizationUserBusinessGroupRolesProps {
  apMemberOfBusinessGroupTreeTableNode: TAPMemberOfBusinessGroupTreeTableNode;
  className?: string;
}

export const APDisplayOrganizationUserBusinessGroupRoles: React.FC<IAPDisplayOrganizationUserBusinessGroupRolesProps> = (props: IAPDisplayOrganizationUserBusinessGroupRolesProps) => {
  const ComponentName='APDisplayOrganizationUserBusinessGroupRoles';

  const renderComponent = (node: TAPMemberOfBusinessGroupTreeTableNode): JSX.Element => {
    const funcName = 'renderComponent';
    const logName = `${ComponentName}.${funcName}()`;
    if(node.data.apCalculatedBusinessGroupRoleEntityIdList === undefined) throw new Error(`${logName}: node.data.apCalculatedBusinessGroupRoleEntityIdList === undefined`);
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
      { renderComponent(props.apMemberOfBusinessGroupTreeTableNode) }
    </div>
  );
}
