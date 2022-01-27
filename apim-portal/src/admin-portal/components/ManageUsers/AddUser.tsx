
import React from "react";
import { useForm, Controller, FieldError } from 'react-hook-form';

import { MenuItem } from "primereact/api";
import { InputText } from "primereact/inputtext";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { MultiSelect } from "primereact/multiselect";
import { classNames } from "primereact/utils";

import { 
  ApsUsersService, 
  EAPSSortDirection,
  ListApsUsersResponse,
  APSUserList,
  APSOrganizationIdList,
  APSOrganizationRoles,
  APSOrganizationRolesList,
  EAPSOrganizationAuthRole,
  APSOrganizationAuthRoleList
} from "../../../_generated/@solace-iot-team/apim-server-openapi-browser";
import { CommonName } from "@solace-iot-team/apim-connector-openapi-browser";

import { APComponentHeader } from "../../../components/APComponentHeader/APComponentHeader";
import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { APSClientOpenApi } from "../../../utils/APSClientOpenApi";
import { ConfigContext } from '../../../components/ConfigContextProvider/ConfigContextProvider';
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { E_CALL_STATE_ACTIONS, E_COMPONENT_STATE_ADD_USER, ManageUsersCommon, TManagedObjectId, TViewManagedObject } from "./ManageUsersCommon";
import { APComponentsCommon, TAPLazyLoadingTableParameters } from "../../../components/APComponentsCommon";
import { ConfigHelper, TRoleSelectItemList } from "../../../components/ConfigContextProvider/ConfigHelper";

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

  type TComponentState = {
    previousState: E_COMPONENT_STATE_ADD_USER,
    currentState: E_COMPONENT_STATE_ADD_USER
  }
  const initialComponentState: TComponentState = {
    previousState: E_COMPONENT_STATE_ADD_USER.UNDEFINED,
    currentState: E_COMPONENT_STATE_ADD_USER.UNDEFINED
  }
  const setNewComponentState = (newState: E_COMPONENT_STATE_ADD_USER) => {
    setComponentState({
      previousState: componentState.currentState,
      currentState: newState
    });
  }
  const setPreviousComponentState = () => {
    setComponentState({
      previousState: componentState.currentState,
      currentState: componentState.previousState
    });
  }

  type TManagedObject = TViewManagedObject;
  type TManagedObjectList = Array<TManagedObject>;

  const MessageNoManagedObjectsFoundWithFilter = 'No Users found for filter';
  const GlobalSearchPlaceholder = 'Search for user e-mail ...';

  const [componentState, setComponentState] = React.useState<TComponentState>(initialComponentState);
  const [showListComponent, setShowListComponent] = React.useState<boolean>(false);
  const [showEditRolesComponent, setShowEditRolesComponent] = React.useState<boolean>(false);
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

  const apiAddManagedObjectToOrgId = async(mo: TManagedObject): Promise<TApiCallState> => {
    const funcName = 'apiAddManagedObjectToOrgId';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_ADD_USER_TO_ORG, `add user ${mo.apiObject.userId} to org ${props.organizationId}`);
    try {
      await ApsUsersService.updateApsUser({
        userId: mo.apiObject.userId,
        requestBody: {
          memberOfOrganizations: mo.apiObject.memberOfOrganizations
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

  // * useEffect Hooks *

  React.useEffect(() => {
    props.setBreadCrumbItemList([{
      label: `Add User`
    }]);
    setNewComponentState(E_COMPONENT_STATE_ADD_USER
      .MANAGED_OBJECT_LIST_VIEW);
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    calculateShowStates(componentState);
  }, [componentState]); /* eslint-disable-line react-hooks/exhaustive-deps */

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

  const calculateShowStates = (componentState: TComponentState) => {
    if(!componentState.currentState) {
      setShowListComponent(false);
      setShowEditRolesComponent(false);
    }
    else if(componentState.currentState === E_COMPONENT_STATE_ADD_USER.MANAGED_OBJECT_LIST_VIEW) {
      setShowListComponent(true);
      setShowEditRolesComponent(false);
    }
    else if( componentState.currentState === E_COMPONENT_STATE_ADD_USER.MANAGED_OBJECT_EDIT_ROLES) {
      setShowListComponent(true);
      setShowEditRolesComponent(true);
    }
  }

  // * Data Table *

  const onManagedObjectSelect = (event: any): void => {
    setSelectedManagedObject(event.data);
  }
  const onSelectedManagedObjectEditRolesFromToolbar = () => {
    const funcName = 'onSelectedManagedObjectEditRolesFromToolbar';
    const logName = `${componentName}.${funcName}()`;
    if(!selectedManagedObject) throw new Error(`${logName}: selectedManagedObject is undefined`);
    setNewComponentState(E_COMPONENT_STATE_ADD_USER.MANAGED_OBJECT_EDIT_ROLES);
  }
  const onSelectedManagedObjectEditRoles = (event: any): void => {
    setSelectedManagedObject(event.data);
    setNewComponentState(E_COMPONENT_STATE_ADD_USER.MANAGED_OBJECT_EDIT_ROLES);
  }
  const onInputGlobalFilter = (event: React.FormEvent<HTMLInputElement>) => {
    const _globalFilter: string | undefined = event.currentTarget.value !== '' ? event.currentTarget.value : undefined;
    setGlobalFilter(_globalFilter);
  }

  const renderDataTableHeader = (): JSX.Element => {
    return (
      <div className="table-header">
        <div style={{ whiteSpace: "nowrap"}}>
          <Button type="button" label="Add" className="p-button-text p-button-plain p-button-outlined p-mr-2" onClick={onSelectedManagedObjectEditRolesFromToolbar} disabled={selectedManagedObject===undefined} />
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
            onRowDoubleClick={(e) => onSelectedManagedObjectEditRoles(e)}
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
            <Column header="First Name" headerStyle={{width: '25em'}} field="apiObject.profile.first" sortable />
            <Column header="Last Name" headerStyle={{width: '25em'}} field="apiObject.profile.last"  sortable />
            {/* <Column header="DEBUG: Organizations" headerStyle={{width: '12em'}} field="memberOfOrganizationNameListAsString" /> */}

        </DataTable>
      </div>
    );
  }

  // * Edit Roles Dialog *

  type TManagedObjectFormData = {
    managedObject: TManagedObject;
    roles: APSOrganizationAuthRoleList;
  }    
  const formId = componentName;
  const organizationRolesSelectItemList: TRoleSelectItemList = ConfigHelper.createOrganizationRolesSelectItems(configContext);
  const managedObjectUseForm = useForm<TManagedObjectFormData>();
  const [managedObjectFormData, setManagedObjectFormData] = React.useState<TManagedObjectFormData>();
  
  const transformManagedObjectToFormData = (mo: TManagedObject): TManagedObjectFormData => {
    const fd: TManagedObjectFormData = {
      managedObject: mo,
      roles: []
    }
    return fd;
  }

  const transformFormDataToManagedObject = (formData: TManagedObjectFormData): TManagedObject => {
    const newMemberOfOrganizationRoles: APSOrganizationRoles = {
      organizationId: props.organizationId,
      roles: formData.roles
    }
    const mo: TManagedObject = {
      ...formData.managedObject,
      apiObject: {
        ...formData.managedObject.apiObject,
        memberOfOrganizations: ManageUsersCommon.addMemberOfOrganizationRoles(formData.managedObject.apiObject.memberOfOrganizations, newMemberOfOrganizationRoles)
      }
    }
    return mo;
  }

  React.useEffect(() => {
    if(selectedManagedObject) {
      setManagedObjectFormData(transformManagedObjectToFormData(selectedManagedObject));
    }
  }, [selectedManagedObject]) /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(managedObjectFormData) doPopulateManagedObjectFormDataValues(managedObjectFormData);
  }, [managedObjectFormData]) /* eslint-disable-line react-hooks/exhaustive-deps */

  const doPopulateManagedObjectFormDataValues = (mofd: TManagedObjectFormData) => {
    managedObjectUseForm.setValue('managedObject', mofd.managedObject);
    managedObjectUseForm.setValue('roles', mofd.roles);
  }

  const onEditDialogRolesCancel = () => {
    setPreviousComponentState();
  }

  const doSubmitManagedObject = async(mo: TManagedObject) => {
    props.onLoadingChange(true);
    await apiAddManagedObjectToOrgId(mo);
    props.onLoadingChange(false);
  }

  const onSubmitManagedObjectForm = (newFormData: TManagedObjectFormData) => {
    doSubmitManagedObject(transformFormDataToManagedObject(newFormData));
  }

  const displayManagedObjectFormFieldErrorMessage4Array = (fieldErrorList: Array<FieldError | undefined> | undefined) => {
    let _fieldError: any = fieldErrorList;
    return _fieldError && <small className="p-error">{_fieldError.message}</small>;
  }

  const renderManagedObjectEditRolesDialog = () => {
    const funcName = 'renderManagedObjectEditRolesDialog';
    const logName = `${componentName}.${funcName}()`;

    const renderDialogFooter = (): JSX.Element => {
      return (
        <React.Fragment>
          <Button type="button" label="Cancel" className="p-button-text p-button-plain p-mr-2" onClick={onEditDialogRolesCancel} />
          <Button key={componentName+'Add'} form={formId} type="submit" label="Add" icon="pi pi-plus" className="p-button-text p-button-plain p-button-outlined" />
        </React.Fragment>
      );
    } 
    const renderDialogContent = (): JSX.Element => {
      return (
        <React.Fragment>
          <p>Assign roles for <b>{selectedManagedObject?.displayName}</b> in the organization.</p>
          <div className="card p-mt-6">
            <div className="p-fluid">
              <form id={formId} onSubmit={managedObjectUseForm.handleSubmit(onSubmitManagedObjectForm)} className="p-fluid">        
                <div className="p-field" style={{ width: '100%' }} >
                  <span className="p-float-label">
                    <Controller
                      name="roles"
                      control={managedObjectUseForm.control}
                      rules={{
                        required: "Choose at least 1 Role."
                      }}
                      render={( { field, fieldState }) => {
                      return(
                        <MultiSelect
                          display="chip"
                          value={field.value ? [...field.value] : []} 
                          options={organizationRolesSelectItemList} 
                          onChange={(e) => { field.onChange(e.value); }}
                          optionLabel="label"
                          optionValue="value"
                          className={classNames({ 'p-invalid': fieldState.invalid })}                       
                        />
                      )}}
                    />
                    <label htmlFor="roles" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.roles })}>Role(s)*</label>
                  </span>
                  { displayManagedObjectFormFieldErrorMessage4Array(managedObjectUseForm.formState.errors.roles) }
                </div>
              </form>   
            {/* DEBUG */}
            {/* <p>selectedOrganizationRolesList:</p>
              <pre style={ { fontSize: '10px' }} >
              {JSON.stringify(selectedOrganizationRolesList, null, 2)}
            </pre> */}
            </div>
          </div>
        </React.Fragment>
      );
    }

    if(!selectedManagedObject) throw new Error(`${logName}: selectedManagedObject is undefined`);

    const dialogHeader = 'Assign Roles';
    return (
      <Dialog
        className="p-fluid"
        visible={showEditRolesComponent} 
        style={{ width: '70%' }} 
        header={dialogHeader}
        modal
        closable={false}
        footer={renderDialogFooter()}
        onHide={()=> {}}
      >
        <div className="confirmation-content">
          {renderDialogContent()}
        </div>
        <ApiCallStatusError apiCallStatus={apiCallStatus} />
      </Dialog>
    );
  } 

  return (
    <div className="manage-users">

      <APComponentHeader header={`Search & Select Existing User:`} />

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      {showListComponent && (managedObjectList.length > 0 || (managedObjectList.length === 0 && globalFilter && globalFilter !== '')) && 
        renderManagedObjectDataTable()
      }

      {showEditRolesComponent &&
        renderManagedObjectEditRolesDialog()
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
