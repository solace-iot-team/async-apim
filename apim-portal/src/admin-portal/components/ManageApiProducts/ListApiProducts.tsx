
import React from "react";

import { DataTable } from 'primereact/datatable';
import { Column } from "primereact/column";
import { InputText } from 'primereact/inputtext';
import { MenuItem } from "primereact/api";
import { SelectButton, SelectButtonChangeParams } from "primereact/selectbutton";

import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { APComponentHeader } from "../../../components/APComponentHeader/APComponentHeader";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { E_CALL_STATE_ACTIONS } from "./ManageApiProductsCommon";
import { APClientConnectorOpenApi } from "../../../utils/APClientConnectorOpenApi";
import APEntityIdsService, { TAPEntityId, TAPEntityIdList } from "../../../utils/APEntityIdsService";
import APAdminPortalApiProductsDisplayService, { 
  TAPAdminPortalApiProductDisplay, 
  TAPAdminPortalApiProductDisplay4List, 
  TAPAdminPortalApiProductDisplay4ListList, 
} from "../../displayServices/APAdminPortalApiProductsDisplayService";
import APDisplayUtils from "../../../displayServices/APDisplayUtils";
import { UserContext } from "../../../components/APContextProviders/APUserContextProvider";
import { Loading } from "../../../components/Loading/Loading"; 
import { APOperationMode } from "../../../utils/APOperationMode";

import '../../../components/APComponents.css';
import "./ManageApiProducts.css";

export interface IListApiProductsProps {
  organizationEntityId: TAPEntityId;
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  onManagedObjectView: (apAdminPortalApiProductDisplay4List: TAPAdminPortalApiProductDisplay4List) => void;
  setBreadCrumbItemList: (itemList: Array<MenuItem>) => void;
}

