
import React from "react";

import { DataTable } from 'primereact/datatable';
import { Column } from "primereact/column";
import { InputText } from 'primereact/inputtext';
import { MenuItem } from "primereact/api";
import { Divider } from "primereact/divider";
import { SelectButton, SelectButtonChangeParams } from "primereact/selectbutton";

import { APClientConnectorOpenApi } from "../../../utils/APClientConnectorOpenApi";
import { APComponentHeader } from "../../../components/APComponentHeader/APComponentHeader";
import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import APAdminPortalAppsDisplayService, { 
  IAPAdminPortalAppListDisplay,
  TAPAdminPortalAppListDisplayList
} from "../../displayServices/APAdminPortalAppsDisplayService";
import { E_CALL_STATE_ACTIONS } from "./ManageAppsCommon";
import { UserContext } from "../../../components/APContextProviders/APUserContextProvider";
import { AuthContext } from "../../../components/AuthContextProvider/AuthContextProvider";
import APMemberOfService, { 
  TAPMemberOfBusinessGroupDisplay 
} from "../../../displayServices/APUsersDisplayService/APMemberOfService";
import { Loading } from "../../../components/Loading/Loading";
import APDisplayUtils from "../../../displayServices/APDisplayUtils";
import APEntityIdsService, { TAPEntityIdList } from "../../../utils/APEntityIdsService";
import APRbacDisplayService from "../../../displayServices/APRbacDisplayService";
import { Config } from "../../../Config";

import '../../../components/APComponents.css';
import "./ManageApps.css";

export interface IListAppsProps {
  organizationId: string;
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  onManagedObjectView: (apAdminPortalAppListDisplay: IAPAdminPortalAppListDisplay) => void;
  setBreadCrumbItemList: (itemList: Array<MenuItem>) => void;
}

