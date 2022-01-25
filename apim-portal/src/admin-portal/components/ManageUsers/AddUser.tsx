
import React from "react";

import { MenuItem } from "primereact/api";
import { InputText } from "primereact/inputtext";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";

import { 
  ApsUsersService, 
  EAPSSortDirection,
  ListApsUsersResponse,
  APSUserList,
  APSOrganizationIdList,
  APSOrganizationRoles,
  APSOrganizationRolesList,
  EAPSOrganizationAuthRole
} from "../../../_generated/@solace-iot-team/apim-server-openapi-browser";
import { CommonName } from "@solace-iot-team/apim-connector-openapi-browser";

import { APComponentHeader } from "../../../components/APComponentHeader/APComponentHeader";
import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { APSClientOpenApi } from "../../../utils/APSClientOpenApi";
import { ConfigContext } from '../../../components/ConfigContextProvider/ConfigContextProvider';
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { E_CALL_STATE_ACTIONS, ManageUsersCommon, TManagedObjectId, TViewManagedObject } from "./ManageUsersCommon";
import { APComponentsCommon, TAPLazyLoadingTableParameters } from "../../../components/APComponentsCommon";

import '../../../components/APComponents.css';
import "./ManageUsers.css";

export interface IAddUserProps {
  organizationId: CommonName; 
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState, addedUserId: TManagedObjectId, addedDisplayName: string) => void;
  onCancel: () => void;
  onLoadingChange: (isLoading: boolean) => void;
  setBreadCrumbItemList: (itemList: Array<MenuItem>) => void;
}

