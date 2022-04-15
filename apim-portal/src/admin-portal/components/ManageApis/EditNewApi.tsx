
import React from "react";
import { useForm, Controller, FieldError } from 'react-hook-form';

import { InputText } from 'primereact/inputtext';
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { Divider } from "primereact/divider";
import { classNames } from 'primereact/utils';

import { ApisService, APIInfo, CommonEntityNameList } from '@solace-iot-team/apim-connector-openapi-browser';
import { APClientConnectorOpenApi } from "../../../utils/APClientConnectorOpenApi";
import { APConnectorFormValidationRules } from "../../../utils/APConnectorOpenApiFormValidationRules";
import { APConnectorApiCalls, APConnectorApiHelper, TGetAsyncApiSpecResult } from "../../../utils/APConnectorApiCalls";
import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { APComponentHeader } from "../../../components/APComponentHeader/APComponentHeader";
import { TAPOrganizationId } from "../../../components/deleteme.APComponentsCommon";
import { E_CALL_STATE_ACTIONS, TManagedObjectId } from "./ManageApisCommon";
import { APButtonLoadFileContents } from "../../../components/APButtons/APButtonLoadFileContents";
import { APRenderUtils } from "../../../utils/APRenderUtils";
import { EAPAsyncApiSpecFormat, TAPAsyncApiSpec } from "../../../utils/APTypes";

import '../../../components/APComponents.css';
import "./ManageApis.css";

export enum EAction {
  EDIT = 'EDIT',
  NEW = 'NEW'
}
export interface IEditNewApiProps {
  action: EAction,
  organizationId: TAPOrganizationId,
  apiId?: TManagedObjectId;
  apiDisplayName?: string;
  onError: (apiCallState: TApiCallState) => void;
  onNewSuccess: (apiCallState: TApiCallState, newId: TManagedObjectId, newDisplayName: string) => void;
  onEditSuccess: (apiCallState: TApiCallState, updatedDisplayName?: string) => void;
  onCancel: () => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const EditNewApi: React.FC<IEditNewApiProps> = (props: IEditNewApiProps) => {
  const componentName = 'EditNewApi';

  type TUpdateApiObject = string;
  type TCreateApiObject = string;
  type TManagedObject = {
    id: TManagedObjectId,
    displayName: string,
    asyncApiSpec?: TAPAsyncApiSpec;
    apiInfo?: APIInfo,
    apiUsedBy_ApiProductEntityNameList: CommonEntityNameList
  }
  type TManagedObjectFormData = TManagedObject & {
    formAsyncApiSpecString: string | undefined
  }
  
  const emptyManagedObject: TManagedObject = {
    id: '',
    displayName: '',
    asyncApiSpec: {
      format: EAPAsyncApiSpecFormat.UNKNOWN,
      spec: ''
    },
    apiUsedBy_ApiProductEntityNameList: []
  }

  const ToolbarFormFieldAsyncApiUploadFromFileButtonLabel = 'Upload from File';

  const [createdManagedObjectId, setCreatedManagedObjectId] = React.useState<TManagedObjectId>();
  const [createdManagedObjectDisplayName, setCreatedManagedObjectDisplayName] = React.useState<string>();
  const [updatedManagedObjectDisplayName, setUpdatedManagedObjectDisplayName] = React.useState<string>();
  const [managedObject, setManagedObject] = React.useState<TManagedObject>();  
  const [managedObjectFormData, setManagedObjectFormData] = React.useState<TManagedObjectFormData>();
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);

  const managedObjectUseForm = useForm<TManagedObjectFormData>();

  const transformGetManagedObjectToManagedObject = (id: TManagedObjectId, displayName: string, apiInfo: APIInfo, asyncApiSpec: TAPAsyncApiSpec, apiApiProductEntityNameList: CommonEntityNameList): TManagedObject => {
    return {
      id: id,
      displayName: displayName,
      asyncApiSpec: asyncApiSpec,
      apiInfo: apiInfo,
      apiUsedBy_ApiProductEntityNameList: apiApiProductEntityNameList
    }
  }

