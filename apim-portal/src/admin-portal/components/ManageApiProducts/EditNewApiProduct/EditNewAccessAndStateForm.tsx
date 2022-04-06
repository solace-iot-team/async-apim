
import React from "react";
import { useForm, Controller } from 'react-hook-form';

import { classNames } from 'primereact/utils';
import { Dropdown } from "primereact/dropdown";
import { TreeSelect } from "primereact/treeselect";

import { TApiCallState } from "../../../../utils/ApiCallState";
import APDisplayUtils from "../../../../displayServices/APDisplayUtils";
import { APIProductAccessLevel } from "@solace-iot-team/apim-connector-openapi-browser";
import { EAction} from "../ManageApiProductsCommon";
import { TAPApiProductDisplay_AccessAndState } from "../../../../displayServices/APApiProductsDisplayService";
import APLifecycleDisplayService, { EAPLifecycleState } from "../../../../displayServices/APLifecycleDisplayService";
import APAccessLevelDisplayService from "../../../../displayServices/APAccessLevelDisplayService";
import { UserContext } from "../../../../components/APContextProviders/APUserContextProvider";
import APMemberOfService, { 
  TAPMemberOfBusinessGroupDisplayTreeNodeList, 
  TAPMemberOfBusinessGroupDisplay, 
  TAPMemberOfBusinessGroupTreeTableNodeList 
} from "../../../../displayServices/APUsersDisplayService/APMemberOfService";
import { AuthContext } from "../../../../components/AuthContextProvider/AuthContextProvider";
import { AuthHelper } from "../../../../auth/AuthHelper";
import { EUIAdminPortalResourcePaths } from "../../../../utils/Globals";

import '../../../../components/APComponents.css';
import "../ManageApiProducts.css";

