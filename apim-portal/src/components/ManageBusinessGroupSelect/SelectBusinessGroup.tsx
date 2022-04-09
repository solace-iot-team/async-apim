
import React from "react";

import { TreeTable, TreeTableEventParams, TreeTableSelectionKeys } from "primereact/treetable";
import { Column } from "primereact/column";

import APMemberOfService, { 
  TAPMemberOfBusinessGroupDisplay, 
  TAPMemberOfBusinessGroupDisplayTreeNodeList, 
  TAPMemberOfBusinessGroupTreeTableNode, 
  TAPMemberOfBusinessGroupTreeTableNodeList 
} from "../../displayServices/APUsersDisplayService/APMemberOfService";
import APEntityIdsService, { TAPEntityId, TAPEntityIdList } from "../../utils/APEntityIdsService";
import APBusinessGroupsDisplayService, { TAPTreeTableExpandedKeysType } from "../../displayServices/APBusinessGroupsDisplayService";
import APRbacDisplayService from "../../displayServices/APRbacDisplayService";

import '../APComponents.css';
import "./ManageBusinessGroupSelect.css";

export interface ISelectBusinessGroupProps {
  apMemberOfBusinessGroupDisplayTreeNodeList: TAPMemberOfBusinessGroupDisplayTreeNodeList;
  currentBusinessGroupEntityId: TAPEntityId;
  onSelect: (businessGroupEntityId: TAPEntityId) => void;
}

export const SelectBusinessGroup: React.FC<ISelectBusinessGroupProps> = (props: ISelectBusinessGroupProps) => {
  const ComponentName = 'SelectBusinessGroup';

  // prune the list
  const pruned_apMemberOfBusinessGroupDisplayTreeNodeList: TAPMemberOfBusinessGroupDisplayTreeNodeList = APMemberOfService.create_pruned_ApMemberOfBusinessGroupDisplayTreeNodeList({
    apMemberOfBusinessGroupDisplayTreeNodeList: props.apMemberOfBusinessGroupDisplayTreeNodeList,
    accessOnly_To_BusinessGroupManageAssets: false,
  });
  // create the tree table node list from pruned list
  const apMemberOfBusinessGroupTreeTableNodeList: TAPMemberOfBusinessGroupTreeTableNodeList = APMemberOfService.create_ApMemberOfBusinessGroupTreeTableNodeList_From_ApMemberOfBusinessGroupDisplayTreeNodeList({
    apMemberOfBusinessGroupDisplayTreeNodeList: pruned_apMemberOfBusinessGroupDisplayTreeNodeList,
    includeBusinessGroupIsSelectable: true,
    accessOnly_To_BusinessGroupManageAssets: false,
  });

  const [expandedKeys, setExpandedKeys] = React.useState<TAPTreeTableExpandedKeysType>(APBusinessGroupsDisplayService.create_ApMemberOfBusinessGroupTreeTableNodeList_ExpandedKeys({
    apMemberOfBusinessGroupTreeTableNodeList: apMemberOfBusinessGroupTreeTableNodeList
  }));

  const [selectedBusinessGroupKey, setSelectedBusinessGroupKey] = React.useState<TreeTableSelectionKeys>(props.currentBusinessGroupEntityId.id);

  const onBusinessGroupSelect = (e: TreeTableEventParams) => {
    const apMemberOfBusinessGroupDisplay: TAPMemberOfBusinessGroupDisplay = e.node.data;
    props.onSelect(apMemberOfBusinessGroupDisplay.apBusinessGroupDisplay.apEntityId);
  }

  // const configuredRolesBodyTemplate = (node: TAPMemberOfBusinessGroupTreeTableNode): string => {
  //   const configured = node.data.apConfiguredBusinessGroupRoleEntityIdList.length > 0 ? APEntityIdsService.getSortedDisplayNameList_As_String(node.data.apConfiguredBusinessGroupRoleEntityIdList) : 'None.';
  //   return configured;
  // }

  const calculatedRolesBodyTemplate = (node: TAPMemberOfBusinessGroupTreeTableNode): string => {
    const funcName = 'calculatedRolesBodyTemplate';
    const logName = `${ComponentName}.${funcName}()`;
    if(node.data.apCalculatedBusinessGroupRoleEntityIdList === undefined) throw new Error(`${logName}: node.data.apCalculatedBusinessGroupRoleEntityIdList === undefined`);
    if(node.data.apCalculatedBusinessGroupRoleEntityIdList.length > 0) {
      // filter for business group roles only
      const calculatedBusinesGroupRoles: TAPEntityIdList = APRbacDisplayService.filter_RolesEntityIdList_By_BusinessGroupRoles({
        combinedRoles: node.data.apCalculatedBusinessGroupRoleEntityIdList
      });
      return APEntityIdsService.getSortedDisplayNameList_As_String(calculatedBusinesGroupRoles);
    } else return 'None.';
  }

  const renderBusinessGroupsTreeTable = (): JSX.Element => {
    const funcName = 'renderBusinessGroupsTreeTable';
    const logName = `${ComponentName}.${funcName}()`;
    // alert(`${logName}: render ...`)
    if(apMemberOfBusinessGroupTreeTableNodeList.length === 0) throw new Error(`${logName}: apMemberOfBusinessGroupTreeTableNodeList.length === 0`);

    const field_Name = 'apBusinessGroupDisplay.apEntityId.displayName';
    
    return (
      <React.Fragment>
        <div className="card p-mt-2">
          <TreeTable
            value={apMemberOfBusinessGroupTreeTableNodeList}
            autoLayout={true}
            sortMode='single'
            sortField={field_Name}
            sortOrder={1}
            selectionMode="single"
            selectionKeys={selectedBusinessGroupKey} 
            onSelectionChange={e => setSelectedBusinessGroupKey(e.value)}
            onSelect={onBusinessGroupSelect}
            expandedKeys={expandedKeys}
            onToggle={e => setExpandedKeys(e.value)}
          >
            <Column header="Business Group" field={field_Name} bodyStyle={{ verticalAlign: 'top' }} sortable expander />
            {/* <Column header="isToplevel?" body={topLevelBodyTemplate} bodyStyle={{verticalAlign: 'top'}} /> */}
            {/* <Column header="Conf'ed Roles" body={configuredRolesBodyTemplate} bodyStyle={{verticalAlign: 'top'}} />
            <Column header="Calc'ed Roles" body={calculatedRolesBodyTemplate} bodyStyle={{verticalAlign: 'top'}} /> */}
            <Column header="Roles" body={calculatedRolesBodyTemplate} bodyStyle={{verticalAlign: 'top'}} />
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

  const renderComponent = (): JSX.Element => {
    // const funcName = 'renderComponent';
    // const logName = `${ComponentName}.${funcName}()`;

    return (
      <React.Fragment>
        <div className="p-mt-2">{renderBusinessGroupsTreeTable()}</div>
      </React.Fragment>
    );
  }

  return (
    <div className="manage-users">

      { renderComponent() }

    </div>
  );

}
