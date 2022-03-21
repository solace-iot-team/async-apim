
import React from "react";
import { useForm, Controller } from 'react-hook-form';

import { classNames } from "primereact/utils";
import { Button } from "primereact/button";
import { MultiSelect } from "primereact/multiselect";
import { Toolbar } from "primereact/toolbar";

import APEntityIdsService, { 
  TAPEntityId, 
} from "../../../../utils/APEntityIdsService";
import APRbacDisplayService from "../../../../displayServices/APRbacDisplayService";
import { APSBusinessGroupAuthRoleList } from "../../../../_generated/@solace-iot-team/apim-server-openapi-browser";
import APDisplayUtils from "../../../../displayServices/APDisplayUtils";
import APOrganizationUsersDisplayService, { TAPOrganizationUserDisplay } from "../../../../displayServices/APUsersDisplayService/APOrganizationUsersDisplayService";
import APMemberOfService, { 
  TAPMemberOfBusinessGroupDisplay, 
  TAPMemberOfBusinessGroupDisplayList 
} from "../../../../displayServices/APUsersDisplayService/APMemberOfService";
import { Globals } from "../../../../utils/Globals";

import '../../../../components/APComponents.css';
import "../ManageOrganizationUsers.css";

export enum EEditOrganizationUserBusinessGroupRolesAction {
  EDIT = 'EDIT',
  REMOVE = 'REMOVE'
}

export interface IEditOrganizationUserBusinessGroupRolesProps {
  action: EEditOrganizationUserBusinessGroupRolesAction;
  apOrganizationUserDisplay: TAPOrganizationUserDisplay;
  businessGroupEntityId: TAPEntityId;
  onSave: (updated_ApMemberOfBusinessGroupDisplayList: TAPMemberOfBusinessGroupDisplayList) => void;
  onCancel: () => void;
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

  const create_FormDataEnvelope = (mo: TManagedObject): TBusinessGroupRolesFormDataEnvelope => {
    // find the roles of the business group
    const apMemberOfBusinessGroupDisplay: TAPMemberOfBusinessGroupDisplay | undefined = APMemberOfService.find_ApMemberOfBusinessGroupDisplay({
      apMemberOfBusinessGroupDisplayList: mo,
      businessGroupEntityId: props.businessGroupEntityId,
    });
    const fd: TBusinessGroupRolesFormData = {
      roles: apMemberOfBusinessGroupDisplay !== undefined ? APEntityIdsService.create_IdList(apMemberOfBusinessGroupDisplay.apConfiguredBusinessGroupRoleEntityIdList) as APSBusinessGroupAuthRoleList : [],
    }
    return {
      formData: fd
    };
  }

  const create_ManagedObject_From_FormEntities = ({ orginalManagedObject, formDataEnvelope }: {
    orginalManagedObject: TManagedObject;
    formDataEnvelope: TBusinessGroupRolesFormDataEnvelope;
  }): TManagedObject => {
    const funcName = 'create_ManagedObject_From_FormEntities';
    const logName = `${ComponentName}.${funcName}()`;
    if(props.apOrganizationUserDisplay.completeOrganizationBusinessGroupDisplayList === undefined) throw new Error(`${logName}: props.apOrganizationUserDisplay.completeOrganizationBusinessGroupDisplayList === undefined`);

    if(props.action === EEditOrganizationUserBusinessGroupRolesAction.REMOVE) {
      formDataEnvelope.formData.roles = [];
    }
    // apply new roles to a clone of entire business group display list
    const cloneOf_original_mo: TManagedObject = APMemberOfService.clone_ApMemberOfBusinessGroupDisplayList({ apMemberOfBusinessGroupDisplayList: orginalManagedObject });
    const newMo: TManagedObject = APMemberOfService.update_ApMemberOfBusinessGroupDisplayList({
      apMemberOfBusinessGroupDisplayList: cloneOf_original_mo,
      businessGroupEntityId: props.businessGroupEntityId,
      completeApOrganizationBusinessGroupDisplayList: props.apOrganizationUserDisplay.completeOrganizationBusinessGroupDisplayList,
      new_apConfiguredBusinessGroupRoleEntityIdList: APRbacDisplayService.create_BusinessGroupRoles_EntityIdList({apsBusinessGroupAuthRoleList: formDataEnvelope.formData.roles }),
    });
    return newMo;
  }

