
import React from "react";

import { DataTable } from 'primereact/datatable';
import { Column } from "primereact/column";
import { InputText } from 'primereact/inputtext';
import { MenuItem } from "primereact/api";
import { SelectButton, SelectButtonChangeParams } from "primereact/selectbutton";

import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { APClientConnectorOpenApi } from "../../../utils/APClientConnectorOpenApi";
import { APComponentHeader } from "../../../components/APComponentHeader/APComponentHeader";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import APEntityIdsService, { TAPEntityId, TAPEntityIdList } from "../../../utils/APEntityIdsService";
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
  const MessageNoManagedObjectsFoundForFilter = 'No APIs found for filter.';
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

  const SelectAllId = "SelectAllId";
  const SelectBusinessGroupId = "SelectBusinessGroupId";
  const SelectAllFilterOptions: TAPEntityIdList = [
    { id: SelectBusinessGroupId, displayName: 'Current Business Group Only' },
    { id: SelectAllId, displayName: 'Current Business Group & Children' },
  ];
  const [selectedFilterOptionId, setSelectedFilterOptionId] = React.useState<string>(SelectBusinessGroupId);

  const getSelectButton = () => {
    const onSelectFilterOptionChange = (params: SelectButtonChangeParams) => {
      if(params.value !== null) {
        setSelectedFilterOptionId(params.value);
      }
    }
    return(
      <SelectButton
        value={selectedFilterOptionId} 
        options={SelectAllFilterOptions} 
        optionLabel={APEntityIdsService.nameOf('displayName')}
        optionValue={APEntityIdsService.nameOf('id')}
        onChange={onSelectFilterOptionChange} 
        // style={{ textAlign: 'end' }}
      />
    );
  }

  // * Api Calls *
  const apiGetManagedObjectList_For_BusinessGroup = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObjectList_For_BusinessGroup';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_API_NAME_LIST, 'retrieve list of APIs');
    if(userContext.runtimeSettings.currentBusinessGroupEntityId === undefined) throw new Error(`${logName}: userContext.runtimeSettings.currentBusinessGroupEntityId === undefined`);
    try { 
      const list: TAPApiDisplayList = await APApisDisplayService.apiGetList_ApApiDisplayList({
        organizationId: props.organizationEntityId.id,
        default_ownerId: userContext.apLoginUserDisplay.apEntityId.id,
        businessGroupId: userContext.runtimeSettings.currentBusinessGroupEntityId.id,
      });
      setManagedObjectList(list);
    } catch(e: any) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

    /**
   * Current Business Group and all it's children
   */
  const apiGetManagedObjectList_For_All = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObjectList_For_All';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_API_NAME_LIST, 'retrieve list of APIs');
    if(userContext.runtimeSettings.currentBusinessGroupEntityId === undefined) throw new Error(`${logName}: userContext.runtimeSettings.currentBusinessGroupEntityId === undefined`);
    if(userContext.runtimeSettings.apMemberOfBusinessGroupDisplayTreeNodeList === undefined) throw new Error(`${logName}: userContext.runtimeSettings.apMemberOfBusinessGroupDisplayTreeNodeList === undefined`);
    try {
      const list: TAPApiDisplayList = await APApisDisplayService.apiGetList_ApApiDisplayList({
        organizationId: props.organizationEntityId.id,
        default_ownerId: userContext.apLoginUserDisplay.apEntityId.id,
        businessGroupId: userContext.runtimeSettings.currentBusinessGroupEntityId.id,
        apMemberOfBusinessGroupDisplayTreeNodeList: userContext.runtimeSettings.apMemberOfBusinessGroupDisplayTreeNodeList
      });
      setManagedObjectList(list);
    } catch(e: any) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const apiGetManagedObjectList = async(): Promise<TApiCallState> => {
    if(selectedFilterOptionId === SelectBusinessGroupId) return await apiGetManagedObjectList_For_BusinessGroup();
    else return await apiGetManagedObjectList_For_All();
  }

  const reInitialize = async () => {
    setIsInitialized(false);
    setIsLoading(true);
    await apiGetManagedObjectList();
    setIsLoading(false);
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

  React.useEffect(() => {
    if(!isInitialized) return;
    reInitialize();
  }, [selectedFilterOptionId]); /* eslint-disable-line react-hooks/exhaustive-deps */

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
        <div className="table-header-container">
          {getSelectButton()}
        </div> 
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText type="search" placeholder={GlobalSearchPlaceholder} onInput={onInputGlobalFilter} style={{width: '500px'}}/>
        </span>
      </div>
    );
  }

  const nameBodyTemplate = (mo: TManagedObject): string => {
    return mo.apEntityId.displayName;
  }
  const businessGroupBodyTemplate = (mo: TManagedObject): JSX.Element => {
    return (<div>{mo.apBusinessGroupInfo.apOwningBusinessGroupEntityId.displayName}</div>);
  }
  const versionBodyTemplate = (mo: TManagedObject): JSX.Element => {
    return (<div>{mo.apVersionInfo.apLastVersion}</div>);
  }
  const sourceBodyTemplate = (mo: TManagedObject): string => {
    return mo.connectorApiInfo.source;
  }
  const sharedBodyTemplate = (mo: TManagedObject): JSX.Element => {
    const sharingEntityIdList: TAPEntityIdList = mo.apBusinessGroupInfo.apBusinessGroupSharingList.map( (x) => {
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
  const stateTemplate = (mo: TManagedObject): string => {
    return mo.apLifecycleStageInfo.stage;
  }
  const usedByApiProductsBodyTemplate = (mo: TManagedObject): JSX.Element => {
    if(mo.apApiProductReferenceEntityIdList.length === 0) return (<>None</>);
    return(<>{mo.apApiProductReferenceEntityIdList.length}</>);
  }
  const getEmptyMessage = (): string => {
    if(globalFilter === undefined || globalFilter === '') return MessageNoManagedObjectsFound;
    return MessageNoManagedObjectsFoundForFilter;
  }
  const renderManagedObjectDataTable = () => {
    // const dataKey = APApisDisplayService.nameOf_ApEntityId('id');
    // const sortField = APApisDisplayService.nameOf_ApEntityId('displayName');
    // const filterField = APApisDisplayService.nameOf<IAPApiDisplay>('apSearchContent');
    // const stateSortField = APApisDisplayService.nameOf_ApLifecycleStageInfo('stage');
    // const sourceSortField = APApisDisplayService.nameOf_ConnectorApiInfo('source');
    // const businessGroupSortField = APApisDisplayService.nameOf_ApBusinessGroupInfo_ApOwningBusinessGroupEntityId('displayName');
    const dataKey = APDisplayUtils.nameOf<IAPApiDisplay>('apEntityId.id');
    const sortField = APDisplayUtils.nameOf<IAPApiDisplay>('apEntityId.displayName');
    const filterField = APDisplayUtils.nameOf<IAPApiDisplay>('apSearchContent');
    const stateSortField = APDisplayUtils.nameOf<IAPApiDisplay>('apLifecycleStageInfo.stage');
    const sourceSortField = APDisplayUtils.nameOf<IAPApiDisplay>('connectorApiInfo.source');
    const businessGroupSortField = APDisplayUtils.nameOf<IAPApiDisplay>('apBusinessGroupInfo.apOwningBusinessGroupEntityId.displayName');

    return (
      <div className="card">
        <DataTable
          ref={dt}
          className="p-datatable-sm"
          autoLayout={true}
          emptyMessage={getEmptyMessage()}
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
          <Column header="Version" headerStyle={{width: '7em' }} body={versionBodyTemplate} bodyStyle={{verticalAlign: 'top', textAlign: 'center'}} />
          <Column header="Source" headerStyle={{width: '9em'}} body={sourceBodyTemplate} bodyStyle={{verticalAlign: 'top'}} sortField={sourceSortField} sortable />
          <Column header="State" headerStyle={{width: '7em'}} body={stateTemplate} bodyStyle={{ verticalAlign: 'top' }} sortField={stateSortField} sortable />
          <Column header="Business Group" headerStyle={{width: '12em'}} body={businessGroupBodyTemplate} bodyStyle={{ verticalAlign: 'top' }} sortField={businessGroupSortField} sortable />
          <Column header="Shared" body={sharedBodyTemplate} bodyStyle={{textAlign: 'left', verticalAlign: 'top' }} />
          <Column header="API Products" headerStyle={{width: '8em'}} body={usedByApiProductsBodyTemplate} bodyStyle={{verticalAlign: 'top', textAlign: 'center'}} />
        </DataTable>
      </div>
    );
  }

  const renderContent = () => {
    const funcName = 'renderContent';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObjectList === undefined) throw new Error(`${logName}: managedObjectList === undefined`);
    // if(managedObjectList.length === 0) {
    //   return (
    //     <React.Fragment>
    //       <Divider />
    //       {MessageNoManagedObjectsFound}
    //       <Divider />
    //     </React.Fragment>
    //   );
    // }
    // if(managedObjectList.length > 0) {
    //   return renderManagedObjectDataTable();
    // } 
    return renderManagedObjectDataTable();
  }

  const renderBusinessGroupInfo = (): JSX.Element => {
    const funcName = 'renderBusinessGroupInfo';
    const logName = `${ComponentName}.${funcName}()`;
    if(userContext.runtimeSettings.currentBusinessGroupEntityId === undefined) throw new Error(`${logName}: userContext.runtimeSettings.currentBusinessGroupEntityId === undefined`);
    let info: string = userContext.runtimeSettings.currentBusinessGroupEntityId.displayName;
    if(selectedFilterOptionId === SelectAllId) info += ' & children';
    return(
      <div>
        <span><b>Business Group:</b> {info}</span>
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
