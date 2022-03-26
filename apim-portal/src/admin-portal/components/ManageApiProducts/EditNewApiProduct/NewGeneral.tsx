
import React from "react";
// import { useForm, Controller } from 'react-hook-form';

import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';

import { ApiCallState, TApiCallState } from "../../../../utils/ApiCallState";
import { APSClientOpenApi } from "../../../../utils/APSClientOpenApi";
import APAdminPortalApiProductsDisplayService, { TAPAdminPortalApiProductDisplay, TAPAdminPortalApiProductDisplay_General } from "../../../displayServices/APAdminPortalApiProductsDisplayService";
import { EAction, E_CALL_STATE_ACTIONS } from "../ManageApiProductsCommon";
import { EditNewGeneralForm } from "./EditNewGeneralForm";

import '../../../../components/APComponents.css';
import "../ManageApiProducts.css";

export interface INewGeneralProps {
  organizationId: string;
  apAdminPortalApiProductDisplay: TAPAdminPortalApiProductDisplay;
  onNext: (apAdminPortalApiProductDisplay_General: TAPAdminPortalApiProductDisplay_General) => void;
  onBack: () => void;
  onCancel: () => void;
  onError: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const NewGeneral: React.FC<INewGeneralProps> = (props: INewGeneralProps) => {
  const ComponentName = 'NewGeneral';

  type TManagedObject = TAPAdminPortalApiProductDisplay_General;
  
  const [managedObject, setManagedObject] = React.useState<TManagedObject>();
  const [updatedManagedObject, setUpdatedManagedObject] = React.useState<TManagedObject>();
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const formId = `ManageApiProducts_EditNewApiProduct_${ComponentName}`;


  // * Api Calls *

  // const apiUpdateManagedObject = async(mo: TManagedObject): Promise<TApiCallState> => {
  //   const funcName = 'apiUpdateManagedObject';
  //   const logName = `${ComponentName}.${funcName}()`;
  //   let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_UPDATE_API_PRODUCT, `update api product: ${mo.apEntityId.displayName}`);
  //   try {
  //     await APAdminPortalApiProductsDisplayService.apiUpdate_ApAdminPortalApiProductDisplay_General({
  //       organizationId: props.organizationId,
  //       apAdminPortalApiProductDisplay_General: mo,
  //     });
  //     setUpdatedManagedObject(mo);
  //   } catch(e: any) {
  //     APSClientOpenApi.logError(logName, e);
  //     callState = ApiCallState.addErrorToApiCallState(e, callState);
  //   }
  //   setApiCallStatus(callState);
  //   return callState;
  // }

  const doInitialize = async () => {
    setManagedObject(APAdminPortalApiProductsDisplayService.get_ApAdminPortalApiProductDisplay_General({
      apAdminPortalApiProductDisplay: props.apAdminPortalApiProductDisplay
    }));
  }

  // * useEffect Hooks *

  React.useEffect(() => {
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  // React.useEffect(() => {
  //   if(managedObject) {
  //     setManagedObjectFormDataEnvelope(transform_ManagedObject_To_FormDataEnvelope(managedObject));
  //   }
  // }, [managedObject]) /* eslint-disable-line react-hooks/exhaustive-deps */

  // React.useEffect(() => {
  //   if(managedObjectFormDataEnvelope) managedObjectUseForm.setValue('formData', managedObjectFormDataEnvelope.formData);
  // }, [managedObjectFormDataEnvelope]) /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    const funcName = 'useEffect[apiCallStatus';
    const logName = `${ComponentName}.${funcName}()`;

    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const doSubmitManagedObject = async (mo: TManagedObject) => {
    props.onNext(mo);
  }

  const onSubmit = (apAdminPortalApiProductDisplay_General: TAPAdminPortalApiProductDisplay_General) => {
    doSubmitManagedObject(apAdminPortalApiProductDisplay_General);
  }

  // const onCancelManagedObjectForm = () => {
  //   props.onCancel();
  // }

  const renderManagedObjectFormFooter = (): JSX.Element => {
    const managedObjectFormFooterLeftToolbarTemplate = () => {
      return (
        <React.Fragment>
          <Button type="button" label="Cancel" className="p-button-text p-button-plain" onClick={props.onCancel} />
        </React.Fragment>
      );
    }
    const managedObjectFormFooterRightToolbarTemplate = () => {
      return (
        <React.Fragment>
          <Button key={ComponentName+'Next'} form={formId} type="submit" label="Next" icon="pi pi-arrow-right" className="p-button-text p-button-plain p-button-outlined" />
        </React.Fragment>
      );
    }  
    return (
      <Toolbar className="p-mb-4" left={managedObjectFormFooterLeftToolbarTemplate} right={managedObjectFormFooterRightToolbarTemplate} />
    )
  }

  // const managedObjectFormFooterRightToolbarTemplate = () => {
  //   return (
  //     <React.Fragment>
  //       <Button type="button" label="Cancel" className="p-button-text p-button-plain" onClick={onCancelManagedObjectForm} />
  //       <Button key={ComponentName+'Save'} form={formId} type="submit" label="Save" icon="pi pi-save" className="p-button-text p-button-plain p-button-outlined" />
  //     </React.Fragment>
  //   );
  // }

  // const renderManagedObjectFormFooter = (): JSX.Element => {
  //   return (
  //     <Toolbar className="p-mb-4" right={managedObjectFormFooterRightToolbarTemplate} />
  //   )
  // }

  const renderManagedObjectForm = (mo: TManagedObject) => {
    return (
      <div className="card p-mt-4">
        <div className="p-fluid">
          <EditNewGeneralForm
            action={EAction.NEW}
            apAdminPortalApiProductDisplay_General={mo}
            formId={formId}
            onError={props.onError}
            onLoadingChange={props.onLoadingChange}
            onSubmit={onSubmit}
          />
          {/* footer */}
          { renderManagedObjectFormFooter() }
        </div>
      </div>
    );
  }

  
  return (
    <div className="manage-api-products">

      {managedObject && 
        renderManagedObjectForm(managedObject)
      }
    </div>
  );
}
