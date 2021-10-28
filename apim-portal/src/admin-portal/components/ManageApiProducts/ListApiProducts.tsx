
import React from "react";

import { DataTable } from 'primereact/datatable';
import { Column } from "primereact/column";
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';

import { Config } from '../../../Config';
import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { APComponentHeader } from "../../../components/APComponentHeader/APComponentHeader";
import { Globals } from "../../../utils/Globals";
import { APRenderUtils } from "../../../utils/APRenderUtils";
import { TAPOrganizationId } from "../../../components/APComponentsCommon";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { E_CALL_STATE_ACTIONS } from "./ManageApiProductsCommon";
import { 
  TManagedApiProductId, 
  TViewManagedApiProduct,
  TApiGetApiProductListResult,
  APApiObjectsApiCalls,
} from '../../../components/APApiObjectsCommon';

import '../../../components/APComponents.css';
import "./ManageApiProducts.css";

export interface IListApiProductsProps {
  organizationId: TAPOrganizationId,
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
  onManagedObjectEdit: (managedObjectId: TManagedApiProductId, managedObjectDisplayName: string) => void;
  onManagedObjectDelete: (managedObjectId: TManagedApiProductId, managedObjectDisplayName: string) => void;
  onManagedObjectView: (managedObjectId: TManagedApiProductId, managedObjectDisplayName: string, viewManagedObject: TViewManagedApiProduct) => void;
}

export const ListApiProducts: React.FC<IListApiProductsProps> = (props: IListApiProductsProps) => {
  const componentName = 'ListApiProducts';

  const MessageNoManagedObjectsFoundCreateNew = 'No API Products found - create a new API Product.';
  const GlobalSearchPlaceholder = 'Enter search word list separated by <space> ...';

  type TManagedObject = TViewManagedApiProduct;
  type TManagedObjectList = Array<TManagedObject>;
  type TManagedObjectTableDataRow = TManagedObject & {
    apiInfoListAsDisplayStringList: Array<string>,
    protocolListAsString: string,
    globalSearch: string
  };
  type TManagedObjectTableDataList = Array<TManagedObjectTableDataRow>;

  const transformManagedObjectListToTableDataList = (managedObjectList: TManagedObjectList): TManagedObjectTableDataList => {
    const _transformManagedObjectToTableDataRow = (managedObject: TManagedObject): TManagedObjectTableDataRow => {
      const managedObjectTableDataRow: TManagedObjectTableDataRow = {
        ...managedObject,
        apiInfoListAsDisplayStringList: APRenderUtils.getApiInfoListAsDisplayStringList(managedObject.apiInfoList),
        protocolListAsString: APRenderUtils.getProtocolListAsString(managedObject.apiProduct.protocols),
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
  const dt = React.useRef<any>(null);

  // * Api Calls *
  const apiGetManagedObjectList = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObjectList';
    const logName = `${componentName}.${funcName}()`;
    setIsGetManagedObjectListInProgress(true);
    const initialCallState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_API_PRODUCT_LIST, 'retrieve list of api products');
    const result: TApiGetApiProductListResult = await APApiObjectsApiCalls.apiGetApiProductList(props.organizationId, initialCallState);
    setManagedObjectList(result.viewManagedApiProductList);
    setApiCallStatus(result.apiCallState);
    setIsGetManagedObjectListInProgress(false);
    return result.apiCallState;
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
  }
 
  const renderDataTableHeader = (): JSX.Element => {
    return (
      <div className="table-header">
        <div className="table-header-container" />
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText type="search" placeholder={GlobalSearchPlaceholder} onInput={onInputGlobalFilter} style={{width: '500px'}}/>
        </span>
      </div>
    );
  }

  const actionBodyTemplate = (managedObject: TManagedObject) => {
    return (
        <React.Fragment>
          <Button tooltip="view" icon="pi pi-folder-open" className="p-button-rounded p-button-outlined p-button-secondary p-mr-2" onClick={() => props.onManagedObjectView(managedObject.id, managedObject.displayName, managedObject)} />
          <Button tooltip="edit" icon="pi pi-pencil" className="p-button-rounded p-button-outlined p-button-secondary p-mr-2" onClick={() => props.onManagedObjectEdit(managedObject.id, managedObject.displayName)}  />
          <Button tooltip="delete" icon="pi pi-trash" className="p-button-rounded p-button-outlined p-button-secondary p-mr-2" onClick={() => props.onManagedObjectDelete(managedObject.id, managedObject.displayName)} />
        </React.Fragment>
    );
  }

  const attributesBodyTemplate = (rowData: TManagedObjectTableDataRow): JSX.Element => {
    return APRenderUtils.renderStringListAsDivList(APRenderUtils.getAttributeNameList(rowData.apiProduct.attributes));
  }

  const environmentsBodyTemplate = (rowData: TManagedObjectTableDataRow): JSX.Element => {
    return APRenderUtils.renderStringListAsDivList(rowData.apiProduct.environments ? rowData.apiProduct.environments : []);
    // return APRenderUtils.renderStringListAsDivList(rowData.environmentListAsStringList);
  }
  const apisBodyTemplate = (rowData: TManagedObjectTableDataRow): JSX.Element => {
    return APRenderUtils.renderStringListAsDivList(rowData.apiInfoListAsDisplayStringList);
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
            // sorting
            sortMode='single'
            sortField="displayName"
            sortOrder={1}
          >
            <Column field="displayName" header="Name" sortable filterField="globalSearch" bodyStyle={{ 'vertical-align': 'top' }}/>
            {/* <Column field="apiProduct.description" header="Description" /> */}
            <Column field="apiProduct.approvalType" header="Approval" headerStyle={{width: '8em'}} sortable bodyStyle={{ 'vertical-align': 'top' }} />
            <Column body={apisBodyTemplate} header="APIs" bodyStyle={{textAlign: 'left', overflow: 'visible', 'vertical-align': 'top' }}/>
            <Column body={attributesBodyTemplate} header="Attributes" bodyStyle={{ 'vertical-align': 'top' }} />
            <Column body={environmentsBodyTemplate} header="Environments" bodyStyle={{textAlign: 'left', overflow: 'visible', 'vertical-align': 'top' }}/>
            <Column field="protocolListAsString" header="Protocols" bodyStyle={{ 'vertical-align': 'top' }} />
            <Column body={actionBodyTemplate} headerStyle={{width: '10em', textAlign: 'center'}} bodyStyle={{textAlign: 'center', overflow: 'visible', 'vertical-align': 'top' }}/>
        </DataTable>
      </div>
    );
  }

  const renderContent = () => {

    if(managedObjectList.length === 0 && !isGetManagedObjectListInProgress && apiCallStatus && apiCallStatus.success) {
      return (<h3>{MessageNoManagedObjectsFoundCreateNew}</h3>);
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
    <div className="manage-api-products">

      <APComponentHeader header='API Products:' />

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      {renderContent()}
      
      {/* DEBUG OUTPUT         */}
      {/* {Config.getUseDevelTools() && renderDebugSelectedManagedObject()} */}

    </div>
  );
}
