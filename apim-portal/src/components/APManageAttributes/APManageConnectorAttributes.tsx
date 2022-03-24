
import React from "react";
import { useForm, Controller, FieldError } from 'react-hook-form';

import { InputText } from 'primereact/inputtext';
import { InputTextarea } from "primereact/inputtextarea";
import { classNames } from "primereact/utils";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

import { APConnectorFormValidationRules } from "../../utils/APConnectorOpenApiFormValidationRules";
import { TAPConnectorAttribute, TAPConnectorAttributeList } from "../../utils/APAttributes/deleteme.APAttributesService";

import "../APComponents.css";
import 'primeflex/primeflex.css';


// TODO: remove this component once all components using it are re-factored

export interface IAPManageConnectorAttributesProps {
  formId: string;
  presetAttribute?: TAPConnectorAttribute;
  attributeList: TAPConnectorAttributeList;
  onChange: (attributeList: TAPConnectorAttributeList) => void;
}

export const APManageConnectorAttributes: React.FC<IAPManageConnectorAttributesProps> = (props: IAPManageConnectorAttributesProps) => {
  const componentName = 'APManageConnectorAttributes';

  type TAttributeFormData = TAPConnectorAttribute;
  const emptyManagedAttribute: TAPConnectorAttribute = {
    name: '',
    value: ''
  }
  const attributeUseForm = useForm<TAttributeFormData>();

  const [managedAttribute, setManagedAttribute] = React.useState<TAPConnectorAttribute>(emptyManagedAttribute);
  const [managedAttributeList, setManagedAttributeList] = React.useState<TAPConnectorAttributeList>(props.attributeList);
  const [isManagedAttributeListChanged, setIsManagedAttributeListChanged] = React.useState<boolean>(false);
  const [attributeFormData, setAttributeFormData] = React.useState<TAttributeFormData>();
  const attributeDataTableRef = React.useRef<any>(null);

  const transformManagedAttributeToFormData = (managedAttribute: TAPConnectorAttribute): TAttributeFormData => {
    return {
      ...managedAttribute
    };
  }
  const transformFormDataToManagedAttribute = (formData: TAttributeFormData): TAPConnectorAttribute => {
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
    if(isManagedAttributeListChanged) {
      attributeUseForm.clearErrors();
      if(attributeUseForm.getValues('name') !== '') attributeUseForm.trigger();
      props.onChange(managedAttributeList);
    }
  }, [managedAttributeList]) /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(attributeFormData) doPopulateAttributeFormDataValues(attributeFormData);
  }, [attributeFormData]) /* eslint-disable-line react-hooks/exhaustive-deps */

  const doPopulateAttributeFormDataValues = (attributeFormData: TAttributeFormData) => {
    attributeUseForm.setValue('name', attributeFormData.name);
    attributeUseForm.setValue('value', attributeFormData.value);
  }

  const doAddManagedAttribute = (managedAttribute: TAPConnectorAttribute) => {
    setManagedAttribute(emptyManagedAttribute);
    setIsManagedAttributeListChanged(true);
    const _managedAttributeList: TAPConnectorAttributeList = [...managedAttributeList];
    _managedAttributeList.push(managedAttribute);
    setManagedAttributeList(_managedAttributeList);
  }
  const doRemoveManagedAttribute = (managedAttribute: TAPConnectorAttribute) => {
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
    const actionBodyTemplate = (attribute: TAPConnectorAttribute) => {
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
          <Column field="value" header="Attribute Value" bodyStyle={{ overflowWrap: 'break-word', wordWrap: 'break-word' }} />
          <Column body={actionBodyTemplate} bodyStyle={{ width: '3em', textAlign: 'end' }} />
        </DataTable>
      </React.Fragment>        
    );
  }

  const validateAttributeName = (value: string): string | boolean => {
    // check if name is unique
    const found: TAPConnectorAttribute | undefined = managedAttributeList.find( (attribute: TAPConnectorAttribute) => {
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