export interface IEditNewAccessAndStateFormProps {
  action: EAction;
  formId: string;
  apApiProductDisplay_AccessAndState: TAPApiProductDisplay_AccessAndState;
  onSubmit: (apApiProductDisplay_AccessAndState: TAPApiProductDisplay_AccessAndState) => void;
  onError: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const EditNewAccessAndStateForm: React.FC<IEditNewAccessAndStateFormProps> = (props: IEditNewAccessAndStateFormProps) => {
  const ComponentName = 'EditNewAccessAndStateForm';

  type TManagedObject = TAPApiProductDisplay_AccessAndState;
  type TManagedObjectFormData = {
    accessLevel: APIProductAccessLevel;
    lifecycleState: EAPLifecycleState;
    owningBusinessGroupId: string;
  };
  type TManagedObjectFormDataEnvelope = {
    formData: TManagedObjectFormData;
  }
  
  const transform_ManagedObject_To_FormDataEnvelope = (mo: TManagedObject): TManagedObjectFormDataEnvelope => {
    const fd: TManagedObjectFormData = {
      accessLevel: mo.apAccessLevel,
      lifecycleState: mo.apLifecycleInfo.apLifecycleState,
      owningBusinessGroupId: mo.apBusinessGroupInfo.apOwningBusinessGroupEntityId.id,
    };
    return {
      formData: fd
    };
  }

  const create_ManagedObject_From_FormEntities = ({formDataEnvelope}: {
    formDataEnvelope: TManagedObjectFormDataEnvelope;
  }): TManagedObject => {
    const funcName = 'create_ManagedObject_From_FormEntities';
    const logName = `${ComponentName}.${funcName}()`;
    if(apMemberOfBusinessGroupDisplayTreeNodeList === undefined) throw new Error(`${logName}: apMemberOfBusinessGroupDisplayTreeNodeList === undefined`);

    const mo: TManagedObject = props.apApiProductDisplay_AccessAndState;
    const fd: TManagedObjectFormData = formDataEnvelope.formData;

    const apMemberOfBusinessGroupDisplay: TAPMemberOfBusinessGroupDisplay | undefined = APMemberOfService.find_ApMemberOfBusinessGroupDisplay_From_ApMemberOfBusinessGroupDisplayTreeNodeList({
      apMemberOfBusinessGroupDisplayTreeNodeList: apMemberOfBusinessGroupDisplayTreeNodeList,
      businessGroupId: fd.owningBusinessGroupId
    });
    if(apMemberOfBusinessGroupDisplay === undefined) throw new Error(`${logName}: apMemberOfBusinessGroupDisplay === undefined`);

    mo.apAccessLevel = fd.accessLevel;
    mo.apLifecycleInfo.apLifecycleState = fd.lifecycleState;
    mo.apBusinessGroupInfo.apOwningBusinessGroupEntityId = apMemberOfBusinessGroupDisplay.apBusinessGroupDisplay.apEntityId
    return mo;
  }
  
  const [userContext] = React.useContext(UserContext);
  const [authContext] = React.useContext(AuthContext);
  const [managedObject] = React.useState<TManagedObject>(props.apApiProductDisplay_AccessAndState);
  const [apMemberOfBusinessGroupDisplayTreeNodeList, setApMemberOfBusinessGroupDisplayTreeNodeList] = React.useState<TAPMemberOfBusinessGroupDisplayTreeNodeList>();
  const [managedObjectFormDataEnvelope, setManagedObjectFormDataEnvelope] = React.useState<TManagedObjectFormDataEnvelope>();
  const managedObjectUseForm = useForm<TManagedObjectFormDataEnvelope>();

  const doInitialize = async () => {
    setApMemberOfBusinessGroupDisplayTreeNodeList(APMemberOfService.create_pruned_ApMemberOfBusinessGroupDisplayTreeNodeList({
      apMemberOfBusinessGroupDisplayTreeNodeList: userContext.runtimeSettings.apMemberOfBusinessGroupDisplayTreeNodeList,
      accessOnly_To_BusinessGroupManageAssets: true,
    }));
  }

  // * useEffect Hooks *

  React.useEffect(() => {
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(apMemberOfBusinessGroupDisplayTreeNodeList === undefined) return;
    setManagedObjectFormDataEnvelope(transform_ManagedObject_To_FormDataEnvelope(managedObject));
  }, [apMemberOfBusinessGroupDisplayTreeNodeList]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(managedObjectFormDataEnvelope === undefined) return;
    managedObjectUseForm.setValue('formData', managedObjectFormDataEnvelope.formData);
  }, [managedObjectFormDataEnvelope]) /* eslint-disable-line react-hooks/exhaustive-deps */

  const onSubmitManagedObjectForm = (newMofde: TManagedObjectFormDataEnvelope) => {
    props.onSubmit(create_ManagedObject_From_FormEntities({
      formDataEnvelope: newMofde,
    }));
  }

  const onInvalidSubmitManagedObjectForm = () => {
    // placeholder
  }

  const isAllowed_ChangeOwningBusinessGroup = (): boolean => {
    if(userContext.apLoginUserDisplay.apEntityId.id === managedObject.apOwnerInfo.id) return true;
    if(AuthHelper.isAuthorizedToAccessResource(authContext.authorizedResourcePathsAsString, EUIAdminPortalResourcePaths.ManageOrganizationApiProducts_Edit_OwningBusinessGroup)) return true;
    return false;
  }

