
import React from "react";

import { TreeTable } from "primereact/treetable";
import { Column } from "primereact/column";

import APEntityIdsService from "../../../utils/APEntityIdsService";
import { APDisplayOrganizationUserBusinessGroupRoles } from "./APDisplayOrganizationUserBusinessGroupRoles";
import { TAPOrganizationUserDisplay } from "../../../displayServices/APUsersDisplayService/APOrganizationUsersDisplayService";
import APMemberOfService, { 
  TAPMemberOfBusinessGroupTreeTableNode, 
  TAPMemberOfBusinessGroupTreeTableNodeList 
} from "../../../displayServices/APUsersDisplayService/APMemberOfService";
 
import "../../APComponents.css";

export interface IAPDisplayOrganizationUserBusinessGroupsProps {
  apOrganizationUserDisplay: TAPOrganizationUserDisplay;
  className?: string;
}

export const APDisplayOrganizationUserBusinessGroups: React.FC<IAPDisplayOrganizationUserBusinessGroupsProps> = (props: IAPDisplayOrganizationUserBusinessGroupsProps) => {
  const ComponentName='APDisplayOrganizationUserBusinessGroups';

  const rolesBodyTemplate = (node: TAPMemberOfBusinessGroupTreeTableNode): JSX.Element => {
    return (
      <APDisplayOrganizationUserBusinessGroupRoles 
        apMemberOfBusinessGroupTreeTableNode={node}
      />
    );
  }

  // const keyBodyTemplate = (node: TAPMemberOfBusinessGroupTreeTableNode) => {
  //   return node.key;
  // }

  const renderOrganizationBusinessGroupsTreeTable = (treeTableNodeList: TAPMemberOfBusinessGroupTreeTableNodeList): JSX.Element => {
    if(treeTableNodeList.length === 0) return (
      <div><b>Business Groups</b>: None.</div>
    );
    // this is in node.data
    const field_Name = 'apBusinessGroupDisplay.apEntityId.displayName';
    return (
      <React.Fragment>
        <div className="p-mb-2"><b>Business Groups</b>:</div>
        <div className="card">
          <TreeTable
            value={treeTableNodeList}
            autoLayout={true}
            sortMode='single'
            sortField={field_Name}
            sortOrder={1}
            // selection
            // selectionMode='single'
            // selectionKeys={selectedManagedObjectTreeTableNodeKey}
            // onSelectionChange={e => setSelectedManagedObjectTreeTableNodeKey(e.value)}
            // onSelect={onManagedObjectTreeTableNodeSelect}
          >
            <Column header="Name" field={field_Name} bodyStyle={{ verticalAlign: 'top' }} sortable expander />
            <Column header="Roles" body={rolesBodyTemplate} bodyStyle={{verticalAlign: 'top'}} />
            {/* <Column header="Key" body={keyBodyTemplate} bodyStyle={{verticalAlign: 'top'}} /> */}
          </TreeTable>
        </div>

        {/* DEBUG */}
        {/* <p><b>apMemberOfBusinessGroupTreeNodeDisplayList=</b></p>
        <pre style={ { fontSize: '10px' }} >
          {JSON.stringify(apMemberOfBusinessGroupTreeNodeDisplayList, null, 2)}
        </pre> */}

      </React.Fragment>
    );
  }

  const renderOrganizationRoles = (): JSX.Element => {
    const organizationRolesDisplayString = props.apOrganizationUserDisplay.memberOfOrganizationDisplay.apOrganizationRoleEntityIdList.length > 0 
      ? APEntityIdsService.getSortedDisplayNameList_As_String(props.apOrganizationUserDisplay.memberOfOrganizationDisplay.apOrganizationRoleEntityIdList) 
      : 'None.';
    return (
      <React.Fragment>
        <div><b>Organization Roles</b>: {organizationRolesDisplayString}</div>
      </React.Fragment>
    );
  }

  const renderComponent = (): JSX.Element => {
    const funcName = 'renderComponent';
    const logName = `${ComponentName}.${funcName}()`;
    if(props.apOrganizationUserDisplay.completeOrganizationBusinessGroupDisplayList === undefined) throw new Error(`${logName}: props.apOrganizationUserDisplay.completeOrganizationBusinessGroupDisplayList === undefined`);
    const treeTableNodeList: TAPMemberOfBusinessGroupTreeTableNodeList = APMemberOfService.create_ApMemberOfBusinessGroupTreeTableNodeList({
      organizationEntityId: props.apOrganizationUserDisplay.organizationEntityId,
      apMemberOfBusinessGroupDisplayList: props.apOrganizationUserDisplay.memberOfOrganizationDisplay.apMemberOfBusinessGroupDisplayList,
      apOrganizationRoleEntityIdList: props.apOrganizationUserDisplay.memberOfOrganizationDisplay.apOrganizationRoleEntityIdList,
      completeApOrganizationBusinessGroupDisplayList: props.apOrganizationUserDisplay.completeOrganizationBusinessGroupDisplayList,
      pruneBusinessGroupsNotAMemberOf: true
    });

    return (
      <React.Fragment>
        <div className="p-mt-2">
          {renderOrganizationRoles()}
        </div>
        <div className="p-mt-2">{renderOrganizationBusinessGroupsTreeTable(treeTableNodeList)}</div>
      </React.Fragment>
    );
  }

  return (
    <div className={props.className ? props.className : 'card'}>
      { renderComponent() }
    </div>
  );
}
