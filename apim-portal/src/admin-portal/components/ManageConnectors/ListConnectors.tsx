
import React from "react";

import { DataTable } from 'primereact/datatable';
import { Column } from "primereact/column";
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';

import { 
  ApsConfigService, 
  APSConnectorList, 
  ListApsConnectorsResponse 
} from "@solace-iot-team/apim-server-openapi-browser";

import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { APSClientOpenApi } from "../../../utils/APSClientOpenApi";
import { APConnectorHealthCheck, THealthCheckResult } from "../../../utils/APConnectorHealthCheck";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { E_CALL_STATE_ACTIONS, ManageConnectorsCommon, TManagedObjectId, TViewManagedObject } from "./ManageConnectorsCommon";

import '../../../components/APComponents.css';
import "./ManageConnectors.css";
import { APComponentHeader } from "../../../components/APComponentHeader/APComponentHeader";

export interface IListConnectorsProps {
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
  onManagedObjectEdit: (managedObjectId: TManagedObjectId, managedObjectDisplayName: string) => void;
  onManagedObjectDelete: (managedObjectId: TManagedObjectId, managedObjectDisplayName: string) => void;
  onManagedObjectView: (managedObjectId: TManagedObjectId, managedObjectDisplayName: string, isActive: boolean) => void;
  onSetConnectorActive: (managedObjectId: TManagedObjectId, managedObjectDisplayName: string) => void;
  onTestConnector: (managedObjectId: TManagedObjectId, managedObjectDisplayName: string) => void;
}

