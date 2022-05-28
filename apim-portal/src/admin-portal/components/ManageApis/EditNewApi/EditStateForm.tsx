
import React from "react";
import { useForm, Controller } from 'react-hook-form';

import { classNames } from 'primereact/utils';
import { Dropdown } from "primereact/dropdown";
import { TreeSelect } from "primereact/treeselect";
import { InputTextarea } from "primereact/inputtextarea";

import { TApiCallState } from "../../../../utils/ApiCallState";
import APDisplayUtils from "../../../../displayServices/APDisplayUtils";
import { MetaEntityStage } from "@solace-iot-team/apim-connector-openapi-browser";
import APLifecycleStageInfoDisplayService, { TAPLifecycleStageList } from "../../../../displayServices/APLifecycleStageInfoDisplayService";
import { TAPApiDisplay_State } from "../../../../displayServices/APApisDisplayService";
import APVersioningDisplayService, { TAPVersionTreeTableNodeList } from "../../../../displayServices/APVersioningDisplayService";

import '../../../../components/APComponents.css';
import "../ManageApis.css";

export interface IEditStateFormProps {
  formId: string;
  apApiDisplay_State: TAPApiDisplay_State;
  onSubmit: (apApiDisplay_State: TAPApiDisplay_State) => void;
  onError: (apiCallState: TApiCallState) => void;
}

export const EditStateForm: React.FC<IEditStateFormProps> = (props: IEditStateFormProps) => {
  const ComponentName = 'EditStateForm';

  type TManagedObject = TAPApiDisplay_State;
  type TManagedObjectFormData = {
    lifecycleState: MetaEntityStage;
    notes: string;
    version: string;
  };
  type TManagedObjectFormDataEnvelope = {
    formData: TManagedObjectFormData;
  }
  
  const transform_ManagedObject_To_FormDataEnvelope = (mo: TManagedObject): TManagedObjectFormDataEnvelope => {
    const fd: TManagedObjectFormData = {
      lifecycleState: mo.apLifecycleStageInfo.stage,
      notes: mo.apLifecycleStageInfo.notes === undefined ? '' : mo.apLifecycleStageInfo.notes,
      // version: mo.version,
      version: '',
    };
    return {
      formData: fd
    };
  }

  const create_ManagedObject_From_FormEntities = ({formDataEnvelope}: {
    formDataEnvelope: TManagedObjectFormDataEnvelope;
  }): TManagedObject => {
    // const funcName = 'create_ManagedObject_From_FormEntities';
    // const logName = `${ComponentName}.${funcName}()`;
    
    const mo: TManagedObject = props.apApiDisplay_State;
    const fd: TManagedObjectFormData = formDataEnvelope.formData;

    mo.apLifecycleStageInfo.stage = fd.lifecycleState;
    mo.apLifecycleStageInfo.notes = fd.notes;
    mo.version = fd.version;

    return mo;
  }
  
  const [managedObject, setManagedObject] = React.useState<TManagedObject>();
  const [managedObjectFormDataEnvelope, setManagedObjectFormDataEnvelope] = React.useState<TManagedObjectFormDataEnvelope>();
  const managedObjectUseForm = useForm<TManagedObjectFormDataEnvelope>();
  const NextApLifecycleStageList: TAPLifecycleStageList = APLifecycleStageInfoDisplayService.getList_NextStages({ currentStage: props.apApiDisplay_State.apLifecycleStageInfo.stage });

  const doInitialize = async () => {
    setManagedObject(props.apApiDisplay_State);
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

  const onSubmitManagedObjectForm = (newMofde: TManagedObjectFormDataEnvelope) => {
    props.onSubmit(create_ManagedObject_From_FormEntities({
      formDataEnvelope: newMofde,
    }));
  }

  const onInvalidSubmitManagedObjectForm = () => {
    // placeholder
  }

  const renderManagedObjectForm = () => {
    const funcName = 'renderManagedObjectForm';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);
    const apVersionTreeTableNodeList: TAPVersionTreeTableNodeList = APVersioningDisplayService.create_VersionTreeTableNodeList({ apVersionList: managedObject.apVersionList });
    return (
      <div className="card p-mt-4">
        <div className="p-fluid">
          <form id={props.formId} onSubmit={managedObjectUseForm.handleSubmit(onSubmitManagedObjectForm, onInvalidSubmitManagedObjectForm)} className="p-fluid">    
            {/* Version */}
            <div className="p-field">
              <span className="p-float-label">
                <Controller
                  control={managedObjectUseForm.control}
                  name="formData.version"
                  rules={{
                    required: "Please select version.",
                  }}
                  render={( { field, fieldState }) => {
                    return(
                      <TreeSelect
                        id={field.name}
                        {...field}
                        options={apVersionTreeTableNodeList}
                        onChange={(e) => field.onChange(e.value)}
                        filter={true}
                        selectionMode="single"
                        className={classNames({ 'p-invalid': fieldState.invalid })}                       
                      />
                  )}}
                />
                <label className={classNames({ 'p-error': managedObjectUseForm.formState.errors.formData?.version })}>Version*</label>
              </span>
              {APDisplayUtils.displayFormFieldErrorMessage(managedObjectUseForm.formState.errors.formData?.version)} 
            </div>
            {/* State */}
            <div className="p-field">
              <span className="p-float-label">
                <Controller
                  control={managedObjectUseForm.control}
                  name="formData.lifecycleState"
                  rules={{
                    required: "Enter new state.",
                  }}
                  render={( { field, fieldState }) => {
                    return(
                      <Dropdown
                        id={field.name}
                        {...field}
                        options={NextApLifecycleStageList} 
                        onChange={(e) => field.onChange(e.value)}
                        className={classNames({ 'p-invalid': fieldState.invalid })}                       
                      />                        
                  )}}
                />
                <label className={classNames({ 'p-error': managedObjectUseForm.formState.errors.formData?.lifecycleState })}>State*</label>
              </span>
              {APDisplayUtils.displayFormFieldErrorMessage(managedObjectUseForm.formState.errors.formData?.lifecycleState)} 
            </div>
            {/* notes */}
            <div className="p-field">
              <span className="p-float-label">
                <Controller
                  control={managedObjectUseForm.control}
                  name="formData.notes"
                  rules={{
                    required: "Please enter notes.",
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
                <label className={classNames({ 'p-error': managedObjectUseForm.formState.errors.formData?.notes })}>Notes*</label>
              </span>
              {APDisplayUtils.displayFormFieldErrorMessage(managedObjectUseForm.formState.errors.formData?.notes)}
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
