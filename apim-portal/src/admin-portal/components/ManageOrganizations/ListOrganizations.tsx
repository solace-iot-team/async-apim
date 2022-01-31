
import React from "react";

import { DataTable } from 'primereact/datatable';
import { Column } from "primereact/column";
import { InputText } from 'primereact/inputtext';

import { 
  CommonDisplayName,
  CommonName
} from '@solace-iot-team/apim-connector-openapi-browser';

import { APComponentHeader } from "../../../components/APComponentHeader/APComponentHeader";
import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { APClientConnectorOpenApi } from "../../../utils/APClientConnectorOpenApi";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { 
  E_CALL_STATE_ACTIONS, 
  ManageOrganizationsCommon, 
  TAPOrganizationConfig, 
} from "./ManageOrganizationsCommon";
import { APConnectorApiCalls } from "../../../utils/APConnectorApiCalls";

import '../../../components/APComponents.css';
import "./ManageOrganizations.css";
import { APOrganizationsService, TAPOrganizationList } from "../../../utils/APOrganizationsService";

export interface IListOrganizationsProps {
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
  onManagedObjectEdit: (managedObjectId: CommonName, managedObjectDisplayName: CommonDisplayName) => void;
  onManagedObjectDelete: (managedObjectId: CommonName, managedObjectDisplayName: CommonDisplayName) => void;
  onManagedObjectView: (managedObjectId: CommonName, managedObjectDisplayName: CommonDisplayName) => void;
}

export const ListOrganizations: React.FC<IListOrganizationsProps> = (props: IListOrganizationsProps) => {
  const componentName = 'ListOrganizations';
  const MessageNoManagedObjectsFoundCreateNew = 'No Organizations found - create a new organization.'

  type TManagedObject = TAPOrganizationConfig;
  type TManagedObjectList = Array<TManagedObject>;

  const [managedObjectList, setManagedObjectList] = React.useState<TManagedObjectList>([]);  
  const [selectedManagedObject, setSelectedManagedObject] = React.useState<TManagedObject>();
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
      const apOrganizationList: TAPOrganizationList = await APOrganizationsService.listOrganizations({});
      for(const apOrganization of apOrganizationList) {
        const mo: TManagedObject = ManageOrganizationsCommon.transformAPOrganizationToAPOrganizationConfig(apOrganization);
        // console.log(`${logName}: mo = ${JSON.stringify(mo, null, 2)}`);
        _managedObjectList.push({...mo});
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
    props.onManagedObjectView(mo.name, mo.displayName);
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
          <InputText type="search" placeholder="Search ..." onInput={onInputGlobalFilter} style={{width: '500px'}}/>
        </span>
      </div>
    );
  }

  const renderManagedObjectDataTable = () => {
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
            sortMode="single" sortField="displayName" sortOrder={1}
            scrollable 
            dataKey="name"
          >
            <Column field="displayName" header="Name" sortable />
            <Column field="configType" header="Type" sortable />
            <Column field="name" header="Id" sortable />
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
