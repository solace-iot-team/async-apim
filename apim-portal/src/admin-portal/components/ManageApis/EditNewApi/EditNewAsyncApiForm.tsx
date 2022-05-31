
import React from "react";
import { useForm, Controller } from 'react-hook-form';

import { InputTextarea } from "primereact/inputtextarea";
import { Toolbar } from "primereact/toolbar";
import { classNames } from 'primereact/utils';

import { ApiCallState, TApiCallState } from "../../../../utils/ApiCallState";
import APDisplayUtils from "../../../../displayServices/APDisplayUtils";
import { APClientConnectorOpenApi } from "../../../../utils/APClientConnectorOpenApi";
import { EAction, E_CALL_STATE_ACTIONS } from "../ManageApisCommon";
import APApisDisplayService, { TAPApiDisplay_AsyncApiSpec } from "../../../../displayServices/APApisDisplayService";
import APApiSpecsDisplayService, { EAPApiSpecFormat, TAPApiSpecDisplay } from "../../../../displayServices/APApiSpecsDisplayService";
import { APButtonLoadFileContents } from "../../../../components/APButtons/APButtonLoadFileContents";
import APEntityIdsService from "../../../../utils/APEntityIdsService";
import APVersioningDisplayService from "../../../../displayServices/APVersioningDisplayService";

import '../../../../components/APComponents.css';
import "../ManageApis.css";

export interface IEditNewAsyncApiSpecFormProps {
  action: EAction;
  organizationId: string;
  apApiDisplay_AsyncApiSpec: TAPApiDisplay_AsyncApiSpec;
  apLastVersion?: string;
  formId: string;
  onSubmit: (apApiDisplay_AsyncApiSpec: TAPApiDisplay_AsyncApiSpec) => void;
  onError: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const EditNewAsyncApiSpecForm: React.FC<IEditNewAsyncApiSpecFormProps> = (props: IEditNewAsyncApiSpecFormProps) => {
  const ComponentName = 'EditNewAsyncApiSpecForm';

  const ToolbarFormFieldAsyncApiUploadFromFileButtonLabel = 'Upload from File';

  type TManagedObject = TAPApiDisplay_AsyncApiSpec;
  type TManagedObjectFormData = {
    asyncApiSpecString: string;
  };
  type TManagedObjectFormDataEnvelope = {
    formData: TManagedObjectFormData;
  }

  // const isNewManagedObject = (): boolean => {
  //   return props.action === EAction.NEW;
  // }

  const transform_ManagedObject_To_FormDataEnvelope = (mo: TManagedObject): TManagedObjectFormDataEnvelope => {
    const fd: TManagedObjectFormData = {
      asyncApiSpecString: APApiSpecsDisplayService.get_AsyncApiSpec_As_Yaml_String({ apApiSpecDisplay: mo.apApiSpecDisplay }),
    };
    return {
      formData: fd
    };
  }

  const create_ManagedObject_From_FormEntities = ({formDataEnvelope}: {
    formDataEnvelope: TManagedObjectFormDataEnvelope;
  }): TManagedObject => {
    const mo: TManagedObject = props.apApiDisplay_AsyncApiSpec;
    const fd: TManagedObjectFormData = formDataEnvelope.formData;
    mo.apApiSpecDisplay = APApiSpecsDisplayService.create_ApApiSpecDisplay_From_AsyncApiString({ 
      apApiEntityId: mo.apEntityId,
      asyncApiSpecString: fd.asyncApiSpecString 
    });
    // create a suggested id from title
    const title = APApiSpecsDisplayService.get_Title({ apApiSpecDisplay: mo.apApiSpecDisplay });
    const generatedId = APApisDisplayService.generate_Id_From_Title({ title: title }); 
    mo.apEntityId = {
      id: generatedId,
      displayName: generatedId,
    }
    return mo;
  }
  
  const [managedObject, setManagedObject] = React.useState<TManagedObject>();
  const [managedObjectFormDataEnvelope, setManagedObjectFormDataEnvelope] = React.useState<TManagedObjectFormDataEnvelope>();
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const managedObjectUseForm = useForm<TManagedObjectFormDataEnvelope>();

  // * Api Calls *
  const apiCheck_ApiVersionExists = async(version: string): Promise<boolean | undefined> => {
    const funcName = 'apiCheck_ApiVersionExists';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_CHECK_API_VERSION_EXISTS, `check api version exists: ${props.apApiDisplay_AsyncApiSpec.apEntityId.displayName}@${version}`);
    let checkResult: boolean | undefined = undefined;
    try { 
      // alert(`${logName}: checking if version=${version} exists`);
      checkResult = await APApisDisplayService.apiCheck_ApApiDisplay_Version_Exists({
        organizationId: props.organizationId,
        apiId: props.apApiDisplay_AsyncApiSpec.apEntityId.id,
        version: version,
      });
    } catch(e: any) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return checkResult;
  }

