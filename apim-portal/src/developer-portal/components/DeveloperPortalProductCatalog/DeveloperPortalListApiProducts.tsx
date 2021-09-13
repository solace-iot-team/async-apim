
import React from "react";

import { DataTable } from 'primereact/datatable';
import { Column } from "primereact/column";
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';

import { ApiProductsService, APIProduct, EnvironmentsService, EnvironmentResponse } from '@solace-iot-team/platform-api-openapi-client-fe';
import { APComponentHeader } from "../../../components/APComponentHeader/APComponentHeader";
import { TAPOrganizationId } from "../../../components/APComponentsCommon";
import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { APClientConnectorOpenApi } from "../../../utils/APClientConnectorOpenApi";
import { TAPLazyLoadingTableParameters } from "../../../components/APComponentsCommon";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { 
  DeveloperPortalCatgalogCommon, 
  E_CALL_STATE_ACTIONS, 
  TManagedObjectId, 
  TViewManagedObject, 
  E_COMPONENT_STATE 
} from "././DeveloperPortalProductCatalogCommon";

import '../../../components/APComponents.css';
import "./DeveloperPortalProductCatalog.css";

export interface IDeveloperPortalListApiProductsProps {
  organizationId: TAPOrganizationId;
  componentState: E_COMPONENT_STATE.MANAGED_OBJECT_LIST_LIST_VIEW | E_COMPONENT_STATE.MANAGED_OBJECT_LIST_GRID_VIEW,
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState, componentState: E_COMPONENT_STATE.MANAGED_OBJECT_LIST_LIST_VIEW | E_COMPONENT_STATE.MANAGED_OBJECT_LIST_GRID_VIEW) => void;
  onLoadingChange: (isLoading: boolean) => void;
  onManagedObjectView: (managedObjectId: TManagedObjectId, managedObjectDisplayName: string) => void;
}

