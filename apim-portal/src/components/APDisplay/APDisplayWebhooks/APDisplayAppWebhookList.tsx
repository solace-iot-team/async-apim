
import React from "react";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Divider } from "primereact/divider";

import APAppWebhooksDisplayService, { 
  EAPWebhookAuthMethodSelectIdNone, 
  IAPAppWebhookDisplay, 
  TAPAppWebhookDisplayList, 
  TAPWebhookRequestHeader
} from "../../../displayServices/APAppsDisplayService/APAppWebhooksDisplayService";
import APDisplayUtils from "../../../displayServices/APDisplayUtils";
import APEntityIdsService from "../../../utils/APEntityIdsService";
import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { TAPDeveloperPortalUserAppDisplay } from "../../../developer-portal/displayServices/APDeveloperPortalUserAppsDisplayService";
import { APClientConnectorOpenApi } from "../../../utils/APClientConnectorOpenApi";
import { ApiCallStatusError } from "../../ApiCallStatusError/ApiCallStatusError";
import { APDisplayWebhooksCommon } from "./APDisplayWebhooksCommon";

import "../../APComponents.css";

export enum E_AP_DISPLAY_APP_WEBHOOK_LIST_CALL_STATE_ACTIONS {
  API_GET_APP_WEBHOOK_LIST = "API_GET_APP_WEBHOOK_LIST",
}

export interface IAPDisplayAppWebhookListProps {
  organizationId: string;
  apDeveloperPortalUserAppDisplay: TAPDeveloperPortalUserAppDisplay;
  onError: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
  onOpen?: (apAppWebhookDisplay: IAPAppWebhookDisplay) => void;
  className?: string;
}

