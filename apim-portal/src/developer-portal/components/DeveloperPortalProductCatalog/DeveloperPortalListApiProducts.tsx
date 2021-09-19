
import React from "react";

import { DataTable } from 'primereact/datatable';
import { Column } from "primereact/column";
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';

// import { 
//   ApiProductsService, 
//   APIProduct, 
//   EnvironmentsService, 
//   EnvironmentResponse, 
//   ApiError
// } from '@solace-iot-team/platform-api-openapi-client-fe';

import { APRenderUtils } from "../../../utils/APRenderUtils";
import { APComponentHeader } from "../../../components/APComponentHeader/APComponentHeader";
import { TAPOrganizationId } from "../../../components/APComponentsCommon";
import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
// import { APClientConnectorOpenApi } from "../../../utils/APClientConnectorOpenApi";
import { TAPLazyLoadingTableParameters } from "../../../components/APComponentsCommon";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { 
  // DeveloperPortalCatgalogCommon, 
  E_CALL_STATE_ACTIONS, 
  E_COMPONENT_STATE 
} from "././DeveloperPortalProductCatalogCommon";
import {   
  TManagedProductId,   
  DeveloperPortalCommon, 
  DeveloperPortalCommonApiCalls, 
  TApiGetApiProductListResult, 
  TManagedApiProduct, 
  TManagedApiProductList 
} from "../DeveloperPortalCommon";

import '../../../components/APComponents.css';
import "./DeveloperPortalProductCatalog.css";

export interface IDeveloperPortalListApiProductsProps {
  organizationId: TAPOrganizationId;
  componentState: E_COMPONENT_STATE.MANAGED_OBJECT_LIST_LIST_VIEW | E_COMPONENT_STATE.MANAGED_OBJECT_LIST_GRID_VIEW,
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState, componentState: E_COMPONENT_STATE.MANAGED_OBJECT_LIST_LIST_VIEW | E_COMPONENT_STATE.MANAGED_OBJECT_LIST_GRID_VIEW) => void;
  onLoadingChange: (isLoading: boolean) => void;
  onManagedProductView: (managedProductId: TManagedProductId, managedProductDisplayName: string) => void;
}

