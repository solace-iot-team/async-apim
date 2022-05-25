
import React from "react";
import { useForm, Controller } from 'react-hook-form';

import { InputText } from 'primereact/inputtext';
import { InputTextarea } from "primereact/inputtextarea";
import { Toolbar } from "primereact/toolbar";
import { classNames } from 'primereact/utils';

import { ApiCallState, TApiCallState } from "../../../../utils/ApiCallState";
import APDisplayUtils from "../../../../displayServices/APDisplayUtils";
import { APConnectorFormValidationRules } from "../../../../utils/APConnectorOpenApiFormValidationRules";
import { APClientConnectorOpenApi } from "../../../../utils/APClientConnectorOpenApi";
import { EAction, E_CALL_STATE_ACTIONS } from "../ManageApisCommon";
import APApisDisplayService, { TAPApiDisplay_General } from "../../../../displayServices/APApisDisplayService";
import APApiSpecsDisplayService from "../../../../displayServices/APApiSpecsDisplayService";
import { APButtonLoadFileContents } from "../../../../components/APButtons/APButtonLoadFileContents";

import '../../../../components/APComponents.css';
import "../ManageApis.css";

export interface IEditNewGeneralFormProps {
  action: EAction;
  organizationId: string;
  apApiDisplay_General: TAPApiDisplay_General;
  formId: string;
  onSubmit: (apApiDisplay_General: TAPApiDisplay_General) => void;
  onError: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const EditNewGeneralForm: React.FC<IEditNewGeneralFormProps> = (props: IEditNewGeneralFormProps) => {
  const ComponentName = 'EditNewGeneralForm';

  const ToolbarFormFieldAsyncApiUploadFromFileButtonLabel = 'Upload from File';

  type TManagedObject = TAPApiDisplay_General;
  type TManagedObjectFormData = {
    id: string;
    displayName: string;
    asyncApiSpecString: string;
  };
  type TManagedObjectFormDataEnvelope = {
    formData: TManagedObjectFormData;
  }

  const isNewManagedObject = (): boolean => {
    return props.action === EAction.NEW;
  }

  const transform_ManagedObject_To_FormDataEnvelope = (mo: TManagedObject): TManagedObjectFormDataEnvelope => {
    const fd: TManagedObjectFormData = {
      id: mo.apEntityId.id,
      displayName: mo.apEntityId.displayName,
      asyncApiSpecString: APApiSpecsDisplayService.get_AsyncApiSpec_As_Yaml_String({ apApiSpecDisplay: mo.apApiSpecDisplay }),
    };
    return {
      formData: fd
    };
  }

  const create_ManagedObject_From_FormEntities = ({formDataEnvelope}: {
    formDataEnvelope: TManagedObjectFormDataEnvelope;
  }): TManagedObject => {
    const mo: TManagedObject = props.apApiDisplay_General;
    const fd: TManagedObjectFormData = formDataEnvelope.formData;
    if(isNewManagedObject()) mo.apEntityId.id = fd.id;
    mo.apEntityId.displayName = fd.displayName;
    mo.apApiSpecDisplay = APApiSpecsDisplayService.create_ApApiSpecDisplay_From_AsyncApiString({ 
      apApiEntityId: mo.apEntityId,
      asyncApiSpecString: fd.asyncApiSpecString 
    });
    return mo;
  }
  
  const [managedObject, setManagedObject] = React.useState<TManagedObject>();
  const [managedObjectFormDataEnvelope, setManagedObjectFormDataEnvelope] = React.useState<TManagedObjectFormDataEnvelope>();
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const managedObjectUseForm = useForm<TManagedObjectFormDataEnvelope>();

  // * Api Calls *

  const apiCheck_ApiIdExists = async(apiId: string): Promise<boolean | undefined> => {
    const funcName = 'apiCheck_ApiIdExists';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_CHECK_API_ID_EXISTS, `check api exists: ${apiId}`);
    let checkResult: boolean | undefined = undefined;
    try { 
      checkResult = await APApisDisplayService.apiCheck_ApApiDisplay_Exists({
        organizationId: props.organizationId,
        apiId: apiId
      });
    } catch(e: any) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return checkResult;
  }

  const doInitialize = async () => {
    setManagedObject(props.apApiDisplay_General);
  }

  // * useEffect Hooks *

