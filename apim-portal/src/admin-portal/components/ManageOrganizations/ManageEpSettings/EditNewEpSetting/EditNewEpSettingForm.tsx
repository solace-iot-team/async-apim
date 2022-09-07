
import React from "react";
import { useForm, Controller } from 'react-hook-form';

import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';

import { ApiCallState, TApiCallState } from "../../../../../utils/ApiCallState";
import APDisplayUtils from "../../../../../displayServices/APDisplayUtils";
import { APClientConnectorOpenApi } from "../../../../../utils/APClientConnectorOpenApi";
import { APConnectorFormValidationRules } from "../../../../../utils/APConnectorOpenApiFormValidationRules";
import { EAction, E_CALL_STATE_ACTIONS } from "../ManageEpSettingsCommon";
import APEpSettingsDisplayService, { IAPEpSettingsDisplay, TApEpSettings_MappingList } from "../../../../../displayServices/APEpSettingsDisplayService";
import { EditNewApplicationDomainMappingForm } from "./EditNewApplicationDomainMappingForm";
import { TAPBusinessGroupDisplayList, TAPBusinessGroupTreeNodeDisplayList } from "../../../../../displayServices/APBusinessGroupsDisplayService";
import { TAPEntityIdList } from "../../../../../utils/APEntityIdsService";
import { APSClientOpenApi } from "../../../../../utils/APSClientOpenApi";
import APExternalSystemsDisplayService from "../../../../../displayServices/APExternalSystemsDisplayService";

import '../../../../../components/APComponents.css';
import "../../ManageOrganizations.css";

export interface IEditNewEpSettingFormProps {
  action: EAction;
  organizationId: string;
  apEpSettingsDisplay: IAPEpSettingsDisplay;
  formId: string;
  apBusinessGroupTreeNodeDisplayList: TAPBusinessGroupTreeNodeDisplayList;
  apBusinessGroupDisplayList: TAPBusinessGroupDisplayList;
  onSubmit: (apEpSettingsDisplay: IAPEpSettingsDisplay) => void;
  onError: (apiCallState: TApiCallState) => void;
}

