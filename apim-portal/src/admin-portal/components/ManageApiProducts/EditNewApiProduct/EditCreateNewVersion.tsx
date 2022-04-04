
import React from "react";

import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';

import { ApiCallState, TApiCallState } from "../../../../utils/ApiCallState";
import { APSClientOpenApi } from "../../../../utils/APSClientOpenApi";
import APAdminPortalApiProductsDisplayService, { 
  TAPAdminPortalApiProductDisplay 
} from "../../../displayServices/APAdminPortalApiProductsDisplayService";
import { E_CALL_STATE_ACTIONS } from "../ManageApiProductsCommon";

import '../../../../components/APComponents.css';
import "../ManageApiProducts.css";

export interface ICreateNewVersionProps {
  organizationId: string;
  apAdminPortalApiProductDisplay: TAPAdminPortalApiProductDisplay;
  onError: (apiCallState: TApiCallState) => void;
  onCreateVersionSuccess: (apiCallState: TApiCallState) => void;
  onCancel: () => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const EditCreateNewVersion: React.FC<ICreateNewVersionProps> = (props: ICreateNewVersionProps) => {
  const ComponentName = 'EditCreateNewVersion';

  type TManagedObject = TAPAdminPortalApiProductDisplay;
  
  const [managedObject, setManagedObject] = React.useState<TManagedObject>();
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);

  // * Api Calls *

  const apiUpdateManagedObject = async(mo: TManagedObject): Promise<TApiCallState> => {
    const funcName = 'apiUpdateManagedObject';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_CREATE_VERSION_API_PRODUCT, `create version of api product: ${mo.apEntityId.displayName}`);
    try {
      await APAdminPortalApiProductsDisplayService.apiUpdate_ApApiProductDisplay({
        organizationId: props.organizationId,
        apApiProductDisplay: mo,
      });
    } catch(e: any) {
      APSClientOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const doInitialize = async () => {
    setManagedObject(props.apAdminPortalApiProductDisplay);
  }

  // * useEffect Hooks *

  React.useEffect(() => {
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
      else {
        props.onCreateVersionSuccess(apiCallStatus);
      }
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const doCreateNewVersion = async (mo: TManagedObject) => {
    props.onLoadingChange(true);
    await apiUpdateManagedObject(mo);
    props.onLoadingChange(false);
  }

  const onCreateNewVersion = () => {
    const funcName = 'onSubmit';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);
    doCreateNewVersion(managedObject);
  }

  const renderToolbar = (): JSX.Element => {
    const managedObjectFormFooterLeftToolbarTemplate = () => {
      return (
        <React.Fragment>
          <div>Current Version: {managedObject?.apVersionInfo.apLastVersion}</div>
          <div className="p-ml-4">New Version: {managedObject?.apVersionInfo.apCurrentVersion}</div>
        </React.Fragment>
      );
    }
    const managedObjectFormFooterRightToolbarTemplate = () => {
      return (
        <React.Fragment>
          <Button key={ComponentName+'Create_New_Version'} label="Create New Version" icon="pi pi-plus" className="p-button-text p-button-plain p-button-outlined" onClick={onCreateNewVersion}/>
        </React.Fragment>
      );
    }
    return (
      <Toolbar className="p-mb-0" left={managedObjectFormFooterLeftToolbarTemplate} right={managedObjectFormFooterRightToolbarTemplate} />
    );
  }

  const renderComponent = () => {
    return (
      <div>
        { renderToolbar() }
      </div>
    );
  }

  
  return (
    <div className="manage-api-products">

      {managedObject && 
        renderComponent()
      }
    </div>
  );
}
