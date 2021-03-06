
import React from "react";

import { DataTable, DataTableSortOrderType } from 'primereact/datatable';
import { Column } from "primereact/column";
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Divider } from "primereact/divider";
import { MenuItem } from "primereact/api";

import APEntityIdsService, { TAPEntityId } from "../../../../utils/APEntityIdsService";
import { ApiCallState, TApiCallState } from "../../../../utils/ApiCallState";
import APSystemUsersDisplayService, { TAPSystemUserDisplay, TAPSystemUserDisplayListResponse } from "../../../../displayServices/APUsersDisplayService/APSystemUsersDisplayService";
import { TAPUserDisplayLazyLoadingTableParameters } from "../../../../displayServices/APUsersDisplayService/APUsersDisplayService";
import { APSClientOpenApi } from "../../../../utils/APSClientOpenApi";
import { Globals } from "../../../../utils/Globals";
import { APComponentHeader } from "../../../../components/APComponentHeader/APComponentHeader";
import { ApiCallStatusError } from "../../../../components/ApiCallStatusError/ApiCallStatusError";
import APMemberOfService, { TAPMemberOfOrganizationDisplay } from "../../../../displayServices/APUsersDisplayService/APMemberOfService";
import { E_CALL_STATE_ACTIONS_USERS } from "../ManageOrganizationsCommon";

import '../../../../components/APComponents.css';
import "../ManageOrganizations.css";

export interface IListSystemOrganizationUsersProps {
  organizationEntityId: TAPEntityId;
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
  onManagedObjectEdit: (managedObjectEntityId: TAPEntityId) => void;
  // onUserSelect: (userEntityId: TAPEntityId) => void;
  setBreadCrumbItemList: (itemList: Array<MenuItem>) => void;
}

