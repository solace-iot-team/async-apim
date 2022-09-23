
import React from "react";
import { useForm } from 'react-hook-form';

import { EAction} from "../ManageApiProductsCommon";
import { TAPManagedAssetDisplay_Attributes } from "../../../../displayServices/APManagedAssetDisplayService";
import { TAPAttributeDisplayList } from "../../../../displayServices/APAttributesDisplayService/APAttributesDisplayService";
import { EditNewApAttributeListForm } from "../../../../components/APManageAttributes/EditNewApAttributeListForm";

import '../../../../components/APComponents.css';
import "../ManageApiProducts.css";

export interface IEditNewMetaAttributesFormProps {
  action: EAction;
  formId: string;
  apManagedAssetDisplay_Attributes: TAPManagedAssetDisplay_Attributes;
  onSubmit: (apManagedAssetDisplay_Attributes: TAPManagedAssetDisplay_Attributes) => void;
}

export const EditNewMetaAttributesForm: React.FC<IEditNewMetaAttributesFormProps> = (props: IEditNewMetaAttributesFormProps) => {
  const ComponentName = 'EditNewMetaAttributesForm';

  type TManagedObject = TAPManagedAssetDisplay_Attributes;
  type TManagedObjectFormData = {
    meta_attribute_list: TAPAttributeDisplayList;
  };
  type TManagedObjectFormDataEnvelope = {
    formData: TManagedObjectFormData;
  }
  
  const transform_ManagedObject_To_FormDataEnvelope = (mo: TManagedObject): TManagedObjectFormDataEnvelope => {
    const fd: TManagedObjectFormData = {
      meta_attribute_list: mo.apMeta_ApAttributeDisplayList,
    };
    return {
      formData: fd
    };
  }

  const create_ManagedObject_From_FormEntities = ({formDataEnvelope}: {
    formDataEnvelope: TManagedObjectFormDataEnvelope;
  }): TManagedObject => {
    const mo: TManagedObject = props.apManagedAssetDisplay_Attributes;
    const fd: TManagedObjectFormData = formDataEnvelope.formData;
    mo.apMeta_ApAttributeDisplayList = fd.meta_attribute_list;
    return mo;
  }
  
  const [managedObject] = React.useState<TManagedObject>(props.apManagedAssetDisplay_Attributes);
  const [managedObjectFormDataEnvelope, setManagedObjectFormDataEnvelope] = React.useState<TManagedObjectFormDataEnvelope>();
  // const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const managedObjectUseForm = useForm<TManagedObjectFormDataEnvelope>();

  const doInitialize = async () => {
    setManagedObjectFormDataEnvelope(transform_ManagedObject_To_FormDataEnvelope(managedObject));
  }

  // * useEffect Hooks *

  React.useEffect(() => {
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(managedObjectFormDataEnvelope) managedObjectUseForm.setValue('formData', managedObjectFormDataEnvelope.formData);
  }, [managedObjectFormDataEnvelope]) /* eslint-disable-line react-hooks/exhaustive-deps */

  const onSubmitManagedObjectForm = (newMofde: TManagedObjectFormDataEnvelope) => {
    // const funcName = 'onSubmitManagedObjectForm'; 
    // const logName = `${ComponentName}.${funcName}()`;
    // alert(`${logName}: newMofde = ${JSON.stringify(newMofde, null, 2)}`);
    props.onSubmit(create_ManagedObject_From_FormEntities({
      formDataEnvelope: newMofde,
    }));
  }

  const onInvalidSubmitManagedObjectForm = () => {
    // placeholder
  }

  const onChange_MetaAttributes = (apAttributeDisplayList: TAPAttributeDisplayList) => {
    const funcName = 'onChange_MetaAttributes';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObjectFormDataEnvelope === undefined) throw new Error(`${logName}: managedObjectFormDataEnvelope === undefined`);
    const newMofde: TManagedObjectFormDataEnvelope = {
      formData: {
        ...managedObjectFormDataEnvelope.formData,
        meta_attribute_list: apAttributeDisplayList  
      }
    };
    setManagedObjectFormDataEnvelope(newMofde);
  }

  const renderManagedObjectForm = () => {
    const funcName = 'renderManagedObjectForm';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObjectFormDataEnvelope === undefined) throw new Error(`${logName}: managedObjectFormDataEnvelope === undefined`);
    const uniqueKey_MetaAttributes = ComponentName+'_EditNewApAttributeListForm_mo.apMeta_ApAttributeDisplayList';
    return (
      <div className="card p-mt-4">
        <div className="p-fluid">
          <form id={props.formId} onSubmit={managedObjectUseForm.handleSubmit(onSubmitManagedObjectForm, onInvalidSubmitManagedObjectForm)} className="p-fluid">      
          {/* empty form, required for submit button */}
          </form>  
          
          <div className="p-field">
            {/* version attributes */}
            <div className="p-text-bold p-mb-3">General Attributes:</div>
            <EditNewApAttributeListForm
              key={uniqueKey_MetaAttributes}
              uniqueKeyPrefix={uniqueKey_MetaAttributes}
              apAttributeDisplayList={managedObjectFormDataEnvelope.formData.meta_attribute_list}
              attributeName_Name="Attribute Name"
              attributeValue_Name="Value"
              onChange={onChange_MetaAttributes}
            />
          </div>
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
