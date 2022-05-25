
import React from "react";

import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';

import { ApiCallState, TApiCallState } from "../../../../utils/ApiCallState";
import { APSClientOpenApi } from "../../../../utils/APSClientOpenApi";
import { TAPEntityId, } from "../../../../utils/APEntityIdsService";
import APApisDisplayService, { IAPApiDisplay } from "../../../../displayServices/APApisDisplayService";
import { ButtonLabel_Back, ButtonLabel_Cancel, ButtonLabel_Create, E_CALL_STATE_ACTIONS } from "../ManageApisCommon";
import { DisplayAdminPortalApi, E_DISPLAY_ADMIN_PORTAL_API_SCOPE } from "../DisplayAdminPortalApi";

import '../../../../components/APComponents.css';
import "../ManageApis.css";

export interface INewReviewAndCreateProps {
  organizationId: string;
  apApiDisplay: IAPApiDisplay;
  onCreateSuccess: (apiCallState: TApiCallState, apiEntityId: TAPEntityId) => void;
  onUserNotification: (apiCallState: TApiCallState) => void;
  onBack: () => void;
  onCancel: () => void;
  onError: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const NewReviewAndCreate: React.FC<INewReviewAndCreateProps> = (props: INewReviewAndCreateProps) => {
  const ComponentName = 'NewReviewAndCreate';

  type  TManagedObject = IAPApiDisplay;
  const [managedObject, setManagedObject] = React.useState<TManagedObject>();
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);

  // * Api Calls *

  const apiCreateManagedObject = async(mo: TManagedObject): Promise<TApiCallState> => {
    const funcName = 'apiCreateManagedObject';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_CREATE_API, `create api: ${mo.apEntityId.displayName}`);
    try { 
      await APApisDisplayService.apiCreate_ApApiDisplay({
        organizationId: props.organizationId,
        apApiDisplay: props.apApiDisplay,
        // userId: userContext.apLoginUserDisplay.apEntityId.id,
      });
    } catch(e: any) {
      APSClientOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const doInitialize = async () => {
    setManagedObject(props.apApiDisplay);
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
      else if(apiCallStatus.context.action === E_CALL_STATE_ACTIONS.API_CREATE_API) {
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
        <Button key={ComponentName+ButtonLabel_Back} type="button" label={ButtonLabel_Back} icon="pi pi-arrow-left" className="p-button-text p-button-plain p-button-outlined" onClick={props.onBack}/>
        <Button key={ComponentName+ButtonLabel_Cancel} type="button" label={ButtonLabel_Cancel} className="p-button-text p-button-plain" onClick={props.onCancel} />
      </React.Fragment>
    );
  }

  const componentFooterRightToolbarTemplate = () => {
    return (
      <React.Fragment>
        <Button key={ComponentName+ButtonLabel_Create} label={ButtonLabel_Create} icon="pi pi-plus" className="p-button-text p-button-plain p-button-outlined" onClick={onCreate}/>
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
        <DisplayAdminPortalApi
          scope={E_DISPLAY_ADMIN_PORTAL_API_SCOPE.REVIEW_AND_CREATE}
          organizationId={props.organizationId}
          apApiDisplay={mo}
          onError={props.onError}
          onSuccess={props.onUserNotification}
          onLoadingChange={props.onLoadingChange}
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
    <div className="manage-apis">

      { managedObject && renderComponent(managedObject) }

    </div>
  );
}
