
import React from "react";

import { DataTable } from 'primereact/datatable';
import { Column } from "primereact/column";
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';

import { ApiProductsService, AppListItem, AppsService, CommonDisplayName } from "@solace-iot-team/apim-connector-openapi-browser";
import { APClientConnectorOpenApi } from "../../../utils/APClientConnectorOpenApi";
import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { APComponentHeader } from "../../../components/APComponentHeader/APComponentHeader";
import { Globals } from "../../../utils/Globals";
import { APRenderUtils } from "../../../utils/APRenderUtils";
import { TApiEntitySelectItemList, TAPOrganizationId } from "../../../components/APComponentsCommon";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { E_CALL_STATE_ACTIONS } from "./ManageAppsCommon";
import { 
  TManagedApiProductId, 
  TViewManagedApp,
  TViewManagedAppList,
  TApiProductList,
  TApiProduct,
} from '../../../components/APApiObjectsCommon';

import '../../../components/APComponents.css';
import "./ManageApps.css";
import { SelectButton, SelectButtonChangeParams } from "primereact/selectbutton";

export interface IListAppsProps {
  organizationId: TAPOrganizationId,
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
  onManagedObjectEdit: (managedObjectId: TManagedApiProductId, managedObjectDisplayName: string) => void;
  onManagedObjectView: (managedObjectId: TManagedApiProductId, managedObjectDisplayName: string, viewManagedObject: TViewManagedApp) => void;
}

