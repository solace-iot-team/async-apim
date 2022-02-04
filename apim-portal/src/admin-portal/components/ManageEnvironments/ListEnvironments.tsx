
import React from "react";

import { DataTable } from 'primereact/datatable';
import { Column } from "primereact/column";
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';

import { 
  EnvironmentsService, 
  EnvironmentListItem, 
  CommonEntityNameList
} from '@solace-iot-team/apim-connector-openapi-browser';

import { APComponentHeader } from "../../../components/APComponentHeader/APComponentHeader";
import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { APClientConnectorOpenApi } from "../../../utils/APClientConnectorOpenApi";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { TAPOrganizationId } from "../../../components/APComponentsCommon";
import { E_CALL_STATE_ACTIONS, ManageEnvironmentsCommon, TManagedObjectId, TViewApiObject, TViewManagedObject } from "./ManageEnvironmentsCommon";

import '../../../components/APComponents.css';
import "./ManageEnvironments.css";

export interface IListEnvironmentsProps {
  organizationName: TAPOrganizationId;
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
  onManagedObjectEdit: (managedObjectId: TManagedObjectId, managedObjectDisplayName: string) => void;
  onManagedObjectDelete: (managedObjectId: TManagedObjectId, managedObjectDisplayName: string) => void;
  onManagedObjectView: (managedObjectId: TManagedObjectId, managedObjectDisplayName: string, viewManagedObject: TViewManagedObject) => void;
}
 
