
import React from "react";
import { useForm, Controller, FieldError } from 'react-hook-form';

import { InputText } from 'primereact/inputtext';
import { MultiSelect } from 'primereact/multiselect';
import { Checkbox } from 'primereact/checkbox';
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { Divider } from "primereact/divider";
import { classNames } from 'primereact/utils';


import { 
  AppResponse, 
  AppsService, 
  AppPatch,
  App
} from '@solace-iot-team/platform-api-openapi-client-fe';

import { 
  APSUserId
} from '@solace-iot-team/apim-server-openapi-browser';

import { APClientConnectorOpenApi } from "../../../utils/APClientConnectorOpenApi";
import { APConnectorFormValidationRules } from "../../../utils/APConnectorOpenApiFormValidationRules";
import { APComponentHeader } from "../../../components/APComponentHeader/APComponentHeader";
import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { TAPOrganizationId } from "../../../components/APComponentsCommon";
import { 
  E_CALL_STATE_ACTIONS, 
  DeveloperPortalManageUserAppsCommon, 
  TManagedObjectId, 
} from "./DeveloperPortalManageUserAppsCommon";

import '../../../components/APComponents.css';
import "./DeveloperPortalManageUserApps.css";

export enum EAction {
  EDIT = 'EDIT',
  NEW = 'NEW'
}
export interface IDeveloperPortalNewEditUserAppProps {
  action: EAction,
  organizationId: TAPOrganizationId,
  userId: APSUserId,
  appId?: TManagedObjectId,
  appDisplayName?: string,
  onError: (apiCallState: TApiCallState) => void;
  onNewSuccess: (apiCallState: TApiCallState, newUserId: TManagedObjectId, newDisplayName: string) => void;
  onEditSuccess: (apiCallState: TApiCallState, updatedDisplayName?: string) => void;
  onCancel: () => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const DeveloperPortalNewEditUserApp: React.FC<IDeveloperPortalNewEditUserAppProps> = (props: IDeveloperPortalNewEditUserAppProps) => {
  const componentName = 'DeveloperPortalNewEditUserApp';

  type TUpdateApiObject = AppPatch;
  type TCreateApiObject = App;
  type TGetApiObject = AppResponse;
  type TManagedObject = {
    apiObject: AppResponse
  }
  type TManagedObjectFormData = TManagedObject;
  // type TOrganizationSelectItem = { label: string, value: TAPOrganizationId };
  // type TManagedObjectFormDataOrganizationSelectItems = Array<TOrganizationSelectItem>;
  // type TRoleSelectItem = { label: string, value: EAPSAuthRole };
  // type TManagedObjectFormDataRoleSelectItems = Array<TRoleSelectItem>;

  const emptyManagedObject: TManagedObject = {
    apiObject: {
      name: '',
      apiProducts: [],
      credentials: {
        expiresAt: -1
      }
    }
  }

  const [createdManagedObjectId, setCreatedManagedObjectId] = React.useState<TManagedObjectId>();
  const [createdManagedObjectDisplayName, setCreatedManagedObjectDisplayName] = React.useState<string>();
  const [updatedManagedObjectDisplayName, setUpdatedManagedObjectDisplayName] = React.useState<string>();
  const [managedObject, setManagedObject] = React.useState<TManagedObject>();  
  const [managedObjectFormData, setManagedObjectFormData] = React.useState<TManagedObjectFormData>();
  // const [availableOrganizationList, setAvailableOrganizationList] = React.useState<Array<Organization>>();  
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  // const [configContext, dispatchConfigContextAction] = React.useContext(ConfigContext);
  const managedObjectUseForm = useForm<TManagedObjectFormData>();


  const transformGetApiObjectToManagedObject = (getApiObject: TGetApiObject): TManagedObject => {
    return {
      apiObject: {
        ...getApiObject,
        displayName: getApiObject.displayName ? getApiObject.displayName : getApiObject.name
      }
    }
  }

  const transformManagedObjectToUpdateApiObject = (managedObject: TManagedObject): TUpdateApiObject => {
    return {
      ...managedObject.apiObject
    }
  }

  const transformManagedObjectToCreateApiObject = (managedObject: TManagedObject): TCreateApiObject => {
    return {
      ...managedObject.apiObject
    }
  }

  // const createManagedObjectFormDataRoleSelectItems = (): TManagedObjectFormDataRoleSelectItems => {
  //   const rbacRoleList: TAPRbacRoleList = ConfigHelper.getSortedRbacRoleList(configContext);
  //   let selectItems: TManagedObjectFormDataRoleSelectItems = [];
  //   rbacRoleList.forEach( (rbacRole: TAPRbacRole) => {
  //     selectItems.push({
  //       label: rbacRole.displayName,
  //       value: rbacRole.role
  //     });
  //   });
  //   return selectItems; 
  // }

  // const createManagedObjectFormDataOrganizationSelectItems = (availableOrganizationList?: Array<Organization>): TManagedObjectFormDataOrganizationSelectItems => {
  //   let selectItems: TManagedObjectFormDataOrganizationSelectItems = [];
  //   if(!availableOrganizationList) return selectItems;
  //   availableOrganizationList.forEach( (availableOrganization: Organization) => {
  //     selectItems.push({
  //       label: availableOrganization.name,
  //       value: availableOrganization.name
  //     })
  //   });
  //   return selectItems.sort( (e1: TOrganizationSelectItem, e2: TOrganizationSelectItem) => {
  //     if(e1.label < e2.label) return -1;
  //     if(e1.label > e2.label) return 1;
  //     return 0;
  //   });
  // }

  const transformManagedObjectToFormData = (managedObject: TManagedObject): TManagedObjectFormData => {
    return managedObject;
  }

  const transformFormDataToManagedObject = (formData: TManagedObjectFormData): TManagedObject => {
    return {
      ...formData
    }
  }

  // * Api Calls *
  const apiGetManagedObject = async(orgId: TAPOrganizationId, userId: APSUserId, appId: TManagedObjectId, appDisplayName: string): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObject';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_USER_APP, `retrieve details for app: ${appDisplayName}`);
    try { 
      const apiUserApp: AppResponse = await AppsService.getDeveloperApp(orgId, userId, appId, "smf");
      setManagedObject(transformGetApiObjectToManagedObject(apiUserApp));
    } catch(e: any) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const apiUpdateManagedObject = async(orgId: TAPOrganizationId, userId: APSUserId, appId: TManagedObjectId, appDisplayName: string, managedObject: TManagedObject): Promise<TApiCallState> => {
    const funcName = 'apiUpdateManagedObject';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_UPDATE_USER_APP, `update app: ${appDisplayName}`);
    try { 
      await AppsService.updateDeveloperApp(orgId, userId, appId, transformManagedObjectToUpdateApiObject(managedObject));
      if(appDisplayName !== managedObject.apiObject.displayName) setUpdatedManagedObjectDisplayName(managedObject.apiObject.displayName);      
    } catch(e: any) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const apiCreateManagedObject = async(orgId: TAPOrganizationId, userId: APSUserId, managedObject: TManagedObject): Promise<TApiCallState> => {
    const funcName = 'apiCreateManagedObject';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_CREATE_USER_APP, `create app: ${managedObject.apiObject.displayName}`);
    try { 
      const createdApiObject: App = await AppsService.createDeveloperApp(orgId, userId, transformManagedObjectToCreateApiObject(managedObject));
      setCreatedManagedObjectId(createdApiObject.name);
      setCreatedManagedObjectDisplayName(createdApiObject.displayName);      
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
      if(!props.appId || !props.appDisplayName) throw new Error(`${logName}: action=${props.action} - one or more props undefined, props=${JSON.stringify(props)}`);
      await apiGetManagedObject(props.organizationId, props.userId, props.appId, props.appDisplayName);
    } else {
      setManagedObject(emptyManagedObject);
    }
    // await apiGetAvailableOrganizations();
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
      else if(props.action === EAction.NEW && apiCallStatus.context.action === E_CALL_STATE_ACTIONS.API_CREATE_USER_APP) {
        if(!createdManagedObjectId) throw new Error(`${logName}: createdManagedObjectId is undefined`);
        if(!createdManagedObjectDisplayName) throw new Error(`${logName}: createdManagedObjectDisplayName is undefined`);
        props.onNewSuccess(apiCallStatus, createdManagedObjectId, createdManagedObjectDisplayName);
      }  
      else if(props.action === EAction.EDIT && apiCallStatus.context.action === E_CALL_STATE_ACTIONS.API_UPDATE_USER_APP) {
        props.onEditSuccess(apiCallStatus, updatedManagedObjectDisplayName);
      }
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const doPopulateManagedObjectFormDataValues = (managedObjectFormData: TManagedObjectFormData) => {
    managedObjectUseForm.setValue('apiObject.name', managedObjectFormData.apiObject.name);  
    managedObjectUseForm.setValue('apiObject.displayName', managedObjectFormData.apiObject.displayName);  


    // managedObjectUseForm.setValue('userId', managedObjectFormData.userId);
    // managedObjectUseForm.setValue('password', managedObjectFormData.password);
    // managedObjectUseForm.setValue('isActivated', managedObjectFormData.isActivated);
    // managedObjectUseForm.setValue('roles', managedObjectFormData.roles);
    // managedObjectUseForm.setValue('memberOfOrganizations', managedObjectFormData.memberOfOrganizations);
    // managedObjectUseForm.setValue('profile.first', managedObjectFormData.profile.first);
    // managedObjectUseForm.setValue('profile.last', managedObjectFormData.profile.last);
    // managedObjectUseForm.setValue('profile.email', managedObjectFormData.profile.email);
  }

  const doSubmitManagedObject = async (managedObject: TManagedObject) => {
    const funcName = 'doSubmitManagedObject';
    const logName = `${componentName}.${funcName}()`;
    props.onLoadingChange(true);
    if(props.action === EAction.NEW) await apiCreateManagedObject(props.organizationId, props.userId, managedObject);
    else {
      if(!props.appId || !props.appDisplayName) throw new Error(`${logName}: action=${props.action} - one or more props undefined, props=${JSON.stringify(props)}`);
      await apiUpdateManagedObject(props.organizationId, props.userId, props.appId, props.appDisplayName, managedObject);
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
    const isNew: boolean = (props.action === EAction.NEW);
    return (
      <div className="card">
        <div className="p-fluid">
          <form onSubmit={managedObjectUseForm.handleSubmit(onSubmitManagedObjectForm, onInvalidSubmitManagedObjectForm)} className="p-fluid">           
            {/* Id */}
            <div className="p-field">
              <span className="p-float-label p-input-icon-right">
                <i className="pi pi-key" />
                <Controller
                  name="apiObject.name"
                  control={managedObjectUseForm.control}
                  rules={APConnectorFormValidationRules.Name()}
                  render={( { field, fieldState }) => {
                      return(
                        <InputText
                          id={field.name}
                          {...field}
                          autoFocus={isNew}
                          disabled={!isNew}
                          className={classNames({ 'p-invalid': fieldState.invalid })}                       
                        />
                  )}}
                />
                <label htmlFor="apiObject.name" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.apiObject?.name })}>Id*</label>
              </span>
              {displayManagedObjectFormFieldErrorMessage(managedObjectUseForm.formState.errors.apiObject?.name)}
            </div>
            {/* DisplayName */}
            <div className="p-field">
              <span className="p-float-label p-input-icon-right">
                {/* <i className="pi pi-envelope" /> */}
                <Controller
                  name="apiObject.displayName"
                  control={managedObjectUseForm.control}
                  rules={APConnectorFormValidationRules.DisplayName()}
                  render={( { field, fieldState }) => {
                      // console.log(`field=${field.name}, fieldState=${JSON.stringify(fieldState)}`);
                      return(
                        <InputText
                          id={field.name}
                          {...field}
                          autoFocus={!isNew}
                          className={classNames({ 'p-invalid': fieldState.invalid })}                       
                        />
                  )}}
                />
                <label htmlFor="apiObject.displayName" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.apiObject?.displayName })}>Display Name*</label>
              </span>
              {displayManagedObjectFormFieldErrorMessage(managedObjectUseForm.formState.errors.apiObject?.displayName)}
            </div>
            {/* API Products */}
            {/* <div className="p-field">
              <span className="p-float-label">
                <Controller
                  name="roles"
                  control={managedObjectUseForm.control}
                  rules={{
                    required: "Choose at least 1 role."
                  }}
                  render={( { field, fieldState }) => {
                      console.log(`${logName}: field=${JSON.stringify(field)}, fieldState=${JSON.stringify(fieldState)}`);
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
            </div> */}
            <Divider />
            {renderManagedObjectFormFooter()}
          </form>  
        </div>
      </div>
    );
  }
  
  return (
    <div className="apd-manageuserapps">

      {props.action === EAction.NEW && 
        <APComponentHeader header='Create App:' />
      }

      {props.action === EAction.EDIT && 
        <APComponentHeader header={`Edit App: ${props.appId}`} />
      }

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      {managedObject && 
        renderManagedObjectForm()
      }
    </div>
  );
}
