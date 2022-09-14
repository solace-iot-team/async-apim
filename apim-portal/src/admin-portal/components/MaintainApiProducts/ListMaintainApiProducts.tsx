
import React from "react";

import { DataTable } from 'primereact/datatable';
import { Column } from "primereact/column";
import { InputText } from 'primereact/inputtext';
import { MenuItem } from "primereact/api";
import { Divider } from "primereact/divider";

import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { APComponentHeader } from "../../../components/APComponentHeader/APComponentHeader";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { APClientConnectorOpenApi } from "../../../utils/APClientConnectorOpenApi";
import APEntityIdsService, { TAPEntityId, TAPEntityIdList } from "../../../utils/APEntityIdsService";
import APAdminPortalApiProductsDisplayService, { 
  TAPAdminPortalApiProductDisplay, 
  TAPAdminPortalApiProductDisplayList 
} from "../../displayServices/APAdminPortalApiProductsDisplayService";
import APDisplayUtils from "../../../displayServices/APDisplayUtils";
import { UserContext } from "../../../components/APContextProviders/APUserContextProvider";
import { E_CALL_STATE_ACTIONS } from "./MaintainApiProductsCommon";

import '../../../components/APComponents.css';
import "./MaintainApiProducts.css";

export interface IListMaintainApiProductsProps {
  organizationEntityId: TAPEntityId;
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
  onManagedObjectView: (apAdminPortalApiProductDisplay: TAPAdminPortalApiProductDisplay) => void;
  setBreadCrumbItemList: (itemList: Array<MenuItem>) => void;
}

export const ListMaintainApiProducts: React.FC<IListMaintainApiProductsProps> = (props: IListMaintainApiProductsProps) => {
  const ComponentName = 'ListMaintainApiProducts';

  const MessageNoManagedObjectsFound = 'No API Products found.';
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
    // if(userContext.runtimeSettings.currentBusinessGroupEntityId === undefined) throw new Error(`${logName}: userContext.runtimeSettings.currentBusinessGroupEntityId === undefined`);
    try {
      const list: TAPAdminPortalApiProductDisplayList = await APAdminPortalApiProductsDisplayService.apiGetMaintainanceList_ApAdminPortalApiProductDisplayList({
        organizationId: props.organizationEntityId.id,
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
    if(managedObjectList === undefined) return;
    setIsInitialized(true);
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
  // const approvalTypeTemplate = (row: TManagedObject): string => {
  //   return row.apApprovalType;
  // }
  const businessGroupBodyTemplate = (row: TManagedObject): JSX.Element => {
    return (
      <div>
        {row.apBusinessGroupInfo.apOwningBusinessGroupEntityId.displayName}
      </div>
    );
  }

  const versionBodyTemplate = (row: TManagedObject): JSX.Element => {
    return (
      <div>
        {row.apVersionInfo.apLastVersion}
      </div>
    );
  }
  const sharedBodyTemplate = (row: TManagedObject): JSX.Element => {
    const sharingEntityIdList: TAPEntityIdList = row.apBusinessGroupInfo.apBusinessGroupSharingList.map( (x) => {
      return {
        id: x.apEntityId.id,
        displayName: `${x.apEntityId.displayName} (${x.apSharingAccessType})`,
      }
    });
    if(sharingEntityIdList.length === 0) return (<div>None.</div>);
    return(
      <div>{APDisplayUtils.create_DivList_From_StringList(APEntityIdsService.getSortedDisplayNameList(sharingEntityIdList))}</div>
    );
  }
  // const apEntityIdBodyTemplate = (row: TManagedObject) => {
  //   return JSON.stringify(row.apEntityId);
  // }
  const accessLevelTemplate = (row: TManagedObject): string => {
    return row.apAccessLevel;
  }
  const stateTemplate = (row: TManagedObject): string => {
    return row.apLifecycleStageInfo.stage;
  }
  const renderManagedObjectDataTable = () => {
    const dataKey = APDisplayUtils.nameOf<TAPAdminPortalApiProductDisplay>('apEntityId.id');
    const sortField = APDisplayUtils.nameOf<TAPAdminPortalApiProductDisplay>('apEntityId.displayName');
    const filterField = APDisplayUtils.nameOf<TAPAdminPortalApiProductDisplay>('apSearchContent');
    const accessLevelSortField = APDisplayUtils.nameOf<TAPAdminPortalApiProductDisplay>('apAccessLevel');
    const stateSortField = APDisplayUtils.nameOf<TAPAdminPortalApiProductDisplay>('apLifecycleStageInfo.stage');
    const businessGroupSortField = APDisplayUtils.nameOf<TAPAdminPortalApiProductDisplay>('apBusinessGroupInfo.apOwningBusinessGroupEntityId.displayName');

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
          {/* <Column header="DEBUG:apEntityId" field={dataKey} sortable /> */}
          <Column header="Name" body={nameBodyTemplate} bodyStyle={{ verticalAlign: 'top' }} filterField={filterField} sortField={sortField} sortable />
          <Column header="Version" headerStyle={{width: '7em' }} body={versionBodyTemplate} bodyStyle={{verticalAlign: 'top'}} />
          <Column header="Access" headerStyle={{width: '7em'}} body={accessLevelTemplate} bodyStyle={{ verticalAlign: 'top' }} sortField={accessLevelSortField} sortable />
          <Column header="State" headerStyle={{width: '7em'}} body={stateTemplate} bodyStyle={{ verticalAlign: 'top' }} sortField={stateSortField} sortable />

          {/* <Column header="Approval" headerStyle={{width: '8em'}} body={approvalTypeTemplate} bodyStyle={{ verticalAlign: 'top' }} sortField={approvalTypeSortField} sortable /> */}
          <Column header="Business Group" headerStyle={{width: '12em'}} body={businessGroupBodyTemplate} bodyStyle={{ verticalAlign: 'top' }} sortField={businessGroupSortField} sortable />

          <Column header="Shared" body={sharedBodyTemplate} bodyStyle={{textAlign: 'left', verticalAlign: 'top' }} />

          <Column header="APIs" body={apisBodyTemplate} bodyStyle={{textAlign: 'left', verticalAlign: 'top' }}/>


          {/* <Column header="Orginal Attributes" body={originalAttributesBodyTemplate}  bodyStyle={{ verticalAlign: 'top' }} /> */}

          {/* <Column header="Controlled Channel Parameters" body={controlledChannelParametersBodyTemplate}  bodyStyle={{ verticalAlign: 'top' }} /> */}

          {/* <Column header="External Attributes" body={externalAttributesBodyTemplate}  bodyStyle={{ verticalAlign: 'top' }} />
          <Column header="Custom Attributes" body={customAttributesBodyTemplate}  bodyStyle={{ verticalAlign: 'top' }} /> */}

          {/* <Column header="Environments" body={environmentsBodyTemplate} bodyStyle={{textAlign: 'left', overflow: 'visible', verticalAlign: 'top' }}/> */}
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
      return (
        <React.Fragment>
          <Divider />
          {MessageNoManagedObjectsFound}
          <Divider />
        </React.Fragment>
      );
    }
    if(managedObjectList.length > 0) {
      return renderManagedObjectDataTable();
    } 
  }

  return (
    <div className="ap-maintain-api-products">

      <APComponentHeader header='API Products:' />
      
      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      <div className="p-mt-2">
        {isInitialized && renderContent()}
      </div>
      
    </div>
  );
}
