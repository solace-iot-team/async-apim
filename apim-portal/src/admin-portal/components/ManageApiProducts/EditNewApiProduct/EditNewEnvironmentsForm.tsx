
import React from "react";
import { useForm, Controller } from 'react-hook-form';

import { Button } from "primereact/button";
import { Toolbar } from "primereact/toolbar";
import { InputText } from "primereact/inputtext";
import { classNames } from 'primereact/utils';

import { TApiCallState } from "../../../../utils/ApiCallState";
import APDisplayUtils from "../../../../displayServices/APDisplayUtils";
import { EAction} from "../ManageApiProductsCommon";
import APEnvironmentsDisplayService, { TAPEnvironmentDisplayList } from "../../../../displayServices/APEnvironmentsDisplayService";
import APEntityIdsService from "../../../../utils/APEntityIdsService";
import { ManageSelectEnvironments } from "./ManageSelectEnvironments";
import { TAPApiProductDisplay_Environments } from "../../../../displayServices/APApiProductsDisplayService";
import { TAPProtocolDisplayList } from "../../../../displayServices/APProtocolsDisplayService";
import { SelectProtocols } from "./SelectProtocols";

import '../../../../components/APComponents.css';
import "../ManageApiProducts.css";

export interface IEditNewEnvironmentsFormProps {
  formId: string;
  action: EAction;
  organizationId: string;
  apApiProductDisplay_Environments: TAPApiProductDisplay_Environments;
  onSubmit: (apApiProductDisplay_Environments: TAPApiProductDisplay_Environments) => void;
  onError: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
}


