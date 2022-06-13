

import React from "react";

import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';

import { TApiCallState } from "../../../../utils/ApiCallState";
import { ButtonLabel_Back, ButtonLabel_Cancel, ButtonLabel_Next, EAction } from "../ManageApisCommon";
import APApisDisplayService, { IAPApiDisplay, TAPApiDisplay_Access } from "../../../../displayServices/APApisDisplayService";
import { EditNewAccessForm } from "./EditNewAccessForm";

import '../../../../components/APComponents.css';
import "../ManageApis.css";

export interface INewAccessProps {
  organizationId: string;
  apApiDisplay: IAPApiDisplay;
  onSaveChanges: (apApiDisplay_Access: TAPApiDisplay_Access) => void;
  onBack: () => void;
  onCancel: () => void;
  onError: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const NewAccess: React.FC<INewAccessProps> = (props: INewAccessProps) => {
  const ComponentName = 'NewAccess';

  type TManagedObject = TAPApiDisplay_Access;
  
  const [managedObject, setManagedObject] = React.useState<TManagedObject>();

  const FormId = `ManageApis_EditNewApi_${ComponentName}`;

  // * Api Calls * 

  const doInitialize = async () => {
    setManagedObject(APApisDisplayService.get_ApApiDisplay_Access({
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

  const onSubmit = (apApiDisplay_Access: TAPApiDisplay_Access) => {
    doSubmitManagedObject(apApiDisplay_Access);
  }

  const renderManagedObjectFormFooter = (): JSX.Element => {
    const managedObjectFormFooterLeftToolbarTemplate = () => {
      return (
        <React.Fragment>
          <Button key={ComponentName+ButtonLabel_Back} type="button" label={ButtonLabel_Back} icon="pi pi-arrow-left" className="p-button-text p-button-plain p-button-outlined" onClick={props.onBack}/>
          <Button key={ComponentName+ButtonLabel_Cancel} type="button" label={ButtonLabel_Cancel} className="p-button-text p-button-plain" onClick={props.onCancel} />
        </React.Fragment>
      );
    }
    const managedObjectFormFooterRightToolbarTemplate = () => {
      return (
        <React.Fragment>
          <Button key={ComponentName+ButtonLabel_Next} form={FormId} type="submit" label={ButtonLabel_Next} icon="pi pi-arrow-right" className="p-button-text p-button-plain p-button-outlined" />
        </React.Fragment>
      );
    }  
    return (
      <Toolbar className="p-mb-4" left={managedObjectFormFooterLeftToolbarTemplate} right={managedObjectFormFooterRightToolbarTemplate} />
    )
  }

  const renderManagedObjectForm = () => {
    const funcName = 'renderManagedObjectForm';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);

    return (
      <div className="card p-mt-4">
        <div className="p-fluid">
          <EditNewAccessForm
            formId={FormId}
            action={EAction.NEW}
            apApiDisplay_Access={managedObject}
            onError={props.onError}
            // onLoadingChange={props.onLoadingChange}
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

      { managedObject  && renderManagedObjectForm() }

    </div>
  );
}
