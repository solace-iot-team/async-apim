
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
import { 
  TAPApiChannelParameterList, 
  TAPApiDisplayList 
} from "../../../../displayServices/APApisDisplayService";
import { ManageSelectApis } from "./ManageSelectApis";
import APAdminPortalApisDisplayService from "../../../displayServices/APAdminPortalApisDisplayService";

import '../../../../components/APComponents.css';
import "../ManageApiProducts.css";

export interface IEditNewApisFormProps {
  formId: string;
  action: EAction;
  organizationId: string;
  apApiProductDisplay_Apis: TAPApiProductDisplay_Apis;
  onSubmit: (apApiProductDisplay_Apis: TAPApiProductDisplay_Apis) => void;
  onError: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
}


export const EditNewApisForm: React.FC<IEditNewApisFormProps> = (props: IEditNewApisFormProps) => {
  const ComponentName = 'EditNewApisForm';

  type TManagedObject = TAPApiProductDisplay_Apis;
  type TManagedObjectFormData = {
    apisDisplay: string;
  };
  type TManagedObjectFormDataEnvelope = {
    formData: TManagedObjectFormData;
  }
  
  const ButtonLabelSelectApis = 'Select API(s)';

  const transform_ManagedObject_To_FormDataEnvelope = (mo: TManagedObject): TManagedObjectFormDataEnvelope => {
    const fd: TManagedObjectFormData = {
      apisDisplay: APEntityIdsService.create_SortedDisplayNameList_From_ApDisplayObjectList(mo.apApiDisplayList).join(', '),
    };
    return {
      formData: fd
    };
  }
  
  const create_ManagedObject_From_FormEntities = ({ formDataEnvelope, selected_ApApiDisplayList, selected_ApControlledChannelParamterList }: {
    formDataEnvelope: TManagedObjectFormDataEnvelope;
    selected_ApApiDisplayList: TAPApiDisplayList;
    selected_ApControlledChannelParamterList: TAPControlledChannelParameterList;
  }): TManagedObject => {
    // const funcName = 'create_ManagedObject_From_FormEntities';
    // const logName = `${ComponentName}.${funcName}()`;

    // nothing to set from formData
    const mo: TManagedObject = props.apApiProductDisplay_Apis;
    // const fd: TManagedObjectFormData = formDataEnvelope.formData;
    // alert(`${logName}: fd.selected_ApProtocolDisplayList = ${APEntityIdsService.create_SortedDisplayNameList_From_ApDisplayObjectList(fd.selected_ApProtocolDisplayList)}`);
    mo.apApiDisplayList = selected_ApApiDisplayList;
    mo.apControlledChannelParameterList = selected_ApControlledChannelParamterList;
    return mo;
  }

  const [managedObject, setManagedObject] = React.useState<TManagedObject>();
  const [selected_ApApiDisplayList, setSelected_ApApiDisplayList] = React.useState<TAPApiDisplayList>([]);
  const [selectedApis_combined_ApApiChannelParameterList, setSelectedApis_combined_ApApiChannelParameterList] = React.useState<TAPApiChannelParameterList>([]);

  // const [complete_ApControlledChannelParameterList, setComplete_ApControlledChannelParameterList] = React.useState<TAPControlledChannelParameterList>([]);
  
  const [selected_ApControlledChannelParamterList, setSelected_ApControlledChannelParamterList] = React.useState<TAPControlledChannelParameterList>([]);
  const [managedObjectFormDataEnvelope, setManagedObjectFormDataEnvelope] = React.useState<TManagedObjectFormDataEnvelope>();
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [showSelectApis, setShowSelectApis] = React.useState<boolean>(false);
  const managedObjectUseForm = useForm<TManagedObjectFormDataEnvelope>();
  const[isFormSubmitted, setIsFormSubmitted] = React.useState<boolean>(false);

  const doInitialize = async () => {
    setManagedObject(props.apApiProductDisplay_Apis);
  }

  // * useEffect Hooks *

  React.useEffect(() => {
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(managedObject === undefined) return;
    setManagedObjectFormDataEnvelope(transform_ManagedObject_To_FormDataEnvelope(managedObject));
    setSelected_ApApiDisplayList(managedObject.apApiDisplayList);
    setSelected_ApControlledChannelParamterList(managedObject.apControlledChannelParameterList);
  }, [managedObject]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(managedObjectFormDataEnvelope === undefined) return;
    managedObjectUseForm.setValue('formData', managedObjectFormDataEnvelope.formData);
  }, [managedObjectFormDataEnvelope]) /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    const funcName = 'useEffect[selected_ApApiDisplayList]';
    const logName = `${ComponentName}.${funcName}()`;

    if(managedObject === undefined) return;
    if(selected_ApApiDisplayList === undefined) return;
    if(selected_ApControlledChannelParamterList === undefined) return;

    const _selectedApis_combined_ApApiChannelParameterList = APAdminPortalApisDisplayService.create_Combined_ApiChannelParameterList({
      apApiDisplayList: selected_ApApiDisplayList,
    });
    setSelectedApis_combined_ApApiChannelParameterList(_selectedApis_combined_ApApiChannelParameterList);    
    alert(`${logName}: TODO: remove channel parameters if they are not available any more?`);
    // // remove any protocols from selected protocols if they are not available any more
    // const _selected_ApProtocolDisplayList: TAPProtocolDisplayList = selected_ApProtocolDisplayList;
    // for(let idx=0; idx<_selected_ApProtocolDisplayList.length; idx++) {
    //   const isAvailable = _complete_apProtocolDisplayList.find( (x) => {
    //     return x.apEntityId.id === _selected_ApProtocolDisplayList[idx].apEntityId.id;
    //   });
    //   if(isAvailable === undefined) {
    //     _selected_ApProtocolDisplayList.splice(idx, 1);
    //     idx--;
    //   }
    // }
    // setSelected_ApProtocolDisplayList(_selected_ApProtocolDisplayList);
    setManagedObjectFormDataEnvelope(transform_ManagedObject_To_FormDataEnvelope({
      apEntityId: managedObject.apEntityId,
      apApiDisplayList: selected_ApApiDisplayList,
      apControlledChannelParameterList: selected_ApControlledChannelParamterList,
      internalReference: managedObject.internalReference,
    }));


    // const _complete_apProtocolDisplayList: TAPProtocolDisplayList = APEnvironmentsDisplayService.create_ConsolidatedApProtocolDisplayList({
    //   apEnvironmentDisplayList: selected_ApEnvironmentDisplayList
    // });
    // setComplete_ApProtocolDisplayList(_complete_apProtocolDisplayList);
    // // remove any protocols from selected protocols if they are not available any more
    // const _selected_ApProtocolDisplayList: TAPProtocolDisplayList = selected_ApProtocolDisplayList;
    // for(let idx=0; idx<_selected_ApProtocolDisplayList.length; idx++) {
    //   const isAvailable = _complete_apProtocolDisplayList.find( (x) => {
    //     return x.apEntityId.id === _selected_ApProtocolDisplayList[idx].apEntityId.id;
    //   });
    //   if(isAvailable === undefined) {
    //     _selected_ApProtocolDisplayList.splice(idx, 1);
    //     idx--;
    //   }
    // }
    // setSelected_ApProtocolDisplayList(_selected_ApProtocolDisplayList);
    // setManagedObjectFormDataEnvelope(transform_ManagedObject_To_FormDataEnvelope({
    //   apEntityId: managedObject.apEntityId,
    //   apEnvironmentDisplayList: selected_ApEnvironmentDisplayList,
    //   apProtocolDisplayList: _complete_apProtocolDisplayList
    // }));
  }, [selected_ApApiDisplayList]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const isSelected_ControlledChannelParameterListValid = (): boolean => {
    const funcName = 'isSelected_ControlledChannelParameterListValid';
    const logName = `${ComponentName}.${funcName}()`;
    alert(`${logName}: anything to validate here?`);
    return true;
    // return selected_ApProtocolDisplayList.length > 0;
  }

  const onSubmitManagedObjectForm = (newMofde: TManagedObjectFormDataEnvelope) => {
    const funcName = 'onSubmitManagedObjectForm';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);
    setIsFormSubmitted(true);
    if(!isSelected_ControlledChannelParameterListValid()) return false;
    props.onSubmit(create_ManagedObject_From_FormEntities({
      formDataEnvelope: newMofde,
      selected_ApApiDisplayList: selected_ApApiDisplayList,
      selected_ApControlledChannelParamterList: selected_ApControlledChannelParamterList,
    }));
  }

  const onInvalidSubmitManagedObjectForm = () => {
    // placeholder
  }

  const onSearchApis = () => {
    setShowSelectApis(true);
  }

  const onSelectApisSuccess = (apApiDisplayList: TAPApiDisplayList) => {
    setSelected_ApApiDisplayList(apApiDisplayList);
    setShowSelectApis(false);
  }

  const onManagedObjectFormSelectApisCancel = () => {
    setShowSelectApis(false);
  }

  const onControlledChannelParameterListSelectionChange = (apControlledChannelParameterList: TAPControlledChannelParameterList) => {
    const funcName = 'onControlledChannelParameterListSelectionChange';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);
    // alert(`${logName}: apProtocolDisplayList = ${APEntityIdsService.create_SortedDisplayNameList_From_ApDisplayObjectList(apProtocolDisplayList)}`);
    setSelected_ApControlledChannelParamterList(apControlledChannelParameterList);
  }

  const displaySelectedControlledChannelParametersErrorMessage = () => {
    if(isFormSubmitted && !isSelected_ControlledChannelParameterListValid()) return <p className="p-error">Validation error ???</p>;
  }

  // const renderSelectProtocols = (complete_apProtocolDisplayList: TAPProtocolDisplayList, selected_apProtocolDisplayList: TAPProtocolDisplayList) => {
  //   return (
  //     <React.Fragment>
  //       <SelectProtocols
  //         complete_apProtocolDisplayList={complete_apProtocolDisplayList}
  //         selected_apProtocolDisplayList={selected_apProtocolDisplayList}
  //         onSelectionChange={onProtocolSelectionChange}
  //       />
  //     </React.Fragment>
  //   );
  // }

  const renderSelect_ControlledChannelParameters = (): JSX.Element => {
    const funcName = 'renderSelect_ControlledChannelParameters';
    const logName = `${ComponentName}.${funcName}()`;
    if(selected_ApApiDisplayList === undefined) throw new Error(`${logName}: selected_ApApiDisplayList === undefined`);
    return(
      <React.Fragment>
        <p><b>Render each Api's channel parameter list individually as well?:</b></p>        
        <hr/>
        <p><b>selected_ApControlledChannelParamterList:</b></p>
        <pre>
          {JSON.stringify(selected_ApControlledChannelParamterList, null, 2)};
        </pre>
        <hr/>
        <p><b>selectedApis_combined_ApApiChannelParameterList:</b></p>
        <pre>
          {JSON.stringify(selectedApis_combined_ApApiChannelParameterList, null, 2)};
        </pre>
        <hr/>
        <p><b>selected_ApApiDisplayList:</b></p>
        <pre>
          {JSON.stringify(selected_ApApiDisplayList, null, 2)};
        </pre>
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

  const renderManagedObjectForm = () => {
    const funcName = 'renderManagedObjectForm';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);
    if(managedObjectFormDataEnvelope === undefined) throw new Error(`${logName}: managedObjectFormDataEnvelope === undefined`);

    return (
      <div className="card p-mt-4">
        <div className="p-fluid">
          <form id={props.formId} onSubmit={managedObjectUseForm.handleSubmit(onSubmitManagedObjectForm, onInvalidSubmitManagedObjectForm)} className="p-fluid">      
            {/* apis */}
            <div className="p-text-bold p-mb-3">API(s):</div>
            {/* <div className="p-ml-3 p-mt-3"> */}
            <div className="p-field">
              <span className="p-float-label">
                <Controller
                  control={managedObjectUseForm.control}
                  name="formData.apisDisplay"
                  rules={{
                    required: "Choose at least 1 API."
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
              {APDisplayUtils.displayFormFieldErrorMessage(managedObjectUseForm.formState.errors.formData?.apisDisplay)}
              { renderApisToolbar() }
              <div>{displaySelectedControlledChannelParametersErrorMessage()}</div>
              { renderSelect_ControlledChannelParameters()}
            </div>
          </form>  
        </div>
      </div>
    );
  }

  
  return (
    <div className="manage-api-products">

      { managedObjectFormDataEnvelope && renderManagedObjectForm() }

      {showSelectApis && selected_ApApiDisplayList && 
        <ManageSelectApis 
          organizationId={props.organizationId}
          selectedApiEntityIdList={APEntityIdsService.create_EntityIdList_From_ApDisplayObjectList(selected_ApApiDisplayList)}
          onSave={onSelectApisSuccess}
          onError={props.onError}          
          onCancel={onManagedObjectFormSelectApisCancel}
          onLoadingChange={props.onLoadingChange}
        />
      } 

    </div>
  );
}
