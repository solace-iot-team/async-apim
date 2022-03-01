
import React from "react";
import { useForm, Controller } from 'react-hook-form';

import { Password } from "primereact/password";
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';

import { ApiCallState, TApiCallState } from "../../../../utils/ApiCallState";
import { APSClientOpenApi } from "../../../../utils/APSClientOpenApi";
import { E_CALL_STATE_ACTIONS } from "../ManageOrganizationUsersCommon";
import APUsersDisplayService, { 
  TAPUserCredentialsDisplay, 
  TAPUserDisplay
} from "../../../../displayServices/APUsersDisplayService";
import APDisplayUtils from "../../../../displayServices/APDisplayUtils";

import '../../../../components/APComponents.css';
import "../ManageOrganizationUsers.css";
import { TAPEntityId } from "../../../../utils/APEntityIdsService";

export interface INewOrganizationUserCredentialsProps {
  organizationEntityId: TAPEntityId;
  apUserDisplay: TAPUserDisplay;
  onNext: (apUserCredentialsDisplay: TAPUserCredentialsDisplay) => void;
  onBack: () => void;
  onCancel: () => void;
  onError: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const NewOrganizationUserCredentials: React.FC<INewOrganizationUserCredentialsProps> = (props: INewOrganizationUserCredentialsProps) => {
  const ComponentName = 'NewOrganizationUserCredentials';

  type TManagedObject = TAPUserCredentialsDisplay;
  type TManagedObjectFormData = {
    password: string;
  };
  type TManagedObjectFormDataEnvelope = {
    formData: TManagedObjectFormData;
  }
  const transform_ManagedObject_To_FormDataEnvelope = (mo: TManagedObject): TManagedObjectFormDataEnvelope => {
    const fd: TManagedObjectFormData = {
      password: '',
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
    mo.password = fd.password;
    return mo;
  }
  
  const [managedObject, setManagedObject] = React.useState<TManagedObject>();
  const [managedObjectFormDataEnvelope, setManagedObjectFormDataEnvelope] = React.useState<TManagedObjectFormDataEnvelope>();
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const managedObjectUseForm = useForm<TManagedObjectFormDataEnvelope>();
  const formId = ComponentName;

  const doInitialize = async () => {
    setManagedObject(APUsersDisplayService.get_ApUserCredentialsDisplay({
      apUserDisplay: props.apUserDisplay
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

  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const doSubmitManagedObject = async (mo: TManagedObject) => {
    props.onNext(mo);
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
      return (
        <React.Fragment>
          <Button key={ComponentName+'Back'} label="Back" icon="pi pi-arrow-left" className="p-button-text p-button-plain p-button-outlined" onClick={props.onBack}/>
          <Button type="button" label="Cancel" className="p-button-text p-button-plain" onClick={props.onCancel} />
        </React.Fragment>
      );
    }
    const managedObjectFormFooterRightToolbarTemplate = () => {
      return (
        <React.Fragment>
          <Button key={ComponentName+'Next'} form={formId} type="submit" label="Next" icon="pi pi-arrow-right" className="p-button-text p-button-plain p-button-outlined" />
        </React.Fragment>
      );
    }  
    return (
      <Toolbar className="p-mb-4" left={managedObjectFormFooterLeftToolbarTemplate} right={managedObjectFormFooterRightToolbarTemplate} />
    )
  }

  const renderManagedObjectForm = (mo: TManagedObject) => {
    return (
      <div className="card p-mt-4">
        <div className="p-fluid">
          <form id={formId} onSubmit={managedObjectUseForm.handleSubmit(onSubmitManagedObjectForm, onInvalidSubmitManagedObjectForm)} className="p-fluid">           
            {/* Password */}
            <div className="p-field">
              <span className="p-float-label">
                <Controller
                  name="formData.password"
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
                          autoFocus={true}
                          {...field}
                          className={classNames({ 'p-invalid': fieldState.invalid })}                       
                        />
                  )}}
                />
                <label className={classNames({ 'p-error': managedObjectUseForm.formState.errors.formData?.password })}>Password*</label>
              </span>
              {APDisplayUtils.displayFormFieldErrorMessage(managedObjectUseForm.formState.errors.formData?.password)}
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
        renderManagedObjectForm(managedObject)
      }
    </div>
  );
}
