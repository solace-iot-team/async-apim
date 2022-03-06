
import React from "react";
import { useForm, Controller } from 'react-hook-form';

import { classNames } from "primereact/utils";
import { Button } from "primereact/button";
import { MultiSelect } from "primereact/multiselect";
import { Toolbar } from "primereact/toolbar";

import APEntityIdsService from "../../../../utils/APEntityIdsService";
import APRbacDisplayService from "../../../../displayServices/APRbacDisplayService";
import { ApiCallState, TApiCallState } from "../../../../utils/ApiCallState";
import { E_CALL_STATE_ACTIONS } from "../ManageOrganizationUsersCommon";
import { APSOrganizationAuthRoleList } from "../../../../_generated/@solace-iot-team/apim-server-openapi-browser";
import APDisplayUtils from "../../../../displayServices/APDisplayUtils";
import { APSClientOpenApi } from "../../../../utils/APSClientOpenApi";
import { Globals } from "../../../../utils/Globals";
import APOrganizationUsersDisplayService, { TAPOrganizationUserDisplay } from "../../../../displayServices/APUsersDisplayService/APOrganizationUsersDisplayService";
import { TAPMemberOfOrganizationDisplay } from "../../../../displayServices/APUsersDisplayService/APMemberOfService";

import '../../../../components/APComponents.css';
import "../ManageOrganizationUsers.css";

export enum EEditOrganzationUserOrganizationRolesAction {
  EDIT_AND_SAVE = 'EDIT_AND_SAVE',
  REMOVE_AND_SAVE = 'REMOVE_AND_SAVE',
  EDIT_AND_RETURN = 'EDIT_AND_RETURN',
  REMOVE_AND_RETURN = "REMOVE_AND_RETURN",
}

