
import React from "react";
import { useForm, Controller, FieldError } from 'react-hook-form';

import { InputText } from 'primereact/inputtext';
// import { MultiSelect } from 'primereact/multiselect';
// import { Checkbox } from 'primereact/checkbox';
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { Divider } from "primereact/divider";
import { classNames } from 'primereact/utils';


import { 
  AppResponse, 
  AppsService, 
  AppPatch,
  WebHook,
  CommonName,
  CommonDisplayName,
  EnvironmentResponse,
  EnvironmentsService
} from '@solace-iot-team/apim-connector-openapi-browser';

import { 
  APSUserId
} from '@solace-iot-team/apim-server-openapi-browser';

import { APClientConnectorOpenApi } from "../../../../utils/APClientConnectorOpenApi";
import { APConnectorFormValidationRules } from "../../../../utils/APConnectorOpenApiFormValidationRules";
import { APComponentHeader } from "../../../../components/APComponentHeader/APComponentHeader";
import { ApiCallState, TApiCallState } from "../../../../utils/ApiCallState";
import { ApiCallStatusError } from "../../../../components/ApiCallStatusError/ApiCallStatusError";
import { 
  TAPOrganizationId, 
} from "../../../../components/APComponentsCommon";
import { 
  E_CALL_STATE_ACTIONS, 
  TViewManagedAppWebhookList, 
  TViewManagedWebhook 
} from "./DeveloperPortalManageUserAppWebhooksCommon";

import '../../../../components/APComponents.css';
import "../DeveloperPortalManageUserApps.css";

