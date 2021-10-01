
import React from "react";

import { InputText } from "primereact/inputtext";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from 'primereact/button';

import { 
  APSUserId, 
} from '@solace-iot-team/apim-server-openapi-browser';

import { Globals } from "../../../utils/Globals";
import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { APRenderUtils } from "../../../utils/APRenderUtils";
import { APComponentHeader } from "../../../components/APComponentHeader/APComponentHeader";
import { 
  TApiEntitySelectItem, 
  TApiEntitySelectItemList, 
  TAPLazyLoadingTableParameters, 
  TAPOrganizationId 
} from "../../../components/APComponentsCommon";
import { 
  E_CALL_STATE_ACTIONS, 
} from "./DeveloperPortalManageUserAppsCommon";
import { 
  DeveloperPortalCommon, 
  DeveloperPortalCommonApiCalls, 
  TApiGetApiProductListResult, 
  TManagedApiProduct, 
  TManagedApiProductList, 
  TManagedProductId 
} from "../DeveloperPortalCommon";

import '../../../components/APComponents.css';
import "./DeveloperPortalManageUserApps.css";


// export type TApiProductIdList = Array<string>;
export interface IDeveloperPortalUserAppSearchSelectApiProductsProps {
  organizationId: TAPOrganizationId,
  userId: APSUserId,
  currentSelectedApiProductItemList: TApiEntitySelectItemList,
  onError: (apiCallState: TApiCallState) => void;
  onSave: (apiCallState: TApiCallState, selectedApiProducts: TApiEntitySelectItemList) => void;
  onCancel: () => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const DeveloperPortalUserAppSearchSelectApiProducts: React.FC<IDeveloperPortalUserAppSearchSelectApiProductsProps> = (props: IDeveloperPortalUserAppSearchSelectApiProductsProps) => {
  const componentName = 'DeveloperPortalUserAppSearchSelectApiProducts';

  const DialogHeader = 'Search & Select API Product(s):';
  const MessageNoManagedObjectsFound = "No API Products found."
  const MessageNoManagedObjectsFoundWithFilter = 'No API Products found for filter';
  const GlobalSearchPlaceholder = 'Enter search word list separated by <space> ...';

  type TManagedProductTableDataRow = TManagedApiProduct & {
    apiDisplayNameListAsString: string,
    protocolListAsString: string,
    attributeListAsString: string,
    environmentListAsStringList: Array<string>
  };
  type TManagedProductTableDataList = Array<TManagedProductTableDataRow>;
 
  const transformApiProductSelectItemListToTableGlobalFilter = (apiProductSelectItemList: TApiEntitySelectItemList): string => {
    const idList: Array<TManagedProductId> = apiProductSelectItemList.map( (apiProductSelectItem: TApiEntitySelectItem) => {
      return apiProductSelectItem.id;
    });
    return idList.join(' ');
  }

  const transformApiProductSelectItemListToManagedProductTableDataList = (apiProductSelectItemList: TApiEntitySelectItemList, managedProductList: TManagedApiProductList): TManagedProductTableDataList => {
    const funcName = 'transformApiProductSelectItemListToManagedProductTableDataList';
    const logName = `${componentName}.${funcName}()`;
    let _managedProductTableDataList: TManagedProductTableDataList = [];
    apiProductSelectItemList.forEach( (apiProductSelectItem: TApiEntitySelectItem) => {
      const found: TManagedApiProduct | undefined = managedProductList.find( (managedProduct: TManagedApiProduct) => {
        return managedProduct.id === apiProductSelectItem.id;
      });
      if(!found) throw new Error(`${logName}: apiProductSelectItem.id=${apiProductSelectItem.id} not found in managedProductList.`);
      _managedProductTableDataList.push({
        ...found,
        apiDisplayNameListAsString: DeveloperPortalCommon.getApiDisplayNameListAsString(found.apiProduct.apis),
        protocolListAsString: DeveloperPortalCommon.getProtocolListAsString(found.apiProduct.protocols),
        attributeListAsString: DeveloperPortalCommon.getAttributeNamesAsString(found.apiProduct.attributes),
        environmentListAsStringList: DeveloperPortalCommon.getEnvironmentsAsDisplayList(found.apiEnvironmentList, found.apiProduct.environments)
      });
    });
    return _managedProductTableDataList;
  }

  const transformManagedProductListToTableDataList = (managedProductList: TManagedApiProductList): TManagedProductTableDataList => {
    const transformManagedProductToTableDataRow = (managedProduct: TManagedApiProduct): TManagedProductTableDataRow => {
      return {
        ...managedProduct,
        apiDisplayNameListAsString: DeveloperPortalCommon.getApiDisplayNameListAsString(managedProduct.apiProduct.apis),
        protocolListAsString: DeveloperPortalCommon.getProtocolListAsString(managedProduct.apiProduct.protocols),
        attributeListAsString: DeveloperPortalCommon.getAttributeNamesAsString(managedProduct.apiProduct.attributes),
        environmentListAsStringList: DeveloperPortalCommon.getEnvironmentsAsDisplayList(managedProduct.apiEnvironmentList, managedProduct.apiProduct.environments)
      }
    }
    return managedProductList.map( (managedProduct: TManagedApiProduct) => {
      return transformManagedProductToTableDataRow(managedProduct);
    });
  }

  const transformTableDataListToApiProductItemList = (managedProductTableDataList: TManagedProductTableDataList): TManagedApiProductList => {
    return managedProductTableDataList;
  }

  const [tableSelectedApiProductList, setTableSelectedApiProductList] = React.useState<TManagedProductTableDataList>([]);
  // const [selectedApiProductItemList, setSelectedApiProductItemList] = React.useState<TApiProductSelectItemList>([]);
  const [managedProductList, setManagedProductList] = React.useState<TManagedApiProductList>([]);
  // const [showSelectDialog, setShowSelectDialog] = React.useState<boolean>(true);
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [isGetManagedObjectListInProgress, setIsGetManagedObjectListInProgress] = React.useState<boolean>(false);
  // * Lazy Loading * 
  const lazyLoadingTableRowsPerPageOptions: Array<number> = [10,20,50,100];
  const [lazyLoadingTableParams, setLazyLoadingTableParams] = React.useState<TAPLazyLoadingTableParameters>({
    isInitialSetting: true,
    first: 0, // index of the first row to be displayed
    rows: lazyLoadingTableRowsPerPageOptions[0], // number of rows to display per page
    page: 0,
    sortField: 'apiProduct.name',
    sortOrder: 1
  });
  const [lazyLoadingTableTotalRecords, setLazyLoadingTableTotalRecords] = React.useState<number>(0);
  const [lazyLoadingTableIsLoading, setLazyLoadingTableIsLoading] = React.useState<boolean>(false);
  // * Global Filter *
  const [globalFilter, setGlobalFilter] = React.useState<string>();
  // * Data Table *
  const dt = React.useRef<any>(null);
  // const [dataTableSelectedRow, setDataTableSelectedRow] = React.useState<TManagedProductTableDataRow>();


  // const transformApiProductToManagedProduct = (apiProduct: APIProduct, apiEnvironmentList: Array<EnvironmentResponse>): TManagedProduct => {
  //   return {
  //     id: apiProduct.name,
  //     displayName: apiProduct.displayName ? apiProduct.displayName : apiProduct.name,
  //     apiProduct: apiProduct,
  //     apiEnvironmentList: apiEnvironmentList
  //   }
  // }

  // * Api Calls *
  // const apiGetApiProductList = async(pageSize: number, pageNumber: number): Promise<TApiCallState> => {
  //   const funcName = 'apiGetApiProductList';
  //   const logName = `${componentName}.${funcName}()`;
  //   setIsGetManagedObjectListInProgress(true);
  //   let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_PRODUCT_LIST, 'retrieve list of api products');
  //   let anyError: any = undefined;
  //   let apiProductList: TApiProductList = [];
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
  //         let managedProductList: TManagedProductList = [];
  //         let apiEnvironmentList: Array<EnvironmentResponse> = [];
  //         for(const apiProduct of apiProductList) {
  //           if(apiProduct.environments) {
  //             for(const apiEnvironmentName of apiProduct.environments) {
  //               const found = apiEnvironmentList.find( (environment: EnvironmentResponse) => {
  //                 return environment.name === apiEnvironmentName;
  //               });
  //               if(!found) {
  //                 const resp: EnvironmentResponse = await EnvironmentsService.getEnvironment(props.organizationId, apiEnvironmentName);
  //                 apiEnvironmentList.push(resp);
  //               }
  //             }
  //           }
  //           managedProductList.push(transformApiProductToManagedProduct(apiProduct, apiEnvironmentList));
  //         }  
  //         setManagedProductList(managedProductList);
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
  //   setIsGetManagedObjectListInProgress(false);
  //   return callState;
  // }

  const doLoadPage = async () => {
    // const funcName = 'doLoadPage';
    // const logName = `${componentName}.${funcName}()`;
    // console.log(`${logName}: lazyLoadingTableParams = ${JSON.stringify(lazyLoadingTableParams, null, 2)}`);
    setLazyLoadingTableIsLoading(true);
    const pageNumber: number = lazyLoadingTableParams.page + 1;
    const pageSize: number = lazyLoadingTableParams.rows;

    await Globals.sleep(3000);


    // Activate when connector can do search + sort
    // const sortFieldName: string = transformTableSortFieldNameToApiSortFieldName(lazyLoadingTableParams.sortField);
    // const sortDirection: EAPSSortDirection  = APComponentsCommon.transformTableSortDirectionToApiSortDirection(lazyLoadingTableParams.sortOrder);
    // const searchWordList: string | undefined = globalFilter;

    setIsGetManagedObjectListInProgress(true);
    const initialCallState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_PRODUCT_LIST, 'retrieve list of api products');
    // TODO: once search is enabled in Connector API:
    // search for props.currentSelectedApiProductItemList[].id
    // await apiGetManagedObjectListPage(pageSize, pageNumber, sortFieldName, sortDirection, searchWordList);
    const result: TApiGetApiProductListResult = await DeveloperPortalCommonApiCalls.apiGetApiProductList(props.organizationId, initialCallState, pageSize, pageNumber);
    setApiCallStatus(result.apiCallState);
    setManagedProductList(result.managedApiProductList);
    if(result.apiTotalCount) setLazyLoadingTableTotalRecords(result.apiTotalCount);
    setLazyLoadingTableIsLoading(false);
    setIsGetManagedObjectListInProgress(false);

    if(lazyLoadingTableParams.isInitialSetting) {
      setTableSelectedApiProductList(transformApiProductSelectItemListToManagedProductTableDataList(props.currentSelectedApiProductItemList, result.managedApiProductList));
      setGlobalFilter(transformApiProductSelectItemListToTableGlobalFilter(props.currentSelectedApiProductItemList));
    }
  }

