
import React from "react";
import { useForm, Controller, FieldError } from 'react-hook-form';

import { InputText } from 'primereact/inputtext';
import { InputTextarea } from "primereact/inputtextarea";
import { classNames } from "primereact/utils";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

import { APConnectorFormValidationRules } from "../../utils/APConnectorOpenApiFormValidationRules";
import { TAPAttribute, TAPAttributeList } from "../../utils/APConnectorApiCalls";

import "../APComponents.css";
import 'primeflex/primeflex.css';

export interface IAPManageAttributesProps {
  formId: string;
  presetAttribute?: TAPAttribute;
  attributeList: TAPAttributeList;
  onChange: (attributeList: TAPAttributeList) => void;
}

export const APManageAttributes: React.FC<IAPManageAttributesProps> = (props: IAPManageAttributesProps) => {
  const componentName = 'APManageAttributes';

  type TAttributeFormData = TAPAttribute;
  const emptyManagedAttribute: TAPAttribute = {
    name: '',
    value: ''
  }
  const attributeUseForm = useForm<TAttributeFormData>();

  const [managedAttribute, setManagedAttribute] = React.useState<TAPAttribute>(emptyManagedAttribute);
  const [managedAttributeList, setManagedAttributeList] = React.useState<TAPAttributeList>(props.attributeList);
  const [isManagedAttributeListChanged, setIsManagedAttributeListChanged] = React.useState<boolean>(false);
  const [attributeFormData, setAttributeFormData] = React.useState<TAttributeFormData>();
  const attributeDataTableRef = React.useRef<any>(null);

  const transformManagedAttributeToFormData = (managedAttribute: TAPAttribute): TAttributeFormData => {
    return {
      ...managedAttribute
    };
  }
  const transformFormDataToManagedAttribute = (formData: TAttributeFormData): TAPAttribute => {
    return {
      ...formData
    }
  }

  React.useEffect(() => {
    if(props.presetAttribute) {
      setManagedAttribute(props.presetAttribute);
      attributeUseForm.clearErrors();
    }
  }, [props.presetAttribute]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(managedAttribute) setAttributeFormData(transformManagedAttributeToFormData(managedAttribute));
  }, [managedAttribute]) /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(isManagedAttributeListChanged) props.onChange(managedAttributeList);
  }, [managedAttributeList]) /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(attributeFormData) doPopulateAttributeFormDataValues(attributeFormData);
  }, [attributeFormData]) /* eslint-disable-line react-hooks/exhaustive-deps */

  const doPopulateAttributeFormDataValues = (attributeFormData: TAttributeFormData) => {
    attributeUseForm.setValue('name', attributeFormData.name);
    attributeUseForm.setValue('value', attributeFormData.value);
  }

  const doAddManagedAttribute = (managedAttribute: TAPAttribute) => {
    setManagedAttribute(emptyManagedAttribute);
    setIsManagedAttributeListChanged(true);
    const _managedAttributeList: TAPAttributeList = [...managedAttributeList];
    _managedAttributeList.push(managedAttribute);
    setManagedAttributeList(_managedAttributeList);
  }
  const doRemoveManagedAttribute = (managedAttribute: TAPAttribute) => {
    const idx = managedAttributeList.indexOf(managedAttribute);
    const _mal = [...managedAttributeList];
    _mal.splice(idx, 1);
    setManagedAttributeList(_mal);
    setIsManagedAttributeListChanged(true);
  }
  const onSubmitAttributeForm = (attributeFormData: TAttributeFormData) => {
    doAddManagedAttribute(transformFormDataToManagedAttribute(attributeFormData));
  }
  const onInvalidSubmitAttributeForm = () => {
    // placeholder
  }

  const displayManagedAttributeFormFieldErrorMessage = (fieldError: FieldError | undefined) => {
    return fieldError && <small className="p-error">{fieldError.message}</small>    
  }

  const renderAttributeTable = (): JSX.Element => {
    const actionBodyTemplate = (attribute: TAPAttribute) => {
      return (
          <React.Fragment>
            <Button 
              key={componentName+'remove'+attribute.name} 
              type='button'
              icon="pi pi-times" 
              className="p-button-rounded p-button-outlined p-button-secondary p-mr-2" 
              onClick={() => doRemoveManagedAttribute(attribute)} 
            />
          </React.Fragment>
      );
    }  
    return (
      // <div className="card" style={{ width: '80em'}}>
      <React.Fragment>
        <DataTable
          ref={attributeDataTableRef}
          className="p-datatable-sm"
          showGridlines={false}
          value={managedAttributeList}
          emptyMessage='No attributes defined.'
          scrollable 
          dataKey="name"  
          sortMode='single'
          sortField="name"
          sortOrder={1}
        >
          <Column field="name" header="Attribute Name" sortable style={{ width: "20em"}}/>
          <Column field="value" header="Attribute Value" 
            bodyStyle={{
              'overflow-wrap': 'break-word',
              'word-wrap': 'break-word'
            }} 
          />
          <Column 
            body={actionBodyTemplate} 
            headerStyle={{width: '5em', textAlign: 'center'}} 
            bodyStyle={{textAlign: 'center' }}
          />
        </DataTable>
      </React.Fragment>        
      // </div>
    );
  }

  const validateAttributeName = (value: string): string | boolean => {
    // check if name is unique
    const found: TAPAttribute | undefined = managedAttributeList.find( (attribute: TAPAttribute) => {
      return attribute.name === value;
    });
    if(found) return `Attribute name already exists.`;
    return true;
  }

  return (
    <div className="card">
      <div className="p-fluid">
        <form id={props.formId} onSubmit={attributeUseForm.handleSubmit(onSubmitAttributeForm, onInvalidSubmitAttributeForm)} className="p-fluid">           
          <div className="p-formgroup-inline">
            {/* Name */}
            <div className="p-field" style={{ width: '20%' }} >
              <span className="p-float-label p-input-icon-right">
                <i className="pi pi-key" />
                <Controller
                  name="name"
                  control={attributeUseForm.control}
                  rules={{
                    ...APConnectorFormValidationRules.AttributeName(),
                    validate: validateAttributeName,
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
                <label htmlFor="name" className={classNames({ 'p-error': attributeUseForm.formState.errors.name })}>Attribute Name*</label>
              </span>
              {displayManagedAttributeFormFieldErrorMessage(attributeUseForm.formState.errors.name)}
            </div>
            {/* Value */}
            <div className="p-field" style={{ width: '75%' }} >
              <span className="p-float-label">
                <Controller
                  name="value"
                  control={attributeUseForm.control}
                  rules={APConnectorFormValidationRules.AttributeValue()}
                  render={( { field, fieldState }) => {
                    return(
                      <InputTextarea
                        id={field.name}
                        {...field}
                        className={classNames({ 'p-invalid': fieldState.invalid })}                       
                        rows={1}
                        autoResize
                      />
                  )}}
                />
                <label htmlFor="value" className={classNames({ 'p-error': attributeUseForm.formState.errors.value })}>Attribute Value*</label>
              </span>
              {displayManagedAttributeFormFieldErrorMessage(attributeUseForm.formState.errors.value)}
            </div>
            <div>          
              <Button key={componentName+'submit'} form={props.formId} type="submit" icon="pi pi-plus" className="p-button-text p-button-plain p-button-outlined" />
            </div>  
          </div>
          {renderAttributeTable()}
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