export enum EAction {
  EDIT = 'EDIT',
  NEW = 'NEW'
}
export interface IDeveloperPortalNewEditUserAppWebhookProps {
  action: EAction,
  organizationId: TAPOrganizationId,
  userId: APSUserId,
  viewManagedAppWebhookList: TViewManagedAppWebhookList,
  viewManagedWebhook?: TViewManagedWebhook;
  onError: (apiCallState: TApiCallState) => void;
  onNewSuccess: (apiCallState: TApiCallState) => void;
  onEditSuccess: (apiCallState: TApiCallState) => void;
  onCancel: () => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const DeveloperPortalNewEditUserAppWebhook: React.FC<IDeveloperPortalNewEditUserAppWebhookProps> = (props: IDeveloperPortalNewEditUserAppWebhookProps) => {
  const componentName = 'DeveloperPortalNewEditUserAppWebhook';

  type TUpdateApiObject = AppPatch;
  type TManagedObject = TViewManagedWebhook;

  type TManagedObjectFormData = TManagedObject & {
    dummy?: string
  };
  const emptyManagedObject: TManagedObject = {
    apSynthId: 'new',
    apiWebHook: {
      method: WebHook.method.POST,
      mode: WebHook.mode.SERIAL,
      uri: 'http://my.host.com'
    },
    webhookApiEnvironmentResponseList: [],
  }

  const transformManagedObjectToUpdateApiObject = (mo: TManagedObject): TUpdateApiObject => {
    const funcName = 'transformManagedObjectToUpdateApiObject';
    const logName = `${componentName}.${funcName}()`;
    // console.log(`${logName}: mo=${JSON.stringify(mo, null, 2)}`);
    // alert(`${logName}: mo=${JSON.stringify(mo, null, 2)}`);

    const newManagedWebhookList: Array<TViewManagedWebhook> = props.viewManagedAppWebhookList.managedWebhookList.concat([]);
    const idx: number = newManagedWebhookList.findIndex( (mwh: TViewManagedWebhook) => {
      return (mwh.apSynthId === mo.apSynthId);
    });
    if(idx > -1) newManagedWebhookList.splice(idx, 1, mo);
    else newManagedWebhookList.push(mo);
    const newApiWebHookList: Array<WebHook> = newManagedWebhookList.map( (mwh: TViewManagedWebhook) => {
      return mwh.apiWebHook;
    });
    const updateApiObject: TUpdateApiObject = {
      // ...props.viewManagedAppWebhookList.apiAppResponse,
      webHooks: newApiWebHookList
    };
    alert(`${logName}: updateApiObject=${JSON.stringify(updateApiObject, null, 2)}`);

    return updateApiObject;
  }

  const transformManagedObjectToFormData = (managedObject: TManagedObject): TManagedObjectFormData => {
    return {
      ...managedObject
    }
  }

  const transformFormDataToManagedObject = (formData: TManagedObjectFormData): TManagedObject => {
    return {
      ...formData
    };
  }

  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [managedObject, setManagedObject] = React.useState<TManagedObject>();  
  const [managedObjectFormData, setManagedObjectFormData] = React.useState<TManagedObjectFormData>();
  const managedObjectUseForm = useForm<TManagedObjectFormData>();
  const formId = componentName;
  const[isFormSubmitted, setIsFormSubmitted] = React.useState<boolean>(false);

  // * Api Calls *
  const apiUpdateManagedObject = async(mo: TManagedObject): Promise<TApiCallState> => {
    const funcName = 'apiUpdateManagedObject';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_UPDATE_USER_APP, `update webhooks for app: ${props.viewManagedAppWebhookList.appDisplayName}`);
    try { 
      await AppsService.updateDeveloperApp({
        organizationName: props.organizationId, 
        developerUsername: props.userId, 
        appName: props.viewManagedAppWebhookList.appId, 
        requestBody: transformManagedObjectToUpdateApiObject(mo)
      });
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
    if(props.action === EAction.EDIT) {
      if(!props.viewManagedWebhook) throw new Error(`${logName}: action=${props.action} - one or more props undefined, props=${JSON.stringify(props)}`);
      setManagedObject(props.viewManagedWebhook);
    } else {
      setManagedObject(emptyManagedObject);
    }
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
      else if(props.action === EAction.NEW && apiCallStatus.context.action === E_CALL_STATE_ACTIONS.API_UPDATE_USER_APP) {
        props.onNewSuccess(apiCallStatus);
      }  
      else if(props.action === EAction.EDIT && apiCallStatus.context.action === E_CALL_STATE_ACTIONS.API_UPDATE_USER_APP) {
        props.onEditSuccess(apiCallStatus);
      }
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const doPopulateManagedObjectFormDataValues = (formData: TManagedObjectFormData) => {
    const funcName = 'doPopulateManagedObjectFormDataValues';
    const logName = `${componentName}.${funcName}()`;
    // console.log(`${logName}: managedObjectFormData = ${JSON.stringify(managedObjectFormData, null, 2)}`);
    // alert(`${logName}: managedObjectFormData.apiProductSelectItemList=\n${JSON.stringify(managedObjectFormData.apiProductSelectItemList, null, 2)}`);
    managedObjectUseForm.setValue('apSynthId', formData.apSynthId);
    managedObjectUseForm.setValue('apiWebHook', formData.apiWebHook);    
  }

  const doSubmitManagedObject = async (mo: TManagedObject) => {
    const funcName = 'doSubmitManagedObject';
    const logName = `${componentName}.${funcName}()`;
    // console.log(`${logName}: managedObject = ${JSON.stringify(managedObject, null, 2)}`);
    props.onLoadingChange(true);
    await apiUpdateManagedObject(mo);
    props.onLoadingChange(false);
  }

  const onSubmitManagedObjectForm = (formData: TManagedObjectFormData) => {
    setIsFormSubmitted(true);
    doSubmitManagedObject(transformFormDataToManagedObject(formData));
  }

  const onCancelManagedObjectForm = () => {
    props.onCancel();
  }

  const onInvalidSubmitManagedObjectForm = () => {
    setIsFormSubmitted(true);
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
      <div className="card p-mt-4">
        <div className="p-fluid">
          <form id={formId} onSubmit={managedObjectUseForm.handleSubmit(onSubmitManagedObjectForm, onInvalidSubmitManagedObjectForm)} className="p-fluid">           
            {/* URI */}
            <div className="p-field">
              <span className="p-float-label p-input-icon-right">
                <i className="pi pi-key" />
                <Controller
                  name="apiWebHook.uri"
                  control={managedObjectUseForm.control}
                  rules={APConnectorFormValidationRules.Webhook_Uri()}
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
                <label htmlFor="apiWebHook.uri" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.apiWebHook?.uri })}>URI*</label>
              </span>
              {displayManagedObjectFormFieldErrorMessage(managedObjectUseForm.formState.errors.apiWebHook?.uri)}
            </div>
            <div>
              <h1>TODO: continue with webhook fields ...</h1>
            </div>
            {/* <div className="p-field">
              <span className="p-float-label">
                <Controller
                  name="apiObject.apiProducts"
                  control={managedObjectUseForm.control}
                  rules={{
                    required: "Choose at least 1 API Product."
                  }}
                  render={( { field, fieldState }) => {
                      // console.log(`${logName}: field=${JSON.stringify(field)}, fieldState=${JSON.stringify(fieldState)}`);
                      return(
                        <MultiSelect
                          display="chip"
                          value={field.value ? [...field.value] : []} 
                          options={createManagedObjectFormDataApiProductSelectItems()} 
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
    <div className="apd-manage-user-apps">

      { props.action === EAction.NEW && <APComponentHeader header={`Create New Webhook for App: ${props.viewManagedAppWebhookList.appDisplayName}`} /> }

      { props.action === EAction.EDIT && <APComponentHeader header={`Edit Webhook for App: ${props.viewManagedAppWebhookList.appDisplayName}`} /> }

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      { managedObjectFormData && renderManagedObjectForm() }

      {/* {showSelectApiProducts &&
        <DeveloperPortalUserAppSelectApiProducts 
          organizationId={props.organizationId}
          userId={props.userId}
          currentSelectedApiProductItemList={inFormCurrentMultiSelectOptionApiProductSelectItemList}
          onSave={onManagedObjectFormSelectApiProductsSuccess}
          onError={props.onError}          
          onCancel={onManagedObjectFormSelectApiProductsCancel}
          onLoadingChange={props.onLoadingChange}
        />
      }  */}

    </div>
  );
}
