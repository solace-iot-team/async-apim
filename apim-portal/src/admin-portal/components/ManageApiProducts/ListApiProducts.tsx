
import React from "react";

import { DataTable } from 'primereact/datatable';
import { Column } from "primereact/column";
import { InputText } from 'primereact/inputtext';
import { MenuItem } from "primereact/api";

import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { APComponentHeader } from "../../../components/APComponentHeader/APComponentHeader";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { E_CALL_STATE_ACTIONS } from "./ManageApiProductsCommon";
import { APClientConnectorOpenApi } from "../../../utils/APClientConnectorOpenApi";
import APEntityIdsService, { TAPEntityId } from "../../../utils/APEntityIdsService";
import APAdminPortalApiProductsDisplayService, { 
  TAPAdminPortalApiProductDisplay, 
  TAPAdminPortalApiProductDisplayList 
} from "../../displayServices/APAdminPortalApiProductsDisplayService";
import APDisplayUtils from "../../../displayServices/APDisplayUtils";
import { UserContext } from "../../../components/APContextProviders/APUserContextProvider";

import '../../../components/APComponents.css';
import "./ManageApiProducts.css";

export interface IListApiProductsProps {
  organizationEntityId: TAPEntityId;
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
  onManagedObjectEdit: (managedObjectEntityId: TAPEntityId) => void;
  onManagedObjectDelete: (managedObjectEntityId: TAPEntityId) => void;
  onManagedObjectView: (apAdminPortalApiProductDisplay: TAPAdminPortalApiProductDisplay) => void;
  setBreadCrumbItemList: (itemList: Array<MenuItem>) => void;
}

