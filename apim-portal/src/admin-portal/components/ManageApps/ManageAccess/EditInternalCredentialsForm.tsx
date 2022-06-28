
import React from "react";
import { useForm } from 'react-hook-form';

import { TApiCallState } from "../../../../utils/ApiCallState";
import { TAPAppDisplay_Credentials } from "../../../../displayServices/APAppsDisplayService/APAppsDisplayService";
import { APDisplayDeveloperPortalAppCredentials } from "../../../../components/APDisplayDeveloperPortalApp/APDisplayDeveloperPortalApp_Credentials";
import { EAction } from "../ManageAppsCommon";

import '../../../../components/APComponents.css';
import "../ManageApps.css";

export interface IEditInternalCredentialsFormProps {
  action: EAction;
  organizationId: string;
  apAppDisplay_Credentials: TAPAppDisplay_Credentials;
  formId: string;
  onSubmit: (apAppDisplay_Credentials: TAPAppDisplay_Credentials) => void;
  onError: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const EditInternalCredentialsForm: React.FC<IEditInternalCredentialsFormProps> = (props: IEditInternalCredentialsFormProps) => {
  // const ComponentName = 'EditNewCredentialsForm';

  type TManagedObject = TAPAppDisplay_Credentials;
  type TManagedObjectFormData = {
    dummy: string;
  };
  type TManagedObjectFormDataEnvelope = {
    formData: TManagedObjectFormData;
  }

  // const isNewManagedObject = (): boolean => {
  //   return props.action === EAction.NEW;
  // }

  const transform_ManagedObject_To_FormDataEnvelope = (mo: TManagedObject): TManagedObjectFormDataEnvelope => {
    const fd: TManagedObjectFormData = {
      dummy: 'dummy'
    };
    return {
      formData: fd
    };
  }

  const create_ManagedObject_From_FormEntities = ({formDataEnvelope}: {
    formDataEnvelope: TManagedObjectFormDataEnvelope;
  }): TManagedObject => {
    const mo: TManagedObject = props.apAppDisplay_Credentials;
    // const fd: TManagedObjectFormData = formDataEnvelope.formData;
    // nothing to set here
    return mo;
  }
  
  const [managedObject, setManagedObject] = React.useState<TManagedObject>();
  const [managedObjectFormDataEnvelope, setManagedObjectFormDataEnvelope] = React.useState<TManagedObjectFormDataEnvelope>();
  // const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const managedObjectUseForm = useForm<TManagedObjectFormDataEnvelope>();

  // * Api Calls *

  const doInitialize = async (mo: TManagedObject) => {
    setManagedObject(mo);
  }

  // * useEffect Hooks *

  React.useEffect(() => {
    doInitialize(props.apAppDisplay_Credentials);
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(managedObject === undefined) return;
    setManagedObjectFormDataEnvelope(transform_ManagedObject_To_FormDataEnvelope(managedObject));
  }, [managedObject]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(managedObjectFormDataEnvelope) managedObjectUseForm.setValue('formData', managedObjectFormDataEnvelope.formData);
  }, [managedObjectFormDataEnvelope]) /* eslint-disable-line react-hooks/exhaustive-deps */

  // React.useEffect(() => {
  //   if (apiCallStatus !== null) {
  //     if(!apiCallStatus.success) props.onError(apiCallStatus);
  //   }
  // }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const onSubmitManagedObjectForm = (newMofde: TManagedObjectFormDataEnvelope) => {
    const newMo: TManagedObject = create_ManagedObject_From_FormEntities({
      formDataEnvelope: newMofde,
    });
    props.onSubmit(newMo);
    // doInitialize(newMo);
    // setRefreshCounter(refreshCounter + 1);
  }

  const onInvalidSubmitManagedObjectForm = () => {
    // placeholder
  }

  const renderManagedObjectForm = (mo: TManagedObject) => {
    // const isNewObject: boolean = isNewManagedObject();
    // alert(`mo.apAppCredentials.secret.consumerSecret = ${mo.apAppCredentials.secret.consumerSecret}`);
    return (
      <div className="card p-mt-4">
        <div className="p-fluid">
          <div className="p-mb-4"><b>Current Credentials</b></div>
          <div className="p-mb-6">
            <APDisplayDeveloperPortalAppCredentials
              appCredentials={mo.apAppCredentials}
              // className={props.contentClassName}
            />
          </div>  
          <form id={props.formId} onSubmit={managedObjectUseForm.handleSubmit(onSubmitManagedObjectForm, onInvalidSubmitManagedObjectForm)} className="p-fluid">           
          </form>  
        </div>
      </div>
    );
  }

  
  return (
    <div className="ap-manage-apps">

      { managedObject && managedObjectFormDataEnvelope && renderManagedObjectForm(managedObject) }

    </div>
  );
}
