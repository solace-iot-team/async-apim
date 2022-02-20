
import React from "react";

import { DataTable } from 'primereact/datatable';
import { TreeTable, TreeTableEventParams, TreeTableSelectionKeys, TreeTableSortOrderType } from 'primereact/treetable';
import { Column } from "primereact/column";
import { InputText } from 'primereact/inputtext';
import { MenuItem } from "primereact/api";
// import { TreeNode } from 'primereact/components/';

import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { APComponentHeader } from "../../../components/APComponentHeader/APComponentHeader";
import { Globals } from "../../../utils/Globals";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { E_CALL_STATE_ACTIONS } from "./ManageBusinessGroupsCommon";
import { APClientConnectorOpenApi } from "../../../utils/APClientConnectorOpenApi";
import APBusinessGroupsService, { 
  TAPBusinessGroupDisplay, 
  TAPBusinessGroupDisplayList, 
  TAPBusinessGroupTreeNodeDisplay, 
} from "../../../services/APBusinessGroupsService";

import '../../../components/APComponents.css';
import "./ManageBusinessGroups.css";
import { Button } from "primereact/button";

export interface IListAsTreeTableBusinessGroupsProps {
  organizationId: string;
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
  onManagedObjectEdit: (managedObjectId: string, managedObjectDisplayName: string) => void;
  onManagedObjectDelete: (managedObjectId: string, managedObjectDisplayName: string) => void;
  onManagedObjectView: (managedObjectId: string, managedObjectDisplayName: string, hasReferences: boolean) => void;
  setBreadCrumbItemList: (itemList: Array<MenuItem>) => void;
}

