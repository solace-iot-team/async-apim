
import React from "react";

import { DataTable } from 'primereact/datatable';
import { Column } from "primereact/column";
import { InputText } from 'primereact/inputtext';

import { 
  AppResponse,
  AppsService,
  CommonDisplayName,
  CommonName,
  EnvironmentResponse,
  EnvironmentsService,
  WebHook,
} from '@solace-iot-team/apim-connector-openapi-browser';
import { APClientConnectorOpenApi } from "../../../../utils/APClientConnectorOpenApi";
import { APSUserId } from "@solace-iot-team/apim-server-openapi-browser";
import { APRenderUtils } from "../../../../utils/APRenderUtils";
import { Globals } from "../../../../utils/Globals";
import { APComponentHeader } from "../../../../components/APComponentHeader/APComponentHeader";
import { ApiCallState, TApiCallState } from "../../../../utils/ApiCallState";
import { ApiCallStatusError } from "../../../../components/ApiCallStatusError/ApiCallStatusError";
import { TAPOrganizationId } from "../../../../components/APComponentsCommon";
import { 
  E_CALL_STATE_ACTIONS, TViewManagedAppWebhookList, TViewManagedWebhook, 
} from "./DeveloperPortalManageUserAppWebhooksCommon";

import '../../../../components/APComponents.css';
import "../DeveloperPortalManageUserApps.css";

export interface IDeveloperPortalListUserAppWebhooksProps {
  organizationId: TAPOrganizationId,
  userId: APSUserId,
  viewManagedAppWebhookList: TViewManagedAppWebhookList
  // onError: (apiCallState: TApiCallState) => void;
  // onSuccess: (apiCallState: TApiCallState) => void;
  // onLoadingChange: (isLoading: boolean) => void;
  onViewManagedWebhook: (managedWebhook: TViewManagedWebhook) => void;
}

