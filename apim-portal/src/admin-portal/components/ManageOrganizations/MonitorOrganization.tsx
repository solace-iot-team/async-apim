
import React from "react";

import { APComponentHeader } from "../../../components/APComponentHeader/APComponentHeader";
import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { APClientConnectorOpenApi } from "../../../utils/APClientConnectorOpenApi";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { TAPEntityId } from "../../../utils/APEntityIdsService";
import APOrganizationsDisplayService, { 
  IAPOrganizationDisplay 
} from "../../../displayServices/APOrganizationsDisplayService/APOrganizationsDisplayService";
import { E_CALL_STATE_ACTIONS } from "./ManageOrganizationsCommon";

import '../../../components/APComponents.css';
import "./ManageOrganizations.css";

export interface IMonitorOrganizationProps {
  organizationEntityId: TAPEntityId;
  onError: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const MonitorOrganization: React.FC<IMonitorOrganizationProps> = (props: IMonitorOrganizationProps) => {
  const componentName = 'MonitorOrganization';

  type TManagedObject = IAPOrganizationDisplay;

  const [managedObject, setManagedObject] = React.useState<TManagedObject>();  
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);

  // * Api Calls *
  const apiGetManagedObject = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObject';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_ORGANIZATION, `retrieve details for organization: ${props.organizationEntityId.displayName}`);
    try {
      const apOrganizationDisplay: IAPOrganizationDisplay = await APOrganizationsDisplayService.apiGet_ApOrganizationDisplay({
        organizationId: props.organizationEntityId.id
      });
      setManagedObject(apOrganizationDisplay);
    } catch(e) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  // * useEffect Hooks *
  const doInitialize = async () => {
    props.onLoadingChange(true);
    await apiGetManagedObject();
    props.onLoadingChange(false);
  }

  React.useEffect(() => {
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const renderManagedObject = () => {
    const funcName = 'renderManagedObject';
    const logName = `${componentName}.${funcName}()`;

    if(!managedObject) throw new Error(`${logName}: managedObject is undefined`);

    return (
      <React.Fragment>
        <div className="p-col-12">
          <div className="organization-view">
            <div className="detail-left">
              <div><b>Operational Status</b>: {managedObject.apOrganizationConfigStatus}</div>
              <div className="p-ml-2 p-mt-2">
                <div><b>Solace Cloud Connectivity</b>: {String(managedObject.apOrganizationOperationalStatus.cloudConnectivity)}</div>
                <div><b>Event Portal Connectivity</b>: {String(managedObject.apOrganizationOperationalStatus.eventPortalConnectivity)}</div>
              </div>
            </div>
            <div className="detail-right">
              <div>Id: {managedObject.apEntityId.id}</div>
            </div>            
          </div>
        </div>    
      </React.Fragment>
    );
  }

  return (
    <div className="manage-organizations">

      <APComponentHeader header={`Organization: ${props.organizationEntityId.displayName}`} />

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      {managedObject && renderManagedObject() }

    </div>
  );
}
