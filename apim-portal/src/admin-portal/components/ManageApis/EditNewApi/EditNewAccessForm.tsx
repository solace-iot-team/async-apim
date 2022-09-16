
import React from "react";
import { useForm, Controller } from 'react-hook-form';

import { classNames } from 'primereact/utils';
import { TreeSelect } from "primereact/treeselect";

import { TApiCallState } from "../../../../utils/ApiCallState";
import APDisplayUtils from "../../../../displayServices/APDisplayUtils";
import { UserContext } from "../../../../components/APContextProviders/APUserContextProvider";
import APMemberOfService, { 
  TAPMemberOfBusinessGroupDisplayTreeNodeList, 
  TAPMemberOfBusinessGroupDisplay, 
  TAPMemberOfBusinessGroupTreeTableNodeList 
} from "../../../../displayServices/APUsersDisplayService/APMemberOfService";
import { AuthContext } from "../../../../components/APContextProviders/AuthContextProvider";
import { AuthHelper } from "../../../../auth/AuthHelper";
import { EUIAdminPortalResourcePaths } from "../../../../utils/Globals";
import { TAPManagedAssetDisplay_BusinessGroupSharingList } from "../../../../displayServices/APManagedAssetDisplayService";
import APBusinessGroupsDisplayService from "../../../../displayServices/APBusinessGroupsDisplayService";
import { EAction } from "../ManageApisCommon";
import { EditNewBusinessGroupSharingListForm } from "../../ManageApiProducts/EditNewApiProduct/EditNewBusinessGroupSharingListForm";
import { TAPApiDisplay_Access } from "../../../../displayServices/APApisDisplayService";

import '../../../../components/APComponents.css';
import "../ManageApis.css";

export interface IEditNewAccessFormProps {
  action: EAction;
  formId: string;
  apApiDisplay_Access: TAPApiDisplay_Access;
  onSubmit: (apApiDisplay_Access: TAPApiDisplay_Access) => void;
  onError: (apiCallState: TApiCallState) => void;
}