export const ListConnectors: React.FC<IListConnectorsProps> = (props: IListConnectorsProps) => {
  const componentName = 'ListConnectors';

  const MessageNoManagedObjectsFoundCreateNew = 'No Connectors found - create a new connector.'

  type TManagedObject = TViewManagedObject;
  type TManagedObjectList = Array<TManagedObject>;

  const [managedObjectList, setManagedObjectList] = React.useState<TManagedObjectList>([]);  
  const [selectedManagedObject, setSelectedManagedObject] = React.useState<TManagedObject>();
  const [expandedManagedObjectDataTableRows, setExpandedManagedObjectDataTableRows] = React.useState<any>(null);
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [isGetManagedObjectListInProgress, setIsGetManagedObjectListInProgress] = React.useState<boolean>(false);

  // * Data Table *
  const [globalFilter, setGlobalFilter] = React.useState<string>('');
  const dt = React.useRef<any>(null);

  // * Api Calls *
  const apiGetManagedObjectList = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObjectList';
    const logName = `${componentName}.${funcName}()`;
    setIsGetManagedObjectListInProgress(true);
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_CONNECTOR_LIST, 'retrieve list of connectors');
    try { 
      const listApsConnectorsResponse: ListApsConnectorsResponse = await ApsConfigService.listApsConnectors();  
      const apsConnectorList: APSConnectorList = listApsConnectorsResponse.list;
      let _managedObjectList: TManagedObjectList = [];
      for(const apsConnector of apsConnectorList) {
        const healthCheckResult: THealthCheckResult = await APConnectorHealthCheck.doHealthCheck(apsConnector.connectorClientConfig);    
        _managedObjectList.push(ManageConnectorsCommon.transformViewApiObjectToViewManagedObject(apsConnector, healthCheckResult));
      }
      setManagedObjectList(_managedObjectList);
    } catch(e: any) {
      APSClientOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    setIsGetManagedObjectListInProgress(false);
    return callState;
  }

  // * useEffect Hooks *
  const doInitialize = async () => {
    props.onLoadingChange(true);
    await apiGetManagedObjectList();
    props.onLoadingChange(false);
  }

  React.useEffect(() => {
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
    const managedObject: TManagedObject = event.data as TManagedObject;
    props.onManagedObjectView(managedObject.id, managedObject.displayName, managedObject.apiObject.isActive);
  }

  const onExpandAll = () => {
    let _expandedRows: any = {};
    managedObjectList.forEach( (mangedObject: TManagedObject) => {
      _expandedRows[`${mangedObject.id}`] = true;
    });
    setExpandedManagedObjectDataTableRows(_expandedRows);
  }

  const onCollapseAll = () => {
    setExpandedManagedObjectDataTableRows(null);
  }

  const onInputGlobalFilter = (event: React.FormEvent<HTMLInputElement>) => {
    setGlobalFilter(event.currentTarget.value);
  }
  const renderDataTableHeader = (): JSX.Element => {
    return (
      <div className="table-header">
        {/* <h2 className="p-m-0">{DataTableHeader}</h2> */}
        <div className="table-header-container">
          <Button icon="pi pi-plus" label="Expand All" onClick={onExpandAll} className="p-button-rounded p-button-outlined p-button-secondary p-mr-2" />
          <Button icon="pi pi-minus" label="Collapse All" onClick={onCollapseAll} className="p-button-rounded p-button-outlined p-button-secondary" />
        </div>        
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText type="search" placeholder="Search ..." onInput={onInputGlobalFilter} style={{width: '500px'}}/>
        </span>
      </div>
    );
  }
  const actionBodyTemplate = (managedObject: TManagedObject) => {
    return (
        <React.Fragment>
          <Button tooltip="view" icon="pi pi-folder-open" className="p-button-rounded p-button-outlined p-button-secondary p-mr-2" onClick={() => props.onManagedObjectView(managedObject.id, managedObject.displayName, managedObject.apiObject.isActive)} />
          <Button tooltip="edit" icon="pi pi-pencil" className="p-button-rounded p-button-outlined p-button-secondary p-mr-2" onClick={() => props.onManagedObjectEdit(managedObject.id, managedObject.displayName)}  />
          <Button tooltip="delete" icon="pi pi-trash" className="p-button-rounded p-button-outlined p-button-secondary p-mr-2" onClick={() => props.onManagedObjectDelete(managedObject.id, managedObject.displayName)} />
          <Button tooltip="test" icon="pi pi-fast-forward" className="p-button-rounded p-button-outlined p-button-secondary p-mr-2" onClick={() => props.onTestConnector(managedObject.id, managedObject.displayName)} />
          {!managedObject.apiObject.isActive && 
            <Button tooltip="set to active" icon="pi pi-check" className="p-button-rounded p-button-outlined p-button-secondary p-mr-2" onClick={() => props.onSetConnectorActive(managedObject.id, managedObject.displayName)} />
          }
        </React.Fragment>
    );
  }

  const renderManagedObjectDataTable = () => {
    
    const rowExpansionTemplate = (managedObject: TManagedObject) => {
      const dataTableList = [managedObject.apiObject.connectorClientConfig];
      return (
        <div className="sub-table">
          <DataTable 
            className="p-datatable-sm"
            value={dataTableList}
            autoLayout={true}
          >
            <Column field="protocol" header="Protocol" />
            <Column field="host" header="Host" />
            <Column field="port" header='Port' />
            <Column field="apiVersion" header='API Version' />
            <Column field="serviceUser" header="Service User" />
            <Column field="serviceUserPwd" header="Service User Password" />
          </DataTable>
        </div>
      );
    }

    return (
      <div className="card">
          <DataTable
            ref={dt}
            autoLayout={true}
            header={renderDataTableHeader()}
            value={managedObjectList}
            globalFilter={globalFilter}
            selectionMode="single"
            selection={selectedManagedObject}
            onRowClick={onManagedObjectSelect}
            onRowDoubleClick={(e) => onManagedObjectOpen(e)}
            sortMode="single" sortField="name" sortOrder={1}
            scrollable 
            scrollHeight="1200px" 
            expandedRows={expandedManagedObjectDataTableRows}
            onRowToggle={(e) => setExpandedManagedObjectDataTableRows(e.data)}
            rowExpansionTemplate={rowExpansionTemplate}
            dataKey="id"  
          >
            <Column expander style={{ width: '3em' }} />  
            <Column field="isActive" header="Active?" body={ManageConnectorsCommon.isActiveBodyTemplate} sortable />
            <Column field="healthCheckPassed" header="Health Check" sortable />
            <Column field="id" header="Id" />
            <Column field="displayName" header="Name" sortable filterField="globalSearch" />
            <Column field="description" header="Description" />
            <Column body={actionBodyTemplate} headerStyle={{width: '20em', textAlign: 'center'}} bodyStyle={{textAlign: 'left', overflow: 'visible'}}/>
        </DataTable>
      </div>
    );
  }

  return (
    <div className="manage-connectors">

      <APComponentHeader header='Connectors:' />

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      {managedObjectList.length === 0 && !isGetManagedObjectListInProgress && apiCallStatus && apiCallStatus.success &&
        <h3>{MessageNoManagedObjectsFoundCreateNew}</h3>
      }

      {managedObjectList.length > 0 && 
        renderManagedObjectDataTable()
      }
      
      {/* {managedObjectList.length > 0 && selectedManagedObject && 
        <pre style={ { fontSize: '12px' }} >
          {JSON.stringify(selectedManagedObject, null, 2)}
        </pre>
      } */}

    </div>
  );
}