export const ListApiProducts: React.FC<IListApiProductsProps> = (props: IListApiProductsProps) => {
  const ComponentName = 'ListApiProducts';

  const MessageNoManagedObjectsFoundCreateNew = 'No API Products found - create a new API Product.';
  // const GlobalSearchPlaceholder = 'Enter search word list separated by <space> ...';
  const GlobalSearchPlaceholder = 'search...';

  type TManagedObject = TAPAdminPortalApiProductDisplay;
  type TManagedObjectList = Array<TManagedObject>;

  const [userContext] = React.useContext(UserContext);
  const [managedObjectList, setManagedObjectList] = React.useState<TManagedObjectList>();
  const [isInitialized, setIsInitialized] = React.useState<boolean>(false); 
  const [selectedManagedObject, setSelectedManagedObject] = React.useState<TManagedObject>();
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [globalFilter, setGlobalFilter] = React.useState<string>();
  const dt = React.useRef<any>(null);

  // * Api Calls *
  const apiGetManagedObjectList = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObjectList';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_API_PRODUCT_LIST, 'retrieve list of api products');
    if(userContext.runtimeSettings.currentBusinessGroupEntityId === undefined) throw new Error(`${logName}: userContext.runtimeSettings.currentBusinessGroupEntityId === undefined`);
    try {
      const list: TAPAdminPortalApiProductDisplayList = await APAdminPortalApiProductsDisplayService.apiGetList_ApAdminPortalApiProductDisplayList({
        organizationId: props.organizationEntityId.id,
        businessGroupId: userContext.runtimeSettings.currentBusinessGroupEntityId.id,
        default_ownerId: userContext.apLoginUserDisplay.apEntityId.id
      });
      setManagedObjectList(list);
    } catch(e: any) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const doInitialize = async () => {
    props.onLoadingChange(true);
    await apiGetManagedObjectList();
    props.onLoadingChange(false);
  }

  React.useEffect(() => {
    // const funcName = 'useEffect([])';
    // const logName = `${ComponentName}.${funcName}()`;
    // alert(`${logName}: mounting ...`);
    props.setBreadCrumbItemList([]);
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(managedObjectList !== undefined) setIsInitialized(true);
  }, [managedObjectList]); /* eslint-disable-line react-hooks/exhaustive-deps */

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
    props.onManagedObjectView(mo);
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

  // const controlledChannelParametersBodyTemplate = (row: TManagedObject): JSX.Element => {
  //   return APDisplayUtils.create_DivList_From_StringList(APEntityIdsService.create_SortedDisplayNameList_From_ApDisplayObjectList(row.apControlledChannelParameterList));
  // }
  // const originalAttributesBodyTemplate = (row: TManagedObject): JSX.Element => {
  //   return APDisplayUtils.create_DivList_From_StringList(APEntityIdsService.create_SortedDisplayNameList_From_ApDisplayObjectList(row.original_ApAttributeDisplayList));
  // }
  // const customAttributesBodyTemplate = (row: TManagedObject): JSX.Element => {
  //   return APDisplayUtils.create_DivList_From_StringList(APEntityIdsService.create_SortedDisplayNameList_From_ApDisplayObjectList(row.apCustomAttributeDisplayList));
  // }
  // const externalAttributesBodyTemplate = (row: TManagedObject): JSX.Element => {
  //   return APDisplayUtils.create_DivList_From_StringList(APEntityIdsService.create_SortedDisplayNameList_From_ApDisplayObjectList(row.external_ApAttributeDisplayList));
  // }
  const environmentsBodyTemplate = (row: TManagedObject): JSX.Element => {
    return APDisplayUtils.create_DivList_From_StringList(APEntityIdsService.create_SortedDisplayNameList_From_ApDisplayObjectList(row.apEnvironmentDisplayList));
  }
  const apisBodyTemplate = (row: TManagedObject): JSX.Element => {
    return APDisplayUtils.create_DivList_From_StringList(APEntityIdsService.create_SortedDisplayNameList_From_ApDisplayObjectList(row.apApiDisplayList));
  }
  const usedByBodyTemplate = (row: TManagedObject): JSX.Element => {
    if(row.apAppReferenceEntityIdList.length === 0) return (<>-</>);
    return (
      <>
        {`Apps: ${row.apAppReferenceEntityIdList.length}`}
      </>
    );
  }
  const nameBodyTemplate = (row: TManagedObject): string => {
    return row.apEntityId.displayName;
  }
  const approvalTypeTemplate = (row: TManagedObject): string => {
    return row.apApprovalType;
  }
  // const businessGroupBodyTemplate = (row: TManagedObject): JSX.Element => {
  //   return (
  //     <div>
  //       {row.apBusinessGroupInfo.apOwningBusinessGroupEntityId.displayName}
  //     </div>
  //   );
  // }

  const versionBodyTemplate = (row: TManagedObject): JSX.Element => {
    return (
      <div>
        {row.apVersionInfo.apLastVersion}
      </div>
    );
  }

  // const apEntityIdBodyTemplate = (row: TManagedObject) => {
  //   return JSON.stringify(row.apEntityId);
  // }
  // const accessLevelTemplate = (rowData: TManagedObjectTableDataRow): string => {
  //   return rowData.connectorApiProduct.accessLevel ? rowData.connectorApiProduct.accessLevel : '?';
  // }
  // const protocolsTemplate = (rowData: TManagedObjectTableDataRow): JSX.Element => {
  //   return APRenderUtils.renderStringListAsDivList(rowData.apProtocolDisplayNameList);
  // }
  const renderManagedObjectDataTable = () => {
    const dataKey = APAdminPortalApiProductsDisplayService.nameOf_ApEntityId('id');
    const sortField = APAdminPortalApiProductsDisplayService.nameOf_ApEntityId('displayName');
    const filterField = APAdminPortalApiProductsDisplayService.nameOf('apSearchContent');
    const approvalTypeSortField = APAdminPortalApiProductsDisplayService.nameOf_ConnectorApiProduct('approvalType');
    // const gmSortField = APAdminPortalApiProductsDisplayService.nameOf('apIsGuaranteedMessagingEnabled');
    // const businessGroupSortField = APAdminPortalApiProductsDisplayService.nameOf_ApBusinessGroupInfo_ApBusinessGroupDisplayReference_ApEntityId('displayName');
    return (
      <div className="card">
        <DataTable
          ref={dt}
          className="p-datatable-sm"
          // autoLayout={true}
          resizableColumns 
          columnResizeMode="fit"
          showGridlines={false}
          header={renderDataTableHeader()}
          value={managedObjectList}
          globalFilter={globalFilter}
          selectionMode="single"
          selection={selectedManagedObject}
          onRowClick={onManagedObjectSelect}
          onRowDoubleClick={(e) => onManagedObjectOpen(e)}
          scrollable 
          // scrollHeight="800px" 
          dataKey={dataKey}
          // sorting
          sortMode='single'
          sortField={sortField}
          sortOrder={1}
        >
          {/* <Column header="DEBUG:apEntityId" body={apEntityIdBodyTemplate}  /> */}
          <Column header="Name" body={nameBodyTemplate} bodyStyle={{ verticalAlign: 'top' }} filterField={filterField} sortField={sortField} sortable />
          <Column header="Version" headerStyle={{width: '7em' }} body={versionBodyTemplate} bodyStyle={{verticalAlign: 'top'}} />
          <Column header="Approval" headerStyle={{width: '8em'}} body={approvalTypeTemplate} bodyStyle={{ verticalAlign: 'top' }} sortField={approvalTypeSortField} sortable />
          {/* <Column header="Business Group" headerStyle={{width: '12em'}} body={businessGroupBodyTemplate} bodyStyle={{ verticalAlign: 'top' }} sortField={businessGroupSortField} sortable /> */}
          {/* <Column header="Access" headerStyle={{width: '7em'}} body={accessLevelTemplate} bodyStyle={{ verticalAlign: 'top' }} sortField="connectorApiProduct.accessLevel" sortable /> */}
          <Column header="APIs" body={apisBodyTemplate} bodyStyle={{textAlign: 'left', verticalAlign: 'top' }}/>


          {/* <Column header="Orginal Attributes" body={originalAttributesBodyTemplate}  bodyStyle={{ verticalAlign: 'top' }} /> */}

          {/* <Column header="Controlled Channel Parameters" body={controlledChannelParametersBodyTemplate}  bodyStyle={{ verticalAlign: 'top' }} /> */}

          {/* <Column header="External Attributes" body={externalAttributesBodyTemplate}  bodyStyle={{ verticalAlign: 'top' }} />
          <Column header="Custom Attributes" body={customAttributesBodyTemplate}  bodyStyle={{ verticalAlign: 'top' }} /> */}

          <Column header="Environments" body={environmentsBodyTemplate} bodyStyle={{textAlign: 'left', overflow: 'visible', verticalAlign: 'top' }}/>
          {/* <Column header="Protocols" body={protocolsTemplate}  bodyStyle={{ verticalAlign: 'top' }} /> */}
          <Column header="Used By" headerStyle={{width: '7em' }} body={usedByBodyTemplate} bodyStyle={{verticalAlign: 'top'}} />
        </DataTable>
     </div>
    );
  }

  const renderContent = () => {
    const funcName = 'renderContent';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObjectList === undefined) throw new Error(`${logName}: managedObjectList === undefined`);

    if(managedObjectList.length === 0) {
      return (<h3>{MessageNoManagedObjectsFoundCreateNew}</h3>);
    }
    if(managedObjectList.length > 0) {
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

  const renderBusinessGroupInfo = (): JSX.Element => {
    return(
      <div>
        <span><b>Business Group:</b> {userContext.runtimeSettings.currentBusinessGroupEntityId?.displayName}</span>
      </div>
    );
  }

  return (
    <div className="manage-api-products">

      <APComponentHeader header='API Products:' notes="TODO: quick filter by lifecycle status"/>

      {renderBusinessGroupInfo()}
      
      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      <div className="p-mt-4">
        {isInitialized && renderContent()}
      </div>
      
      {/* DEBUG OUTPUT         */}
      {/* {Config.getUseDevelTools() && renderDebugSelectedManagedObject()} */}

    </div>
  );
}