export const DeveloperPortalListApiProducts: React.FC<IDeveloperPortalListApiProductsProps> = (props: IDeveloperPortalListApiProductsProps) => {
  const componentName = 'DeveloperPortalListApiProducts';

  const MessageNoManagedProductsFound = "No API Products found."
  const MessageNoManagedProductsFoundWithFilter = 'No API Products found for filter';
  const GlobalSearchPlaceholder = 'Enter search word list separated by <space> ...';

  // type TManagedProduct = TManagedApiProduct;
  // type TManagedProductList = TManagedApiProductList;
  type TManagedProductTableDataRow = TManagedApiProduct & {
    apiDisplayNameListAsString: string,
    protocolListAsString: string,
    attributeListAsString: string,
    environmentListAsStringList: Array<string>
  };
  type TManagedProductTableDataList = Array<TManagedProductTableDataRow>;

  // const transformTableSortFieldNameToApiSortFieldName = (tableSortFieldName: string): string => {
  //   const funcName = 'transformTableSortFieldNameToApiSortFieldName';
  //   const logName = `${componentName}.${funcName}()`;
  //   // console.log(`${logName}: tableSortFieldName = ${tableSortFieldName}`);
  //   if(tableSortFieldName.startsWith('apiObject.')) {
  //     return tableSortFieldName.replace('apiObject.', '');
  //   }
  //   return tableSortFieldName;
  // }

  const transformManagedProductListToTableDataList = (managedProductList: TManagedApiProductList): TManagedProductTableDataList => {
    const _transformManagedProductToTableDataRow = (managedProduct: TManagedApiProduct): TManagedProductTableDataRow => {
      return {
        ...managedProduct,
        apiDisplayNameListAsString: DeveloperPortalCommon.getApiDisplayNameListAsString(managedProduct.apiProduct.apis),
        protocolListAsString: DeveloperPortalCommon.getProtocolListAsString(managedProduct.apiProduct.protocols),
        attributeListAsString: DeveloperPortalCommon.getAttributeNamesAsString(managedProduct.apiProduct.attributes),
        environmentListAsStringList: DeveloperPortalCommon.getEnvironmentsAsDisplayList(managedProduct.apiEnvironmentList, managedProduct.apiProduct.environments)
      }
    }
    return managedProductList.map( (managedProduct: TManagedApiProduct) => {
      return _transformManagedProductToTableDataRow(managedProduct);
    });
  }

  const [managedProductList, setManagedProductList] = React.useState<TManagedApiProductList>([]);  
  const [selectedManagedProduct, setSelectedManagedProduct] = React.useState<TManagedApiProduct>();
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [isGetManagedProductListInProgress, setIsGetManagedProductListInProgress] = React.useState<boolean>(false);
  // * Lazy Loading * 
  const lazyLoadingTableRowsPerPageOptions: Array<number> = [10,20,50,100];
  const [lazyLoadingTableParams, setLazyLoadingTableParams] = React.useState<TAPLazyLoadingTableParameters>({
    isInitialSetting: false,
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
  // const apiGetManagedProductList = async(pageSize: number, pageNumber: number): Promise<TApiCallState> => {
  //   const funcName = 'apiGetManagedProductList';
  //   const logName = `${componentName}.${funcName}()`;
  //   setIsGetManagedProductListInProgress(true);
  //   let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_PRODUCT_LIST, 'retrieve list of api products');
  //   let anyError: any = undefined;
  //   let apiProductList: Array<APIProduct> = [];
  //   let totalCount: number = 0;
  //   try {
  //     apiProductList = await ApiProductsService.listApiProducts(props.organizationId, pageSize, pageNumber);
  //     totalCount = 1000; // should be returned by previous call
  //   } catch (e: any) {
  //     if(APClientConnectorOpenApi.isInstanceOfApiError(e)) {
  //       const apiError: ApiError = e;
  //       if(apiError.status !== 404) anyError = e;
  //     } else anyError = e;
  //   }
  //   if(!anyError) {
  //     if(apiProductList.length > 0) {
  //       try { 
  //         let _managedProductList: TManagedProductList = [];
  //         let _apiEnvironmentList: Array<EnvironmentResponse> = [];
  //         for(const apiProduct of apiProductList) {
  //           if(apiProduct.environments) {
  //             for(const apiEnvironmentName of apiProduct.environments) {
  //               const found = _apiEnvironmentList.find( (environment: EnvironmentResponse) => {
  //                 return environment.name === apiEnvironmentName;
  //               });
  //               if(!found) {
  //                 const resp: EnvironmentResponse = await EnvironmentsService.getEnvironment(props.organizationId, apiEnvironmentName);
  //                 _apiEnvironmentList.push(resp);
  //               }
  //             }
  //           }
  //           _managedProductList.push(DeveloperPortalCatgalogCommon.transformViewApiObjectToViewManagedProduct(apiProduct, _apiEnvironmentList));
  //         }  
  //         setManagedProductList(_managedProductList);
  //       } catch(e: any) {
  //         anyError = e;
  //       }
  //     } else {
  //       setManagedProductList([]);
  //     }
  //     setLazyLoadingTableTotalRecords(totalCount);
  //   }
  //   if(anyError) {
  //     APClientConnectorOpenApi.logError(logName, anyError);
  //     callState = ApiCallState.addErrorToApiCallState(anyError, callState);
  //   }
  //   setApiCallStatus(callState);
  //   setIsGetManagedProductListInProgress(false);
  //   return callState;
  // }

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

    setIsGetManagedProductListInProgress(true);
    const initialCallState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_PRODUCT_LIST, 'retrieve list of api products');
    // await apiGetManagedProductListPage(pageSize, pageNumber, sortFieldName, sortDirection, searchWordList);
    const result: TApiGetApiProductListResult = await DeveloperPortalCommonApiCalls.apiGetApiProductList(props.organizationId, initialCallState, pageSize, pageNumber);
    setApiCallStatus(result.apiCallState);
    setManagedProductList(result.managedApiProductList);
    if(result.apiTotalCount) setLazyLoadingTableTotalRecords(result.apiTotalCount);
    setLazyLoadingTableIsLoading(false);
    setIsGetManagedProductListInProgress(false);
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
  const onManagedProductSelect = (event: any): void => {
    setSelectedManagedProduct(event.data);
  }  

  const onManagedProductOpen = (event: any): void => {
    const managedProduct: TManagedApiProduct = event.data as TManagedApiProduct;
    props.onManagedProductView(managedProduct.id, managedProduct.displayName);
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

  const actionBodyTemplate = (managedProduct: TManagedApiProduct) => {
    return (
        <React.Fragment>
          <Button tooltip="view" icon="pi pi-folder-open" className="p-button-rounded p-button-outlined p-button-secondary p-mr-2" onClick={() => props.onManagedProductView(managedProduct.id, managedProduct.displayName)} />
        </React.Fragment>
    );
  }

  const apiGatewaysBodyTemplate = (row: TManagedProductTableDataRow): JSX.Element => {
    return APRenderUtils.renderStringListAsDivList(row.environmentListAsStringList);
  }

  const onPageSelect = (event: any) => {
    const _lazyParams = { ...lazyLoadingTableParams, isInitialSetting: false, ...event };
    setLazyLoadingTableParams(_lazyParams);
  }

  const onSort = (event: any) => {
    const _lazyParams = { ...lazyLoadingTableParams, isInitialSetting: false, ...event };
    setLazyLoadingTableParams(_lazyParams);
  }

  const renderManagedProductTableEmptyMessage = () => {
    if(globalFilter && globalFilter !== '') return `${MessageNoManagedProductsFoundWithFilter}: ${globalFilter}.`;
    else return MessageNoManagedProductsFound;
  }

  const renderManagedProductDataTable = () => {
    let managedProductTableDataList: TManagedProductTableDataList = transformManagedProductListToTableDataList(managedProductList);    
    return (
      <div className="card">
          <DataTable
            ref={dt}
            autoLayout={true}
            resizableColumns 
            columnResizeMode="expand"
            showGridlines
            header={renderDataTableHeader()}
            value={managedProductTableDataList}
            globalFilter={globalFilter}
            selectionMode="single"
            selection={selectedManagedProduct}
            onRowClick={onManagedProductSelect}
            onRowDoubleClick={(e) => onManagedProductOpen(e)}
            scrollable 
            scrollHeight="800px" 
            dataKey="id"  
            emptyMessage={renderManagedProductTableEmptyMessage()}
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

  const renderManagedProductGridView = () => {
    return (
      <div className="card">
        <h3>renderManagedProductGridView: todo</h3>
      </div>  
    );
  }

  const renderManagedProductList = () => {
    const funcName = 'renderManagedProductList';
    const logName = `${componentName}.${funcName}()`;
    if(props.componentState === E_COMPONENT_STATE.MANAGED_OBJECT_LIST_LIST_VIEW) return renderManagedProductDataTable();
    else if(props.componentState === E_COMPONENT_STATE.MANAGED_OBJECT_LIST_GRID_VIEW) return renderManagedProductGridView();
    else throw new Error(`${logName}: cannot render for unknown props.componentState=${props.componentState}`);

  }

  return (
    <div className="adp-productcatalog">

      <APComponentHeader header='API Products:' />  

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      {managedProductList.length === 0 && !isGetManagedProductListInProgress && apiCallStatus && apiCallStatus.success &&
        <h3>{MessageNoManagedProductsFound}</h3>
      }

      {(managedProductList.length > 0 || (managedProductList.length === 0 && globalFilter && globalFilter !== '')) && 
        renderManagedProductList()
      }
      
      {/* DEBUG selected managedProduct */}
      {/* {managedProductList.length > 0 && selectedManagedProduct && 
        <pre style={ { fontSize: '12px' }} >
          {JSON.stringify(selectedManagedProduct, null, 2)}
        </pre>
      } */}

    </div>
  );
}