export interface IEditOrganizationUserOrganizationRolesProps {
  // organizationEntityId: TAPEntityId;
  action: EEditOrganzationUserOrganizationRolesAction;
  apOrganizationUserDisplay: TAPOrganizationUserDisplay;
  onError: (apiCallState: TApiCallState) => void;
  onSaveSuccess?: (apiCallState: TApiCallState) => void;
  onEditSuccess?: (update_ApMemberOfOrganizationDisplay: TAPMemberOfOrganizationDisplay) => void;
  onCancel: () => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const EditOrganizationUserOrganizationRoles: React.FC<IEditOrganizationUserOrganizationRolesProps> = (props: IEditOrganizationUserOrganizationRolesProps) => {
  const ComponentName = 'EditOrganizationUserOrganizationRoles';

  type TManagedObject = TAPMemberOfOrganizationDisplay;
  type TManagedObjectFormData = {
    organizationAuthRoleIdList: Array<string>;
  };
  type TManagedObjectFormDataEnvelope = {
    formData: TManagedObjectFormData;
  }

  const create_FormDataEnvelope = (mo: TManagedObject): TManagedObjectFormDataEnvelope => {
    const fd: TManagedObjectFormData = {
      organizationAuthRoleIdList: APEntityIdsService.create_IdList(mo.apOrganizationRoleEntityIdList)
    };
    return {
      formData: fd
    };
  }

  const create_ManagedObject_From_FormEntities = ({orginalManagedObject, formDataEnvelope}: {
    orginalManagedObject: TManagedObject;
    formDataEnvelope: TManagedObjectFormDataEnvelope;
  }): TManagedObject => {
    const funcName = 'create_ManagedObject_From_FormEntities';
    const logName = `${ComponentName}.${funcName}()`;
    switch(props.action) {
      case EEditOrganzationUserOrganizationRolesAction.REMOVE_AND_SAVE:
      case EEditOrganzationUserOrganizationRolesAction.REMOVE_AND_RETURN:
        formDataEnvelope.formData.organizationAuthRoleIdList = [];
        break;
      case EEditOrganzationUserOrganizationRolesAction.EDIT_AND_RETURN:
      case EEditOrganzationUserOrganizationRolesAction.EDIT_AND_SAVE:  
        break;
      default:
        Globals.assertNever(logName, props.action);  
    }
    const mo: TManagedObject = orginalManagedObject;
    const fd: TManagedObjectFormData = formDataEnvelope.formData;
    mo.apOrganizationRoleEntityIdList = APRbacDisplayService.create_OrganizationRoles_EntityIdList(fd.organizationAuthRoleIdList as APSOrganizationAuthRoleList);
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
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_UPDATE_ORGANIZATION_ROLES, `update organization roles for user: ${props.apOrganizationUserDisplay.apEntityId.id}`);
    try { 
      // throw new Error(`${logName}: testing error handling `);
      await APOrganizationUsersDisplayService.apsUpdate_ApMemberOfOrganizationDisplay({
        apOrganizationUserDisplay: props.apOrganizationUserDisplay,
        apMemberOfOrganizationDisplay: mo
      });
    } catch(e: any) {
      APSClientOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const doInitialize = async () => {
    setManagedObject(
      APOrganizationUsersDisplayService.get_ApOrganizationUserMemberOfOrganizationDisplay({
        apOrganizationUserDisplay: props.apOrganizationUserDisplay,
      })
    );
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
    const funcName = 'useEffect';
    const logName = `${ComponentName}.${funcName}()`;
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
      else {
        if(apiCallStatus.context.action === E_CALL_STATE_ACTIONS.API_UPDATE_ORGANIZATION_ROLES) {
          if(props.onSaveSuccess === undefined) throw new Error(`${logName}: props.onSaveSuccess === undefined`);
          props.onSaveSuccess(apiCallStatus);
        }
      }
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const managedObjectFormFooterRightToolbarTemplate = () => {
    const funcName = 'managedObjectFormFooterRightToolbarTemplate';
    const logName = `${ComponentName}.${funcName}()`;
    switch(props.action) {
      case EEditOrganzationUserOrganizationRolesAction.EDIT_AND_SAVE:
      case EEditOrganzationUserOrganizationRolesAction.EDIT_AND_RETURN:
        return (
          <React.Fragment>
            <Button label="Cancel" type="button" className="p-button-text p-button-plain p-button-outlined" onClick={props.onCancel} />
            <Button key={ComponentName+'submit'} label="Save" form={formId} type="submit" icon="pi pi-save" className="p-button-text p-button-plain p-button-outlined" />
          </React.Fragment>
        );
      case EEditOrganzationUserOrganizationRolesAction.REMOVE_AND_SAVE:
      case EEditOrganzationUserOrganizationRolesAction.REMOVE_AND_RETURN:
        return (
          <React.Fragment>
            <Button label="Cancel" type="button" className="p-button-text p-button-plain p-button-outlined" onClick={props.onCancel} />
            <Button key={ComponentName+'submit'} label="Remove" form={formId} type="submit" className="p-button-text p-button-plain p-button-outlined" />
          </React.Fragment>
        );
      default:
        Globals.assertNever(logName, props.action);  
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
    const updated_apMemberOfOrganizationDisplay: TAPMemberOfOrganizationDisplay = create_ManagedObject_From_FormEntities({
      orginalManagedObject: managedObject,
      formDataEnvelope: fde
    });
    switch(props.action) {
      case EEditOrganzationUserOrganizationRolesAction.EDIT_AND_SAVE:
      case EEditOrganzationUserOrganizationRolesAction.REMOVE_AND_SAVE:
        await apiUpdateManagedObject(updated_apMemberOfOrganizationDisplay);
        break;
      case EEditOrganzationUserOrganizationRolesAction.EDIT_AND_RETURN:
      case EEditOrganzationUserOrganizationRolesAction.REMOVE_AND_RETURN:  
        if(props.onEditSuccess === undefined) throw new Error(`${logName}: props.onEditSuccess === undefined`);
        props.onEditSuccess(updated_apMemberOfOrganizationDisplay);
        break;
      default:
        Globals.assertNever(logName, props.action);  
    }
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
    // save a copy to restore in case validation fails
    const savedOrganizationAuthRoleIdList: Array<string> = JSON.parse(JSON.stringify(organizationAuthRoleIdList));
    if(props.action === EEditOrganzationUserOrganizationRolesAction.REMOVE_AND_SAVE || props.action === EEditOrganzationUserOrganizationRolesAction.REMOVE_AND_RETURN) {
      organizationAuthRoleIdList = [];
    }
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

    const areNewRolesValid = APOrganizationUsersDisplayService.validate_RequestedUpdateOf_ApOrganizationUserDisplay_With_ApMemberOfOrganizationDisplay({
      current_ApOrganizationUserDisplay: props.apOrganizationUserDisplay,
      requestedUpdateWith_apMemberOfOrganizationDisplay: validationManagedObject,
    });
    if(!areNewRolesValid) {
      // restore original list
      organizationAuthRoleIdList = savedOrganizationAuthRoleIdList;
      // create error message for user
      switch(props.action) {
        case EEditOrganzationUserOrganizationRolesAction.EDIT_AND_SAVE:
          return `Specify at least 1 organization role. User is not a member of any business group. To remove user from organization, delete the user instead.`;    
        case EEditOrganzationUserOrganizationRolesAction.REMOVE_AND_SAVE:
          return `Cannot remove organization role(s). User is not a member of any other group nor has any organization roles. To remove user from organization, delete the user instead.`;          
        case EEditOrganzationUserOrganizationRolesAction.EDIT_AND_RETURN:
        case EEditOrganzationUserOrganizationRolesAction.REMOVE_AND_RETURN:
          return `Specify at least 1 organization role if user is not a member of any business group.`;          
        default:
          Globals.assertNever(logName, props.action);      
      }
    }
    return true;
  }

  const renderManagedObjectForm = () => {
    const isRolesDisabled: boolean = (props.action === EEditOrganzationUserOrganizationRolesAction.REMOVE_AND_SAVE || props.action === EEditOrganzationUserOrganizationRolesAction.REMOVE_AND_RETURN);
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
