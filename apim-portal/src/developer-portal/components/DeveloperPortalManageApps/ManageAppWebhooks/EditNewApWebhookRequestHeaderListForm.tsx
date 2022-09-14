
import React from "react";
import { useForm, Controller } from 'react-hook-form';

import { InputText } from 'primereact/inputtext';
import { InputTextarea } from "primereact/inputtextarea";
import { classNames } from "primereact/utils";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

import APAppWebhooksDisplayService, { TAPWebhookRequestHeader, TAPWebhookRequestHeaderList } from "../../../../displayServices/APAppsDisplayService/APAppWebhooksDisplayService";
import APDisplayUtils from "../../../../displayServices/APDisplayUtils";
import { APConnectorFormValidationRules } from "../../../../utils/APConnectorOpenApiFormValidationRules";

import '../../../../components/APComponents.css';
import "../DeveloperPortalManageApps.css";
import 'primeflex/primeflex.css';

export interface IEditNewApWebhookRequestHeaderListFormProps {
  apWebhookRequestHeaderList: TAPWebhookRequestHeaderList;
  onChange: (apWebhookRequestHeaderList: TAPWebhookRequestHeaderList) => void; /** called every time the list has changed */
}

export const EditNewApWebhookRequestHeaderListForm: React.FC<IEditNewApWebhookRequestHeaderListFormProps> = (props: IEditNewApWebhookRequestHeaderListFormProps) => {
  const ComponentName = 'EditNewApWebhookRequestHeaderListForm';

  const EmptyMessage: string = 'No custom headers defined.';
  const TableHeader_HeaderName = "Header";
  const TableHeader_HeaderValue = "Value";

  type TManagedObject = TAPWebhookRequestHeader; 
  type TManagedObjectList = Array<TManagedObject>;

  type TManagedObjectFormData = {
    requestHeader: TAPWebhookRequestHeader;
  };
  type TManagedObjectFormDataEnvelope = {
    formData: TManagedObjectFormData;
  }

  const transform_ManagedObject_To_FormDataEnvelope = (mo: TManagedObject): TManagedObjectFormDataEnvelope => {
    const fd: TManagedObjectFormData = {
      requestHeader: mo
    };
    return {
      formData: fd
    };
  }

  const create_ManagedObject_From_FormEntities = ({formDataEnvelope}: {
    formDataEnvelope: TManagedObjectFormDataEnvelope;
  }): TManagedObject => {
    const mo: TManagedObject = formDataEnvelope.formData.requestHeader;
    return mo;
  }

  const EmptyManagedObject: TManagedObject = { headerName: '', headerValue: '' };
  const FormId: string = ComponentName + '_Form';

  const [managedObject, setManagedObject] = React.useState<TManagedObject>();
  const [managedObjectList, setManagedObjectList] = React.useState<TManagedObjectList>(props.apWebhookRequestHeaderList);
  const [isManagedObjectListChanged, setIsManagedObjectListChanged] = React.useState<boolean>(false);
  const [managedObjectFormDataEnvelope, setManagedObjectFormDataEnvelope] = React.useState<TManagedObjectFormDataEnvelope>();
  const managedObjectDataTableRef = React.useRef<any>(null);
  const managedObjectUseForm = useForm<TManagedObjectFormDataEnvelope>();


  React.useEffect(() => {
    setManagedObject(EmptyManagedObject);
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(managedObject === undefined) return;
    setManagedObjectFormDataEnvelope(transform_ManagedObject_To_FormDataEnvelope(managedObject));
  }, [managedObject]) /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(isManagedObjectListChanged) {
      props.onChange(managedObjectList);
      setIsManagedObjectListChanged(false);
      setManagedObject(EmptyManagedObject);
    }
  }, [managedObjectList, isManagedObjectListChanged]) /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(managedObjectFormDataEnvelope) managedObjectUseForm.setValue('formData', managedObjectFormDataEnvelope.formData);
  }, [managedObjectFormDataEnvelope]) /* eslint-disable-line react-hooks/exhaustive-deps */

  const doAddManagedObject = (mo: TManagedObject) => {

    setManagedObjectFormDataEnvelope(transform_ManagedObject_To_FormDataEnvelope(EmptyManagedObject));
    setManagedObject(EmptyManagedObject);
    
    setManagedObjectList(APAppWebhooksDisplayService.add_TAPWebhookRequestHeader_To_TAPWebhookRequestHeaderList({
      apWebhookRequestHeader: mo,
      apWebhookRequestHeaderList: managedObjectList
    }));
    setIsManagedObjectListChanged(true);
  }

  const doRemoveManagedObject = (mo: TManagedObject) => {
    setManagedObjectList(APAppWebhooksDisplayService.remove_TAPWebhookRequestHeader_From_TAPWebhookRequestHeaderList({
      apWebhookRequestHeader: mo,
      apWebhookRequestHeaderList: managedObjectList
    }));
    setIsManagedObjectListChanged(true);
  }
  const onSubmitManagedObjectForm = (mofde: TManagedObjectFormDataEnvelope) => {
    doAddManagedObject(create_ManagedObject_From_FormEntities({ formDataEnvelope: mofde }));
  }
  const onInvalidSubmitManagedObjectForm = () => {
    // placeholder
  }

  const renderTable = (): JSX.Element => {
    const actionBodyTemplate = (mo: TManagedObject) => {
      return (
        <React.Fragment>
          <Button 
            key={FormId+'_remove_'+mo.headerName} 
            type='button'
            icon="pi pi-times" 
            className="p-button-rounded p-button-outlined p-button-secondary p-mr-2" 
            onClick={() => doRemoveManagedObject(mo)} 
          />
        </React.Fragment>
      );
    }
    const dataKey = APDisplayUtils.nameOf<TManagedObject>('headerName');
    const sortField = dataKey;
    const nameField = APDisplayUtils.nameOf<TManagedObject>('headerName');
    const valueField = APDisplayUtils.nameOf<TManagedObject>('headerValue');
    return (
      <React.Fragment>
        <DataTable
          ref={managedObjectDataTableRef}
          className="p-datatable-sm"
          showGridlines={false}
          value={managedObjectList}
          emptyMessage={EmptyMessage}
          scrollable 
          dataKey={dataKey}  
          sortMode='single'
          sortField={sortField}
          sortOrder={1}
          // resizableColumns 
          // columnResizeMode="fit"
          autoLayout={true}
        >
          <Column header={TableHeader_HeaderName} headerStyle={{ width: "31%"}} field={nameField} sortable />
          <Column header={TableHeader_HeaderValue} field={valueField} bodyStyle={{ overflowWrap: 'break-word', wordWrap: 'break-word' }} />
          <Column body={actionBodyTemplate} bodyStyle={{ width: '3em', textAlign: 'end' }} />
        </DataTable>
      </React.Fragment>        
    );
  }

  const validateHeaderName = (headerName: string): string | boolean => {
    // check that name is unique
    if(APAppWebhooksDisplayService.exists_TAPWebhookRequestHeader_In_TAPWebhookRequestHeaderList({
      headerName: headerName,
      apWebhookRequestHeaderList: managedObjectList
    })) {
      return `${TableHeader_HeaderName} already exists. Choose a different name or delete it first to change it's value.`;
    }
    return true;
  }

  const renderComponent = () => {
    return (
      <div className="card">
        <div className="p-fluid">
          <form id={FormId} onSubmit={managedObjectUseForm.handleSubmit(onSubmitManagedObjectForm, onInvalidSubmitManagedObjectForm)} className="p-fluid">           
            <div className="p-formgroup-inline">
              {/* headerName */}
              <div className="p-field" style={{ width: '30%' }} >
                <span className="p-float-label p-input-icon-right">
                  <i className="pi pi-key" />
                  <Controller
                    control={managedObjectUseForm.control}
                    name="formData.requestHeader.headerName"
                    rules={{
                      ...APConnectorFormValidationRules.WebhookRequestHeaderName(),
                      validate: validateHeaderName,
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
                  <label className={classNames({ 'p-error': managedObjectUseForm.formState.errors.formData?.requestHeader?.headerName })}>{TableHeader_HeaderName}*</label>
                </span>
                {APDisplayUtils.displayFormFieldErrorMessage(managedObjectUseForm.formState.errors.formData?.requestHeader?.headerName)}
              </div>
              {/* headerValue */}
              <div className="p-field" style={{ width: '65%' }} >
                <span className="p-float-label">
                  <Controller
                    control={managedObjectUseForm.control}
                    name="formData.requestHeader.headerValue"
                    rules={APConnectorFormValidationRules.WebhookRequestHeaderValue()}
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
                  <label className={classNames({ 'p-error': managedObjectUseForm.formState.errors.formData?.requestHeader?.headerValue })}>{TableHeader_HeaderValue}*</label>
                </span>
                {APDisplayUtils.displayFormFieldErrorMessage(managedObjectUseForm.formState.errors.formData?.requestHeader?.headerValue)}
              </div>
              <div>          
                <Button key={ComponentName+'submit'} form={FormId} type="submit" icon="pi pi-plus" className="p-button-text p-button-plain p-button-outlined" />
              </div>  
            </div>
            {renderTable()}
          </form>  
        </div>
      </div>
    );
  }

  return(
    <React.Fragment>
      { managedObject && renderComponent() }
    </React.Fragment>
  );
}
