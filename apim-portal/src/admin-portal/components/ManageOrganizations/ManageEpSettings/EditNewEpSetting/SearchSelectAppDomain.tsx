
import React from "react";

import { InputText } from "primereact/inputtext";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from 'primereact/button';

import { ApiCallState, TApiCallState } from "../../../../../utils/ApiCallState";
import { APClientConnectorOpenApi } from "../../../../../utils/APClientConnectorOpenApi";
import { APComponentHeader } from "../../../../../components/APComponentHeader/APComponentHeader";
import { ApiCallStatusError } from "../../../../../components/ApiCallStatusError/ApiCallStatusError";
import APDisplayUtils from "../../../../../displayServices/APDisplayUtils";
import APEpApplicationDomainsDisplayService, { IAPEpApplicationDomainDisplay, TAPEpApplicationDomainDisplayList } from "../../../../../displayServices/APEpApplicationDomainsDisplayService";
import { E_CALL_STATE_ACTIONS } from "../ManageEpSettingsCommon";
import { Loading } from "../../../../../components/Loading/Loading";

import '../../../../../components/APComponents.css';
import "../../ManageOrganizations.css";

export interface ISearchSelectAppDomainProps {
  organizationId: string;
  currentSelected_IAPEpApplicationDomainDisplay: IAPEpApplicationDomainDisplay;
  excludeFromSelection_TAPEpApplicationDomainDisplayList: TAPEpApplicationDomainDisplayList; 
  onError: (apiCallState: TApiCallState) => void;
  onSave: (apEpApplicationDomainDisplay: IAPEpApplicationDomainDisplay) => void;
  onCancel: () => void;
}

