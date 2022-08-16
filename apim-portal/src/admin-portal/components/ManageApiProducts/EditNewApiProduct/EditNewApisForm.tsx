import React from "react";
import { useForm, Controller } from 'react-hook-form';

import { Button } from "primereact/button";
import { Toolbar } from "primereact/toolbar";
import { InputText } from "primereact/inputtext";
import { classNames } from 'primereact/utils';

import { TApiCallState } from "../../../../utils/ApiCallState";
import APDisplayUtils from "../../../../displayServices/APDisplayUtils";
import { EAction} from "../ManageApiProductsCommon";
import APEntityIdsService from "../../../../utils/APEntityIdsService";
import { 
  TAPApiProductDisplay_Apis, 
  TAPControlledChannelParameterList 
} from "../../../../displayServices/APApiProductsDisplayService";
import { ManageSelectApis } from "./ManageSelectApis";
import APAdminPortalApiProductsDisplayService from "../../../displayServices/APAdminPortalApiProductsDisplayService";
import { EditControlledChannelParameters } from "./EditControlledChannelParameters";
import { APDisplayApisDetails } from "../../../../components/APDisplay/APDisplayApisDetails";
import APApisDisplayService, { TAPApiChannelParameterList, TAPApiDisplayList } from "../../../../displayServices/APApisDisplayService";

import '../../../../components/APComponents.css';
import "../ManageApiProducts.css";

export interface IEditNewApisFormProps {
  formId: string;
  action: EAction;
  organizationId: string;
  apApiProductDisplay_Apis: TAPApiProductDisplay_Apis;
  isSingleSelection: boolean;
  onSubmit: (apApiProductDisplay_Apis: TAPApiProductDisplay_Apis) => void;
  onError: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
}