  const doInitialize = async () => {
    setManagedObject(props.apApiDisplay_AsyncApiSpec);
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
    const apApiSpecDisplay: TAPApiSpecDisplay = APApiSpecsDisplayService.create_ApApiSpecDisplay_From_AsyncApiString({ 
      apApiEntityId: managedObject.apEntityId,
      asyncApiSpecString: apiSpecStr
    });
    const newMo: TManagedObject = {
      ...managedObject,
      apApiSpecDisplay: apApiSpecDisplay
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

  const validate_AsyncApiSpec = async(specStr: string): Promise<string | boolean> => {
    const funcName = 'validate_AsyncApiSpec';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);
    // try parsing it
    const result: TAPApiSpecDisplay | string = APApiSpecsDisplayService.create_ApApiSpecDisplayJson_From_AsyncApiString({
      apApiEntityId: APEntityIdsService.create_EmptyObject_NoId(),
      asyncApiSpecString: specStr,
      currentFormat: EAPApiSpecFormat.UNKNOWN
    });
    if(typeof(result) === 'string') return result as string;
    const apApiSpecDisplay: TAPApiSpecDisplay = result as TAPApiSpecDisplay;
    // validate spec has version in it
    const hasVersionString: boolean = APApiSpecsDisplayService.has_VersionString({ apApiSpecDisplay: apApiSpecDisplay });
    if(!hasVersionString) return `Async Api Spec is missing version element.`;
    if(props.action === EAction.NEW) return true;
    // must be a new version
    const versionString: string = APApiSpecsDisplayService.get_RawVersionString({
      apApiSpecDisplay: apApiSpecDisplay
    });
    // must be in SemVer format
    if(!APVersioningDisplayService.isSemVerFormat(versionString)) return `Please use semantic versioning format for API version instead of '${versionString}'.`;
    // check new version is greater than latest 
    if(props.apLastVersion === undefined) throw new Error(`${logName}: props.apLastVersion === undefined`);
    if(!APVersioningDisplayService.is_NewVersion_GreaterThan_LastVersion({ newVersion: versionString, lastVersion: props.apLastVersion })) {
      return `API version '${versionString}' must be greater than last version '${props.apLastVersion}'.`;;
    }
    const checkVersionResult: boolean | undefined = await apiCheck_ApiVersionExists(versionString);
    if(checkVersionResult === undefined) return 'Could not validate version';
    if(checkVersionResult) return `API version '${versionString}' already exists, please specify a new version in the Async API Spec.`;
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
    return (
      <div className="card p-mt-4">
        <div className="p-fluid">
          <form id={props.formId} onSubmit={managedObjectUseForm.handleSubmit(onSubmitManagedObjectForm, onInvalidSubmitManagedObjectForm)} className="p-fluid">     
            {/* Async API Spec string */}
            <div className="p-field">
              <span className="p-float-label">
                <Controller
                  control={managedObjectUseForm.control}
                  name="formData.asyncApiSpecString"
                  rules={{
                    required: 'Please enter / upload Async Api Spec.',
                    validate: validate_AsyncApiSpec
                  }}
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
