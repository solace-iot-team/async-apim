
import React from "react";
import { useForm, Controller } from 'react-hook-form';

import { InputText } from 'primereact/inputtext';
import { InputTextarea } from "primereact/inputtextarea";
import { classNames } from "primereact/utils";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

import { APConnectorFormValidationRules } from "../../utils/APConnectorOpenApiFormValidationRules";
import APAttributesDisplayService, { 
  IAPAttributeDisplay, 
  TAPAttributeDisplayList, 
  TAPRawAttribute
} from "../../displayServices/APAttributesDisplayService/APAttributesDisplayService";
import APDisplayUtils from "../../displayServices/APDisplayUtils";

import "../APComponents.css";
import 'primeflex/primeflex.css';

// export enum EAction {
//   NEW = "NEW",
//   EDIT = "EDIT"
// }

export interface IEditNewApAttributeListFormProps {
  // action: EAction;
  uniqueKeyPrefix: string; /** provide a unique prefix for the formId and button keys so component can be used multiple times on same parent component with different formIds */
  apAttributeDisplayList: TAPAttributeDisplayList;
  presetApAttributeDisplay?: IAPAttributeDisplay; /** preset attribute form with values */
  tableNameFieldHeader: string;
  tableValueFieldHeader: string;
  onChange: (apAttributeDisplayList: TAPAttributeDisplayList) => void; /** called every time the list has changed */
}