export const EditNewAccessForm: React.FC<IEditNewAccessFormProps> = (props: IEditNewAccessFormProps) => {
  const ComponentName = 'EditNewAccessForm';

  type TManagedObject = TAPApiDisplay_Access;
  type TManagedObjectFormData = {
    owningBusinessGroupId?: string;
  };
  type TManagedObjectFormDataEnvelope = {
    businessGroupSharingList: TAPManagedAssetDisplay_BusinessGroupSharingList; /** not managed by form */
    formData: TManagedObjectFormData;
  }
  
  // const isNewManagedObject = (): boolean => {
  //   return props.action === EAction.NEW;
  // }

  const transform_ManagedObject_To_FormDataEnvelope = (mo: TManagedObject): TManagedObjectFormDataEnvelope => {
    const fd: TManagedObjectFormData = {
      owningBusinessGroupId: (mo.apBusinessGroupInfo.apOwningBusinessGroupEntityId.id === APBusinessGroupsDisplayService.get_recovered_BusinessGroupId() ? undefined : mo.apBusinessGroupInfo.apOwningBusinessGroupEntityId.id),
    };
    return {
      businessGroupSharingList: mo.apBusinessGroupInfo.apBusinessGroupSharingList,
      formData: fd
    };
  }

  const create_ManagedObject_From_FormEntities = ({formDataEnvelope}: {
    formDataEnvelope: TManagedObjectFormDataEnvelope;
  }): TManagedObject => {
    const funcName = 'create_ManagedObject_From_FormEntities';
    const logName = `${ComponentName}.${funcName}()`;
    if(apMemberOfBusinessGroupDisplayTreeNodeList === undefined) throw new Error(`${logName}: apMemberOfBusinessGroupDisplayTreeNodeList === undefined`);
    
    const mo: TManagedObject = props.apApiDisplay_Access;
    const fd: TManagedObjectFormData = formDataEnvelope.formData;

    if(fd.owningBusinessGroupId === undefined) throw new Error(`${logName}: fd.owningBusinessGroupId === undefined`);
    const apOwningMemberOfBusinessGroupDisplay: TAPMemberOfBusinessGroupDisplay | undefined = APMemberOfService.find_ApMemberOfBusinessGroupDisplay_From_ApMemberOfBusinessGroupDisplayTreeNodeList({
      apMemberOfBusinessGroupDisplayTreeNodeList: apMemberOfBusinessGroupDisplayTreeNodeList,
      businessGroupId: fd.owningBusinessGroupId
    });
    if(apOwningMemberOfBusinessGroupDisplay === undefined) throw new Error(`${logName}: apOwningMemberOfBusinessGroupDisplay === undefined`);

    // business group info
    mo.apBusinessGroupInfo.apOwningBusinessGroupEntityId = apOwningMemberOfBusinessGroupDisplay.apBusinessGroupDisplay.apEntityId;
    // ensure owning business group is removed from sharing business group list
    // should not happen, safeguard
    const idx = formDataEnvelope.businessGroupSharingList.findIndex( (x) => {
      return x.apEntityId.id === mo.apBusinessGroupInfo.apOwningBusinessGroupEntityId.id;
    });
    if(idx > -1) formDataEnvelope.businessGroupSharingList.splice(idx, 1);
    mo.apBusinessGroupInfo.apBusinessGroupSharingList = formDataEnvelope.businessGroupSharingList;

    return mo;
  }
  
  const [userContext] = React.useContext(UserContext);
  const [authContext] = React.useContext(AuthContext);
  const [managedObject] = React.useState<TManagedObject>(props.apApiDisplay_Access);
  const [apMemberOfBusinessGroupDisplayTreeNodeList, setApMemberOfBusinessGroupDisplayTreeNodeList] = React.useState<TAPMemberOfBusinessGroupDisplayTreeNodeList>();
  const [apMemberOfBusinessGroupTreeTableNodeList, setApMemberOfBusinessGroupTreeTableNodeList] = React.useState<TAPMemberOfBusinessGroupTreeTableNodeList>();
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
    setApMemberOfBusinessGroupTreeTableNodeList(APMemberOfService.create_ApMemberOfBusinessGroupTreeTableNodeList_From_ApMemberOfBusinessGroupDisplayTreeNodeList({
      apMemberOfBusinessGroupDisplayTreeNodeList: apMemberOfBusinessGroupDisplayTreeNodeList,
      includeBusinessGroupIsSelectable: true,
      accessOnly_To_BusinessGroupManageAssets: true
    }));
  }, [apMemberOfBusinessGroupDisplayTreeNodeList]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(apMemberOfBusinessGroupTreeTableNodeList === undefined) return;
    setManagedObjectFormDataEnvelope(transform_ManagedObject_To_FormDataEnvelope(managedObject));
  }, [apMemberOfBusinessGroupTreeTableNodeList]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(managedObjectFormDataEnvelope === undefined) return;
    managedObjectUseForm.setValue('formData', managedObjectFormDataEnvelope.formData);
    // set arrays explicitly
    managedObjectUseForm.setValue('businessGroupSharingList', managedObjectFormDataEnvelope.businessGroupSharingList);
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
    if(AuthHelper.isAuthorizedToAccessResource(authContext.authorizedResourcePathsAsString, EUIAdminPortalResourcePaths.ManageOrganizationApis_Edit_OwningBusinessGroup)) return true;
    return false;
  }

  const renderChangeOwningBusinessGroup_FormField = () => {
    const funcName = 'renderChangeOwningBusinessGroup_FormField';
    const logName = `${ComponentName}.${funcName}()`;

    if(!isAllowed_ChangeOwningBusinessGroup()) return;

    if(apMemberOfBusinessGroupTreeTableNodeList === undefined) throw new Error(`${logName}: apMemberOfBusinessGroupTreeTableNodeList === undefined`);

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
              // console.log(`${logName}: field=${JSON.stringify(field)}`);
              return(
                <TreeSelect
                  id={field.name}
                  {...field}
                  options={apMemberOfBusinessGroupTreeTableNodeList}
                  onChange={(e) => { field.onChange(e.value); }} 
                  // placeholder="Select Business Group"
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

  const onChange_EditNewBusinessGroupSharingList = (apManagedAssetDisplay_BusinessGroupSharingList: TAPManagedAssetDisplay_BusinessGroupSharingList) => {
    const funcName = 'onChange_EditNewBusinessGroupSharingList';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObjectFormDataEnvelope === undefined) throw new Error(`${logName}: managedObjectFormDataEnvelope === undefined`);

    const newMofde: TManagedObjectFormDataEnvelope = {
      businessGroupSharingList: apManagedAssetDisplay_BusinessGroupSharingList,
      formData: managedObjectUseForm.getValues('formData')
    };
    // alert(`${logName}: newMofde.businessGroupSharingList = ${JSON.stringify(newMofde.businessGroupSharingList, null, 2)}`);
    setManagedObjectFormDataEnvelope(newMofde);
  }

  const renderManagedObjectForm = () => {
    const funcName = 'renderManagedObjectForm';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObjectFormDataEnvelope === undefined) throw new Error(`${logName}: managedObjectFormDataEnvelope === undefined`);
    if(apMemberOfBusinessGroupTreeTableNodeList === undefined) throw new Error(`${logName}: apMemberOfBusinessGroupTreeTableNodeList === undefined`);
    if(apMemberOfBusinessGroupDisplayTreeNodeList === undefined) throw new Error(`${logName}: apMemberOfBusinessGroupDisplayTreeNodeList === undefined`);
    const uniqueKey_EditNewBusinessGroupSharingListForm = ComponentName+'_EditNewBusinessGroupSharingListForm';

    const _owningBusinessGroupId: string | undefined = managedObjectUseForm.watch('formData.owningBusinessGroupId');
    // catch the first render
    const owningBusinessGroupId: string | undefined = _owningBusinessGroupId === undefined ? managedObjectFormDataEnvelope.formData.owningBusinessGroupId : _owningBusinessGroupId;
  
    return (
      <div className="card p-mt-4">
        {/* DEBUG */}
        {/* <div>managedObjectFormDataEnvelope.businessGroupSharingList = <pre>{JSON.stringify(managedObjectFormDataEnvelope.businessGroupSharingList, null, 2)}</pre></div> */}
        <div className="p-fluid">
          <form id={props.formId} onSubmit={managedObjectUseForm.handleSubmit(onSubmitManagedObjectForm, onInvalidSubmitManagedObjectForm)} className="p-fluid">      
            {/* owning business group */}
            { renderChangeOwningBusinessGroup_FormField() }
          </form>

          {/* outside the form */}
          <div className="p-field">
            {/* business group sharing */}
            <div className="p-text-bold p-mb-3">Business Group Sharing:</div>
            <div className="p-ml-2">
              <EditNewBusinessGroupSharingListForm
                key={uniqueKey_EditNewBusinessGroupSharingListForm}
                uniqueKeyPrefix={uniqueKey_EditNewBusinessGroupSharingListForm}
                apManagedAssetDisplay_BusinessGroupSharingList={managedObjectFormDataEnvelope.businessGroupSharingList}
                apMemberOfBusinessGroupDisplayTreeNodeList={apMemberOfBusinessGroupDisplayTreeNodeList}
                apExcludeBusinessGroupIdList={owningBusinessGroupId === undefined ? [] : [owningBusinessGroupId]}
                onChange={onChange_EditNewBusinessGroupSharingList}
              />
            </div>
          </div>

        </div>
      </div>
    );
  }

  
  return (
    <div className="manage-apis">

      { managedObjectFormDataEnvelope && renderManagedObjectForm() }

    </div>
  );
}