  const _transformManagedObjectToApiString = (managedObject: TManagedObject): string => {
    const funcName = '_transformManagedObjectToApiString';
    const logName = `${componentName}.${funcName}()`;
    if(!managedObject.asyncApiSpec) throw new Error(`${logName}: managedObject.asyncApiSpec is undefined, managedObject=${JSON.stringify(managedObject)}`);
    const res = APConnectorApiHelper.getAsyncApiSpecAsJson(managedObject.asyncApiSpec);
    if(typeof(res) === 'string') throw new Error(`${logName}: ${res}`);
    // console.log(`${logName}: res = ${JSON.stringify(res, null, 2)}`);
    return APConnectorApiHelper.getAsyncApiSpecJsonAsString(managedObject.asyncApiSpec);
  }

  const transformManagedObjectToUpdateApiObject = (managedObject: TManagedObject): TUpdateApiObject => {
    return _transformManagedObjectToApiString(managedObject);
  }

  const transformManagedObjectToCreateApiObject = (managedObject: TManagedObject): TCreateApiObject => {
    return _transformManagedObjectToApiString(managedObject);
  }

  const transformManagedObjectToFormData = (managedObject: TManagedObject): TManagedObjectFormData => {
    let specStr: string | undefined = undefined;
    if(managedObject.asyncApiSpec && managedObject.asyncApiSpec.format === EAPAsyncApiSpecFormat.JSON) {
      specStr = APConnectorApiHelper.getAsyncApiSpecJsonAsDisplayString(managedObject.asyncApiSpec);
    } 
    return {
      ...managedObject,
      formAsyncApiSpecString: specStr
    }
  }

  const transformFormDataToManagedObject = (formData: TManagedObjectFormData): TManagedObject => {
    const funcName = 'transformFormDataToManagedObject';
    const logName = `${componentName}.${funcName}()`;
    if(!formData.formAsyncApiSpecString) throw new Error(`${logName}: formData.formAsyncApiSpecString is undefined`);
    const asyncApiSpec = APConnectorApiHelper.getAsyncApiSpecJsonFromString(formData.formAsyncApiSpecString);
    // console.log(`${logName}: aysncApiSpec=\n${JSON.stringify(asyncApiSpec, null, 2)}`);
    return {
      ...formData,
      displayName: formData.id,
      asyncApiSpec: asyncApiSpec
    }
  }

