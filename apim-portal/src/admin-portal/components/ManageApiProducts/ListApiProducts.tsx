
import React from "react";

import { DataTable } from 'primereact/datatable';
import { Column } from "primereact/column";
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';

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
  // const componentName = 'ListApiProducts';

  const MessageNoManagedObjectsFoundCreateNew = 'No API Products found - create a new API Product.';
  // const GlobalSearchPlaceholder = 'Enter search word list separated by <space> ...';
  const GlobalSearchPlaceholder = 'search...';

  type TManagedObject = TViewManagedApiProduct;
  type TManagedObjectList = Array<TManagedObject>;
  type TManagedObjectTableDataRow = TManagedObject & {
    apiInfoListAsDisplayStringList: Array<string>;
    protocolListAsString: string;
    guaranteedMessagingEnabled: boolean;
    globalSearch: string;
  };
  type TManagedObjectTableDataList = Array<TManagedObjectTableDataRow>;

  const transformManagedObjectListToTableDataList = (managedObjectList: TManagedObjectList): TManagedObjectTableDataList => {
    const _transformManagedObjectToTableDataRow = (mo: TManagedObject): TManagedObjectTableDataRow => {
      let _gm: boolean = false;
      if(mo.apiProduct.clientOptions && mo.apiProduct.clientOptions.guaranteedMessaging && mo.apiProduct.clientOptions.guaranteedMessaging.requireQueue) {
        _gm = mo.apiProduct.clientOptions.guaranteedMessaging.requireQueue;
      }
      const managedObjectTableDataRow: TManagedObjectTableDataRow = {
        ...mo,
        apiInfoListAsDisplayStringList: APRenderUtils.getApiInfoListAsDisplayStringList(mo.apiInfoList),
        protocolListAsString: APRenderUtils.getProtocolListAsString(mo.apiProduct.protocols),
        guaranteedMessagingEnabled: _gm,
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

  const actionBodyTemplate = (mo: TManagedObject) => {
    const isDeleteAllowed: boolean = mo.apiUsedBy_AppEntityNameList.length === 0;
    return (
      <React.Fragment>
        <Button tooltip="edit" icon="pi pi-pencil" className="p-button-rounded p-button-outlined p-button-secondary p-mr-2" onClick={() => props.onManagedObjectEdit(mo.id, mo.displayName)}  />
        <Button tooltip="delete" icon="pi pi-trash" className="p-button-rounded p-button-outlined p-button-secondary p-mr-2" onClick={() => props.onManagedObjectDelete(mo.id, mo.displayName)} disabled={!isDeleteAllowed} />
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
  const guaranteedMessagingBodyTemplate = (rowData: TManagedObjectTableDataRow): string => {
    return rowData.guaranteedMessagingEnabled.toString();
  }

  const usedByBodyTemplate = (mo: TManagedObject): JSX.Element => {
    if(mo.apiUsedBy_AppEntityNameList.length === 0) return (<>Not used.</>);
    return (<>{`Apps: ${mo.apiUsedBy_AppEntityNameList.length}`}</>);
  }

  const renderManagedObjectDataTable = () => {
    let managedObjectTableDataList: TManagedObjectTableDataList = transformManagedObjectListToTableDataList(managedObjectList);    
    return (
      <div className="card">
          <DataTable
            ref={dt}
            className="p-datatable-sm"
            // autoLayout={true}
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
            {/* <Column field="apiProduct.description" header="Description" /> */}
            <Column field="apiProduct.approvalType" header="Approval" headerStyle={{width: '8em'}} sortable bodyStyle={{ verticalAlign: 'top' }} />
            <Column body={apisBodyTemplate} header="APIs" bodyStyle={{textAlign: 'left', verticalAlign: 'top' }}/>
            <Column body={attributesBodyTemplate} header="Attributes" bodyStyle={{ verticalAlign: 'top' }} />
            <Column body={environmentsBodyTemplate} header="Environments" bodyStyle={{textAlign: 'left', overflow: 'visible', verticalAlign: 'top' }}/>
            <Column header="Protocols" field="protocolListAsString"  bodyStyle={{ verticalAlign: 'top' }} />
            <Column header="GM?" headerStyle={{ width: '5em' }} body={guaranteedMessagingBodyTemplate} bodyStyle={{ textAlign: 'center', verticalAlign: 'top' }} sortable sortField="guaranteedMessagingEnabled"/>
            <Column header="Used By" headerStyle={{width: '7em' }} body={usedByBodyTemplate} bodyStyle={{verticalAlign: 'top'}} />
            <Column headerStyle={{width: '7em' }} body={actionBodyTemplate} bodyStyle={{textAlign: 'right', overflow: 'visible', verticalAlign: 'top' }}/>
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
    <div className="manage-api-products">

      <APComponentHeader header='API Products:' />

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      {renderContent()}
      
      {/* DEBUG OUTPUT         */}
      {/* {Config.getUseDevelTools() && renderDebugSelectedManagedObject()} */}

    </div>
  );
}
