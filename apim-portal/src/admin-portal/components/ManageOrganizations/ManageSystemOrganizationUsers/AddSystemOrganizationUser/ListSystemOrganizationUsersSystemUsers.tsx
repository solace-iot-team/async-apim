
import React from "react";

import { InputText } from "primereact/inputtext";
import { DataTable, DataTableSortOrderType } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";

import { TAPEntityId } from "../../../../../utils/APEntityIdsService";
import { ApiCallState, TApiCallState } from "../../../../../utils/ApiCallState";
import APSystemUsersDisplayService, { TAPSystemUserDisplay, TAPSystemUserDisplayListResponse } from "../../../../../displayServices/APUsersDisplayService/APSystemUsersDisplayService";
import { TAPUserDisplayLazyLoadingTableParameters } from "../../../../../displayServices/APUsersDisplayService/APUsersDisplayService";
import { APSClientOpenApi } from "../../../../../utils/APSClientOpenApi";
import { APComponentHeader } from "../../../../../components/APComponentHeader/APComponentHeader";

import '../../../../../components/APComponents.css';
import "../../ManageOrganizations.css";
import { E_CALL_STATE_ACTIONS_USERS } from "../../ManageOrganizationsCommon";

export interface IListSystemOrganizationUsersSystemUsersProps {
  excludeOrganizationEntityId: TAPEntityId;
  onError: (apiCallState: TApiCallState) => void;
  onSelectUser: (selected_ApSystemUserDisplay: TAPSystemUserDisplay) => void;
  onCancel: () => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const ListSystemOrganizationUsersSystemUsers: React.FC<IListSystemOrganizationUsersSystemUsersProps> = (props: IListSystemOrganizationUsersSystemUsersProps) => {
  const ComponentName = 'ListSystemOrganizationUsersSystemUsers';

  type TManagedObject = TAPSystemUserDisplay;
  type TManagedObjectList = Array<TManagedObject>;

  const MessageNoManagedObjectsFoundWithFilter = 'No Users found for filter';
  const GlobalSearchPlaceholder = 'Search for user e-mail ...';

  const [selectedManagedObject, setSelectedManagedObject] = React.useState<TManagedObject>();
  const [managedObjectList, setManagedObjectList] = React.useState<TManagedObjectList>([]);  
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);

  const lazyLoadingTableRowsPerPageOptions: Array<number> = [10,20,50,100];
  const [lazyLoadingTableParams, setLazyLoadingTableParams] = React.useState<TAPUserDisplayLazyLoadingTableParameters>({
    isInitialSetting: true,
    first: 0, // index of the first row to be displayed
    rows: lazyLoadingTableRowsPerPageOptions[0], // number of rows to display per page
    page: 0,
    sortField: APSystemUsersDisplayService.nameOf_ApUserProfileDisplay('email'),
    sortOrder: 1
  });
  const [lazyLoadingTableTotalRecords, setLazyLoadingTableTotalRecords] = React.useState<number>(0);
  const [lazyLoadingTableIsLoading, setLazyLoadingTableIsLoading] = React.useState<boolean>(false);
  const [globalFilter, setGlobalFilter] = React.useState<string>();
  const dataTableRef = React.useRef<any>(null);