export const EditNewEnvironmentsForm: React.FC<IEditNewEnvironmentsFormProps> = (props: IEditNewEnvironmentsFormProps) => {
  const ComponentName = 'EditNewEnvironmentsForm';

  type TManagedObject = TAPApiProductDisplay_Environments;
  type TManagedObjectFormData = {
    environmentDisplay: string;
  };
  type TManagedObjectFormDataEnvelope = {
    formData: TManagedObjectFormData;
  }
  
  const ButtonLabelSelectEnvironments = 'Select Environment(s)';

  const transform_ManagedObject_To_FormDataEnvelope = (mo: TManagedObject): TManagedObjectFormDataEnvelope => {
    const fd: TManagedObjectFormData = {
      environmentDisplay: APEntityIdsService.create_SortedDisplayNameList_From_ApDisplayObjectList(mo.apEnvironmentDisplayList).join(', '),
    };
    return {
      formData: fd
    };
  }
  
  const create_ManagedObject_From_FormEntities = ({ formDataEnvelope, selected_ApEnvironmentDisplayList, selected_ApProtocolDisplayList}: {
    formDataEnvelope: TManagedObjectFormDataEnvelope;
    selected_ApEnvironmentDisplayList: TAPEnvironmentDisplayList;
    selected_ApProtocolDisplayList: TAPProtocolDisplayList;
  }): TManagedObject => {
    // const funcName = 'create_ManagedObject_From_FormEntities';
    // const logName = `${ComponentName}.${funcName}()`;

    // nothing to set from formData
    const mo: TManagedObject = props.apApiProductDisplay_Environments;
    // const fd: TManagedObjectFormData = formDataEnvelope.formData;
    // alert(`${logName}: fd.selected_ApProtocolDisplayList = ${APEntityIdsService.create_SortedDisplayNameList_From_ApDisplayObjectList(fd.selected_ApProtocolDisplayList)}`);
    mo.apEnvironmentDisplayList = selected_ApEnvironmentDisplayList;
    mo.apProtocolDisplayList = selected_ApProtocolDisplayList;
    // alert(`${logName}: mo.apProtocolDisplayList = ${APEntityIdsService.create_SortedDisplayNameList_From_ApDisplayObjectList(mo.apProtocolDisplayList)}`);
    return mo;
  }

  const [managedObject, setManagedObject] = React.useState<TManagedObject>();
  const [selected_ApEnvironmentDisplayList, setSelected_ApEnvironmentDisplayList] = React.useState<TAPEnvironmentDisplayList>();
  const [complete_ApProtocolDisplayList, setComplete_ApProtocolDisplayList] = React.useState<TAPProtocolDisplayList>([]);
  const [selected_ApProtocolDisplayList, setSelected_ApProtocolDisplayList] = React.useState<TAPProtocolDisplayList>();
  const [managedObjectFormDataEnvelope, setManagedObjectFormDataEnvelope] = React.useState<TManagedObjectFormDataEnvelope>();
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [showSelectEnvironments, setShowSelectEnvironments] = React.useState<boolean>(false);
  const managedObjectUseForm = useForm<TManagedObjectFormDataEnvelope>();
  const[isFormSubmitted, setIsFormSubmitted] = React.useState<boolean>(false);
  const [isInitialized, setIsInitialized] = React.useState<boolean>(false);

  const doInitialize = async () => {
    setManagedObject(props.apApiProductDisplay_Environments);
  }

  // * useEffect Hooks *

  React.useEffect(() => {
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(managedObject === undefined) return;
    setSelected_ApEnvironmentDisplayList(managedObject.apEnvironmentDisplayList);
    setSelected_ApProtocolDisplayList(managedObject.apProtocolDisplayList);
  }, [managedObject]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(managedObjectFormDataEnvelope === undefined) return;
    managedObjectUseForm.setValue('formData', managedObjectFormDataEnvelope.formData);
    if(isInitialized) {
      managedObjectUseForm.clearErrors();
      managedObjectUseForm.trigger();  
    } else setIsInitialized(true);
  }, [managedObjectFormDataEnvelope]) /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(managedObject === undefined) return;
    if(selected_ApEnvironmentDisplayList === undefined) return;
    if(selected_ApProtocolDisplayList === undefined) return;
    const _complete_apProtocolDisplayList: TAPProtocolDisplayList = APEnvironmentsDisplayService.create_ConsolidatedApProtocolDisplayList({
      apEnvironmentDisplayList: selected_ApEnvironmentDisplayList
    });
    setComplete_ApProtocolDisplayList(_complete_apProtocolDisplayList);
    // remove any protocols from selected protocols if they are not available any more
    const _selected_ApProtocolDisplayList: TAPProtocolDisplayList = selected_ApProtocolDisplayList;
    for(let idx=0; idx<_selected_ApProtocolDisplayList.length; idx++) {
      const isAvailable = _complete_apProtocolDisplayList.find( (x) => {
        return x.apEntityId.id === _selected_ApProtocolDisplayList[idx].apEntityId.id;
      });
      if(isAvailable === undefined) {
        _selected_ApProtocolDisplayList.splice(idx, 1);
        idx--;
      }
    }
    setSelected_ApProtocolDisplayList(_selected_ApProtocolDisplayList);
    setManagedObjectFormDataEnvelope(transform_ManagedObject_To_FormDataEnvelope({
      apEntityId: managedObject.apEntityId,
      apEnvironmentDisplayList: selected_ApEnvironmentDisplayList,
      apProtocolDisplayList: _complete_apProtocolDisplayList
    }));
  }, [selected_ApEnvironmentDisplayList]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const isSelectedProtocolListValid = (apProtocolDisplayList: TAPProtocolDisplayList): boolean => {
    // const funcName = 'isSelectedProtocolListValid';
    // const logName = `${ComponentName}.${funcName}()`;
    return apProtocolDisplayList.length > 0;
  }

  const onSubmitManagedObjectForm = (newMofde: TManagedObjectFormDataEnvelope) => {
    const funcName = 'onSubmitManagedObjectForm';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);
    if(selected_ApEnvironmentDisplayList === undefined) throw new Error(`${logName}: selected_ApEnvironmentDisplayList === undefined`);
    if(selected_ApProtocolDisplayList === undefined) throw new Error(`${logName}: selected_ApProtocolDisplayList === undefined`);
    setIsFormSubmitted(true);
    if(!isSelectedProtocolListValid(selected_ApProtocolDisplayList)) return false;
    props.onSubmit(create_ManagedObject_From_FormEntities({
      formDataEnvelope: newMofde,
      selected_ApProtocolDisplayList: selected_ApProtocolDisplayList,
      selected_ApEnvironmentDisplayList: selected_ApEnvironmentDisplayList
    }));
  }

  const onInvalidSubmitManagedObjectForm = () => {
    // placeholder
  }

  const onSearchEnvironments = () => {
    setShowSelectEnvironments(true);
  }

  const onSelectEnvironmentsSuccess = (apEnvironmentDisplayList: TAPEnvironmentDisplayList) => {
    setSelected_ApEnvironmentDisplayList(apEnvironmentDisplayList);
    setShowSelectEnvironments(false);
  }

  const onManagedObjectFormSelectEnvironmentsCancel = () => {
    setShowSelectEnvironments(false);
  }

  const onProtocolSelectionChange = (apProtocolDisplayList: TAPProtocolDisplayList) => {
    // const funcName = 'onProtocolSelectionChange';
    // const logName = `${ComponentName}.${funcName}()`;
    // if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);
    // alert(`${logName}: apProtocolDisplayList = ${APEntityIdsService.create_SortedDisplayNameList_From_ApDisplayObjectList(apProtocolDisplayList)}`);
    setSelected_ApProtocolDisplayList(apProtocolDisplayList);
  }

  const displaySelectedProtocolsErrorMessage = () => {
    const funcName = 'displaySelectedProtocolsErrorMessage';
    const logName = `${ComponentName}.${funcName}()`;
    if(selected_ApProtocolDisplayList === undefined) throw new Error(`${logName}: selected_ApProtocolDisplayList === undefined`);
    if(isFormSubmitted && !isSelectedProtocolListValid(selected_ApProtocolDisplayList)) return <p className="p-error">Select at least 1 protocol.</p>;
  }

  const renderSelectProtocols = (complete_apProtocolDisplayList: TAPProtocolDisplayList, selected_apProtocolDisplayList: TAPProtocolDisplayList) => {
    return (
      <React.Fragment>
        <SelectProtocols
          complete_apProtocolDisplayList={complete_apProtocolDisplayList}
          selected_apProtocolDisplayList={selected_apProtocolDisplayList}
          onSelectionChange={onProtocolSelectionChange}
        />
      </React.Fragment>
    );
  }

  const renderEnvironmentsToolbar = () => {
    let jsxButtonList: Array<JSX.Element> = [
      <Button style={ { width: '20rem' } } type="button" label={ButtonLabelSelectEnvironments} className="p-button-text p-button-plain p-button-outlined" onClick={() => onSearchEnvironments()} />,
    ];
    return (
      <Toolbar className="p-mb-4" style={ { 'background': 'none', 'border': 'none' } } left={jsxButtonList} />      
    );
  }

  const renderManagedObjectForm = () => {
    const funcName = 'renderManagedObjectForm';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);
    if(managedObjectFormDataEnvelope === undefined) throw new Error(`${logName}: managedObjectFormDataEnvelope === undefined`);
    if(selected_ApProtocolDisplayList === undefined) throw new Error(`${logName}: selected_ApProtocolDisplayList === undefined`);

    return (
      <div className="card p-mt-4">
        <div className="p-fluid">
          <form id={props.formId} onSubmit={managedObjectUseForm.handleSubmit(onSubmitManagedObjectForm, onInvalidSubmitManagedObjectForm)} className="p-fluid">      
            {/* environments */}
            <div className="p-text-bold p-mb-3">Environments:</div>
            {/* <div className="p-ml-3 p-mt-3"> */}
            <div className="p-field">
              <span className="p-float-label">
                <Controller
                  control={managedObjectUseForm.control}
                  name="formData.environmentDisplay"
                  rules={{
                    required: "Choose at least 1 Environment."
                  }}
                  render={( { field, fieldState }) => {
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
              {APDisplayUtils.displayFormFieldErrorMessage(managedObjectUseForm.formState.errors.formData?.environmentDisplay)}
              { renderEnvironmentsToolbar() }
              <div>{displaySelectedProtocolsErrorMessage()}</div>
              { renderSelectProtocols(complete_ApProtocolDisplayList, selected_ApProtocolDisplayList) } 
            </div>
          </form>  
        </div>
      </div>
    );
  }

  
  return (
    <div className="manage-api-products">

      { managedObjectFormDataEnvelope && renderManagedObjectForm() }

      {showSelectEnvironments && selected_ApEnvironmentDisplayList && 
        <ManageSelectEnvironments
          organizationId={props.organizationId}
          selectedEnvironmentEntityIdList={APEntityIdsService.create_EntityIdList_From_ApDisplayObjectList(selected_ApEnvironmentDisplayList)}
          onSave={onSelectEnvironmentsSuccess}
          onError={props.onError}          
          onCancel={onManagedObjectFormSelectEnvironmentsCancel}
          onLoadingChange={props.onLoadingChange}
        />
      } 

    </div>
  );
}
