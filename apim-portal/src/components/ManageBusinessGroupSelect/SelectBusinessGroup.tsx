
import React from "react";

import { TreeTable, TreeTableEventParams, TreeTableSelectionKeys } from "primereact/treetable";
import { Column } from "primereact/column";

import APMemberOfService, { 
  TAPMemberOfBusinessGroupDisplay, 
  TAPMemberOfBusinessGroupDisplayTreeNodeList, 
  TAPMemberOfBusinessGroupTreeTableNode, 
  TAPMemberOfBusinessGroupTreeTableNodeList 
} from "../../displayServices/APUsersDisplayService/APMemberOfService";
import APEntityIdsService, { TAPEntityId } from "../../utils/APEntityIdsService";

import '../APComponents.css';
import "./ManageBusinessGroupSelect.css";

export interface ISelectBusinessGroupProps {
  apMemberOfBusinessGroupDisplayTreeNodeList: TAPMemberOfBusinessGroupDisplayTreeNodeList;
  currentBusinessGroupEntityId: TAPEntityId;
  onSelect: (businessGroupEntityId: TAPEntityId) => void;
}

export const SelectBusinessGroup: React.FC<ISelectBusinessGroupProps> = (props: ISelectBusinessGroupProps) => {
  const ComponentName = 'SelectBusinessGroup';

  type TreeTableExpandedKeysType = {
    [key: string]: boolean;
  }

  const [apMemberOfBusinessGroupTreeTableNodeList] = React.useState<TAPMemberOfBusinessGroupTreeTableNodeList>(
    APMemberOfService.create_ApMemberOfBusinessGroupTreeTableNodeList_From_ApMemberOfBusinessGroupDisplayTreeNodeList({
      apMemberOfBusinessGroupDisplayTreeNodeList: props.apMemberOfBusinessGroupDisplayTreeNodeList,
      includeBusinessGroupIsSelectable: true
    })  
  );
  const [expandedKeys, setExpandedKeys] = React.useState<TreeTableExpandedKeysType>({});
  const [selectedBusinessGroupKey, setSelectedBusinessGroupKey] = React.useState<TreeTableSelectionKeys>(props.currentBusinessGroupEntityId.id);

  const initializeExpandedKeys = () => {
    const _expandedKeys: TreeTableExpandedKeysType = {};
    apMemberOfBusinessGroupTreeTableNodeList.forEach( (x) => {
      _expandedKeys[x.key] = true;
    });
    setExpandedKeys(_expandedKeys);
  }

  React.useEffect(() => {
    initializeExpandedKeys();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  const onBusinessGroupSelect = (e: TreeTableEventParams) => {
    // const funcName = 'onBusinessGroupSelect';
    // const logName = `${ComponentName}.${funcName}()`;
    const apMemberOfBusinessGroupDisplay: TAPMemberOfBusinessGroupDisplay = e.node.data;
    props.onSelect(apMemberOfBusinessGroupDisplay.apBusinessGroupDisplay.apEntityId);
  }

  const rolesBodyTemplate = (node: TAPMemberOfBusinessGroupTreeTableNode): string => {
    const configured = node.data.apConfiguredBusinessGroupRoleEntityIdList.length > 0 ? APEntityIdsService.getSortedDisplayNameList_As_String(node.data.apConfiguredBusinessGroupRoleEntityIdList) : 'None.';
    return configured;
  }

  const renderBusinessGroupsTreeTable = (): JSX.Element => {
    const funcName = 'renderBusinessGroupsTreeTable';
    const logName = `${ComponentName}.${funcName}()`;

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
