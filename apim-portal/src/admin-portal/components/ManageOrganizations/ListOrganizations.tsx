
import React from "react";

import { DataTable } from 'primereact/datatable';
import { Column } from "primereact/column";
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';

import { 
  AdministrationService, 
  EnvironmentsService, 
  ApisService, 
  ApiProductsService, 
  DevelopersService, 
  AppsService 
} from '@solace-iot-team/apim-connector-openapi-browser';

import { APComponentHeader } from "../../../components/APComponentHeader/APComponentHeader";
import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { APClientConnectorOpenApi } from "../../../utils/APClientConnectorOpenApi";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { E_CALL_STATE_ACTIONS, ManageOrganizationsCommon, TManagedObjectId, TViewManagedObject } from "./ManageOrganizationsCommon";

import '../../../components/APComponents.css';
import "./ManageOrganizations.css";

export interface IListOrganizationsProps {
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
  onManagedObjectEdit: (managedObjectId: TManagedObjectId, managedObjectDisplayName: string) => void;
  onManagedObjectDelete: (managedObjectId: TManagedObjectId, managedObjectDisplayName: string) => void;
  onManagedObjectView: (managedObjectId: TManagedObjectId, managedObjectDisplayName: string) => void;
}

export const ListOrganizations: React.FC<IListOrganizationsProps> = (props: IListOrganizationsProps) => {
  const componentName = 'ListOrganizations';

  const MessageNoManagedObjectsFoundCreateNew = 'No Organizations found - create a new organization.'

  type TManagedObject = TViewManagedObject;
  type TManagedObjectList = Array<TManagedObject>;

  const [managedObjectList, setManagedObjectList] = React.useState<TManagedObjectList>([]);  
  const [selectedManagedObject, setSelectedManagedObject] = React.useState<TManagedObject>();
  const [expandedManagedObjectDataTableRows, setExpandedManagedObjectDataTableRows] = React.useState<any>(null);
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [isGetManagedObjectListInProgress, setIsGetManagedObjectListInProgress] = React.useState<boolean>(false);

  // * Data Table *
  const [globalFilter, setGlobalFilter] = React.useState<string>();
  const dt = React.useRef<any>(null);

  // * Api Calls *
  const apiGetManagedObjectList = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObjectList';
    const logName = `${componentName}.${funcName}()`;
    setIsGetManagedObjectListInProgress(true);
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_ORGANIZATION_LIST, 'retrieve list of organizations');
    try { 
      let _managedObjectList: TManagedObjectList = [];
      const apiOrganizationList = await AdministrationService.listOrganizations({});
      for(const apiOrganization of apiOrganizationList) {
        const envResponse = await EnvironmentsService.listEnvironments({
          organizationName: apiOrganization.name, 
          pageNumber: 1,
          pageSize: 1
        });        
        const apiProductResponse = await ApiProductsService.listApiProducts({
          organizationName: apiOrganization.name, 
          pageNumber: 1,
          pageSize: 1
        });
        const developerResponse = await DevelopersService.listDevelopers({
          organizationName: apiOrganization.name, 
          pageNumber: 1,
          pageSize: 1
        });
        const appResponse = await AppsService.listApps({
          organizationName: apiOrganization.name, 
          pageNumber: 1,
          pageSize: 1
        });
        _managedObjectList.push({
          ...ManageOrganizationsCommon.transformViewApiObjectToViewManagedObject(apiOrganization),
          hasInfo: {
            hasEnvironments: envResponse.length > 0,
            // hasApis: apiResponse.length > 0,
            hasApiProducts: apiProductResponse.length > 0,
            hasApps: appResponse.length > 0,
            hasDevelopers: developerResponse.length > 0
          }
        });
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
    props.onManagedObjectView(managedObject.id, managedObject.displayName);
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
          <Button tooltip="view" icon="pi pi-folder-open" className="p-button-rounded p-button-outlined p-button-secondary p-mr-2" onClick={() => props.onManagedObjectView(managedObject.id, managedObject.displayName)} />
          <Button tooltip="edit" icon="pi pi-pencil" className="p-button-rounded p-button-outlined p-button-secondary p-mr-2" onClick={() => props.onManagedObjectEdit(managedObject.id, managedObject.displayName)}  />
          <Button tooltip="delete" icon="pi pi-trash" className="p-button-rounded p-button-outlined p-button-secondary p-mr-2" onClick={() => props.onManagedObjectDelete(managedObject.id, managedObject.displayName)} />
        </React.Fragment>
    );
  }

  const renderManagedObjectDataTable = () => {
    // const funcName = 'renderManagedObjectDataTable';
    // const logName = `${componentName}.${funcName}()`;
    
    const rowExpansionTemplate = (managedObject: TManagedObject) => {

      const dataTableList = [managedObject];
  
      return (
        <div className="sub-table">
          <DataTable 
            className="p-datatable-sm"
            value={dataTableList}
            autoLayout={true}
            dataKey="id"
          >
            <Column field="hasInfo.hasEnvironments" header="Environments" body={ManageOrganizationsCommon.hasEnvironmentsBodyTemplate} />
            {/* <Column field="hasInfo.hasApis" header="APIs" body={ManageOrganizationsCommon.hasApisBodyTemplate} /> */}
            <Column field="hasInfo.hasApiProducts" header="API Products" body={ManageOrganizationsCommon.hasApiProductsBodyTemplate}/>
            <Column field="hasInfo.hasDevelopers" header="Developers" body={ManageOrganizationsCommon.hasDevelopersBodyTemplate} />
            <Column field="hasInfo.hasApps" header="Apps" body={ManageOrganizationsCommon.hasAppsBodyTemplate}/>
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
            <Column field="displayName" header="Name" sortable filterField="globalSearch" />
            <Column field="type" header="Type" />
            <Column body={actionBodyTemplate} headerStyle={{width: '15em', textAlign: 'center'}} bodyStyle={{textAlign: 'left', overflow: 'visible'}}/>
        </DataTable>
      </div>
    );
  }

  return (
    <div className="manage-organizations">

      <APComponentHeader header='Organizations:' />

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      {managedObjectList.length === 0 && !isGetManagedObjectListInProgress && apiCallStatus && apiCallStatus.success &&
        <h3>{MessageNoManagedObjectsFoundCreateNew}</h3>
      }

      {managedObjectList.length > 0 && !isGetManagedObjectListInProgress &&
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
