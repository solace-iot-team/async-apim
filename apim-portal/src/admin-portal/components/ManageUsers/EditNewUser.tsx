
import React from "react";
import { useForm, Controller, FieldError } from 'react-hook-form';

import { InputText } from 'primereact/inputtext';
import { MultiSelect } from 'primereact/multiselect';
import { Checkbox } from 'primereact/checkbox';
import { Password } from "primereact/password";
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { Divider } from "primereact/divider";
import { classNames } from 'primereact/utils';
import { MenuItem } from "primereact/api";
import { Panel, PanelHeaderTemplateOptions } from "primereact/panel";

import { 
  ApsUsersService, 
  APSUser,
  APSUserReplace,
  APSOrganizationRolesList,
} from "../../../_generated/@solace-iot-team/apim-server-openapi-browser";

import { APComponentHeader } from "../../../components/APComponentHeader/APComponentHeader";
import { Organization, AdministrationService, CommonName } from '@solace-iot-team/apim-connector-openapi-browser';
import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { APSClientOpenApi } from "../../../utils/APSClientOpenApi";
import { APSOpenApiFormValidationRules } from "../../../utils/APSOpenApiFormValidationRules";
import { EAPRbacRoleScope, EAPSCombinedAuthRole, TAPRbacRole, TAPRbacRoleList } from "../../../utils/APRbac";
import { APClientConnectorOpenApi } from "../../../utils/APClientConnectorOpenApi";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { ConfigHelper } from "../../../components/ConfigContextProvider/ConfigHelper";
import { ConfigContext } from "../../../components/ConfigContextProvider/ConfigContextProvider";
import { E_CALL_STATE_ACTIONS, TManagedObjectId } from "./ManageUsersCommon";
import { APManageUserOrganizations } from "../../../components/APManageUserOrganizations/APManageUserOrganizations";

import '../../../components/APComponents.css';
import "./ManageUsers.css";

export enum EAction {
  EDIT = 'EDIT',
  NEW = 'NEW'
}
export interface IEditNewUserProps {
  action: EAction,
  userId?: TManagedObjectId;
  userDisplayName?: string;
  organizationId?: CommonName;
  onError: (apiCallState: TApiCallState) => void;
  onNewSuccess: (apiCallState: TApiCallState, newUserId: TManagedObjectId, newDisplayName: string) => void;
  onEditSuccess: (apiCallState: TApiCallState, updatedDisplayName?: string) => void;
  onCancel: () => void;
  onLoadingChange: (isLoading: boolean) => void;
  setBreadCrumbItemList: (itemList: Array<MenuItem>) => void;
}