  React.useEffect(() => {
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(managedObject === undefined) return;
    setManagedObjectFormDataEnvelope(transform_ManagedObject_To_FormDataEnvelope(managedObject));
  }, [managedObject]) /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(managedObjectFormDataEnvelope === undefined) return;
    managedObjectUseForm.setValue('formData', managedObjectFormDataEnvelope.formData);
  }, [managedObjectFormDataEnvelope]) /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const onSubmitManagedObjectForm = (newMofde: TManagedObjectFormDataEnvelope) => {
    props.onSubmit(create_ManagedObject_From_FormEntities({
      formDataEnvelope: newMofde,
    }));
    setManagedObjectFormDataEnvelope(newMofde);
  }

  const onInvalidSubmitManagedObjectForm = () => {
    // placeholder
  }

  // * Upload / Import *
  const onUploadSpecFromFileSuccess = (apiCallState: TApiCallState, apiSpecStr: string) => {
    const funcName = 'onUploadSpecFromFileSuccess';
    const logName = `${ComponentName}.${funcName}()`;
    if(!apiCallState.success) throw new Error(`${logName}: apiCallState.success is false, apiCallState=${JSON.stringify(apiCallState, null, 2)}`);
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);
    alert(`${logName}: extract the version from spec, add to managedObject and display here ...`);
    const newMo: TManagedObject = {
      ...managedObject,
      apApiSpecDisplay: APApiSpecsDisplayService.create_ApApiSpecDisplay_From_AsyncApiString({ 
        apApiEntityId: managedObject.apEntityId,
        asyncApiSpecString: apiSpecStr
      })
    };
    setManagedObject(newMo);
  }

  const onUploadSpecFromFileError = (apiCallState: TApiCallState) => {
    const funcName = 'onUploadSpecFromFileError';
    const logName = `${ComponentName}.${funcName}()`;
    throw new Error(`${logName}: unhandled error, apiCallState=${JSON.stringify(apiCallState, null, 2)}`);
  }

  // const validate_SemVer = (newVersion: string): string | boolean => {
  //   const funcName = 'validate_SemVer';
  //   const logName = `${ComponentName}.${funcName}()`;
  //   if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);
  //   if(isNewManagedObject()) return true;
  //   if(APVersioningDisplayService.is_NewVersion_GreaterThan_LastVersion({
  //     lastVersion: managedObject.apVersionInfo.apLastVersion, 
  //     newVersion: newVersion
  //   })) return true;
  //   return `New version must be greater than current version: ${managedObject.apVersionInfo.apLastVersion}.`
  // }

  const validate_Id = async(id: string): Promise<string | boolean> => {
    if(props.action !== EAction.NEW) return true;
    // check if id exists
    const checkResult: boolean | undefined = await apiCheck_ApiIdExists(id);
    if(checkResult === undefined) return false;
    if(checkResult) return 'API Id already exists, please choose a unique Id.';
    return true;
  }

  const renderApisToolbar = () => {
    let jsxButtonList: Array<JSX.Element> = [
      <APButtonLoadFileContents 
        key={`${ComponentName}_APButtonLoadFileContents`}
        buttonLabel={ToolbarFormFieldAsyncApiUploadFromFileButtonLabel}
        buttonIcon='pi pi-cloud-upload'
        buttonClassName='p-button-text p-button-plain p-button-outlined'
        acceptFileExtensionList={['.yaml', '.yml', '.json']}
        initialCallState={ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.LOAD_ASYNC_API_SPEC_FROM_FILE, 'load async api spec from file')}
        onSuccess={onUploadSpecFromFileSuccess}
        onError={onUploadSpecFromFileError}
      />,
    ];
    return (
      <Toolbar className="p-mb-4" style={ { 'background': 'none', 'border': 'none' } } left={jsxButtonList} />      
    );
  }

  const renderManagedObjectForm = () => {
    const isNewObject: boolean = isNewManagedObject();
    return (
      <div className="card p-mt-4">
        <div className="p-fluid">
          <form id={props.formId} onSubmit={managedObjectUseForm.handleSubmit(onSubmitManagedObjectForm, onInvalidSubmitManagedObjectForm)} className="p-fluid">     
            <div className="p-field">
              <p>TODO: if no displayName available do not pre-populate id</p>
            </div>
            {/* Id */}
            <div className="p-field">
              <span className="p-float-label p-input-icon-right">
                <i className="pi pi-key" />
                <Controller
                  control={managedObjectUseForm.control}
                  name="formData.id"
                  rules={{
                    ...APConnectorFormValidationRules.CommonName(),
                    validate: validate_Id
                  }}
                  render={( { field, fieldState }) => {
                    return(
                      <InputText
                        id={field.name}
                        {...field}
                        autoFocus={false}
                        disabled={!isNewObject}
                        className={classNames({ 'p-invalid': fieldState.invalid })}                       
                      />
                  )}}
                />
                <label className={classNames({ 'p-error': managedObjectUseForm.formState.errors.formData?.id })}>Name/Id*</label>
              </span>
              {APDisplayUtils.displayFormFieldErrorMessage(managedObjectUseForm.formState.errors.formData?.id)}
            </div>
            {/* Async API Spec string */}
            <div className="p-field">
              <span className="p-float-label">
                <Controller
                  control={managedObjectUseForm.control}
                  name="formData.asyncApiSpecString"
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
                <label className={classNames({ 'p-error': managedObjectUseForm.formState.errors.formData?.asyncApiSpecString })}>Async API Spec*</label>
              </span>
              {APDisplayUtils.displayFormFieldErrorMessage(managedObjectUseForm.formState.errors.formData?.asyncApiSpecString)}
              { renderApisToolbar() }
            </div>
          </form>  
        </div>
      </div>
    );
  }

  
  return (
    <div className="manage-apis">

      { managedObjectFormDataEnvelope && renderManagedObjectForm() }

    </div>
  );
}
