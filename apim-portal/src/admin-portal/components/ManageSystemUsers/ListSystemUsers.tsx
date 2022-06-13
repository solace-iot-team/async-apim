
import React from "react";
// import { useHistory } from "react-router-dom";

import { InputText } from "primereact/inputtext";
import { DataTable, DataTableSortOrderType } from "primereact/datatable";
import { Column } from "primereact/column";
// import { Button } from "primereact/button";
import { MenuItem } from "primereact/api";

import APEntityIdsService, { TAPEntityId } from "../../../utils/APEntityIdsService";
import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import APSystemUsersDisplayService, { 
  TAPSystemUserDisplay, TAPSystemUserDisplayListResponse 
} from "../../../displayServices/APUsersDisplayService/APSystemUsersDisplayService";
import { TAPUserDisplayLazyLoadingTableParameters } from "../../../displayServices/APUsersDisplayService/APUsersDisplayService";
import { E_CALL_STATE_ACTIONS } from "./ManageSystemUsersCommon";
import { APSClientOpenApi } from "../../../utils/APSClientOpenApi";
import { APComponentHeader } from "../../../components/APComponentHeader/APComponentHeader";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
// import { RenderWithRbac } from "../../../auth/RenderWithRbac";
// import { EUIAdminPortalResourcePaths, EUICommonResourcePaths } from "../../../utils/Globals";
// import { TAPUserLoginCredentials } from "../../../displayServices/APUsersDisplayService/APLoginUsersDisplayService";
// import { UserContext } from "../../../components/APContextProviders/APUserContextProvider";

import '../../../components/APComponents.css';
import "./ManageSystemUsers.css";

export interface IListSystemUsersProps {
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
  onManagedObjectEdit: (managedObjectEntityId: TAPEntityId) => void;
  onManagedObjectDelete: (managedObjectEntityId: TAPEntityId) => void;
  onManagedObjectView: (managedObjectEntityId: TAPEntityId) => void;
  setBreadCrumbItemList: (itemList: Array<MenuItem>) => void;
}