export const EditNewUser: React.FC<IEditNewUserProps> = (props: IEditNewUserProps) => {
  const componentName = 'EditNewUser';

  type TReplaceApiObject = APSUserReplace;
  type TCreateApiObject = APSUser;
  type TGetApiObject = APSUser;
  type TManagedObject = APSUser;
  type TManagedObjectFormData = APSUser;
  type TRoleSelectItem = { label: string, value: EAPSCombinedAuthRole };
  type TManagedObjectFormDataRoleSelectItems = Array<TRoleSelectItem>;

  const [configContext] = React.useContext(ConfigContext);

  const transformGetApiObjectToManagedObject = (getApiObject: TGetApiObject): TManagedObject => {
    return getApiObject;
  }

  const transformManagedObjectToReplaceApiObject = (mo: TManagedObject): TReplaceApiObject => {
    return {
      isActivated: mo.isActivated,
      password: mo.password,
      profile: mo.profile,
      memberOfOrganizations: mo.memberOfOrganizations,
      systemRoles: mo.systemRoles,
    }
  }

  const transformManagedObjectToCreateApiObject = (managedObject: TManagedObject): TCreateApiObject => {
    return managedObject;
  }

  const createManagedObjectFormDataSystemRoleSelectItems = (): TManagedObjectFormDataRoleSelectItems => {
    const rbacScopeList: Array<EAPRbacRoleScope> = [EAPRbacRoleScope.SYSTEM];
    const rbacRoleList: TAPRbacRoleList = ConfigHelper.getSortedAndScopedRbacRoleList(configContext, rbacScopeList);
    const selectItems: TManagedObjectFormDataRoleSelectItems = [];
    rbacRoleList.forEach( (rbacRole: TAPRbacRole) => {
      selectItems.push({
        label: rbacRole.displayName,
        value: rbacRole.id
      });
    });
    return selectItems; 
  }

  const transformManagedObjectToFormData = (mo: TManagedObject): TManagedObjectFormData => {
    const fd: TManagedObjectFormData = {
      ...mo,
    }
    return fd;
  }

  const transformFormDataToManagedObject = (formData: TManagedObjectFormData): TManagedObject => {
    const mo: TManagedObject = {
      ...formData,
      userId: formData.profile.email,
    }
    if(props.action === EAction.NEW && props.organizationId !== undefined) {
      mo.isActivated = true;
      // mo.memberOfOrganizations = [props.organizationId];
    }
    return mo;
  }

  const emptyManagedObject: TManagedObject = {
    userId: '',
    isActivated: false,
    password: '',
    profile: {
      first: '',
      last: '',
      email: ''
    },
    systemRoles: [],
    memberOfOrganizations: [],
  }
  
  const systemRolesSelectItemList = createManagedObjectFormDataSystemRoleSelectItems();

  const [createdManagedObjectId, setCreatedManagedObjectId] = React.useState<TManagedObjectId>();
  const [createdManagedObjectDisplayName, setCreatedManagedObjectDisplayName] = React.useState<string>();
  const [updatedManagedObjectDisplayName, setUpdatedManagedObjectDisplayName] = React.useState<string>();
  const [managedObject, setManagedObject] = React.useState<TManagedObject>();  
  const [managedObjectFormData, setManagedObjectFormData] = React.useState<TManagedObjectFormData>();
  const [availableOrganizationList, setAvailableOrganizationList] = React.useState<Array<Organization>>();  
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const managedObjectUseForm = useForm<TManagedObjectFormData>();
  const formId = componentName;


  // * Api Calls *
  const apiGetManagedObject = async(managedObjectId: TManagedObjectId): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObject';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_USER, `retrieve details for user: ${managedObjectId}`);
    try { 
      const apsUser: APSUser = await ApsUsersService.getApsUser({
        userId: managedObjectId
      });
      setManagedObject(transformGetApiObjectToManagedObject(apsUser));
    } catch(e: any) {
      APSClientOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const apiReplaceManagedObject = async(managedObjectId: TManagedObjectId, managedObject: TManagedObject): Promise<TApiCallState> => {
    const funcName = 'apiReplaceManagedObject';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_REPLACE_USER, `update user: ${managedObjectId}`);
    try { 
      await ApsUsersService.replaceApsUser({
        userId: managedObjectId, 
        requestBody: transformManagedObjectToReplaceApiObject(managedObject)
      });
      setUpdatedManagedObjectDisplayName(managedObject.userId);      
    } catch(e: any) {
      APSClientOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const apiCreateManagedObject = async(managedObject: TManagedObject): Promise<TApiCallState> => {
    const funcName = 'apiCreateManagedObject';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_CREATE_USER, `create user: ${managedObject.userId}`);
    try { 
      const createdApiObject: APSUser = await ApsUsersService.createApsUser({
        requestBody: transformManagedObjectToCreateApiObject(managedObject)
      });
      setCreatedManagedObjectId(createdApiObject.userId);
      setCreatedManagedObjectDisplayName(createdApiObject.userId);      
    } catch(e: any) {
      APSClientOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const apiGetAvailableOrganizations = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetAvailableOrganizations';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_AVAILABE_ORGANIZATIONS, 'retrieve list of organizations');
    try { 
      if(!configContext.connector) {
        setAvailableOrganizationList([]);  
        // TODO: create user message or warning to pop up and render in page
        throw new Error('cannot get list of organizations (no active connector config)');
      } else {
        const apiOrganizationList: Array<Organization> = await AdministrationService.listOrganizations({});
        setAvailableOrganizationList(apiOrganizationList);
      }
    } catch(e: any) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  // * useEffect Hooks *
  const doInitialize = async () => {
    const funcName = 'doInitialize';
    const logName = `${componentName}.${funcName}()`;
    props.onLoadingChange(true);
    if(props.action === EAction.EDIT) {
      if(!props.userId) throw new Error(`${logName}: props.userId is undefined`);
      await apiGetManagedObject(props.userId);
    } else {
      setManagedObject(emptyManagedObject);
    }
    if(!props.organizationId) await apiGetAvailableOrganizations();
    else {
      const org: Organization = {
        name: props.organizationId
      }
      setAvailableOrganizationList([org]);
    }
    props.onLoadingChange(false);
  }

  React.useEffect(() => {
    props.setBreadCrumbItemList([{
      label: (props.action === EAction.EDIT ? 'Edit' : 'Create New User')
    }]);
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(managedObject) {
      setManagedObjectFormData(transformManagedObjectToFormData(managedObject));
    }
  }, [managedObject]) /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(managedObjectFormData) doPopulateManagedObjectFormDataValues(managedObjectFormData);
  }, [managedObjectFormData]) /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    const funcName = 'useEffect[apiCallStatus]';
    const logName = `${componentName}.${funcName}()`;
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
      else if(props.action === EAction.NEW && apiCallStatus.context.action === E_CALL_STATE_ACTIONS.API_CREATE_USER) {
        if(!createdManagedObjectId) throw new Error(`${logName}: createdManagedObjectId is undefined`);
        if(!createdManagedObjectDisplayName) throw new Error(`${logName}: createdManagedObjectDisplayName is undefined`);
        props.onNewSuccess(apiCallStatus, createdManagedObjectId, createdManagedObjectDisplayName);
      }  
      else if(props.action === EAction.EDIT && apiCallStatus.context.action === E_CALL_STATE_ACTIONS.API_REPLACE_USER) {
        props.onEditSuccess(apiCallStatus, updatedManagedObjectDisplayName);
      }
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const onOrganizationRolesListUpdate = (updatedMemberOfOrganizations: APSOrganizationRolesList) => {
    const funcName = 'onOrganizationRolesListUpdate';
    const logName = `${componentName}.${funcName}()`;
    // alert(`${logName}: updatedMemberOfOrganizations=${JSON.stringify(updatedMemberOfOrganizations, null, 2)}`);

    // TODO:
    // in case of NEW: managedObjectFormData is empty
    // but form could have values
    // setting managedObjectFormData anew ==> form values are set again ==> cleared out
    // solution:
    // use externalManagedFormData with updatedMemberOfOrganizations 
    // in transform: set and get the externalManagedFormData


    if(!managedObjectFormData) throw new Error(`${logName}: managedObjectFormData is undefined`);
    const _mofd = { 
      ...managedObjectFormData,
      memberOfOrganizations: updatedMemberOfOrganizations
    };
    setManagedObjectFormData(_mofd);
  }

  const doPopulateManagedObjectFormDataValues = (managedObjectFormData: TManagedObjectFormData) => {
    managedObjectUseForm.setValue('userId', managedObjectFormData.userId);
    managedObjectUseForm.setValue('password', managedObjectFormData.password);
    managedObjectUseForm.setValue('isActivated', managedObjectFormData.isActivated);
    managedObjectUseForm.setValue('systemRoles', managedObjectFormData.systemRoles);
    // uncontrolled, managed outside form in separate component
    // managedObjectUseForm.setValue('memberOfOrganizations', managedObjectFormData.memberOfOrganizations);
    managedObjectUseForm.setValue('profile.first', managedObjectFormData.profile.first);
    managedObjectUseForm.setValue('profile.last', managedObjectFormData.profile.last);
    managedObjectUseForm.setValue('profile.email', managedObjectFormData.profile.email);
  }

  const doSubmitManagedObject = async (managedObject: TManagedObject) => {
    const funcName = 'doSubmitManagedObject';
    const logName = `${componentName}.${funcName}()`;
    props.onLoadingChange(true);
    if(props.action === EAction.NEW) await apiCreateManagedObject(managedObject);
    else {
      if(!props.userId) throw new Error(`${logName}: userId is undefined`);
      await apiReplaceManagedObject(props.userId, managedObject);
    }
    props.onLoadingChange(false);
  }

  const isMemberOfOrganizationsValid = (memberOfOrganizations: APSOrganizationRolesList | undefined): boolean => {
    if(!memberOfOrganizations) return false;
    for(const apsOrganizationRoles of memberOfOrganizations) {
      if(apsOrganizationRoles.roles.length === 0) return false;
    }
    return true;
  }
  const onSubmitManagedObjectForm = (newFormData: TManagedObjectFormData) => {
    const funcName = 'onSubmitManagedObjectForm';
    const logName = `${componentName}.${funcName}()`;
    if(!managedObjectFormData) throw new Error(`${logName}: managedObjectFormData is undefined`);
    // validate externally controlled memberOfOrganizations
    if(!isMemberOfOrganizationsValid(managedObjectFormData.memberOfOrganizations)) return false;
    const _mofd: TManagedObjectFormData = {
      ...newFormData,
      memberOfOrganizations: managedObjectFormData.memberOfOrganizations
    }
    doSubmitManagedObject(transformFormDataToManagedObject(_mofd));
  }

  const onCancelManagedObjectForm = () => {
    props.onCancel();
  }

  const onInvalidSubmitManagedObjectForm = () => {
    // setIsFormSubmitted(true);
  }

  const displayManagedObjectFormFieldErrorMessage = (fieldError: FieldError | undefined) => {
    return fieldError && <small className="p-error">{fieldError.message}</small>    
  }

  const displayManagedObjectFormFieldErrorMessage4Array = (fieldErrorList: Array<FieldError | undefined> | undefined) => {
    let _fieldError: any = fieldErrorList;
    return _fieldError && <small className="p-error">{_fieldError.message}</small>;
  }

  const managedObjectFormFooterRightToolbarTemplate = () => {
    const getSubmitButtonLabel = (): string => {
      if (props.action === EAction.NEW) return 'Create';
      else return 'Save';
    }
    return (
      <React.Fragment>
        <Button type="button" label="Cancel" className="p-button-text p-button-plain" onClick={onCancelManagedObjectForm} />
        <Button key={componentName+getSubmitButtonLabel()} form={formId} type="submit" label={getSubmitButtonLabel()} icon="pi pi-save" className="p-button-text p-button-plain p-button-outlined" />
      </React.Fragment>
    );
  }

  const renderManagedObjectFormFooter = (): JSX.Element => {
    return (
      <Toolbar className="p-mb-4" right={managedObjectFormFooterRightToolbarTemplate} />
    )
  }

  const renderManageOrganzationsRoles = (): JSX.Element => {
    const funcName = 'renderManageOrganzationsRoles';
    const logName = `${componentName}.${funcName}()`;

    const panelHeaderTemplate = (options: PanelHeaderTemplateOptions) => {
      const toggleIcon = options.collapsed ? 'pi pi-chevron-right' : 'pi pi-chevron-down';
      const className = `${options.className} p-jc-start`;
      const titleClassName = `${options.titleClassName} p-pl-1`;
      return (
        <div className={className} style={{ justifyContent: 'left'}} >
          <button className={options.togglerClassName} onClick={options.onTogglerClick}>
            <span className={toggleIcon}></span>
          </button>
          <span className={titleClassName}>
            Organizations
          </span>
        </div>
      );
    }

    const renderContent = () => {
      if(!managedObjectFormData) throw new Error(`${logName}: managedObjectFormData is undefined`);
      if(!availableOrganizationList) throw new Error(`${logName}: availableOrganizationList is undefined`);
      return (
        <APManageUserOrganizations
          formId={componentName+'_APManageUserOrganizations'}
          availableOrganizationList={availableOrganizationList}
          organizationRolesList={managedObjectFormData.memberOfOrganizations ? managedObjectFormData.memberOfOrganizations : []}
          organizationId={props.organizationId}
          onChange={onOrganizationRolesListUpdate}
        />
      );
    }
    // main
    if(props.organizationId !== undefined) return renderContent();

    return (  
      <React.Fragment>
        <Panel 
          headerTemplate={panelHeaderTemplate} 
          toggleable={true}
          // collapsed={memberOfOrganizations.length === 0}
          collapsed={false}
        >
          <React.Fragment>
            <div className='p-mb-6'/>
            {renderContent()}
          </React.Fragment>
        </Panel>
      </React.Fragment>
    );
  }

  const renderManagedObjectForm = () => {
    const isNewUser: boolean = (props.action === EAction.NEW);
    return (
      <div className="card p-mt-4">
        <div className="p-fluid">
          <form id={formId} onSubmit={managedObjectUseForm.handleSubmit(onSubmitManagedObjectForm, onInvalidSubmitManagedObjectForm)} className="p-fluid">           
            {/* E-mail */}
            <div className="p-field">
              <span className="p-float-label p-input-icon-right">
                <i className="pi pi-envelope" />
                <Controller
                  name="profile.email"
                  control={managedObjectUseForm.control}
                  rules={APSOpenApiFormValidationRules.APSEmail("Enter E-Mail.", true)}
                  render={( { field, fieldState }) => {
                      // console.log(`field=${field.name}, fieldState=${JSON.stringify(fieldState)}`);
                      return(
                        <InputText
                          id={field.name}
                          {...field}
                          autoFocus={isNewUser}
                          disabled={!isNewUser}
                          className={classNames({ 'p-invalid': fieldState.invalid })}                       
                        />
                  )}}
                />
                <label htmlFor="profile.email" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.profile?.email })}>E-Mail*</label>
              </span>
              {displayManagedObjectFormFieldErrorMessage(managedObjectUseForm.formState.errors.profile?.email)}
            </div>
            {/* Password */}
            <div className="p-field">
              <span className="p-float-label">
                <Controller
                  name="password"
                  control={managedObjectUseForm.control}
                  rules={{
                    required: "Enter Password.",
                    validate: {
                      trim: v => v.trim().length === v.length ? true : 'Enter Password without leading/trailing spaces.',
                    }
                  }}
                  render={( { field, fieldState }) => {
                      // console.log(`field=${field.name}, fieldState=${JSON.stringify(fieldState)}`);
                      return(
                        <Password
                          id={field.name}
                          toggleMask={true}
                          feedback={false}        
                          {...field}
                          className={classNames({ 'p-invalid': fieldState.invalid })}                       
                        />
                  )}}
                />
                <label htmlFor="password" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.password })}>Password*</label>
              </span>
              {displayManagedObjectFormFieldErrorMessage(managedObjectUseForm.formState.errors.password)}
            </div>
            {/* First Name */}
            <div className="p-field">
              <span className="p-float-label">
                <Controller
                  name="profile.first"
                  control={managedObjectUseForm.control}
                  rules={{
                    required: "Enter First Name.",
                    validate: {
                      trim: v => v.trim().length === v.length ? true : 'Enter First Name without leading/trailing spaces.',
                    }
                  }}
                  render={( { field, fieldState }) => {
                      // console.log(`field=${field.name}, fieldState=${JSON.stringify(fieldState)}`);
                      return(
                        <InputText
                          id={field.name}
                          {...field}
                          autoFocus={!isNewUser}
                          className={classNames({ 'p-invalid': fieldState.invalid })}                       
                        />
                  )}}
                />
                <label htmlFor="profile.first" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.profile?.first })}>First Name*</label>
              </span>
              {displayManagedObjectFormFieldErrorMessage(managedObjectUseForm.formState.errors.profile?.first)}
            </div>
            {/* Last Name */}
            <div className="p-field">
              <span className="p-float-label">
                <Controller
                  name="profile.last"
                  control={managedObjectUseForm.control}
                  rules={{
                    required: "Enter Last Name.",
                    validate: {
                      trim: v => v.trim().length === v.length ? true : 'Enter Last Name without leading/trailing spaces.',
                    }
                  }}
                  render={( { field, fieldState }) => {
                      // console.log(`field=${field.name}, fieldState=${JSON.stringify(fieldState)}`);
                      return(
                        <InputText
                          id={field.name}
                          {...field}
                          className={classNames({ 'p-invalid': fieldState.invalid })}                       
                        />
                  )}}
                />
                <label htmlFor="profile.last" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.profile?.last })}>Last Name*</label>
              </span>
              {displayManagedObjectFormFieldErrorMessage(managedObjectUseForm.formState.errors.profile?.last)}
            </div>
            {/* System Roles */}
            {props.organizationId === undefined &&
              <div className="p-field">
                <span className="p-float-label">
                  <Controller
                    name="systemRoles"
                    control={managedObjectUseForm.control}
                    render={( { field, fieldState }) => {
                        // console.log(`${logName}: field=${JSON.stringify(field)}, fieldState=${JSON.stringify(fieldState)}`);
                        return(
                          <MultiSelect
                            display="chip"
                            value={field.value ? [...field.value] : []} 
                            options={systemRolesSelectItemList} 
                            onChange={(e) => field.onChange(e.value)}
                            optionLabel="label"
                            optionValue="value"
                            // style={{width: '500px'}} 
                            className={classNames({ 'p-invalid': fieldState.invalid })}                       
                          />
                    )}}
                  />
                  <label htmlFor="systemRoles" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.systemRoles })}>System Role(s)</label>
                </span>
                {displayManagedObjectFormFieldErrorMessage4Array(managedObjectUseForm.formState.errors.systemRoles)}
              </div>
            }
            {/* isActivated */}
            {props.organizationId === undefined &&
              <div className="p-field-checkbox">
                <span>
                  <Controller
                    name="isActivated"
                    control={managedObjectUseForm.control}
                    render={( { field, fieldState }) => {
                        // console.log(`field=${JSON.stringify(field)}, fieldState=${JSON.stringify(fieldState)}`);
                        return(
                          <Checkbox
                            inputId={field.name}
                            checked={field.value}
                            onChange={(e) => field.onChange(e.checked)}                                  
                            className={classNames({ 'p-invalid': fieldState.invalid })}                       
                          />
                    )}}
                  />
                  <label htmlFor="isActivated" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.isActivated })}> Activate User</label>
                </span>
                {displayManagedObjectFormFieldErrorMessage(managedObjectUseForm.formState.errors.isActivated)}
              </div>
            }
          </form>  
          {/* Organizations & Roles */}
          <div className="p-field">
            { renderManageOrganzationsRoles() }
          </div>
          {/* footer */}
          <Divider />
          { renderManagedObjectFormFooter() }
        </div>
      </div>
    );
  }
  
  return (
    <div className="manage-users">

      {props.action === EAction.NEW && 
        <APComponentHeader header='Create User' />
      }

      {props.action === EAction.EDIT && 
        <APComponentHeader header={`Edit User: ${props.userId}`} />
      }

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      {managedObject && availableOrganizationList &&
        renderManagedObjectForm()
      }
    </div>
  );
}
