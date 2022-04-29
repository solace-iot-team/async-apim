
import React from "react";

import { DataTable } from 'primereact/datatable';
import { Column } from "primereact/column";
import { InputText } from 'primereact/inputtext';
import { MenuItem, MenuItemCommandParams } from "primereact/api";
import { Divider } from "primereact/divider";

import { APComponentHeader } from "../../../components/APComponentHeader/APComponentHeader";
import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { APClientConnectorOpenApi } from "../../../utils/APClientConnectorOpenApi";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import APSystemOrganizationsDisplayService, { 
  IAPSystemOrganizationDisplay, 
  TAPSystemOrganizationDisplayList 
} from "../../../displayServices/APOrganizationsDisplayService/APSystemOrganizationsDisplayService";
import { E_CALL_STATE_ACTIONS } from "./ManageOrganizationsCommon";
import { TAPEntityId } from "../../../utils/APEntityIdsService";

import '../../../components/APComponents.css';
import "./ManageOrganizations.css";

export interface IListImportableSystemOrganizationsProps {
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
  onManagedObjectOpen: (organizationEntityId: TAPEntityId) => void;
  setBreadCrumbItemList: (itemList: Array<MenuItem>) => void;
  onNavigateHereCommand: () => void;
}

export const ListImportableSystemOrganizations: React.FC<IListImportableSystemOrganizationsProps> = (props: IListImportableSystemOrganizationsProps) => {
  const ComponentName = 'ListImportableSystemOrganizations';
  
  const MessageNoManagedObjectsFound = 'No Importable Organizations found.'
  const GlobalSearchPlaceholder = 'search...';

  type TManagedObject = IAPSystemOrganizationDisplay;
  type TManagedObjectList = Array<TManagedObject>;

  const [managedObjectList, setManagedObjectList] = React.useState<TManagedObjectList>();  
  const [isInitialized, setIsInitialized] = React.useState<boolean>(false); 
  const [selectedManagedObject, setSelectedManagedObject] = React.useState<TManagedObject>();
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [globalFilter, setGlobalFilter] = React.useState<string>();
  const dt = React.useRef<any>(null);

  // * Api Calls *
  const apiGetManagedObjectList = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObjectList';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_ORGANIZATION_LIST, 'retrieve list of organizations');
    try { 
      const apSystemOrganizationDisplayList: TAPSystemOrganizationDisplayList = await APSystemOrganizationsDisplayService.apiGetList_Importable_ApSystemOrganizationDisplayList();
      setManagedObjectList(apSystemOrganizationDisplayList);
    } catch(e) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const ListImportableSystemOrganizations_onNavigateToCommand = (e: MenuItemCommandParams): void => {
    props.onNavigateHereCommand();
  }

  const doInitialize = async () => {
    props.onLoadingChange(true);
    await apiGetManagedObjectList();
    props.onLoadingChange(false);
  }

  const setBreadCrumbItemList = () => {
    props.setBreadCrumbItemList([
      {
        label: 'Import an Organization',
        command: ListImportableSystemOrganizations_onNavigateToCommand
      },
    ]);
  }

  // * useEffect Hooks *

  React.useEffect(() => {
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(managedObjectList === undefined) return;
    setBreadCrumbItemList();
    setIsInitialized(true);
  }, [managedObjectList]); /* eslint-disable-line react-hooks/exhaustive-deps */

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
    props.onManagedObjectOpen(mo.apEntityId);
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

  const renderManagedObjectDataTable = () => {
    const idField = APSystemOrganizationsDisplayService.nameOf_ApEntityId('id');
    const nameField = APSystemOrganizationsDisplayService.nameOf_ApEntityId('displayName');
    const filterField = APSystemOrganizationsDisplayService.nameOf<IAPSystemOrganizationDisplay>('apSearchContent');

    return (
      <div className="card">
          <DataTable
            ref={dt}
            className="p-datatable-sm"

            resizableColumns 
            columnResizeMode="fit"
            showGridlines={false}
            autoLayout={true}

            header={renderDataTableHeader()}
            value={managedObjectList}
            globalFilter={globalFilter}
            selectionMode="single"
            selection={selectedManagedObject}
            onRowClick={onManagedObjectSelect}
            onRowDoubleClick={(e) => onManagedObjectOpen(e)}
            sortMode="single" 
            sortField={nameField}
            sortOrder={1}
            scrollable 
            dataKey={idField}
          >
            <Column header="Name" field={nameField} filterField={filterField} sortable />
            {/* <Column field="configType" header="Type" sortable /> */}
            <Column header="Id" field={idField} sortable />
        </DataTable>
      </div>
    );
  }

  const renderContent = () => {
    const funcName = 'renderContent';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObjectList === undefined) throw new Error(`${logName}: managedObjectList === undefined`);

    if(managedObjectList.length === 0) {
      return (
        <React.Fragment>
          <Divider />
          {MessageNoManagedObjectsFound}
          <Divider />
        </React.Fragment>
      );
    }
    if(managedObjectList.length > 0) {
      return renderManagedObjectDataTable();
    } 
  }

  return (
    <div className="manage-organizations">

      <APComponentHeader header='Import an Organization:' />

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      <div className="p-mt-2">
        {isInitialized && renderContent()}
      </div>

    </div>
  );
}