export const DeveloperPortalListUserAppWebhooks: React.FC<IDeveloperPortalListUserAppWebhooksProps> = (props: IDeveloperPortalListUserAppWebhooksProps) => {
  const componentName = 'DeveloperPortalListUserAppWebhooks';

  const MessageNoManagedObjectsFoundCreateNew = 'No Webhooks found - create a new Webhook.';
  const GlobalSearchPlaceholder = 'search ...';

  type TManagedObject = TViewManagedAppWebhookList;
  type TManagedObjectTableDataRow = TViewManagedWebhook & {
    globalSearch: string
  };
  type TManagedObjectTableDataList = Array<TManagedObjectTableDataRow>;

  const transformManagedObjectToTableDataList = (mo: TManagedObject): TManagedObjectTableDataList => {
    const _transformViewManagedWebhookToTableDataRow = (mwh: TViewManagedWebhook): TManagedObjectTableDataRow => {
      const managedObjectTableDataRow: TManagedObjectTableDataRow = {
        ...mwh,
        globalSearch: ''
      };
      const globalSearch = Globals.generateDeepObjectValuesString(managedObjectTableDataRow);
      return {
        ...managedObjectTableDataRow,
        globalSearch: globalSearch
      }
    }
    return mo.managedWebhookList.map( (mwh: TViewManagedWebhook) => {
      return _transformViewManagedWebhookToTableDataRow(mwh);
    });
  }

  const [managedObject, setManagedObject] = React.useState<TManagedObject>();  
  const [selectedManagedWebhook, setSelectedManagedWebhook] = React.useState<TViewManagedWebhook>();
  // const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  // const [isGetManagedObjectListInProgress, setIsGetManagedObjectListInProgress] = React.useState<boolean>(false);
  const [globalFilter, setGlobalFilter] = React.useState<string>();
  const managedObjectListDataTableRef = React.useRef<any>(null);

  // * Api Calls *
  // const apiGetManagedObjectList = async(): Promise<TApiCallState> => {
  //   const funcName = 'apiGetManagedObjectList';
  //   const logName = `${componentName}.${funcName}()`;
  //   setIsGetManagedObjectListInProgress(true);
  //   let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_USER_APP, `retrieve list of webhooks for app: ${props.appDisplayName}`);
  //   try { 
  //     const _apiAppResponse: AppResponse = await AppsService.getDeveloperApp({
  //       organizationName: props.organizationId, 
  //       developerUsername: props.userId,
  //       appName: props.appId
  //     });
  //     // get all the environments
  //     if(!_apiAppResponse.environments) throw new Error(`${logName}: _apiAppResponse.environments is undefined`);
  //     let _apiAppEnvironmentResponseList: Array<EnvironmentResponse> = [];
  //     for(const _apiAppEnvironment of _apiAppResponse.environments) {
  //       if(!_apiAppEnvironment.name) throw new Error(`${logName}: _apiAppEnvironment.name is undefined`);
  //       const _apiEnvironmentResponse: EnvironmentResponse = await EnvironmentsService.getEnvironment({
  //         organizationName: props.organizationId,
  //         envName: _apiAppEnvironment.name
  //       });
  //       _apiAppEnvironmentResponseList.push(_apiEnvironmentResponse);
  //     }
  //     setManagedObjectList(transformGetApiObjectsToManagedObjectList(_apiAppResponse, _apiAppEnvironmentResponseList));
  //   } catch(e: any) {
  //     APClientConnectorOpenApi.logError(logName, e);
  //     callState = ApiCallState.addErrorToApiCallState(e, callState);
  //   }
  //   setApiCallStatus(callState);
  //   setIsGetManagedObjectListInProgress(false);
  //   return callState;
  // }

  React.useEffect(() => {
    setManagedObject(props.viewManagedAppWebhookList);
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  // React.useEffect(() => {
  //   if (apiCallStatus !== null) {
  //     if(apiCallStatus.success) props.onSuccess(apiCallStatus);
  //     else props.onError(apiCallStatus);
  //   }
  // }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  // * Data Table *
  const onTableDataRowSelect = (event: any): void => {
    setSelectedManagedWebhook(event.data);
  }  

  const onTableDataRowOpen = (event: any): void => {
    const managedWebhook: TViewManagedWebhook = event.data as TViewManagedWebhook;
    props.onViewManagedWebhook(managedWebhook);
  }

  const onInputGlobalFilter = (event: React.FormEvent<HTMLInputElement>) => {
    const _globalFilter: string | undefined = event.currentTarget.value !== '' ? event.currentTarget.value : undefined;
    setGlobalFilter(_globalFilter);
  }
 
  const renderDataTableHeader = (): JSX.Element => {
    return (
      <div className="table-header">
        <div className="table-header-container" />
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

  // const actionBodyTemplate = (managedObject: TManagedObject) => {
  //   return (
  //       <React.Fragment>
  //         <Button tooltip="view" icon="pi pi-folder-open" className="p-button-rounded p-button-outlined p-button-secondary p-mr-2" onClick={() => props.onManagedObjectView(managedObject.id, managedObject.displayName)} />
  //       </React.Fragment>
  //   );
  // }

  const environmentsBodyTemplate = (rowData: TManagedObjectTableDataRow): JSX.Element => {
    const stringList: Array<string> = rowData.webhookApiEnvironmentResponseList.map( (envResp: EnvironmentResponse) => {
      return envResp.displayName ? envResp.displayName : envResp.name;
    });
    return APRenderUtils.renderStringListAsDivList(stringList);
  }

  const authenticationBodyTemplate = (rowData: TManagedObjectTableDataRow): JSX.Element => {
    return (
        <pre style={ { fontSize: '10px' }} >
          {JSON.stringify(rowData.apiWebHook.authentication, null, 2)}
        </pre>
    );
  }

  const renderManagedObjectDataTable = () => {
    const funcName = 'renderManagedObjectDataTable';
    const logName = `${componentName}.${funcName}()`;
    if(!managedObject) throw new Error(`${logName}: managedObject is undefined`);
    let managedObjectTableDataList: TManagedObjectTableDataList = transformManagedObjectToTableDataList(managedObject);    
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
            value={managedObjectTableDataList}
            globalFilter={globalFilter}
            selectionMode="single"
            selection={selectedManagedWebhook}
            onRowClick={onTableDataRowSelect}
            onRowDoubleClick={(e) => onTableDataRowOpen(e)}
            scrollable 
            dataKey="apSynthId"  
            // sorting
            sortMode='single'
            sortField="apiWebHook.uri"
            sortOrder={1}
          >
            <Column field="apSynthId" header="Synth ID" />
            <Column field="apiWebHook.uri" header="URI" sortable filterField="globalSearch" bodyStyle={{ verticalAlign: 'top' }}/>
            <Column field="apiWebHook.method" header="Method" sortable bodyStyle={{ verticalAlign: 'top' }}/>
            <Column field="apiWebHook.mode" header="Mode" sortable bodyStyle={{ verticalAlign: 'top' }}/>
            <Column field="apiWebHook.mode" header="Mode" sortable bodyStyle={{ verticalAlign: 'top' }}/>
            <Column body={environmentsBodyTemplate} header="Environments" bodyStyle={{textAlign: 'left', overflow: 'visible', verticalAlign: 'top' }}/>
            <Column body={authenticationBodyTemplate} header="Authentication" bodyStyle={{textAlign: 'left', overflow: 'visible', verticalAlign: 'top' }}/>
            {/* <Column body={actionBodyTemplate} headerStyle={{width: '3em'}} bodyStyle={{textAlign: 'right', overflow: 'visible', verticalAlign: 'top' }}/> */}
        </DataTable>
      </div>
    );
  }

  const renderContent = (mo: TManagedObject) => {
    if(mo.managedWebhookList.length === 0) {
      return (<h3>{MessageNoManagedObjectsFoundCreateNew}</h3>);
    }
    return renderManagedObjectDataTable();
  }

  const renderDebug = (): JSX.Element => {
    if(!managedObject) return (<></>);
    if(managedObject.managedWebhookList.length > 0 && selectedManagedWebhook) {
      const _d = {
        ...selectedManagedWebhook,
        globalSearch: 'not shown...'
      }
      return (
        <pre style={ { fontSize: '10px' }} >
          {JSON.stringify(_d, null, 2)}
        </pre>
      );
    } else return (<></>);
  }

  return (
    <div className="apd-manage-user-apps">

      <APComponentHeader header={`Webhooks for App: ${props.viewManagedAppWebhookList.appDisplayName}`} />

      {/* <ApiCallStatusError apiCallStatus={apiCallStatus} /> */}

      { managedObject && renderContent(managedObject)}
      
      {/* DEBUG */}
      {renderDebug()}

    </div>
  );
}
