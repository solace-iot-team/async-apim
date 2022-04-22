
import React from "react";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Divider } from "primereact/divider";

import APAppWebhooksDisplayService, { 
  EAPWebhookAuthMethodSelectIdNone, 
  IAPAppWebhookDisplay, 
  TAPAppWebhookDisplayList 
} from "../../displayServices/APAppsDisplayService/APAppWebhooksDisplayService";
import APDisplayUtils from "../../displayServices/APDisplayUtils";
import APEntityIdsService from "../../utils/APEntityIdsService";
import { ApiCallState, TApiCallState } from "../../utils/ApiCallState";
import { TAPDeveloperPortalUserAppDisplay } from "../../developer-portal/displayServices/APDeveloperPortalUserAppsDisplayService";
import { APClientConnectorOpenApi } from "../../utils/APClientConnectorOpenApi";

import "../APComponents.css";
import { ApiCallStatusError } from "../ApiCallStatusError/ApiCallStatusError";

export enum E_AP_DISPLAY_APP_WEBHOOK_LIST_CALL_STATE_ACTIONS {
  API_GET_APP_WEBHOOK_LIST = "API_GET_APP_WEBHOOK_LIST",
}

export interface IAPDisplayAppWebhookListProps {
  organizationId: string;
  apDeveloperPortalUserAppDisplay: TAPDeveloperPortalUserAppDisplay;
  onError: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
  emptyMessage: string;
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
    const mo: TManagedObject = event.data as TManagedObject;
    // alert(`${ComponentName}.onManagedObjectOpen(): show the status of the webhook now?`);
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

  // const statusBodyTemplate = (rowData: TAPDisplayAppWebhooksDataTableRow) => {
  //   if(!rowData.webhookWithoutEnvs) return emptyBodyTemplate();
  //   if(rowData.webhookStatus) {
  //     return (
  //       <APDisplayAppWebhookStatus
  //         apWebhookStatus={rowData.webhookStatus}
  //         displayContent={EAPDisplayAppWebhookStatus_Content.STATUS_ONLY}
  //       />
  //     );
  //   } else {
  //     return (<span className="pi pi-question" style={{ color: 'gray'}}/>);
  //   }
  // }

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
          ref={componentDataTableRef}
          dataKey={dataKey}  
          className="p-datatable-sm"
          autoLayout={true}
          resizableColumns 
          columnResizeMode="fit"
          showGridlines={false}

          // header="Double-click to see the Status"
          value={managedObjectList}

          selectionMode="single"
          selection={selectedManagedObject}
          onRowClick={onManagedObjectSelect}
          onRowDoubleClick={(e) => onManagedObjectOpen(e)}

          scrollable 

          sortMode='single'
          sortField={sortField}
          sortOrder={1}
        >
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
  // const renderComponent = (): JSX.Element => {
  //   return (
  //     <DataTable
  //       className="p-datatable-sm"
  //       ref={componentDataTableRef}
  //       dataKey="webhookEnvironmentReference.entityRef.name"
  //       value={dataTableList}
  //       sortMode="single" 
  //       sortField="webhookEnvironmentReference.entityRef.displayName" 
  //       sortOrder={1}
  //     >
  //       <Column 
  //         header="Environment" 
  //         headerStyle={{ width: '18em' }}
  //         body={environmentsBodyTemplate} 
  //         bodyStyle={{textAlign: 'left', overflow: 'visible', verticalAlign: 'top' }}  
  //         sortable 
  //         sortField="webhookEnvironmentReference.entityRef.displayName" 
  //       />
  //       <Column 
  //         header="Method"
  //         headerStyle={{ width: '7em' }}
  //         body={methodBodyTemplate} 
  //         bodyStyle={{verticalAlign: 'top'}} 
  //       />
  //       <Column 
  //         header="URI" 
  //         body={uriBodyTemplate} 
  //         bodyStyle={{ verticalAlign: 'top' }} 
  //       />
  //       <Column 
  //         header="Authentication" 
  //         headerStyle={{ width: '8em' }} 
  //         body={authenticationBodyTemplate} 
  //         bodyStyle={{textAlign: 'left', verticalAlign: 'top' }}
  //       />
  //       <Column header="Status" headerStyle={{ width: '5em', textAlign: 'center' }} body={statusBodyTemplate}  bodyStyle={{textAlign: 'center' }}/>
  //     </DataTable>
  //   );
  // }

  const renderComponent = () => {
    const funcName = 'renderComponent';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObjectList === undefined) throw new Error(`${logName}: managedObjectList === undefined`);

    if(managedObjectList.length === 0) {
      return (
        <React.Fragment>
          <Divider />
          {props.emptyMessage}
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


