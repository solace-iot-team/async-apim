
import React from "react";
import { useForm, Controller } from 'react-hook-form';

import { classNames } from "primereact/utils";
import { Button } from "primereact/button";
import { MultiSelect } from "primereact/multiselect";
import { Toolbar } from "primereact/toolbar";

import APEntityIdsService, { 
  TAPEntityId, 
  TAPEntityIdList 
} from "../../../../utils/APEntityIdsService";
import APUsersDisplayService, { 
  TAPMemberOfBusinessGroupDisplay, 
  TAPMemberOfBusinessGroupDisplayList, 
  TAPUserDisplay
} from "../../../../displayServices/APUsersDisplayService";
import APRbacDisplayService from "../../../../displayServices/APRbacDisplayService";
import APBusinessGroupsDisplayService, { 
  TAPBusinessGroupDisplayList, 
} from "../../../../displayServices/APBusinessGroupsDisplayService";
import { ApiCallState, TApiCallState } from "../../../../utils/ApiCallState";
import { E_CALL_STATE_ACTIONS } from "../ManageOrganizationUsersCommon";
import { APSBusinessGroupAuthRoleList } from "../../../../_generated/@solace-iot-team/apim-server-openapi-browser";
import APDisplayUtils from "../../../../displayServices/APDisplayUtils";
import { APSClientOpenApi } from "../../../../utils/APSClientOpenApi";

import '../../../../components/APComponents.css';
import "../ManageOrganizationUsers.css";

export enum EEditOrganzationUserBusinessGroupRolesAction {
  EDIT = 'EDIT',
  REMOVE = 'REMOVE'
}

