
import React from "react";

import { DataTable } from 'primereact/datatable';
import { Column } from "primereact/column";
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';

import { 
  ApsConfigService, 
  APSConnectorList, 
  APSId, 
  ListApsConnectorsResponse 
} from "../../../_generated/@solace-iot-team/apim-server-openapi-browser";

import { ConfigContext } from "../../../components/ConfigContextProvider/ConfigContextProvider";
import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { APSClientOpenApi } from "../../../utils/APSClientOpenApi";
import { APConnectorHealthCheck, EAPHealthCheckSuccess, TAPConnectorHealthCheckResult } from "../../../utils/APHealthCheck";
import { APConnectorApiCalls, TAPConnectorInfo } from "../../../utils/APConnectorApiCalls";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { E_CALL_STATE_ACTIONS, ManageConnectorsCommon, TViewManagedObject } from "./ManageConnectorsCommon";
import { APComponentHeader } from "../../../components/APComponentHeader/APComponentHeader";

import '../../../components/APComponents.css';
import "./ManageConnectors.css";

export interface IListConnectorsProps {
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
  onManagedObjectEdit: (managedObjectId: APSId, managedObjectDisplayName: string) => void;
  onManagedObjectDelete: (managedObjectId: APSId, managedObjectDisplayName: string) => void;
  onManagedObjectView: (managedObjectId: APSId, managedObjectDisplayName: string, isActive: boolean) => void;
  onSetConnectorActive: (managedObjectId: APSId, managedObjectDisplayName: string) => void;
  onTestConnector: (managedObjectId: APSId, managedObjectDisplayName: string) => void;
}

export const ListConnectors: React.FC<IListConnectorsProps> = (props: IListConnectorsProps) => {
  const componentName = 'ListConnectors';

  const MessageNoManagedObjectsFoundCreateNew = 'No Connectors found - create a new connector.'

  type TManagedObject = TViewManagedObject;
  type TManagedObjectList = Array<TManagedObject>;

  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */  
  const [configContext, dispatchConfigContextAction] = React.useContext(ConfigContext);
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
        const healthCheckResult: TAPConnectorHealthCheckResult = await APConnectorHealthCheck.doHealthCheck(configContext, apsConnector.connectorClientConfig);    
        let apConnectorInfo: TAPConnectorInfo | undefined = undefined;
        if(healthCheckResult.summary.success !== EAPHealthCheckSuccess.FAIL) {
          apConnectorInfo = await APConnectorApiCalls.getConnectorInfo(apsConnector.connectorClientConfig);
        }
        _managedObjectList.push(ManageConnectorsCommon.createViewManagedObject(apsConnector, apConnectorInfo, healthCheckResult));
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
    const managedObject: TManagedObject = event.data as TManagedObject;
    props.onManagedObjectView(managedObject.id, managedObject.displayName, managedObject.apsConnector.isActive);
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
          <Button tooltip="edit" icon="pi pi-pencil" className="p-button-rounded p-button-outlined p-button-secondary p-mr-2" onClick={() => props.onManagedObjectEdit(managedObject.id, managedObject.displayName)}  />
          {/* {!managedObject.apsConnector.isActive &&  */}
            <Button tooltip="delete" icon="pi pi-trash" className="p-button-rounded p-button-outlined p-button-secondary p-mr-2" onClick={() => props.onManagedObjectDelete(managedObject.id, managedObject.displayName)} />
          {/* } */}
          <Button tooltip="test" icon="pi pi-fast-forward" className="p-button-rounded p-button-outlined p-button-secondary p-mr-2" onClick={() => props.onTestConnector(managedObject.id, managedObject.displayName)} />
          {!managedObject.apsConnector.isActive && 
            <Button tooltip="set to active" icon="pi pi-check" className="p-button-rounded p-button-outlined p-button-secondary p-mr-2" onClick={() => props.onSetConnectorActive(managedObject.id, managedObject.displayName)} />
          }
        </React.Fragment>
    );
  }

  const infoBodyTemplate = (managedObject: TManagedObject) => {
    let EventPortalIsProxyMode: string = '?';
    let ConnectorVersion: string = '?';
    let ConnectorOpenApiVersion: string = '?';
    if(managedObject.apConnectorInfo) {
      const portalAbout = managedObject.apConnectorInfo.connectorAbout.portalAbout;
      EventPortalIsProxyMode = portalAbout.isEventPortalApisProxyMode ? 'ON' : 'OFF';
      if(portalAbout.connectorServerVersionStr) ConnectorVersion = portalAbout.connectorServerVersionStr; 
      if(portalAbout.connectorOpenApiVersionStr) ConnectorOpenApiVersion = portalAbout.connectorOpenApiVersionStr; 
    }
    return (
      <div>
        <div>EventPortal:Event API Products proxy: {EventPortalIsProxyMode}</div>
        <div>Connector Version: {ConnectorVersion}</div>
        <div>API Version: {ConnectorOpenApiVersion}</div>
      </div>
    )
  }

  const renderManagedObjectDataTable = () => {
    
    const rowExpansionTemplate = (mo: TManagedObject) => {
      const dataTableList = [mo];
      return (
        <div className="sub-table">
          <DataTable 
            className="p-datatable-sm"
            value={dataTableList}
            autoLayout={true}
          >
            <Column header="URL" headerStyle={{ width: '35%' }} field="composedConnectorUrl"  />
            <Column header="Service User" field="apsConnector.connectorClientConfig.serviceUser" />
            <Column header="Service User Password" field="apsConnector.connectorClientConfig.serviceUserPwd" />
          </DataTable>
        </div>
      );
    }

    return (
      <div className="card">
          <DataTable
            className="p-datatable-sm"
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
            scrollHeight="800px" 
            expandedRows={expandedManagedObjectDataTableRows}
            onRowToggle={(e) => setExpandedManagedObjectDataTableRows(e.data)}
            rowExpansionTemplate={rowExpansionTemplate}
            dataKey="id"  
          >
            <Column expander style={{ width: '3em' }} />  
            <Column header="Name" field="displayName" sortable filterField="globalSearch" />
            <Column header="Info" body={infoBodyTemplate}/>
            <Column header="Active?" headerStyle={{ width: '7em', textAlign: 'center' }} field="isActive" bodyStyle={{textAlign: 'center'}} body={ManageConnectorsCommon.isActiveBodyTemplate} />
            <Column header="Health Check" headerStyle={{width: '12em', textAlign: 'center' }} bodyStyle={{textAlign: 'center'}} body={ManageConnectorsCommon.healthCheckBodyTemplate}/>
            <Column headerStyle={{width: '13em'}} body={actionBodyTemplate} bodyStyle={{textAlign: 'right', verticalAlign: 'top' }}/>
            <Column headerStyle={{width: '2em'}} />
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

      {managedObjectList.length > 0 && !isGetManagedObjectListInProgress &&
        renderManagedObjectDataTable()
      }
      
      {/* ** DEBUG ** */}
      {/* {managedObjectList.length > 0 && selectedManagedObject && 
        <pre style={ { fontSize: '10px' }} >
          {JSON.stringify(selectedManagedObject, null, 2)}
        </pre>
      } */}

    </div>
  );
}
