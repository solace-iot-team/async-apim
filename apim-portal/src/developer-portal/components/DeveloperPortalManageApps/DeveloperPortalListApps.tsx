
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
import { EAppType, E_CALL_STATE_ACTIONS } from "./DeveloperPortalManageAppsCommon";
import { TAPEntityId } from "../../../utils/APEntityIdsService";
import { UserContext } from "../../../components/APContextProviders/APUserContextProvider";
import APDeveloperPortalUserAppsDisplayService, { 
} from "../../displayServices/APDeveloperPortalUserAppsDisplayService";
import { IAPDeveloperPortalAppListDisplay, TAPDeveloperPortalAppListDisplayList } from "../../displayServices/APDeveloperPortalAppsDisplayService";
import APDeveloperPortalTeamAppsDisplayService, { 
} from "../../displayServices/APDeveloperPortalTeamAppsDisplayService";
import { Globals } from "../../../utils/Globals";
import { Loading } from "../../../components/Loading/Loading";
import { Config } from "../../../Config";
import APDisplayUtils from "../../../displayServices/APDisplayUtils";

import '../../../components/APComponents.css';
import "./DeveloperPortalManageApps.css";

export interface IDeveloperPortalListAppsProps {
  appType: EAppType;
  organizationEntityId: TAPEntityId;
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  onManagedObjectView: (apDeveloperPortalAppListDisplay: IAPDeveloperPortalAppListDisplay) => void;
  setBreadCrumbItemList: (itemList: Array<MenuItem>) => void;
}

export const DeveloperPortalListApps: React.FC<IDeveloperPortalListAppsProps> = (props: IDeveloperPortalListAppsProps) => {
  const ComponentName = 'DeveloperPortalListApps';

  const MessageNoManagedObjectsFound = 'No Apps found - create a new App.';
  const GlobalSearchPlaceholder = 'search ...';

  type TManagedObject =  IAPDeveloperPortalAppListDisplay;
  type TManagedObjectList = Array<TManagedObject>;

  const [userContext] = React.useContext(UserContext);

  const [managedObjectList, setManagedObjectList] = React.useState<TManagedObjectList>();  
  const [isInitialized, setIsInitialized] = React.useState<boolean>(false); 
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

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
    let callState: TApiCallState;
    if(props.appType === EAppType.TEAM) {
      if(userContext.runtimeSettings.currentBusinessGroupEntityId === undefined) throw new Error(`${logName}: props.appType === EAppType.TEAM && userContext.runtimeSettings.currentBusinessGroupEntityId === undefined`);
      callState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_APP_LIST, `retrieve list of apps for ${userContext.runtimeSettings.currentBusinessGroupEntityId.displayName}`);
    } else {
      callState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_APP_LIST, `retrieve list of apps for ${userContext.apLoginUserDisplay.apEntityId.id}`);
    } 
    try { 
      switch(props.appType) {
        case EAppType.USER:
          const apDeveloperPortalUserAppListDisplayList: TAPDeveloperPortalAppListDisplayList = await APDeveloperPortalUserAppsDisplayService.apiGetList_ApDeveloperPortalUserAppListDisplayList({
            organizationId: props.organizationEntityId.id,
            userId: userContext.apLoginUserDisplay.apEntityId.id
          });
          setManagedObjectList(apDeveloperPortalUserAppListDisplayList);
          break;
        case EAppType.TEAM:
          if(userContext.runtimeSettings.currentBusinessGroupEntityId === undefined) throw new Error(`${logName}: props.appType === EAppType.TEAM && userContext.runtimeSettings.currentBusinessGroupEntityId === undefined`);
          const apDeveloperPortalTeamAppListDisplayList: TAPDeveloperPortalAppListDisplayList = await APDeveloperPortalTeamAppsDisplayService.apiGetList_ApDeveloperPortalTeamAppListDisplayList({
            organizationId: props.organizationEntityId.id,
            teamId: userContext.runtimeSettings.currentBusinessGroupEntityId.id
          });
          setManagedObjectList(apDeveloperPortalTeamAppListDisplayList);
          break;
        default:
          Globals.assertNever(logName, props.appType);
      }
    } catch(e: any) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const doInitialize = async () => {
    setIsLoading(true);
    await apiGetManagedObjectList();
    setIsLoading(false);
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
  // const apiProductsBodyTemplate = (row: TManagedObject): JSX.Element => {
  //   // APDisplayUtils.create_DivList_From_StringList(APEntityIdsService.create_SortedDisplayNameList_From_ApDisplayObjectList(row.apApiDisplayList));
  //   return (
  //     <div>TDB: api product displayName (status)</div>
  //   )
  // }

  const renderManagedObjectDataTable = () => {
    const dataKey = APDeveloperPortalUserAppsDisplayService.nameOf_ApEntityId('id');
    const sortField = APDeveloperPortalUserAppsDisplayService.nameOf_ApEntityId('displayName');
    const filterField = APDisplayUtils.nameOf<TManagedObject>('apSearchContent');
    const statusField = APDisplayUtils.nameOf<TManagedObject>('apAppStatus');
    const develAppStatusField = 'connectorAppResponse.status';

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
            <Column header="Status" field={statusField} sortable style={{ width: "15%"}} />
            {Config.getUseDevelTools() &&
              <Column header="DEVEL:App Status" field={develAppStatusField} style={{ width: "15%"}} sortable />          
            }

            {/* <Column header="API Products" body={apiProductsBodyTemplate} bodyStyle={{verticalAlign: 'top'}} /> */}
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

  const getComponentHeader = (): string => {
    if(props.appType === EAppType.USER) return 'My Apps:';
    return 'Business Group Apps:';
  }
  const getLoadingHeader = (): JSX.Element => {
    return (<div>Retrieving list of apps ...</div>);
  }
  return (
    <div className="apd-manage-user-apps">

      <APComponentHeader header={getComponentHeader()} />

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      <Loading key={ComponentName} show={isLoading} header={getLoadingHeader()} />      

      <div className="p-mt-2">
        {isInitialized && renderContent()}
      </div>

    </div>
  );
}