  const renderChangeOwningBusinessGroup_FormField = () => {
    const funcName = 'renderChangeOwningBusinessGroup_FormField';
    const logName = `${ComponentName}.${funcName}()`;

    if(!isAllowed_ChangeOwningBusinessGroup()) return;

    if(apMemberOfBusinessGroupDisplayTreeNodeList === undefined) throw new Error(`${logName}: apMemberOfBusinessGroupDisplayTreeNodeList === undefined`);

    const apMemberOfBusinessGroupTreeTableNodeList: TAPMemberOfBusinessGroupTreeTableNodeList = APMemberOfService.create_ApMemberOfBusinessGroupTreeTableNodeList_From_ApMemberOfBusinessGroupDisplayTreeNodeList({
      apMemberOfBusinessGroupDisplayTreeNodeList: apMemberOfBusinessGroupDisplayTreeNodeList,
      includeBusinessGroupIsSelectable: true,
      accessOnly_To_BusinessGroupManageAssets: true
    });

    return(
      <div className="p-field">
        <span className="p-float-label">
          <Controller
            control={managedObjectUseForm.control}
            name="formData.owningBusinessGroupId"
            rules={{
              required: "Select owning business group.",
            }}
            render={( { field, fieldState }) => {
              console.log(`${logName}: field=${JSON.stringify(field)}`);
              return(
                <TreeSelect
                  id={field.name}
                  {...field}
                  options={apMemberOfBusinessGroupTreeTableNodeList}
                  onChange={(e) => field.onChange(e.value)}
                  placeholder="Select Business Group"
                  filter={true}
                  selectionMode="single"
                  className={classNames({ 'p-invalid': fieldState.invalid })}                       
                />
              )}}
          />
          <label className={classNames({ 'p-error': managedObjectUseForm.formState.errors.formData?.owningBusinessGroupId })}>Owning Business Group*</label>
        </span>
        {APDisplayUtils.displayFormFieldErrorMessage(managedObjectUseForm.formState.errors.formData?.owningBusinessGroupId)}
      </div>
    );
  }

  const renderManagedObjectForm = () => {
    return (
      <div className="card p-mt-4">
        <p>TBD: share with biz groups, list biz groups where role=APITeam, share as readonly=yes/no</p>
        <div className="p-fluid">
          <form id={props.formId} onSubmit={managedObjectUseForm.handleSubmit(onSubmitManagedObjectForm, onInvalidSubmitManagedObjectForm)} className="p-fluid">      
            {/* State */}
            <div className="p-field">
              <span className="p-float-label">
                <Controller
                  control={managedObjectUseForm.control}
                  name="formData.lifecycleState"
                  rules={{
                    required: "Enter new state.",
                  }}
                  render={( { field, fieldState }) => {
                    return(
                      <Dropdown
                        id={field.name}
                        {...field}
                        options={APLifecycleDisplayService.get_SelectList()} 
                        onChange={(e) => field.onChange(e.value)}
                        className={classNames({ 'p-invalid': fieldState.invalid })}                       
                      />                        
                  )}}
                />
                <label className={classNames({ 'p-error': managedObjectUseForm.formState.errors.formData?.lifecycleState })}>State*</label>
              </span>
              {APDisplayUtils.displayFormFieldErrorMessage(managedObjectUseForm.formState.errors.formData?.lifecycleState)}
            </div>
            {/* accessLevel */}
            <div className="p-field">
              <span className="p-float-label">
                <Controller
                  control={managedObjectUseForm.control}
                  name="formData.accessLevel"
                  rules={{
                    required: "Select access level.",
                  }}
                  render={( { field, fieldState }) => {
                    return(
                      <Dropdown
                        id={field.name}
                        {...field}
                        options={APAccessLevelDisplayService.get_SelectList()} 
                        onChange={(e) => field.onChange(e.value)}
                        className={classNames({ 'p-invalid': fieldState.invalid })}                       
                      />                        
                    )}}
                />
                <label className={classNames({ 'p-error': managedObjectUseForm.formState.errors.formData?.accessLevel })}>Access Level*</label>
              </span>
              {APDisplayUtils.displayFormFieldErrorMessage(managedObjectUseForm.formState.errors.formData?.accessLevel)}
            </div>
            {/* owning business group */}
            { renderChangeOwningBusinessGroup_FormField() }
          </form>
        </div>
      </div>
    );
  }

  
  return (
    <div className="manage-api-products">

      { managedObjectFormDataEnvelope && renderManagedObjectForm() }

    </div>
  );
}
