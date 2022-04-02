
import React from "react";

import { InputText } from "primereact/inputtext";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from 'primereact/button';

import APEntityIdsService, { TAPEntityIdList } from "../../../../utils/APEntityIdsService";
import { ApiCallState, TApiCallState } from "../../../../utils/ApiCallState";
import APEnvironmentsDisplayService, { 
  TAPEnvironmentDisplay, 
  TAPEnvironmentDisplayList
} from "../../../../displayServices/APEnvironmentsDisplayService";
import { E_CALL_STATE_ACTIONS } from "../ManageApiProductsCommon";
import { APClientConnectorOpenApi } from "../../../../utils/APClientConnectorOpenApi";
import { APComponentHeader } from "../../../../components/APComponentHeader/APComponentHeader";
import { ApiCallStatusError } from "../../../../components/ApiCallStatusError/ApiCallStatusError";

import '../../../../components/APComponents.css';
import "../ManageApiProducts.css";

export interface ISearchSelectEnvironmentsProps {
  organizationId: string;
  selectedEnvironmentEntityIdList: TAPEntityIdList;
  onError: (apiCallState: TApiCallState) => void;
  onSave: (apEnvironmentDisplayList: TAPEnvironmentDisplayList) => void;
  onCancel: () => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const SearchSelectEnvironments: React.FC<ISearchSelectEnvironmentsProps> = (props: ISearchSelectEnvironmentsProps) => {
  const ComponentName = 'SearchSelectEnvironments';

  type TManagedObject = TAPEnvironmentDisplay;
  type TManagedObjectList = Array<TManagedObject>;

  const DialogHeader = 'Search & Select Environment(s):';
  const MessageNoManagedObjectsFound = "No Environments found."
  const MessageNoManagedObjectsFoundWithFilter = 'No Environments found for filter';
  // const GlobalSearchPlaceholder = 'Enter search word list separated by <space> ...';
  const GlobalSearchPlaceholder = 'search...';


  const [managedObjectList, setManagedObjectList] = React.useState<TManagedObjectList>();
  const [selectedManagedObjectList, setSelectedManagedObjectList] = React.useState<TManagedObjectList>();
  const [isInitialialized, setIsInitialized] = React.useState<boolean>(false);
  
  // const [managedObjectTableDataList, setManagedObjectTableDataList] = React.useState<TAPEnvironmentDisplayList>();
  // const [selectedManagedObjectTableDataList, setSelectedManagedObjectTableDataList] = React.useState<TAPEnvironmentDisplayList>();
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [globalFilter, setGlobalFilter] = React.useState<string>();  // * Data Table *
  const dt = React.useRef<any>(null);

  // * Api Calls *
  const apiGetManagedObjectList = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObjectList';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_ENVIRONMENT_LIST, 'retrieve list of environments');
    try {
      const list: TAPEnvironmentDisplayList = await APEnvironmentsDisplayService.apiGetList_ApEnvironmentDisplay({
        organizationId: props.organizationId
      });
      setManagedObjectList(list);
    } catch(e: any) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const doInitialize = async () => {
    props.onLoadingChange(true);
    await apiGetManagedObjectList();
    props.onLoadingChange(false);
  }

  React.useEffect(() => {
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(managedObjectList === undefined) return;
    setSelectedManagedObjectList(
      APEntityIdsService.create_ApDisplayObjectList_FilteredBy_EntityIdList<TAPEnvironmentDisplay>({
        apDisplayObjectList: managedObjectList,
        filterByEntityIdList: props.selectedEnvironmentEntityIdList
      })
    );
  }, [managedObjectList]); /* eslint-disable-line react-hooks/exhaustive-deps */
  
  React.useEffect(() => {
    if(selectedManagedObjectList === undefined) return;
    setIsInitialized(true);
  }, [selectedManagedObjectList]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */
  
  // * UI Controls *

  const onSaveSelectedEnvironments = () => {
    const funcName = 'onSaveSelectedEnvironments';
    const logName = `${ComponentName}.${funcName}()`;
    if(selectedManagedObjectList === undefined) throw new Error(`${logName}: selectedManagedObjectList === undefined`);
    props.onSave(selectedManagedObjectList);
  }

  // * Data Table *
  const onInputGlobalFilter = (event: React.FormEvent<HTMLInputElement>) => {
    const _globalFilter: string | undefined = event.currentTarget.value !== '' ? event.currentTarget.value : undefined;
    setGlobalFilter(_globalFilter);
  }
 
  const renderDataTableHeader = (): JSX.Element => {
    const funcName = 'renderDataTableHeader';
    const logName = `${ComponentName}.${funcName}()`;
    if(selectedManagedObjectList === undefined) throw new Error(`${logName}: selectedManagedObjectList === undefined`);
    const isSaveDisabled: boolean = selectedManagedObjectList.length === 0;
    return (
      <div className="table-header">
        <div style={{ whiteSpace: "nowrap"}}>
          <Button type="button" label="Save" className="p-button-text p-button-plain p-button-outlined p-mr-2" onClick={onSaveSelectedEnvironments} disabled={isSaveDisabled} />
          <Button type="button" label="Cancel" className="p-button-text p-button-plain p-mr-2" onClick={props.onCancel} />
        </div>        
        <div style={{ alignContent: "right"}}>
          <span className="p-input-icon-left" >
            <i className="pi pi-search" />
            <InputText 
              type="search" placeholder={GlobalSearchPlaceholder} style={{width: '500px'}} 
              disabled={false} 
              onInput={onInputGlobalFilter}  
              value={globalFilter}
            />
          </span>
        </div>
      </div>
    );
  }

  const onSelectionChange = (event: any): void => {
    setSelectedManagedObjectList(event.value);
  }

  const renderManagedObjectTableEmptyMessage = () => {
    if(globalFilter && globalFilter !== '') return `${MessageNoManagedObjectsFoundWithFilter}: ${globalFilter}.`;
    else return MessageNoManagedObjectsFound;
  }

  const renderManagedObjectDataTable = (): JSX.Element => {
    const dataKey = APEnvironmentsDisplayService.nameOf_ApEntityId('id');
    const sortField = APEnvironmentsDisplayService.nameOf_ApEntityId('displayName');
    return (
      <div className="card">
          <DataTable
            ref={dt}
            className="p-datatable-sm"
            autoLayout={true}
            resizableColumns 
            columnResizeMode="fit"
            showGridlines={false}
            header={renderDataTableHeader()}
            value={managedObjectList}
            globalFilter={globalFilter}
            scrollable 
            scrollHeight="800px" 
            dataKey={dataKey}
            emptyMessage={renderManagedObjectTableEmptyMessage()}
            // selection
            selection={selectedManagedObjectList}
            onSelectionChange={onSelectionChange}
            // sorting
            sortMode='single'
            sortField={sortField}
            sortOrder={1}
          >
            <Column selectionMode="multiple" style={{width:'3em'}}/>
            <Column header="Name" field={sortField} filterField="apSearchContent" sortable />
            <Column header="Service Name" field="connectorEnvironmentResponse.serviceName" sortable />
            <Column header="Msg Vpn Name" field="connectorEnvironmentResponse.msgVpnName" sortable />
            <Column header="Datacenter Provider" field="connectorEnvironmentResponse.datacenterProvider" sortable />
            {/* <Column header="Description" field="connectorEnvironmentResponse.description" /> */}
        </DataTable>
      </div>
    );
  }

  return (
    <div className="manage-api-products">

      <APComponentHeader header={DialogHeader} />  

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      { isInitialialized && renderManagedObjectDataTable() }

      {/* DEBUG */}
      {/* {managedObjectTableDataList.length > 0 && selectedManagedObjectTableDataList && 
        <pre style={ { fontSize: '12px' }} >
          {JSON.stringify(selectedManagedObjectTableDataList, null, 2)}
        </pre>
      } */}

    </div>
  );
}

