
import React from "react";

import { InputText } from "primereact/inputtext";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from 'primereact/button';

import APEntityIdsService, { TAPEntityIdList } from "../../../../utils/APEntityIdsService";
import { ApiCallState, TApiCallState } from "../../../../utils/ApiCallState";
import { E_CALL_STATE_ACTIONS } from "../ManageApiProductsCommon";
import { APClientConnectorOpenApi } from "../../../../utils/APClientConnectorOpenApi";
import { APComponentHeader } from "../../../../components/APComponentHeader/APComponentHeader";
import { ApiCallStatusError } from "../../../../components/ApiCallStatusError/ApiCallStatusError";
import { OrganizationContext } from "../../../../components/APContextProviders/APOrganizationContextProvider";
import APOrganizationsDisplayService from "../../../../displayServices/APOrganizationsDisplayService/APOrganizationsDisplayService";
import APApisDisplayService, { IAPApiDisplay, TAPApiDisplayList } from "../../../../displayServices/APApisDisplayService";
import { UserContext } from "../../../../components/APContextProviders/APUserContextProvider";
import APDisplayUtils from "../../../../displayServices/APDisplayUtils";

import '../../../../components/APComponents.css';
import "../ManageApiProducts.css";

export interface ISearchSelectApisProps {
  organizationId: string;
  selectedApiEntityIdList: TAPEntityIdList;
  onError: (apiCallState: TApiCallState) => void;
  onSave: (apApiDisplayList: TAPApiDisplayList) => void;
  onCancel: () => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const SearchSelectApis: React.FC<ISearchSelectApisProps> = (props: ISearchSelectApisProps) => {
  const ComponentName = 'SearchSelectApis';

  type TManagedObject = IAPApiDisplay;
  type TManagedObjectList = Array<TManagedObject>;

  const DialogHeaderPlural = 'Search & Select API(s):';
  const DialogHeaderSingular = 'Search & Select one API:';
  const MessageNoManagedObjectsFound = "No APIs found."
  const MessageNoManagedObjectsFoundWithFilter = 'No APIs found for filter';
  // const GlobalSearchPlaceholder = 'Enter search word list separated by <space> ...';
  const GlobalSearchPlaceholder = 'search...';

  const [organizationContext] = React.useContext(OrganizationContext);
  const [userContext] = React.useContext(UserContext);

  const isSingleSelection: boolean = organizationContext.apMaxNumApis_Per_ApiProduct === 1;

  const [isMaxExceeded, setIsMaxExceeded] = React.useState<boolean>(false);
  const [managedObjectList, setManagedObjectList] = React.useState<TManagedObjectList>();
  const [selectedManagedObjectList, setSelectedManagedObjectList] = React.useState<TManagedObjectList>();
  const [selectedManagedObject, setSelectedManagedObject] = React.useState<TManagedObject>();
  const [isInitialialized, setIsInitialized] = React.useState<boolean>(false);
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [globalFilter, setGlobalFilter] = React.useState<string>();  // * Data Table *
  const dt = React.useRef<any>(null);

  // * Api Calls *
  const apiGetManagedObjectList = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObjectList';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_API_INFO_LIST, 'retrieve list of apis');
    if(userContext.runtimeSettings.currentBusinessGroupEntityId === undefined) throw new Error(`${logName}: userContext.runtimeSettings.currentBusinessGroupEntityId === undefined`);
    try {
      const apApiDisplayList: TAPApiDisplayList = await APApisDisplayService.apiGetList_ApApiDisplayList({
        organizationId: props.organizationId,
        default_ownerId: userContext.apLoginUserDisplay.apEntityId.id,
        businessGroupId: userContext.runtimeSettings.currentBusinessGroupEntityId.id,
      });
      setManagedObjectList(apApiDisplayList);
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
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(managedObjectList === undefined) return;
    const selectedList: TAPApiDisplayList = APEntityIdsService.create_ApDisplayObjectList_FilteredBy_EntityIdList({
      apDisplayObjectList: managedObjectList,
      filterByEntityIdList: props.selectedApiEntityIdList
    });
    if(isSingleSelection && selectedList.length > 0) setSelectedManagedObject(selectedList[0]);
    setSelectedManagedObjectList(selectedList);
  }, [managedObjectList]); /* eslint-disable-line react-hooks/exhaustive-deps */
  
