
import React from "react";
import { useHistory } from 'react-router-dom';

import { DataTable, DataTableSortOrderType } from 'primereact/datatable';
import { Column } from "primereact/column";
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { MenuItem } from "primereact/api";

import { 
  EAPSSortDirection, 
} from "../../../_generated/@solace-iot-team/apim-server-openapi-browser";

import { APComponentHeader } from "../../../components/APComponentHeader/APComponentHeader";
import { EUICommonResourcePaths, EUIAdminPortalResourcePaths, Globals } from "../../../utils/Globals";
import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { APSClientOpenApi } from "../../../utils/APSClientOpenApi";
import { APComponentsCommon } from "../../../components/APComponentsCommon";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { TUserLoginCredentials } from "../../../components/UserLogin/UserLogin";
import { RenderWithRbac } from "../../../auth/RenderWithRbac";
import { E_CALL_STATE_ACTIONS } from "./ManageOrganizationUsersCommon";
import { 
  TAPUserDisplayLazyLoadingTableParameters, 
} from "../../../displayServices/APUsersDisplayService/APUsersDisplayService";


import APEntityIdsService, { TAPEntityId } from "../../../utils/APEntityIdsService";
import APAssetsDisplayService from "../../../displayServices/APAssetsDisplayService";
import APOrganizationUsersDisplayService, { 
  TAPOrganizationUserDisplay, 
  TAPOrganizationUserDisplayListResponse 
} from "../../../displayServices/APUsersDisplayService/APOrganizationUsersDisplayService";

import '../../../components/APComponents.css';
import "./ManageOrganizationUsers.css";

export interface IListOrganizationUsersProps {
  organizationEntityId: TAPEntityId;
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
  onManagedObjectEdit: (managedObjectEntityId: TAPEntityId) => void;
  onManagedObjectDelete: (managedObjectEntityId: TAPEntityId) => void;
  onManagedObjectView: (managedObjectEntityId: TAPEntityId) => void;
  setBreadCrumbItemList: (itemList: Array<MenuItem>) => void;
}

