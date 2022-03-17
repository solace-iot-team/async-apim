
import React from "react";

import { TreeTable, TreeTableSelectionKeys } from 'primereact/treetable';
import { Column } from "primereact/column";
import { Button } from "primereact/button";

import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { APComponentHeader } from "../../../components/APComponentHeader/APComponentHeader";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { E_CALL_STATE_ACTIONS } from "./ManageBusinessGroupsCommon";
import { APClientConnectorOpenApi } from "../../../utils/APClientConnectorOpenApi";
import APBusinessGroupsDisplayService, { 
  TAPBusinessGroupDisplay, 
  TAPBusinessGroupDisplayList, 
  TAPBusinessGroupTreeNodeDisplay,
  TAPTreeTableExpandedKeysType,
} from "../../../displayServices/APBusinessGroupsDisplayService";
import { TAPEntityId } from "../../../utils/APEntityIdsService";

import '../../../components/APComponents.css';
import "./ManageBusinessGroups.css";

export interface IListAsTreeTableBusinessGroupsProps {
  organizationId: string;
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
  onManagedObjectNew: (parentBusinessGroupEntityId: TAPEntityId) => void;
  onManagedObjectEdit: (managedObjectEntityId: TAPEntityId) => void;
  onManagedObjectDelete: (managedObjectEntityId: TAPEntityId) => void;
  onManagedObjectView: (managedObjectEntityId: TAPEntityId) => void;
}

