
import React from "react";

import { TreeTable } from "primereact/treetable";
import { Column } from "primereact/column";

import APEntityIdsService, { TAPEntityId } from "../../../utils/APEntityIdsService";
import APUsersDisplayService, { 
  TAPMemberOfBusinessGroupDisplayList, 
  TAPMemberOfBusinessGroupTreeNodeDisplay, 
  TAPMemberOfBusinessGroupTreeNodeDisplayList 
} from "../../../displayServices/old.APUsersDisplayService";
import { TAPBusinessGroupDisplayList } from "../../../displayServices/APBusinessGroupsDisplayService";
import { APDisplayOrganizationBusinessGroupRoles } from "./APDisplayOrganizationBusinessGroupRoles";

import "../../APComponents.css";

export interface IAPDisplayOrganizationBusinessGroupsProps {
  apMemberOfOrganizationGroupsDisplayList: TAPMemberOfBusinessGroupDisplayList;
  completeOrganizationApBusinessGroupDisplayList: TAPBusinessGroupDisplayList;
  organizationEntityId: TAPEntityId;
  className?: string;
}

export const APDisplayOrganizationBusinessGroups: React.FC<IAPDisplayOrganizationBusinessGroupsProps> = (props: IAPDisplayOrganizationBusinessGroupsProps) => {
  const ComponentName='APDisplayOrganizationBusinessGroups';

  const rolesBodyTemplate = (node: TAPMemberOfBusinessGroupTreeNodeDisplay): JSX.Element => {
    return (
      <APDisplayOrganizationBusinessGroupRoles 
        apMemberOfBusinessGroupTreeNodeDisplay={node}
      />
    );
  }

  const renderOrganizationBusinessGroupsTreeTable = (apMemberOfBusinessGroupTreeNodeDisplayList: TAPMemberOfBusinessGroupTreeNodeDisplayList): JSX.Element => {
    if(apMemberOfBusinessGroupTreeNodeDisplayList.length === 0) return (
      <div><b>Business Groups</b>: None.</div>
    );
    const field_Name = 'apBusinessGroupDisplay.apEntityId.displayName';
    return (
      <React.Fragment>
        <div className="p-mb-2"><b>Business Groups</b>:</div>
        <div className="card">
          <TreeTable
            value={apMemberOfBusinessGroupTreeNodeDisplayList}
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
            {/* <Column body={actionBodyTemplate} bodyStyle={{verticalAlign: 'top', textAlign: 'right' }} /> */}
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
    const funcName = 'renderOrganizationRoles';
    const logName = `${ComponentName}.${funcName}()`;
    const found = props.apMemberOfOrganizationGroupsDisplayList.find( (x) => {
      return x.apBusinessGroupDisplay.apEntityId.id === props.organizationEntityId.id;
    });
    if(found === undefined) throw new Error(`${logName}: found === undefined`);
    const organizationRolesDisplayString = found.apCalculatedBusinessGroupRoleEntityIdList.length > 0 ? APEntityIdsService.getSortedDisplayNameList_As_String(found.apCalculatedBusinessGroupRoleEntityIdList) : 'None.';
    return (
      <React.Fragment>
        <div><b>Organization Roles</b>: {organizationRolesDisplayString}</div>
      </React.Fragment>
    );
  }

  const renderComponent = (): JSX.Element => {
    const treeNodeList: TAPMemberOfBusinessGroupTreeNodeDisplayList = APUsersDisplayService.generate_ApMemberOfBusinessGroupsTreeNodeDisplay({
      apMemberOfBusinessGroupDisplayList: props.apMemberOfOrganizationGroupsDisplayList,
      apBusinessGroupDisplayList: props.completeOrganizationApBusinessGroupDisplayList
    });
    return (
      <React.Fragment>
        <div className="p-mt-2">
          {renderOrganizationRoles()}
        </div>
        <div className="p-mt-2">{renderOrganizationBusinessGroupsTreeTable(treeNodeList)}</div>
      </React.Fragment>
    );
  }

  return (
    <div className={props.className ? props.className : 'card'}>
      { renderComponent() }
    </div>
  );
}
