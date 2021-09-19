
import React from "react";

import { DataTable } from 'primereact/datatable';
import { Column } from "primereact/column";
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';

import { 
  App,
  AppsService,
  WebHook
} from '@solace-iot-team/platform-api-openapi-client-fe';
import { APSUserId } from "@solace-iot-team/apim-server-openapi-browser";

import { APRenderUtils } from "../../../utils/APRenderUtils";
import { 
  APClientConnectorOpenApi, 
  TConnectorWebhookBasicAuthentication, 
  TConnectorWebhookHeaderAuthentication, 
  EConnectorWebhookAuthenticationMethod 
} from "../../../utils/APClientConnectorOpenApi";
import { APComponentHeader } from "../../../components/APComponentHeader/APComponentHeader";
import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { TAPLazyLoadingTableParameters, TAPOrganizationId } from "../../../components/APComponentsCommon";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { 
  E_CALL_STATE_ACTIONS, 
  DeveloperPortalManageUserAppsCommon, 
  TManagedObjectId, 
  TViewManagedObject 
} from "./DeveloperPortalManageUserAppsCommon";

import '../../../components/APComponents.css';
import "./DeveloperPortalManageUserApps.css";

export interface IDeveloperPortalListUserAppsProps {
  organizationId: TAPOrganizationId,
  userId: APSUserId,
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
  onManagedObjectEdit: (managedObjectId: TManagedObjectId, managedObjectDisplayName: string) => void;
  onManagedObjectDelete: (managedObjectId: TManagedObjectId, managedObjectDisplayName: string) => void;
  onManagedObjectView: (managedObjectId: TManagedObjectId, managedObjectDisplayName: string) => void;
}