export const EditNewEpSettingForm: React.FC<IEditNewEpSettingFormProps> = (props: IEditNewEpSettingFormProps) => {
  const ComponentName = 'EditNewEpSettingForm';

  type TManagedObject = IAPEpSettingsDisplay;
  type TManagedObjectUseFormData = {
    id: string;
    displayName: string;
  };
  type TManagedObjectExtFormData = {
    apEpSettings_MappingList: TApEpSettings_MappingList;
  };
  type TManagedObjectFormDataEnvelope = {
    useFormData: TManagedObjectUseFormData;
    extFormData: TManagedObjectExtFormData;
  }

  const isNewManagedObject = (): boolean => {
    return props.action === EAction.NEW;
  }

  const transform_ManagedObject_To_FormDataEnvelope = (mo: TManagedObject): TManagedObjectFormDataEnvelope => {
    const ufd: TManagedObjectUseFormData = {
      id: mo.apEntityId.id,
      displayName: mo.apEntityId.displayName,
    };
    const efd: TManagedObjectExtFormData = {
      apEpSettings_MappingList: mo.apEpSettings_MappingList
    };
    return {
      useFormData: ufd,
      extFormData: efd
    };
  }

  const create_ManagedObject_From_FormEntities = ({formDataEnvelope}: {
    formDataEnvelope: TManagedObjectFormDataEnvelope;
  }): TManagedObject => {
    // const funcName = 'create_ManagedObject_From_FormEntities';
    // const logName = `${ComponentName}.${funcName}()`;
    const mo: TManagedObject = props.apEpSettingsDisplay;
    if(isNewManagedObject()) mo.apEntityId.id = formDataEnvelope.useFormData.id;
    mo.apEntityId.displayName = formDataEnvelope.useFormData.displayName;
    mo.apEpSettings_MappingList = formDataEnvelope.extFormData.apEpSettings_MappingList;
    // // DEBUG
    // alert(`${logName}: check console for logging...`);
    // console.log(`${logName}: mo=${JSON.stringify(mo, null, 2)}`);
    return mo;
  }
  
  const [managedObject] = React.useState<TManagedObject>(props.apEpSettingsDisplay);
  const [managedObjectFormDataEnvelope, setManagedObjectFormDataEnvelope] = React.useState<TManagedObjectFormDataEnvelope>();
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [availablePublishDestinationExternalSystemEntityIdList, setAvailablePublishDestinationExternalSystemEntityIdList] = React.useState<TAPEntityIdList>();
  const managedObjectUseForm = useForm<TManagedObjectFormDataEnvelope>();

  // * Api Calls *
  const apiCheck_ManagedObjectIdExists = async(moId: string): Promise<boolean | undefined> => {
    const funcName = 'apiCheck_ManagedObjectIdExists';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_CHECK_ID_EXISTS, `check setting id exists: ${moId}`);
    let checkResult: boolean | undefined = undefined;
    try { 
      checkResult = await APEpSettingsDisplayService.apiCheck_ApEpSettingId_Exists({
        organizationId: props.organizationId,
        id: moId
      });
    } catch(e: any) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return checkResult;
  }
  const apiGetPublishDestinations = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetPublishDestinations';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_PUBLISH_DESTINATIONS, 'get publish destinations');
    try {
      const publishDestinationList: TAPEntityIdList = await APExternalSystemsDisplayService.apiGetList_PublishDestinations({
        organizationId: props.organizationId
      });
      setAvailablePublishDestinationExternalSystemEntityIdList(publishDestinationList);
    } catch(e: any) {
      APSClientOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }


  const doInitialize = async () => {
    await apiGetPublishDestinations();
    setManagedObjectFormDataEnvelope(transform_ManagedObject_To_FormDataEnvelope(managedObject));
  }

  // * useEffect Hooks *

  React.useEffect(() => {
    // const funcName = 'useEffect([])';
    // const logName = `${ComponentName}.${funcName}()`;
    // console.log(`${logName}: mounting ...`);
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(managedObjectFormDataEnvelope === undefined) return;
    managedObjectUseForm.setValue('useFormData', managedObjectFormDataEnvelope.useFormData);
  }, [managedObjectFormDataEnvelope]) /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const onSubmitManagedObjectForm = (newMofde: TManagedObjectFormDataEnvelope) => {
    const funcName = 'onSubmitManagedObjectForm';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObjectFormDataEnvelope === undefined) throw new Error(`${logName}: managedObjectFormDataEnvelope === undefined`);
    // // DEBUG
    // alert(`${logName}: check console for logging...`);
    // console.log(`${logName}: newMofde=${JSON.stringify(newMofde, null, 2)}`);
    // add extFormData back in
    const complete_mofde: TManagedObjectFormDataEnvelope = managedObjectFormDataEnvelope;
    complete_mofde.useFormData = newMofde.useFormData;
    props.onSubmit(create_ManagedObject_From_FormEntities({
      formDataEnvelope: complete_mofde,
    }));
  }

  const onInvalidSubmitManagedObjectForm = () => {
    // check where the error is within the hidden forms
    // const funcName = 'onInvalidSubmitManagedObjectForm';
    // const logName = `${ComponentName}.${funcName}()`;
    // alert(`${logName}: what is invalid? - see console`);
    // console.log(`${logName}: managedObjectUseForm.formState.errors=${JSON.stringify(managedObjectUseForm.formState.errors, null, 2)}`);
  }

  const validate_Id = async(id: string): Promise<string | boolean> => {
    if(props.action === EAction.EDIT) return true;
    // check if id exists
    const checkResult: boolean | undefined = await apiCheck_ManagedObjectIdExists(id);
    if(checkResult === undefined) return false;
    if(checkResult) return 'Setting Id already exists, please choose a unique Id.';
    return true;
  }

  const onChange_ApEpSettings_MappingList = (apEpSettings_MappingList: TApEpSettings_MappingList) => {
    const funcName = 'onChange_ApEpSettings_MappingList';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObjectFormDataEnvelope === undefined) throw new Error(`${logName}: managedObjectFormDataEnvelope === undefined`);

    const newMofde: TManagedObjectFormDataEnvelope = {
      useFormData: managedObjectUseForm.getValues('useFormData'),
      extFormData: {
        apEpSettings_MappingList: apEpSettings_MappingList
      }
    };
    // // DEBUG
    // alert(`${logName}: check console for logging...`);
    // console.log(`${logName}: mo=${JSON.stringify(newMofde, null, 2)}`);
    setManagedObjectFormDataEnvelope(newMofde);
  }

  const renderManagedObjectForm = () => {
    const funcName = 'renderManagedObjectForm';
    const logName = `${ComponentName}.${funcName}()`;

    if(availablePublishDestinationExternalSystemEntityIdList === undefined) throw new Error(`${logName}: availablePublishDestinationExternalSystemEntityIdList === undefined`);
    if(managedObjectFormDataEnvelope === undefined) throw new Error(`${logName}: managedObjectFormDataEnvelope === undefined`);

    const isNewObject: boolean = isNewManagedObject();
    // const uniqueKey_Mappings = ComponentName+'_EditNewApplicationDomainMappingForm_'+Globals.getUUID();
    const uniqueKey_Mappings = ComponentName+'_EditNewApplicationDomainMappingForm_';

    return (
      <div className="card p-mt-4">
        <div className="p-fluid">
          <form id={props.formId} onSubmit={managedObjectUseForm.handleSubmit(onSubmitManagedObjectForm, onInvalidSubmitManagedObjectForm)} className="p-fluid">           
            {/* Id */}
            <div className="p-field">
              <span className="p-float-label p-input-icon-right">
                <i className="pi pi-key" />
                <Controller
                  control={managedObjectUseForm.control}
                  name="useFormData.id"
                  rules={{
                    ...APConnectorFormValidationRules.CommonName(),
                    validate: validate_Id
                  }}
                  render={( { field, fieldState }) => {
                    return(
                      <InputText
                        id={field.name}
                        {...field}
                        autoFocus={isNewObject}
                        disabled={!isNewObject}
                        className={classNames({ 'p-invalid': fieldState.invalid })}                       
                      />
                  )}}
                />
                <label className={classNames({ 'p-error': managedObjectUseForm.formState.errors.useFormData?.id })}>Id*</label>
              </span>
              {APDisplayUtils.displayFormFieldErrorMessage(managedObjectUseForm.formState.errors.useFormData?.id)}
            </div>
            {/* Display Name */}
            <div className="p-field">
              <span className="p-float-label">
                <Controller
                  control={managedObjectUseForm.control}
                  name="useFormData.displayName"
                  rules={APConnectorFormValidationRules.CommonDisplayName()}
                  render={( { field, fieldState }) => {
                    return(
                      <InputText
                        id={field.name}
                        {...field}
                        autoFocus={!isNewObject}
                        className={classNames({ 'p-invalid': fieldState.invalid })}                       
                      />
                  )}}
                />
                <label className={classNames({ 'p-error': managedObjectUseForm.formState.errors.useFormData?.displayName })}>Display Name*</label>
              </span>
              {APDisplayUtils.displayFormFieldErrorMessage(managedObjectUseForm.formState.errors.useFormData?.displayName)}
            </div>
          </form>  

          {/* <div className="p-field"> */}
            {/* mappings */}
            <div className="p-mb-2 p-mt-4 ap-display-component-header">Mappings:</div>
            <EditNewApplicationDomainMappingForm 
              key={uniqueKey_Mappings}
              organizationId={props.organizationId}
              uniqueFormKeyPrefix={uniqueKey_Mappings}
              apBusinessGroupTreeNodeDisplayList={props.apBusinessGroupTreeNodeDisplayList}
              apBusinessGroupDisplayList={props.apBusinessGroupDisplayList}
              apEpSettings_MappingList={managedObjectFormDataEnvelope.extFormData.apEpSettings_MappingList}
              apAvailablePublishDestinationExternalSystemEntityIdList={availablePublishDestinationExternalSystemEntityIdList}
              onChange={onChange_ApEpSettings_MappingList}
              onError={props.onError}
            />
          {/* </div> */}

        </div>
      </div>
    );
  }
  
  return (
    <div className="manage-organizations">

      { availablePublishDestinationExternalSystemEntityIdList && managedObjectFormDataEnvelope && renderManagedObjectForm() }

    </div>
  );
}
