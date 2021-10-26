import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import { InputText } from 'primereact/inputtext';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';
import React from 'react';
import { useForm, Controller, FieldError } from 'react-hook-form';

import { APManageAttributes } from '../../components/APManageAttributes/APManageAttributes';
import { TAPAttributeList } from '../../utils/APConnectorApiCalls';

// * TEST DATA *
const emptyAttributeList: TAPAttributeList = [];
const existingAttributeList: TAPAttributeList = [
  { name: 'a', value: 'a' },
  { name: 'b', value: 'b' }
];

export const ManageAttributesDevelPage: React.FC = () => {
  const componentName = 'ManageAttributesDevelPage';

  type TOuterFormData = {
    dummy: string
  }
  const outerUseForm = useForm<TOuterFormData>();
  const outerFormId = componentName;

  const onSubmitOuterForm = (outerFormData: TOuterFormData) => {
    const funcName = 'onSubmitOuterForm';
    const logName = `${componentName}.${funcName}()`;
    alert(`${logName}: done.`)
  }
  const onInvalidSubmitOuterForm = () => {
  }
  const displayFormFieldErrorMessage = (fieldError: FieldError | undefined) => {
    return fieldError && <small className="p-error">{fieldError.message}</small>    
  }

  const onChangeAttributeList = (attributeList: TAPAttributeList) => {
    const funcName = 'onChangeAttributeList';
    const logName = `${componentName}.${funcName}()`;
    alert(`${logName}: attributeList=${JSON.stringify(attributeList, null, 2)}`);
  }

  const renderOuterFormFooter = (): JSX.Element => {
    const outerFormFooterRightToolbarTemplate = () => {
      return (
        <React.Fragment>
          <Button key={componentName} form={outerFormId} type="submit" label='submit outer form' icon="pi pi-save" className="p-button-text p-button-plain p-button-outlined" />
        </React.Fragment>
      );
    }
    return (
      <Toolbar className="p-mb-4" right={outerFormFooterRightToolbarTemplate} />
    )
  }

  return (
    <React.Fragment>
      <div className="card" style={{padding: '2rem', fontWeight: 'bold'}}>
        Test Manage Attribute
      </div>
      {/* outer dummy form */}
      <div className="card">
        <div className="p-fluid">
          <form id={outerFormId} onSubmit={outerUseForm.handleSubmit(onSubmitOuterForm, onInvalidSubmitOuterForm)} className="p-fluid">           
            {/* Dummy */}
            <div className="p-field">
              <span className="p-float-label p-input-icon-right">
                <Controller
                  name="dummy"
                  control={outerUseForm.control}
                  rules={{
                    required: "Enter value for dummy.",
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
                <label htmlFor="dummy" className={classNames({ 'p-error': outerUseForm.formState.errors.dummy })}>Dummy outer form*</label>
              </span>
              {displayFormFieldErrorMessage(outerUseForm.formState.errors.dummy)}
            </div>
          </form>  
          <Divider />                      
          {/* attributes */}
          <APManageAttributes
            formId={componentName+'_APManageAttributes'}
            attributeList={emptyAttributeList}
            onChange={onChangeAttributeList}
          />
          <Divider />                      
          {renderOuterFormFooter()}          
        </div>
      </div>
    </React.Fragment>
  );

}

