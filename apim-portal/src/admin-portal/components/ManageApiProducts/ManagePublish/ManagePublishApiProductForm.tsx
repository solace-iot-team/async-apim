
import React from "react";
import { useForm, Controller } from 'react-hook-form';

import { classNames } from 'primereact/utils';
import { MultiSelect } from "primereact/multiselect";

import APDisplayUtils from "../../../../displayServices/APDisplayUtils";
import { TAPApiProductDisplay_PublishDestinationInfo } from "../../../../displayServices/APApiProductsDisplayService";
import APEntityIdsService, { TAPEntityIdList } from "../../../../utils/APEntityIdsService";

import '../../../../components/APComponents.css';
import "../ManageApiProducts.css";

export interface IManagePublishApiProductFormProps {
  formId: string;
  apApiProductDisplay_PublishDestinationInfo: TAPApiProductDisplay_PublishDestinationInfo;
  apAvailablePublishDestinationExternalSystemEntityIdList: TAPEntityIdList;
  onSubmit: (apApiProductDisplay_PublishDestinationInfo: TAPApiProductDisplay_PublishDestinationInfo) => void;
}

export const ManagePublishApiProductForm: React.FC<IManagePublishApiProductFormProps> = (props: IManagePublishApiProductFormProps) => {
  const ComponentName = 'ManagePublishApiProductForm';

  type TManagedObject = TAPApiProductDisplay_PublishDestinationInfo;
  type TManagedObjectFormData = {
    publishDestinationIdList: Array<string>;
  };
  type TManagedObjectFormDataEnvelope = {
    formData: TManagedObjectFormData;
  }
  
  const transform_ManagedObject_To_FormDataEnvelope = (mo: TManagedObject): TManagedObjectFormDataEnvelope => {
    const fd: TManagedObjectFormData = {
      publishDestinationIdList: APEntityIdsService.create_IdList(mo.apPublishDestinationInfo.apExternalSystemEntityIdList),
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

    const mo: TManagedObject = props.apApiProductDisplay_PublishDestinationInfo;
    const fd: TManagedObjectFormData = formDataEnvelope.formData;

    mo.apPublishDestinationInfo.apExternalSystemEntityIdList = [];
    fd.publishDestinationIdList.forEach( (selectedId: string) => {
      const foundExternalSystemEntityId = props.apAvailablePublishDestinationExternalSystemEntityIdList.find( (x) => {
        return x.id === selectedId;
      });
      if(foundExternalSystemEntityId === undefined) throw new Error(`${logName}: foundExternalSystemEntityId === undefined`);
      mo.apPublishDestinationInfo.apExternalSystemEntityIdList.push(foundExternalSystemEntityId);
    });
    return mo;
  }
  
  const [managedObject] = React.useState<TManagedObject>(props.apApiProductDisplay_PublishDestinationInfo);
  const [managedObjectFormDataEnvelope, setManagedObjectFormDataEnvelope] = React.useState<TManagedObjectFormDataEnvelope>();
  const managedObjectUseForm = useForm<TManagedObjectFormDataEnvelope>();

  const doInitialize = async () => {
    setManagedObjectFormDataEnvelope(transform_ManagedObject_To_FormDataEnvelope(managedObject));
  }

  // * useEffect Hooks *

  React.useEffect(() => {
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(managedObjectFormDataEnvelope === undefined) return;
    managedObjectUseForm.setValue('formData', managedObjectFormDataEnvelope.formData);
    // set arrays explicitely
    managedObjectUseForm.setValue('formData.publishDestinationIdList', managedObjectFormDataEnvelope.formData.publishDestinationIdList);
  }, [managedObjectFormDataEnvelope]) /* eslint-disable-line react-hooks/exhaustive-deps */

  const onSubmitManagedObjectForm = (newMofde: TManagedObjectFormDataEnvelope) => {
    props.onSubmit(create_ManagedObject_From_FormEntities({
      formDataEnvelope: newMofde,
    }));
  }

  const onInvalidSubmitManagedObjectForm = () => {
    // placeholder
  }

  const renderManagedObjectForm = () => {
    const funcName = 'renderManagedObjectForm';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObjectFormDataEnvelope === undefined) throw new Error(`${logName}: managedObjectFormDataEnvelope === undefined`);
  
    return (
      <div className="card p-mt-4">
        <div className="p-fluid">
          <form id={props.formId} onSubmit={managedObjectUseForm.handleSubmit(onSubmitManagedObjectForm, onInvalidSubmitManagedObjectForm)} className="p-fluid">      
            {/* Publish Destinations */}
            <div className="p-field">
              <span className="p-float-label">
                <Controller
                  control={managedObjectUseForm.control}
                  name="formData.publishDestinationIdList"
                  render={( { field, fieldState }) => {
                    return(
                      <MultiSelect
                        display="chip"
                        value={field.value ? [...field.value] : []} 
                        options={props.apAvailablePublishDestinationExternalSystemEntityIdList} 
                        onChange={(e) => field.onChange(e.value)}
                        optionLabel={APEntityIdsService.nameOf('displayName')}
                        optionValue={APEntityIdsService.nameOf('id')}
                        // style={{width: '500px'}} 
                        className={classNames({ 'p-invalid': fieldState.invalid })}                       
                      />
                  )}}
                />
                <label className={classNames({ 'p-error': managedObjectUseForm.formState.errors.formData?.publishDestinationIdList })}>Publish Destination(s)</label>
              </span>
              {APDisplayUtils.displayFormFieldErrorMessage4Array(managedObjectUseForm.formState.errors.formData?.publishDestinationIdList)}
            </div>
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