export const DeveloperPortalListApiProducts: React.FC<IDeveloperPortalListApiProductsProps> = (props: IDeveloperPortalListApiProductsProps) => {
  const componentName = 'DeveloperPortalListApiProducts';

  const MessageNoManagedObjectsFound = "No API Products found."
  const MessageNoManagedObjectsFoundWithFilter = 'No API Products found for filter';
  const GlobalSearchPlaceholder = 'Enter search word list separated by <space> ...';

  type TManagedObject = TViewManagedObject;
  type TManagedObjectList = Array<TManagedObject>;
  type TManagedObjectTableDataRow = TManagedObject & {
    apiDisplayNameListAsString: string,
    protocolListAsString: string,
    attributeListAsString: string,
    environmentListAsString: string,
    environmentListAsStringList: Array<string>
  };
  type TManagedObjectTableDataList = Array<TManagedObjectTableDataRow>;

  // const transformTableSortFieldNameToApiSortFieldName = (tableSortFieldName: string): string => {
  //   const funcName = 'transformTableSortFieldNameToApiSortFieldName';
  //   const logName = `${componentName}.${funcName}()`;
  //   // console.log(`${logName}: tableSortFieldName = ${tableSortFieldName}`);
  //   if(tableSortFieldName.startsWith('apiObject.')) {
  //     return tableSortFieldName.replace('apiObject.', '');
  //   }
  //   return tableSortFieldName;
  // }

  const transformManagedObjectListToTableDataList = (managedObjectList: TManagedObjectList): TManagedObjectTableDataList => {
    const _transformManagedObjectToTableDataRow = (managedObject: TManagedObject): TManagedObjectTableDataRow => {
      return {
        ...managedObject,
        apiDisplayNameListAsString: DeveloperPortalCatgalogCommon.getApiDisplayNameListAsString(managedObject.apiObject.apis),
        protocolListAsString: DeveloperPortalCatgalogCommon.getProtocolListAsString(managedObject.apiObject.protocols),
        attributeListAsString: DeveloperPortalCatgalogCommon.getAttributeNamesAsString(managedObject.apiObject.attributes),
        environmentListAsString: DeveloperPortalCatgalogCommon.getEnvironmentsAsString(managedObject.apiObject, managedObject.apiEnvironmentList),
        environmentListAsStringList: DeveloperPortalCatgalogCommon.getEnvironmentsAsDisplayList(managedObject.apiObject, managedObject.apiEnvironmentList)
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
    first: 0, // index of the first row to be displayed
    rows: lazyLoadingTableRowsPerPageOptions[0], // number of rows to display per page
    page: 0,
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
  const apiGetManagedObjectList = async(pageSize: number, pageNumber: number): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObjectList';
    const logName = `${componentName}.${funcName}()`;
    setIsGetManagedObjectListInProgress(true);
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_PRODUCT_LIST, 'retrieve list of api products');
    try { 
      // retrieve Api Products
      const apiProductList: Array<APIProduct> = await ApiProductsService.listApiProducts(props.organizationId, pageSize, pageNumber);
      const totalCount: number = 1000; // should be returned by previous call
      let _managedObjectList: TManagedObjectList = [];
      let _apiEnvironmentList: Array<EnvironmentResponse> = [];
      for(const apiProduct of apiProductList) {
        if(apiProduct.environments) {
          for(const apiEnvironmentName of apiProduct.environments) {
            const found = _apiEnvironmentList.find( (environment: EnvironmentResponse) => {
              return environment.name === apiEnvironmentName;
            });
            if(!found) {
              const resp: EnvironmentResponse = await EnvironmentsService.getEnvironment(props.organizationId, apiEnvironmentName);
              _apiEnvironmentList.push(resp);
            }
          }
        }
        _managedObjectList.push(DeveloperPortalCatgalogCommon.transformViewApiObjectToViewManagedObject(apiProduct, _apiEnvironmentList));
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

  // enable when search is enabled in Connector
  // React.useEffect(() => {
  //   doLoadPage();
  // }, [globalFilter]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(apiCallStatus.success) props.onSuccess(apiCallStatus, props.componentState);
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
        <div className="table-header-container" />
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
        </React.Fragment>
    );
  }

  const apiGatewaysBodyTemplate = (row: TManagedObjectTableDataRow): JSX.Element => {
    let jsxElementList: Array<JSX.Element> = [];
    
    const addJSXElement = (str: string) => {
      const jsxElem: JSX.Element = (
        <div>{str}</div>
      );
      jsxElementList.push(jsxElem);
    }

    row.environmentListAsStringList.forEach( (str: string) => {
      addJSXElement(str);
    });  
    return (
        <React.Fragment>
          {jsxElementList}
        </React.Fragment>
    );
  }

  const onPageSelect = (event: any) => {
    const _lazyParams = { ...lazyLoadingTableParams, ...event };
    setLazyLoadingTableParams(_lazyParams);
  }

  const onSort = (event: any) => {
    const _lazyParams = { ...lazyLoadingTableParams, ...event };
    setLazyLoadingTableParams(_lazyParams);
  }

  const renderManagedObjectTableEmptyMessage = () => {
    if(globalFilter && globalFilter !== '') return `${MessageNoManagedObjectsFoundWithFilter}: ${globalFilter}.`;
    else return MessageNoManagedObjectsFound;
  }

  const renderManagedObjectDataTable = () => {
    let managedObjectTableDataList: TManagedObjectTableDataList = transformManagedObjectListToTableDataList(managedObjectList);    
    return (
      <div className="card">
          <DataTable
            ref={dt}
            autoLayout={true}
            resizableColumns 
            columnResizeMode="expand"
            showGridlines
            header={renderDataTableHeader()}
            value={managedObjectTableDataList}
            globalFilter={globalFilter}
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
          >
            {/* <Column field="id" header="Id" /> */}
            <Column field="displayName" header="Name" sortable filterField="globalSearch" />
            <Column field="apiObject.description" header="Description" />
            <Column field="apiDisplayNameListAsString" header="API(s)" />
            <Column field="apiObject.approvalType" header="Approval" sortable/>
            <Column field="protocolListAsString" header="Exposed Protocols" />
            <Column field="attributeListAsString" header="Controlled Attributes" />
            <Column body={apiGatewaysBodyTemplate} header="API Gateway(s)" bodyStyle={{textAlign: 'left', overflow: 'visible'}}/>
            <Column body={actionBodyTemplate} headerStyle={{width: '20em', textAlign: 'center'}} bodyStyle={{textAlign: 'left', overflow: 'visible'}}/>
        </DataTable>
      </div>
    );
  }

  const renderManagedObjectGridView = () => {
    return (
      <div className="card">
        <h3>renderManagedObjectGridView: todo</h3>
      </div>  
    );
  }

  const renderManagedObjectList = () => {
    const funcName = 'renderManagedObjectList';
    const logName = `${componentName}.${funcName}()`;
    if(props.componentState === E_COMPONENT_STATE.MANAGED_OBJECT_LIST_LIST_VIEW) return renderManagedObjectDataTable();
    else if(props.componentState === E_COMPONENT_STATE.MANAGED_OBJECT_LIST_GRID_VIEW) return renderManagedObjectGridView();
    else throw new Error(`${logName}: cannot render for unknown props.componentState=${props.componentState}`);

  }

  return (
    <div className="adp-productcatalog">

      <APComponentHeader header='API Products:' />  

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      {managedObjectList.length === 0 && !isGetManagedObjectListInProgress && apiCallStatus && apiCallStatus.success &&
        <h3>{MessageNoManagedObjectsFound}</h3>
      }

      {(managedObjectList.length > 0 || (managedObjectList.length === 0 && globalFilter && globalFilter !== '')) && 
        renderManagedObjectList()
      }
      
      {/* DEBUG selected managedObject */}
      {/* {managedObjectList.length > 0 && selectedManagedObject && 
        <pre style={ { fontSize: '12px' }} >
          {JSON.stringify(selectedManagedObject, null, 2)}
        </pre>
      } */}

    </div>
  );
}
