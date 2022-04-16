
import React from "react";

import { DataTable } from 'primereact/datatable';
import { Column } from "primereact/column";
import { InputText } from 'primereact/inputtext';
import { SelectButton, SelectButtonChangeParams } from "primereact/selectbutton";
import { MenuItem } from "primereact/api";

import { 
  ApiProductsService, 
  AppListItem, 
  AppsService, 
  CommonDisplayName 
} from "@solace-iot-team/apim-connector-openapi-browser";
import { APClientConnectorOpenApi } from "../../../utils/APClientConnectorOpenApi";
import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { APComponentHeader } from "../../../components/APComponentHeader/APComponentHeader";
import { Globals } from "../../../utils/Globals";
import { APRenderUtils } from "../../../utils/APRenderUtils";
import { TApiEntitySelectItemList, TAPOrganizationId } from "../../../components/deleteme.APComponentsCommon";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { E_CALL_STATE_ACTIONS } from "./deleteme.ManageAppsCommon";
import { 
  TViewManagedApp,
  TViewManagedAppList,
  TApiProductList,
  TApiProduct,
  TManagedObjectId,
  TManagedObjectDisplayName,
} from '../../../components/APApiObjectsCommon';

import '../../../components/APComponents.css';
import "./deleteme.ManageApps.css";

export interface IListAppsProps {
  organizationId: TAPOrganizationId,
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
  onManagedObjectEdit: (managedObjectId: TManagedObjectId, managedObjectDisplayName: TManagedObjectDisplayName) => void;
  onManagedObjectView: (managedObjectId: TManagedObjectId, managedObjectDisplayName: TManagedObjectDisplayName, viewManagedObject: TViewManagedApp) => void;
  setBreadCrumbItemList: (itemList: Array<MenuItem>) => void;
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
      const _managedObjectList: TManagedObjectList = [];
      for(const apiAppListItem of apiAppList) {
        if(!apiAppListItem.apiProducts) throw new Error(`${logName}: apiAppListItem.apiProducts is undefined`);
        const _apApiProductList: TApiProductList = [];

        // apiProducts: AppApiProducts = Array<(AppApiProductsComplex | CommonName)>;

        //   export declare type AppApiProductsComplex = {
        //     apiproduct: CommonName;
        //     status?: AppStatus;
        // };

        for(const apiAppApiProduct of apiAppListItem.apiProducts) {
          const apiApiProductId: string = (typeof apiAppApiProduct === 'string' ? apiAppApiProduct : apiAppApiProduct.apiproduct);
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
    // const funcName = 'useEffect([])';
    // const logName = `${componentName}.${funcName}()`;
    // console.log(`${logName}: mounting ...`);    
    props.setBreadCrumbItemList([]);
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
            columnResizeMode="fit"
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
            <Column header="Name" field="displayName" bodyStyle={{ verticalAlign: 'top' }} filterField="globalSearch" sortable />
            <Column header="State" headerStyle={{ width: '7em'}} field="appListItem.status" bodyStyle={{ verticalAlign: 'top' }} sortable />
            <Column header="Type" headerStyle={{ width: '7em'}} field="appListItem.appType" bodyStyle={{ verticalAlign: 'top' }} sortable />
            <Column header="Owner" field="appListItem.ownerId" bodyStyle={{ verticalAlign: 'top' }}  sortable />
            <Column header="API Products" body={apiProductsBodyTemplate}  bodyStyle={{textAlign: 'left', overflow: 'hidden'}}/>
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

  // const renderDebugSelectedManagedObject = (): JSX.Element => {
  //   if(managedObjectList.length > 0 && selectedManagedObject) {
  //     const _d = {
  //       ...selectedManagedObject,
  //       globalSearch: 'not shown...'
  //     }
  //     return (
  //       <pre style={ { fontSize: '10px' }} >
  //         {JSON.stringify(_d, null, 2)}
  //       </pre>
  //     );
  //   } else return (<></>);
  // }

  return (
    <div className="ap-manage-apps">

      <APComponentHeader header='APPs:' />
  
      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      <div className="p-mt-4">
        {renderContent()}
      </div>

      {/* DEBUG OUTPUT         */}
      {/* {renderDebugSelectedManagedObject()} */}

    </div>
  );
}
