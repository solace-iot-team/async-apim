
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
import { E_CALL_STATE_ACTIONS } from "./DeveloperPortalManageUserAppsCommon";
import { TAPEntityId } from "../../../utils/APEntityIdsService";
import { UserContext } from "../../../components/APContextProviders/APUserContextProvider";
import APDeveloperPortalUserAppsDisplayService, { 
  TAPDeveloperPortalUserAppDisplay, 
  TAPDeveloperPortalUserAppDisplayList 
} from "../../displayServices/APDeveloperPortalUserAppsDisplayService";

import '../../../components/APComponents.css';
import "./DeveloperPortalManageUserApps.css";

export interface IDeveloperPortalListUserAppsProps {
  organizationEntityId: TAPEntityId;
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
  onManagedObjectView: (apDeveloperPortalUserAppDisplay: TAPDeveloperPortalUserAppDisplay) => void;
  setBreadCrumbItemList: (itemList: Array<MenuItem>) => void;
}

export const DeveloperPortalListUserApps: React.FC<IDeveloperPortalListUserAppsProps> = (props: IDeveloperPortalListUserAppsProps) => {
  const ComponentName = 'DeveloperPortalListUserApps';

  const MessageNoManagedObjectsFound = 'No Apps found - create a new App.';
  const GlobalSearchPlaceholder = 'search ...';

  type TManagedObject = TAPDeveloperPortalUserAppDisplay;
  type TManagedObjectList = Array<TManagedObject>;

  const [userContext] = React.useContext(UserContext);

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
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_USER_APP_LIST, `retrieve list of apps for ${userContext.apLoginUserDisplay.apEntityId.id}`);
    try { 
      const apDeveloperPortalUserAppDisplayList: TAPDeveloperPortalUserAppDisplayList = await APDeveloperPortalUserAppsDisplayService.apiGetList_ApDeveloperPortalUserAppDisplayList({
        organizationId: props.organizationEntityId.id,
        userId: userContext.apLoginUserDisplay.apEntityId.id
      });
      setManagedObjectList(apDeveloperPortalUserAppDisplayList);
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
  const apiProductsBodyTemplate = (row: TManagedObject): JSX.Element => {
    // APDisplayUtils.create_DivList_From_StringList(APEntityIdsService.create_SortedDisplayNameList_From_ApDisplayObjectList(row.apApiDisplayList));
    return (
      <div>TDB: api product displayName (status)</div>
    )
  }

  const renderManagedObjectDataTable = () => {
    const dataKey = APDeveloperPortalUserAppsDisplayService.nameOf_ApEntityId('id');
    const sortField = APDeveloperPortalUserAppsDisplayService.nameOf_ApEntityId('displayName');
    const filterField = APDeveloperPortalUserAppsDisplayService.nameOf<TManagedObject>('apSearchContent');

    return (
      <div className="card">
          <DataTable
            ref={managedObjectListDataTableRef}
            className="p-datatable-sm"
            // autoLayout={true}
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
            <Column header="Name" body={nameBodyTemplate} bodyStyle={{ verticalAlign: 'top' }} filterField={filterField} sortField={sortField} sortable />
            {/* <Column header="State" headerStyle={{width: '7em'}} field="apiAppResponse_smf.status" bodyStyle={{ textAlign: 'left', verticalAlign: 'top' }} sortable /> */}
            <Column header="API Products" body={apiProductsBodyTemplate} bodyStyle={{verticalAlign: 'top'}} />
            {/* <Column header="Environment(s)" body={environmentsBodyTemplate}  bodyStyle={{textAlign: 'left'}}/>
            <Column header="Webhook(s)" body={webhooksBodyTemplate}  bodyStyle={{ verticalAlign: 'top' }}/> */}
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
    <div className="apd-manage-user-apps">

      <APComponentHeader header='My Apps:' />

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      <div className="p-mt-2">
        {isInitialized && renderContent()}
      </div>
      
      {/* DEBUG */}
      {/* {renderDebug()} */}

    </div>
  );
}