  // * useEffect Hooks *
  

  // React.useEffect( () => {
  //   const funcName = 'useEffect([])';
  //   const logName = `${componentName}.${funcName}()`;
  //   console.log(`${logName}: props.currentSelectedApiProductItemList=${JSON.stringify(props.currentSelectedApiProductItemList, null, 2)}`);
  //   setTableSelectedApiProductList(transformApiProductSelectItemListToManagedProductTableDataList(props.currentSelectedApiProductItemList, managedProductList: TManagedApiProductList));
  // }, []);

  React.useEffect(() => {
    doLoadPage();
  }, [lazyLoadingTableParams]); /* eslint-disable-line react-hooks/exhaustive-deps */

  // TODO: enable when search is enabled in Connector
  // React.useEffect(() => {
  //   doLoadPage();
  // }, [globalFilter]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  // * UI Controls *
  // const doDeleteManagedObject = async () => {
  //   props.onLoadingChange(true);
  //   await apiDeleteManagedObject(props.organizationId, props.userId, props.appId, props.appDisplayName);
  //   props.onLoadingChange(false);
  // }

  const onSaveSelectedApiProducts = () => {
    // const funcName = 'onSaveSelectedApiProducts';
    // const logName = `${componentName}.${funcName}()`;
    // console.log(`${logName}: tableSelectedApiProductList=${JSON.stringify(tableSelectedApiProductList, null, 2)}`);
    props.onSave(ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.SELECT_API_PRODUCTS, `select api products`), transformTableDataListToApiProductItemList(tableSelectedApiProductList));
  }

  // const onCancel = () => {
  //   props.onCancel();
  // }

  // * Data Table *
  const onInputGlobalFilter = (event: React.FormEvent<HTMLInputElement>) => {
    const _globalFilter: string | undefined = event.currentTarget.value !== '' ? event.currentTarget.value : undefined;
    setGlobalFilter(_globalFilter);
  }
 
  const renderDataTableHeader = (): JSX.Element => {
    return (
      <div className="table-header">
        <div style={{ whiteSpace: "nowrap"}}>
          <Button type="button" label="Save" className="p-button-text p-button-plain p-button-outlined p-mr-2" onClick={onSaveSelectedApiProducts} disabled={tableSelectedApiProductList.length === 0} />
          <Button type="button" label="Cancel" className="p-button-text p-button-plain p-mr-2" onClick={props.onCancel} />
        </div>        
        <div style={{ alignContent: "right"}}>
          <span className="p-input-icon-left" >
            <i className="pi pi-search" />
            <InputText 
              type="search" placeholder={GlobalSearchPlaceholder} style={{width: '500px'}} 
              disabled={true} // TODO enable when search works
              onInput={onInputGlobalFilter}  
              value={globalFilter}
            />
          </span>
        </div>
      </div>
    );
  }
  // const renderDataTableHeader = (): JSX.Element => {
  //   return (
  //     <div className="table-header">
  //       <div className="table-header-container" />
  //       <span className="p-input-icon-left">
  //         <i className="pi pi-search" />
  //         <InputText type="search" placeholder={GlobalSearchPlaceholder} onInput={onInputGlobalFilter} style={{width: '500px'}} disabled />
  //       </span>
  //     </div>
  //   );
  // }

  // const actionBodyTemplate = (managedObject: TManagedProduct) => {
  //   return (
  //       <React.Fragment>
  //         <Button tooltip="view" icon="pi pi-folder-open" className="p-button-rounded p-button-outlined p-button-secondary p-mr-2" onClick={() => props.onManagedObjectView(managedObject.id, managedObject.displayName)} />
  //       </React.Fragment>
  //   );
  // }

  const apiGatewaysBodyTemplate = (row: TManagedProductTableDataRow): JSX.Element => {
    return APRenderUtils.renderStringListAsDivList(row.environmentListAsStringList);
  }

  const onSelectionChange = (event: any): void => {
    // console.log(`onSelectionChange: event.value = ${JSON.stringify(event.value, null, 2)}`);
    setTableSelectedApiProductList(event.value);
  }

  const onPageSelect = (event: any) => {
    const _lazyParams = { ...lazyLoadingTableParams, isInitialSetting: false, ...event };
    setLazyLoadingTableParams(_lazyParams);
  }

  const onSort = (event: any) => {
    const _lazyParams = { ...lazyLoadingTableParams, isInitialSetting: false, ...event };
    setLazyLoadingTableParams(_lazyParams);
  }

  const renderManagedObjectTableEmptyMessage = () => {
    if(globalFilter && globalFilter !== '') return `${MessageNoManagedObjectsFoundWithFilter}: ${globalFilter}.`;
    else return MessageNoManagedObjectsFound;
  }

  const renderManagedObjectDataTable = () => {
    let managedObjectTableDataList: TManagedProductTableDataList = transformManagedProductListToTableDataList(managedProductList);    
    return (
      <div className="card">
          <DataTable
            ref={dt}
            className="p-datatable-sm"
            autoLayout={true}
            resizableColumns 
            columnResizeMode="expand"
            showGridlines
            header={renderDataTableHeader()}
            value={managedObjectTableDataList}
            globalFilter={globalFilter}
            scrollable 
            scrollHeight="800px" 
            dataKey="id"  
            emptyMessage={renderManagedObjectTableEmptyMessage()}
            // selection
            selection={tableSelectedApiProductList}
            onSelectionChange={onSelectionChange}
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
            <Column selectionMode="multiple" style={{width:'3em'}}/>
            <Column field="displayName" header="Name" sortable filterField="globalSearch" />
            <Column field="apiProduct.description" header="Description" />
            <Column field="apiDisplayNameListAsString" header="API(s)" />
            <Column field="apiProduct.approvalType" header="Approval" sortable/>
            <Column field="protocolListAsString" header="Exposed Protocols" />
            <Column field="attributeListAsString" header="Controlled Attributes" />
            <Column body={apiGatewaysBodyTemplate} header="API Gateway(s)" bodyStyle={{textAlign: 'left', overflow: 'visible'}}/>
            {/* <Column body={actionBodyTemplate} headerStyle={{width: '20em', textAlign: 'center'}} bodyStyle={{textAlign: 'left', overflow: 'visible'}}/> */}
        </DataTable>
      </div>
    );
  }

  return (
    <div className="apd-manageuserapps">
      <APComponentHeader header={DialogHeader} />  

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      {/* {managedProductList.length === 0 && !isGetManagedObjectListInProgress && apiCallStatus && apiCallStatus.success &&
        <h3>{MessageNoManagedObjectsFound}</h3>
      } */}

      {/* {(managedProductList.length > 0 || (managedProductList.length === 0 && globalFilter && globalFilter !== '')) && 
        renderManagedObjectDataTable()
      } */}

      {renderManagedObjectDataTable()}

      {/* DEBUG selected managedObject */}
      {/* {managedProductList.length > 0 && tableSelectedApiProductList && 
        <pre style={ { fontSize: '12px' }} >
          {JSON.stringify(tableSelectedApiProductList, null, 2)}
        </pre>
      } */}

    </div>
  );
}