export const ListOrganizationUsers: React.FC<IListOrganizationUsersProps> = (props: IListOrganizationUsersProps) => {
  const componentName = 'ListOrganizationUsers';

  const MessageNoManagedObjectsFoundCreateNew = 'No Users found - create a new user.';
  const MessageNoManagedObjectsFoundWithFilter = 'No Users found for filter';
  const GlobalSearchPlaceholder = 'Enter search word list separated by <space> ...';

  type TManagedObject = TAPOrganizationUserDisplay;
  type TManagedObjectList = Array<TManagedObject>;

  const loginAsHistory = useHistory<TUserLoginCredentials>();
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
    sortField: APOrganizationUsersDisplayService.nameOf_ApUserProfileDisplay('email'),
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
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_USER_LIST, 'retrieve list of users');
    try {
      const apOrganizationUserDisplayListResponse: TAPOrganizationUserDisplayListResponse = await APOrganizationUsersDisplayService.apsGetList_ApOrganizationUserDisplayListResponse({
        organizationEntityId: props.organizationEntityId,
        pageSize: pageSize,
        pageNumber: pageNumber,
        apSortFieldName: sortFieldName,
        sortDirection: sortDirection,
        searchWordList: searchWordList,
      });
      setManagedObjectList(apOrganizationUserDisplayListResponse.apOrganizationUserDisplayList);
      setLazyLoadingTableTotalRecords(apOrganizationUserDisplayListResponse.meta.totalCount);
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
    // const funcName = 'useEffect([])';
    // const logName = `${componentName}.${funcName}()`;
    // console.log(`${logName}: mounting ...`);
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

  const onManagedObjectOpen = (event: any): void => {
    const managedObject: TManagedObject = event.data as TManagedObject;
    props.onManagedObjectView(managedObject.apEntityId);
  }

  const onInputGlobalFilter = (event: React.FormEvent<HTMLInputElement>) => {
    const _globalFilter: string | undefined = event.currentTarget.value !== '' ? event.currentTarget.value : undefined;
    setGlobalFilter(_globalFilter);
  }
 
  const onLoginAs = (mo: TManagedObject) => {
    loginAsHistory.push( { 
      pathname: EUICommonResourcePaths.Login,
      state: {
        userId: mo.apEntityId.id,
        userPwd: mo.apUserAuthenticationDisplay.password,
      }
    });
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
        <React.Fragment>
          {mo.apUserAuthenticationDisplay.isActivated === true &&
            <RenderWithRbac resourcePath={EUIAdminPortalResourcePaths.LoginAs} >
              <Button tooltip="login as ..." icon="pi pi-sign-in" className="p-button-rounded p-button-outlined p-button-secondary" 
                onClick={() => onLoginAs(mo)} 
              />
            </RenderWithRbac>  
          } 
        </React.Fragment>
    );
  }

  const assetsBodyTemplate = (mo: TManagedObject) => {
    const numAssets = APAssetsDisplayService.getNumberOfAssetsForAllOrganizations(mo.apOrganizationAssetInfoDisplayList);
    if(numAssets > 0) {
      return (`${numAssets}`);
    } else {
      return ('-');
    }
  }

  const businessGroupsBodyTemplate = (mo: TManagedObject) => {
    return APEntityIdsService.create_DisplayNameList(APOrganizationUsersDisplayService.create_ApBusinessGroupEntityIdList_From_ApMemberOfBusinessGroupDisplayList({
      apMemberOfBusinessGroupDisplayList: mo.apMemberOfOrganizationBusinessGroupsDisplay.apMemberOfBusinessGroupDisplayList
    })).join(', ');
  }

  const isActiveBodyTemplate = (mo: TManagedObject): JSX.Element => {
    if(mo.apUserAuthenticationDisplay.isActivated) return (<span className="pi pi-check badge-active" />)
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
    cols.push(<Column key={Globals.getUUID()} header="Activated?" headerStyle={{width: '9em', textAlign: 'center'}} field={APOrganizationUsersDisplayService.nameOf_ApUserAuthenticationDisplay('isActivated')}  bodyStyle={{textAlign: 'center' }} body={isActiveBodyTemplate} sortable />);
    cols.push(<Column key={Globals.getUUID()} header="E-Mail" field={APOrganizationUsersDisplayService.nameOf_ApUserProfileDisplay('email')}  sortable />);
    cols.push(<Column key={Globals.getUUID()} header="Business Groups" headerStyle={{width: '20em'}} body={businessGroupsBodyTemplate} />);  
    cols.push(<Column key={Globals.getUUID()} header="First Name" headerStyle={{width: '12em'}} field={APOrganizationUsersDisplayService.nameOf_ApUserProfileDisplay('first')} sortable />);
    cols.push(<Column key={Globals.getUUID()} header="Last Name" headerStyle={{width: '12em'}} field={APOrganizationUsersDisplayService.nameOf_ApUserProfileDisplay('last')}  sortable />);
    cols.push(<Column key={Globals.getUUID()} header="Assets" headerStyle={{width: '5em'}} body={assetsBodyTemplate} bodyStyle={{textAlign: 'center', verticalAling: 'top'}} />);
    cols.push(<Column key={Globals.getUUID()} headerStyle={{width: '8em'}} body={actionBodyTemplate} bodyStyle={{textAlign: 'right', verticalAlign: 'top'}}/>);
    return cols;
  }
  const renderManagedObjectDataTable = () => {
    return (
      <div className="card p-mt-4">
          <DataTable
            ref={dt}
            // autoLayout={true}
            header={renderDataTableHeader()}
            value={managedObjectList}
            selectionMode="single"
            selection={selectedManagedObject}
            onRowClick={onManagedObjectSelect}
            onRowDoubleClick={(e) => onManagedObjectOpen(e)}
            scrollable 
            scrollHeight="800px" 
            dataKey="id"  
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