export const DeveloperPortalListUserApps: React.FC<IDeveloperPortalListUserAppsProps> = (props: IDeveloperPortalListUserAppsProps) => {
  const componentName = 'DeveloperPortalListUserApps';

  const MessageNoManagedObjectsFoundCreateNew = 'No Apps found - create a new app.';
  const MessageNoManagedObjectsFoundWithFilter = 'No Apps found for filter';
  const GlobalSearchPlaceholder = 'Enter search word list separated by <space> ...';

  type TManagedObject = TViewManagedObject;
  type TManagedObjectList = Array<TManagedObject>;
  type TManagedObjectTableDataRow = TManagedObject & {
    // attributeListAsDisplayString: string
  };
  type TManagedObjectTableDataList = Array<TManagedObjectTableDataRow>;

  // const transformTableSortFieldNameToApiSortFieldName = (tableSortFieldName: string): string => {
  //   // const funcName = 'transformTableSortFieldNameToApiSortFieldName';
  //   // const logName = `${componentName}.${funcName}()`;
  //   // console.log(`${logName}: tableSortFieldName = ${tableSortFieldName}`);
  //   if(tableSortFieldName.startsWith('apiObject.')) {
  //     return tableSortFieldName.replace('apiObject.', '');
  //   }
  //   return tableSortFieldName;
  // }

  const transformManagedObjectListToTableDataList = (managedObjectList: TManagedObjectList): TManagedObjectTableDataList => {
    const _transformManagedObjectToTableDataRow = (managedObject: TManagedObject): TManagedObjectTableDataRow => {
      // const funcName = '_transformManagedObjectToTableDataRow';
      // const logName = `${componentName}.${funcName}()`;
      return {
        ...managedObject,
        // attributeListAsDisplayString: "attributeListAsDisplayString",
      }
    }
    return managedObjectList.map( (managedObject: TManagedObject) => {
      return _transformManagedObjectToTableDataRow(managedObject);
    });
  }

  const [managedObjectList, setManagedObjectList] = React.useState<TManagedObjectList>([]);  
  const [selectedManagedObject, setSelectedManagedObject] = React.useState<TManagedObject>();
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [isGetManagedObjectListInProgress, setIsGetManagedObjectListInProgress] = React.useState<boolean>(false);
  // * Lazy Loading * 
  const lazyLoadingTableRowsPerPageOptions: Array<number> = [10,20,50,100];
  const [lazyLoadingTableParams, setLazyLoadingTableParams] = React.useState<TAPLazyLoadingTableParameters>({
    isInitialSetting: false,
    first: 0, // index of the first row to be displayed
    rows: lazyLoadingTableRowsPerPageOptions[0], // number of rows to display per page
    page: 0,
    // sortField: 'apiObject.isActivated',
    sortField: 'apiObject.name',
    sortOrder: 1
  });
  const [lazyLoadingTableTotalRecords, setLazyLoadingTableTotalRecords] = React.useState<number>(0);
  const [lazyLoadingTableIsLoading, setLazyLoadingTableIsLoading] = React.useState<boolean>(false);
  // * Global Filter *
  const [globalFilter, setGlobalFilter] = React.useState<string>();
  // * Data Table *
  const dt = React.useRef<any>(null);

  // * Api Calls *
  // do this one when paging w/ query/sort supported
  // const apiGetManagedObjectListPage = async(pageSize: number, pageNumber: number, sortFieldName: string, sortDirection: EAPSSortDirection, searchWordList?: string): Promise<TApiCallState> => {

  const apiGetManagedObjectList = async(pageSize: number, pageNumber: number): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObjectList';
    const logName = `${componentName}.${funcName}()`;
    setIsGetManagedObjectListInProgress(true);
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_USER_APP_LIST, `retrieve list of apps for ${props.userId}`);
    try { 
      const apiAppList: Array<App> = await AppsService.listDeveloperApps(props.organizationId, props.userId, undefined, pageSize, pageNumber);
      const totalCount: number = 1000; // should be returned by previous call
      let _managedObjectList: TManagedObjectList = [];
      for(const apiApp of apiAppList) {
        _managedObjectList.push(DeveloperPortalManageUserAppsCommon.transformViewApiObjectToViewManagedObject(apiApp));
      }
      setManagedObjectList(_managedObjectList);
      setLazyLoadingTableTotalRecords(totalCount);
    } catch(e: any) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    setIsGetManagedObjectListInProgress(false);
    return callState;
  }

  const doLoadPage = async () => {
    // const funcName = 'doLoadPage';
    // const logName = `${componentName}.${funcName}()`;
    // console.log(`${logName}: lazyLoadingTableParams = ${JSON.stringify(lazyLoadingTableParams, null, 2)}`);
    setLazyLoadingTableIsLoading(true);
    const pageNumber: number = lazyLoadingTableParams.page + 1;
    const pageSize: number = lazyLoadingTableParams.rows;
        // Activate when connector can do search + sort

    // const sortFieldName: string = transformTableSortFieldNameToApiSortFieldName(lazyLoadingTableParams.sortField);
    // const sortDirection: EAPSSortDirection  = APComponentsCommon.transformTableSortDirectionToApiSortDirection(lazyLoadingTableParams.sortOrder);
    // const searchWordList: string | undefined = globalFilter;
    // await apiGetManagedObjectListPage(pageSize, pageNumber, sortFieldName, sortDirection, searchWordList);
    await apiGetManagedObjectList(pageSize, pageNumber);
    setLazyLoadingTableIsLoading(false);
  }

  React.useEffect(() => {
    doLoadPage();
  }, [lazyLoadingTableParams]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    doLoadPage();
  }, [globalFilter]); /* eslint-disable-line react-hooks/exhaustive-deps */

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
    const managedObject: TManagedObject = event.data as TManagedObject;
    props.onManagedObjectView(managedObject.id, managedObject.displayName);
  }

  const onInputGlobalFilter = (event: React.FormEvent<HTMLInputElement>) => {
    const _globalFilter: string | undefined = event.currentTarget.value !== '' ? event.currentTarget.value : undefined;
    setGlobalFilter(_globalFilter);
  }
 
  const renderDataTableHeader = (): JSX.Element => {
    return (
      <div className="table-header">
        {/* <h2 className="p-m-0">{DataTableHeader}</h2> */}
        <div className="table-header-container">
          <Button icon="pi pi-plus" label="Expand All" onClick={onExpandAll} className="p-button-rounded p-button-outlined p-button-secondary p-mr-2" />
          <Button icon="pi pi-minus" label="Collapse All" onClick={onCollapseAll} className="p-button-rounded p-button-outlined p-button-secondary" />
        </div>        
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText type="search" placeholder={GlobalSearchPlaceholder} onInput={onInputGlobalFilter} style={{width: '500px'}} disabled />
        </span>
      </div>
    );
  }

  const actionBodyTemplate = (managedObject: TManagedObject) => {
    return (
        <React.Fragment>
          <Button tooltip="view" icon="pi pi-folder-open" className="p-button-rounded p-button-outlined p-button-secondary p-mr-2" onClick={() => props.onManagedObjectView(managedObject.id, managedObject.displayName)} />
          <Button tooltip="edit" icon="pi pi-pencil" className="p-button-rounded p-button-outlined p-button-secondary p-mr-2" onClick={() => props.onManagedObjectEdit(managedObject.id, managedObject.displayName)}  />
          <Button tooltip="delete" icon="pi pi-trash" className="p-button-rounded p-button-outlined p-button-secondary p-mr-2" onClick={() => props.onManagedObjectDelete(managedObject.id, managedObject.displayName)} />
        </React.Fragment>
    );
  }

  const apiProductsBodyTemplate = (managedObject: TManagedObject) => {
    return APRenderUtils.renderStringListAsDivList(managedObject.apiObject.apiProducts);
  }

  const webhookAuthenticationBodyTemplate = (webhook: WebHook) => {
    const funcName = 'webhookAuthenticationBodyTemplate';
    const logName = `${componentName}.${funcName}()`;
    if(!webhook.authentication) return (
      <div>no authentication</div>          
    );
    let basicAuthentication: TConnectorWebhookBasicAuthentication | undefined = undefined;
    let headerAuthentication:TConnectorWebhookHeaderAuthentication | undefined = undefined;
    let authenticationMethod: EConnectorWebhookAuthenticationMethod | undefined = undefined;
    const anyAuthentication: any = webhook.authentication;
    if(anyAuthentication['username'] && anyAuthentication['password']) {
      basicAuthentication = anyAuthentication;
      authenticationMethod = EConnectorWebhookAuthenticationMethod.BASIC;
    } else if(anyAuthentication['headerName'] && anyAuthentication['headerValue']) {
      headerAuthentication = anyAuthentication;
      authenticationMethod = EConnectorWebhookAuthenticationMethod.HEADER;
    } else {
      throw new Error(`${logName}: cannot infer authetication method from data = ${JSON.stringify(anyAuthentication)}`);
    }
    return (
      <React.Fragment>
        <div>method: {authenticationMethod}</div>
        { basicAuthentication && 
          <div>user: {basicAuthentication.username}, pwd: {basicAuthentication.password}</div>
        }
        { headerAuthentication && 
          <div>header: {headerAuthentication.headerName}, value: {headerAuthentication.headerValue}</div>
        }
      </React.Fragment>
    )
  }

  const onPageSelect = (event: any) => {
    const _lazyParams = { ...lazyLoadingTableParams, isInitialSetting: false, ...event };
    setLazyLoadingTableParams(_lazyParams);
  }

  const onSort = (event: any) => {
    // const funcName = 'onSort';
    // const logName = `${componentName}.${funcName}()`;
    // console.log(`${logName}: event = ${JSON.stringify(event, null, 2)}`);
    const _lazyParams = { ...lazyLoadingTableParams, isInitialSetting: false, ...event };
    setLazyLoadingTableParams(_lazyParams);
  }

  const renderManagedObjectTableEmptyMessage = () => {
    if(globalFilter && globalFilter !== '') return `${MessageNoManagedObjectsFoundWithFilter}: ${globalFilter}.`;
    else return MessageNoManagedObjectsFoundCreateNew;
  }

  const onExpandAll = () => {
    let _expandedRows: any = {};
    managedObjectList.forEach( (mangedObject: TManagedObject) => {
      _expandedRows[`${mangedObject.id}`] = true;
    });
    setExpandedWebhookRows(_expandedRows);
  }

  const onCollapseAll = () => {
    setExpandedWebhookRows(null);
  }

  const [expandedWebhookRows, setExpandedWebhookRows] = React.useState<any>(null);

  const renderManagedObjectDataTable = () => {
    // const funcName = 'renderManagedObjectDataTable';
    // const logName = `${componentName}.${funcName}()`;
    const rowExpansionTemplateWebhooks = (managedObjectTableDataRow: TManagedObjectTableDataRow): JSX.Element => {
      const webhookList = managedObjectTableDataRow.apiObject.webHooks;
      if(!webhookList || webhookList.length === 0) return (
        <React.Fragment><div>No Webhooks configured.</div></React.Fragment>
      );

      return (
        <div className="sub-table">
          <DataTable 
            className="p-datatable-sm"
            header='Webhooks:'
            value={webhookList}
            autoLayout={false}
            dataKey="id"  
          >
            <Column field="method" header="Method" />
            <Column field="uri" header="Uri" />
            <Column body={webhookAuthenticationBodyTemplate} header="Auth" bodyStyle={{textAlign: 'left', overflow: 'hidden'}}/>
            <Column field="mode" header="Mode" />
            <Column field="environments" header="API Gateway(s)" />
          </DataTable>
        </div>
      );
    }

    let managedObjectTableDataList: TManagedObjectTableDataList = transformManagedObjectListToTableDataList(managedObjectList);    
    return (
      <div className="card">
          <DataTable
            ref={dt}
            autoLayout={true}
            resizableColumns 
            columnResizeMode="expand"
            header={renderDataTableHeader()}
            value={managedObjectTableDataList}
            selectionMode="single"
            selection={selectedManagedObject}
            onRowClick={onManagedObjectSelect}
            onRowDoubleClick={(e) => onManagedObjectOpen(e)}
            scrollable 
            scrollHeight="800px" 
            dataKey="id"  
            emptyMessage={renderManagedObjectTableEmptyMessage()}
            // lazyLoading & pagination
            lazy={true}
            paginator={true}
            paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
            rowsPerPageOptions={lazyLoadingTableRowsPerPageOptions}
            first={lazyLoadingTableParams.first}
            rows={lazyLoadingTableParams.rows}
            totalRecords={lazyLoadingTableTotalRecords}
            onPage={onPageSelect}
            loading={lazyLoadingTableIsLoading}
            // sorting
            sortMode='single'
            onSort={onSort} 
            sortField={lazyLoadingTableParams.sortField} 
            sortOrder={lazyLoadingTableParams.sortOrder}
            // expandable rows
            expandedRows={expandedWebhookRows}
            onRowToggle={(e) => setExpandedWebhookRows(e.data)}
            rowExpansionTemplate={rowExpansionTemplateWebhooks}
          >
            <Column expander style={{ width: '3em' }} />  
            <Column field="displayName" header="Name" sortable />
            <Column field="apiObject.status" header="Status" sortable />
            <Column body={apiProductsBodyTemplate} header="API Product(s)" bodyStyle={{textAlign: 'left', overflow: 'hidden'}}/>
            <Column body={actionBodyTemplate} headerStyle={{width: '20em', textAlign: 'center'}} bodyStyle={{textAlign: 'left', overflow: 'visible'}}/>
        </DataTable>
      </div>
    );
  }

  return (
    <div className="apd-manageuserapps">

      <APComponentHeader header='My Apps:' />

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      {managedObjectList.length === 0 && !isGetManagedObjectListInProgress && apiCallStatus && apiCallStatus.success &&
        <h3>{MessageNoManagedObjectsFoundCreateNew}</h3>
      }

      {(managedObjectList.length > 0 || (managedObjectList.length === 0 && globalFilter && globalFilter !== '')) && 
        renderManagedObjectDataTable()
      }
      
      {/* DEBUG selected managedObject */}
      {managedObjectList.length > 0 && selectedManagedObject && 
        <pre style={ { fontSize: '12px' }} >
          {JSON.stringify(selectedManagedObject, null, 2)}
        </pre>
      }

    </div>
  );
}