export const EditNewApisForm: React.FC<IEditNewApisFormProps> = (props: IEditNewApisFormProps) => {
  const ComponentName = 'EditNewApisForm';

  type TManagedObject = TAPApiProductDisplay_Apis;
  type TManagedObjectUseFormData = {
    apisDisplay: string;
  };
  type TManagedObjectExtFormData = {
    selected_ApApiDisplayList: TAPApiDisplayList;
    selectedApis_combined_ApApiChannelParameterList: TAPApiChannelParameterList;
    selected_ApControlledChannelParamterList: TAPControlledChannelParameterList;
  }
  type TManagedObjectFormDataEnvelope = {
    useFormData: TManagedObjectUseFormData;
    extFormData: TManagedObjectExtFormData;
  }
  
  const transform_ManagedObject_To_FormDataEnvelope = (mo: TManagedObject): TManagedObjectFormDataEnvelope => {
    const ufd: TManagedObjectUseFormData = {
      apisDisplay: APEntityIdsService.create_SortedDisplayNameList_From_ApDisplayObjectList(mo.apApiDisplayList).join(', '),
    };
    const efd: TManagedObjectExtFormData = {
      selected_ApApiDisplayList: mo.apApiDisplayList,
      selectedApis_combined_ApApiChannelParameterList: APApisDisplayService.create_Combined_ApiChannelParameterList({
        apApiDisplayList: mo.apApiDisplayList,
      }),
      selected_ApControlledChannelParamterList: mo.apControlledChannelParameterList,
    }
    return {
      useFormData: ufd,
      extFormData: efd
    };
  }

  const update_FormDataEnvelope_With_Ext_ApApiDisplayList = ({ update_selected_apApiDisplayList }:{
    update_selected_apApiDisplayList: TAPApiDisplayList;
  }): TManagedObjectFormDataEnvelope => {
    const funcName = 'update_FormDataEnvelope_With_ApControlledChannelParameterList';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObjectFormDataEnvelope === undefined) throw new Error(`${logName}: managedObjectFormDataEnvelope === undefined`);

    const ufd: TManagedObjectUseFormData = {
      apisDisplay: APEntityIdsService.create_SortedDisplayNameList_From_ApDisplayObjectList(update_selected_apApiDisplayList).join(', '),
    };
    const available_combined_ApApiChannelParameterList: TAPApiChannelParameterList = APApisDisplayService.create_Combined_ApiChannelParameterList({
      apApiDisplayList: update_selected_apApiDisplayList,
    });    
    // alert(`${logName}: available_combined_ApApiChannelParameterList = ${JSON.stringify(available_combined_ApApiChannelParameterList, null, 2)}`);
    const filtered_selected_ApControlledChannelParamterList: TAPControlledChannelParameterList = APAdminPortalApiProductsDisplayService.filter_ApControlledChannelParameterList({
      apControlledChannelParameterList: managedObjectFormDataEnvelope.extFormData.selected_ApControlledChannelParamterList,
      available_ApApiChannelParameterList: available_combined_ApApiChannelParameterList,
    });
    const efd: TManagedObjectExtFormData = {
      selected_ApApiDisplayList: update_selected_apApiDisplayList,
      selectedApis_combined_ApApiChannelParameterList: available_combined_ApApiChannelParameterList,
      selected_ApControlledChannelParamterList: filtered_selected_ApControlledChannelParamterList,
    }
    return {
      useFormData: ufd,
      extFormData: efd
    };
  }

  const update_FormDataEnvelope_With_Ext_ApControlledChannelParameterList = ({ update_selected_apControlledChannelParamterList }:{
    update_selected_apControlledChannelParamterList: TAPControlledChannelParameterList;
  }): TManagedObjectFormDataEnvelope => {
    const funcName = 'update_FormDataEnvelope_With_ApControlledChannelParameterList';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObjectFormDataEnvelope === undefined) throw new Error(`${logName}: managedObjectFormDataEnvelope === undefined`);

    const efd: TManagedObjectExtFormData = managedObjectFormDataEnvelope.extFormData;
    efd.selected_ApControlledChannelParamterList = update_selected_apControlledChannelParamterList;
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
    mo.apApiDisplayList = formDataEnvelope.extFormData.selected_ApApiDisplayList;
    mo.apControlledChannelParameterList = formDataEnvelope.extFormData.selected_ApControlledChannelParamterList;
    return mo;
  }

  const [managedObject, setManagedObject] = React.useState<TManagedObject>();
  const [managedObjectFormDataEnvelope, setManagedObjectFormDataEnvelope] = React.useState<TManagedObjectFormDataEnvelope>();
  // const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [showSelectApis, setShowSelectApis] = React.useState<boolean>(false);
  const managedObjectUseForm = useForm<TManagedObjectFormDataEnvelope>();
  const[isFormSubmitted, setIsFormSubmitted] = React.useState<boolean>(false);
  const [selectedApis_RefreshCounter, setSelectedApis_RefreshCounter] = React.useState<number>(0);
  const [isInitialized, setIsInitialized] = React.useState<boolean>(false);

  const ButtonLabelSelectApis = props.isSingleSelection ? 'Select API' : 'Select API(s)';
  const HeaderFormElementApis = props.isSingleSelection ? 'API' : 'API(s)';

  const doInitialize = async () => {
    setManagedObject(props.apApiProductDisplay_Apis);
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
    setSelectedApis_RefreshCounter(selectedApis_RefreshCounter + 1);
    if(isInitialized) {
      managedObjectUseForm.clearErrors();
      managedObjectUseForm.trigger();  
    } else setIsInitialized(true);
  }, [managedObjectFormDataEnvelope]) /* eslint-disable-line react-hooks/exhaustive-deps */

  // React.useEffect(() => {
  //   if (apiCallStatus !== null) {
  //     if(!apiCallStatus.success) props.onError(apiCallStatus);
  //   }
  // }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const isSelected_ControlledChannelParameterListValid = (): boolean => {
    // const funcName = 'isSelected_ControlledChannelParameterListValid';
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
    if(!isSelected_ControlledChannelParameterListValid()) return false;

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

  const onSearchApis = () => {
    setShowSelectApis(true);
  }

  const onSelectApisSuccess = (apApiDisplayList: TAPApiDisplayList) => {
    setManagedObjectFormDataEnvelope(update_FormDataEnvelope_With_Ext_ApApiDisplayList({
      update_selected_apApiDisplayList: apApiDisplayList,
    }));
    setShowSelectApis(false);
  }

  const onManagedObjectFormSelectApisCancel = () => {
    setShowSelectApis(false);
  }

  const onChange_ControlledChannelParameterList = (apControlledChannelParameterList: TAPControlledChannelParameterList) => {
    // const funcName = 'onChange_ControlledChannelParameterList';
    // const logName = `${ComponentName}.${funcName}()`;
    // alert(`${logName}: apControlledChannelParameterList=${JSON.stringify(apControlledChannelParameterList, null, 2)}`);

    // update form data envelope
    setManagedObjectFormDataEnvelope(update_FormDataEnvelope_With_Ext_ApControlledChannelParameterList({
      update_selected_apControlledChannelParamterList: apControlledChannelParameterList,
    }));    

  }

  const displaySelectedControlledChannelParametersErrorMessage = () => {
    if(isFormSubmitted && !isSelected_ControlledChannelParameterListValid()) return <p className="p-error">Validation error ???</p>;
  }

  const renderEdit_ControlledChannelParametersForm = (mofde: TManagedObjectFormDataEnvelope): JSX.Element => {
    return (
      <React.Fragment>
        <EditControlledChannelParameters
          key={`${ComponentName}_EditControlledChannelParameters_${selectedApis_RefreshCounter}`}
          apApiDisplayList={mofde.extFormData.selected_ApApiDisplayList}
          selected_ApControlledChannelParameterList={mofde.extFormData.selected_ApControlledChannelParamterList}
          onChange={onChange_ControlledChannelParameterList}
        />
      </React.Fragment>
    );
  }

  const renderApisToolbar = () => {
    let jsxButtonList: Array<JSX.Element> = [
      <Button style={ { width: '20rem' } } type="button" label={ButtonLabelSelectApis} className="p-button-text p-button-plain p-button-outlined" onClick={() => onSearchApis()} />,
    ];
    return (
      <Toolbar className="p-mb-4" style={ { 'background': 'none', 'border': 'none' } } left={jsxButtonList} />      
    );
  }

  const renderApisDetails = (mofde: TManagedObjectFormDataEnvelope): JSX.Element => {
    return (
      <React.Fragment>
        <APDisplayApisDetails 
          apApiDisplayList={mofde.extFormData.selected_ApApiDisplayList}
        />
      </React.Fragment>
    );
  }

  const renderManagedObjectForm = (mofde: TManagedObjectFormDataEnvelope) => {
    // const funcName = 'renderManagedObjectForm';
    // const logName = `${ComponentName}.${funcName}()`;
    // if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);
    // if(managedObjectFormDataEnvelope === undefined) throw new Error(`${logName}: managedObjectFormDataEnvelope === undefined`);

    return (
      <div className="card p-mt-4">
        <div className="p-fluid">
          <form id={props.formId} onSubmit={managedObjectUseForm.handleSubmit(onSubmitManagedObjectForm, onInvalidSubmitManagedObjectForm)} className="p-fluid">      
            {/* apis */}
            <div className="p-text-bold p-mb-3">{HeaderFormElementApis}:</div>
            {/* <div className="p-ml-3 p-mt-3"> */}
            <div className="p-field">
              <span className="p-float-label">
                <Controller
                  control={managedObjectUseForm.control}
                  name="useFormData.apisDisplay"
                  rules={{
                    required: "Choose at least 1 API."
                  }}
                  render={( { field, fieldState }) => {
                    // alert(`field = ${JSON.stringify(field, null, 2)}`)
                    return(
                      <InputText
                        id={field.name}
                        {...field}
                        // autoFocus={isNewObject}
                        style={{ fontWeight: 'bold', color: 'black'}}
                        disabled={true}
                        className={classNames({ 'p-invalid': fieldState.invalid })}                       
                      />
                  )}}
                />
                {/* <label className={classNames({ 'p-error': managedObjectUseForm.formState.errors.formData?.environmentDisplay })}>Environment(s)*</label> */}
              </span>
              {APDisplayUtils.displayFormFieldErrorMessage(managedObjectUseForm.formState.errors.useFormData?.apisDisplay)}
              { renderApisToolbar() }
              { renderApisDetails(mofde)}
            </div>
          </form>  
          {/* Controlled Channel Parameters */}
          <div>
            <div className="p-text-bold p-mb-3">Controlled Channel Parameter(s):</div>
            <div>{displaySelectedControlledChannelParametersErrorMessage()}</div>
            { renderEdit_ControlledChannelParametersForm(mofde)}
          </div>
        </div>
      </div>
    );
  }

  
  return (
    <div className="manage-api-products">

      {/* { isInitialized && renderManagedObjectForm() } */}

      { managedObjectFormDataEnvelope && renderManagedObjectForm(managedObjectFormDataEnvelope) }

      {showSelectApis && managedObjectFormDataEnvelope && 
        <ManageSelectApis 
          organizationId={props.organizationId}
          selectedApiEntityIdList={APEntityIdsService.create_EntityIdList_From_ApDisplayObjectList(managedObjectFormDataEnvelope.extFormData.selected_ApApiDisplayList)}
          onSave={onSelectApisSuccess}
          onError={props.onError}          
          onCancel={onManagedObjectFormSelectApisCancel}
          onLoadingChange={props.onLoadingChange}
        />
      } 

    </div>
  );
}
