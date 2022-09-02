
import React from "react";

import { DataTable } from 'primereact/datatable';
import { Column } from "primereact/column";
import { InputText } from 'primereact/inputtext';

import { ApiCallState, TApiCallState } from "../../../../utils/ApiCallState";
import { APComponentHeader } from "../../../../components/APComponentHeader/APComponentHeader";
import { UserContext } from "../../../../components/APContextProviders/APUserContextProvider";
import { E_CALL_STATE_ACTIONS } from "./ManageEpSettingsCommon";
import APDisplayUtils from "../../../../displayServices/APDisplayUtils";
import { Loading } from "../../../../components/Loading/Loading";
import APEpSettingsDisplayService, { IAPEpSettingsDisplay, TAPEpSettingsDisplayList } from "../../../../displayServices/APEpSettingsDisplayService";
import { APClientConnectorOpenApi } from "../../../../utils/APClientConnectorOpenApi";
import APEntityIdsService from "../../../../utils/APEntityIdsService";

import '../../../../components/APComponents.css';
import "../ManageOrganizations.css";

export interface IListEpSettingsProps {
  organizationId: string;
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  onManagedObjectView: (apApiDisplay: IAPEpSettingsDisplay) => void;
  // setBreadCrumbItemList: (itemList: Array<MenuItem>) => void;
}

