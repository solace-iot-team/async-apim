
import React from "react";

import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';

import { ApiCallState, TApiCallState } from "../../../../utils/ApiCallState";
import { APSClientOpenApi } from "../../../../utils/APSClientOpenApi";
import { TAPEntityId, } from "../../../../utils/APEntityIdsService";
import APSystemOrganizationsDisplayService, { IAPSystemOrganizationDisplay } from "../../../../displayServices/APOrganizationsDisplayService/APSystemOrganizationsDisplayService";
import { E_CALL_STATE_ACTIONS, E_DISPLAY_ORGANIZATION_SCOPE } from "../ManageOrganizationsCommon";
import { DisplayOrganization } from "../DisplayOrganization/DisplayOrganization";

import '../../../../components/APComponents.css';
import "../ManageOrganizations.css";

export interface INewReviewAndCreateProps {
  apSystemOrganizationDisplay: IAPSystemOrganizationDisplay;
  onCreateSuccess: (apiCallState: TApiCallState, organizationEntityId: TAPEntityId) => void;
  onSuccessNotification: (apiCallState: TApiCallState) => void;
  onBack: () => void;
  onCancel: () => void;
  onError: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const NewReviewAndCreate: React.FC<INewReviewAndCreateProps> = (props: INewReviewAndCreateProps) => {
  const ComponentName = 'NewReviewAndCreate';

  type  TManagedObject = IAPSystemOrganizationDisplay;
  const [managedObject, setManagedObject] = React.useState<TManagedObject>();
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);

  // * Api Calls *

  const apiCreateManagedObject = async(mo: TManagedObject): Promise<TApiCallState> => {
    const funcName = 'apiCreateManagedObject';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_CREATE_ORGANIZATION, `create organization: ${mo.apEntityId.displayName}`);
    try { 
      await APSystemOrganizationsDisplayService.apiCreate_ApSystemOrganizationDisplay({
        apSystemOrganizationDisplay: props.apSystemOrganizationDisplay
      });
    } catch(e: any) {
      APSClientOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const doInitialize = async () => {
    setManagedObject(props.apSystemOrganizationDisplay);
  }

  // * useEffect Hooks *

  React.useEffect(() => {
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    const funcName = 'useEffect';
    const logName = `${ComponentName}.${funcName}()`;
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
      else if(apiCallStatus.context.action === E_CALL_STATE_ACTIONS.API_CREATE_ORGANIZATION) {
        if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);
        props.onCreateSuccess(apiCallStatus, managedObject.apEntityId);
      }
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const doCreate = async() => {
    const funcName = 'doCreate';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);
    props.onLoadingChange(true);
    await apiCreateManagedObject(managedObject);
    props.onLoadingChange(false);
  }

  const onCreate = () => {
    doCreate();
  }

  const componentFooterLeftToolbarTemplate = () => {
    return (
      <React.Fragment>
        <Button key={ComponentName+'Back'} label="Back" icon="pi pi-arrow-left" className="p-button-text p-button-plain p-button-outlined" onClick={props.onBack}/>
        <Button type="button" label="Cancel" className="p-button-text p-button-plain" onClick={props.onCancel} />
      </React.Fragment>
    );
  }

  const componentFooterRightToolbarTemplate = () => {
    return (
      <React.Fragment>
        <Button key={ComponentName+'Create'} label="Create" icon="pi pi-plus" className="p-button-text p-button-plain p-button-outlined" onClick={onCreate}/>
      </React.Fragment>
    );
  }

  const renderComponentFooter = (): JSX.Element => {
    return (
      <Toolbar className="p-mb-4" left={componentFooterLeftToolbarTemplate} right={componentFooterRightToolbarTemplate} />
    )
  }

  const renderManagedObjectReviewView = (mo: TManagedObject) => {
    return (
      <React.Fragment>
        <DisplayOrganization
          scope={E_DISPLAY_ORGANIZATION_SCOPE.REVIEW_AND_CREATE}
          apOrganizationDisplay={mo}
        />
      </React.Fragment>
    );
  }

  const renderComponent = (mo: TManagedObject) => {
    return (
      <React.Fragment>

        {renderManagedObjectReviewView(mo)}

        {renderComponentFooter()}

      </React.Fragment>
    )
  }

  return (
    <div className="manage-api-products">

      { managedObject && renderComponent(managedObject) }

    </div>
  );
}
