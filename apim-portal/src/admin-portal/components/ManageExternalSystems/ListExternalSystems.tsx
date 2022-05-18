
import React from "react";

import { DataTable } from 'primereact/datatable';
import { Column } from "primereact/column";
import { InputText } from 'primereact/inputtext';
import { MenuItem } from "primereact/api";

import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { APComponentHeader } from "../../../components/APComponentHeader/APComponentHeader";
import { Globals } from "../../../utils/Globals";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { E_CALL_STATE_ACTIONS } from "./ManageExternalSystemsCommon";
import APExternalSystemsDisplayService, { 
  TAPExternalSystemDisplay, 
  TAPExternalSystemDisplayList 
} from "../../../displayServices/APExternalSystemsDisplayService";
import { APSClientOpenApi } from "../../../utils/APSClientOpenApi";

import '../../../components/APComponents.css';
import "./ManageExternalSystems.css";

export interface IListExternalSystemsProps {
  organizationId: string;
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
  onManagedObjectEdit: (managedObjectId: string, managedObjectDisplayName: string) => void;
  onManagedObjectDelete: (managedObjectId: string, managedObjectDisplayName: string) => void;
  onManagedObjectView: (managedObjectId: string, managedObjectDisplayName: string, hasReferences: boolean) => void;
  setBreadCrumbItemList: (itemList: Array<MenuItem>) => void;
}

export const ListExternalSystems: React.FC<IListExternalSystemsProps> = (props: IListExternalSystemsProps) => {
  const ComponentName = 'ListExternalSystems';

  const MessageNoManagedObjectsFoundCreateNew = 'No External Systems found.';
  const GlobalSearchPlaceholder = 'search...';

  type TManagedObject = TAPExternalSystemDisplay;
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
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_EXTERNAL_SYSTEM_LIST, 'retrieve list of external systems');
    try {
      const list: TAPExternalSystemDisplayList = await APExternalSystemsDisplayService.apiGetList_ApExternalSystemDisplay({
        organizationId: props.organizationId
      });
      // alert(`${logName}: list = ${JSON.stringify(list, null, 2)}`);
      setManagedObjectList(list);
    } catch(e: any) {
      APSClientOpenApi.logError(logName, e);
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
    props.onManagedObjectView(mo.apEntityId.id, mo.apEntityId.displayName, mo.apBusinessGroupExternalDisplayList.length > 0);
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

  const referencedByBodyTemplate = (rowData: TManagedObjectTableDataRow): JSX.Element => {
    if(rowData.apBusinessGroupExternalDisplayList.length === 0) return (<>Business Groups: None.</>);
    return (<>{`Business Groups: ${rowData.apBusinessGroupExternalDisplayList.length}`}</>);
  }
  const desriptionBodyTemplate = (rowData: TManagedObjectTableDataRow): JSX.Element => {
    return (<>{rowData.description}</>);
  }
  const marketplaceBodyTemplate = (rowData: TManagedObjectTableDataRow): JSX.Element => {
    return (<>{String(rowData.isMarketplaceDestination)}</>);
  }
  const nameBodyTemplate = (rowData: TManagedObjectTableDataRow): string => {
    return rowData.apEntityId.displayName;
  }
  const renderManagedObjectDataTable = () => {
    const managedObjectTableDataList: TManagedObjectTableDataList = transformManagedObjectList_To_TableDataList(managedObjectList);    
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
            <Column header="Description" body={desriptionBodyTemplate} bodyStyle={{verticalAlign: 'top'}} />
            <Column header="Marketplace" body={marketplaceBodyTemplate} bodyStyle={{verticalAlign: 'top'}} />
            <Column header="References" headerStyle={{width: '15em' }} body={referencedByBodyTemplate} bodyStyle={{verticalAlign: 'top'}} />
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
    <div className="ap-manage-external-system">

      <APComponentHeader header='Exernal Systems:' />

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      <div className="p-mt-4">
        {renderContent()}
      </div>
      
      {/* DEBUG OUTPUT         */}
      {/* {Config.getUseDevelTools() && renderDebugSelectedManagedObject()} */}

    </div>
  );
}