export const EditNewApAttributeListForm: React.FC<IEditNewApAttributeListFormProps> = (props: IEditNewApAttributeListFormProps) => {
  const ComponentName = 'EditNewApAttributeListForm';

  type TManagedObject = IAPAttributeDisplay; 
  type TManagedObjectList = Array<TManagedObject>;

  type TManagedObjectFormData = {
    attribute: TAPRawAttribute;
  };
  type TManagedObjectFormDataEnvelope = {
    formData: TManagedObjectFormData;
  }

  const transform_ManagedObject_To_FormDataEnvelope = (mo: TManagedObject): TManagedObjectFormDataEnvelope => {
    const fd: TManagedObjectFormData = {
      attribute: APAttributesDisplayService.create_ApRawAttribute(mo)
    };
    return {
      formData: fd
    };
  }

  const create_ManagedObject_From_FormEntities = ({formDataEnvelope}: {
    formDataEnvelope: TManagedObjectFormDataEnvelope;
  }): TManagedObject => {
    const mo: TManagedObject = APAttributesDisplayService.create_ApAttributeDisplay(formDataEnvelope.formData.attribute);
    return mo;
  }

  const EmptyManagedObject: TManagedObject = APAttributesDisplayService.create_Empty_ApAttributeDisplay();
  const UniqueKeyPrefix: string = props.uniqueKeyPrefix + ComponentName;
  const FormId: string = UniqueKeyPrefix + 'form';

  const [managedObject, setManagedObject] = React.useState<TManagedObject>(EmptyManagedObject);
  const [managedObjectList, setManagedObjectList] = React.useState<TManagedObjectList>(props.apAttributeDisplayList);
  const [isManagedObjectListChanged, setIsManagedObjectListChanged] = React.useState<boolean>(false);
  const [managedObjectFormDataEnvelope, setManagedObjectFormDataEnvelope] = React.useState<TManagedObjectFormDataEnvelope>();
  const managedObjectDataTableRef = React.useRef<any>(null);
  const managedObjectUseForm = useForm<TManagedObjectFormDataEnvelope>();


  React.useEffect(() => {
    if(props.presetApAttributeDisplay) {
      setManagedObject(props.presetApAttributeDisplay);
      managedObjectUseForm.clearErrors();
    }
  }, [props.presetApAttributeDisplay]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(managedObject) {
      managedObjectUseForm.clearErrors();
      if(!APAttributesDisplayService.is_Empty_ApAttributeDisplay(managedObject)) {
        setManagedObjectFormDataEnvelope(transform_ManagedObject_To_FormDataEnvelope(managedObject));
      } 
      managedObjectUseForm.clearErrors();
      const attributeName: string | undefined = managedObjectUseForm.getValues('formData.attribute.name');
      if(attributeName !== undefined && attributeName !== '') managedObjectUseForm.trigger();
      // managedObjectUseForm.clearErrors();
      // const connectorAttributeName = attributeUseForm.getValues('connectorAttribute.name');
      // if(connectorAttributeName !== undefined && connectorAttributeName !== '') attributeUseForm.trigger();
    }
  }, [managedObject]) /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(isManagedObjectListChanged) {
      props.onChange(managedObjectList);
      setIsManagedObjectListChanged(false);
    }
  }, [managedObjectList, isManagedObjectListChanged]) /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(managedObjectFormDataEnvelope) managedObjectUseForm.setValue('formData', managedObjectFormDataEnvelope.formData);
  }, [managedObjectFormDataEnvelope]) /* eslint-disable-line react-hooks/exhaustive-deps */

  // React.useEffect(() => {
  //   if(attributeFormData) doPopulateAttributeFormDataValues(attributeFormData);
  // }, [attributeFormData]) /* eslint-disable-line react-hooks/exhaustive-deps */

  // const doPopulateAttributeFormDataValues = (fd: TManagedAttributeFormData) => {
  //   attributeUseForm.setValue('connectorAttribute', fd.connectorAttribute);
  //   // attributeUseForm.setValue('value', attributeFormData.value);
  // }

  const doAddManagedObject = (mo: TManagedObject) => {

    setManagedObjectFormDataEnvelope(transform_ManagedObject_To_FormDataEnvelope(EmptyManagedObject));
    setManagedObject(EmptyManagedObject);
    
    setManagedObjectList(APAttributesDisplayService.add_ApAttributeDisplay_To_ApAttributeDisplayList({
      apAttributeDisplay: mo,
      apAttributeDisplayList: managedObjectList
    }));
    setIsManagedObjectListChanged(true);

    // setAttributeFormData(transformManagedAttributeToFormData(emptyManagedAttribute));
    // setManagedAttribute(emptyManagedAttribute);
    // setManagedAttributeList(APAttributesService.add_ApAttributeDisplay_To_ApAttributeDisplayList(managedAttributeList, ma));
    // setIsManagedAttributeListChanged(true);
  }
  const doRemoveManagedObject = (mo: TManagedObject) => {
    setManagedObjectList(APAttributesDisplayService.remove_ApAttributeDisplay_From_ApAttributeDisplayList({
      apAttributeDisplay: mo,
      apAttributeDisplayList: managedObjectList
    }));
    setIsManagedObjectListChanged(true);
    // setManagedAttributeList(APAttributesService.remove_ApAttributeDisplay_From_ApAttributeDisplayList(managedAttributeList, ma));
    // setIsManagedAttributeListChanged(true);
  }
  const onSubmitManagedObjectForm = (mofde: TManagedObjectFormDataEnvelope) => {
    doAddManagedObject(create_ManagedObject_From_FormEntities({ formDataEnvelope: mofde }));
  }
  const onInvalidSubmitManagedObjectForm = () => {
    // placeholder
  }

  // const displayManagedAttributeFormFieldErrorMessage = (fieldError: FieldError | undefined) => {
  //   return fieldError && <small className="p-error">{fieldError.message}</small>    
  // }

  const renderAttributeTable = (): JSX.Element => {
    const actionBodyTemplate = (mo: TManagedObject) => {
      return (
          <React.Fragment>
            <Button 
              key={UniqueKeyPrefix+'_remove_'+mo.apEntityId.id} 
              type='button'
              icon="pi pi-times" 
              className="p-button-rounded p-button-outlined p-button-secondary p-mr-2" 
              onClick={() => doRemoveManagedObject(mo)} 
            />
          </React.Fragment>
      );
    }
    const dataKey = APAttributesDisplayService.nameOf_ApEntityId('id');
    const sortField = APAttributesDisplayService.nameOf_ApEntityId('displayName');
    const nameField = APAttributesDisplayService.nameOf_ApEntityId('displayName');
    const valueField = APAttributesDisplayService.nameOf('value');
    return (
      <React.Fragment>
        <DataTable
          ref={managedObjectDataTableRef}
          className="p-datatable-sm"
          showGridlines={false}
          value={managedObjectList}
          emptyMessage='No attributes defined.'
          scrollable 
          dataKey={dataKey}  
          sortMode='single'
          sortField={sortField}
          sortOrder={1}
          // resizableColumns 
          // columnResizeMode="fit"
          autoLayout={true}
        >
          {/* <Column header={props.tableNameFieldHeader} field={nameField} sortable /> */}
          <Column header={props.tableNameFieldHeader} headerStyle={{ width: "20em"}} field={nameField} sortable />
          {/* <Column header={props.tableValueFieldHeader} field={valueField} /> */}
          <Column header={props.tableValueFieldHeader} field={valueField} bodyStyle={{ overflowWrap: 'break-word', wordWrap: 'break-word' }} />
          <Column body={actionBodyTemplate} bodyStyle={{ width: '3em', textAlign: 'end' }} />
        </DataTable>
      </React.Fragment>        
    );
  }

  const validateAttributeName = (name: string): string | boolean => {
    // check that name is unique
    if(APAttributesDisplayService.exists_ApAttributeDisplayId_In_ApAttributeDisplayList({
      id: name,
      apAttributeDisplayList: managedObjectList
    })) {
      return `Attribute name already exists.`;
    }
    return true;
  }

  return (
    <div className="card">
      <div className="p-fluid">
        <form id={FormId} onSubmit={managedObjectUseForm.handleSubmit(onSubmitManagedObjectForm, onInvalidSubmitManagedObjectForm)} className="p-fluid">           
          <div className="p-formgroup-inline">
            {/* Name */}
            <div className="p-field" style={{ width: '20%' }} >
              <span className="p-float-label p-input-icon-right">
                <i className="pi pi-key" />
                <Controller
                  control={managedObjectUseForm.control}
                  name="formData.attribute.name"
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
                <label className={classNames({ 'p-error': managedObjectUseForm.formState.errors.formData?.attribute?.name })}>Attribute Name*</label>
              </span>
              {APDisplayUtils.displayFormFieldErrorMessage(managedObjectUseForm.formState.errors.formData?.attribute?.name)}
            </div>
            {/* Value */}
            <div className="p-field" style={{ width: '75%' }} >
              <span className="p-float-label">
                <Controller
                  control={managedObjectUseForm.control}
                  name="formData.attribute.value"
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
                <label className={classNames({ 'p-error': managedObjectUseForm.formState.errors.formData?.attribute?.value })}>Attribute Value*</label>
              </span>
              {APDisplayUtils.displayFormFieldErrorMessage(managedObjectUseForm.formState.errors.formData?.attribute?.value)}
            </div>
            <div>          
              <Button key={UniqueKeyPrefix+'submit'} form={FormId} type="submit" icon="pi pi-plus" className="p-button-text p-button-plain p-button-outlined" />
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
