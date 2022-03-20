
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
import { TAPTreeTableExpandedKeysType } from "../../../displayServices/APBusinessGroupsDisplayService";
 
import "../../APComponents.css";

export interface IAPDisplayOrganizationUserBusinessGroupsProps {
  apOrganizationUserDisplay: TAPOrganizationUserDisplay;
  className?: string;
}

export const APDisplayOrganizationUserBusinessGroups: React.FC<IAPDisplayOrganizationUserBusinessGroupsProps> = (props: IAPDisplayOrganizationUserBusinessGroupsProps) => {
  const ComponentName='APDisplayOrganizationUserBusinessGroups';

  const [apMemberOfBusinessGroupTreeTableNodeList, setApMemberOfBusinessGroupTreeTableNodeList] = React.useState<TAPMemberOfBusinessGroupTreeTableNodeList>();
  const [expandedKeys, setExpandedKeys] = React.useState<TAPTreeTableExpandedKeysType>();
  const [isInitialized, setIsInitialized] = React.useState<boolean>(false);

  const initializeExpandedKeys = (apMemberOfBusinessGroupTreeTableNodeList: TAPMemberOfBusinessGroupTreeTableNodeList) => {
    const expandNode = (node: TAPMemberOfBusinessGroupTreeTableNode, _expandedKeys: TAPTreeTableExpandedKeysType) => {
      if (node.children && node.children.length) {
        _expandedKeys[node.key] = true;  
        for (let child of node.children) {
            expandNode(child, _expandedKeys);
        }
      }
    }
    let _expandedKeys = {};
    for(let node of apMemberOfBusinessGroupTreeTableNodeList) {
      expandNode(node, _expandedKeys);
    }
    setExpandedKeys(_expandedKeys);
  }

  React.useEffect(() => {
    const funcName = 'useEffect[]';
    const logName = `${ComponentName}.${funcName}()`;

    if(props.apOrganizationUserDisplay.completeOrganizationBusinessGroupDisplayList === undefined) throw new Error(`${logName}: apUserDisplay.completeOrganizationBusinessGroupDisplayList`);
    const apMemberOfBusinessGroupTreeTableNodeList: TAPMemberOfBusinessGroupTreeTableNodeList = APMemberOfService.create_ApMemberOfBusinessGroupTreeTableNodeList({
      organizationEntityId: props.apOrganizationUserDisplay.organizationEntityId,
      apMemberOfBusinessGroupDisplayList: props.apOrganizationUserDisplay.memberOfOrganizationDisplay.apMemberOfBusinessGroupDisplayList,
      apOrganizationRoleEntityIdList: props.apOrganizationUserDisplay.memberOfOrganizationDisplay.apOrganizationRoleEntityIdList,
      completeApOrganizationBusinessGroupDisplayList: props.apOrganizationUserDisplay.completeOrganizationBusinessGroupDisplayList,
      pruneBusinessGroupsNotAMemberOf: true
    });  
    setApMemberOfBusinessGroupTreeTableNodeList(apMemberOfBusinessGroupTreeTableNodeList);
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(()=> {
    if(apMemberOfBusinessGroupTreeTableNodeList !== undefined) {
      initializeExpandedKeys(apMemberOfBusinessGroupTreeTableNodeList);
    }
  },[apMemberOfBusinessGroupTreeTableNodeList]);

  React.useEffect(() => {
    if(expandedKeys !== undefined) {
      setIsInitialized(true);
    }
  }, [expandedKeys]);

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
            expandedKeys={expandedKeys}
            onToggle={e => setExpandedKeys(e.value)}
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

    if(apMemberOfBusinessGroupTreeTableNodeList === undefined) throw new Error(`${logName}: apMemberOfBusinessGroupTreeTableNodeList === undefined`);

    return (
      <React.Fragment>
        <div className="p-mt-2">
          {renderOrganizationRoles()}
        </div>
        <div className="p-mt-2">{renderOrganizationBusinessGroupsTreeTable(apMemberOfBusinessGroupTreeTableNodeList)}</div>
      </React.Fragment>
    );
  }

  return (
    <div className={props.className ? props.className : 'card'}>
      { isInitialized && renderComponent() }
    </div>
  );
}