  const apiGetManagedObjectListPage = async({pageSize, pageNumber, sortFieldName, sortDirection, searchWordList}:{
    pageSize: number;
    pageNumber: number;
    sortFieldName: string;
    sortDirection: DataTableSortOrderType;
    searchWordList?: string;
  }): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObjectListPage';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS_USERS.API_GET_USER_LIST, 'retrieve list of users');
    try {
      // TEST Error
      // throw new Error(`${logName}: testing error handling`);
      const apSystemUserDisplayListResponse: TAPSystemUserDisplayListResponse = await APSystemUsersDisplayService.apsGetList_ActiveUsersNotInOrganization_ApSystemUserDisplayListResponse({
        excludeOrganizationEntityId: props.excludeOrganizationEntityId,
        pageSize: pageSize,
        pageNumber: pageNumber,
        apSortFieldName: sortFieldName,
        sortDirection: sortDirection,
        searchUserId: searchWordList,
      });
      setManagedObjectList(apSystemUserDisplayListResponse.apSystemUserDisplayList);
      setLazyLoadingTableTotalRecords(apSystemUserDisplayListResponse.meta.totalCount);
    } catch(e: any) {
      APSClientOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const doLoadPage = async () => {
    props.onLoadingChange(true);
    setLazyLoadingTableIsLoading(true);
    const pageNumber: number = lazyLoadingTableParams.page + 1;
    const pageSize: number = lazyLoadingTableParams.rows;
    const sortFieldName: string = lazyLoadingTableParams.sortField;
    const sortDirection: DataTableSortOrderType = lazyLoadingTableParams.sortOrder;
    const searchWordList: string | undefined = globalFilter;
    await apiGetManagedObjectListPage({
      pageSize: pageSize, 
      pageNumber: pageNumber, 
      sortFieldName: sortFieldName, 
      sortDirection: sortDirection, 
      searchWordList: searchWordList
    });
    setLazyLoadingTableIsLoading(false);
    props.onLoadingChange(false);
  }

  // * useEffect Hooks *

  React.useEffect(() => {
    doLoadPage();
  }, [lazyLoadingTableParams, globalFilter]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  // * Data Table *

  const onManagedObjectSelect = (event: any): void => {
    setSelectedManagedObject(event.data);
  }

  const onSelectedManagedObjectAdd = (event: any): void => {
    props.onSelectUser(event.data);
  }

  const onSelectedManagedObjectAddFromToolbar = () => {
    const funcName = 'onSelectedManagedObjectAddFromToolbar';
    const logName = `${ComponentName}.${funcName}()`;
    if(selectedManagedObject === undefined) throw new Error(`${logName}: selectedManagedObject is undefined`);
    props.onSelectUser(selectedManagedObject);
  }

  const onInputGlobalFilter = (event: React.FormEvent<HTMLInputElement>) => {
    const _globalFilter: string | undefined = event.currentTarget.value !== '' ? event.currentTarget.value : undefined;
    setGlobalFilter(_globalFilter);
  }

  const renderDataTableHeader = (): JSX.Element => {
    return (
      <div className="table-header">
        <div style={{ whiteSpace: "nowrap"}}>
          <Button type="button" label="Add" className="p-button-text p-button-plain p-button-outlined p-mr-2" onClick={onSelectedManagedObjectAddFromToolbar} disabled={selectedManagedObject===undefined} />
          <Button type="button" label="Cancel" className="p-button-text p-button-plain p-mr-2" onClick={props.onCancel} />
        </div>        
        <div style={{ alignContent: "right"}}>
          <span className="p-input-icon-left" style={{width: '1200px' }}>
            <i className="pi pi-search" />
            <InputText 
              type="search" placeholder={GlobalSearchPlaceholder} style={{width: '100%'}} 
              disabled={false} 
              onInput={onInputGlobalFilter}  
              value={globalFilter}
            />
          </span>
        </div>
      </div>
    );
  }

  const onPageSelect = (event: any) => {
    const _lazyParams = { ...lazyLoadingTableParams, isInitialSetting: false, ...event };
    setLazyLoadingTableParams(_lazyParams);
  }

  const onSort = (event: any) => {
    const _lazyParams = { ...lazyLoadingTableParams, isInitialSetting: false, ...event };
    setLazyLoadingTableParams(_lazyParams);
  }
  const renderManagedObjectTableEmptyMessage = () => {
    if(globalFilter && globalFilter !== '') return `${MessageNoManagedObjectsFoundWithFilter}: ${globalFilter}`;
    // else return (`${logName}: what to render here?`);
  }
  const renderManagedObjectDataTable = () => {
    return (
      <div className="card p-mt-4">
          <DataTable
            ref={dataTableRef}
            autoLayout={true}
            header={renderDataTableHeader()}
            value={managedObjectList}
            selectionMode="single"
            selection={selectedManagedObject}
            onRowClick={onManagedObjectSelect}
            onRowDoubleClick={(e) => onSelectedManagedObjectAdd(e)}
            scrollable 
            scrollHeight="800px" 
            dataKey={APSystemUsersDisplayService.nameOf_ApEntityId('id')}
            emptyMessage={renderManagedObjectTableEmptyMessage()}
            // lazyLoading & pagination
            lazy={true}
            paginator={true}
            paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
            rowsPerPageOptions={lazyLoadingTableRowsPerPageOptions}
            first={lazyLoadingTableParams.first}
            rows={lazyLoadingTableParams.rows}
            totalRecords={lazyLoadingTableTotalRecords}
            onPage={onPageSelect}
            loading={lazyLoadingTableIsLoading}
            // sorting
            sortMode='single'
            onSort={onSort} 
            sortField={lazyLoadingTableParams.sortField} 
            sortOrder={lazyLoadingTableParams.sortOrder}
          >

            <Column header="E-Mail" field={APSystemUsersDisplayService.nameOf_ApUserProfileDisplay('email')}  sortable />
            <Column header="First Name" headerStyle={{width: '12em'}} field={APSystemUsersDisplayService.nameOf_ApUserProfileDisplay('first')} sortable />
            <Column header="Last Name" headerStyle={{width: '12em'}} field={APSystemUsersDisplayService.nameOf_ApUserProfileDisplay('last')}  sortable />
        </DataTable>
      </div>
    );
  }

  return (
    <div className="manage-users">

      <APComponentHeader header={`Search & Select Existing User:`} />

      {(managedObjectList.length > 0 || (managedObjectList.length === 0 && globalFilter && globalFilter !== '')) && 
        renderManagedObjectDataTable()
      }

    </div>
  );
}
