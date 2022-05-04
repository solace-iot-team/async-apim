
import React from "react";

import { Button } from 'primereact/button'; 
import { Toolbar } from 'primereact/toolbar';

import { TApiCallState } from "../../../../utils/ApiCallState";
import APSystemOrganizationsDisplayService, { 
  IAPSystemOrganizationDisplay, 
  IAPSystemOrganizationDisplay_General 
} from "../../../../displayServices/APOrganizationsDisplayService/APSystemOrganizationsDisplayService";
import { 
  EAction,
} from "../ManageOrganizationsCommon";
import { EditNewGeneralForm } from "./EditNewGeneralForm";

import '../../../../components/APComponents.css';
import "../ManageOrganizations.css";

export interface INewGeneralProps {
  apSystemOrganizationDisplay: IAPSystemOrganizationDisplay;
  onNext: (apSystemOrganizationDisplay_General: IAPSystemOrganizationDisplay_General) => void;
  onBack: () => void;
  onCancel: () => void;
  onError: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const NewGeneral: React.FC<INewGeneralProps> = (props: INewGeneralProps) => {
  const ComponentName = 'NewGeneral';

  type TManagedObject = IAPSystemOrganizationDisplay_General;

  const FormId = `ManageOrganizations_EditNewOrganization_${ComponentName}`;

  const [managedObject, setManagedObject] = React.useState<TManagedObject>();

  const doInitialize = async () => {
    setManagedObject(APSystemOrganizationsDisplayService.get_ApOrganizationDisplay_General({
      apOrganizationDisplay: props.apSystemOrganizationDisplay
    }));
  }

  // * useEffect Hooks *

  React.useEffect(() => {
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  const doSubmitManagedObject = async (mo: TManagedObject) => {
    props.onNext(mo);
  }

  const onSubmit = (mo: TManagedObject) => {
    doSubmitManagedObject(mo);
  }

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
          <Button key={ComponentName+'Next'} form={FormId} type="submit" label="Next" icon="pi pi-arrow-right" className="p-button-text p-button-plain p-button-outlined" />
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
          <EditNewGeneralForm
            formId={FormId}
            action={EAction.NEW}
            apOrganizationDisplay_General={mo}
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
    <div className="manage-organizations">

      { managedObject && renderManagedObjectForm(managedObject) }

    </div>
  );
}