export const ListAsTreeTableBusinessGroups: React.FC<IListAsTreeTableBusinessGroupsProps> = (props: IListAsTreeTableBusinessGroupsProps) => {
  const ComponentName = 'ListAsTreeTableBusinessGroups';

  const MessageNoManagedObjectsFoundCreateNew = 'No Business Groups found.';

  type TManagedObject = TAPBusinessGroupDisplay;
  type TManagedObjectList = Array<TManagedObject>;

  type TManagedObjectTreeTableNode = TAPBusinessGroupTreeNodeDisplay;
  type TManagedObjectTreeTableNodeList = Array<TManagedObjectTreeTableNode>;

  const [managedObjectList, setManagedObjectList] = React.useState<TManagedObjectList>();  
  const [managedObjectTreeTableNodeList, setManagedObjectTreeTableNodeList] = React.useState<TManagedObjectTreeTableNodeList>();
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [isGetManagedObjectListInProgress, setIsGetManagedObjectListInProgress] = React.useState<boolean>(false);
  const [selectedManagedObjectTreeTableNodeKey, setSelectedManagedObjectTreeTableNodeKey] = React.useState<TreeTableSelectionKeys>(null);
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const [selectedManagedObjectTreeTableNode, setSelectedManagedObjectTreeTableNode] = React.useState<TManagedObjectTreeTableNode>();
  const [expandedKeys, setExpandedKeys] = React.useState<TAPTreeTableExpandedKeysType>();


  // * Api Calls *
  const apiGetManagedObjectList = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObjectList';
    const logName = `${ComponentName}.${funcName}()`;
    setIsGetManagedObjectListInProgress(true);
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_BUSINESS_GROUP_LIST, 'retrieve list of business groups');
    try {
      const list: TAPBusinessGroupDisplayList = await APBusinessGroupsDisplayService.apsGetList_ApBusinessGroupSystemDisplayList({
        organizationId: props.organizationId
      });
      setManagedObjectList(list);
    } catch(e: any) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    setIsGetManagedObjectListInProgress(false);
    return callState;
  }

  const doInitialize = async () => {
    props.onLoadingChange(true);
    await apiGetManagedObjectList();
    props.onLoadingChange(false);
  }

  const initializeExpandedKeys = (managedObjectTreeTableNodeList: TManagedObjectTreeTableNodeList) => {
    const _expandedKeys: TAPTreeTableExpandedKeysType = APBusinessGroupsDisplayService.create_ApBusinessGroupTreeNodeDisplayList_ExpandedKeys({
      apBusinessGroupTreeNodeDisplayList: managedObjectTreeTableNodeList
    });
    setExpandedKeys(_expandedKeys);
  }

  React.useEffect(() => {
    // const funcName = 'useEffect([])';
    // const logName = `${componentName}.${funcName}()`;
    // console.log(`${logName}: mounting ...`);
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(managedObjectList !== undefined) {
      const managedObjectTreeTableNodeList: TManagedObjectTreeTableNodeList = APBusinessGroupsDisplayService.generate_ApBusinessGroupTreeNodeDisplayList_From_ApBusinessGroupDisplayList(managedObjectList);
      setManagedObjectTreeTableNodeList(managedObjectTreeTableNodeList);
      initializeExpandedKeys(managedObjectTreeTableNodeList);
    }
  }, [managedObjectList]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(apiCallStatus.success) props.onSuccess(apiCallStatus);
      else props.onError(apiCallStatus);
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  // * Data Table *
  const onManagedObjectTreeTableNodeAdd = (node: TManagedObjectTreeTableNode) => {
    props.onManagedObjectNew(node.data.apEntityId);
  }
  const onManagedObjectTreeTableNodeDelete = (node: TManagedObjectTreeTableNode) => {
    props.onManagedObjectDelete(node.data.apEntityId);
  }
  const onManagedObjectTreeTableNodeEdit = (node: TManagedObjectTreeTableNode) => {
    props.onManagedObjectEdit(node.data.apEntityId);
  }
  const onManagedObjectTreeTableNodeView = (node: TManagedObjectTreeTableNode) => {
    props.onManagedObjectView(node.data.apEntityId);
  }
  // const onManagedObjectTreeTableNodeSelect = (eventParams: any) => {
  //   // eventParams: TreeTableEventParams
  //   setSelectedManagedObjectTreeTableNode(eventParams.node);
  // }
  // const referencesByBodyTemplate = (node: TManagedObjectTreeTableNode): JSX.Element => {
  //   if(node.data.apsBusinessGroupResponse.businessGroupChildIds.length === 0) return (<>-</>);
  //   return (<>{`Children: ${node.data.apsBusinessGroupResponse.businessGroupChildIds.length}`}</>);
  // }
  const desriptionByBodyTemplate = (node: TManagedObjectTreeTableNode): JSX.Element => {
    return (<>{node.data.apsBusinessGroupResponse.description}</>);
  }
  const sourceByBodyTemplate = (node: TManagedObjectTreeTableNode): string => {
    return APBusinessGroupsDisplayService.getSourceDisplayString(node.data);
  }

  const actionBodyTemplate = (node: TManagedObjectTreeTableNode) => {
    const isDeleteAllowed: boolean = APBusinessGroupsDisplayService.isDeleteAllowed(node.data);
    const isAddChildAllowed: boolean = APBusinessGroupsDisplayService.isAddChildAllowed(node.data);
    const isEditAllowed: boolean = APBusinessGroupsDisplayService.isEditAllowed(node.data);
    const key = node.key;
    return (
      <React.Fragment>
        <Button key={`search-${key}`} icon="pi pi-search" className="p-button-rounded p-button-outlined p-button-secondary p-mr-2" style={{ border: 'none'}} onClick={() => onManagedObjectTreeTableNodeView(node)} />
        <Button key={`edit-${key}`} icon="pi pi-pencil" className="p-button-rounded p-button-outlined p-button-secondary p-mr-2" style={{ border: 'none'}} onClick={() => onManagedObjectTreeTableNodeEdit(node)}  disabled={!isEditAllowed} />
        <Button key={`add-${key}`} icon="pi pi-plus" className="p-button-rounded p-button-outlined p-button-secondary p-mr-2" style={{ border: 'none'}} onClick={() => onManagedObjectTreeTableNodeAdd(node)} disabled={!isAddChildAllowed} />
        <Button key={`delete-${key}`} icon="pi pi-trash" className="p-button-rounded p-button-outlined p-button-secondary" style={{ border: 'none'}} onClick={() => onManagedObjectTreeTableNodeDelete(node)} disabled={!isDeleteAllowed} />
      </React.Fragment>
    );
  }

  const renderManagedObjectTreeTable = () => {
    // const funcName = 'renderManagedObjectTreeTable';
    // const logName = `${ComponentName}.${funcName}()`;

    const field_Name = 'apEntityId.displayName';
    return (
      <div className="card">
        <TreeTable
          value={managedObjectTreeTableNodeList}
          autoLayout={true}
          sortMode='single'
          sortField={field_Name}
          sortOrder={1}
          // selection
          selectionMode='single'
          selectionKeys={selectedManagedObjectTreeTableNodeKey}
          onSelectionChange={e => setSelectedManagedObjectTreeTableNodeKey(e.value)}
          // onSelect={onManagedObjectTreeTableNodeSelect}
          expandedKeys={expandedKeys}
          onToggle={e => setExpandedKeys(e.value)}
        >
          <Column header="Name" field={field_Name} bodyStyle={{ verticalAlign: 'top' }} filterField="globalSearch" sortable expander />
          <Column header="Source" body={sourceByBodyTemplate} bodyStyle={{verticalAlign: 'top'}} field="apExternalReference.externalSystemDisplayName" sortable />
          <Column header="Description" body={desriptionByBodyTemplate} bodyStyle={{verticalAlign: 'top' }} />
          {/* <Column header="References" body={referencesByBodyTemplate} bodyStyle={{verticalAlign: 'top'}} /> */}
          <Column body={actionBodyTemplate} bodyStyle={{verticalAlign: 'top', textAlign: 'right' }} />
        </TreeTable>
      </div>
    );
  }

  const renderContent = () => {
    const funcName = 'renderContent';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObjectList === undefined) throw new Error(`${logName}: managedObjectList === undefined`);

    if(managedObjectList.length === 0 && !isGetManagedObjectListInProgress && apiCallStatus && apiCallStatus.success) {
      return (<h3>{MessageNoManagedObjectsFoundCreateNew}</h3>);
    }
    if(managedObjectList.length > 0 && !isGetManagedObjectListInProgress) {
      return renderManagedObjectTreeTable();
    }    
  }

  return (
    <div className="ap-manage-business-groups">

      <APComponentHeader header='Business Groups:' />

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      {managedObjectList && managedObjectTreeTableNodeList && expandedKeys &&
        <div className="p-mt-4">{renderContent()}</div>
      }
      
      {/* DEBUG */}
      {/* {selectedManagedObjectTreeTableNode &&
        <pre style={ { fontSize: '10px' }} >
          {JSON.stringify({ 
            ...selectedManagedObjectTreeTableNode, 
            globalSearch: ' not shown',
            apSearchContent: 'not shown'
          }, null, 2)}
        </pre>
      } */}
    </div>
  );
}
