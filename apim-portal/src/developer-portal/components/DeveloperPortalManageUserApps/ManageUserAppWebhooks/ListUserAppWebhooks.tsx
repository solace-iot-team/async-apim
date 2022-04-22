
import React from "react";

import { DataTable } from 'primereact/datatable';
import { Column } from "primereact/column";
import { InputText } from 'primereact/inputtext';
import { MenuItem } from "primereact/api";
import { Divider } from "primereact/divider";

import { APClientConnectorOpenApi } from "../../../../utils/APClientConnectorOpenApi";
import { APComponentHeader } from "../../../../components/APComponentHeader/APComponentHeader";
import { ApiCallState, TApiCallState } from "../../../../utils/ApiCallState";
import { ApiCallStatusError } from "../../../../components/ApiCallStatusError/ApiCallStatusError";
import { 
  TAPDeveloperPortalUserAppDisplay, 
} from "../../../displayServices/APDeveloperPortalUserAppsDisplayService";
import APAppWebhooksDisplayService, { 
  EAPWebhookAuthMethodSelectIdNone,
  IAPAppWebhookDisplay, 
  TAPAppWebhookDisplayList 
} from "../../../../displayServices/APAppsDisplayService/APAppWebhooksDisplayService";
import { E_CALL_STATE_ACTIONS } from "./ManageUserAppWebhooksCommon";
import APDisplayUtils from "../../../../displayServices/APDisplayUtils";
import APEntityIdsService from "../../../../utils/APEntityIdsService";

import '../../../../components/APComponents.css';
import "../DeveloperPortalManageUserApps.css";

export interface IListUserAppWebhooksProps {
  organizationId: string;
  apDeveloperPortalUserAppDisplay: TAPDeveloperPortalUserAppDisplay;
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
  onManagedObjectView: (apAppWebhookDisplay: IAPAppWebhookDisplay) => void;
  setBreadCrumbItemList: (itemList: Array<MenuItem>) => void;
}

export const ListUserAppWebhooks: React.FC<IListUserAppWebhooksProps> = (props: IListUserAppWebhooksProps) => {
  const ComponentName = 'ListUserAppWebhooks';

  const MessageNoManagedObjectsFound = 'No Webhooks configured.';
  const GlobalSearchPlaceholder = 'search ...';

  type TManagedObject = IAPAppWebhookDisplay;
  type TManagedObjectList = Array<TManagedObject>;

  const [managedObjectList, setManagedObjectList] = React.useState<TManagedObjectList>();  
  const [isInitialized, setIsInitialized] = React.useState<boolean>(false); 
  const [selectedManagedObject, setSelectedManagedObject] = React.useState<TManagedObject>();
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [globalFilter, setGlobalFilter] = React.useState<string>();
  
  const managedObjectListDataTableRef = React.useRef<any>(null);

  // * Api Calls *

  const apiGetManagedObjectList = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObjectList';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_APP_WEBHOOK_LIST, `retrieve list of webhooks for app: ${props.apDeveloperPortalUserAppDisplay.apEntityId.displayName}`);
    try { 
      const apAppWebhookDisplayList: TAPAppWebhookDisplayList = await APAppWebhooksDisplayService.apiGetList_ApAppWebhookDisplayList({
        organizationId: props.organizationId,
        appId: props.apDeveloperPortalUserAppDisplay.apEntityId.id,
        apAppMeta: props.apDeveloperPortalUserAppDisplay.apAppMeta,
        apAppEnvironmentDisplayList: props.apDeveloperPortalUserAppDisplay.apAppEnvironmentDisplayList,
      });
      setManagedObjectList(apAppWebhookDisplayList);
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
    return (
      <div className="table-header">
        <div className="table-header-container">
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
  const environmentsBodyTemplate = (row: TManagedObject): JSX.Element => {
    return APDisplayUtils.create_DivList_From_StringList(APEntityIdsService.create_SortedDisplayNameList_From_ApDisplayObjectList(row.apAppEnvironmentDisplayList));
  }
  const authenticationBodyTemplate = (row: TManagedObject): string | undefined => {
    if(row.apWebhookBasicAuth) return row.apWebhookBasicAuth.authMethod;
    if(row.apWebhookHeaderAuth) return row.apWebhookHeaderAuth.authMethod;
    return EAPWebhookAuthMethodSelectIdNone.NONE;
  }

  const renderManagedObjectDataTable = () => {
    const dataKey = APAppWebhooksDisplayService.nameOf_ApEntityId('id');
    const sortField = APAppWebhooksDisplayService.nameOf_ApEntityId('displayName');
    const filterField = APAppWebhooksDisplayService.nameOf<TManagedObject>('apSearchContent');
    // const statusField = APDeveloperPortalUserAppsDisplayService.nameOf<TManagedObject>('apAppStatus');
    const methodField = APAppWebhooksDisplayService.nameOf<TManagedObject>('apWebhookMethod');
    const uriField = APAppWebhooksDisplayService.nameOf<TManagedObject>('apWebhookUri');
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
          <Column header="Environment(s)" body={environmentsBodyTemplate} />
          <Column header="Method" field={methodField} style={{ width: "6em"}} />
          <Column header="URI" field={uriField} style={{ width: "50%"}}/>
          <Column header="Auth" body={authenticationBodyTemplate} style={{ width: "6em"}}/>
          {/* <Column header="Status" field={statusField} sortable style={{ width: "15%"}} /> */}
          {/* <Column header="Status" body={nameBodyTemplate} headerStyle={{width: '7em'}} field="apiAppResponse_smf.status" bodyStyle={{ textAlign: 'left', verticalAlign: 'top' }} sortable /> */}
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
    <div className="apd-manage-user-apps">

      <APComponentHeader header='App Webhooks:' />

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      <div className="p-mt-2">
        {isInitialized && renderContent()}
      </div>
      
    </div>
  );
}
