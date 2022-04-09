

import React from "react";

import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';

import { TApiCallState } from "../../../../utils/ApiCallState";
import APAdminPortalApiProductsDisplayService, { 
  TAPAdminPortalApiProductDisplay 
} from "../../../displayServices/APAdminPortalApiProductsDisplayService";
import { TAPApiProductDisplay_Environments } from "../../../../displayServices/APApiProductsDisplayService";
import { EditNewEnvironmentsForm } from "./EditNewEnvironmentsForm";
import { ButtonLabel_Back, ButtonLabel_Cancel, ButtonLabel_Next, EAction } from "../ManageApiProductsCommon";

import '../../../../components/APComponents.css';
import "../ManageApiProducts.css";

export interface IEditNewEnvironmentsProps {
  action: EAction;
  organizationId: string;
  apAdminPortalApiProductDisplay: TAPAdminPortalApiProductDisplay;
  onSaveChanges: (apApiProductDisplay_Environments: TAPApiProductDisplay_Environments) => void;
  onBack?: () => void;
  onCancel: () => void;
  onError: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const EditNewEnvironments: React.FC<IEditNewEnvironmentsProps> = (props: IEditNewEnvironmentsProps) => {
  const ComponentName = 'EditNewEnvironments';

  type TManagedObject = TAPApiProductDisplay_Environments;
  
  const [managedObject, setManagedObject] = React.useState<TManagedObject>();
  const formId = `ManageApiProducts_EditNewApiProduct_${ComponentName}`;

  const doInitialize = async () => {
    setManagedObject(APAdminPortalApiProductsDisplayService.get_ApApiProductDisplay_Environments({
      apApiProductDisplay: props.apAdminPortalApiProductDisplay
    }));
  }

  const validateProps = () => {
    const funcName = 'validateProps';
    const logName = `${ComponentName}.${funcName}()`;
    if(props.action === EAction.NEW) {
      if(props.onBack === undefined) throw new Error(`${logName}: props.onBack === undefined`);
    }
  }

  // * useEffect Hooks *

  React.useEffect(() => {
    validateProps();
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  const doSubmitManagedObject = async (mo: TManagedObject) => {
    props.onSaveChanges(mo);
  }

  const onSubmit = (apApiProductDisplay_Environments: TAPApiProductDisplay_Environments) => {
    doSubmitManagedObject(apApiProductDisplay_Environments);
  }

  const renderManagedObjectFormFooter = (): JSX.Element => {
    const managedObjectFormFooterLeftToolbarTemplate = () => {
      return (
        <React.Fragment>
          <Button key={ComponentName+ButtonLabel_Back} label={ButtonLabel_Back} icon="pi pi-arrow-left" className="p-button-text p-button-plain p-button-outlined" onClick={props.onBack}/>
          <Button key={ComponentName+ButtonLabel_Cancel} type="button" label={ButtonLabel_Cancel} className="p-button-text p-button-plain" onClick={props.onCancel} />
        </React.Fragment>
      );
    }
    const managedObjectFormFooterRightToolbarTemplate = () => {
      return (
        <React.Fragment>
          <Button key={ComponentName+ButtonLabel_Next} form={formId} type="submit" label={ButtonLabel_Next} icon="pi pi-arrow-right" className="p-button-text p-button-plain p-button-outlined" />
        </React.Fragment>
      );
    }  
    return (
      <Toolbar className="p-mb-4" left={managedObjectFormFooterLeftToolbarTemplate} right={managedObjectFormFooterRightToolbarTemplate} />
    );
  }

  const renderManagedObjectForm = (mo: TManagedObject) => {
    return (
      <div className="card p-mt-4">
        <div className="p-fluid">
          <EditNewEnvironmentsForm
            formId={formId}
            action={props.action}
            organizationId={props.organizationId}
            apApiProductDisplay_Environments={mo}
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