export const ListApps: React.FC<IListAppsProps> = (props: IListAppsProps) => {
  const componentName = 'ListApps';

  const MessageNoManagedObjectsFound = 'No APPs found.';
  // const GlobalSearchPlaceholder = 'Enter search word list separated by <space> ...';
  const GlobalSearchPlaceholder = 'search ...';

  type TManagedObject = TViewManagedApp;
  type TManagedObjectList = TViewManagedAppList;
  type TManagedObjectTableDataRow = TManagedObject & {
    apiProductDisplayNameList: Array<CommonDisplayName>,
    globalSearch: string
  };
  type TManagedObjectTableDataList = Array<TManagedObjectTableDataRow>;

  const transformViewApiObjectToViewManagedObject = (appListItem: AppListItem, apiProductList: TApiProductList): TManagedObject => {
    const funcName = 'transformViewApiObjectToViewManagedObject';
    const logName = `${componentName}.${funcName}()`;
    if(!appListItem.name) throw new Error(`${logName}: appListItem.name is undefined`);
    return {
      id: appListItem.name,
      displayName: appListItem.displayName ? appListItem.displayName : appListItem.name,
      appListItem: appListItem,
      apiProductList: apiProductList
    }
  }
  const transformManagedObjectListToTableDataList = (managedObjectList: TManagedObjectList): TManagedObjectTableDataList => {
    const _createApiProductDisplayNameList = (apiProductList: TApiProductList): Array<CommonDisplayName> => {
      return apiProductList.map( (apiProduct: TApiProduct) => {
        return apiProduct.displayName
      });
    }
    const _transformManagedObjectToTableDataRow = (managedObject: TManagedObject): TManagedObjectTableDataRow => {
      const managedObjectTableDataRow: TManagedObjectTableDataRow = {
        ...managedObject,
        apiProductDisplayNameList: _createApiProductDisplayNameList(managedObject.apiProductList),
        globalSearch: ''
      };
      const globalSearch = Globals.generateDeepObjectValuesString(managedObjectTableDataRow);
      return {
        ...managedObjectTableDataRow,
        globalSearch: globalSearch
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
  const [globalFilter, setGlobalFilter] = React.useState<string>();
  const selectGlobalFilterOptions: TApiEntitySelectItemList = [
    { id: 'pending', displayName: 'pending' },
    { id: 'approved', displayName: 'approved' },
    { id: '', displayName: 'all'}
  ]
  const [selectedGlobalFilter, setSelectedGlobalFilter] = React.useState<string>('');
  const dt = React.useRef<any>(null);

  // * Api Calls *
  const apiGetManagedObjectList = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObjectList';
    const logName = `${componentName}.${funcName}()`;
    setIsGetManagedObjectListInProgress(true);
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_APP_LIST, `retrieve list of apps`);
    try { 
      const apiAppList: Array<AppListItem> = await AppsService.listApps({
        organizationName: props.organizationId, 
      });
      let _managedObjectList: TManagedObjectList = [];
      for(const apiAppListItem of apiAppList) {
        if(!apiAppListItem.apiProducts) throw new Error(`${logName}: apiAppListItem.apiProducts is undefined`);
        let _apApiProductList: TApiProductList = [];
        for(const apiApiProductId of apiAppListItem.apiProducts) {
          const apiApiProduct = await ApiProductsService.getApiProduct({
            organizationName: props.organizationId,
            apiProductName: apiApiProductId
          });
          _apApiProductList.push(apiApiProduct);
        }
        _managedObjectList.push(transformViewApiObjectToViewManagedObject(apiAppListItem, _apApiProductList));
      }
      setManagedObjectList(_managedObjectList);
    } catch(e: any) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    setIsGetManagedObjectListInProgress(false);
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
    props.onManagedObjectView(managedObject.id, managedObject.displayName, managedObject);
  }

  const onInputGlobalFilter = (event: React.FormEvent<HTMLInputElement>) => {
    setGlobalFilter(event.currentTarget.value);
    setSelectedGlobalFilter(event.currentTarget.value);
  }
 
  const renderDataTableHeader = (): JSX.Element => {
    const onSelectedGlobalFilterChange = (params: SelectButtonChangeParams) => {
      if(params.value !== null) {
        setSelectedGlobalFilter(params.value);
        setGlobalFilter(params.value);
      }
      // alert(`params.value = ${JSON.stringify(params.value)}`);
    }
    return (
      <div className="table-header">
        <div className="table-header-container">
          <SelectButton 
            value={selectedGlobalFilter} 
            options={selectGlobalFilterOptions} 
            optionLabel="displayName"
            optionValue="id"
            onChange={onSelectedGlobalFilterChange} 
            style={{ textAlign: 'end' }}
          />
        </div>
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

  const actionBodyTemplate = (managedObject: TManagedObject) => {
    return (
        <React.Fragment>
          <Button tooltip="view" icon="pi pi-folder-open" className="p-button-rounded p-button-outlined p-button-secondary p-mr-2" onClick={() => props.onManagedObjectView(managedObject.id, managedObject.displayName, managedObject)} />
          {/* <Button tooltip="edit" icon="pi pi-pencil" className="p-button-rounded p-button-outlined p-button-secondary p-mr-2" onClick={() => props.onManagedObjectEdit(managedObject.id, managedObject.displayName)}  /> */}
        </React.Fragment>
    );
  }

  const apiProductsBodyTemplate = (rowData: TManagedObjectTableDataRow) => {
    return APRenderUtils.renderStringListAsDivList(rowData.apiProductDisplayNameList);
  }

  const renderManagedObjectDataTable = () => {
    let managedObjectTableDataList: TManagedObjectTableDataList = transformManagedObjectListToTableDataList(managedObjectList);    
    return (
      <div className="card">
          <DataTable
            ref={dt}
            className="p-datatable-sm"
            autoLayout={true}
            resizableColumns 
            columnResizeMode="expand"
            showGridlines={false}
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
            // sorting
            sortMode='single'
            sortField="displayName"
            sortOrder={1}
          >
            <Column field="displayName" header="Name" sortable filterField="globalSearch" bodyStyle={{ verticalAlign: 'top' }}/>
            <Column field="appListItem.status" header="State" sortable bodyStyle={{ verticalAlign: 'top' }}/>
            <Column field="appListItem.appType" header="Type" sortable bodyStyle={{ verticalAlign: 'top' }}/>
            <Column field="appListItem.ownerId" header="Owner" sortable bodyStyle={{ verticalAlign: 'top' }}/>
            <Column body={apiProductsBodyTemplate} header="API Products" bodyStyle={{textAlign: 'left', overflow: 'hidden'}}/>
            <Column body={actionBodyTemplate} headerStyle={{width: '3em'}} bodyStyle={{textAlign: 'right', overflow: 'visible', verticalAlign: 'top' }}/>
        </DataTable>
      </div>
    );
  }

  const renderContent = () => {

    if(managedObjectList.length === 0 && !isGetManagedObjectListInProgress && apiCallStatus && apiCallStatus.success) {
      return (<h3>{MessageNoManagedObjectsFound}</h3>);
    }
    if(managedObjectList.length > 0 && !isGetManagedObjectListInProgress) {
      return renderManagedObjectDataTable();
    } 
  }

  const renderDebugSelectedManagedObject = (): JSX.Element => {
    if(managedObjectList.length > 0 && selectedManagedObject) {
      const _d = {
        ...selectedManagedObject,
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
    <div className="ap-manage-apps">

      <APComponentHeader header='APPs:' />

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      {renderContent()}
      
      {/* DEBUG OUTPUT         */}
      {/* {renderDebugSelectedManagedObject()} */}

    </div>
  );
}