export const ListApps: React.FC<IListAppsProps> = (props: IListAppsProps) => {
  const ComponentName = 'ListApps';

  const MessageNoManagedObjectsFound = 'No Apps found.';
  const GlobalSearchPlaceholder = 'search ...';

  type TManagedObject = IAPAdminPortalAppListDisplay;
  type TManagedObjectList = Array<TManagedObject>;

  const [userContext] = React.useContext(UserContext);
  const [authContext] = React.useContext(AuthContext);

  const [managedObjectList, setManagedObjectList] = React.useState<TManagedObjectList>();  
  const [isInitialized, setIsInitialized] = React.useState<boolean>(false); 

  const [selectedManagedObject, setSelectedManagedObject] = React.useState<TManagedObject>();

  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [globalFilter, setGlobalFilter] = React.useState<string>();
  
  const managedObjectListDataTableRef = React.useRef<any>(null);

  const SelectAllOrganizationAppsId = "SelectAllOrganizationAppsId";
  const SelectBusinessGroupAppsId = "SelectBusinessGroupAppsId";
  const SelectAllFilterOptions: TAPEntityIdList = [
    { id: SelectAllOrganizationAppsId, displayName: 'All Organization Apps' },
    { id: SelectBusinessGroupAppsId, displayName: 'Current Business Group' },
  ];
  const SelectBusinessGroupFilterOptions: TAPEntityIdList = [
    { id: SelectBusinessGroupAppsId, displayName: 'Current Business Group' },
  ];
  const [selectedFilterOptionId, setSelectedFilterOptionId] = React.useState<string>(SelectBusinessGroupAppsId);

  const getSelectButton = () => {
    const onSelectFilterOptionChange = (params: SelectButtonChangeParams) => {
      if(params.value !== null) {
        setSelectedFilterOptionId(params.value);
      }
    }
    if(APRbacDisplayService.isAuthorized_To_ManageAllOrganizationApps(authContext.authorizedResourcePathsAsString)) {
      return(
        <SelectButton
          value={selectedFilterOptionId} 
          options={SelectAllFilterOptions} 
          optionLabel={APEntityIdsService.nameOf('displayName')}
          optionValue={APEntityIdsService.nameOf('id')}
          onChange={onSelectFilterOptionChange} 
          style={{ textAlign: 'end' }}
        />
      );
    } else {
      return (
        <SelectButton
          value={selectedFilterOptionId} 
          options={SelectBusinessGroupFilterOptions} 
          optionLabel={APEntityIdsService.nameOf('displayName')}
          optionValue={APEntityIdsService.nameOf('id')}
          onChange={onSelectFilterOptionChange} 
          style={{ textAlign: 'end' }}
        />  
      );
    }
  }

  // * Api Calls *

  const apiGetManagedObjectList_For_Organization = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObjectList_For_Organization';
    const logName = `${ComponentName}.${funcName}()`;

    if(userContext.runtimeSettings.currentBusinessGroupEntityId === undefined) throw new Error(`${logName}: userContext.runtimeSettings.currentBusinessGroupEntityId === undefined`);
    const currentBusinessGroupId: string = userContext.runtimeSettings.currentBusinessGroupEntityId.id;
    // get all calculated roles in current business group
    const apMemberOfBusinessGroupDisplay: TAPMemberOfBusinessGroupDisplay = APMemberOfService.get_ApMemberOfBusinessGroupDisplay_From_ApMemberOfBusinessGroupDisplayTreeNodeList({
      apMemberOfBusinessGroupDisplayTreeNodeList: userContext.runtimeSettings.apMemberOfBusinessGroupDisplayTreeNodeList,
      businessGroupId: currentBusinessGroupId
    });
    if(apMemberOfBusinessGroupDisplay.apCalculatedBusinessGroupRoleEntityIdList === undefined) throw new Error(`${logName}: apMemberOfBusinessGroupDisplay.apCalculatedBusinessGroupRoleEntityIdList === undefined`);

    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_APP_LIST, `retrieve list of apps`);
    try { 
      const list: TAPAdminPortalAppListDisplayList = await APAdminPortalAppsDisplayService.apiGetList_ApAdminPortalAppListDisplayList_For_Organization({
        organizationId: props.organizationId,
        loggedInUser_BusinessGroupRoleEntityIdList: apMemberOfBusinessGroupDisplay.apCalculatedBusinessGroupRoleEntityIdList
      });
      setManagedObjectList(list);
    } catch(e: any) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const apiGetManagedObjectList_For_BusinessGroup = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObjectList_For_BusinessGroup';
    const logName = `${ComponentName}.${funcName}()`;

    if(userContext.runtimeSettings.currentBusinessGroupEntityId === undefined) throw new Error(`${logName}: userContext.runtimeSettings.currentBusinessGroupEntityId === undefined`);
    const currentBusinessGroupId: string = userContext.runtimeSettings.currentBusinessGroupEntityId.id;
    // get all calculated roles in current business group
    const apMemberOfBusinessGroupDisplay: TAPMemberOfBusinessGroupDisplay = APMemberOfService.get_ApMemberOfBusinessGroupDisplay_From_ApMemberOfBusinessGroupDisplayTreeNodeList({
      apMemberOfBusinessGroupDisplayTreeNodeList: userContext.runtimeSettings.apMemberOfBusinessGroupDisplayTreeNodeList,
      businessGroupId: currentBusinessGroupId
    });
    if(apMemberOfBusinessGroupDisplay.apCalculatedBusinessGroupRoleEntityIdList === undefined) throw new Error(`${logName}: apMemberOfBusinessGroupDisplay.apCalculatedBusinessGroupRoleEntityIdList === undefined`);

    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_APP_LIST, `retrieve list of apps`);
    try { 
      const list: TAPAdminPortalAppListDisplayList = await APAdminPortalAppsDisplayService.apiGetList_ApAdminPortalAppListDisplayList_For_BusinessGroup({
        organizationId: props.organizationId,
        businessGroupId: currentBusinessGroupId,
        loggedInUser_BusinessGroupRoleEntityIdList: apMemberOfBusinessGroupDisplay.apCalculatedBusinessGroupRoleEntityIdList
      });
      setManagedObjectList(list);
    } catch(e: any) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const apiGetManagedObjectList = async(): Promise<TApiCallState> => {
    if(selectedFilterOptionId === SelectBusinessGroupAppsId) return await apiGetManagedObjectList_For_BusinessGroup();
    else return await apiGetManagedObjectList_For_Organization();
  }

  const reInitialize = async () => {
    setIsInitialized(false);
    setIsLoading(true);
    await apiGetManagedObjectList();
    setIsLoading(false);
  }

  const doInitialize = async () => {
    setIsLoading(true);
    await apiGetManagedObjectList();
    setIsLoading(false);
  }

  React.useEffect(() => {
    // console.log(`${ComponentName}: mounting ...`);
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

  React.useEffect(() => {
    if(!isInitialized) return;
    reInitialize();
  }, [selectedFilterOptionId]); /* eslint-disable-line react-hooks/exhaustive-deps */

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
    return (
      <div className="table-header">
        <div className="table-header-container">
          {getSelectButton()}
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
    const filterField = APDisplayUtils.nameOf<TManagedObject>('apSearchContent');
    const statusField = APDisplayUtils.nameOf<TManagedObject>('apAdminPortalAppStatus');
    const ownerIdField = APAdminPortalAppsDisplayService.nameOf_ApAppMeta('appOwnerId');
    const ownerTypeField = APAdminPortalAppsDisplayService.nameOf_ApAppMeta('apAppOwnerType');
    const appTypeField = APAdminPortalAppsDisplayService.nameOf_ApAppMeta('apAppType');
    const develAppStatusField = 'connectorAppListItem.status';

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
            {Config.getUseDevelTools() &&
              <Column header="DEVEL:App Status" field={develAppStatusField} style={{ width: "15%"}} sortable />          
            }
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
    <div className="ap-manage-apps">

      <Loading key={ComponentName} show={isLoading} />      

      <APComponentHeader header='Apps:' />

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      <div className="p-mt-4">
        {isInitialized && renderContent()}
      </div>
      
    </div>
  );
}
