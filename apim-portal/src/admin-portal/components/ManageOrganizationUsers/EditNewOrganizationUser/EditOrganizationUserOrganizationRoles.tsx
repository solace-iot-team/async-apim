
import React from "react";
import { useForm, Controller } from 'react-hook-form';

import { classNames } from "primereact/utils";
import { Button } from "primereact/button";
import { MultiSelect } from "primereact/multiselect";
import { Toolbar } from "primereact/toolbar";

import APEntityIdsService, { 
  TAPEntityId, 
} from "../../../../utils/APEntityIdsService";
import APUsersDisplayService, { 
  TAPUserDisplay,
  TAPUserOrganizationRolesDisplay
} from "../../../../displayServices/APUsersDisplayService";
import APRbacDisplayService from "../../../../displayServices/APRbacDisplayService";
import { ApiCallState, TApiCallState } from "../../../../utils/ApiCallState";
import { E_CALL_STATE_ACTIONS } from "../ManageOrganizationUsersCommon";
import { APSOrganizationAuthRoleList } from "../../../../_generated/@solace-iot-team/apim-server-openapi-browser";
import APDisplayUtils from "../../../../displayServices/APDisplayUtils";
import { APSClientOpenApi } from "../../../../utils/APSClientOpenApi";

import '../../../../components/APComponents.css';
import "../ManageOrganizationUsers.css";

export enum EEditOrganzationUserOrganizationRolesAction {
  EDIT = 'EDIT',
  REMOVE = 'REMOVE'
}

export interface IEditOrganizationUserOrganizationRolesProps {
  organizationEntityId: TAPEntityId;
  action: EEditOrganzationUserOrganizationRolesAction;
  apUserDisplay: TAPUserDisplay;
  onError: (apiCallState: TApiCallState) => void;
  onSaveSuccess: (apiCallState: TApiCallState) => void;
  onCancel: () => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const EditOrganizationUserOrganizationRoles: React.FC<IEditOrganizationUserOrganizationRolesProps> = (props: IEditOrganizationUserOrganizationRolesProps) => {
  const ComponentName = 'EditOrganizationUserOrganizationRoles';

  type TManagedObject = TAPUserOrganizationRolesDisplay;
  type TManagedObjectFormData = {
    organizationAuthRoleIdList: Array<string>;
  };
  type TManagedObjectFormDataEnvelope = {
    formData: TManagedObjectFormData;
  }

  const create_FormDataEnvelope = (mo: TManagedObject): TManagedObjectFormDataEnvelope => {
    const fd: TManagedObjectFormData = {
      organizationAuthRoleIdList: APEntityIdsService.create_IdList(mo.apOrganizationAuthRoleEntityIdList)
    };
    return {
      formData: fd
    };
  }

  const create_ManagedObject_From_FormEntities = ({orginalManagedObject, formDataEnvelope}: {
    orginalManagedObject: TManagedObject;
    formDataEnvelope: TManagedObjectFormDataEnvelope;
  }): TManagedObject => {
    if(props.action === EEditOrganzationUserOrganizationRolesAction.REMOVE) {
      formDataEnvelope.formData.organizationAuthRoleIdList = [];
    }
    const mo: TManagedObject = orginalManagedObject;
    const fd: TManagedObjectFormData = formDataEnvelope.formData;
    mo.apOrganizationAuthRoleEntityIdList = APRbacDisplayService.create_OrganizationRoles_EntityIdList(fd.organizationAuthRoleIdList as APSOrganizationAuthRoleList);
    return mo;
  }
  
  const [managedObject, setManagedObject] = React.useState<TManagedObject>();
  const [managedObjectFormDataEnvelope, setManagedObjectFormDataEnvelope] = React.useState<TManagedObjectFormDataEnvelope>();
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [isInitialized, setIsInitialized] = React.useState<boolean>(false);
  const managedObjectUseForm = useForm<TManagedObjectFormDataEnvelope>();
  const formId = ComponentName;

  // * Api Calls *
  const apiUpdateManagedObject = async(mo: TManagedObject): Promise<TApiCallState> => {
    const funcName = 'apiUpdateManagedObject';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_UPDATE_ORGANIZATION_ROLES, `update organization roles for user: ${mo.apEntityId.id}`);
    try { 
      // throw new Error(`${logName}: testing error handling `);
      await APUsersDisplayService.apsUpdate_ApUserOrganizationRolesDisplay({
        organizationEntityId: props.organizationEntityId,
        apUserDisplay: props.apUserDisplay,
        apUserOrganizationRolesDisplay: mo
      });
    } catch(e: any) {
      APSClientOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const doInitialize = async () => {
    setManagedObject(APUsersDisplayService.get_ApUserOrganizationRolesDisplay({
      organizationId: props.organizationEntityId.id,
      apUserDisplay: props.apUserDisplay
    }));
  }

  // * useEffect Hooks *

  React.useEffect(() => {
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(managedObject !== undefined) {
      setManagedObjectFormDataEnvelope(create_FormDataEnvelope(managedObject));
    }
  }, [managedObject]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(managedObjectFormDataEnvelope !== undefined) {
      managedObjectUseForm.setValue('formData.organizationAuthRoleIdList', managedObjectFormDataEnvelope.formData.organizationAuthRoleIdList);
      setIsInitialized(true);
    }
  }, [managedObjectFormDataEnvelope]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
      else {
        if(apiCallStatus.context.action === E_CALL_STATE_ACTIONS.API_UPDATE_ORGANIZATION_ROLES) props.onSaveSuccess(apiCallStatus);
      }
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const managedObjectFormFooterRightToolbarTemplate = () => {
    if(props.action === EEditOrganzationUserOrganizationRolesAction.EDIT) {
      return (
        <React.Fragment>
          <Button label="Cancel" type="button" className="p-button-text p-button-plain p-button-outlined" onClick={props.onCancel} />
          <Button key={ComponentName+'submit'} label="Save" form={formId} type="submit" icon="pi pi-save" className="p-button-text p-button-plain p-button-outlined" />
        </React.Fragment>
      );
    }
    if(props.action === EEditOrganzationUserOrganizationRolesAction.REMOVE) {
      return (
        <React.Fragment>
          <Button label="Cancel" type="button" className="p-button-text p-button-plain p-button-outlined" onClick={props.onCancel} />
          <Button key={ComponentName+'submit'} label="Remove" form={formId} type="submit" className="p-button-text p-button-plain p-button-outlined" />
        </React.Fragment>
      );
    }
  }

  const renderManagedObjectFormFooter = (): JSX.Element => {
    return (
      <Toolbar className="p-mb-2" style={{ background: 'transparent', border: 'none', padding: 'none' }} right={managedObjectFormFooterRightToolbarTemplate} />
    );
  }

  const doSubmitForm = async(fde: TManagedObjectFormDataEnvelope) => {
    const funcName = 'doSubmitForm';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);
    await apiUpdateManagedObject(create_ManagedObject_From_FormEntities({
      orginalManagedObject: managedObject,
      formDataEnvelope: fde
    }));
  }

  const onSubmitForm = (fde: TManagedObjectFormDataEnvelope) => {
    doSubmitForm(fde);
  }

  const onInvalidSubmitForm = () => {
    // placeholder
  }

  const validate_UpdatedOrganizationUserOrganizationRoles = (organizationAuthRoleIdList: Array<string>): string | boolean => {
    const funcName = 'validate_UpdatedOrganizationUserOrganizationRoles';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);
    if(props.action === EEditOrganzationUserOrganizationRolesAction.REMOVE) organizationAuthRoleIdList = [];
    if(organizationAuthRoleIdList.length > 0) return true;
    const validation_fde: TManagedObjectFormDataEnvelope = {
      formData: {
        organizationAuthRoleIdList: organizationAuthRoleIdList
      }
    };
    const validationManagedObject: TManagedObject = create_ManagedObject_From_FormEntities({
      orginalManagedObject: managedObject,
      formDataEnvelope: validation_fde
    });
    const areUserRolesValid = APUsersDisplayService.validate_Update_OrganizationUser_With_OrganizationRoles({
      organizationId: props.organizationEntityId.id,
      currentApUserDisplay: props.apUserDisplay,
      updateApUserOrganizationRolesDisplay: validationManagedObject
    });
    if(!areUserRolesValid) {
      if(props.action === EEditOrganzationUserOrganizationRolesAction.REMOVE) {
        return `Cannot remove organization role(s). User is not a member of any other group nor has any organization roles. To remove user from organization, delete the user instead.`;
      }
      return `Specify at least 1 organization role. User is not a member of any business group. To remove user from organization, delete the user instead.`;
    }
    return true;
  }

