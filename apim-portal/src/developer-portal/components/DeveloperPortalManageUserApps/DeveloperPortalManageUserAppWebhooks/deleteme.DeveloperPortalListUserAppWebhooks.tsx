
import React from "react";

import { DataTable } from 'primereact/datatable';
import { Column } from "primereact/column";
import { InputText } from 'primereact/inputtext';
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";

import { 
  AppStatus,
  WebHookAuth,
  WebHookBasicAuth,
  WebHookHeaderAuth
} from '@solace-iot-team/apim-connector-openapi-browser';
import { APComponentHeader } from "../../../../components/APComponentHeader/APComponentHeader";
import { 
  TAPManagedAppWebhooks, 
  TAPManagedWebhook, 
  TAPManagedWebhookList, 
  TAPWebhookStatus 
} from "../../../../components/deleteme.APComponentsCommon";
import { 
  EWebhookAuthMethodSelectIdNone,
} from "./deleteme.DeveloperPortalManageUserAppWebhooksCommon";
import { Globals } from "../../../../utils/Globals";
import { APDisplayAppWebhookStatus, EAPDisplayAppWebhookStatus_Content } from "../../../../components/APDisplayAppStatus/deleteme.APDisplayAppWebhookStatus";

import '../../../../components/APComponents.css';
import "../deleteme.DeveloperPortalManageUserApps.css";

export interface IDeveloperPortalListUserAppWebhooksProps {
  managedAppWebhooks: TAPManagedAppWebhooks;
  onViewManagedWebhook: (apManagedWebhook: TAPManagedWebhook) => void;
  onDeleteManagedWebhook: (apManagedWebhook: TAPManagedWebhook) => void;
  onNewManagedWebhook: (apManagedWebhook: TAPManagedWebhook) => void;
}

