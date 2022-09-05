
import React from "react";

import { DataTable } from 'primereact/datatable';
import { Column } from "primereact/column";
import { InputText } from 'primereact/inputtext';
import { MenuItem, MenuItemCommandParams } from "primereact/api";
import { MultiSelect } from "primereact/multiselect";

import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { APComponentHeader } from "../../../components/APComponentHeader/APComponentHeader";
import APDisplayUtils from "../../../displayServices/APDisplayUtils";
import { APClientConnectorOpenApi } from "../../../utils/APClientConnectorOpenApi";
import APJobsDisplayService, { IAPJobDisplay } from "../../../displayServices/APJobsDisplayService";
import { E_CALL_STATE_ACTIONS } from "./MonitorOrganizationJobsCommon";

import '../../../components/APComponents.css';
import "./MonitorOrganizationJobs.css";

export interface IListOrganizationJobsProps {
  organizationId: string;
  onError: (apiCallState: TApiCallState) => void;
  onManagedObjectView: (apJobDisplay: IAPJobDisplay) => void;
  setBreadCrumbItemList: (itemList: Array<MenuItem>) => void;
  onNavigateHere: () => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const ListOrganizationJobs: React.FC<IListOrganizationJobsProps> = (props: IListOrganizationJobsProps) => {
  const ComponentName = 'ListOrganizationJobs';

  const MessageNoManagedObjectsFound = 'No Jobs found.';
  const MessageNoManagedObjectsFoundForFilter = 'No Job(s) found for filter.';
  const GlobalSearchPlaceholder = 'search ...';

  type TManagedObject = IAPJobDisplay;
  type TManagedObjectList = Array<TManagedObject>;

  const [managedObjectList, setManagedObjectList] = React.useState<TManagedObjectList>();  
  const [jobNameFilterList, setJobNameFilterList] = React.useState<Array<string>>([]);
  const [isInitialized, setIsInitialized] = React.useState<boolean>(false); 
  const [selectedManagedObject, setSelectedManagedObject] = React.useState<TManagedObject>();
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [globalFilter, setGlobalFilter] = React.useState<string>();
  const dt = React.useRef<any>(null);

  // * Api Calls *
  const apiGetManagedObjectList = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObjectList';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_LIST, 'retrieve list of jobs');
    try { 
      const list: TManagedObjectList = await APJobsDisplayService.apiGetList_TAPJobDisplayList({ 
        organizationId: props.organizationId,
        jobNameFilterList: jobNameFilterList
      });
      setManagedObjectList(list);
    } catch(e: any) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const ListJobs_onNavigateHereCommand = (e: MenuItemCommandParams): void => {
    props.onNavigateHere();
  }
  const setBreadCrumbItemList = () => {
    props.setBreadCrumbItemList([
      {
        label: 'Jobs',
        command: ListJobs_onNavigateHereCommand
      }
    ]);
  }

  const doInitialize = async () => {
    props.onLoadingChange(true);
    await apiGetManagedObjectList();
    props.onLoadingChange(false);
  }

  const reInitialize = async () => {
    setIsInitialized(false);
    props.onLoadingChange(true);
    await apiGetManagedObjectList();
    props.onLoadingChange(false);
  }

  React.useEffect(() => {
    // props.setBreadCrumbItemList([]);
    setBreadCrumbItemList();
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

  React.useEffect(() => {
    if(!isInitialized) return;
    reInitialize();
  }, [jobNameFilterList]); /* eslint-disable-line react-hooks/exhaustive-deps */

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
 
  const renderFilter = () => {
    return(
      <div>
        <span>Filter: </span>
        <MultiSelect
          display="chip"
          value={jobNameFilterList ? jobNameFilterList : []} 
          options={APJobsDisplayService.get_APJobDisplay_JobNames()} 
          onChange={(e) => setJobNameFilterList(e.value)}
          // optionLabel={APEntityIdsService.nameOf('displayName')}
          // optionValue={APEntityIdsService.nameOf('id')}
          // style={{width: '100px'}} 
        />
      </div>
    );
  }

  const renderDataTableHeader = (): JSX.Element => {
    return (
      <div className="table-header">
        <div className="table-header-container">
          {renderFilter()}
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
  const lastRunAtBodyTemplate = (mo: TManagedObject): string => {
    if(mo.connectorJob.lastRunAt) return mo.connectorJob.lastRunAt;
    return 'no run';
  }

  const getEmptyMessage = (): string => {
    if(globalFilter === undefined || globalFilter === '') return MessageNoManagedObjectsFound;
    return MessageNoManagedObjectsFoundForFilter;
  }

  const renderManagedObjectDataTable = () => {
    // @ts-ignore Type instantiation is excessively deep and possibly infinite.  TS2589
    const dataKey = APDisplayUtils.nameOf<IAPJobDisplay>('apEntityId.id');
    const filterField = APDisplayUtils.nameOf<IAPJobDisplay>('apSearchContent');
    const statusField = APDisplayUtils.nameOf<IAPJobDisplay>('status');
    const lastRunAtField = APDisplayUtils.nameOf<IAPJobDisplay>('connectorJob.lastRunAt');
    const nameField = APDisplayUtils.nameOf<IAPJobDisplay>('apEntityId.displayName');

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
          sortField={lastRunAtField}
          sortOrder={1}
        >
          <Column header="Name" style={{width: '20%'}} body={nameBodyTemplate} bodyStyle={{ verticalAlign: 'top' }}  field={nameField} sortable />
          <Column header="Last Run at" style={{width: '20%'}} body={lastRunAtBodyTemplate} bodyStyle={{ verticalAlign: 'top' }} filterField={filterField} field={lastRunAtField} sortable />
          <Column header="Id" style={{width: '20%'}} field={dataKey} bodyStyle={{ verticalAlign: 'top' }} />
          <Column header="Status" bodyStyle={{ verticalAlign: 'top' }} field={statusField} sortable />
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
    <div className="monitor-organization-jobs">

      <APComponentHeader header='Jobs:' />

      <div className="p-mt-2">
        {isInitialized && renderContent()}
      </div>

    </div>
  );
}