export const ListSystemOrganizationUsers: React.FC<IListSystemOrganizationUsersProps> = (props: IListSystemOrganizationUsersProps) => {
  const ComponentName = 'ListSystemOrganizationUsers';

  type TManagedObject = TAPSystemUserDisplay;
  type TManagedObjectList = Array<TManagedObject>;

  const MessageNoManagedObjectsFoundCreateNew = 'No Users found.';
  const MessageNoManagedObjectsFoundWithFilter = 'No Users found for filter';
  const GlobalSearchPlaceholder = 'Enter search word list separated by <space> ...';

  const [managedObjectList, setManagedObjectList] = React.useState<TManagedObjectList>([]);  
  const [selectedManagedObject, setSelectedManagedObject] = React.useState<TManagedObject>();
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  // * Lazy Loading * 
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
  const dt = React.useRef<any>(null);

  // * Api Calls *
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
      const apSystemUserDisplayListResponse: TAPSystemUserDisplayListResponse = await APSystemUsersDisplayService.apsGetList_ApSystemUserDisplayListResponse({
        pageSize: pageSize,
        pageNumber: pageNumber,
        apSortFieldName: sortFieldName,
        sortDirection: sortDirection,
        searchWordList: searchWordList,
        organizationEntityId: props.organizationEntityId,
        includeOrganizationRoles: true
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

  React.useEffect(() => {
    props.setBreadCrumbItemList([]);
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */


  React.useEffect(() => {
    doLoadPage();
  }, [lazyLoadingTableParams, globalFilter]); /* eslint-disable-line react-hooks/exhaustive-deps */

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

  const onManagedObjectEdit_From_Click = (event: any): void => {
    const mo: TManagedObject = event.data as TManagedObject;
    onManagedObjectEdit(mo);
  }

  const onManagedObjectEdit = (mo: TManagedObject): void => {
    props.onManagedObjectEdit(mo.apEntityId);
  }

  const onInputGlobalFilter = (event: React.FormEvent<HTMLInputElement>) => {
    const _globalFilter: string | undefined = event.currentTarget.value !== '' ? event.currentTarget.value : undefined;
    setGlobalFilter(_globalFilter);
  }
 
  const renderDataTableHeader = (): JSX.Element => {
    return (
      <div className="table-header">
        <div className="table-header-container" />
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText type="search" placeholder={GlobalSearchPlaceholder} onInput={onInputGlobalFilter} style={{width: '500px'}}/>
          {/* <InputText type="search" placeholder={GlobalSearchPlaceholder} onKeyUp={onKeyupGlobalFilter} onInput={onInputGlobalFilter} style={{width: '500px'}}/> */}
          {/* <Button tooltip="go search" icon="pi pi-search" className="p-button-text p-button-plain p-button-outlined p-mr-2" onClick={onGlobalSearch} /> */}
        </span>
      </div>
    );
  }

  const actionBodyTemplate = (mo: TManagedObject) => {
    return (
        <Button 
          label='Edit Roles'
          // tooltip="edit roles ..." 
          icon="pi pi-pencil" 
          className="p-button-rounded p-button-outlined p-button-secondary" 
          onClick={() => onManagedObjectEdit(mo)} 
        />
    );
  }

  const systemRolesBodyTemplate = (mo: TManagedObject): string => {
    if(mo.apSystemRoleEntityIdList.length === 0) return 'None.';
    return APEntityIdsService.getSortedDisplayNameList_As_String(mo.apSystemRoleEntityIdList);
  }

  const organizationRolesBodyTemplate = (mo: TManagedObject): string => {
    if(mo.apMemberOfOrganizationDisplayList.length === 0) return 'None.';
    // find this organization
    const apMemberOfOrganizationDisplay: TAPMemberOfOrganizationDisplay = APMemberOfService.get_ApMemberOfOrganizationDisplay({
      organizationId: props.organizationEntityId.id,
      apMemberOfOrganizationDisplayList: mo.apMemberOfOrganizationDisplayList
    });
    if(apMemberOfOrganizationDisplay.apOrganizationRoleEntityIdList.length === 0) return 'None.';
    return APEntityIdsService.getSortedDisplayNameList_As_String(apMemberOfOrganizationDisplay.apOrganizationRoleEntityIdList);
  }

  const isActiveBodyTemplate = (mo: TManagedObject): JSX.Element => {
    if(mo.apUserActivationDisplay.isActivated) return (<span className="pi pi-check badge-active" />)
    else return (<span className="pi pi-times badge-active" />)
  }

  const onPageSelect = (event: any) => {
    const _lazyParams = { ...lazyLoadingTableParams, isInitialSetting: false, ...event };
    setLazyLoadingTableParams(_lazyParams);
  }

  const onSort = (event: any) => {
    // const funcName = 'onSort';
    // const logName = `${componentName}.${funcName}()`;
    // console.log(`${logName}: event = ${JSON.stringify(event, null, 2)}`);
    const _lazyParams = { ...lazyLoadingTableParams, isInitialSetting: false, ...event };
    setLazyLoadingTableParams(_lazyParams);
  }

  const renderManagedObjectTableEmptyMessage = () => {
    if(globalFilter && globalFilter !== '') return `${MessageNoManagedObjectsFoundWithFilter}: ${globalFilter}`;
    else return MessageNoManagedObjectsFoundCreateNew;
  }

  const renderColumns = (): Array<JSX.Element> => {
    const cols: Array<JSX.Element> = [];
    cols.push(<Column key={Globals.getUUID()} header="Activated?" headerStyle={{width: '9em', textAlign: 'center'}} field={APSystemUsersDisplayService.nameOf_ApUserActivationDisplay('isActivated')}  bodyStyle={{textAlign: 'center' }} body={isActiveBodyTemplate} sortable />);
    cols.push(<Column key={Globals.getUUID()} header="E-Mail" field={APSystemUsersDisplayService.nameOf_ApUserProfileDisplay('email')}  sortable />);

    cols.push(<Column key={Globals.getUUID()} header="System Roles" headerStyle={{width: '12em'}} body={systemRolesBodyTemplate} field={APSystemUsersDisplayService.nameOf_ApSystemUserDisplay('apMemberOfOrganizationDisplayList')} sortable />);  
    cols.push(<Column key={Globals.getUUID()} header="Organization Roles" headerStyle={{width: '12em'}} body={organizationRolesBodyTemplate} />);  

    cols.push(<Column key={Globals.getUUID()} header="First Name" headerStyle={{width: '12em'}} field={APSystemUsersDisplayService.nameOf_ApUserProfileDisplay('first')} sortable />);
    cols.push(<Column key={Globals.getUUID()} header="Last Name" headerStyle={{width: '12em'}} field={APSystemUsersDisplayService.nameOf_ApUserProfileDisplay('last')}  sortable />);
    cols.push(<Column key={Globals.getUUID()} headerStyle={{width: '12em'}} body={actionBodyTemplate} bodyStyle={{textAlign: 'right', verticalAlign: 'top'}}/>);
    return cols;
  }
  const renderManagedObjectDataTable = () => {
    return (
      <div className="card p-mt-4">
          <DataTable
            ref={dt}
            autoLayout={true}
            header={renderDataTableHeader()}
            value={managedObjectList}
            selectionMode="single"
            selection={selectedManagedObject}
            onRowClick={onManagedObjectSelect}
            onRowDoubleClick={(e) => onManagedObjectEdit_From_Click(e)}
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
            {renderColumns()}
        </DataTable>
      </div>
    );
  }

  return (
    <div className="manage-users">

      <APComponentHeader header='Organization Users:' />

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      {(managedObjectList.length > 0 || (managedObjectList.length === 0 && globalFilter && globalFilter !== '')) && 
        renderManagedObjectDataTable()
      }

      { managedObjectList.length === 0 &&
        <React.Fragment>
          <Divider />
          {MessageNoManagedObjectsFoundCreateNew}
          <Divider />
        </React.Fragment>
      }

    </div>
  );
}