export const DeveloperPortalListUserAppWebhooks: React.FC<IDeveloperPortalListUserAppWebhooksProps> = (props: IDeveloperPortalListUserAppWebhooksProps) => {
  const componentName = 'DeveloperPortalListUserAppWebhooks';

  const GlobalSearchPlaceholder = 'search ...';

  type TManagedObjectTableDataRow = {
    apManagedWebhook: TAPManagedWebhook;
    globalSearch: string;
  };
  type TManagedObjectTableDataList = Array<TManagedObjectTableDataRow>;

  const transformAPManagedWebhookListToTableDataList = (apMWHList: TAPManagedWebhookList): TManagedObjectTableDataList => {
    let _moTableDataList: TManagedObjectTableDataList = [];
    apMWHList.forEach( (apMWH: TAPManagedWebhook) => {
      const _globalSearch: any = {
        ...apMWH.webhookEnvironmentReference,
        ...apMWH.webhookStatus,
        ...apMWH.webhookWithoutEnvs
      }
      const row: TManagedObjectTableDataRow = {
        apManagedWebhook: apMWH,
        globalSearch: Globals.generateDeepObjectValuesString(_globalSearch)
      }
      _moTableDataList.push(row);
    });
    return _moTableDataList;
  }

  const [globalFilter, setGlobalFilter] = React.useState<string>();
  const managedObjectListDataTableRef = React.useRef<any>(null);
  const [selectedTableDataRow, setSelectedTableDataRow] = React.useState<TManagedObjectTableDataRow>();
  const [showCreateWebhookDialog, setShowCreateWebhookDialog] = React.useState<boolean>(false);

  // * Data Table *
  const onTableDataRowSelect = (rowData: TManagedObjectTableDataRow): void => {
    setSelectedTableDataRow(rowData);
  }  

  const onTableDataRowOpen = (rowData: TManagedObjectTableDataRow): void => {
    if(!rowData.apManagedWebhook.webhookWithoutEnvs) {
      setShowCreateWebhookDialog(true);
    }
    else props.onViewManagedWebhook(rowData.apManagedWebhook);
  }

  const onInputGlobalFilter = (event: React.FormEvent<HTMLInputElement>) => {
    const _globalFilter: string | undefined = event.currentTarget.value !== '' ? event.currentTarget.value : undefined;
    setGlobalFilter(_globalFilter);
  }
 
  const onCreateWebhookDialogCreate = () => {
    const funcName = 'onCreateWebhookDialogCreate';
    const logName = `${componentName}.${funcName}()`;
    setShowCreateWebhookDialog(false);
    if(!selectedTableDataRow) throw new Error(`${logName}: selectedTableDataRow is undefined`);    
    props.onNewManagedWebhook(selectedTableDataRow.apManagedWebhook);
  }

  const onCreateWebhookDialogRevoked = () => {
    const funcName = 'onCreateWebhookDialogRevoked';
    const logName = `${componentName}.${funcName}()`;
    throw new Error(`${logName}: App access has been revoked, handle properly`);
    // setShowCreateWebhookDialog(false);
    // if(!selectedTableDataRow) throw new Error(`${logName}: selectedTableDataRow is undefined`);    
    // props.onNewManagedWebhook(selectedTableDataRow.apManagedWebhook);
  }

  const onCreateWebhookDialogCancel = () => {
    setShowCreateWebhookDialog(false);
  }
  const renderCreateWebhookDialog = (): JSX.Element => {
    const funcName = 'renderCreateWebhookDialog';
    const logName = `${componentName}.${funcName}()`;

    const renderDialogFooter = (appStatus: AppStatus): JSX.Element => {

      const getYesButton = (appStatus: AppStatus): JSX.Element => {
        switch(appStatus) {
          case AppStatus.PENDING:
            return (
              <Button label="Create" icon="pi pi-plus" className="p-button-text p-button-plain p-button-outlined" onClick={onCreateWebhookDialogCreate}/>
            );
          case AppStatus.APPROVED:
            return (
              <Button label="Provision" icon="pi pi-fast-forward" className="p-button-text p-button-plain p-button-outlined" onClick={onCreateWebhookDialogCreate}/>
            );
          case AppStatus.REVOKED:
            return (
              <Button label="Provision" icon="pi pi-fast-forward" className="p-button-text p-button-plain p-button-outlined" onClick={onCreateWebhookDialogRevoked}/>
            );
          default:
            Globals.assertNever(logName, appStatus);
        }
        return (<></>);
      }
        
      return (
        <React.Fragment>
          <Button label="Cancel" className="p-button-text p-button-plain" onClick={onCreateWebhookDialogCancel} />
          {getYesButton(appStatus)}
        </React.Fragment>
      );
    }   
    const renderDialogContent = (appStatus: AppStatus): JSX.Element => {
      return (
        <React.Fragment>
          <p>App: <b>{props.managedAppWebhooks.appDisplayName}</b>.</p>
          <p>App Status: <b>{appStatus}</b>.</p>
          <p>Environment: <b>{selectedTableDataRow?.apManagedWebhook.webhookEnvironmentReference.entityRef.displayName}</b>.</p>
          <p className="p-mt-2">{question}</p>
        </React.Fragment>
      );
    } 

    const appStatus: AppStatus | undefined = props.managedAppWebhooks.apiAppResponse.status;
    if(!appStatus) throw new Error(`${logName}: appStatus is undefined`);

    let header: string = '';
    let question: string = '';
    switch(appStatus) {
      case AppStatus.APPROVED:
        header = 'Provision a new Webhook';
        question = 'Do you want to provision a new webhook?';
        break;
      case AppStatus.PENDING:
        header = 'Create a new Webhook';
        question = 'Do you want to create a new webhook?';
        break;
      case AppStatus.REVOKED:
        header = 'App access has been revoked.';
        question = 'You cannot create a new webhook.';
        break;
      default:
        Globals.assertNever(logName, appStatus);
    }

    return (
      <Dialog
        className="p-fluid"
        visible={showCreateWebhookDialog} 
        style={{ width: '450px' }} 
        header={header}
        modal
        closable={false}
        footer={renderDialogFooter(appStatus)}
        onHide={()=> {}}
      >
        <div className="confirmation-content">
          {renderDialogContent(appStatus)}
        </div>
      </Dialog>
    );
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

  const emptyBodyTemplate = (): JSX.Element => {
    return (<span className="pi pi-minus" style={{ color: 'gray'}}/>)
  }
  const environmentsBodyTemplate = (rowData: TManagedObjectTableDataRow): string => {
    return rowData.apManagedWebhook.webhookEnvironmentReference.entityRef.displayName;
  }
  const methodBodyTemplate = (rowData: TManagedObjectTableDataRow) => {
    if(!rowData.apManagedWebhook.webhookWithoutEnvs) return emptyBodyTemplate();
    return rowData.apManagedWebhook.webhookWithoutEnvs.method;
  }
  const uriBodyTemplate = (rowData: TManagedObjectTableDataRow) => {
    if(!rowData.apManagedWebhook.webhookWithoutEnvs) return emptyBodyTemplate();
    return rowData.apManagedWebhook.webhookWithoutEnvs.uri;
  }
  const authenticationBodyTemplate = (rowData: TManagedObjectTableDataRow): JSX.Element => {
    const funcName = 'authenticationBodyTemplate';
    const logName = `${componentName}.${funcName}()`;
    if(!rowData.apManagedWebhook.webhookWithoutEnvs) return emptyBodyTemplate();
    const webHookAuth: WebHookAuth | undefined = rowData.apManagedWebhook.webhookWithoutEnvs.authentication;
    const isDefined: boolean = (webHookAuth !== undefined);
    let jsxType: JSX.Element = (<span style={{ color: 'gray'}}>{EWebhookAuthMethodSelectIdNone.NONE}</span>);
    if(isDefined) {
      if(!webHookAuth) throw new Error(`${logName}: webHookAuth is undefined`);
      if(!webHookAuth.authMethod) throw new Error(`${logName}: webHookAuth.authMethod is undefined`);
      switch(webHookAuth.authMethod) {
        case WebHookBasicAuth.authMethod.BASIC:
          jsxType = (<span>{WebHookBasicAuth.authMethod.BASIC}</span>);
          break;
        case WebHookHeaderAuth.authMethod.HEADER:
          jsxType = (<span>{WebHookHeaderAuth.authMethod.HEADER}</span>);
          break;
        default:
          Globals.assertNever(logName, webHookAuth.authMethod);
      }
    } 
    return (
      <React.Fragment>
        <div>Type: {jsxType}</div>
      </React.Fragment>
    );
  }
  const statusBodyTemplate = (rowData: TManagedObjectTableDataRow) => {
    const funcName = 'statusBodyTemplate';
    const logName = `${componentName}.${funcName}()`;
    if(!rowData.apManagedWebhook.webhookWithoutEnvs) return emptyBodyTemplate();
    const appStatus: AppStatus | undefined = rowData.apManagedWebhook.references.apiAppResponse.status;
    if(!appStatus) throw new Error(`${logName}: appStatus is undefined`);
    const webhookStatus: TAPWebhookStatus | undefined = rowData.apManagedWebhook.webhookStatus;
    let jsxSummaryStatus: JSX.Element; 

    if(appStatus === AppStatus.PENDING) jsxSummaryStatus = (<span style={{ color: 'gray'}}>N/A</span>);
    else if(!webhookStatus) jsxSummaryStatus = (<span className="pi pi-question" style={{ color: 'gray'}} />);
    else {
      jsxSummaryStatus = (
        <APDisplayAppWebhookStatus
          apWebhookStatus={webhookStatus}
          displayContent={EAPDisplayAppWebhookStatus_Content.STATUS_ONLY}
        />
      );
    }
    return (
      <React.Fragment>
        <div>{jsxSummaryStatus}</div>
      </React.Fragment>
    );
  }
  // const rightActionBodyTemplate = (rowData: TManagedObjectTableDataRow) => {
  //   if(!rowData.apManagedWebhook.webhookWithoutEnvs) return (<></>);
  //   return (
  //     <Button icon="pi pi-trash" className="p-button-rounded p-button-outlined p-button-secondary p-mr-2" onClick={(e) => onTableDataRowDelete(rowData)} />
  //   );
  // }
  const renderManagedObjectDataTable = (apMWHList: TAPManagedWebhookList) => {
    let managedObjectTableDataList: TManagedObjectTableDataList = transformAPManagedWebhookListToTableDataList(apMWHList);    
    return (
      <React.Fragment>
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
            dataKey="apManagedWebhook.webhookEnvironmentReference.entityRef.name"  
            // sorting
            sortMode='single'
            sortField="apManagedWebhook.webhookEnvironmentReference.entityRef.displayName"
            sortOrder={1}
          >
            <Column 
              header="Environment" 
              headerStyle={{width: '15em'}}
              body={environmentsBodyTemplate} 
              bodyStyle={{ verticalAlign: 'top' }}  
              sortable 
              filterField="globalSearch"
              sortField="apManagedWebhook.webhookEnvironmentReference.entityRef.displayName"
            />
            <Column header="Method" headerStyle={{width: '5em'}} body={methodBodyTemplate} bodyStyle={{verticalAlign: 'top'}} />
            <Column header="URI" body={uriBodyTemplate} bodyStyle={{ verticalAlign: 'top' }}/>
            <Column header="Authentication" headerStyle={{width: '8em'}} body={authenticationBodyTemplate} bodyStyle={{textAlign: 'left', overflow: 'visible', verticalAlign: 'top' }}/>
            <Column header="Status" headerStyle={{ width: '8em', textAlign: 'center' }} body={statusBodyTemplate} bodyStyle={{textAlign: 'center', verticalAlign: 'top' }}/>
            {/* <Column headerStyle={{width: '3em'}} body={rightActionBodyTemplate} bodyStyle={{textAlign: 'right', verticalAlign: 'top' }}/> */}
        </DataTable>
      </div>
      </React.Fragment>
    );
  }

  const renderInfo = (mAppWebhooks: TAPManagedAppWebhooks) => {
    return (
      <React.Fragment>
        <div><b>App Status</b>: {mAppWebhooks.apiAppResponse.status}</div>
      </React.Fragment>
    );
  }

  const renderContent = (mAppWebhooks: TAPManagedAppWebhooks) => {
    const funcName = 'renderContent';
    const logName = `${componentName}.${funcName}()`;

    // // even if webhooks are empty, this one should always have the empty webhooks 
    // console.log(`${logName}: mAppWebhooks.apManagedWebhookList=${JSON.stringify(mAppWebhooks.apManagedWebhookList, null, 2)}`);


    // causes the Errror
    if(mAppWebhooks.apManagedWebhookList.length === 0) throw new Error(`${logName}: mAppWebhooks.apManagedWebhookList.length === 0`);

    return (
      <React.Fragment>
        <div className="p-mt-4">
          {renderInfo(mAppWebhooks)}
        </div>
        <div className="p-mt-4">
          {renderManagedObjectDataTable(mAppWebhooks.apManagedWebhookList)}
        </div>
      </React.Fragment>
    )
  }

  // const renderDebug = (): JSX.Element => {
  //   if(selectedTableDataRow) {
  //     const _d = {
  //       ...selectedTableDataRow,
  //       globalSearch: 'not shown...'
  //     };
  //     return(
  //       <React.Fragment>
  //         <div style={{ width: '50em'}}>
  //           <h1>{componentName}: selectedTableDataRow.globalSearch:</h1>
  //           <pre style={ { fontSize: '10px' }} >{JSON.stringify(selectedTableDataRow.globalSearch, null, 2)}</pre>
  //         </div>
  //         <h1>{componentName}: selectedTableDataRow:</h1>
  //         <pre style={ { fontSize: '10px' }} >{JSON.stringify(_d, null, 2)}</pre>
  //       </React.Fragment>
  //     );
  //   }
  //   return (<></>);
  // }

  return (
    <div className="apd-manage-user-apps">

      <APComponentHeader header={`Webhooks for App: ${props.managedAppWebhooks.appDisplayName}`} />

      { renderContent(props.managedAppWebhooks)}

      { showCreateWebhookDialog && renderCreateWebhookDialog() }
      
      {/* DEBUG */}
      {/* {renderDebug()} */}

    </div>
  );
}