  const renderManagedObjectForm = () => {
    const isRolesDisabled: boolean = (props.action === EEditOrganzationUserOrganizationRolesAction.REMOVE);
    return (
      <div className="card p-mt-4">
        <div className="p-fluid">
          <form id={formId} onSubmit={managedObjectUseForm.handleSubmit(onSubmitForm, onInvalidSubmitForm)} className="p-fluid">           
            {/* Roles */}
            <div className="p-field">
              <span className="p-float-label">
              <Controller
                control={managedObjectUseForm.control}
                name="formData.organizationAuthRoleIdList"
                rules={{
                  // required: 'Enter Async API Spec.',
                  validate: validate_UpdatedOrganizationUserOrganizationRoles  
                }}
                render={( { field, fieldState }) => {
                  return(
                    <MultiSelect
                      display="chip"
                      value={field.value ? [...field.value] : []} 
                      options={APRbacDisplayService.create_OrganizationRoles_SelectEntityIdList()} 
                      onChange={(e) => field.onChange(e.value)}
                      optionLabel={APEntityIdsService.nameOf('displayName')}
                      optionValue={APEntityIdsService.nameOf('id')}
                      className={classNames({ 'p-invalid': fieldState.invalid })}
                      disabled={isRolesDisabled}                       
                    />
                )}}
              />
              <label className={classNames({ 'p-error': managedObjectUseForm.formState.errors.formData?.organizationAuthRoleIdList })}>Role(s)</label>
              </span>
              {APDisplayUtils.displayFormFieldErrorMessage4Array(managedObjectUseForm.formState.errors.formData?.organizationAuthRoleIdList) }
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

      {isInitialized &&
        renderManagedObjectForm()
      }

    </div>
  );

}
