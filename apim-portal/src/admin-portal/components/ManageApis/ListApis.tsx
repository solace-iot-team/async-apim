
import React from "react";

import { DataTable } from 'primereact/datatable';
import { Column } from "primereact/column";
import { InputText } from 'primereact/inputtext';
import { MenuItem } from "primereact/api";
import { Divider } from "primereact/divider";

import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { APClientConnectorOpenApi } from "../../../utils/APClientConnectorOpenApi";
import { APComponentHeader } from "../../../components/APComponentHeader/APComponentHeader";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import APEntityIdsService, { TAPEntityId } from "../../../utils/APEntityIdsService";
import APApisDisplayService, { 
  IAPApiDisplay, 
  TAPApiDisplayList 
} from "../../../displayServices/APApisDisplayService";
import { UserContext } from "../../../components/APContextProviders/APUserContextProvider";
import { E_CALL_STATE_ACTIONS } from "./ManageApisCommon";
import APDisplayUtils from "../../../displayServices/APDisplayUtils";
import { Loading } from "../../../components/Loading/Loading";

import '../../../components/APComponents.css';
import "./ManageApis.css";

export interface IListApisProps {
  organizationEntityId: TAPEntityId;
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  onManagedObjectView: (apApiDisplay: IAPApiDisplay) => void;
  setBreadCrumbItemList: (itemList: Array<MenuItem>) => void;
}

export const ListApis: React.FC<IListApisProps> = (props: IListApisProps) => {
  const ComponentName = 'ListApis';

  const MessageNoManagedObjectsFound = 'No APIs defined.';
  const GlobalSearchPlaceholder = 'search ...';

  type TManagedObject = IAPApiDisplay;
  type TManagedObjectList = Array<TManagedObject>;

  const [userContext] = React.useContext(UserContext);
  const [managedObjectList, setManagedObjectList] = React.useState<TManagedObjectList>();  
  const [isInitialized, setIsInitialized] = React.useState<boolean>(false); 
  const [selectedManagedObject, setSelectedManagedObject] = React.useState<TManagedObject>();
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [globalFilter, setGlobalFilter] = React.useState<string>();
  const dt = React.useRef<any>(null);

  // * Api Calls *
  const apiGetManagedObjectList = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObjectList';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_API_NAME_LIST, 'retrieve list of APIs');
    try { 
      const list: TAPApiDisplayList = await APApisDisplayService.apiGetList_ApApiDisplayList({
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
    setIsLoading(true);
    await apiGetManagedObjectList();
    setIsLoading(false);
  }

  React.useEffect(() => {
    props.setBreadCrumbItemList([]);
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(managedObjectList === undefined) return;
    setIsInitialized(true);
  }, [managedObjectList]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(apiCallStatus === null) return;
    if(apiCallStatus.success) props.onSuccess(apiCallStatus);
    else props.onError(apiCallStatus);
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

  const usedByApiProductsBodyTemplate = (row: TManagedObject): JSX.Element => {
    if(row.apApiProductReferenceEntityIdList.length === 0) return (<>None</>);
    return APDisplayUtils.create_DivList_From_StringList(APEntityIdsService.create_SortedDisplayNameList(row.apApiProductReferenceEntityIdList));
  }
  const sourceBodyTemplate = (row: TManagedObject): string => {
    return row.connectorApiInfo.source;
  }
  const nameBodyTemplate = (row: TManagedObject): string => {
    return row.apEntityId.displayName;
  }

  const renderManagedObjectDataTable = () => {
    const dataKey = APApisDisplayService.nameOf_ApEntityId('id');
    const sortField = APApisDisplayService.nameOf_ApEntityId('displayName');
    const filterField = APApisDisplayService.nameOf<IAPApiDisplay>('apSearchContent');
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
          <Column header="Name" body={nameBodyTemplate} bodyStyle={{ verticalAlign: 'top' }} filterField={filterField} sortField={sortField} sortable />
          <Column header="Source" body={sourceBodyTemplate} bodyStyle={{verticalAlign: 'top'}} sortable />
          <Column header="Used By API Products" body={usedByApiProductsBodyTemplate} bodyStyle={{verticalAlign: 'top'}} />
          {/* <Column headerStyle={{width: '7em' }} body={actionBodyTemplate} bodyStyle={{verticalAlign: 'top', textAlign: 'right' }} /> */}
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

  const renderBusinessGroupInfo = (): JSX.Element => {
    return(
      <div>
        <span><b>Business Group:</b> {userContext.runtimeSettings.currentBusinessGroupEntityId?.displayName}</span>
      </div>
    );
  }

  return (
    <div className="manage-apis">

      <Loading key={ComponentName} show={isLoading} />      

      <APComponentHeader header='APIs:' />

      <div className="p-mt-2">{renderBusinessGroupInfo()}</div>

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      <div className="p-mt-2">
        {isInitialized && renderContent()}
      </div>

    </div>
  );
}
