
import React from "react";
import { useForm, Controller } from 'react-hook-form';

import { classNames } from "primereact/utils";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { TreeSelect } from "primereact/treeselect";
import { Dropdown } from "primereact/dropdown";

import { 
  E_ManagedAssetDisplay_BusinessGroupSharing_AccessType,
  TAPManagedAssetDisplay_BusinessGroupSharing, 
  TAPManagedAssetDisplay_BusinessGroupSharingList 
} from "../../../../displayServices/APManagedAssetDisplayService";
import APAdminPortalApiProductsDisplayService from "../../../displayServices/APAdminPortalApiProductsDisplayService";
import APEntityIdsService from "../../../../utils/APEntityIdsService";
import APDisplayUtils from "../../../../displayServices/APDisplayUtils";
import APMemberOfService, { 
  TAPMemberOfBusinessGroupDisplay, 
  TAPMemberOfBusinessGroupDisplayTreeNodeList, 
  TAPMemberOfBusinessGroupTreeTableNodeList 
} from "../../../../displayServices/APUsersDisplayService/APMemberOfService";

import '../../../../components/APComponents.css';
import "../ManageApiProducts.css";

export interface IEditNewBusinessGroupSharingListFormProps {
  uniqueKeyPrefix: string; /** provide a unique prefix for the formId and button keys so component can be used multiple times on same parent component with different formIds */
  apManagedAssetDisplay_BusinessGroupSharingList: TAPManagedAssetDisplay_BusinessGroupSharingList;
  apMemberOfBusinessGroupDisplayTreeNodeList: TAPMemberOfBusinessGroupDisplayTreeNodeList; /** used to create the tree table select */
  apExcludeBusinessGroupIdList: Array<string>; /** list of business group ids to exclude from selectable list, used for excluding owning business group id */
  onChange: (apManagedAssetDisplay_BusinessGroupSharingList: TAPManagedAssetDisplay_BusinessGroupSharingList) => void; /** called every time the list has changed */
}