export const ListEnvironments: React.FC<IListEnvironmentsProps> = (props: IListEnvironmentsProps) => {
  const componentName = 'ListEnvironments';

  const MessageNoManagedObjectsFoundCreateNew = 'No Environments found - create a new environment.'

  type TApiObject = TViewApiObject;
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
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_ENVIRONMENT_LIST, 'retrieve list of environments');
    try { 
      let environmentList: Array<EnvironmentListItem> = [];
      let hasNextPage: boolean = true;
      let nextPage: number = 1;
      while (hasNextPage) {
        const _environmentList: Array<EnvironmentListItem> = await EnvironmentsService.listEnvironments({
          organizationName: props.organizationName,
          pageNumber: nextPage++,
          pageSize: 100
        });
        if(_environmentList.length === 0) hasNextPage = false;
        else environmentList.push(..._environmentList);
      }
      let _managedObjectList: TManagedObjectList = [];
      for(const environment of environmentList) {
        const apiObject: TApiObject = await EnvironmentsService.getEnvironment({
          organizationName: props.organizationName, 
          envName: environment.name
        });
        const apiApiProductEntityNameList: CommonEntityNameList = await EnvironmentsService.getEnvironmentReferencedByApiProducts({
          organizationName: props.organizationName,
          envName: environment.name
        });
        _managedObjectList.push(ManageEnvironmentsCommon.transformViewApiObjectToViewManagedObject(apiObject, apiApiProductEntityNameList));
      }
      setManagedObjectList(_managedObjectList);
    } catch(e) {
      APClientConnectorOpenApi.logError(logName, e);
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
    const mo: TManagedObject = event.data as TManagedObject;
    props.onManagedObjectView(mo.id, mo.displayName, mo);
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
  const usedByBodyTemplate = (mo: TManagedObject): JSX.Element => {
    if(mo.apiUsedBy_ApiProductEntityNameList.length === 0) return (<>Not used.</>);
    return (<>{`API Products: ${mo.apiUsedBy_ApiProductEntityNameList.length}`}</>);
  }
  // const actionBodyTemplate = (mo: TManagedObject) => {
  //   const isDeleteAllowed: boolean = mo.apiUsedBy_ApiProductEntityNameList.length === 0;
  //   return (
  //     <React.Fragment>
  //       <Button tooltip="edit" icon="pi pi-pencil" className="p-button-rounded p-button-outlined p-button-secondary p-mr-2" onClick={() => props.onManagedObjectEdit(mo.id, mo.displayName)}  />
  //       <Button tooltip="delete" icon="pi pi-trash" className="p-button-rounded p-button-outlined p-button-secondary p-mr-2" onClick={() => props.onManagedObjectDelete(mo.id, mo.displayName)} disabled={!isDeleteAllowed} />
  //     </React.Fragment>
  //   );
  // }

  const renderManagedObjectDataTable = () => {

    const rowExpansionTemplatePubSubService = (managedObject: TManagedObject) => {
      const dataTableList = [managedObject];
      let exposedServiceEndpointsExpandedRows: any = {};
      exposedServiceEndpointsExpandedRows[`${dataTableList[0].id}`] = true;

      const rowExpansionTemplateServiceEndpointList = (managedObject: TManagedObject) => {
        return (
          <div className="sub-sub-table">
            {/* <h5>Endpoints</h5> */}
            <DataTable 
              className="p-datatable-sm"
              value={managedObject.exposedViewServiceEndpointList}
              autoLayout={true}
            >
              <Column field="protocol.name" header="Protocol" />
              <Column field="protocol.version" header="Version" />
              <Column field="attributes" header='Attributes' />
              {/* <Column field="secure" header='Secure?' />
              <Column field="compressed" header='Compressed?' /> */}
              <Column field="uri" header="Endpoint" />
            </DataTable>
          </div>
        );
      }
  
      return (
        <div className="sub-table">
          {/* <h5>PubSub+ Service</h5> */}
          <DataTable 
            className="p-datatable-sm"
            value={dataTableList}
            autoLayout={true}
            expandedRows={exposedServiceEndpointsExpandedRows}
            rowExpansionTemplate={rowExpansionTemplateServiceEndpointList}
            dataKey="id"  
          >
            <Column field="apiObject.serviceId" header="Service Id" />
            <Column field="apiObject.datacenterId" header="Datacenter Id" />
            <Column field="apiObject.serviceTypeId" header="Service Type" />
            <Column field="transformedServiceClassDisplayedAttributes.highAvailability" header="Availability" />
          </DataTable>
        </div>
      );
    }

    return (
      <div className="card p-mt-4">
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
            sortMode="single" 
            sortField="displayName" 
            sortOrder={1}
            // scrollable 
            // scrollHeight="1200px" 
            expandedRows={expandedManagedObjectDataTableRows}
            onRowToggle={(e) => setExpandedManagedObjectDataTableRows(e.data)}
            rowExpansionTemplate={rowExpansionTemplatePubSubService}
            dataKey="id"  
          >
            <Column expander style={{ width: '3em' }} />  
            {/* <Column field="id" header="Id" /> */}
            <Column header="Name" field="displayName" sortable filterField="globalSearch" />
            <Column header="Service Name" field="apiObject.serviceName" sortable />
            <Column header="Msg Vpn Name" field="apiObject.msgVpnName" sortable />
            <Column header="Datacenter Provider" headerStyle={{width: '14em'}} field="apiObject.datacenterProvider" bodyStyle={{textAlign: 'center' }} sortable />
            <Column header="Used By" body={usedByBodyTemplate} bodyStyle={{verticalAlign: 'top'}} />
            {/* <Column field="apiObject.description" header="Description" /> */}
            {/* <Column headerStyle={{width: '8em'}} body={actionBodyTemplate} bodyStyle={{verticalAlign: 'top', textAlign: 'right' }} /> */}
        </DataTable>
      </div>
    );
  }

  return (
    <div className="ap-environments">

      <APComponentHeader header='Environments:' />

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      {managedObjectList.length === 0 && !isGetManagedObjectListInProgress && apiCallStatus && apiCallStatus.success &&
        <h3>{MessageNoManagedObjectsFoundCreateNew}</h3>
      }

      {managedObjectList.length > 0 && 
        renderManagedObjectDataTable()
      }

      {/* DEBUG OUTPUT         */}
      {/* {managedObjectList.length > 0 && selectedManagedObject && 
        <pre>{JSON.stringify(selectedManagedObject, null, 2)}</pre>
      } */}

    </div>
  );
}
