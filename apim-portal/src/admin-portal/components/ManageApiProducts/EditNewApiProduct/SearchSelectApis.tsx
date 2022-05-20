
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
import { 
  TAPApiDisplay, 
  TAPApiDisplayList 
} from "../../../../displayServices/deleteme.APApisDisplayService";
import APAdminPortalApisDisplayService from "../../../displayServices/deleteme.APAdminPortalApisDisplayService";
import { OrganizationContext } from "../../../../components/APContextProviders/APOrganizationContextProvider";
import APOrganizationsDisplayService from "../../../../displayServices/APOrganizationsDisplayService/APOrganizationsDisplayService";

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

  type TManagedObject = TAPApiDisplay;
  type TManagedObjectList = Array<TManagedObject>;

  const DialogHeaderPlural = 'Search & Select API(s):';
  const DialogHeaderSingular = 'Search & Select one API:';
  const MessageNoManagedObjectsFound = "No APIs found."
  const MessageNoManagedObjectsFoundWithFilter = 'No APIs found for filter';
  // const GlobalSearchPlaceholder = 'Enter search word list separated by <space> ...';
  const GlobalSearchPlaceholder = 'search...';

  const [organizationContext] = React.useContext(OrganizationContext);

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
    try {
      const list = await APAdminPortalApisDisplayService.apiGetList_ApApiDisplayList({
        organizationId: props.organizationId
      })
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

  const renderManagedObjectDataTableMultiple = (): JSX.Element => {
    const dataKey = APAdminPortalApisDisplayService.nameOf_ApEntityId('id');
    const sortField = APAdminPortalApisDisplayService.nameOf_ApEntityId('displayName');
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
          <Column header="Name" field={sortField} filterField="apSearchContent" sortable />
          <Column header="Service Name" field="connectorEnvironmentResponse.serviceName" sortable />
          <Column header="Msg Vpn Name" field="connectorEnvironmentResponse.msgVpnName" sortable />
          <Column header="Datacenter Provider" field="connectorEnvironmentResponse.datacenterProvider" sortable />
          {/* <Column header="Description" field="connectorEnvironmentResponse.description" /> */}
        </DataTable>
      </div>
    );
  }

  const renderManagedObjectDataTableSingle = (): JSX.Element => {
    const dataKey = APAdminPortalApisDisplayService.nameOf_ApEntityId('id');
    const sortField = APAdminPortalApisDisplayService.nameOf_ApEntityId('displayName');
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
          <Column header="Name" field={sortField} filterField="apSearchContent" sortable />
          <Column header="Service Name" field="connectorEnvironmentResponse.serviceName" sortable />
          <Column header="Msg Vpn Name" field="connectorEnvironmentResponse.msgVpnName" sortable />
          <Column header="Datacenter Provider" field="connectorEnvironmentResponse.datacenterProvider" sortable />
          {/* <Column header="Description" field="connectorEnvironmentResponse.description" /> */}
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