export const ListAsTreeTableBusinessGroups: React.FC<IListAsTreeTableBusinessGroupsProps> = (props: IListAsTreeTableBusinessGroupsProps) => {
  const ComponentName = 'ListAsTreeTableBusinessGroups';

  const MessageNoManagedObjectsFoundCreateNew = 'No Business Groups found.';
  const GlobalSearchPlaceholder = 'search...';

  type TManagedObject = TAPBusinessGroupDisplay;
  type TManagedObjectList = Array<TManagedObject>;
  type TManagedObjectTableDataRow = TManagedObject & {
    globalSearch: string;
  };
  type TManagedObjectTableDataList = Array<TManagedObjectTableDataRow>;

  type TManagedObjectTreeTableNode = TAPBusinessGroupTreeNodeDisplay;
  type TManagedObjectTreeTableNodeList = Array<TManagedObjectTreeTableNode>;

  const transformManagedObjectList_To_ManagedObjecTreeTableNodeList = (moList: TManagedObjectList): TManagedObjectTreeTableNodeList => {
    return APBusinessGroupsService.create_ApBusinessGroupTreeNodeDisplayList_From_ApBusinessGroupDisplayList(moList)
  }

  const transformManagedObjectList_To_TableDataList = (moList: TManagedObjectList): TManagedObjectTableDataList => {
    const _transformManagedObject_To_TableDataRow = (mo: TManagedObject): TManagedObjectTableDataRow => {
      const moTDRow: TManagedObjectTableDataRow = {
        ...mo,
        globalSearch: ''
      }
      const globalSearch = Globals.generateDeepObjectValuesString(moTDRow);
      return {
        ...moTDRow,
        globalSearch: globalSearch
      }
    }
    return moList.map( (mo: TManagedObject) => {
      return _transformManagedObject_To_TableDataRow(mo);
    });
  }

  const [managedObjectList, setManagedObjectList] = React.useState<TManagedObjectList>([]);  
  const [selectedManagedObject, setSelectedManagedObject] = React.useState<TManagedObject>();
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [isGetManagedObjectListInProgress, setIsGetManagedObjectListInProgress] = React.useState<boolean>(false);
  const [sortField, setSortField] = React.useState<string>('apEntityId.displayName');
  const [sortOrder, setSortOrder] = React.useState<TreeTableSortOrderType>(1);
  const [selectedManagedObjectTreeTableNodeKey, setSelectedManagedObjectTreeTableNodeKey] = React.useState<TreeTableSelectionKeys>(null);
  const [selectedManagedObjectTreeTableNode, setSelectedManagedObjectTreeTableNode] = React.useState<TManagedObjectTreeTableNode>();
  const [globalFilter, setGlobalFilter] = React.useState<string>();
  const dt = React.useRef<any>(null);

  // * Api Calls *
  const apiGetManagedObjectList = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObjectList';
    const logName = `${ComponentName}.${funcName}()`;
    setIsGetManagedObjectListInProgress(true);
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_BUSINESS_GROUP_LIST, 'retrieve list of business groups');
    try {
      const list: TAPBusinessGroupDisplayList = await APBusinessGroupsService.listApBusinessGroupSystemDisplay({
        organizationId: props.organizationId
      })
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

  React.useEffect(() => {
    // const funcName = 'useEffect([])';
    // const logName = `${componentName}.${funcName}()`;
    // console.log(`${logName}: mounting ...`);
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(apiCallStatus.success) props.onSuccess(apiCallStatus);
      else props.onError(apiCallStatus);
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  // * Data Table *
  const onManagedObjectSelect = (event: any): void => {
    setSelectedManagedObject(event.data);
  }  

  const onManagedObjectOpen = (event: any): void => {
    const mo: TManagedObject = event.data as TManagedObject;
    props.onManagedObjectView(mo.apEntityId.id, mo.apEntityId.displayName, mo.apsBusinessGroupResponse.businessGroupChildIds.length > 0);
  }

  const onInputGlobalFilter = (event: React.FormEvent<HTMLInputElement>) => {
    setGlobalFilter(event.currentTarget.value);
  }
 
  const renderDataTableHeader = (): JSX.Element => {
    return (
      <div className="table-header">
        <div className="table-header-container" />
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText type="search" placeholder={GlobalSearchPlaceholder} onInput={onInputGlobalFilter} style={{width: '500px'}}/>
        </span>
      </div>
    );
  }

  // const referencesByBodyTemplate = (rowData: TManagedObjectTableDataRow): JSX.Element => {
  //   if(rowData.apsBusinessGroupResponse.businessGroupChildIds.length === 0) return (<>-</>);
  //   return (<>{`Children: ${rowData.apsBusinessGroupResponse.businessGroupChildIds.length}`}</>);
  // }
  // const desriptionByBodyTemplate = (rowData: TManagedObjectTableDataRow): JSX.Element => {
  //   return (<>{rowData.apsBusinessGroupResponse.description}</>);
  // }
  // const nameBodyTemplate = (rowData: TManagedObjectTableDataRow): string => {
  //   return rowData.apEntityId.displayName;
  // }
  // const sourceByBodyTemplate = (rowData: TManagedObjectTableDataRow): string => {
  //   if(rowData.apExternalRefernce !== undefined) return rowData.apExternalRefernce.externalSystemDisplayName;
  //   else return '-';
  // }
  // const renderManagedObjectDataTable = () => {
  //   let managedObjectTableDataList: TManagedObjectTableDataList = transformManagedObjectList_To_TableDataList(managedObjectList);    
  //   return (
  //     <div className="card">
  //         <DataTable
  //           ref={dt}
  //           className="p-datatable-sm"
  //           // autoLayout={true}
  //           resizableColumns 
  //           columnResizeMode="expand"
  //           showGridlines={false}
  //           header={renderDataTableHeader()}
  //           value={managedObjectTableDataList}
  //           globalFilter={globalFilter}
  //           selectionMode="single"
  //           selection={selectedManagedObject}
  //           onRowClick={onManagedObjectSelect}
  //           onRowDoubleClick={(e) => onManagedObjectOpen(e)}
  //           scrollable 
  //           scrollHeight="800px" 
  //           dataKey="apEntityId.id"  
  //           // sorting
  //           sortMode='single'
  //           sortField="apEntityId.displayName"
  //           sortOrder={1}
  //         >
  //           <Column header="Name" headerStyle={{width: '25em' }} body={nameBodyTemplate} bodyStyle={{ verticalAlign: 'top' }} filterField="globalSearch" sortField="apEntityId.displayName" sortable />
  //           <Column header="Description" body={desriptionByBodyTemplate} bodyStyle={{verticalAlign: 'top'}} />
  //           <Column header="Source" body={sourceByBodyTemplate} bodyStyle={{verticalAlign: 'top'}} />
  //           <Column header="References" headerStyle={{width: '10em' }} body={referencesByBodyTemplate} bodyStyle={{verticalAlign: 'top'}} />
  //       </DataTable>
  //     </div>
  //   );
  // }

  const onManagedObjectTreeTableNodeAdd = (node: TManagedObjectTreeTableNode) => {
    alert(`add child to node=${JSON.stringify(node, null, 2)}`);
  }
  const onManagedObjectTreeTableNodeDelete = (node: TManagedObjectTreeTableNode) => {
    alert(`delete of node=${JSON.stringify(node, null, 2)}`);
    // props.onManagedObjectDelete(mo.id, mo.displayName)
  }
  const onManagedObjectTreeTableNodeSelect = (eventParams: any) => {
    // eventParams: TreeTableEventParams
    setSelectedManagedObjectTreeTableNode(eventParams.node);
  }
  const referencesByBodyTemplate = (node: TManagedObjectTreeTableNode): JSX.Element => {
    if(node.data.apsBusinessGroupResponse.businessGroupChildIds.length === 0) return (<>-</>);
    return (<>{`Children: ${node.data.apsBusinessGroupResponse.businessGroupChildIds.length}`}</>);
  }
  const desriptionByBodyTemplate = (node: TManagedObjectTreeTableNode): JSX.Element => {
    return (<>{node.data.apsBusinessGroupResponse.description}</>);
  }
  const nameBodyTemplate = (node: TManagedObjectTreeTableNode): string => {
    return node.data.apEntityId.displayName;
  }
  const sourceByBodyTemplate = (node: TManagedObjectTreeTableNode): string => {
    if(node.data.apExternalRefernce !== undefined) return node.data.apExternalRefernce.externalSystemDisplayName;
    else return '-';
  }

  const actionBodyTemplate = (node: TManagedObjectTreeTableNode) => {
    const isDeleteAllowed: boolean = APBusinessGroupsService.isDeleteAllowed(node.data);
    return (
      <React.Fragment>
        {/* <Button tooltip="edit" icon="pi pi-pencil" className="p-button-rounded p-button-outlined p-button-secondary p-mr-2" onClick={() => props.onManagedObjectEdit(mo.id, mo.displayName)}  /> */}
        <Button icon="pi pi-plus" className="p-button-rounded p-button-outlined p-button-secondary p-mr-2" style={{ border: 'none'}} onClick={() => onManagedObjectTreeTableNodeAdd(node)}/>
        <Button icon="pi pi-trash" className="p-button-rounded p-button-outlined p-button-secondary p-mr-2" style={{ border: 'none'}} onClick={() => onManagedObjectTreeTableNodeDelete(node)} disabled={!isDeleteAllowed}/>
        {/* <Button tooltip="delete" icon="pi pi-trash" className="p-button-rounded p-button-secondary p-mr-2" style={{ border: 'none'}} onClick={() => onManagedObjectTreeTableNodeDelete(node)}/> */}
      </React.Fragment>
    );
    // const showButtonsEditDelete: boolean = (mo.apiInfo.source !== APIInfo.source.EVENT_PORTAL_LINK);
    // const isDeleteAllowed: boolean = mo.apiUsedBy_ApiProductEntityNameList.length === 0;
    // return (
    //     <React.Fragment>
    //       { showButtonsEditDelete &&
    //         <>
    //           <Button tooltip="edit" icon="pi pi-pencil" className="p-button-rounded p-button-outlined p-button-secondary p-mr-2" onClick={() => props.onManagedObjectEdit(mo.id, mo.displayName)}  />
    //           <Button tooltip="delete" icon="pi pi-trash" className="p-button-rounded p-button-outlined p-button-secondary p-mr-2" onClick={() => props.onManagedObjectDelete(mo.id, mo.displayName)} disabled={!isDeleteAllowed}/>
    //         </>
    //       }
    //     </React.Fragment>
    // );
  }

  const renderManagedObjectTreeTable = () => {
    const managedObjectTreeTableNodeList: TManagedObjectTreeTableNodeList = transformManagedObjectList_To_ManagedObjecTreeTableNodeList(managedObjectList);
    return (
      <div className="card">
        <TreeTable
          value={managedObjectTreeTableNodeList}
          autoLayout={false}
          scrollable 
          scrollHeight="800px" 
          // TODO: re-work sort - it behaves strangely
          sortMode='single'
          sortField={sortField}
          sortOrder={sortOrder}
          onSort={(e) => {setSortField(e.sortField); setSortOrder(e.sortOrder)}}
          // selection
          selectionMode='single'
          selectionKeys={selectedManagedObjectTreeTableNodeKey}
          onSelectionChange={e => setSelectedManagedObjectTreeTableNodeKey(e.value)}
          onSelect={onManagedObjectTreeTableNodeSelect}
        >
          <Column header="Name" body={nameBodyTemplate} bodyStyle={{ verticalAlign: 'top' }} filterField="globalSearch" sortField="apEntityId.displayName" sortable expander />
          {/* <Column header="Name" headerStyle={{width: '25em' }} body={nameBodyTemplate} bodyStyle={{ verticalAlign: 'top' }} filterField="globalSearch" sortField="apEntityId.displayName" sortable expander /> */}
          <Column header="Source"body={sourceByBodyTemplate} bodyStyle={{verticalAlign: 'top'}} sortField="apExternalRefernce.externalSystemDisplayName" sortable />
          {/* <Column header="Source" headerStyle={{width: '15em' }} body={sourceByBodyTemplate} bodyStyle={{verticalAlign: 'top'}} sortField="apExternalRefernce.externalSystemDisplayName" sortable /> */}
          <Column header="Description" body={desriptionByBodyTemplate} bodyStyle={{verticalAlign: 'top' }} />
          <Column header="References" body={referencesByBodyTemplate} bodyStyle={{verticalAlign: 'top'}} />
          {/* <Column header="References" headerStyle={{width: '10em' }} body={referencesByBodyTemplate} bodyStyle={{verticalAlign: 'top'}} /> */}
          <Column body={actionBodyTemplate} bodyStyle={{verticalAlign: 'top', textAlign: 'right' }} />
        </TreeTable>
      </div>
    );
  }

  const renderContent = () => {

    if(managedObjectList.length === 0 && !isGetManagedObjectListInProgress && apiCallStatus && apiCallStatus.success) {
      return (<h3>{MessageNoManagedObjectsFoundCreateNew}</h3>);
    }
    if(managedObjectList.length > 0 && !isGetManagedObjectListInProgress) {
      return renderManagedObjectTreeTable();
      // return renderManagedObjectDataTable();
    }    
  }

  return (
    <div className="ap-manage-business-groups">

      <APComponentHeader header='Business Groups:' />

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      <div className="p-mt-4">
        {renderContent()}
      </div>
      
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
      {selectedManagedObject &&
        <pre style={ { fontSize: '10px' }} >
          {JSON.stringify({ 
            ...selectedManagedObject, 
            globalSearch: ' not shown',
            apSearchContent: 'not shown'
          }, null, 2)}
        </pre>
      }
    </div>
  );
}