export const SearchSelectAppDomain: React.FC<ISearchSelectAppDomainProps> = (props: ISearchSelectAppDomainProps) => {
  const ComponentName = 'SearchSelectAppDomain';

  type TManagedObject = IAPEpApplicationDomainDisplay;
  type TManagedObjectList = Array<TManagedObject>;

  const LoadingHeader = "Retrieving Application Domains";
  const DialogHeader = 'Search & Select Application Domain:';
  const MessageNoManagedObjectsFound = "No Application Domains left to map."
  const MessageNoManagedObjectsFoundWithFilter = 'No Application Domains found for filter';
  const GlobalSearchPlaceholder = 'search...';

  // const [organizationContext] = React.useContext(OrganizationContext);
  // const [userContext] = React.useContext(UserContext);

  const [managedObjectList, setManagedObjectList] = React.useState<TManagedObjectList>();
  const [selectedManagedObject, setSelectedManagedObject] = React.useState<TManagedObject>();
  const [isInitialialized, setIsInitialized] = React.useState<boolean>(false);
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [globalFilter, setGlobalFilter] = React.useState<string>();  // * Data Table *
  const dt = React.useRef<any>(null);

  // * Api Calls *
  const apiGetManagedObjectList = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObjectList';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_APPLICATION_DOMAIN_LIST, 'retrieve list of application domains');
    try {
      const list: TAPEpApplicationDomainDisplayList = await APEpApplicationDomainsDisplayService.apiGetList_TAPEpApplicationDomainDisplayList({
        organizationId: props.organizationId,
        exclude_TAPEpApplicationDomainDisplayList: props.excludeFromSelection_TAPEpApplicationDomainDisplayList
      });
      // check if current selection in list
      const found = list.find( (x) => {
        return x.apEntityId.id === props.currentSelected_IAPEpApplicationDomainDisplay.apEntityId.id;
      });
      if(found !== undefined) setSelectedManagedObject(props.currentSelected_IAPEpApplicationDomainDisplay);
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
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(managedObjectList === undefined) return;
    setIsInitialized(true);
  }, [managedObjectList]); /* eslint-disable-line react-hooks/exhaustive-deps */
  
  React.useEffect(() => {
    if(apiCallStatus === null) return;
    if(!apiCallStatus.success) props.onError(apiCallStatus);
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */
  
  // * UI Controls *

  const onSaveSelectedAppDomain = () => {
    const funcName = 'onSaveSelectedAppDomain';
    const logName = `${ComponentName}.${funcName}()`;
    if(selectedManagedObject === undefined) throw new Error(`${logName}: selectedManagedObject === undefined`);
    props.onSave(selectedManagedObject);
  }

  // * Data Table *
  const onInputGlobalFilter = (event: React.FormEvent<HTMLInputElement>) => {
    const _globalFilter: string | undefined = event.currentTarget.value !== '' ? event.currentTarget.value : undefined;
    setGlobalFilter(_globalFilter);
  }
 
  const renderDataTableHeader = (): JSX.Element => {
    const funcName = 'renderDataTableHeader';
    const logName = `${ComponentName}.${funcName}()`;
    const isSaveDisabled: boolean = selectedManagedObject === undefined;
    return (
      <div className="table-header">
        <div style={{ whiteSpace: "nowrap"}}>
          <Button type="button" label="Save" className="p-button-text p-button-plain p-button-outlined p-mr-2" onClick={onSaveSelectedAppDomain} disabled={isSaveDisabled} />
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

  // const onListSelectionChange = (event: any): void => {
  //   const moList: TManagedObjectList = event.value;
  //   if(APOrganizationsDisplayService.is_NumApis_Per_ApiProduct_Limited(organizationContext.apMaxNumApis_Per_ApiProduct)) {
  //     if(moList.length > organizationContext.apMaxNumApis_Per_ApiProduct) setIsMaxExceeded(true);
  //     else {
  //       setIsMaxExceeded(false);
  //       setSelectedManagedObjectList(event.value);
  //     }
  //   } else {
  //     setIsMaxExceeded(false);
  //     setSelectedManagedObjectList(event.value);
  //   }
  // }

  const onSelectionChange = (event: any): void => {
    setSelectedManagedObject(event.value);
  }

  const renderManagedObjectTableEmptyMessage = () => {
    if(globalFilter && globalFilter !== '') return `${MessageNoManagedObjectsFoundWithFilter}: ${globalFilter}.`;
    else return MessageNoManagedObjectsFound;
  }

  const nameBodyTemplate = (mo: TManagedObject): string => {
    return mo.apEntityId.displayName;
  }

  const renderManagedObjectDataTable = (): JSX.Element => {
    const dataKey = APDisplayUtils.nameOf<TManagedObject>('apEntityId.id');
    const sortField = APDisplayUtils.nameOf<TManagedObject>('apEntityId.displayName');
    const filterField = APDisplayUtils.nameOf<TManagedObject>('apSearchContent');
    // const businessGroupSortField = APDisplayUtils.nameOf<IAPApiDisplay>('apBusinessGroupInfo.apOwningBusinessGroupEntityId.displayName');  
    const renderManagedObjectDataTableSingle = (): JSX.Element => {
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
            onSelectionChange={onSelectionChange}              
            // sorting
            sortMode='single'
            sortField={sortField}
            sortOrder={1}
          >
            <Column header="Name" body={nameBodyTemplate} bodyStyle={{ verticalAlign: 'top' }} filterField={filterField} sortField={sortField} sortable />
            {/* <Column header="State" headerStyle={{width: '7em'}} body={stateTemplate} bodyStyle={{ verticalAlign: 'top' }} sortField={stateSortField} sortable /> */}
            {/* <Column header="Business Group" headerStyle={{width: '12em'}} body={businessGroupBodyTemplate} bodyStyle={{ verticalAlign: 'top' }} sortField={businessGroupSortField} sortable /> */}
            {/* <Column header="Shared" body={sharedBodyTemplate} bodyStyle={{textAlign: 'left', verticalAlign: 'top' }} /> */}
          </DataTable>
        </div>
      );
    }
  
    // main
    return renderManagedObjectDataTableSingle();
  }

  return (
    <div className="manage-organizations">

      <Loading key={ComponentName} show={isLoading} header={LoadingHeader} />      

      <APComponentHeader header={DialogHeader} />  

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      { isInitialialized && renderManagedObjectDataTable() }

    </div>
  );
}

