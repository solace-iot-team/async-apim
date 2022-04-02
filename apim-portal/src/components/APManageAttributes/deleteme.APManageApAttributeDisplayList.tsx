
import React from "react";
import { useForm, Controller, FieldError } from 'react-hook-form';

import { InputText } from 'primereact/inputtext';
import { InputTextarea } from "primereact/inputtextarea";
import { classNames } from "primereact/utils";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

import { APConnectorFormValidationRules } from "../../utils/APConnectorOpenApiFormValidationRules";
// import { TAPAttribute, TAPAttributeList } from "../../utils/APAttributes/APAttributesService";
import APAttributesService, { TAPAttributeDisplay, TAPAttributeDisplayList } from "../../utils/APAttributes/deleteme.APAttributesService";

import "../APComponents.css";
import 'primeflex/primeflex.css';

export interface IAPManageApAttributeDisplayListProps {
  formId: string;
  presetApAttributeDisplay?: TAPAttributeDisplay;
  apAttributeDisplayList: TAPAttributeDisplayList;
  onChange: (apAttributeDisplayList: TAPAttributeDisplayList) => void;
}

export const APManageApAttributeDisplayList: React.FC<IAPManageApAttributeDisplayListProps> = (props: IAPManageApAttributeDisplayListProps) => {
  const componentName = 'APManageApAttributeDisplayList';

  type TManagedAttribute = TAPAttributeDisplay; 
  type TManagedAttributeList = Array<TManagedAttribute>;
  type TManagedAttributeFormData = TManagedAttribute;
  const emptyManagedAttribute: TManagedAttribute = APAttributesService.create_EmptyObject();
  const attributeUseForm = useForm<TManagedAttributeFormData>();

  const [managedAttribute, setManagedAttribute] = React.useState<TManagedAttribute>(emptyManagedAttribute);
  const [managedAttributeList, setManagedAttributeList] = React.useState<TManagedAttributeList>(props.apAttributeDisplayList);
  const [isManagedAttributeListChanged, setIsManagedAttributeListChanged] = React.useState<boolean>(false);
  const [attributeFormData, setAttributeFormData] = React.useState<TManagedAttributeFormData>();
  const attributeDataTableRef = React.useRef<any>(null);

  const transformManagedAttributeToFormData = (ma: TManagedAttribute): TManagedAttributeFormData => {
    return {
      ...ma
    };
  }
  const transformFormDataToManagedAttribute = (fd: TManagedAttributeFormData): TManagedAttribute => {
    // edited: connectorAttribute
    return APAttributesService.create_ApAttributeDisplay_From_ConnnectorAttribute(fd.connectorAttribute);
  }

  React.useEffect(() => {
    if(props.presetApAttributeDisplay) {
      setManagedAttribute(props.presetApAttributeDisplay);
      attributeUseForm.clearErrors();
    }
  }, [props.presetApAttributeDisplay]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(managedAttribute) {
      if(!APAttributesService.is_EmptyObject(managedAttribute)) {
        setAttributeFormData(transformManagedAttributeToFormData(managedAttribute));
      }
      attributeUseForm.clearErrors();
      const connectorAttributeName = attributeUseForm.getValues('connectorAttribute.name');
      if(connectorAttributeName !== undefined && connectorAttributeName !== '') attributeUseForm.trigger();
    }
  }, [managedAttribute]) /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(isManagedAttributeListChanged) {
      props.onChange(managedAttributeList);
      setIsManagedAttributeListChanged(false);
    }
  }, [managedAttributeList, isManagedAttributeListChanged]) /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(attributeFormData) doPopulateAttributeFormDataValues(attributeFormData);
  }, [attributeFormData]) /* eslint-disable-line react-hooks/exhaustive-deps */

  const doPopulateAttributeFormDataValues = (fd: TManagedAttributeFormData) => {
    attributeUseForm.setValue('connectorAttribute', fd.connectorAttribute);
    // attributeUseForm.setValue('value', attributeFormData.value);
  }

  const doAddManagedAttribute = (ma: TManagedAttribute) => {
    setAttributeFormData(transformManagedAttributeToFormData(emptyManagedAttribute));
    setManagedAttribute(emptyManagedAttribute);
    setManagedAttributeList(APAttributesService.add_ApAttributeDisplay_To_ApAttributeDisplayList(managedAttributeList, ma));
    setIsManagedAttributeListChanged(true);
  }
  const doRemoveManagedAttribute = (ma: TManagedAttribute) => {
    setManagedAttributeList(APAttributesService.remove_ApAttributeDisplay_From_ApAttributeDisplayList(managedAttributeList, ma));
    setIsManagedAttributeListChanged(true);
  }
  const onSubmitAttributeForm = (mafd: TManagedAttributeFormData) => {
    doAddManagedAttribute(transformFormDataToManagedAttribute(mafd));
  }
  const onInvalidSubmitAttributeForm = () => {
    // placeholder
  }

  const displayManagedAttributeFormFieldErrorMessage = (fieldError: FieldError | undefined) => {
    return fieldError && <small className="p-error">{fieldError.message}</small>    
  }

  const renderAttributeTable = (): JSX.Element => {
    const actionBodyTemplate = (ma: TManagedAttribute) => {
      return (
          <React.Fragment>
            <Button 
              key={componentName+'remove'+ma.apEntityId.id} 
              type='button'
              icon="pi pi-times" 
              className="p-button-rounded p-button-outlined p-button-secondary p-mr-2" 
              onClick={() => doRemoveManagedAttribute(ma)} 
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
          dataKey="apEntityId.id"  
          sortMode='single'
          sortField="apEntityId.displayName"
          sortOrder={1}
        >
          <Column field="apEntityId.displayName" header="Attribute Name" sortable style={{ width: "20em"}}/>
          <Column field="connectorAttribute.value" header="Attribute Value" bodyStyle={{ overflowWrap: 'break-word', wordWrap: 'break-word' }} />
          <Column body={actionBodyTemplate} bodyStyle={{ width: '3em', textAlign: 'end' }} />
        </DataTable>
      </React.Fragment>        
    );
  }

  const validateAttributeName = (name: string): string | boolean => {
    // check that name is unique
    const found: TAPAttributeDisplay | undefined = managedAttributeList.find( (apAttributeDisplay: TAPAttributeDisplay) => {
      return apAttributeDisplay.connectorAttribute.name === name;
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
                  name="connectorAttribute.name"
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
                <label htmlFor="connectorAttribute.name" className={classNames({ 'p-error': attributeUseForm.formState.errors.connectorAttribute?.name })}>Attribute Name*</label>
              </span>
              {displayManagedAttributeFormFieldErrorMessage(attributeUseForm.formState.errors.connectorAttribute?.name)}
            </div>
            {/* Value */}
            <div className="p-field" style={{ width: '75%' }} >
              <span className="p-float-label">
                <Controller
                  name="connectorAttribute.value"
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
                <label htmlFor="connectorAttribute.value" className={classNames({ 'p-error': attributeUseForm.formState.errors.connectorAttribute?.value })}>Attribute Value*</label>
              </span>
              {displayManagedAttributeFormFieldErrorMessage(attributeUseForm.formState.errors.connectorAttribute?.value)}
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
