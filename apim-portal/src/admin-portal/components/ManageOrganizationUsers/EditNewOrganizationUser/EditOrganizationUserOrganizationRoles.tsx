
import React from "react";
import { useForm, Controller } from 'react-hook-form';

import { Button } from 'primereact/button';
import { classNames } from 'primereact/utils';
import { MultiSelect } from "primereact/multiselect";

import { ApiCallState, TApiCallState } from "../../../../utils/ApiCallState";
import { APSClientOpenApi } from "../../../../utils/APSClientOpenApi";
import { E_CALL_STATE_ACTIONS } from "../ManageOrganizationUsersCommon";
import APUsersDisplayService, { 
  TAPUserDisplay,
  TAPUserOrganizationRolesDisplay
} from "../../../../displayServices/APUsersDisplayService";
import APDisplayUtils from "../../../../displayServices/APDisplayUtils";
import APEntityIdsService, { TAPEntityId } from "../../../../utils/APEntityIdsService";
import APRbacDisplayService from "../../../../displayServices/APRbacDisplayService";
import { APSOrganizationAuthRoleList } from "../../../../_generated/@solace-iot-team/apim-server-openapi-browser";

import '../../../../components/APComponents.css';
import "../ManageOrganizationUsers.css";

export interface IEditOrganizationUserOrganizationRolesProps {
  organizationEntityId: TAPEntityId;
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
  const transform_ManagedObject_To_FormDataEnvelope = (mo: TManagedObject): TManagedObjectFormDataEnvelope => {
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
    // const funcName = 'create_ManagedObject_From_FormEntities';
    // const logName = `${ComponentName}.${funcName}()`;
    const mo: TManagedObject = orginalManagedObject;
    const fd: TManagedObjectFormData = formDataEnvelope.formData;
    mo.apOrganizationAuthRoleEntityIdList = APRbacDisplayService.create_OrganizationRoles_EntityIdList(fd.organizationAuthRoleIdList as APSOrganizationAuthRoleList);
    return mo;
  }
  
  const [managedObject, setManagedObject] = React.useState<TManagedObject>();
  const [managedObjectFormDataEnvelope, setManagedObjectFormDataEnvelope] = React.useState<TManagedObjectFormDataEnvelope>();
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const managedObjectUseForm = useForm<TManagedObjectFormDataEnvelope>();
  const formId = ComponentName;

  // * Api Calls *

  const apiUpdateManagedObject = async(mo: TManagedObject): Promise<TApiCallState> => {
    const funcName = 'apiUpdateManagedObject';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_UPDATE_USER_CREDENTIALS, `update credentials for user: ${mo.apEntityId.id}`);
    try { 
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
    // const funcName = 'doInitialize';
    // const logName = `${ComponentName}.${funcName}()`;
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
    if(managedObject) {
      setManagedObjectFormDataEnvelope(transform_ManagedObject_To_FormDataEnvelope(managedObject));
    }
  }, [managedObject]) /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(managedObjectFormDataEnvelope) managedObjectUseForm.setValue('formData.organizationAuthRoleIdList', managedObjectFormDataEnvelope.formData.organizationAuthRoleIdList);
  }, [managedObjectFormDataEnvelope]) /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    // const funcName = 'useEffect[apiCallStatus]';
    // const logName = `${ComponentName}.${funcName}()`;
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
      else props.onSaveSuccess(apiCallStatus);
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const doSubmitManagedObject = async (mo: TManagedObject) => {
    const funcName = 'doSubmitManagedObject';
    const logName = `${ComponentName}.${funcName}()`;
    props.onLoadingChange(true);
    await apiUpdateManagedObject(mo);
    props.onLoadingChange(false);
  }

  const onSubmitManagedObjectForm = (newMofde: TManagedObjectFormDataEnvelope) => {
    const funcName = 'onSubmitManagedObjectForm';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);
    alert(`${logName}: if roles are empty, check if any other roles in any other groups, otherwise ask user to remove user from org? cancel, remove`);
    doSubmitManagedObject(create_ManagedObject_From_FormEntities({
      orginalManagedObject: managedObject,
      formDataEnvelope: newMofde,
    }));
  }

  const onInvalidSubmitManagedObjectForm = () => {
    // placeholder
  }

  const renderManagedObjectForm = (mo: TManagedObject) => {
    return (
      <div className="card p-mt-2">
        <div><b>Organization</b>:</div>
        <div className="p-fluid">
          <form id={formId} onSubmit={managedObjectUseForm.handleSubmit(onSubmitManagedObjectForm, onInvalidSubmitManagedObjectForm)} className="p-fluid">           
            {/* Organization Roles */}
            <div className="p-field">
              <div className="p-d-flex">
                <span className="p-float-label">
                  <Controller
                    name="formData.organizationAuthRoleIdList"
                    control={managedObjectUseForm.control}
                    render={( { field, fieldState }) => {
                      // console.log(`${logName}: field=${JSON.stringify(field)}, fieldState=${JSON.stringify(fieldState)}`);
                      return(
                        <React.Fragment>
                          <MultiSelect
                            display="chip"
                            value={field.value ? [...field.value] : []} 
                            options={APRbacDisplayService.create_OrganizationRoles_SelectEntityIdList()} 
                            onChange={(e) => field.onChange(e.value)}
                            optionLabel={APEntityIdsService.nameOf('displayName')}
                            optionValue={APEntityIdsService.nameOf('id')}
                            // style={{width: '800px'}} 
                            className={classNames({ 'p-invalid': fieldState.invalid })}                       
                          />
                        </React.Fragment>
                    )}}
                  />
                  <label className={classNames({ 'p-error': managedObjectUseForm.formState.errors.formData?.organizationAuthRoleIdList })}>Role(s)</label>
                </span>
                {APDisplayUtils.displayFormFieldErrorMessage4Array(managedObjectUseForm.formState.errors.formData?.organizationAuthRoleIdList)}
                <div className="p-ml-2 p-as-center">
                  <Button key={ComponentName+'Save'} style={{ width: 'fit-content' }} form={formId} type="submit" label="Save" icon="pi pi-save" className="p-button-text p-button-plain p-button-outlined" />
                </div>
              </div>
            </div>
          </form>  
        </div>
      </div>
    );
  }

  
  return (
    <div className="manage-users">

      {managedObject && 
        renderManagedObjectForm(managedObject)
      }
    </div>
  );
}
