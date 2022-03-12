
import React from "react";
import { useForm, Controller } from 'react-hook-form';

import { MultiSelect } from "primereact/multiselect";
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';

import { TApiCallState } from "../../../../utils/ApiCallState";
import APDisplayUtils from "../../../../displayServices/APDisplayUtils";
import { EAction } from "../ManageSystemUsersCommon";
import APSystemUsersDisplayService, { TAPSystemUserDisplay } from "../../../../displayServices/APUsersDisplayService/APSystemUsersDisplayService";
import APEntityIdsService, { TAPEntityIdList } from "../../../../utils/APEntityIdsService";
import APRbacDisplayService from "../../../../displayServices/APRbacDisplayService";
import { APSSystemAuthRoleList } from "../../../../_generated/@solace-iot-team/apim-server-openapi-browser";

import '../../../../components/APComponents.css';
import "../ManageSystemUsers.css";

export interface IEditNewSystemUserSystemRolesProps {
  action: EAction,
  apSystemUserDisplay: TAPSystemUserDisplay;
  onSave: (apSystemRoleEntityIdList: TAPEntityIdList) => void;
  onCancel: () => void;
  onError: (apiCallState: TApiCallState) => void;
  onBack: () => void;
}

export const EditNewSystemUserSystemRoles: React.FC<IEditNewSystemUserSystemRolesProps> = (props: IEditNewSystemUserSystemRolesProps) => {
  const ComponentName = 'EditNewSystemUserSystemRoles';

  type TManagedObject = TAPEntityIdList;
  type TManagedObjectFormData = {
    systemRoleIdList: APSSystemAuthRoleList;
  };
  type TManagedObjectFormDataEnvelope = {
    formData: TManagedObjectFormData;
  }
  const transform_ManagedObject_To_FormDataEnvelope = (mo: TManagedObject): TManagedObjectFormDataEnvelope => {
    const fd: TManagedObjectFormData = {
      systemRoleIdList: APEntityIdsService.create_IdList(props.apSystemUserDisplay.apSystemRoleEntityIdList) as APSSystemAuthRoleList,
    };
    return {
      formData: fd
    };
  }

  const create_ManagedObject_From_FormEntities = ({orginalManagedObject, formDataEnvelope}: {
    orginalManagedObject: TManagedObject;
    formDataEnvelope: TManagedObjectFormDataEnvelope;
  }): TManagedObject => {
    const fd: TManagedObjectFormData = formDataEnvelope.formData;
    return APRbacDisplayService.create_SystemRoles_EntityIdList(fd.systemRoleIdList);
  }
  
  const [managedObject, setManagedObject] = React.useState<TManagedObject>();
  const [managedObjectFormDataEnvelope, setManagedObjectFormDataEnvelope] = React.useState<TManagedObjectFormDataEnvelope>();
  const managedObjectUseForm = useForm<TManagedObjectFormDataEnvelope>();
  const formId = ComponentName;

  const doInitialize = async () => {
    setManagedObject(APSystemUsersDisplayService.get_ApSystemRoleEntityIdList({
      apUserDisplay: props.apSystemUserDisplay
    }));
  }

  // * useEffect Hooks *

  React.useEffect(() => {
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(managedObject) {
      setManagedObjectFormDataEnvelope(transform_ManagedObject_To_FormDataEnvelope(managedObject));
    }
  }, [managedObject]) /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(managedObjectFormDataEnvelope) managedObjectUseForm.setValue('formData.systemRoleIdList', managedObjectFormDataEnvelope.formData.systemRoleIdList);
  }, [managedObjectFormDataEnvelope]) /* eslint-disable-line react-hooks/exhaustive-deps */

  const doSubmitManagedObject = async (mo: TManagedObject) => {
    props.onSave(mo);
  }

  const onSubmitManagedObjectForm = (newMofde: TManagedObjectFormDataEnvelope) => {
    const funcName = 'onSubmitManagedObjectForm';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);
    doSubmitManagedObject(create_ManagedObject_From_FormEntities({
      orginalManagedObject: managedObject,
      formDataEnvelope: newMofde,
    }));
  }

  const onInvalidSubmitManagedObjectForm = () => {
    // placeholder
  }

  const renderManagedObjectFormFooter = (): JSX.Element => {
    const managedObjectFormFooterLeftToolbarTemplate = () => {
      if(props.action === EAction.NEW) {
        return (
          <React.Fragment>
            <Button key={ComponentName+'Back'} label="Back" icon="pi pi-arrow-left" className="p-button-text p-button-plain p-button-outlined" onClick={props.onBack}/>
            <Button type="button" label="Cancel" className="p-button-text p-button-plain" onClick={props.onCancel} />
          </React.Fragment>
        );
      } else {
        return (
          <React.Fragment>
            <Button type="button" label="Cancel" className="p-button-text p-button-plain" onClick={props.onCancel} />
          </React.Fragment>
        );
      }
    }
    const managedObjectFormFooterRightToolbarTemplate = () => {
      if(props.action === EAction.NEW) {
        return (
          <React.Fragment>
            <Button key={ComponentName+'Next'} form={formId} type="submit" label="Next" icon="pi pi-arrow-right" className="p-button-text p-button-plain p-button-outlined" />
          </React.Fragment>
        );  
      } else {
        return (
          <React.Fragment>
            <Button key={ComponentName+'Save'} form={formId} type="submit" label="Save" icon="pi pi-save" className="p-button-text p-button-plain p-button-outlined" />
          </React.Fragment>
        );  
      }
    }  
    return (
      <Toolbar className="p-mb-4" left={managedObjectFormFooterLeftToolbarTemplate} right={managedObjectFormFooterRightToolbarTemplate} />
    )
  }

  const renderManagedObjectForm = () => {
    return (
      <div className="card p-mt-4">
        <div className="p-fluid">
          <form id={formId} onSubmit={managedObjectUseForm.handleSubmit(onSubmitManagedObjectForm, onInvalidSubmitManagedObjectForm)} className="p-fluid">     
            {/* System Roles */}
            <div className="p-field">
              <span className="p-float-label">
                <Controller
                  name="formData.systemRoleIdList"
                  control={managedObjectUseForm.control}
                  render={( { field, fieldState }) => {
                    return(
                      <MultiSelect
                        display="chip"
                        value={field.value ? [...field.value] : []} 
                        options={APRbacDisplayService.create_SystemRoles_SelectEntityIdList()} 
                        onChange={(e) => field.onChange(e.value)}
                        optionLabel={APEntityIdsService.nameOf('displayName')}
                        optionValue={APEntityIdsService.nameOf('id')}
                        // style={{width: '500px'}} 
                        className={classNames({ 'p-invalid': fieldState.invalid })}                       
                      />
                  )}}
                />
                <label className={classNames({ 'p-error': managedObjectUseForm.formState.errors.formData?.systemRoleIdList })}>System Role(s)</label>
              </span>
              {APDisplayUtils.displayFormFieldErrorMessage4Array(managedObjectUseForm.formState.errors.formData?.systemRoleIdList)}
            </div>
          </form>  
          {/* footer */}
          { renderManagedObjectFormFooter() }
        </div>
      </div>
    );
  }

  
  return (
    <div className="manage-users">

      {managedObject && 
        renderManagedObjectForm()
      }
    </div>
  );
}