  const [isInitialized, setIsInitialized] = React.useState<boolean>(false);
  const [managedObject, setManagedObject] = React.useState<TManagedObject>();
  const [managedObjectFormDataEnvelope, setManagedObjectFormDataEnvelope] = React.useState<TBusinessGroupRolesFormDataEnvelope>();
  const businessGroupRolesUseForm = useForm<TBusinessGroupRolesFormDataEnvelope>();
  const formId = ComponentName;

  const doInitialize = async () => {
    setManagedObject(props.apOrganizationUserDisplay.memberOfOrganizationDisplay.apMemberOfBusinessGroupDisplayList);
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
      businessGroupRolesUseForm.setValue('formData.roles', managedObjectFormDataEnvelope.formData.roles);
      setIsInitialized(true);
    }
  }, [managedObjectFormDataEnvelope]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const managedObjectFormFooterRightToolbarTemplate = () => {                        
    if(props.action === EEditOrganizationUserBusinessGroupRolesAction.EDIT) {
      return (
        <React.Fragment>
          <Button label="Cancel" type="button" className="p-button-text p-button-plain p-button-outlined" onClick={props.onCancel} />
          <Button key={ComponentName+'submit'} label="Save" form={formId} type="submit" icon="pi pi-save" className="p-button-text p-button-plain p-button-outlined" />
        </React.Fragment>
      );
    }
    if(props.action === EEditOrganizationUserBusinessGroupRolesAction.REMOVE) {
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

  const doSubmitForm = async(fde: TBusinessGroupRolesFormDataEnvelope) => {
    const funcName = 'doSubmitForm';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);

    const new_apMemberOfBusinessGroupDisplayList: TAPMemberOfBusinessGroupDisplayList = create_ManagedObject_From_FormEntities({
      orginalManagedObject: managedObject,
      formDataEnvelope: fde
    });
    props.onSave(new_apMemberOfBusinessGroupDisplayList);
  }
  
  const onSubmitForm = (fde: TBusinessGroupRolesFormDataEnvelope) => {
    doSubmitForm(fde);
  }

  const onInvalidSubmitForm = () => {
    // placeholder
  }

  const validate_UpdatedOrganizationUserBusinessGroupRoles = (rolesIdList: APSBusinessGroupAuthRoleList): string | boolean => {
    const funcName = 'validate_UpdatedOrganizationUserBusinessGroupRoles';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);
    
    if(props.action === EEditOrganizationUserBusinessGroupRolesAction.REMOVE) rolesIdList = [];
    
    if(rolesIdList.length > 0) return true;

    const validation_fde: TBusinessGroupRolesFormDataEnvelope = {
      formData: {
        roles: rolesIdList
      }
    };
    const validationManagedObject: TManagedObject = create_ManagedObject_From_FormEntities({
      orginalManagedObject: managedObject,
      formDataEnvelope: validation_fde
    });

    const areNewRolesValid = APOrganizationUsersDisplayService.validate_RequestedUpdateOf_ApOrganizationUserDisplay_With_ApMemberOfBusinessGroupDisplayList({
      current_ApOrganizationUserDisplay: props.apOrganizationUserDisplay,
      requestedUpdateWith_apMemberOfBusinessGroupDisplayList: validationManagedObject
    });

    if(!areNewRolesValid) {
      switch(props.action) {
        case EEditOrganizationUserBusinessGroupRolesAction.REMOVE:
          return `Cannot remove user from business group. User is not a member of any other group nor has any organization roles. To remove user from organization, delete the user instead.`;          
        case EEditOrganizationUserBusinessGroupRolesAction.EDIT:
          return `Specify at least 1 business group role. User is not a member of any other group nor has any organization roles. To remove user from organization, delete the user instead.`;
        default:
          Globals.assertNever(logName, props.action);      
      }
    }
    return true;
  }

  const renderManagedObjectForm = () => {
    const isRolesDisabled: boolean = (props.action === EEditOrganizationUserBusinessGroupRolesAction.REMOVE);
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
                rules={{
                //   required: "Choose at least 1 Role."
                  validate: validate_UpdatedOrganizationUserBusinessGroupRoles  
                }}
                render={( { field, fieldState }) => {
                    return(
                      <MultiSelect
                        display="chip"
                        value={field.value ? [...field.value] : []} 
                        options={APRbacDisplayService.create_BusinessGroupRoles_SelectEntityIdList()} 
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
