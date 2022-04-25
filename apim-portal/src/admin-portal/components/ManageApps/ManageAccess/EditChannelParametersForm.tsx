import React from "react";
import { useForm } from 'react-hook-form';

import { 
  TAPControlledChannelParameterList 
} from "../../../../displayServices/APApiProductsDisplayService";
import { 
  TAPAppChannelParameterList,
  TAPAppDisplay_ChannelParameters 
} from "../../../../displayServices/APAppsDisplayService/APAppsDisplayService";
import { EditAppChannelParameters } from "./EditAppChannelParameters";

import '../../../../components/APComponents.css';
import "../ManageApps.css";

export interface IEditChannelParametersFormProps {
  formId: string;
  organizationId: string;
  apAppDisplay_ChannelParameters: TAPAppDisplay_ChannelParameters;
  onSubmit: (apAppDisplay_ChannelParameters: TAPAppDisplay_ChannelParameters) => void;
}


export const EditChannelParametersForm: React.FC<IEditChannelParametersFormProps> = (props: IEditChannelParametersFormProps) => {
  const ComponentName = 'EditChannelParametersForm';

  type TManagedObject = TAPAppDisplay_ChannelParameters;
  type TManagedObjectUseFormData = {
    dummy: string;
  };
  type TManagedObjectExtFormData = {
    combined_ApControlledChannelParamterList: TAPControlledChannelParameterList;
    apAppChannelParameterList : TAPAppChannelParameterList;
  }
  type TManagedObjectFormDataEnvelope = {
    useFormData: TManagedObjectUseFormData;
    extFormData: TManagedObjectExtFormData;
  }
  const transform_ManagedObject_To_FormDataEnvelope = (mo: TManagedObject): TManagedObjectFormDataEnvelope => {
    const ufd: TManagedObjectUseFormData = {
      dummy: ''
    };
    const efd: TManagedObjectExtFormData = {
      combined_ApControlledChannelParamterList: mo.combined_ApAppApiProductsControlledChannelParameterList,
      apAppChannelParameterList: mo.apAppChannelParameterList
    }
    return {
      useFormData: ufd,
      extFormData: efd
    };
  }

  const update_FormDataEnvelope_With_Ext_ApAppChannelParameterList = ({ update_ApAppChannelParameterList }:{
    update_ApAppChannelParameterList: TAPAppChannelParameterList;
  }): TManagedObjectFormDataEnvelope => {
    const funcName = 'update_FormDataEnvelope_With_Ext_ApAppChannelParameterList';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObjectFormDataEnvelope === undefined) throw new Error(`${logName}: managedObjectFormDataEnvelope === undefined`);

    const efd: TManagedObjectExtFormData = managedObjectFormDataEnvelope.extFormData;
    efd.apAppChannelParameterList = update_ApAppChannelParameterList;
    return {
      useFormData: managedObjectFormDataEnvelope.useFormData,
      extFormData: efd
    };
  }

  const create_ManagedObject_From_FormEntities = ({ formDataEnvelope }: {
    formDataEnvelope: TManagedObjectFormDataEnvelope;
  }): TManagedObject => {
    const funcName = 'create_ManagedObject_From_FormEntities';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);
    const mo: TManagedObject = managedObject;
    mo.apAppChannelParameterList = formDataEnvelope.extFormData.apAppChannelParameterList;
    return mo;
  }

  const [managedObject, setManagedObject] = React.useState<TManagedObject>();
  const [managedObjectFormDataEnvelope, setManagedObjectFormDataEnvelope] = React.useState<TManagedObjectFormDataEnvelope>();
  const managedObjectUseForm = useForm<TManagedObjectFormDataEnvelope>();
  const[isFormSubmitted, setIsFormSubmitted] = React.useState<boolean>(false);
  const [refreshCounter, setRefreshCounter] = React.useState<number>(0);
  const [isInitialized, setIsInitialized] = React.useState<boolean>(false);

  const doInitialize = async () => {
    setManagedObject(props.apAppDisplay_ChannelParameters);
  }

  // * useEffect Hooks *

  React.useEffect(() => {
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(managedObject === undefined) return;
    const fde: TManagedObjectFormDataEnvelope = transform_ManagedObject_To_FormDataEnvelope(managedObject);
    setManagedObjectFormDataEnvelope(fde);
  }, [managedObject]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(managedObjectFormDataEnvelope === undefined) return;
    // set the use form states
    // useFormData is directly modified by the form itself
    managedObjectUseForm.setValue('useFormData', managedObjectFormDataEnvelope.useFormData);
    setRefreshCounter(refreshCounter + 1);
    if(isInitialized) {
      managedObjectUseForm.clearErrors();
      managedObjectUseForm.trigger();  
    } else setIsInitialized(true);
  }, [managedObjectFormDataEnvelope]) /* eslint-disable-line react-hooks/exhaustive-deps */

  const isValid_ApAppChannelParameterList = (): boolean => {
    // const funcName = 'isValid_ApAppChannelParameterList';
    // const logName = `${ComponentName}.${funcName}()`;
    // alert(`${logName}: anything to validate here?`);
    // the selected list should already be correct
    // if not, validate here again against available parameters
    return true;
  }

  const onSubmitManagedObjectForm = (newMofde: TManagedObjectFormDataEnvelope) => {
    const funcName = 'onSubmitManagedObjectForm';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObjectFormDataEnvelope === undefined) throw new Error(`${logName}: managedObjectFormDataEnvelope === undefined`);
    // newMofde: only carries the useFormData
    // add the extFormData from state
    const complete_mofde: TManagedObjectFormDataEnvelope = managedObjectFormDataEnvelope;
    complete_mofde.useFormData = newMofde.useFormData;

    setIsFormSubmitted(true);
    if(!isValid_ApAppChannelParameterList()) return false;

    // alert(`${logName}: see console for complete_mofde.extFormData`);
    // console.log(`${logName}: complete_mofde.extFormData.selected_ApControlledChannelParamterList=${JSON.stringify(complete_mofde.extFormData.selected_ApControlledChannelParamterList, null, 2)}`);
    // console.log(`${logName}: ${JSON.stringify(complete_mofde.extFormData, null, 2)}`);

    props.onSubmit(create_ManagedObject_From_FormEntities({
      formDataEnvelope: complete_mofde,
    }));
  }

  const onInvalidSubmitManagedObjectForm = () => {
    // placeholder
  }

  const onChange_ApAppChannelParameterList = (apAppChannelParameterList: TAPAppChannelParameterList) => {
    // update form data envelope
    setManagedObjectFormDataEnvelope(update_FormDataEnvelope_With_Ext_ApAppChannelParameterList({
      update_ApAppChannelParameterList: apAppChannelParameterList,
    }));
  }

  const displayApAppChannelParametersErrorMessage = () => {
    if(isFormSubmitted && !isValid_ApAppChannelParameterList()) return <p className="p-error">Validation error ???</p>;
  }

  const renderEdit_ApAppChannelParametersForm = (mofde: TManagedObjectFormDataEnvelope): JSX.Element => {
    return (
      <React.Fragment>
        <EditAppChannelParameters
          key={`${ComponentName}_EditAppChannelParameters_${refreshCounter}`}
          apAppChannelParameterList={mofde.extFormData.apAppChannelParameterList}
          combined_ApControlledChannelParamterList={mofde.extFormData.combined_ApControlledChannelParamterList}
          onChange={onChange_ApAppChannelParameterList}
        />
      </React.Fragment>
    );
  }
  const renderManagedObjectForm = (mofde: TManagedObjectFormDataEnvelope) => {
    return (
      <div className="card p-mt-4">
        <div className="p-fluid">
          <form id={props.formId} onSubmit={managedObjectUseForm.handleSubmit(onSubmitManagedObjectForm, onInvalidSubmitManagedObjectForm)} className="p-fluid">      
          </form>  
          {/* Controlled Channel Parameters */}
          <div>
            <div className="p-text-bold p-mb-2">App Channel Parameter(s):</div>
            <div>{displayApAppChannelParametersErrorMessage()}</div>
            { renderEdit_ApAppChannelParametersForm(mofde)}
          </div>
        </div>
      </div>
    );
  }

  
  return (
    <div className="ap-manage-apps">

      { managedObjectFormDataEnvelope && renderManagedObjectForm(managedObjectFormDataEnvelope) }

    </div>
  );
}
