
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

import { 
  ApsUsersService, 
  APSUser,
  APSUserReplace,
  EAPSAuthRole
} from '@solace-iot-team/apim-server-openapi-browser';

import { APComponentHeader } from "../../../components/APComponentHeader/APComponentHeader";
import { Organization, AdministrationService } from '@solace-iot-team/apim-connector-openapi-browser';
import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { APSClientOpenApi } from "../../../utils/APSClientOpenApi";
import { APSOpenApiFormValidationRules } from "../../../utils/APSOpenApiFormValidationRules";
import { TAPRbacRole, TAPRbacRoleList } from "../../../utils/APRbac";
import { APClientConnectorOpenApi } from "../../../utils/APClientConnectorOpenApi";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { TAPOrganizationId } from "../../../components/APComponentsCommon";
import { ConfigHelper } from "../../../components/ConfigContextProvider/ConfigHelper";
import { ConfigContext } from "../../../components/ConfigContextProvider/ConfigContextProvider";
import { E_CALL_STATE_ACTIONS, TManagedObjectId } from "./ManageUsersCommon";

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
  onError: (apiCallState: TApiCallState) => void;
  onNewSuccess: (apiCallState: TApiCallState, newUserId: TManagedObjectId, newDisplayName: string) => void;
  onEditSuccess: (apiCallState: TApiCallState, updatedDisplayName?: string) => void;
  onCancel: () => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const EditNewUser: React.FC<IEditNewUserProps> = (props: IEditNewUserProps) => {
  const componentName = 'EditNewUser';

  type TReplaceApiObject = APSUserReplace;
  type TCreateApiObject = APSUser;
  type TGetApiObject = APSUser;
  type TManagedObject = APSUser;
  type TManagedObjectFormData = APSUser;
  type TOrganizationSelectItem = { label: string, value: TAPOrganizationId };
  type TManagedObjectFormDataOrganizationSelectItems = Array<TOrganizationSelectItem>;
  type TRoleSelectItem = { label: string, value: EAPSAuthRole };
  type TManagedObjectFormDataRoleSelectItems = Array<TRoleSelectItem>;

  const emptyManagedObject: TManagedObject = {
    userId: '',
    isActivated: false,
    password: '',
    profile: {
      first: '',
      last: '',
      email: ''
    },
    roles: [],
    memberOfOrganizations: []
  }

  const [createdManagedObjectId, setCreatedManagedObjectId] = React.useState<TManagedObjectId>();
  const [createdManagedObjectDisplayName, setCreatedManagedObjectDisplayName] = React.useState<string>();
  const [updatedManagedObjectDisplayName, setUpdatedManagedObjectDisplayName] = React.useState<string>();
  const [managedObject, setManagedObject] = React.useState<TManagedObject>();  
  const [managedObjectFormData, setManagedObjectFormData] = React.useState<TManagedObjectFormData>();
  const [availableOrganizationList, setAvailableOrganizationList] = React.useState<Array<Organization>>();  
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const [configContext, dispatchConfigContextAction] = React.useContext(ConfigContext);
  const managedObjectUseForm = useForm<TManagedObjectFormData>();


  const transformGetApiObjectToManagedObject = (getApiObject: TGetApiObject): TManagedObject => {
    return getApiObject;
  }

  const transformManagedObjectToReplaceApiObject = (managedObject: TManagedObject): TReplaceApiObject => {
    return managedObject;
  }

  const transformManagedObjectToCreateApiObject = (managedObject: TManagedObject): TCreateApiObject => {
    return managedObject;
  }

  const createManagedObjectFormDataRoleSelectItems = (): TManagedObjectFormDataRoleSelectItems => {
    const rbacRoleList: TAPRbacRoleList = ConfigHelper.getSortedRbacRoleList(configContext);
    let selectItems: TManagedObjectFormDataRoleSelectItems = [];
    rbacRoleList.forEach( (rbacRole: TAPRbacRole) => {
      selectItems.push({
        label: rbacRole.displayName,
        value: rbacRole.role
      });
    });
    return selectItems; 
  }

  const createManagedObjectFormDataOrganizationSelectItems = (availableOrganizationList?: Array<Organization>): TManagedObjectFormDataOrganizationSelectItems => {
    let selectItems: TManagedObjectFormDataOrganizationSelectItems = [];
    if(!availableOrganizationList) return selectItems;
    availableOrganizationList.forEach( (availableOrganization: Organization) => {
      selectItems.push({
        label: availableOrganization.name,
        value: availableOrganization.name
      })
    });
    return selectItems.sort( (e1: TOrganizationSelectItem, e2: TOrganizationSelectItem) => {
      if(e1.label < e2.label) return -1;
      if(e1.label > e2.label) return 1;
      return 0;
    });
  }

  const transformManagedObjectToFormData = (managedObject: TManagedObject): TManagedObjectFormData => {
    return managedObject;
  }

  const transformFormDataToManagedObject = (formData: TManagedObjectFormData): TManagedObject => {
    return {
      ...formData,
      userId: formData.profile.email
    }
  }

  // * Api Calls *
  const apiGetManagedObject = async(managedObjectId: TManagedObjectId): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObject';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_USER, `retrieve details for user: ${managedObjectId}`);
    try { 
      const apsUser: APSUser = await ApsUsersService.getApsUser(managedObjectId);
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
      await ApsUsersService.replaceApsUser(managedObjectId, transformManagedObjectToReplaceApiObject(managedObject));
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
      const createdApiObject: APSUser = await ApsUsersService.createApsUser(transformManagedObjectToCreateApiObject(managedObject));
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
    await apiGetAvailableOrganizations();
    props.onLoadingChange(false);
  }

  React.useEffect(() => {
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

  const doPopulateManagedObjectFormDataValues = (managedObjectFormData: TManagedObjectFormData) => {
    managedObjectUseForm.setValue('userId', managedObjectFormData.userId);
    managedObjectUseForm.setValue('password', managedObjectFormData.password);
    managedObjectUseForm.setValue('isActivated', managedObjectFormData.isActivated);
    managedObjectUseForm.setValue('roles', managedObjectFormData.roles);
    managedObjectUseForm.setValue('memberOfOrganizations', managedObjectFormData.memberOfOrganizations);
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

  const onSubmitManagedObjectForm = (managedObjectFormData: TManagedObjectFormData) => {
    doSubmitManagedObject(transformFormDataToManagedObject(managedObjectFormData));
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
        <Button type="submit" label={getSubmitButtonLabel()} icon="pi pi-save" className="p-button-text p-button-plain p-button-outlined" />
      </React.Fragment>
    );
  }

  const renderManagedObjectFormFooter = (): JSX.Element => {
    return (
      <Toolbar className="p-mb-4" right={managedObjectFormFooterRightToolbarTemplate} />
    )
  }

  const renderManagedObjectForm = () => {
    const funcName = 'renderManagedObjectForm';
    const logName = `${componentName}.${funcName}()`;
    const isNewUser: boolean = (props.action === EAction.NEW);
    return (
      <div className="card">
        <div className="p-fluid">
          <form onSubmit={managedObjectUseForm.handleSubmit(onSubmitManagedObjectForm, onInvalidSubmitManagedObjectForm)} className="p-fluid">           
            {/* E-mail */}
            <div className="p-field">
              <span className="p-float-label p-input-icon-right">
                <i className="pi pi-envelope" />
                <Controller
                  name="profile.email"
                  control={managedObjectUseForm.control}
                  rules={APSOpenApiFormValidationRules.APSEmail_ValidationRules()}
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
            {/* Roles */}
            <div className="p-field">
              <span className="p-float-label">
                <Controller
                  name="roles"
                  control={managedObjectUseForm.control}
                  rules={{
                    required: "Choose at least 1 role."
                  }}
                  render={( { field, fieldState }) => {
                      // console.log(`${logName}: field=${JSON.stringify(field)}, fieldState=${JSON.stringify(fieldState)}`);
                      return(
                        <MultiSelect
                          display="chip"
                          value={field.value ? [...field.value] : []} 
                          options={createManagedObjectFormDataRoleSelectItems()} 
                          onChange={(e) => field.onChange(e.value)}
                          optionLabel="label"
                          optionValue="value"
                          // style={{width: '500px'}} 
                          className={classNames({ 'p-invalid': fieldState.invalid })}                       
                        />
                  )}}
                />
                <label htmlFor="roles" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.roles })}>Roles*</label>
              </span>
              {displayManagedObjectFormFieldErrorMessage4Array(managedObjectUseForm.formState.errors.roles)}
            </div>
            {/* MemberOf Organizations */}
            <div className="p-field">
              <span className="p-float-label">
                <Controller
                  name="memberOfOrganizations"
                  control={managedObjectUseForm.control}
                  render={( { field, fieldState }) => {
                      // console.log(`${logName}: field=${JSON.stringify(field)}, fieldState=${JSON.stringify(fieldState)}`);
                      // console.log(`${logName}: field.value=${JSON.stringify(field.value)}`);
                      // console.log(`${logName}: availableOrganizationList=${JSON.stringify(availableOrganizationList)}`);
                      // console.log(`${logName}: selectItems = ${JSON.stringify(createManagedObjectFormDataOrganizationSelectItems(availableOrganizationList))}`);
                      if(availableOrganizationList && availableOrganizationList.length > 0) {
                        return(
                          <MultiSelect
                            display="chip"
                            value={field.value ? field.value : []} 
                            options={createManagedObjectFormDataOrganizationSelectItems(availableOrganizationList)} 
                            onChange={(e) => field.onChange(e.value)}
                            optionLabel="label"
                            optionValue="value"
                            // style={{width: '500px'}} 
                            className={classNames({ 'p-invalid': fieldState.invalid })}                       
                          />
                        );
                      } else {
                        return(
                          <InputText
                            id={field.name}
                            {...field}
                            value='no organizations configured'
                            disabled={true}
                          />
                        );
                      }
                    }}
                />
                <label htmlFor="memberOfOrganizations" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.memberOfOrganizations })}>Member of Organizations</label>
              </span>
              {displayManagedObjectFormFieldErrorMessage4Array(managedObjectUseForm.formState.errors.memberOfOrganizations)}
            </div>
            {/* isActivated */}
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
            <Divider />
            {renderManagedObjectFormFooter()}
          </form>  
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