export interface IEditOrganizationUserBusinessGroupRolesProps {
  action: EEditOrganzationUserBusinessGroupRolesAction;
  organizationEntityId: TAPEntityId;
  apUserDisplay: TAPUserDisplay;
  businessGroupEntityId: TAPEntityId;
  businessGroupRoleEntityIdList: TAPEntityIdList;
  completeOrganizationApBusinessGroupDisplayList: TAPBusinessGroupDisplayList;
  onError: (apiCallState: TApiCallState) => void;
  onSaveSuccess: (apiCallState: TApiCallState) => void;
  onCancel: () => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const EditOrganizationUserBusinessGroupRoles: React.FC<IEditOrganizationUserBusinessGroupRolesProps> = (props: IEditOrganizationUserBusinessGroupRolesProps) => {
  const ComponentName = 'EditOrganizationUserBusinessGroupRoles';

  type TManagedObject = TAPMemberOfBusinessGroupDisplayList;

  type TBusinessGroupRolesFormData = {
    roles: APSBusinessGroupAuthRoleList;
  };
  type TBusinessGroupRolesFormDataEnvelope = {
    formData: TBusinessGroupRolesFormData;
  };

  const create_FormDataEnvelope = (): TBusinessGroupRolesFormDataEnvelope => {
    const fd: TBusinessGroupRolesFormData = {
      roles: APEntityIdsService.create_IdList(props.businessGroupRoleEntityIdList) as APSBusinessGroupAuthRoleList
    }
    return {
      formData: fd
    };
  }

  const create_ManagedObject_From_FormEntities = ({orginalManagedObject, formDataEnvelope}: {
    orginalManagedObject: TManagedObject;
    formDataEnvelope: TBusinessGroupRolesFormDataEnvelope;
  }): TManagedObject => {

    // const funcName = 'create_ManagedObject_From_FormEntities';
    // const logName = `${ComponentName}.${funcName}()`;
    if(props.action === EEditOrganzationUserBusinessGroupRolesAction.REMOVE) {
      formDataEnvelope.formData.roles = [];
    }

    const mo: TManagedObject = orginalManagedObject;
    const fd: TBusinessGroupRolesFormData = formDataEnvelope.formData;
    const existingIndex = mo.findIndex( (apMemberOfBusinessGroupDisplay: TAPMemberOfBusinessGroupDisplay) => {
      return apMemberOfBusinessGroupDisplay.apBusinessGroupDisplay.apEntityId.id === props.businessGroupEntityId.id;
    });
    if(fd.roles.length === 0) {
      // remove group
      if(existingIndex > -1) mo.splice(existingIndex, 1);  
    } else {
      // add/replace group
      if(existingIndex > -1) mo[existingIndex].apBusinessGroupRoleEntityIdList = APRbacDisplayService.getBusinessGroupRolesEntityIdList(fd.roles);
      else {
        mo.push({
          apBusinessGroupDisplay: APBusinessGroupsDisplayService.find_ApBusinessGroupDisplay_by_id({
            apBusinessGroupDisplayList: props.completeOrganizationApBusinessGroupDisplayList,
            businessGroupId: props.businessGroupEntityId.id
          }),
          apBusinessGroupRoleEntityIdList: APRbacDisplayService.getBusinessGroupRolesEntityIdList(fd.roles)
        });
      }
    }
    return mo;
  }

  const [managedObject, setManagedObject] = React.useState<TManagedObject>();
  const [managedObjectFormDataEnvelope, setManagedObjectFormDataEnvelope] = React.useState<TBusinessGroupRolesFormDataEnvelope>();
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [isInitialized, setIsInitialized] = React.useState<boolean>(false);
  const businessGroupRolesUseForm = useForm<TBusinessGroupRolesFormDataEnvelope>();
  const formId = ComponentName;

  // * Api Calls *
  const apiUpdateManagedObject = async(mo: TManagedObject): Promise<TApiCallState> => {
    const funcName = 'apiUpdateManagedObject';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_UPDATE_USER_MEMBER_OF_BUSINESS_GROUPS, `update business groups for user: ${props.apUserDisplay.apEntityId.id}`);
    try { 
      await APUsersDisplayService.updateApMemberOfBusinessGroupDisplayList({
        organizationEntityId: props.organizationEntityId,
        apUserDisplay: props.apUserDisplay,
        apMemberOfBusinessGroupDisplayList: mo
      });
    } catch(e: any) {
      APSClientOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const doInitialize = async () => {
    setManagedObjectFormDataEnvelope(create_FormDataEnvelope());
    setManagedObject(APUsersDisplayService.find_ApMemberOfBusinessGroupDisplayList({
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
      // placeholder
    }
  }, [managedObject]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(managedObjectFormDataEnvelope !== undefined) {
      businessGroupRolesUseForm.setValue('formData.roles', managedObjectFormDataEnvelope.formData.roles);
      setIsInitialized(true);
    }
  }, [managedObjectFormDataEnvelope]); /* eslint-disable-line react-hooks/exhaustive-deps */

  
  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
      if(apiCallStatus.context.action === E_CALL_STATE_ACTIONS.API_UPDATE_USER_MEMBER_OF_BUSINESS_GROUPS) props.onSaveSuccess(apiCallStatus);
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const managedObjectFormFooterRightToolbarTemplate = () => {
    if(props.action === EEditOrganzationUserBusinessGroupRolesAction.EDIT) {
      return (
        <React.Fragment>
          <Button label="Cancel" type="button" className="p-button-text p-button-plain p-button-outlined" onClick={props.onCancel} />
          <Button key={ComponentName+'submit'} label="Save" form={formId} type="submit" icon="pi pi-save" className="p-button-text p-button-plain p-button-outlined" />
        </React.Fragment>
      );
    }
    if(props.action === EEditOrganzationUserBusinessGroupRolesAction.REMOVE) {
      return (
        <React.Fragment>
          <Button label="Cancel" type="button" className="p-button-text p-button-plain p-button-outlined" onClick={props.onCancel} />
          <Button key={ComponentName+'submit'} label="Remove" form={formId} type="submit" icon="pi pi-times" className="p-button-text p-button-plain p-button-outlined" />
        </React.Fragment>
      );
    }

  }

  const renderManagedObjectFormFooter = (): JSX.Element => {
    return (
      <Toolbar className="p-mb-2" style={{ background: 'transparent', border: 'none', padding: 'none' }} right={managedObjectFormFooterRightToolbarTemplate} />
    )
  }

  const doSubmitForm = async(fde: TBusinessGroupRolesFormDataEnvelope) => {
    const funcName = 'doSubmitForm';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);
    await apiUpdateManagedObject(create_ManagedObject_From_FormEntities({
      orginalManagedObject: managedObject,
      formDataEnvelope: fde
    }));
  }
  
  const onSubmitForm = (fde: TBusinessGroupRolesFormDataEnvelope) => {
    doSubmitForm(fde);
  }

  const onInvalidSubmitForm = () => {
    // placeholder
  }

  const renderManagedObjectForm = () => {
    const isRolesDisabled: boolean = (props.action === EEditOrganzationUserBusinessGroupRolesAction.REMOVE);
    return (
      <div className="card p-mt-4">
        <div className="p-fluid">
          <form id={formId} onSubmit={businessGroupRolesUseForm.handleSubmit(onSubmitForm, onInvalidSubmitForm)} className="p-fluid">           
            {/* Roles */}
            <div className="p-field">
              <span className="p-float-label">
              <Controller
                control={businessGroupRolesUseForm.control}
                name="formData.roles"
                // rules={{
                //   required: "Choose at least 1 Role."
                // }}
                render={( { field, fieldState }) => {
                    return(
                      <MultiSelect
                        display="chip"
                        value={field.value ? [...field.value] : []} 
                        options={APRbacDisplayService.get_BusinessGroupRolesSelect_EntityIdList()} 
                        onChange={(e) => field.onChange(e.value)}
                        optionLabel={APEntityIdsService.nameOf('displayName')}
                        optionValue={APEntityIdsService.nameOf('id')}
                        className={classNames({ 'p-invalid': fieldState.invalid })}
                        disabled={isRolesDisabled}                       
                      />
                )}}
              />
              <label className={classNames({ 'p-error': businessGroupRolesUseForm.formState.errors.formData?.roles })}>Role(s)</label>
              </span>
              {APDisplayUtils.displayFormFieldErrorMessage4Array(businessGroupRolesUseForm.formState.errors.formData?.roles) }
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