export const APDisplayAppWebhookList: React.FC<IAPDisplayAppWebhookListProps> = (props: IAPDisplayAppWebhookListProps) => {
  const ComponentName='APDisplayAppWebhookList';

  type TManagedObject = IAPAppWebhookDisplay;
  type TManagedObjectList = Array<TManagedObject>;
  
  const [managedObjectList, setManagedObjectList] = React.useState<TManagedObjectList>();  
  const [isInitialized, setIsInitialized] = React.useState<boolean>(false); 
  const [selectedManagedObject, setSelectedManagedObject] = React.useState<TManagedObject>();
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [expandedManagedObjectDataTableRows, setExpandedManagedObjectDataTableRows] = React.useState<any>(null);

  const componentDataTableRef = React.useRef<any>(null);

  // * Api Calls *

  const apiGetManagedObjectList = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObjectList';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_AP_DISPLAY_APP_WEBHOOK_LIST_CALL_STATE_ACTIONS.API_GET_APP_WEBHOOK_LIST, `retrieve list of webhooks for app: ${props.apDeveloperPortalUserAppDisplay.apEntityId.displayName}`);
    try { 
      const apAppWebhookDisplayList: TAPAppWebhookDisplayList = await APAppWebhooksDisplayService.apiGetList_ApAppWebhookDisplayList({
        organizationId: props.organizationId,
        appId: props.apDeveloperPortalUserAppDisplay.apEntityId.id,
        apAppMeta: props.apDeveloperPortalUserAppDisplay.apAppMeta,
        apAppEnvironmentDisplayList: props.apDeveloperPortalUserAppDisplay.apAppEnvironmentDisplayList,
      });
      setManagedObjectList(apAppWebhookDisplayList);
      // test error handling
      // throw new Error(`${logName}: test error handling`);
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
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(managedObjectList === undefined) return;
    setIsInitialized(true);
  }, [managedObjectList]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const onManagedObjectSelect = (event: any): void => {
    setSelectedManagedObject(event.data);
  }  
  const onManagedObjectOpen = (event: any): void => {
    if(props.onOpen !== undefined) {
      const mo: TManagedObject = event.data as TManagedObject;
      props.onOpen(mo);
    }
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

  // if we need to search ...
  // const onInputGlobalFilter = (event: React.FormEvent<HTMLInputElement>) => {
  //   // const _globalFilter: string | undefined = event.currentTarget.value !== '' ? event.currentTarget.value : undefined;
  //   // setGlobalFilter(_globalFilter);
  //   setGlobalFilter(event.currentTarget.value);
  // }
 
  // const renderDataTableHeader = (): JSX.Element => {
  //   return (
  //     <div className="table-header">
  //       <div className="table-header-container">
  //       </div>        
  //       <span className="p-input-icon-left">
  //         <i className="pi pi-search" />
  //         <InputText 
  //           type="search" 
  //           placeholder={GlobalSearchPlaceholder} 
  //           onInput={onInputGlobalFilter} 
  //           style={{width: '500px'}}
  //           value={globalFilter}
  //         />
  //       </span>
  //     </div>
  //   );
  // }


  const renderManagedObjectDataTable = () => {
    const rowExpansionTemplate = (mo: TManagedObject) => {
      const dataTableList = mo.apWebhookRequestHeaderList;
      const dataKey = APDisplayUtils.nameOf<TAPWebhookRequestHeader>('headerName');
      const sortField = dataKey;
      const valueField = APDisplayUtils.nameOf<TAPWebhookRequestHeader>('headerValue');
      return (
        <div className="sub-table">
          <DataTable 
            className="p-datatable-sm"
            value={dataTableList}
            autoLayout={true}
            header={APDisplayWebhooksCommon.CustomHeaders.TableHeader}
            emptyMessage={APDisplayWebhooksCommon.CustomHeaders.EmptyMessage}
            scrollable 
            dataKey={dataKey}  
            sortMode='single'
            sortField={sortField}
            sortOrder={1}  
          >
            <Column header={APDisplayWebhooksCommon.CustomHeaders.ColumnHeader_HeaderName} headerStyle={{ width: "31%"}} field={dataKey} sortable />
            <Column header={APDisplayWebhooksCommon.CustomHeaders.ColumnHeader_HeaderValue} field={valueField} bodyStyle={{ overflowWrap: 'break-word', wordWrap: 'break-word' }} />
          </DataTable>
        </div>
      );
    }
    // @ts-ignore Type instantiation is excessively deep and possibly infinite.  TS2589
    const dataKey = APDisplayUtils.nameOf<TManagedObject>('apEntityId.id');
    const sortField = APDisplayUtils.nameOf<TManagedObject>('apEntityId.displayName');
    const filterField = APDisplayUtils.nameOf<TManagedObject>('apSearchContent');
    const methodField = APDisplayUtils.nameOf<TManagedObject>('apWebhookMethod');
    const uriField = APDisplayUtils.nameOf<TManagedObject>('apWebhookUri');
    return (
      <div className="card">
        <DataTable
          ref={componentDataTableRef}
          dataKey={dataKey}  
          className="p-datatable-sm"
          autoLayout={true}
          resizableColumns 
          columnResizeMode="fit"
          showGridlines={false}

          // if search required
          //header={renderDataTableHeader()}
          //         globalFilter={globalFilter}


          value={managedObjectList}

          selectionMode="single"
          selection={selectedManagedObject}
          onRowClick={onManagedObjectSelect}
          onRowDoubleClick={(e) => onManagedObjectOpen(e)}

          scrollable 

          sortMode='single'
          sortField={sortField}
          sortOrder={1}

          expandedRows={expandedManagedObjectDataTableRows}
          onRowToggle={(e) => setExpandedManagedObjectDataTableRows(e.data)}
          rowExpansionTemplate={rowExpansionTemplate}
        >
          <Column expander style={{ width: '3em' }} />  
          <Column header="Name" body={nameBodyTemplate} filterField={filterField} sortField={sortField} sortable />
          <Column header="Environment(s)" body={environmentsBodyTemplate} />
          <Column header="Method" field={methodField} style={{ width: "6em"}} />
          <Column header="URI" field={uriField} style={{ width: "50%"}}/>
          <Column header="Auth" body={authenticationBodyTemplate} style={{ width: "6em"}}/>
          {/* <Column header="Status" headerStyle={{ width: '5em', textAlign: 'center' }} body={statusBodyTemplate}  bodyStyle={{textAlign: 'center' }}/> */}
        </DataTable>
      </div>
    );
  }

  const renderComponent = () => {
    const funcName = 'renderComponent';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObjectList === undefined) throw new Error(`${logName}: managedObjectList === undefined`);

    if(managedObjectList.length === 0) {
      return (
        <React.Fragment>
          <Divider />
          {APDisplayWebhooksCommon.WebHookList.MessageNoWebhooksFound}
          <Divider />
        </React.Fragment>
      );
    }
    if(managedObjectList.length > 0) {
      return renderManagedObjectDataTable();
    } 
  }

  return (
    <div className={props.className ? props.className : 'card'}>
      
      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      {isInitialized && renderComponent() }
    
    </div>
  );
}