export const EditNewBusinessGroupSharingListForm: React.FC<IEditNewBusinessGroupSharingListFormProps> = (props: IEditNewBusinessGroupSharingListFormProps) => {
  const ComponentName = 'EditNewBusinessGroupSharingListForm';

  type TManagedObject = TAPManagedAssetDisplay_BusinessGroupSharing; 
  type TManagedObjectList = Array<TManagedObject>;

  type TManagedObjectFormData = {
    businessGroupId: string;
    accessType: E_ManagedAssetDisplay_BusinessGroupSharing_AccessType;
  };
  type TManagedObjectFormDataEnvelope = {
    formData: TManagedObjectFormData;
  }

  const transform_ManagedObject_To_FormDataEnvelope = (mo: TManagedObject): TManagedObjectFormDataEnvelope => {
    const fd: TManagedObjectFormData = {
      businessGroupId: mo.apEntityId.id,
      accessType: mo.apSharingAccessType
    };
    return {
      formData: fd
    };
  }

  const create_ManagedObject_From_FormEntities = ({formDataEnvelope}: {
    formDataEnvelope: TManagedObjectFormDataEnvelope;
  }): TManagedObject => {
    const mo: TManagedObject = {
      apEntityId: {
        id: formDataEnvelope.formData.businessGroupId,
        displayName: 'set later...'
      },
      apSharingAccessType: formDataEnvelope.formData.accessType,
    }
    return mo;
  }

  const EmptyManagedObject: TManagedObject = APAdminPortalApiProductsDisplayService.create_Empty_ApManagedAssetDisplay_BusinessGroupSharing();
  const UniqueKeyPrefix: string = props.uniqueKeyPrefix + '_' + ComponentName;
  const FormId: string = UniqueKeyPrefix + '_Form';
  const EmptyMessage: string = 'No business groups defined.';


  const [apMemberOfBusinessGroupTreeTableNodeList, setApMemberOfBusinessGroupTreeTableNodeList] = React.useState<TAPMemberOfBusinessGroupTreeTableNodeList>();
  const [managedObject, setManagedObject] = React.useState<TManagedObject>();
  const [managedObjectList, setManagedObjectList] = React.useState<TManagedObjectList>(props.apManagedAssetDisplay_BusinessGroupSharingList);
  const [isManagedObjectListChanged, setIsManagedObjectListChanged] = React.useState<boolean>(false);
  const [managedObjectFormDataEnvelope, setManagedObjectFormDataEnvelope] = React.useState<TManagedObjectFormDataEnvelope>();
  const managedObjectDataTableRef = React.useRef<any>(null);
  const managedObjectUseForm = useForm<TManagedObjectFormDataEnvelope>();

  const doSetApMemberOfBusinessGroupTreeTableNodeList = (apExcludeBusinessGroupIdList: Array<string>) => {
    setApMemberOfBusinessGroupTreeTableNodeList(APMemberOfService.create_ApMemberOfBusinessGroupTreeTableNodeList_From_ApMemberOfBusinessGroupDisplayTreeNodeList({
      apMemberOfBusinessGroupDisplayTreeNodeList: props.apMemberOfBusinessGroupDisplayTreeNodeList,
      includeBusinessGroupIsSelectable: true,
      accessOnly_To_BusinessGroupManageAssets: true,
      excludeAccess_To_BusinessGroupIdList: props.apExcludeBusinessGroupIdList
    }));
    apExcludeBusinessGroupIdList.forEach( (x) => {
      doRemoveManagedObjectId_From_ManagedObjectList(x);
    });
  }

  React.useEffect(() => {
    setManagedObject(EmptyManagedObject);
    doSetApMemberOfBusinessGroupTreeTableNodeList(props.apExcludeBusinessGroupIdList);
    managedObjectUseForm.clearErrors();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    doSetApMemberOfBusinessGroupTreeTableNodeList(props.apExcludeBusinessGroupIdList);
  }, [props.apExcludeBusinessGroupIdList]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(managedObject === undefined) return;
    setManagedObjectFormDataEnvelope(transform_ManagedObject_To_FormDataEnvelope(managedObject));
    managedObjectUseForm.clearErrors();

    const businessGroupId: string | undefined = managedObjectUseForm.getValues('formData.businessGroupId');
    if(businessGroupId !== undefined && businessGroupId !== '') managedObjectUseForm.trigger();
  }, [managedObject]) /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(isManagedObjectListChanged) {
      props.onChange(managedObjectList);
      setIsManagedObjectListChanged(false);
      setManagedObject(EmptyManagedObject);
    }
  }, [managedObjectList, isManagedObjectListChanged]) /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(managedObjectFormDataEnvelope === undefined) return;
    managedObjectUseForm.setValue('formData', managedObjectFormDataEnvelope.formData);
  }, [managedObjectFormDataEnvelope]) /* eslint-disable-line react-hooks/exhaustive-deps */

  const doAddManagedObject = (mo: TManagedObject) => {
    const funcName = 'doAddManagedObject';
    const logName = `${ComponentName}.${funcName}()`;

    setManagedObject(EmptyManagedObject);

    const apSharingMemberOfBusinessGroupDisplay: TAPMemberOfBusinessGroupDisplay | undefined = APMemberOfService.find_ApMemberOfBusinessGroupDisplay_From_ApMemberOfBusinessGroupDisplayTreeNodeList({
      apMemberOfBusinessGroupDisplayTreeNodeList: props.apMemberOfBusinessGroupDisplayTreeNodeList,
      businessGroupId: mo.apEntityId.id
    });
    if(apSharingMemberOfBusinessGroupDisplay === undefined) throw new Error(`${logName}: apSharingMemberOfBusinessGroupDisplay === undefined`);
    mo.apEntityId = apSharingMemberOfBusinessGroupDisplay.apBusinessGroupDisplay.apEntityId;
    mo.apExternalReference = apSharingMemberOfBusinessGroupDisplay.apBusinessGroupDisplay.apExternalReference;

    const _newMoList: TManagedObjectList = JSON.parse(JSON.stringify(managedObjectList));
    _newMoList.push(mo);
    setManagedObjectList(APEntityIdsService.sort_ApDisplayObjectList_By_DisplayName(_newMoList));
    setIsManagedObjectListChanged(true);
  }

  const doRemoveManagedObjectId_From_ManagedObjectList = (id: string) => {
    if(managedObjectList === undefined || managedObjectList.length === 0) return;
    const _newMoList: TManagedObjectList = JSON.parse(JSON.stringify(managedObjectList));
    const idx = _newMoList.findIndex( (x) => {
      return x.apEntityId.id === id;
    });
    if(idx > -1) {
      _newMoList.splice(idx, 1);
      setManagedObjectList(_newMoList);
      setIsManagedObjectListChanged(true);
    }
  }
  const doRemoveManagedObject = (mo: TManagedObject) => {
    doRemoveManagedObjectId_From_ManagedObjectList(mo.apEntityId.id);
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
            key={UniqueKeyPrefix+'_remove_'+mo.apEntityId.id} 
            type='button'
            icon="pi pi-times" 
            className="p-button-rounded p-button-outlined p-button-secondary p-mr-2" 
            onClick={() => doRemoveManagedObject(mo)} 
          />
        </React.Fragment>
      );
    }
    const dataKey = APAdminPortalApiProductsDisplayService.nameOf_BusinessGroupSharing_ApEntityId('id');
    const sortField = APAdminPortalApiProductsDisplayService.nameOf_BusinessGroupSharing_ApEntityId('displayName');
    const businessGroupNameField = APAdminPortalApiProductsDisplayService.nameOf_BusinessGroupSharing_ApEntityId('displayName');
    const accessTypeField = APAdminPortalApiProductsDisplayService.nameOf_BusinessGroupSharing('apSharingAccessType');
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
          <Column header="Business Group" headerStyle={{ width: "20em"}} field={businessGroupNameField} sortable />
          <Column header="Access Type" field={accessTypeField} sortable />
          <Column body={actionBodyTemplate} bodyStyle={{ width: '3em', textAlign: 'end' }} />
        </DataTable>
      </React.Fragment>        
    );
  }

  const validateBusinessGroupId = (businessGroupId: string): string | boolean => {
    // check that id is unique
    if(managedObjectList.find((x) => {
      return x.apEntityId.id === businessGroupId;
    })) {
      return 'Business Group already exists. Delete it first.';
    }
    return true;
  }

  const renderComponent = () => {
    const funcName = 'renderComponent';
    const logName = `${ComponentName}.${funcName}()`;

    if(apMemberOfBusinessGroupTreeTableNodeList === undefined) throw new Error(`${logName}: apMemberOfBusinessGroupTreeTableNodeList === undefined`);

    return (
      <div className="card">
        <div className="p-fluid">
          <form id={FormId} onSubmit={managedObjectUseForm.handleSubmit(onSubmitManagedObjectForm, onInvalidSubmitManagedObjectForm)} className="p-fluid">           
            <div className="p-formgroup-inline">
              {/* Business Group */}
              <div className="p-field" style={{ width: '55%' }} >
                <span className="p-float-label">
                  <Controller
                    control={managedObjectUseForm.control}
                    name="formData.businessGroupId"
                    rules={{
                      required: 'Select a business group.',
                      validate: validateBusinessGroupId,
                    }}
                    render={( { field, fieldState }) => {
                      return(
                        <TreeSelect
                          id={field.name}
                          {...field}
                          options={apMemberOfBusinessGroupTreeTableNodeList}
                          onChange={(e) => field.onChange(e.value)}
                          filter={true}
                          selectionMode="single"
                          className={classNames({ 'p-invalid': fieldState.invalid })}                       
                        />
                    )}}
                  />
                <label className={classNames({ 'p-error': managedObjectUseForm.formState.errors.formData?.businessGroupId })}>Business Group*</label>
                </span>
                {APDisplayUtils.displayFormFieldErrorMessage(managedObjectUseForm.formState.errors.formData?.businessGroupId)}
              </div>
              {/* access type */}
              <div className="p-field" style={{ width: '40%' }} >
                <span className="p-float-label">
                  <Controller
                    control={managedObjectUseForm.control}
                    name="formData.accessType"
                    // rules={APConnectorFormValidationRules.AttributeValue()}
                    render={( { field, fieldState }) => {
                      return(
                        <Dropdown
                          id={field.name}
                          {...field}
                          options={APAdminPortalApiProductsDisplayService.get_ApManagedAssetDisplay_BusinessGroupSharing_AccessType_SelectList()} 
                          onChange={(e) => field.onChange(e.value)}
                          className={classNames({ 'p-invalid': fieldState.invalid })}                       
                        />                        
                    )}}
                  />
                  <label className={classNames({ 'p-error': managedObjectUseForm.formState.errors.formData?.accessType })}>Access Type*</label>
                </span>
                {APDisplayUtils.displayFormFieldErrorMessage(managedObjectUseForm.formState.errors.formData?.accessType)}
              </div>
              <div>          
                <Button key={UniqueKeyPrefix+'submit'} form={FormId} type="submit" icon="pi pi-plus" className="p-button-text p-button-plain p-button-outlined" />
              </div>  
            </div>
            {renderTable()}
            {/* DEBUG */}
            {/* <p>managedAttributeList:</p>
            <pre style={ { fontSize: '10px' }} >
              {JSON.stringify(managedAttributeList, null, 2)}
            </pre> */}
          </form>  
        </div>
      </div>
    );
  }

  return(
    <React.Fragment>
      { managedObjectFormDataEnvelope && renderComponent() }
    </React.Fragment>
  );
}
