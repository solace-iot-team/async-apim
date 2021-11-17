
import React from "react";
import { useForm, Controller, FieldError } from 'react-hook-form';

import { InputText } from 'primereact/inputtext';
import { classNames } from "primereact/utils";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

import { APConnectorFormValidationRules } from "../../utils/APConnectorOpenApiFormValidationRules";
import { WebHook, WebHookTLSOptions } from "@solace-iot-team/apim-connector-openapi-browser";
import { TAPTrustedCN, TAPTrustedCNList } from "../APComponentsCommon";

import "../APComponents.css";
import 'primeflex/primeflex.css';

export interface IAPManageTrustedCNsProps {
  formId: string;
  presetTrustedCN?: TAPTrustedCN;
  trustedCNList: TAPTrustedCNList;
  onChange: (trustedCNList: TAPTrustedCNList) => void;
}

export const APManageTrustedCNs: React.FC<IAPManageTrustedCNsProps> = (props: IAPManageTrustedCNsProps) => {
  const componentName = 'APManageTrustedCNs';

  type TManaged_TrustedCN = {
    name: TAPTrustedCN;
  }
  type TManaged_TrustedCNList = Array<TManaged_TrustedCN>;
  type TManaged_TrustedCNFormData = TManaged_TrustedCN;
  const emptyManaged_TrustedCN: TManaged_TrustedCN = {
    name: ''
  };

  const transformAPTrustedCNToManagedTrustedCN = (apTrustedCN: TAPTrustedCN): TManaged_TrustedCN => {
    return {
      name: apTrustedCN
    }
  }
  const transformAPTrustedCNListToManagedTrustedCNList = (apTrustedCNList: TAPTrustedCNList): TManaged_TrustedCNList => {
    return apTrustedCNList.map( (trustedCN: string) => {
      return transformAPTrustedCNToManagedTrustedCN(trustedCN);
    });
  }
  const managed_TrustedCNUseForm = useForm<TManaged_TrustedCNFormData>();

  const [managed_TrustedCN, setManaged_TrustedCN] = React.useState<TManaged_TrustedCN>(emptyManaged_TrustedCN);
  const [managed_TrustedCNList, setManaged_TrustedCNList] = React.useState<TManaged_TrustedCNList>(transformAPTrustedCNListToManagedTrustedCNList(props.trustedCNList));
  const [isManaged_TrustedCNListChanged, setIsManaged_TrustedCNListChanged] = React.useState<boolean>(false);
  const [managed_TrustedCNFormData, setManaged_TrustedCNFormData] = React.useState<TManaged_TrustedCNFormData>();
  const managed_TrustedCNDataTableRef = React.useRef<any>(null);

  const transformManaged_TrustedCNToFormData = (mo: TManaged_TrustedCN): TManaged_TrustedCNFormData => {
    return {
      ...mo
    };
  }
  const transformFormDataToManaged_TrustedCN = (formData: TManaged_TrustedCNFormData): TManaged_TrustedCN => {
    return {
      ...formData
    }
  }
  const transform_Managed_TrustedCN_To_APTrustedCN = (mo: TManaged_TrustedCN): TAPTrustedCN => {
    return mo.name;
  }
  const transfrom_Managed_TrustedCNList_To_APTrustedCNList = (moList: TManaged_TrustedCNList): TAPTrustedCNList => {
    return moList.map( (mo: TManaged_TrustedCN) => {
      return transform_Managed_TrustedCN_To_APTrustedCN(mo);
    });
  }

  React.useEffect(() => {
    if(props.presetTrustedCN) {
      setManaged_TrustedCN(transformAPTrustedCNToManagedTrustedCN(props.presetTrustedCN));
      managed_TrustedCNUseForm.clearErrors();
    }
  }, [props.presetTrustedCN]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(managed_TrustedCN) setManaged_TrustedCNFormData(transformManaged_TrustedCNToFormData(managed_TrustedCN));
  }, [managed_TrustedCN]) /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(isManaged_TrustedCNListChanged) {
      managed_TrustedCNUseForm.clearErrors();
      if(managed_TrustedCNUseForm.getValues('name') !== '') managed_TrustedCNUseForm.trigger();
      props.onChange(transfrom_Managed_TrustedCNList_To_APTrustedCNList(managed_TrustedCNList));
    }
  }, [managed_TrustedCNList]) /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(managed_TrustedCNFormData) doPopulateManaged_TrustedCNFormDataValues(managed_TrustedCNFormData);
  }, [managed_TrustedCNFormData]) /* eslint-disable-line react-hooks/exhaustive-deps */

  const doPopulateManaged_TrustedCNFormDataValues = (formData: TManaged_TrustedCNFormData) => {
    managed_TrustedCNUseForm.setValue('name', formData.name);
  }

  const doAddManaged_TrustedCN = (mo: TManaged_TrustedCN) => {
    setManaged_TrustedCN(emptyManaged_TrustedCN);
    setIsManaged_TrustedCNListChanged(true);
    const newMoList: TManaged_TrustedCNList = [...managed_TrustedCNList];
    newMoList.push(mo);
    setManaged_TrustedCNList(newMoList);
  }
  const doRemoveManaged_TrustedCN = (mo: TManaged_TrustedCN) => {
    const idx = managed_TrustedCNList.indexOf(mo);
    const newMoList = [...managed_TrustedCNList];
    newMoList.splice(idx, 1);
    setManaged_TrustedCNList(newMoList);
    setIsManaged_TrustedCNListChanged(true);
  }
  const onSubmitManaged_TrustedCNForm_APManageTrustedCNs = (formData: TManaged_TrustedCNFormData) => {
    const funcName = 'onSubmitManaged_TrustedCNForm_APManageTrustedCNs';
    const logName = `${componentName}.${funcName}()`;
    doAddManaged_TrustedCN(transformFormDataToManaged_TrustedCN(formData));
  }
  const onInvalidSubmitManaged_TrustedCNForm_APManageTrustedCNs = () => {
    // placeholder
  }

  const displayManaged_TrustedCNFormFieldErrorMessage = (fieldError: FieldError | undefined) => {
    return fieldError && <small className="p-error">{fieldError.message}</small>    
  }

  const renderManaged_TrustedCNTable = (): JSX.Element => {
    const actionBodyTemplate = (rowData: TManaged_TrustedCN) => {
      return (
          <React.Fragment>
            <Button 
              key={componentName+'remove'+rowData.name} 
              type='button'
              icon="pi pi-times" 
              className="p-button-rounded p-button-outlined p-button-secondary p-mr-2" 
              onClick={() => doRemoveManaged_TrustedCN(rowData)} 
            />
          </React.Fragment>
      );
    }  
    return (
      <React.Fragment>
        <DataTable
          ref={managed_TrustedCNDataTableRef}
          className="p-datatable-sm"
          showGridlines={false}
          value={managed_TrustedCNList}
          emptyMessage='No trusted common names defined.'
          scrollable 
          dataKey="name"  
          sortMode='single'
          sortField="name"
          sortOrder={1}
        >
          <Column field="name" header="Trusted CN" sortable />
          <Column body={actionBodyTemplate} bodyStyle={{ width: '3em', textAlign: 'end' }} />
        </DataTable>
      </React.Fragment>        
    );
  }

  const validateTrustedCN = (value: string): string | boolean => {
    // check if name is unique
    const found: TManaged_TrustedCN | undefined = managed_TrustedCNList.find( (mo: TManaged_TrustedCN) => {
      return mo.name === value;
    });
    if(found) return `Trusted CN already exists.`;
    return true;
  }

  return (
    <div className="card">
      <div className="p-fluid">
        <form id={props.formId} onSubmit={managed_TrustedCNUseForm.handleSubmit(onSubmitManaged_TrustedCNForm_APManageTrustedCNs, onInvalidSubmitManaged_TrustedCNForm_APManageTrustedCNs)} className="p-fluid">           
          <div className="p-formgroup-inline">
            {/* Name */}
            <div className="p-field" style={{ width: '96%' }} >
              <span className="p-float-label">
                <Controller
                  name="name"
                  control={managed_TrustedCNUseForm.control}
                  rules={{
                    ...APConnectorFormValidationRules.TrustedCN(),
                    validate: validateTrustedCN,
                  }}
                  render={( { field, fieldState }) => {
                    return(
                      <InputText
                        id={field.name}
                        {...field}
                        className={classNames({ 'p-invalid': fieldState.invalid })}                       
                      />
                  )}}
                />
                <label htmlFor="name" className={classNames({ 'p-error': managed_TrustedCNUseForm.formState.errors.name })}>Trusted CN*</label>
              </span>
              {displayManaged_TrustedCNFormFieldErrorMessage(managed_TrustedCNUseForm.formState.errors.name)}
            </div>
            <div>          
              <Button key={componentName+'submit'} form={props.formId} type="submit" icon="pi pi-plus" className="p-button-text p-button-plain p-button-outlined" />
            </div>  
          </div>
          {renderManaged_TrustedCNTable()}
          {/* DEBUG */}
          {/* <p>managedAttributeList:</p>
          <pre style={ { fontSize: '10px' }} >
            {JSON.stringify(managedAttributeList, null, 2)}
          </pre> */}
        </form>  
      </div>
    </div>
  );


}
