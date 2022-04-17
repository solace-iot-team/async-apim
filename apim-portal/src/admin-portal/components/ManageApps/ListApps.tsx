
import React from "react";

import { DataTable } from 'primereact/datatable';
import { Column } from "primereact/column";
import { InputText } from 'primereact/inputtext';
import { MenuItem } from "primereact/api";
import { Divider } from "primereact/divider";

import { APClientConnectorOpenApi } from "../../../utils/APClientConnectorOpenApi";
import { APComponentHeader } from "../../../components/APComponentHeader/APComponentHeader";
import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import APAdminPortalAppsDisplayService, { 
  TAPAdminPortalAppDisplay, 
  TAPAdminPortalAppDisplayList 
} from "../../displayServices/APAdminPortalAppsDisplayService";
import { E_CALL_STATE_ACTIONS } from "./ManageAppsCommon";

import '../../../components/APComponents.css';
import "./ManageApps.css";

export interface IListAppsProps {
  organizationId: string;
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
  onManagedObjectView: (apAdminPortalAppDisplay: TAPAdminPortalAppDisplay) => void;
  setBreadCrumbItemList: (itemList: Array<MenuItem>) => void;
}

export const ListApps: React.FC<IListAppsProps> = (props: IListAppsProps) => {
  const ComponentName = 'ListApps';

  const MessageNoManagedObjectsFound = 'No Apps found.';
  const GlobalSearchPlaceholder = 'search ...';

  type TManagedObject = TAPAdminPortalAppDisplay;
  type TManagedObjectList = Array<TManagedObject>;

  const [managedObjectList, setManagedObjectList] = React.useState<TManagedObjectList>();  
  const [isInitialized, setIsInitialized] = React.useState<boolean>(false); 

  const [selectedManagedObject, setSelectedManagedObject] = React.useState<TManagedObject>();

  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [globalFilter, setGlobalFilter] = React.useState<string>();
  
  // const selectGlobalFilterOptions: TApiEntitySelectItemList = [
  //   { id: 'pending', displayName: 'pending' },
  //   { id: 'approved', displayName: 'approved' },
  //   { id: '', displayName: 'all'}
  // ]
  // const [selectedGlobalFilter, setSelectedGlobalFilter] = React.useState<string>('');
  const managedObjectListDataTableRef = React.useRef<any>(null);

  // * Api Calls *

  const apiGetManagedObjectList = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObjectList';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_APP_LIST, `retrieve list of apps`);
    try { 
      const list: TAPAdminPortalAppDisplayList = await APAdminPortalAppsDisplayService.apiGetList_ApAdminPortalAppDisplayList({
        organizationId: props.organizationId,
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
    // const funcName = 'useEffect([])';
    // const logName = `${componentName}.${funcName}()`;
    // console.log(`${logName}: mounting ...`);
    props.setBreadCrumbItemList([]);
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(managedObjectList === undefined) return;
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
    props.onManagedObjectView(mo);
  }

  const onInputGlobalFilter = (event: React.FormEvent<HTMLInputElement>) => {
    // const _globalFilter: string | undefined = event.currentTarget.value !== '' ? event.currentTarget.value : undefined;
    // setGlobalFilter(_globalFilter);
    setGlobalFilter(event.currentTarget.value);
  }
 
  const renderDataTableHeader = (): JSX.Element => {
    // const onSelectedGlobalFilterChange = (params: SelectButtonChangeParams) => {
    //   if(params.value !== null) {
    //     setSelectedGlobalFilter(params.value);
    //     setGlobalFilter(params.value);
    //   }
    // }
    return (
      <div className="table-header">
        <div className="table-header-container">
          {/* <SelectButton 
            value={selectedGlobalFilter} 
            options={selectGlobalFilterOptions} 
            optionLabel="displayName"
            optionValue="id"
            onChange={onSelectedGlobalFilterChange} 
            style={{ textAlign: 'end' }}
          /> */}
        </div>        
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText 
            type="search" 
            placeholder={GlobalSearchPlaceholder} 
            onInput={onInputGlobalFilter} 
            style={{width: '500px'}}
            value={globalFilter}
          />
        </span>
      </div>
    );
  }

  const nameBodyTemplate = (row: TManagedObject): string => {
    return row.apEntityId.displayName;
  }
  const appTypeBodyTemplate = (row: TManagedObject): string => {
    return row.apAppMeta.apAppType;
  }
  const ownerIdBodyTemplate = (row: TManagedObject): string => {
    return row.apAppMeta.appOwnerId;
  }
  const ownerTypeBodyTemplate = (row: TManagedObject): string => {
    return row.apAppMeta.apAppOwnerType;
  }
  
  const renderManagedObjectDataTable = () => {
    const dataKey = APAdminPortalAppsDisplayService.nameOf_ApEntityId('id');
    const sortField = APAdminPortalAppsDisplayService.nameOf_ApEntityId('displayName');
    const filterField = APAdminPortalAppsDisplayService.nameOf<TManagedObject>('apSearchContent');
    const statusField = APAdminPortalAppsDisplayService.nameOf<TManagedObject>('apAppStatus');
    const ownerIdField = APAdminPortalAppsDisplayService.nameOf_ApAppMeta('appOwnerId');
    const ownerTypeField = APAdminPortalAppsDisplayService.nameOf_ApAppMeta('apAppOwnerType');
    const appTypeField = APAdminPortalAppsDisplayService.nameOf_ApAppMeta('apAppType');

    return (
      <div className="card">
          <DataTable
            ref={managedObjectListDataTableRef}
            className="p-datatable-sm"
            autoLayout={true}
            resizableColumns 
            columnResizeMode="fit"
            showGridlines={false}
            header={renderDataTableHeader()}
            value={managedObjectList}
            globalFilter={globalFilter}
            selectionMode="single"
            selection={selectedManagedObject}
            onRowClick={onManagedObjectSelect}
            onRowDoubleClick={(e) => onManagedObjectOpen(e)}
            scrollable 
            // scrollHeight="800px" 
            dataKey={dataKey}  
            // sorting
            sortMode='single'
            sortField={sortField}
            sortOrder={1}
          >
            <Column header="Name" body={nameBodyTemplate} filterField={filterField} sortField={sortField} sortable />
            <Column header="Type" body={appTypeBodyTemplate} field={appTypeField} sortable />
            <Column header="Owner Id" body={ownerIdBodyTemplate} field={ownerIdField} sortable />
            <Column header="Owner Type" body={ownerTypeBodyTemplate} field={ownerTypeField} sortable style={{ width: '9em' }}/>
            <Column header="Status" field={statusField} sortable style={{ width: "13em"}} />
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

  // const renderDebug = (): JSX.Element => {
  //   return (<></>);
  //   // if(managedObjectList.length > 0 && selectedManagedObject) {
  //   //   const _d = {
  //   //     ...selectedManagedObject,
  //   //     globalSearch: 'not shown...'
  //   //   }
  //   //   return (
  //   //     <pre style={ { fontSize: '10px' }} >
  //   //       {JSON.stringify(_d, null, 2)}
  //   //     </pre>
  //   //   );
  //   // } else return (<></>);
  // }

  return (
    <div className="ap-manage-apps">

      <APComponentHeader header='Manage Apps:' />

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      <div className="p-mt-4">
        <div style={{ fontSize: 'small'}}>
          <p>TODO: translate partially live to requires approval here</p>
          <p>TODO: scope the list: ROLE=orgAdmin: list all external + current business group apps + user apps where ownerId apiConsumer in current busienss group</p>
          <p>TODO: scope the list: ROLE=apiTeam: biz group apps in current business group & user apps where ownerId apiConsumer in current busienss group</p>
        </div>
        {isInitialized && renderContent()}
      </div>
      
      {/* DEBUG */}
      {/* {renderDebug()} */}

    </div>
  );
}