  // * Api Calls *
  const apiGetManagedObject = async(managedObjectId: TManagedObjectId, managedObjectDisplayName: string): Promise<TApiCallState> => {
    // const funcName = 'apiGetManagedObject';
    // const logName = `${componentName}.${funcName}()`;
    const initialApiCallState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_API, `retrieve details for api: ${managedObjectDisplayName}`);
    const result: TGetAsyncApiSpecResult = await APConnectorApiCalls.getAsyncApiSpec(props.organizationId, managedObjectId, initialApiCallState);
    const apiApiProductEntityNameList: CommonEntityNameList = await ApisService.getApiReferencedByApiProducts({
      organizationName: props.organizationId,
      apiName: managedObjectId
    });
    if(result.apiCallState.success && result.apiInfo && result.asyncApiSpec) {
      setManagedObject(transformGetManagedObjectToManagedObject(managedObjectId, managedObjectDisplayName, result.apiInfo, result.asyncApiSpec, apiApiProductEntityNameList));
    }
    setApiCallStatus(result.apiCallState);
    return result.apiCallState;
  }

  const apiUpdateManagedObject = async(managedObject: TManagedObject): Promise<TApiCallState> => {
    const funcName = 'apiUpdateManagedObject';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_UPDATE_API, `update api: ${managedObject.displayName}`);
    try { 
      const specStr: string = transformManagedObjectToUpdateApiObject(managedObject);
      // console.log(`${logName}: specStr=${specStr}`);
      await ApisService.updateApi({
        organizationName: props.organizationId,
        apiName: managedObject.id,
        requestBody: specStr
      });
      setUpdatedManagedObjectDisplayName(managedObject.displayName);
    } catch(e: any) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const apiCreateManagedObject = async(managedObject: TManagedObject): Promise<TApiCallState> => {
    const funcName = 'apiCreateManagedObject';
    const logName = `${componentName}.${funcName}()`;
    // console.log(`${logName}: starting ...`);
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_CREATE_API, `create api: ${managedObject.displayName}`);
    try { 
      if(!managedObject.asyncApiSpec) throw new Error(`${logName}: managedObject.asyncApiSpec is undefined, managedObject=${JSON.stringify(managedObject)}`);
      const specStr: string = transformManagedObjectToCreateApiObject(managedObject);
      // console.log(`${logName}: specStr=${specStr}`);
      await ApisService.createApi({
        organizationName: props.organizationId, 
        apiName: managedObject.id, 
        requestBody: specStr
      });
      setCreatedManagedObjectId(managedObject.id);
      setCreatedManagedObjectDisplayName(managedObject.displayName);      
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
      if(!props.apiId) throw new Error(`${logName}: props.apiId is undefined`);
      if(!props.apiDisplayName) throw new Error(`${logName}: props.apiDisplayName is undefined`);
      await apiGetManagedObject(props.apiId, props.apiDisplayName);
    } else {
      setManagedObject(emptyManagedObject);
    }
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
      else if(props.action === EAction.NEW && apiCallStatus.context.action === E_CALL_STATE_ACTIONS.API_CREATE_API) {
        if(!createdManagedObjectId) throw new Error(`${logName}: createdManagedObjectId is undefined`);
        if(!createdManagedObjectDisplayName) throw new Error(`${logName}: createdManagedObjectDisplayName is undefined`);
        props.onNewSuccess(apiCallStatus, createdManagedObjectId, createdManagedObjectDisplayName);
      }  
      else if(props.action === EAction.EDIT && apiCallStatus.context.action === E_CALL_STATE_ACTIONS.API_UPDATE_API) {
        props.onEditSuccess(apiCallStatus, updatedManagedObjectDisplayName);
      }
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const doPopulateManagedObjectFormDataValues = (managedObjectFormData: TManagedObjectFormData) => {
    managedObjectUseForm.setValue('id', managedObjectFormData.id);
    managedObjectUseForm.setValue('displayName', managedObjectFormData.displayName);
    if(managedObjectFormData.asyncApiSpec) {
      managedObjectUseForm.setValue('asyncApiSpec', managedObjectFormData.asyncApiSpec);
      managedObjectUseForm.setValue('formAsyncApiSpecString', managedObjectFormData.formAsyncApiSpecString);
    }
  }

  // * Upload / Import *
  const onUploadSpecFromFileSuccess = (apiCallState: TApiCallState, apiSpecStr: string) => {
    const funcName = 'onUploadSpecFromFileSuccess';
    const logName = `${componentName}.${funcName}()`;
    // console.log(`${logName}: modifiedSelectedApiProductList=${JSON.stringify(modifiedSelectedApiProductList, null, 2)}`);
    if(!apiCallState.success) throw new Error(`${logName}: apiCallState.success is false, apiCallState=${JSON.stringify(apiCallState, null, 2)}`);
    managedObjectUseForm.setValue('formAsyncApiSpecString',apiSpecStr);
  }

  const onUploadSpecFromFileError = (apiCallState: TApiCallState) => {
    const funcName = 'onUploadSpecFromFileError';
    const logName = `${componentName}.${funcName}()`;
    throw new Error(`${logName}: unhandled error, apiCallState=${JSON.stringify(apiCallState, null, 2)}`);
  }

  // * Form *
  const doSubmitManagedObject = async (managedObject: TManagedObject) => {
    props.onLoadingChange(true);
    if(props.action === EAction.NEW) await apiCreateManagedObject(managedObject);
    else await apiUpdateManagedObject(managedObject);
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

  // const displayManagedObjectFormFieldErrorMessage4Array = (fieldErrorList: Array<FieldError | undefined> | undefined) => {
  //   let _fieldError: any = fieldErrorList;
  //   return _fieldError && <small className="p-error">{_fieldError.message}</small>;
  // }

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

  const renderApisToolbar = () => {
    let jsxButtonList: Array<JSX.Element> = [
      <APButtonLoadFileContents 
        key={`${componentName}_loadFileContents`}
        buttonLabel={ToolbarFormFieldAsyncApiUploadFromFileButtonLabel}
        buttonIcon='pi pi-cloud-upload'
        buttonClassName='p-button-text p-button-plain p-button-outlined'
        acceptFileExtensionList={['.yaml', '.yml', '.json']}
        initialCallState={ApiCallState.getInitialCallState('LOAD_ASYNC_API_SPEC_FROM_FILE', `load async api spec from file`)}
        onSuccess={onUploadSpecFromFileSuccess}
        onError={onUploadSpecFromFileError}
      />,
    ];
    return (
      <Toolbar className="p-mb-4" style={ { 'background': 'none', 'border': 'none' } } left={jsxButtonList} />      
    );
  }

  const renderManagedObjectForm = () => {
    const isNewUser: boolean = (props.action === EAction.NEW);
    return (
      <div className="card">
        <div className="p-fluid">
          <form onSubmit={managedObjectUseForm.handleSubmit(onSubmitManagedObjectForm, onInvalidSubmitManagedObjectForm)} className="p-fluid">           
            {/* Id */}
            <div className="p-field">
              <span className="p-float-label p-input-icon-right">
                <i className="pi pi-key" />
                <Controller
                  name="id"
                  control={managedObjectUseForm.control}
                  rules={APConnectorFormValidationRules.CommonName()}
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
                <label htmlFor="id" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.id })}>Name/Id*</label>
              </span>
              {displayManagedObjectFormFieldErrorMessage(managedObjectUseForm.formState.errors.id)}
            </div>
            {/* Display Name */}
            {/* <div className="p-field">
              <span className="p-float-label">
                <Controller
                  name="displayName"
                  control={managedObjectUseForm.control}
                  rules={APConnectorFormValidationRules.DisplayName()}
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
                <label htmlFor="displayName" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.displayName })}>Display Name*</label>
              </span>
              {displayManagedObjectFormFieldErrorMessage(managedObjectUseForm.formState.errors.displayName)}
            </div> */}
            {/* Async API Spec string */}
            <div className="p-field">
              <span className="p-float-label">
                <Controller
                  name="formAsyncApiSpecString"
                  control={managedObjectUseForm.control}
                  rules={APConnectorFormValidationRules.AsyncApiSpec()}
                  render={( { field, fieldState }) => {
                      return(
                        <InputTextarea
                          id={field.name}
                          {...field}
                          className={classNames({ 'p-invalid': fieldState.invalid })}                       
                        />
                      )}}
                />
                <label htmlFor="formAsyncApiSpecString" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.formAsyncApiSpecString })}>Async API Spec*</label>
              </span>
              {displayManagedObjectFormFieldErrorMessage(managedObjectUseForm.formState.errors.formAsyncApiSpecString)}
              { renderApisToolbar() }
            </div>
            <Divider />
            {renderManagedObjectFormFooter()}
          </form>  
        </div>
      </div>
    );
  }
  
  const getEditNotes = (mo: TManagedObject): string => {
    if(mo.apiUsedBy_ApiProductEntityNameList.length === 0) return 'Not used by any API Products.';
    return `Used by API Products: ${APRenderUtils.getCommonEntityNameListAsStringList(mo.apiUsedBy_ApiProductEntityNameList).join(', ')}.`;
  }

  return (
    <div className="manage-apis">

      {managedObject && props.action === EAction.NEW && 
        <APComponentHeader header='Create API:' />
      }

      {managedObject && props.action === EAction.EDIT && 
        <APComponentHeader header={`Edit API: ${props.apiDisplayName}`} notes={getEditNotes(managedObject)}/>
      }

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      {managedObject && 
        renderManagedObjectForm()
      }

      {/* DEBUG */}
      {/* {managedObject && 
        <React.Fragment>
          <p>managedObject:</p>
          <pre style={ { fontSize: '10px' }} >
            {JSON.stringify(managedObject.asyncApiSpec, null, 2)}
          </pre>
        </React.Fragment>
      } */}
      {/* {managedObjectFormData && 
        <React.Fragment>
          <p>managedObjectUseForm:</p>
          <pre style={ { fontSize: '10px' }} >
            {JSON.stringify(managedObjectUseForm.getValues(), null, 2)}
          </pre>
          <p>managedObjectFormData:</p>
          <pre style={ { fontSize: '10px' }} >
            {JSON.stringify(managedObjectFormData, null, 2)}
          </pre>
        </React.Fragment>
      } */}
    </div>
  );
}
