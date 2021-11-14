
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
import { TAPOrganizationId, TAPViewManagedWebhook } from "../../../../components/APComponentsCommon";
import { 
  EWebhookAuthMethodSelectIdNone,
  E_CALL_STATE_ACTIONS, TViewManagedAppWebhookList, 
} from "./DeveloperPortalManageUserAppWebhooksCommon";

import '../../../../components/APComponents.css';
import "../DeveloperPortalManageUserApps.css";
import { Button } from "primereact/button";

export interface IDeveloperPortalListUserAppWebhooksProps {
  organizationId: TAPOrganizationId,
  userId: APSUserId,
  viewManagedAppWebhookList: TViewManagedAppWebhookList
  // onError: (apiCallState: TApiCallState) => void;
  // onSuccess: (apiCallState: TApiCallState) => void;
  // onLoadingChange: (isLoading: boolean) => void;
  onViewManagedWebhook: (managedWebhook: TAPViewManagedWebhook) => void;
  onDeleteManagedWebhook: (managedWebhook: TAPViewManagedWebhook) => void;
  onCreateNewWebhook: (envName: CommonName, envDisplayName: CommonDisplayName) => void;
}

export const DeveloperPortalListUserAppWebhooks: React.FC<IDeveloperPortalListUserAppWebhooksProps> = (props: IDeveloperPortalListUserAppWebhooksProps) => {
  const componentName = 'DeveloperPortalListUserAppWebhooks';

  const MessageNoManagedObjectsFoundCreateNew = 'No Webhooks found - create a new Webhook.';
  const GlobalSearchPlaceholder = 'search ...';

  type TManagedObject = TViewManagedAppWebhookList;

  type TManagedObjectTableDataRow = {
    apViewManagedWebhook?: TAPViewManagedWebhook;
    globalSearch?: string;
    envName: CommonName;
    envDisplayName: CommonDisplayName;
  };
  type TManagedObjectTableDataList = Array<TManagedObjectTableDataRow>;

  const transformManagedObjectToTableDataList = (mo: TManagedObject): TManagedObjectTableDataList => {
    const funcName = 'transformManagedObjectToTableDataList';
    const logName = `${componentName}.${funcName}()`;

    // const _transformViewManagedWebhookToTableDataRowList = (mwh: TAPViewManagedWebhook): TManagedObjectTableDataList => {
    //   const managedObjectTableDataRow: TManagedObjectTableDataRow = {
    //     managedObject: mwh,
    //     globalSearch: '',
    //     envName: '1 of the envs',
    //     envDisplayName: 'display name for 1 of the envs'
    //   };
    //   const globalSearch = Globals.generateDeepObjectValuesString(managedObjectTableDataRow);
    //   return {
    //     ...managedObjectTableDataRow,
    //     globalSearch: globalSearch
    //   }
    // }
    // create the list of envName + envDisplayNames
    let tableDataList: TManagedObjectTableDataList = mo.apiAppEnvironmentResponseList.map( (envResponse: EnvironmentResponse) => {
      return {
        envName: envResponse.name,
        envDisplayName: envResponse.displayName ? envResponse.displayName : envResponse.name
      }
    });
    console.log(`${logName}: tableDataList.without webhooks = ${JSON.stringify(tableDataList.map( (x) => { return { envName: x.envName}}), null, 2)}`);

    // add a webhook to the env if it exists somewhere
    mo.managedWebhookList.forEach( (apViewManagedWebhook: TAPViewManagedWebhook) => {
      // list could be empty ==> all envs
      // should NOT be empty here
      if(apViewManagedWebhook.webhookApiEnvironmentResponseList.length === 0) {
        throw new Error(`${logName}: apViewManagedWebhook.webhookApiEnvironmentResponseList is empty`);
        // mo.apiAppEnvironmentResponseList.forEach( (envResponse: EnvironmentResponse) => {
        //   let tableDataRow = tableDataList.find( (row: TManagedObjectTableDataRow) => {
        //     return (row.envName === envResponse.name);
        //   }); 
        //   if(!tableDataRow) throw new Error(`${logName}: tableDataRow is undefined`);
        //   const xTableDataRow: TManagedObjectTableDataRow = {
        //     ...tableDataRow,
        //     apViewManagedWebhook: apViewManagedWebhook            
        //   }
        //   tableDataList.push({
        //     ...xTableDataRow,
        //     globalSearch: Globals.generateDeepObjectValuesString(xTableDataRow)
        //   });
        // });
      } else {
        apViewManagedWebhook.webhookApiEnvironmentResponseList.forEach( (envResponse: EnvironmentResponse) => {
          let tableDataRowIdx = tableDataList.findIndex( (row: TManagedObjectTableDataRow) => {
            return (row.envName === envResponse.name);
          }); 
          if(tableDataRowIdx === -1) throw new Error(`${logName}: cannot find webhook envs with actual envs, env=${envResponse.name}, webhook env=${JSON.stringify(apViewManagedWebhook.webhookApiEnvironmentResponseList, null, 2)} `);
          tableDataList[tableDataRowIdx].apViewManagedWebhook = apViewManagedWebhook;
          tableDataList[tableDataRowIdx].globalSearch = Globals.generateDeepObjectValuesString(tableDataList[tableDataRowIdx]);
          // const xTableDataRow: TManagedObjectTableDataRow = {
          //   ...tableDataRow,
          //   apViewManagedWebhook: apViewManagedWebhook            
          // }
          // // replace
          // tableDataList.push({
          //   ...xTableDataRow,
          //   globalSearch: Globals.generateDeepObjectValuesString(xTableDataRow)
          // });
        });  
      }
    });

    console.log(`${logName}: tableDataList.short = ${JSON.stringify(tableDataList.map( (x) => { return { envName: x.envName}}), null, 2)}`);
    console.log(`${logName}: tableDataList = ${JSON.stringify(tableDataList, null, 2)}`);

    return tableDataList;
  }

  const [managedObject, setManagedObject] = React.useState<TManagedObject>();  
  // const [selectedManagedWebhook, setSelectedManagedWebhook] = React.useState<TAPViewManagedWebhook>();
  // const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  // const [isGetManagedObjectListInProgress, setIsGetManagedObjectListInProgress] = React.useState<boolean>(false);
  const [globalFilter, setGlobalFilter] = React.useState<string>();
  const managedObjectListDataTableRef = React.useRef<any>(null);
  const [selectedTableDataRow, setSelectedTableDataRow] = React.useState<TManagedObjectTableDataRow>();

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
  const onTableDataRowSelect = (rowData: TManagedObjectTableDataRow): void => {
    setSelectedTableDataRow(rowData);
  }  

  const onTableDataRowOpen = (rowData: TManagedObjectTableDataRow): void => {
    const funcName = 'onTableDataRowOpen';
    const logName = `${componentName}.${funcName}()`;
    if(!rowData.apViewManagedWebhook) {
      alert(`${logName}: render dialog: do you want to create a new webhook for env = ${rowData.envDisplayName}?`);
      // props.onCreateNewWebhook(rowData.envName, rowData.envDisplayName);
    }
    else props.onViewManagedWebhook(rowData.apViewManagedWebhook);
  }

  const onTableDataRowDelete = (rowData: TManagedObjectTableDataRow): void => {
    const funcName = 'onTableDataRowDelete';
    const logName = `${componentName}.${funcName}()`;
    if(!rowData.apViewManagedWebhook) throw new Error(`${logName}: rowData.apViewManagedWebhook is undefined`);
    props.onDeleteManagedWebhook(rowData.apViewManagedWebhook);
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

  const emptyBodyTemplate = (): JSX.Element => {
    return (<span className="pi pi-minus" style={{ color: 'gray'}}/>)
  }

  const environmentsBodyTemplate = (rowData: TManagedObjectTableDataRow): string => {
    return rowData.envDisplayName;
  }

  // const environmentsBodyTemplate = (rowData: TManagedObjectTableDataRow): JSX.Element => {
  //   const stringList: Array<string> = rowData.webhookApiEnvironmentResponseList.map( (envResp: EnvironmentResponse) => {
  //     return envResp.displayName ? envResp.displayName : envResp.name;
  //   });
  //   return APRenderUtils.renderStringListAsDivList(stringList);
  // }

  const methodBodyTemplate = (rowData: TManagedObjectTableDataRow) => {
    if(!rowData.apViewManagedWebhook) return emptyBodyTemplate();
    return rowData.apViewManagedWebhook?.apiWebHook.method;
  }
  const uriBodyTemplate = (rowData: TManagedObjectTableDataRow) => {
    if(!rowData.apViewManagedWebhook) return emptyBodyTemplate();
    return rowData.apViewManagedWebhook?.apiWebHook.uri;
  }

  // const methodUriBodyTemplate = (rowData: TManagedObjectTableDataRow): JSX.Element => {
  //   const s: string = `${rowData.apiWebHook.method}: ${rowData.apiWebHook.uri}`;
  //   return (
  //     <>{s}</>
  //   );
  // }
  const authenticationBodyTemplate = (rowData: TManagedObjectTableDataRow): JSX.Element => {
    if(!rowData.apViewManagedWebhook) return emptyBodyTemplate();
    if(rowData.apViewManagedWebhook?.apiWebHook.authentication) {
      return (
          <pre style={ { fontSize: '10px' }} >
            {JSON.stringify(rowData.apViewManagedWebhook?.apiWebHook.authentication, null, 2)}
          </pre>
      );
    } else {
      return <>{EWebhookAuthMethodSelectIdNone.NONE}</>
    }
  }
  const statusBodyTemplate = (rowData: TManagedObjectTableDataRow) => {
    if(!rowData.apViewManagedWebhook) return emptyBodyTemplate();
    if(rowData.apViewManagedWebhook?.apWebhookStatus) {
      if(rowData.apViewManagedWebhook?.apWebhookStatus.summaryStatus) return (<span className="pi pi-check" style={{ color: 'green'}}/>);
      else return (<span className="pi pi-times" style={{ color: 'red'}}/>);
    } else {
      return (<span className="pi pi-question" style={{ color: 'gray'}}/>);
    }
  }
  const rightActionBodyTemplate = (rowData: TManagedObjectTableDataRow) => {
    if(!rowData.apViewManagedWebhook) return (<></>);
    return (
      <Button icon="pi pi-trash" className="p-button-rounded p-button-outlined p-button-secondary p-mr-2" onClick={(e) => onTableDataRowDelete(rowData)} />
    );
  }
  const renderManagedObjectDataTable = () => {
    const funcName = 'renderManagedObjectDataTable';
    const logName = `${componentName}.${funcName}()`;
    if(!managedObject) throw new Error(`${logName}: managedObject is undefined`);
    let managedObjectTableDataList: TManagedObjectTableDataList = transformManagedObjectToTableDataList(managedObject);    
    return (
      <React.Fragment>
        <pre>
          - new table structure: <br/>
          - envName as key, <br/>
          - envDisplayName with Method | URI | Status (up/down)<br/>
          - envDisplayName without webhook <br/>
          - buttons: edit/delete for existing webhook <br/>
          - button: add for non-existing webhook <br/>
          - double click: View if has a webhook, otherwise ask: do you want to add a new webhook?<br/>

        </pre>  
        <div className="card">
          <DataTable
            ref={managedObjectListDataTableRef}
            className="p-datatable-sm"
            // autoLayout={true}
            // resizableColumns 
            // columnResizeMode="fit"
            showGridlines={false}
            header={renderDataTableHeader()}
            value={managedObjectTableDataList}
            globalFilter={globalFilter}
            selectionMode="single"
            selection={selectedTableDataRow}
            onRowClick={(e) => onTableDataRowSelect(e.data)}
            onRowDoubleClick={(e) => onTableDataRowOpen(e.data)}
            scrollable 
            dataKey="envName"  
            // sorting
            sortMode='single'
            sortField="envDisplayName"
            sortOrder={1}
          >
            {/* <Column field="apSynthId" header="Synth ID" /> */}
            <Column 
              header="Environment" 
              body={environmentsBodyTemplate} 
              bodyStyle={{textAlign: 'left', overflow: 'visible', verticalAlign: 'top' }}  
              sortable 
              filterField="globalSearch"
              sortField="envDisplayName"              
            />
            <Column header="Method" body={methodBodyTemplate} bodyStyle={{verticalAlign: 'top'}} />
            <Column header="URI" body={uriBodyTemplate} bodyStyle={{ verticalAlign: 'top' }}/>
            <Column body={authenticationBodyTemplate} header="Authentication" bodyStyle={{textAlign: 'left', overflow: 'visible', verticalAlign: 'top' }}/>
            <Column body={statusBodyTemplate} header="Status" headerStyle={{ width: '5em', textAlign: 'center' }} bodyStyle={{textAlign: 'center' }}/>
            <Column body={rightActionBodyTemplate} headerStyle={{width: '3em'}} bodyStyle={{textAlign: 'right', verticalAlign: 'top' }}/>
        </DataTable>
      </div>
      </React.Fragment>
    );
  }

  const renderContent = (mo: TManagedObject) => {
    // if(mo.managedWebhookList.length === 0) {
    //   return (<h3>{MessageNoManagedObjectsFoundCreateNew}</h3>);
    // }
    return renderManagedObjectDataTable();
  }

  const renderDebug = (): JSX.Element => {
    if(selectedTableDataRow) {
      const _d = {
        ...selectedTableDataRow,
        globalSearch: 'not shown...'
      };
      return(
        <React.Fragment>
          <h1>{componentName}: selectedTableDataRow:</h1>
          <pre style={ { fontSize: '10px' }} >{JSON.stringify(_d, null, 2)}</pre>
        </React.Fragment>
      );
    }
    return (<></>);
    // if(!managedObject) return (<></>);
    // if(managedObject.managedWebhookList.length > 0 && selectedManagedWebhook) {
    //   const _d = {
    //     ...selectedManagedWebhook,
    //     globalSearch: 'not shown...'
    //   }
    //   return (
    //     <React.Fragment>
    //       <h1>{componentName}: selectedManagedWebhook:</h1>
    //       <pre style={ { fontSize: '10px' }} >{JSON.stringify(_d, null, 2)}</pre>
    //     </React.Fragment>
    //   );
    // } else return (<></>);
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