export const ListEpSettings: React.FC<IListEpSettingsProps> = (props: IListEpSettingsProps) => {
  const ComponentName = 'ListEpSettings';

  const MessageNoManagedObjectsFound = 'No Configuration defined.';
  const MessageNoManagedObjectsFoundForFilter = 'No Configuration(s) found for filter.';
  const GlobalSearchPlaceholder = 'search ...';

  type TManagedObject = IAPEpSettingsDisplay;
  type TManagedObjectList = Array<TManagedObject>;

  const [userContext] = React.useContext(UserContext);
  const [managedObjectList, setManagedObjectList] = React.useState<TManagedObjectList>();  
  const [isInitialized, setIsInitialized] = React.useState<boolean>(false); 
  const [selectedManagedObject, setSelectedManagedObject] = React.useState<TManagedObject>();
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [globalFilter, setGlobalFilter] = React.useState<string>();
  const dt = React.useRef<any>(null);

  // const SelectAllId = "SelectAllId";
  // const SelectBusinessGroupId = "SelectBusinessGroupId";
  // const SelectAllFilterOptions: TAPEntityIdList = [
  //   { id: SelectBusinessGroupId, displayName: 'Current Business Group Only' },
  //   { id: SelectAllId, displayName: 'Current Business Group & Children' },
  // ];
  // const [selectedFilterOptionId, setSelectedFilterOptionId] = React.useState<string>(SelectBusinessGroupId);

  // const getSelectButton = () => {
  //   const onSelectFilterOptionChange = (params: SelectButtonChangeParams) => {
  //     if(params.value !== null) {
  //       setSelectedFilterOptionId(params.value);
  //     }
  //   }
  //   return(
  //     <SelectButton
  //       value={selectedFilterOptionId} 
  //       options={SelectAllFilterOptions} 
  //       optionLabel={APEntityIdsService.nameOf('displayName')}
  //       optionValue={APEntityIdsService.nameOf('id')}
  //       onChange={onSelectFilterOptionChange} 
  //       // style={{ textAlign: 'end' }}
  //     />
  //   );
  // }

  // * Api Calls *
  const apiGetManagedObjectList = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObjectList';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_LIST, 'retrieve list of settings');
    if(userContext.runtimeSettings.currentBusinessGroupEntityId === undefined) throw new Error(`${logName}: userContext.runtimeSettings.currentBusinessGroupEntityId === undefined`);
    try { 
      const list: TAPEpSettingsDisplayList = await APEpSettingsDisplayService.apiGetList_ApEpSettingsDisplayList({
        organizationId: props.organizationId
      });
      setManagedObjectList(list);
    } catch(e: any) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  // const reInitialize = async () => {
  //   setIsInitialized(false);
  //   setIsLoading(true);
  //   await apiGetManagedObjectList();
  //   setIsLoading(false);
  // }

  const doInitialize = async () => {
    setIsLoading(true);
    await apiGetManagedObjectList();
    setIsLoading(false);
  }

  React.useEffect(() => {
    // props.setBreadCrumbItemList([]);
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

  // React.useEffect(() => {
  //   if(!isInitialized) return;
  //   reInitialize();
  // }, [selectedFilterOptionId]); /* eslint-disable-line react-hooks/exhaustive-deps */

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
          {/* {getSelectButton()} */}
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

  const statusBodyTemplate = (mo:TManagedObject): JSX.Element => {
    if(mo.apEpSettings_MappingList.length === 0) return (<span style={{ color: 'orange' }}>incomplete</span>);
    const areAllValid: boolean = mo.apEpSettings_MappingList.map((x)=> {
      return x.isValid;
    }).reduce( (previous, current, index, array) => {
      return current;
    }, true);
    if(areAllValid) return (<span style={ {color: 'green'} }>valid</span>);
    return (<span style={ {color: 'red'} }>issues</span>);
  }
  // const sharedBodyTemplate = (mo: TManagedObject): JSX.Element => {
  //   const sharingEntityIdList: TAPEntityIdList = mo.apBusinessGroupInfo.apBusinessGroupSharingList.map( (x) => {
  //     return {
  //       id: x.apEntityId.id,
  //       displayName: `${x.apEntityId.displayName} (${x.apSharingAccessType})`,
  //     }
  //   });
  //   if(sharingEntityIdList.length === 0) return (<div>None.</div>);
  //   return(
  //     <div>{APDisplayUtils.create_DivList_From_StringList(APEntityIdsService.getSortedDisplayNameList(sharingEntityIdList))}</div>
  //   );
  // }
  const applicationDomainsBodyTemplate = (mo: TManagedObject): JSX.Element => {
    // const applicationDomainNameList: Array<string> = APEntityIdsService.create_SortedDisplayNameList(APEntityIdsService.create_EntityIdList_From_ApDisplayObjectList(mo.apEpSettings_MappingList));
    // const x = APEntityIdsService.sor
    const listJoin = (list: Array<JSX.Element>): Array<JSX.Element> => {
      const listJoin: Array<JSX.Element> = [];
      for(let idx=0; idx<list.length; idx++) {  
        if(idx < list.length -1 ) listJoin.push(<span>{list[idx]}, </span>);
        else listJoin.push(<span>{list[idx]}</span>);
      }
      return listJoin;
    }
    const list: Array<JSX.Element> = [];
    for(const apEpSettings_Mapping of mo.apEpSettings_MappingList) {
      if(apEpSettings_Mapping.isValid) list.push(<span>{apEpSettings_Mapping.apEntityId.displayName}</span>)
      else list.push(<span style={{color: 'red'}}>{apEpSettings_Mapping.apEntityId.displayName}</span>)
    }
    return (<div>{listJoin(list)}</div>);
  }

  const getEmptyMessage = (): string => {
    if(globalFilter === undefined || globalFilter === '') return MessageNoManagedObjectsFound;
    return MessageNoManagedObjectsFoundForFilter;
  }
  const renderManagedObjectDataTable = () => {
    const dataKey = APDisplayUtils.nameOf<IAPEpSettingsDisplay>('apEntityId.id');
    const sortField = APDisplayUtils.nameOf<IAPEpSettingsDisplay>('apEntityId.displayName');
    const filterField = APDisplayUtils.nameOf<IAPEpSettingsDisplay>('apSearchContent');

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
          <Column header="Name" style={{width: '20%'}} body={nameBodyTemplate} bodyStyle={{ verticalAlign: 'top' }} filterField={filterField} sortField={sortField} sortable />
          <Column header="Application Domains" body={applicationDomainsBodyTemplate} bodyStyle={{ verticalAlign: 'top' }} />
          <Column header="Status" body={statusBodyTemplate} bodyStyle={{ verticalAlign: 'top' }} />
          {/* <Column header="Shared" body={sharedBodyTemplate} bodyStyle={{textAlign: 'left', verticalAlign: 'top' }} /> */}
        </DataTable>
      </div>
    );
  }

  const renderContent = () => {
    const funcName = 'renderContent';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObjectList === undefined) throw new Error(`${logName}: managedObjectList === undefined`);
    return renderManagedObjectDataTable();
  }

  return (
    <div className="manage-organizations">

      <Loading key={ComponentName} show={isLoading} />      

      <APComponentHeader header='Configurations:' />

      <div className="p-mt-2">
        {isInitialized && renderContent()}
      </div>

    </div>
  );
}