export const AddUser: React.FC<IAddUserProps> = (props: IAddUserProps) => {
  const componentName = 'AddUser';

  type TManagedObject = TViewManagedObject;
  type TManagedObjectList = Array<TManagedObject>;

  const MessageNoManagedObjectsFoundWithFilter = 'No Users found for filter';
  const GlobalSearchPlaceholder = 'Search for user e-mail ...';

  const [configContext] = React.useContext(ConfigContext); 
  const [selectedManagedObject, setSelectedManagedObject] = React.useState<TManagedObject>();
  const [managedObjectList, setManagedObjectList] = React.useState<TManagedObjectList>([]);  
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);

  const lazyLoadingTableRowsPerPageOptions: Array<number> = [10,20,50,100];
  const [lazyLoadingTableParams, setLazyLoadingTableParams] = React.useState<TAPLazyLoadingTableParameters>({
    isInitialSetting: true,
    first: 0, // index of the first row to be displayed
    rows: lazyLoadingTableRowsPerPageOptions[0], // number of rows to display per page
    page: 0,
    sortField: 'apiObject.profile.email',
    sortOrder: 1
  });
  const [lazyLoadingTableTotalRecords, setLazyLoadingTableTotalRecords] = React.useState<number>(0);
  const [lazyLoadingTableIsLoading, setLazyLoadingTableIsLoading] = React.useState<boolean>(false);
  // const [isGetManagedObjectListInProgress, setIsGetManagedObjectListInProgress] = React.useState<boolean>(false); 
  const [globalFilter, setGlobalFilter] = React.useState<string>();
  const dataTableRef = React.useRef<any>(null);

  const apiGetManagedObjectListPage = async(pageSize: number, pageNumber: number, sortFieldName: string, sortDirection: EAPSSortDirection, searchWordList?: string): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObjectListPage';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_USER_LIST, 'retrieve list of users');
    try { 
      const listApsUsersResponse: ListApsUsersResponse = await ApsUsersService.listApsUsers({
        pageSize: pageSize,
        pageNumber: pageNumber,
        sortFieldName: sortFieldName,
        sortDirection: sortDirection,
        searchUserId: searchWordList,
        excludeSearchOrganizationId: props.organizationId,
        searchIsActivated: true
      });
      const totalCount: number = listApsUsersResponse.meta.totalCount;
      const apsUserList: APSUserList = listApsUsersResponse.list;
      let _managedObjectList: TManagedObjectList = [];
      for(const apsUser of apsUserList) {
        _managedObjectList.push(ManageUsersCommon.transformViewApiObjectToViewManagedObject(configContext, apsUser, []));
      }
      setManagedObjectList(_managedObjectList);
      setLazyLoadingTableTotalRecords(totalCount);
    } catch(e: any) {
      APSClientOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const apiAddManagedObjectToOrgId = async(): Promise<TApiCallState> => {
    const funcName = 'apiAddManagedObjectToOrgId';
    const logName = `${componentName}.${funcName}()`;
    if(!selectedManagedObject) throw new Error(`${logName}: selectedManagedObject is undefined`);
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_ADD_USER_TO_ORG, `add user ${selectedManagedObject.apiObject.userId} to org ${props.organizationId}`);
    try {
      // TODO: must come from form ...
      const newMemberOfOrganizationRoles: APSOrganizationRoles = {
        organizationId: props.organizationId,
        roles: [EAPSOrganizationAuthRole.ORGANIZATION_ADMIN, EAPSOrganizationAuthRole.LOGIN_AS, EAPSOrganizationAuthRole.API_TEAM, EAPSOrganizationAuthRole.API_CONSUMER]
      }
      await ApsUsersService.updateApsUser({
        userId: selectedManagedObject.apiObject.userId,
        requestBody: {
          memberOfOrganizations: ManageUsersCommon.addMemberOfOrganizationRoles(selectedManagedObject.apiObject.memberOfOrganizations, newMemberOfOrganizationRoles)
        }
      });
    } catch(e: any) {
      APSClientOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const doLoadPage = async () => {
    // const funcName = 'doLoadPage';
    // const logName = `${componentName}.${funcName}()`;
    // console.log(`${logName}: loading ...`);
    props.onLoadingChange(true);
    setLazyLoadingTableIsLoading(true);
    const pageNumber: number = lazyLoadingTableParams.page + 1;
    const pageSize: number = lazyLoadingTableParams.rows;
    const sortFieldName: string = ManageUsersCommon.transformTableSortFieldNameToApiSortFieldName(lazyLoadingTableParams.sortField);
    const sortDirection: EAPSSortDirection  = APComponentsCommon.transformTableSortDirectionToApiSortDirection(lazyLoadingTableParams.sortOrder);
    const searchWordList: string | undefined = globalFilter;
    await apiGetManagedObjectListPage(pageSize, pageNumber, sortFieldName, sortDirection, searchWordList);
    setLazyLoadingTableIsLoading(false);
    props.onLoadingChange(false);
  }

  const addSelectedUser = async() => {
    props.onLoadingChange(true);
    await apiAddManagedObjectToOrgId();
    props.onLoadingChange(false);
  }
  // * useEffect Hooks *

  React.useEffect(() => {
    props.setBreadCrumbItemList([{
      label: `Add User`
    }]);
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    doLoadPage();
  }, [lazyLoadingTableParams, globalFilter]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    const funcName = 'useEffect(apiCallStatus]';
    const logName = `${componentName}.${funcName}()`;
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
      else if(apiCallStatus.context.action === E_CALL_STATE_ACTIONS.API_ADD_USER_TO_ORG) {
        if(!selectedManagedObject) throw new Error(`${logName}: selectedManagedObject is undefined`);
        props.onSuccess(apiCallStatus, selectedManagedObject.id, selectedManagedObject.displayName);
      }
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  // * Data Table *

  const onAddSelectedUser = () => {
    addSelectedUser();
  }
  const onManagedObjectSelect = (event: any): void => {
    setSelectedManagedObject(event.data);
  }  
  const onInputGlobalFilter = (event: React.FormEvent<HTMLInputElement>) => {
    const _globalFilter: string | undefined = event.currentTarget.value !== '' ? event.currentTarget.value : undefined;
    setGlobalFilter(_globalFilter);
  }

  const renderDataTableHeader = (): JSX.Element => {
    return (
      <div className="table-header">
        <div style={{ whiteSpace: "nowrap"}}>
          <Button type="button" label="Add" className="p-button-text p-button-plain p-button-outlined p-mr-2" onClick={onAddSelectedUser} disabled={selectedManagedObject===undefined} />
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
            // onRowDoubleClick={(e) => onManagedObjectOpen(e)}
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
            {/* <Column header="DEBUG: Activated?" headerStyle={{width: '9em', textAlign: 'center'}} field="apiObject.isActivated"  bodyStyle={{textAlign: 'center' }} body={ManageUsersCommon.isActiveBodyTemplate} sortable /> */}
            <Column header="E-Mail" field="apiObject.profile.email" sortable />
            <Column header="Roles" headerStyle={{width: '25em'}} field="roleDisplayNameListAsString"  />
            <Column header="First Name" headerStyle={{width: '15em'}} field="apiObject.profile.first" sortable />
            <Column header="Last Name" headerStyle={{width: '15em'}} field="apiObject.profile.last"  sortable />
            {/* <Column header="DEBUG: Organizations" headerStyle={{width: '12em'}} field="memberOfOrganizationNameListAsString" /> */}

        </DataTable>
      </div>
    );
  }

  return (
    <div className="manage-users">

      <APComponentHeader header={`Search & select existing User:`} 
        notes="Note that the user will have the same roles in all organizations."
      />

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