export const ListApiProducts: React.FC<IListApiProductsProps> = (props: IListApiProductsProps) => {
  const ComponentName = 'ListApiProducts';

  const MessageNoManagedObjectsFound = 'No API Products defined.';
  const MessageNoManagedObjectsFoundForFilter = 'No API Products found for filter.';
  // const GlobalSearchPlaceholder = 'Enter search word list separated by <space> ...';
  const GlobalSearchPlaceholder = 'search...';

  type TManagedObject = TAPAdminPortalApiProductDisplay4List;
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
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_API_PRODUCT_LIST, 'retrieve list of api products');
    if(userContext.runtimeSettings.currentBusinessGroupEntityId === undefined) throw new Error(`${logName}: userContext.runtimeSettings.currentBusinessGroupEntityId === undefined`);
    try {
      const list: TAPAdminPortalApiProductDisplay4ListList = await APAdminPortalApiProductsDisplayService.apsGetList_ApAdminPortalApiProductDisplay4ListList({
        organizationId: props.organizationEntityId.id,
        businessGroupId: userContext.runtimeSettings.currentBusinessGroupEntityId.id,
        default_ownerId: userContext.apLoginUserDisplay.apEntityId.id,
        apOperationsMode: APOperationMode.AP_OPERATIONS_MODE
      });
  
      // const list: TAPAdminPortalApiProductDisplay4ListList = await APAdminPortalApiProductsDisplayService.apiGetList_ApAdminPortalApiProductDisplay4ListList({
      //   organizationId: props.organizationEntityId.id,
      //   businessGroupId: userContext.runtimeSettings.currentBusinessGroupEntityId.id,
      //   default_ownerId: userContext.apLoginUserDisplay.apEntityId.id,
      //   apOperationsMode: APOperationMode.AP_OPERATIONS_MODE
      // });
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
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_API_PRODUCT_LIST, 'retrieve list of api products');
    if(userContext.runtimeSettings.currentBusinessGroupEntityId === undefined) throw new Error(`${logName}: userContext.runtimeSettings.currentBusinessGroupEntityId === undefined`);
    if(userContext.runtimeSettings.apMemberOfBusinessGroupDisplayTreeNodeList === undefined) throw new Error(`${logName}: userContext.runtimeSettings.apMemberOfBusinessGroupDisplayTreeNodeList === undefined`);
    try {
      const list: TAPAdminPortalApiProductDisplay4ListList = await APAdminPortalApiProductsDisplayService.apiGetList_ApAdminPortalApiProductDisplay4ListList({
        organizationId: props.organizationEntityId.id,
        businessGroupId: userContext.runtimeSettings.currentBusinessGroupEntityId.id,
        default_ownerId: userContext.apLoginUserDisplay.apEntityId.id,
        apMemberOfBusinessGroupDisplayTreeNodeList: userContext.runtimeSettings.apMemberOfBusinessGroupDisplayTreeNodeList,
        apOperationsMode: APOperationMode.AP_OPERATIONS_MODE
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
    if (apiCallStatus !== null) {
      if(apiCallStatus.success) props.onSuccess(apiCallStatus);
      else props.onError(apiCallStatus);
    }
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
  // const environmentsBodyTemplate = (row: TManagedObject): JSX.Element => {
  //   return APDisplayUtils.create_DivList_From_StringList(APEntityIdsService.create_SortedDisplayNameList_From_ApDisplayObjectList(row.apEnvironmentDisplayList));
  // }
  const apisBodyTemplate = (row: TManagedObject): JSX.Element => {
    return APDisplayUtils.create_DivList_From_StringList(APEntityIdsService.create_SortedDisplayNameList(row.apApiEntityIdList));
  }
  const usedByBodyTemplate = (row: TManagedObject): JSX.Element => {
    if(row.apAppReferenceEntityIdList.length === 0) return (<>-</>);
    return (
      <>
        {`Apps: ${row.apAppReferenceEntityIdList.length}`}
      </>
    );
  }
  const nameBodyTemplate = (mo: TManagedObject): JSX.Element => {
    let style: any = {};
    if(!mo.apApiProductConfigState.apIsConfigComplete) style = { color: "red" };
    return (
      <div style={ style }>
        {mo.apEntityId.displayName}
      </div>
    );
  }
  // const approvalTypeTemplate = (row: TManagedObject): string => {
  //   return row.apApprovalType;
  // }
  const businessGroupBodyTemplate = (row: TManagedObject): JSX.Element => {
    return (<div>{row.apBusinessGroupInfo.apOwningBusinessGroupEntityId.displayName}</div>);
  }
  // const versionBodyTemplate = (row: TManagedObject): JSX.Element => {
  //   return (<div>{row.apVersionInfo.apLastVersion}</div>);
  // }  
  const revisionBodyTemplate = (row: TManagedObject): JSX.Element => {
    return (<div>{row.apVersionInfo.apLastVersion}</div>);
  }
  const sourceBodyTemplate = (mo: TManagedObject): string => {
    return mo.apApiProductSource;
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
  // const accessLevelTemplate = (row: TManagedObject): string => {
  //   return row.apAccessLevel;
  // }
  const stateTemplate = (row: TManagedObject): string => {
    return row.apLifecycleStageInfo.stage;
  }
  const publishedTemplate = (row: TManagedObject): JSX.Element => {
    if(row.apPublishDestinationInfo.apExternalSystemEntityIdList.length === 0) return (<div>Not published</div>);
    return APDisplayUtils.create_DivList_From_StringList(APEntityIdsService.create_SortedDisplayNameList(row.apPublishDestinationInfo.apExternalSystemEntityIdList));
  }
  const getEmptyMessage = (): string => {
    if(globalFilter === undefined || globalFilter === '') return MessageNoManagedObjectsFound;
    return MessageNoManagedObjectsFoundForFilter;
  }
  const renderManagedObjectDataTable = () => {
    const dataKey = APDisplayUtils.nameOf<TAPAdminPortalApiProductDisplay>('apEntityId.id');
    const sortField = APDisplayUtils.nameOf<TAPAdminPortalApiProductDisplay>('apEntityId.displayName');
    const filterField = APDisplayUtils.nameOf<TAPAdminPortalApiProductDisplay>('apSearchContent');
    // const accessLevelSortField = APDisplayUtils.nameOf<TAPAdminPortalApiProductDisplay>('apAccessLevel');
    const stateSortField = APDisplayUtils.nameOf<TAPAdminPortalApiProductDisplay>('apLifecycleStageInfo.stage');
    const businessGroupSortField = APDisplayUtils.nameOf<TAPAdminPortalApiProductDisplay>('apBusinessGroupInfo.apOwningBusinessGroupEntityId.displayName');
    const sourceSortField = APDisplayUtils.nameOf<TAPAdminPortalApiProductDisplay>('apApiProductSource');
    return (
      <div className="card">
        <DataTable
          ref={dt}
          className="p-datatable-sm"
          // autoLayout={true}
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
          {/* <Column header="DEBUG:apEntityId" body={apEntityIdBodyTemplate}  /> */}
          <Column header="Name" body={nameBodyTemplate} bodyStyle={{ verticalAlign: 'top' }} filterField={filterField} sortField={sortField} sortable />
          {/* <Column header="Version" headerStyle={{width: '7em' }} body={versionBodyTemplate} bodyStyle={{verticalAlign: 'top'}} /> */}
          <Column header="Revision" headerStyle={{width: '7em' }} body={revisionBodyTemplate} bodyStyle={{verticalAlign: 'top'}} />

          <Column header="Source" headerStyle={{width: '11em'}} body={sourceBodyTemplate} bodyStyle={{verticalAlign: 'top'}} sortField={sourceSortField} sortable />

          {/* <Column header="Access" headerStyle={{width: '7em'}} body={accessLevelTemplate} bodyStyle={{ verticalAlign: 'top' }} sortField={accessLevelSortField} sortable /> */}
          <Column header="State" headerStyle={{width: '7em'}} body={stateTemplate} bodyStyle={{ verticalAlign: 'top' }} sortField={stateSortField} sortable />
          <Column header="Published To" headerStyle={{width: '9em'}} body={publishedTemplate} bodyStyle={{ verticalAlign: 'top' }} />

          {/* <Column header="Approval" headerStyle={{width: '8em'}} body={approvalTypeTemplate} bodyStyle={{ verticalAlign: 'top' }} sortField={approvalTypeSortField} sortable /> */}
          <Column header="Business Group" headerStyle={{width: '12em'}} body={businessGroupBodyTemplate} bodyStyle={{ verticalAlign: 'top' }} sortField={businessGroupSortField} sortable />

          <Column header="Shared" body={sharedBodyTemplate} bodyStyle={{textAlign: 'left', verticalAlign: 'top' }} />

          <Column header="APIs" body={apisBodyTemplate} bodyStyle={{textAlign: 'left', verticalAlign: 'top' }}/>


          {/* <Column header="Orginal Attributes" body={originalAttributesBodyTemplate}  bodyStyle={{ verticalAlign: 'top' }} /> */}

          {/* <Column header="Controlled Channel Parameters" body={controlledChannelParametersBodyTemplate}  bodyStyle={{ verticalAlign: 'top' }} /> */}

          {/* <Column header="External Attributes" body={externalAttributesBodyTemplate}  bodyStyle={{ verticalAlign: 'top' }} />
          <Column header="Custom Attributes" body={customAttributesBodyTemplate}  bodyStyle={{ verticalAlign: 'top' }} /> */}

          {/* <Column header="Environments" body={environmentsBodyTemplate} bodyStyle={{textAlign: 'left', overflow: 'visible', verticalAlign: 'top' }}/> */}
          <Column header="Referenced By" headerStyle={{width: '10em' }} body={usedByBodyTemplate} bodyStyle={{verticalAlign: 'top'}} />
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
    <div className="manage-api-products">

      <Loading key={ComponentName} show={isLoading} />      

      <APComponentHeader header='API Products:' />

      <div className="p-mt-2">{renderBusinessGroupInfo()}</div>
      
      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      <div className="p-mt-2">
        {isInitialized && renderContent()}
      </div>
      
    </div>
  );
}
