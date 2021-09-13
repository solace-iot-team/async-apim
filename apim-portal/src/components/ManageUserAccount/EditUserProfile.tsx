
import React from "react";
import { useForm, Controller, FieldError } from 'react-hook-form';

import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Toolbar } from "primereact/toolbar";
import { Divider } from "primereact/divider";
import { classNames } from 'primereact/utils';

import { APComponentHeader } from "../APComponentHeader/APComponentHeader";
import { TApiCallState } from "../../utils/ApiCallState";
import { ApiCallStatusError } from "../ApiCallStatusError/ApiCallStatusError";
import { E_CALL_STATE_ACTIONS, ManageUserAccountCommon, TApiCallResult, TManagedObject, TUpdateApiObject } from "./ManageUserAccountCommon";
import { APSOpenApiFormValidationRules } from "../../utils/APSOpenApiFormValidationRules";
import { UserContext } from "../UserContextProvider/UserContextProvider";

import "../APComponents.css";
import "./ManageUserAccount.css";

export interface IEditUserProfileProps {
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  onCancel: () => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const EditUserProfile: React.FC<IEditUserProfileProps> = (props: IEditUserProfileProps) => {
  // const componentName = 'EditUserProfile';

  type TManagedObjectFormData = TManagedObject;

  const [managedObject, setManagedObject] = React.useState<TManagedObject>();  
  const [updatedManagedObject, setUpdatedManagedObject] = React.useState<TManagedObject>();
  const [managedObjectFormData, setManagedObjectFormData] = React.useState<TManagedObjectFormData>();
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [userContext, dispatchUserContextAction] = React.useContext(UserContext);
  const managedObjectUseForm = useForm<TManagedObjectFormData>();

  const transformManagedObjectToUpdateApiObject = (managedObject: TManagedObject): TUpdateApiObject => {
    return {
      profile: {
        first: managedObject.profile.first,
        last: managedObject.profile.last
      }
    }
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

  // * useEffect Hooks *
  const doInitialize = async () => {
    props.onLoadingChange(true);
    const apiCallResult: TApiCallResult = await ManageUserAccountCommon.apiGetManagedObject(userContext.user.userId);
    setApiCallStatus(apiCallResult.apiCallState);
    setManagedObject(apiCallResult.managedObject);
    props.onLoadingChange(false);
  }

  React.useEffect(() => {
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */
  
  React.useEffect(() => {
    if(managedObject) {
      setManagedObjectFormData(transformManagedObjectToFormData(managedObject));
    }
  }, [managedObject]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(updatedManagedObject) {
      dispatchUserContextAction( { type: 'SET_USER', user: updatedManagedObject });
    }
  }, [updatedManagedObject]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(managedObjectFormData) doPopulateManagedObjectFormDataValues(managedObjectFormData);
  }, [managedObjectFormData]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
      else if(apiCallStatus.context.action === E_CALL_STATE_ACTIONS.API_UPDATE_USER) {
        props.onSuccess(apiCallStatus);
      }
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const doPopulateManagedObjectFormDataValues = (managedObjectFormData: TManagedObjectFormData) => {
    managedObjectUseForm.setValue('userId', managedObjectFormData.userId);
    managedObjectUseForm.setValue('profile.first', managedObjectFormData.profile.first);
    managedObjectUseForm.setValue('profile.last', managedObjectFormData.profile.last);
    managedObjectUseForm.setValue('profile.email', managedObjectFormData.profile.email);
  }

  const doSubmitManagedObject = async (managedObject: TManagedObject) => {
    props.onLoadingChange(true);
    const apiCallResult: TApiCallResult = await ManageUserAccountCommon.apiUpdateManagedObject(managedObject.userId, transformManagedObjectToUpdateApiObject(managedObject));
    setApiCallStatus(apiCallResult.apiCallState);
    setUpdatedManagedObject(apiCallResult.managedObject);
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

  const managedObjectFormFooterRightToolbarTemplate = () => {
    const getSubmitButtonLabel = (): string => {
      return 'Save';
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
                      return(
                        <InputText
                          id={field.name}
                          {...field}
                          disabled={true}
                          className={classNames({ 'p-invalid': fieldState.invalid })}                       
                        />
                  )}}
                />
                <label htmlFor="profile.email" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.profile?.email })}>E-Mail*</label>
              </span>
              {displayManagedObjectFormFieldErrorMessage(managedObjectUseForm.formState.errors.profile?.email)}
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
                          autoFocus={true}
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
            <Divider />
            {renderManagedObjectFormFooter()}
          </form>  
        </div>
      </div>
    );
  }

  return (
    <div className="manage-user-account">

      <APComponentHeader header='Edit Profile:' />

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      {managedObject && 
        renderManagedObjectForm()
      }
    </div>
  );
}