export const ListSystemUsers: React.FC<IListSystemUsersProps> = (props: IListSystemUsersProps) => {
  const componentName = 'ListSystemUsers';

  type TManagedObject = TAPSystemUserDisplay;
  type TManagedObjectList = Array<TManagedObject>;

  const MessageNoManagedObjectsFoundCreateNew = 'No Users found - create a new user.';
  const MessageNoManagedObjectsFoundWithFilter = 'No Users found for filter';
  const GlobalSearchPlaceholder = 'Enter search word list separated by <space> ...';

  // const loginAsHistory = useHistory<TAPUserLoginCredentials>();
  const [selectedManagedObject, setSelectedManagedObject] = React.useState<TManagedObject>();
  const [managedObjectList, setManagedObjectList] = React.useState<TManagedObjectList>([]);  
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  // const [userContext] = React.useContext(UserContext);

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
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_USER_LIST, 'retrieve list of users');
    try {
      // TEST Error
      // throw new Error(`${logName}: testing error handling`);
      const apSystemUserDisplayListResponse: TAPSystemUserDisplayListResponse = await APSystemUsersDisplayService.apsGetList_ApSystemUserDisplayListResponse({
        pageSize: pageSize,
        pageNumber: pageNumber,
        apSortFieldName: sortFieldName,
        sortDirection: sortDirection,
        searchWordList: searchWordList
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

  // const onLoginAs = (mo: TManagedObject) => {
  //   const pwd: string = APSystemUsersDisplayService.get_ApUserAuthenticationDisplay({ apUserDisplay: mo }).password;
  //   loginAsHistory.push( { 
  //     pathname: EUICommonResourcePaths.Login,
  //     state: {
  //       username: mo.apEntityId.id,
  //       password: pwd
  //     }
  //   });
  // }

  const onManagedObjectSelect = (event: any): void => {
    setSelectedManagedObject(event.data);
  }

  const onManagedObjectOpen = (event: any): void => {
    const managedObject: TManagedObject = event.data as TManagedObject;
    props.onManagedObjectView(managedObject.apEntityId);
  }

  const onInputGlobalFilter = (event: React.FormEvent<HTMLInputElement>) => {
    const _globalFilter: string | undefined = event.currentTarget.value !== '' ? event.currentTarget.value : undefined;
    setGlobalFilter(_globalFilter);
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
    else return MessageNoManagedObjectsFoundCreateNew;
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

  const isActiveBodyTemplate = (mo: TManagedObject): JSX.Element => {
    if(APSystemUsersDisplayService.get_isActivated({ apUserDisplay: mo })) return (<span className="pi pi-check badge-active" />)
    else return (<span className="pi pi-times badge-active" />)
  }

  const systemRolesBodyTemplate = (mo: TManagedObject): string => {
    if(mo.apSystemRoleEntityIdList.length === 0) return 'None.';
    return APEntityIdsService.getSortedDisplayNameList_As_String(mo.apSystemRoleEntityIdList);
  }

  const organizationsBodyTemplate = (mo: TManagedObject): string => {
    if(mo.apMemberOfOrganizationDisplayList.length === 0) return 'None.';
    return APEntityIdsService.create_SortedDisplayNameList_From_ApDisplayObjectList(mo.apMemberOfOrganizationDisplayList).join(', ');
  }

  // const actionBodyTemplate = (mo: TManagedObject): JSX.Element => {
  //   const isLoginAsEnabled: boolean = userContext.apLoginUserDisplay.apEntityId.id !== mo.apEntityId.id;
  //   return (
  //     <React.Fragment>
  //       {APSystemUsersDisplayService.get_isActivated({ apUserDisplay: mo }) &&
  //         <RenderWithRbac resourcePath={EUIAdminPortalResourcePaths.LoginAs} >
  //           <Button 
  //             tooltip="login as ..." 
  //             icon="pi pi-sign-in" 
  //             className="p-button-rounded p-button-outlined p-button-secondary" 
  //             onClick={() => onLoginAs(mo)} 
  //             disabled={!isLoginAsEnabled}
  //           />
  //         </RenderWithRbac>  
  //       } 
  //     </React.Fragment>
  //   );
  // }

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
          onRowDoubleClick={(e) => onManagedObjectOpen(e)}
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
          <Column header="Activated?" headerStyle={{width: '9em', textAlign: 'center'}} field={APSystemUsersDisplayService.nameOf_ApUserActivationDisplay('isActivated')}  bodyStyle={{textAlign: 'center' }} body={isActiveBodyTemplate} sortable />
          <Column header="E-Mail" field={APSystemUsersDisplayService.nameOf_ApUserProfileDisplay('email')}  sortable />
          <Column header="System Roles" headerStyle={{width: '12em'}} body={systemRolesBodyTemplate} field={APSystemUsersDisplayService.nameOf_ApSystemUserDisplay('apMemberOfOrganizationDisplayList')} sortable />
          <Column header="Organizations" headerStyle={{width: '20em'}} body={organizationsBodyTemplate} />

          <Column header="First Name" headerStyle={{width: '12em'}} field={APSystemUsersDisplayService.nameOf_ApUserProfileDisplay('first')} sortable />
          <Column header="Last Name" headerStyle={{width: '12em'}} field={APSystemUsersDisplayService.nameOf_ApUserProfileDisplay('last')}  sortable />

          {/* <Column headerStyle={{width: '8em'}} body={actionBodyTemplate} bodyStyle={{textAlign: 'right', verticalAlign: 'top'}}/> */}

        </DataTable>
      </div>
    );
  }

  return (
    <div className="manage-users">

      <APComponentHeader header='Users:' />

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      {(managedObjectList.length > 0 || (managedObjectList.length === 0 && globalFilter && globalFilter !== '')) && 
        renderManagedObjectDataTable()
      }

      {/* DEBUG */}
      {/* {managedObjectList.length > 0 && selectedManagedObject && 
        <pre style={ { fontSize: '12px' }} >
          {JSON.stringify(selectedManagedObject, null, 2)}
        </pre>
      } */}

    </div>
  );
}
