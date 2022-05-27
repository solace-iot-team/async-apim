
import React from "react";

import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';

import { TApiCallState } from "../../../../utils/ApiCallState";
import { ButtonLabel_Cancel, ButtonLabel_Next, EAction } from "../ManageApisCommon";
import APApisDisplayService, { IAPApiDisplay, TAPApiDisplay_AsyncApiSpec } from "../../../../displayServices/APApisDisplayService";
import { EditNewAsyncApiSpecForm } from "./EditNewAsyncApiForm";

import '../../../../components/APComponents.css';
import "../ManageApis.css";

export interface INewAsyncApiSpecProps {
  organizationId: string;
  apApiDisplay: IAPApiDisplay;
  onSaveChanges: (apApiDisplay_AsyncApiSpec: TAPApiDisplay_AsyncApiSpec) => void;
  onBack: () => void;
  onCancel: () => void;
  onError: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const NewAsyncApiSpec: React.FC<INewAsyncApiSpecProps> = (props: INewAsyncApiSpecProps) => {
  const ComponentName = 'NewAsyncApiSpec';

  type TManagedObject = TAPApiDisplay_AsyncApiSpec;
  
  const [managedObject, setManagedObject] = React.useState<TManagedObject>();
  const formId = `ManageApis_EditNewApi_${ComponentName}`;

  const doInitialize = async () => {
    setManagedObject(APApisDisplayService.get_ApApiDisplay_AsyncApiSpec({
      apApiDisplay: props.apApiDisplay
    }));
  }

  // * useEffect Hooks *

  React.useEffect(() => {
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  const doSubmitManagedObject = async (mo: TManagedObject) => {
    props.onSaveChanges(mo);
  }

  const onSubmit = (mo: TManagedObject) => {
    doSubmitManagedObject(mo);
  }

  const renderManagedObjectFormFooter = (): JSX.Element => {
    const managedObjectFormFooterLeftToolbarTemplate = () => {
      return (
        <React.Fragment>
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
    )
  }

  const renderManagedObjectForm = (mo: TManagedObject) => {
    return (
      <div className="card p-mt-4">
        <div className="p-fluid">
          <EditNewAsyncApiSpecForm
            formId={formId}
            organizationId={props.organizationId}
            action={EAction.NEW}
            apApiDisplay_AsyncApiSpec={mo}
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
    <div className="manage-apis">

      { managedObject && renderManagedObjectForm(managedObject) }

    </div>
  );
}
