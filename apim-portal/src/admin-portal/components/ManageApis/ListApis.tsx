
import React from "react";

import { DataTable } from 'primereact/datatable';
import { Column } from "primereact/column";
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';

import { 
  APIInfo,
  ApisService,
} from '@solace-iot-team/platform-api-openapi-client-fe';

import { APComponentHeader } from "../../../components/APComponentHeader/APComponentHeader";
import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { APSClientOpenApi } from "../../../utils/APSClientOpenApi";
import { APComponentsCommon, TAPLazyLoadingTableParameters, TAPOrganizationId } from "../../../components/APComponentsCommon";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { E_CALL_STATE_ACTIONS, TManagedObjectId, TViewApiObject, TViewManagedObject } from "./ManageApisCommon";

import '../../../components/APComponents.css';
import "./ManageApis.css";

export interface IListApisProps {
  organizationId: TAPOrganizationId,
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
  onManagedObjectEdit: (managedObjectId: TManagedObjectId, managedObjectDisplayName: string) => void;
  onManagedObjectDelete: (managedObjectId: TManagedObjectId, managedObjectDisplayName: string) => void;
  onManagedObjectView: (managedObjectId: TManagedObjectId, managedObjectDisplayName: string) => void;
}

export const ListApis: React.FC<IListApisProps> = (props: IListApisProps) => {
  const componentName = 'ListApis';

  const MessageNoManagedObjectsFoundCreateNew = 'No APIs found - create a new API.';
  const MessageNoManagedObjectsFoundWithFilter = 'No APIs found for filter';
  const GlobalSearchPlaceholder = 'Enter search word list separated by <space> ...';

  type TManagedObject = TViewManagedObject;
  type TManagedObjectList = Array<TManagedObject>;
  type TManagedObjectTableDataRow = TManagedObject;
  type TManagedObjectTableDataList = Array<TManagedObjectTableDataRow>;

  const transformViewApiObjectToViewManagedObject = (viewApiObject: TViewApiObject, apiInfo: APIInfo): TViewManagedObject => {
    // const funcName = 'transformViewApiObjectToViewManagedObject';
    // const logName = `${ManageUsersCommon.name}.${funcName}()`;
    return {
      id: viewApiObject,
      displayName: viewApiObject,
      apiObject: viewApiObject,
      apiInfo: apiInfo
    }
  }

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
    isInitialSetting: true,
    first: 0, // index of the first row to be displayed
    rows: lazyLoadingTableRowsPerPageOptions[0], // number of rows to display per page
    page: 0,
    sortField: 'apiObject',
    sortOrder: 1
  });
  const [lazyLoadingTableTotalRecords, setLazyLoadingTableTotalRecords] = React.useState<number>(0);
  const [lazyLoadingTableIsLoading, setLazyLoadingTableIsLoading] = React.useState<boolean>(false);
  // * Global Filter *
  const [globalFilter, setGlobalFilter] = React.useState<string>();
  // * Data Table *
  const dt = React.useRef<any>(null);

  // * Api Calls *
  // const apiGetManagedObjectListPage = async(pageSize: number, pageNumber: number, sortFieldName: string, sortDirection: EAPSSortDirection, searchWordList?: string): Promise<TApiCallState> => {
  const apiGetManagedObjectList = async(pageSize: number, pageNumber: number): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObjectList';
    const logName = `${componentName}.${funcName}()`;
    setIsGetManagedObjectListInProgress(true);
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_API_NAME_LIST, 'retrieve list of APIs');
    try { 
      const apiNameList: Array<string> = await ApisService.listApis(props.organizationId, pageSize, pageNumber);
      const totalCount: number = 1000; // should be returned by previous call
      let _managedObjectList: TManagedObjectList = [];
      for(const apiName of apiNameList) {
        const apiInfo: APIInfo = await ApisService.getApiInfo(props.organizationId, apiName);
        _managedObjectList.push(transformViewApiObjectToViewManagedObject(apiName, apiInfo));
      }
      setManagedObjectList(_managedObjectList);
      setLazyLoadingTableTotalRecords(totalCount);
    } catch(e: any) {
      APSClientOpenApi.logError(logName, e);
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
    // TODO: Activate when connector can do search + sort
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
        <div className="table-header-container" />
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText type="search" placeholder={GlobalSearchPlaceholder} onInput={onInputGlobalFilter} style={{width: '500px'}}/>
          {/* <InputText type="search" placeholder={GlobalSearchPlaceholder} onKeyUp={onKeyupGlobalFilter} onInput={onInputGlobalFilter} style={{width: '500px'}}/> */}
          {/* <Button tooltip="go search" icon="pi pi-search" className="p-button-text p-button-plain p-button-outlined p-mr-2" onClick={onGlobalSearch} /> */}
        </span>
      </div>
    );
  }

  const actionBodyTemplate = (managedObject: TManagedObject) => {
    // const funcName = 'actionBodyTemplate';
    // const logName = `${componentName}.${funcName}()`;
    return (
        <React.Fragment>
          <Button tooltip="view" icon="pi pi-folder-open" className="p-button-rounded p-button-outlined p-button-secondary p-mr-2" onClick={() => props.onManagedObjectView(managedObject.id, managedObject.displayName)} />
          <Button tooltip="edit" icon="pi pi-pencil" className="p-button-rounded p-button-outlined p-button-secondary p-mr-2" onClick={() => props.onManagedObjectEdit(managedObject.id, managedObject.displayName)}  />
          <Button tooltip="delete" icon="pi pi-trash" className="p-button-rounded p-button-outlined p-button-secondary p-mr-2" onClick={() => props.onManagedObjectDelete(managedObject.id, managedObject.displayName)} />
        </React.Fragment>
    );
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

  const renderManagedObjectDataTable = () => {
    // const funcName = 'renderManagedObjectDataTable';
    // const logName = `${componentName}.${funcName}()`;
    let managedObjectTableDataList: TManagedObjectTableDataList = transformManagedObjectListToTableDataList(managedObjectList);    
    return (
      <div className="card">
          <DataTable
            ref={dt}
            autoLayout={true}
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
          >
            {/* <Column field="id" header="Id" sortable /> */}
            <Column field="displayName" header="Name" sortable />
            <Column field="apiInfo.source" header="Source" sortable />
            <Column body={actionBodyTemplate} headerStyle={{width: '20em', textAlign: 'center'}} bodyStyle={{textAlign: 'left', overflow: 'visible'}}/>
        </DataTable>
      </div>
    );
  }

  return (
    <div className="manage-apis">

      <APComponentHeader header='APIs:' />

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
