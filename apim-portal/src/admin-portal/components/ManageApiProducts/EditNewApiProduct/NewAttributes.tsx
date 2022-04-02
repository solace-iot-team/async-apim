

import React from "react";

import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';

import { TApiCallState } from "../../../../utils/ApiCallState";
import APAdminPortalApiProductsDisplayService, { 
  TAPAdminPortalApiProductDisplay 
} from "../../../displayServices/APAdminPortalApiProductsDisplayService";
import { TAPManagedAssetDisplay_Attributes } from "../../../../displayServices/APManagedAssetDisplayService";
import { EditNewAttributesForm } from "./EditNewAttributesForm";
import { EAction } from "../ManageApiProductsCommon";

import '../../../../components/APComponents.css';
import "../ManageApiProducts.css";

export interface INewAttributesProps {
  organizationId: string;
  apAdminPortalApiProductDisplay: TAPAdminPortalApiProductDisplay;
  onNext: (apManagedAssetDisplay_Attributes: TAPManagedAssetDisplay_Attributes) => void;
  onBack: () => void;
  onCancel: () => void;
  onError: (apiCallState: TApiCallState) => void;
  // onLoadingChange: (isLoading: boolean) => void;
}

export const NewAttributes: React.FC<INewAttributesProps> = (props: INewAttributesProps) => {
  const ComponentName = 'NewAttributes';

  type TManagedObject = TAPManagedAssetDisplay_Attributes;
  
  const [managedObject, setManagedObject] = React.useState<TManagedObject>();
  // const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const formId = `ManageApiProducts_EditNewApiProduct_${ComponentName}`;

  const doInitialize = async () => {
    setManagedObject(APAdminPortalApiProductsDisplayService.get_ApManagedAssetDisplay_Attributes({
      apManagedAssetDisplay: props.apAdminPortalApiProductDisplay
    }));
  }

  // * useEffect Hooks *

  React.useEffect(() => {
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  // React.useEffect(() => {
  //   const funcName = 'useEffect[apiCallStatus';
  //   const logName = `${ComponentName}.${funcName}()`;

  //   if (apiCallStatus !== null) {
  //     if(!apiCallStatus.success) props.onError(apiCallStatus);
  //   }
  // }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const doSubmitManagedObject = async (mo: TManagedObject) => {
    props.onNext(mo);
  }

  const onSubmit = (apManagedAssetDisplay_Attributes: TAPManagedAssetDisplay_Attributes) => {
    doSubmitManagedObject(apManagedAssetDisplay_Attributes);
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
          <EditNewAttributesForm
            formId={formId}
            action={EAction.NEW}
            apManagedAssetDisplay_Attributes={mo}
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
