
import React from "react";

import { DataTable } from 'primereact/datatable';
import { Column } from "primereact/column";
import { InputText } from 'primereact/inputtext';

import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { APComponentHeader } from "../../../components/APComponentHeader/APComponentHeader";
import { Globals } from "../../../utils/Globals";
import { APRenderUtils } from "../../../utils/APRenderUtils";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { E_CALL_STATE_ACTIONS } from "./deleteme.ManageApiProductsCommon";
import { APClientConnectorOpenApi } from "../../../utils/APClientConnectorOpenApi";
import APAdminPortalApiProductsService, { 
  TAPAdminPortalApiProductDisplay,
  TAPAdminPortalApiProductDisplayList 
} from "../../utils/deleteme.APAdminPortalApiProductsService";

import '../../../components/APComponents.css';
import "./ManageApiProducts.css";

export interface IListApiProductsProps {
  organizationId: string;
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
  onManagedObjectEdit: (managedObjectId: string, managedObjectDisplayName: string) => void;
  onManagedObjectDelete: (managedObjectId: string, managedObjectDisplayName: string) => void;
  onManagedObjectView: (managedObjectId: string, managedObjectDisplayName: string, hasReferences: boolean) => void;
}

export const ListApiProducts: React.FC<IListApiProductsProps> = (props: IListApiProductsProps) => {
  const ComponentName = 'ListApiProducts';

  const MessageNoManagedObjectsFoundCreateNew = 'No API Products found - create a new API Product.';
  // const GlobalSearchPlaceholder = 'Enter search word list separated by <space> ...';
  const GlobalSearchPlaceholder = 'search...';

  type TManagedObject = TAPAdminPortalApiProductDisplay;
  type TManagedObjectList = Array<TManagedObject>;
  type TManagedObjectTableDataRow = TManagedObject & {
    isGuaranteedMessagingEnabled: boolean;
    globalSearch: string;
  };
  type TManagedObjectTableDataList = Array<TManagedObjectTableDataRow>;

  const transformManagedObjectListToTableDataList = (moList: TManagedObjectList): TManagedObjectTableDataList => {
    const _transformManagedObjectToTableDataRow = (mo: TManagedObject): TManagedObjectTableDataRow => {
      let _gm: boolean = false;
      if(mo.connectorApiProduct.clientOptions && mo.connectorApiProduct.clientOptions.guaranteedMessaging && mo.connectorApiProduct.clientOptions.guaranteedMessaging.requireQueue) {
        _gm = mo.connectorApiProduct.clientOptions.guaranteedMessaging.requireQueue;
      }
      const moTDRow: TManagedObjectTableDataRow = {
        ...mo,
        isGuaranteedMessagingEnabled: _gm,
        globalSearch: ''
      };
      const globalSearch = Globals.generateDeepObjectValuesString(moTDRow);
      return {
        ...moTDRow,
        globalSearch: globalSearch
      }
    }
    return moList.map( (mo: TManagedObject) => {
      return _transformManagedObjectToTableDataRow(mo);
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
    const logName = `${ComponentName}.${funcName}()`;
    setIsGetManagedObjectListInProgress(true);
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_API_PRODUCT_LIST, 'retrieve list of api products');
    try {
      const list: TAPAdminPortalApiProductDisplayList = await APAdminPortalApiProductsService.listAdminPortalApApiProductDisplay({
        organizationId: props.organizationId
      });
      setManagedObjectList(list);
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
    const mo: TManagedObject = event.data as TManagedObject;
    props.onManagedObjectView(mo.apEntityId.id, mo.apEntityId.displayName, mo.apAppReferenceEntityIdList.length > 0);
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

  const attributesBodyTemplate = (rowData: TManagedObjectTableDataRow): JSX.Element => {
    if(rowData.apAttributeDisplayList.length === 0) return (<div>-</div>);
    return APRenderUtils.renderStringListAsDivList(rowData.apAttributeDisplayNameList);
    // if(rowData.connectorApiProduct.attributes.length === 0) return (<div>-</div>);
    // return APRenderUtils.renderStringListAsDivList(APAttributesService.create_SortedAttributeNameList(rowData.connectorApiProduct.attributes));
  }
  const environmentsBodyTemplate = (rowData: TManagedObjectTableDataRow): JSX.Element => {
    return APRenderUtils.renderStringListAsDivList(rowData.apEnvironmentDisplayNameList);
  }
  const apisBodyTemplate = (rowData: TManagedObjectTableDataRow): JSX.Element => {
    return APRenderUtils.renderStringListAsDivList(rowData.apApiDisplayNameList);
  }
  const guaranteedMessagingBodyTemplate = (rowData: TManagedObjectTableDataRow): string => {
    return rowData.isGuaranteedMessagingEnabled.toString();
  }
  const usedByBodyTemplate = (rowData: TManagedObjectTableDataRow): JSX.Element => {
    if(rowData.apAppReferenceEntityIdList.length === 0) return (<>-</>);
    return (<>{`Apps: ${rowData.apAppReferenceEntityIdList.length}`}</>);
  }
  const nameBodyTemplate = (rowData: TManagedObjectTableDataRow): string => {
    return rowData.apEntityId.displayName;
  }
  const approvalTypeTemplate = (rowData: TManagedObjectTableDataRow): string => {
    return rowData.connectorApiProduct.approvalType ? rowData.connectorApiProduct.approvalType : '?';
  }
  const accessLevelTemplate = (rowData: TManagedObjectTableDataRow): string => {
    return rowData.connectorApiProduct.accessLevel ? rowData.connectorApiProduct.accessLevel : '?';
  }
  const protocolsTemplate = (rowData: TManagedObjectTableDataRow): JSX.Element => {
    return APRenderUtils.renderStringListAsDivList(rowData.apProtocolDisplayNameList);
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
            dataKey="apEntityId.id"  
            // sorting
            sortMode='single'
            sortField="apEntityId.displayName"
            sortOrder={1}
          >
            <Column header="Name" body={nameBodyTemplate} bodyStyle={{ verticalAlign: 'top' }} filterField="apSearchContent" sortField="apEntityId.displayName" sortable />
            <Column header="Approval" headerStyle={{width: '8em'}} body={approvalTypeTemplate} bodyStyle={{ verticalAlign: 'top' }} sortField="connectorApiProduct.approvalType"  sortable  />
            <Column header="Access" headerStyle={{width: '7em'}} body={accessLevelTemplate} bodyStyle={{ verticalAlign: 'top' }} sortField="connectorApiProduct.accessLevel" sortable />
            <Column header="APIs" body={apisBodyTemplate} bodyStyle={{textAlign: 'left', verticalAlign: 'top' }}/>
            <Column header="Attributes" body={attributesBodyTemplate}  bodyStyle={{ verticalAlign: 'top' }} />
            <Column header="Environments" body={environmentsBodyTemplate} bodyStyle={{textAlign: 'left', overflow: 'visible', verticalAlign: 'top' }}/>
            <Column header="Protocols" body={protocolsTemplate}  bodyStyle={{ verticalAlign: 'top' }} />
            <Column header="GM?" headerStyle={{ width: '5em' }} body={guaranteedMessagingBodyTemplate} bodyStyle={{ textAlign: 'center', verticalAlign: 'top' }} sortable sortField="isGuaranteedMessagingEnabled"/>
            <Column header="Used By" headerStyle={{width: '7em' }} body={usedByBodyTemplate} bodyStyle={{verticalAlign: 'top'}} />
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

      <div className="p-mt-4">
        {renderContent()}
      </div>
      
      {/* DEBUG OUTPUT         */}
      {/* {Config.getUseDevelTools() && renderDebugSelectedManagedObject()} */}

    </div>
  );
}
