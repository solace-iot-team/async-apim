
import React from "react";
import { useForm, Controller } from 'react-hook-form';

import { Checkbox } from "primereact/checkbox";
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';

import { TApiCallState } from "../../../../utils/ApiCallState";
import APDisplayUtils from "../../../../displayServices/APDisplayUtils";
import { TAPUserActivationDisplay } from "../../../../displayServices/APUsersDisplayService/APUsersDisplayService";
import { EAction } from "../ManageSystemUsersCommon";
import APSystemUsersDisplayService, { TAPSystemUserDisplay } from "../../../../displayServices/APUsersDisplayService/APSystemUsersDisplayService";

import '../../../../components/APComponents.css';
import "../ManageSystemUsers.css";

export interface IEditNewSystemUserActivationStatusProps {
  action: EAction,
  apSystemUserDisplay: TAPSystemUserDisplay;
  onSave: (apUserActivationDisplay: TAPUserActivationDisplay) => void;
  onCancel: () => void;
  onError: (apiCallState: TApiCallState) => void;
  onBack: () => void;
}

export const EditNewSystemUserActivationStatus: React.FC<IEditNewSystemUserActivationStatusProps> = (props: IEditNewSystemUserActivationStatusProps) => {
  const ComponentName = 'EditNewSystemUserActivationStatus';

  type TManagedObject = TAPUserActivationDisplay;
  type TManagedObjectFormData = {
    isActivated: boolean;
  };
  type TManagedObjectFormDataEnvelope = {
    formData: TManagedObjectFormData;
  }
  const transform_ManagedObject_To_FormDataEnvelope = (mo: TManagedObject): TManagedObjectFormDataEnvelope => {
    const fd: TManagedObjectFormData = {
      isActivated: mo.isActivated,
    };
    return {
      formData: fd
    };
  }

  const create_ManagedObject_From_FormEntities = ({orginalManagedObject, formDataEnvelope}: {
    orginalManagedObject: TManagedObject;
    formDataEnvelope: TManagedObjectFormDataEnvelope;
  }): TManagedObject => {
    const mo: TManagedObject = orginalManagedObject;
    const fd: TManagedObjectFormData = formDataEnvelope.formData;
    mo.isActivated = fd.isActivated;
    return mo;
  }

  const [managedObject, setManagedObject] = React.useState<TManagedObject>();
  const [managedObjectFormDataEnvelope, setManagedObjectFormDataEnvelope] = React.useState<TManagedObjectFormDataEnvelope>();
  const managedObjectUseForm = useForm<TManagedObjectFormDataEnvelope>();
  const formId = ComponentName;

  const doInitialize = async () => {
    setManagedObject(APSystemUsersDisplayService.get_ApUserActivationDisplay({
      apUserDisplay: props.apSystemUserDisplay
    }));
  }

  // * useEffect Hooks *

  React.useEffect(() => {
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(managedObject) {
      setManagedObjectFormDataEnvelope(transform_ManagedObject_To_FormDataEnvelope(managedObject));
    }
  }, [managedObject]) /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(managedObjectFormDataEnvelope) managedObjectUseForm.setValue('formData', managedObjectFormDataEnvelope.formData);
  }, [managedObjectFormDataEnvelope]) /* eslint-disable-line react-hooks/exhaustive-deps */

  const doSubmitManagedObject = async (mo: TManagedObject) => {
    props.onSave(mo);
  }

  const onSubmitManagedObjectForm = (newMofde: TManagedObjectFormDataEnvelope) => {
    const funcName = 'onSubmitManagedObjectForm';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);
    doSubmitManagedObject(create_ManagedObject_From_FormEntities({
      orginalManagedObject: managedObject,
      formDataEnvelope: newMofde,
    }));
  }

  const onInvalidSubmitManagedObjectForm = () => {
    // placeholder
  }

  const renderManagedObjectFormFooter = (): JSX.Element => {
    const managedObjectFormFooterLeftToolbarTemplate = () => {
      if(props.action === EAction.NEW) {
        return (
          <React.Fragment>
            <Button key={ComponentName+'Back'} label="Back" icon="pi pi-arrow-left" className="p-button-text p-button-plain p-button-outlined" onClick={props.onBack}/>
            <Button type="button" label="Cancel" className="p-button-text p-button-plain" onClick={props.onCancel} />
          </React.Fragment>
        );
      } else {
        return (
          <React.Fragment>
            <Button type="button" label="Cancel" className="p-button-text p-button-plain" onClick={props.onCancel} />
          </React.Fragment>
        );
      }
    }
    const managedObjectFormFooterRightToolbarTemplate = () => {
      if(props.action === EAction.NEW) {
        return (
          <React.Fragment>
            <Button key={ComponentName+'Next'} form={formId} type="submit" label="Next" icon="pi pi-arrow-right" className="p-button-text p-button-plain p-button-outlined" />
          </React.Fragment>
        );  
      } else {
        return (
          <React.Fragment>
            <Button key={ComponentName+'Save'} form={formId} type="submit" label="Save" icon="pi pi-save" className="p-button-text p-button-plain p-button-outlined" />
          </React.Fragment>
        );  
      }
    }  
    return (
      <Toolbar className="p-mb-4" left={managedObjectFormFooterLeftToolbarTemplate} right={managedObjectFormFooterRightToolbarTemplate} />
    )
  }

  const renderManagedObjectForm = () => {
    return (
      <div className="card p-mt-4">
        <div className="p-fluid">
          <form id={formId} onSubmit={managedObjectUseForm.handleSubmit(onSubmitManagedObjectForm, onInvalidSubmitManagedObjectForm)} className="p-fluid">     
            {/* isActivated */}
            <div className="p-field-checkbox">
              <span>
                <Controller
                  name="formData.isActivated"
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
                <label className={classNames({ 'p-error': managedObjectUseForm.formState.errors.formData?.isActivated })}> Activate User</label>
              </span>
              {APDisplayUtils.displayFormFieldErrorMessage(managedObjectUseForm.formState.errors.formData?.isActivated)}
            </div>
          </form>  
          {/* footer */}
          { renderManagedObjectFormFooter() }
        </div>
      </div>
    );
  }

  
  return (
    <div className="manage-users">

      {managedObject && 
        renderManagedObjectForm()
      }
    </div>
  );
}