  React.useEffect(() => {
    if(selectedManagedObjectList === undefined) return;
    setIsInitialized(true);
  }, [selectedManagedObjectList, selectedManagedObject]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */
  
  // * UI Controls *

  const onSaveSelectedApis = () => {
    const funcName = 'onSaveSelectedApis';
    const logName = `${ComponentName}.${funcName}()`;
    if(isSingleSelection) {
      if(selectedManagedObject === undefined) throw new Error(`${logName}: isSingleSelection && selectedManagedObject === undefined`);
      props.onSave([selectedManagedObject]);
    } else {
      if(selectedManagedObjectList === undefined) throw new Error(`${logName}: selectedManagedObjectList === undefined`);
      props.onSave(selectedManagedObjectList);
    }
  }

  // * Data Table *
  const onInputGlobalFilter = (event: React.FormEvent<HTMLInputElement>) => {
    const _globalFilter: string | undefined = event.currentTarget.value !== '' ? event.currentTarget.value : undefined;
    setGlobalFilter(_globalFilter);
  }
 
  const renderDataTableHeader = (): JSX.Element => {
    const funcName = 'renderDataTableHeader';
    const logName = `${ComponentName}.${funcName}()`;
    if(selectedManagedObjectList === undefined) throw new Error(`${logName}: selectedManagedObjectList === undefined`);
    // const isSaveDisabled: boolean = selectedManagedObjectList.length === 0;
    const isSaveDisabled: boolean = isSingleSelection ? selectedManagedObject === undefined : selectedManagedObjectList.length === 0;
    return (
      <div className="table-header">
        <div style={{ whiteSpace: "nowrap"}}>
          <Button type="button" label="Save" className="p-button-text p-button-plain p-button-outlined p-mr-2" onClick={onSaveSelectedApis} disabled={isSaveDisabled} />
          <Button type="button" label="Cancel" className="p-button-text p-button-plain p-mr-2" onClick={props.onCancel} />
        </div>        
        <div style={{ alignContent: "right"}}>
          <span className="p-input-icon-left" >
            <i className="pi pi-search" />
            <InputText 
              type="search" placeholder={GlobalSearchPlaceholder} style={{width: '500px'}} 
              disabled={false} 
              onInput={onInputGlobalFilter}  
              value={globalFilter}
            />
          </span>
        </div>
      </div>
    );
  }

  const onListSelectionChange = (event: any): void => {
    const moList: TManagedObjectList = event.value;
    if(APOrganizationsDisplayService.is_NumApis_Per_ApiProduct_Limited(organizationContext.apMaxNumApis_Per_ApiProduct)) {
      if(moList.length > organizationContext.apMaxNumApis_Per_ApiProduct) setIsMaxExceeded(true);
      else {
        setIsMaxExceeded(false);
        setSelectedManagedObjectList(event.value);
      }
    } else {
      setIsMaxExceeded(false);
      setSelectedManagedObjectList(event.value);
    }
  }

  const onSingleSelectionChange = (event: any): void => {
    setSelectedManagedObject(event.value);
  }

  const renderManagedObjectTableEmptyMessage = () => {
    if(globalFilter && globalFilter !== '') return `${MessageNoManagedObjectsFoundWithFilter}: ${globalFilter}.`;
    else return MessageNoManagedObjectsFound;
  }

  const nameBodyTemplate = (mo: TManagedObject): string => {
    return mo.apEntityId.displayName;
  }
  // const versionBodyTemplate = (mo: TManagedObject): JSX.Element => {
  //   return (<div>{mo.apVersionInfo.apLastVersion}</div>);
  // }
  const stateTemplate = (mo: TManagedObject): string => {
    return mo.apLifecycleStageInfo.stage;
  }
  const businessGroupBodyTemplate = (mo: TManagedObject): JSX.Element => {
    return (<div>{mo.apBusinessGroupInfo.apOwningBusinessGroupEntityId.displayName}</div>);
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

  const renderManagedObjectDataTableMultiple = (): JSX.Element => {
    const dataKey = APApisDisplayService.nameOf_ApEntityId('id');
    const sortField = APApisDisplayService.nameOf_ApEntityId('displayName');
    const filterField = APApisDisplayService.nameOf<IAPApiDisplay>('apSearchContent');
    const stateSortField = APApisDisplayService.nameOf_ApLifecycleStageInfo('stage');
    const businessGroupSortField = APApisDisplayService.nameOf_ApBusinessGroupInfo_ApOwningBusinessGroupEntityId('displayName');
    return (
      <div className="card p-mt-2">
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
          scrollable 
          scrollHeight="800px" 
          dataKey={dataKey}
          emptyMessage={renderManagedObjectTableEmptyMessage()}
          // selection
          selection={selectedManagedObjectList}
          onSelectionChange={onListSelectionChange}              
          // sorting
          sortMode='single'
          sortField={sortField}
          sortOrder={1}
        >
          <Column selectionMode="multiple" style={{width:'3em'}}/>
          <Column header="Name" body={nameBodyTemplate} bodyStyle={{ verticalAlign: 'top' }} filterField={filterField} sortField={sortField} sortable />
          {/* <Column header="Current Version" headerStyle={{width: '7em' }} body={versionBodyTemplate} bodyStyle={{verticalAlign: 'top', textAlign: 'center'}} /> */}
          {/* <Column header="Source" headerStyle={{width: '9em'}} body={sourceBodyTemplate} bodyStyle={{verticalAlign: 'top'}} sortField={sourceSortField} sortable /> */}
          <Column header="State" headerStyle={{width: '7em'}} body={stateTemplate} bodyStyle={{ verticalAlign: 'top' }} sortField={stateSortField} sortable />
          <Column header="Business Group" headerStyle={{width: '12em'}} body={businessGroupBodyTemplate} bodyStyle={{ verticalAlign: 'top' }} sortField={businessGroupSortField} sortable />
          <Column header="Shared" body={sharedBodyTemplate} bodyStyle={{textAlign: 'left', verticalAlign: 'top' }} />
        </DataTable>
      </div>
    );
  }

  const renderManagedObjectDataTableSingle = (): JSX.Element => {
    const dataKey = APApisDisplayService.nameOf_ApEntityId('id');
    const sortField = APApisDisplayService.nameOf_ApEntityId('displayName');
    const filterField = APApisDisplayService.nameOf<IAPApiDisplay>('apSearchContent');
    const stateSortField = APApisDisplayService.nameOf_ApLifecycleStageInfo('stage');
    const businessGroupSortField = APApisDisplayService.nameOf_ApBusinessGroupInfo_ApOwningBusinessGroupEntityId('displayName');
    return (
      <div className="card p-mt-2">
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
          scrollable 
          scrollHeight="800px" 
          dataKey={dataKey}
          emptyMessage={renderManagedObjectTableEmptyMessage()}
          // selection
          selectionMode="single"
          selection={selectedManagedObject}
          onSelectionChange={onSingleSelectionChange}              
          // sorting
          sortMode='single'
          sortField={sortField}
          sortOrder={1}
        >
          <Column header="Name" body={nameBodyTemplate} bodyStyle={{ verticalAlign: 'top' }} filterField={filterField} sortField={sortField} sortable />
          <Column header="State" headerStyle={{width: '7em'}} body={stateTemplate} bodyStyle={{ verticalAlign: 'top' }} sortField={stateSortField} sortable />
          <Column header="Business Group" headerStyle={{width: '12em'}} body={businessGroupBodyTemplate} bodyStyle={{ verticalAlign: 'top' }} sortField={businessGroupSortField} sortable />
          <Column header="Shared" body={sharedBodyTemplate} bodyStyle={{textAlign: 'left', verticalAlign: 'top' }} />
        </DataTable>
      </div>
    );
  }

  const renderManagedObjectDataTable = (): JSX.Element => {
    if(isSingleSelection) return renderManagedObjectDataTableSingle();
    else return renderManagedObjectDataTableMultiple();
  }

  const renderHeader = () => {
    if(isSingleSelection) {
      return (
        <APComponentHeader header={DialogHeaderSingular} />  
      ); 
    } else {
      return (
        <APComponentHeader header={DialogHeaderPlural} />  
      );
    }
  }

  const renderMaxExceededMessage = () => {
    return(
      <div style={{ color: 'red' }}>
        Max number of APIs per API Product exceeded. Max: {organizationContext.apMaxNumApis_Per_ApiProduct}.
      </div>
    )
  }

  return (
    <div className="manage-api-products">

      { renderHeader() }

      { isMaxExceeded && renderMaxExceededMessage() }

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      { isInitialialized && renderManagedObjectDataTable() }

    </div>
  );
}

