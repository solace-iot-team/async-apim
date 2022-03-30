

import React from "react";
// import { useForm, Controller } from 'react-hook-form';

import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';

import { ApiCallState, TApiCallState } from "../../../../utils/ApiCallState";
import { APSClientOpenApi } from "../../../../utils/APSClientOpenApi";
import APAdminPortalApiProductsDisplayService, { 
  TAPAdminPortalApiProductDisplay 
} from "../../../displayServices/APAdminPortalApiProductsDisplayService";
import { TAPApiProductDisplay_Apis, TAPApiProductDisplay_Policies } from "../../../../displayServices/APApiProductsDisplayService";

import '../../../../components/APComponents.css';
import "../ManageApiProducts.css";
import { EditNewPoliciesForm } from "./EditNewPoliciesForm";
import { EAction } from "../ManageApiProductsCommon";

export interface INewPoliciesProps {
  organizationId: string;
  apAdminPortalApiProductDisplay: TAPAdminPortalApiProductDisplay;
  onNext: (apApiProductDisplay_Policies: TAPApiProductDisplay_Policies) => void;
  onBack: () => void;
  onCancel: () => void;
  onError: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const NewPolicies: React.FC<INewPoliciesProps> = (props: INewPoliciesProps) => {
  const ComponentName = 'NewPolicies';

  type TManagedObject = TAPApiProductDisplay_Policies;
  
  const [managedObject, setManagedObject] = React.useState<TManagedObject>();
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const formId = `ManageApiProducts_EditNewApiProduct_${ComponentName}`;


  const doInitialize = async () => {
    setManagedObject(APAdminPortalApiProductsDisplayService.get_ApApiProductDisplay_Policies({
      apApiProductDisplay: props.apAdminPortalApiProductDisplay
    }));
  }

  // * useEffect Hooks *

  React.useEffect(() => {
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

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

  const onSubmit = (apApiProductDisplay_Policies: TAPApiProductDisplay_Policies) => {
    doSubmitManagedObject(apApiProductDisplay_Policies);
  }

  const renderManagedObjectFormFooter = (): JSX.Element => {
    const managedObjectFormFooterLeftToolbarTemplate = () => {
      return (
        <React.Fragment>
          <Button key={ComponentName+'Back'} label="Back" icon="pi pi-arrow-left" className="p-button-text p-button-plain p-button-outlined" onClick={props.onBack}/>
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

  const renderManagedObjectForm = (mo: TManagedObject) => {
    return (
      <div className="card p-mt-4">
        <div className="p-fluid">
          <EditNewPoliciesForm
            formId={formId}
            action={EAction.NEW}
            apApiProductDisplay_Policies={mo}
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
