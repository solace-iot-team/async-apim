
import React from "react";

import { DataTable } from 'primereact/datatable';
import { Column } from "primereact/column";
import { InputText } from 'primereact/inputtext';
import { MenuItem } from "primereact/api";

import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { APComponentHeader } from "../../../components/APComponentHeader/APComponentHeader";
import { Globals } from "../../../utils/Globals";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { E_CALL_STATE_ACTIONS } from "./ManageBusinessGroupsCommon";
import { APClientConnectorOpenApi } from "../../../utils/APClientConnectorOpenApi";
import APBusinessGroupsService, { 
  TAPBusinessGroupDisplay, 
  TAPBusinessGroupDisplayList 
} from "../../../services/APBusinessGroupsService";

import '../../../components/APComponents.css';
import "./ManageBusinessGroups.css";

export interface IListBusinessGroupsProps {
  organizationId: string;
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
  onManagedObjectEdit: (managedObjectId: string, managedObjectDisplayName: string) => void;
  onManagedObjectDelete: (managedObjectId: string, managedObjectDisplayName: string) => void;
  onManagedObjectView: (managedObjectId: string, managedObjectDisplayName: string, hasReferences: boolean) => void;
  setBreadCrumbItemList: (itemList: Array<MenuItem>) => void;
}

export const ListBusinessGroups: React.FC<IListBusinessGroupsProps> = (props: IListBusinessGroupsProps) => {
  const ComponentName = 'ListBusinessGroups';

  const MessageNoManagedObjectsFoundCreateNew = 'No Business Groups found.';
  const GlobalSearchPlaceholder = 'search...';

  type TManagedObject = TAPBusinessGroupDisplay;
  type TManagedObjectList = Array<TManagedObject>;
  type TManagedObjectTableDataRow = TManagedObject & {
    globalSearch: string;
  };
  type TManagedObjectTableDataList = Array<TManagedObjectTableDataRow>;

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

  const referencesByBodyTemplate = (rowData: TManagedObjectTableDataRow): JSX.Element => {
    if(rowData.apsBusinessGroupResponse.businessGroupChildIds.length === 0) return (<>-</>);
    return (<>{`Children: ${rowData.apsBusinessGroupResponse.businessGroupChildIds.length}`}</>);
  }
  const desriptionByBodyTemplate = (rowData: TManagedObjectTableDataRow): JSX.Element => {
    return (<>{rowData.apsBusinessGroupResponse.description}</>);
  }
  const nameBodyTemplate = (rowData: TManagedObjectTableDataRow): string => {
    return rowData.apEntityId.displayName;
  }
  const sourceByBodyTemplate = (rowData: TManagedObjectTableDataRow): string => {
    if(rowData.apExternalReference !== undefined) return rowData.apExternalReference.externalSystemDisplayName;
    else return '-';
  }
  const renderManagedObjectDataTable = () => {
    let managedObjectTableDataList: TManagedObjectTableDataList = transformManagedObjectList_To_TableDataList(managedObjectList);    
    return (
      <div className="card">
          <DataTable
            ref={dt}
            className="p-datatable-sm"
            // autoLayout={true}
            resizableColumns 
            columnResizeMode="expand"
            showGridlines={false}
            header={renderDataTableHeader()}
            value={managedObjectTableDataList}
            globalFilter={globalFilter}
            selectionMode="single"
            selection={selectedManagedObject}
            onRowClick={onManagedObjectSelect}
            onRowDoubleClick={(e) => onManagedObjectOpen(e)}
            scrollable 
            scrollHeight="800px" 
            dataKey="apEntityId.id"  
            // sorting
            sortMode='single'
            sortField="apEntityId.displayName"
            sortOrder={1}
          >
            <Column header="Name" headerStyle={{width: '25em' }} body={nameBodyTemplate} bodyStyle={{ verticalAlign: 'top' }} filterField="globalSearch" sortField="apEntityId.displayName" sortable />
            <Column header="Description" body={desriptionByBodyTemplate} bodyStyle={{verticalAlign: 'top'}} />
            <Column header="Source" body={sourceByBodyTemplate} bodyStyle={{verticalAlign: 'top'}} />
            <Column header="References" headerStyle={{width: '10em' }} body={referencesByBodyTemplate} bodyStyle={{verticalAlign: 'top'}} />
        </DataTable>
      </div>
    );
  }

  const renderContent = () => {

    if(managedObjectList.length === 0 && !isGetManagedObjectListInProgress && apiCallStatus && apiCallStatus.success) {
      return (<h3>{MessageNoManagedObjectsFoundCreateNew}</h3>);
    }
    if(managedObjectList.length > 0 && !isGetManagedObjectListInProgress) {
      return renderManagedObjectDataTable();
    } 
  }

  // const renderDebugSelectedManagedObject = (): JSX.Element => {
  //   if(managedObjectList.length > 0 && selectedManagedObject) {
  //     const _d = {
  //       ...selectedManagedObject,
  //       globalSearch: 'not shown...'
  //     }
  //     return (
  //       <pre style={ { fontSize: '10px' }} >
  //         {JSON.stringify(_d, null, 2)}
  //       </pre>
  //     );
  //   } else return (<></>);
  // }

  return (
    <div className="ap-manage-business-groups">

      <APComponentHeader header='Business Groups:' />

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      <div className="p-mt-4">
        {renderContent()}
      </div>
      
      {/* DEBUG */}
      {selectedManagedObject &&
        <pre style={ { fontSize: '10px' }} >
          {JSON.stringify({ 
            ...selectedManagedObject, 
            globalSearch: ' not shown',
            apSearchContent: 'not shown'
          }, null, 2)}
          {/* {JSON.stringify(selectedManagedObject, null, 2)} */}
        </pre>
      }
    </div>
  );
}
