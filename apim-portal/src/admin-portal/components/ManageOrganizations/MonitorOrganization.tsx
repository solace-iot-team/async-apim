
import React from "react";

import { 
  CommonName,
  CommonDisplayName
} from '@solace-iot-team/apim-connector-openapi-browser';
import { APComponentHeader } from "../../../components/APComponentHeader/APComponentHeader";
import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { APClientConnectorOpenApi } from "../../../utils/APClientConnectorOpenApi";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { 
  E_CALL_STATE_ACTIONS, 
} from "./ManageOrganizationsCommon";
import { APOrganizationsService, TAPOrganization } from "../../../utils/APOrganizationsService";

import '../../../components/APComponents.css';
import "./ManageOrganizations.css";

export interface IMonitorOrganizationProps {
  organizationId: CommonName;
  organizationDisplayName: CommonDisplayName;
  onError: (apiCallState: TApiCallState) => void;
  // onSuccess: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const MonitorOrganization: React.FC<IMonitorOrganizationProps> = (props: IMonitorOrganizationProps) => {
  const componentName = 'MonitorOrganization';

  type TManagedObject = TAPOrganization;

  const [managedObject, setManagedObject] = React.useState<TManagedObject>();  
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);

  // * Api Calls *
  const apiGetManagedObject = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObject';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_ORGANIZATION, `retrieve details for organization: ${props.organizationDisplayName}`);
    try {
      const apOrganization: TAPOrganization = await APOrganizationsService.getOrganizationStatus(props.organizationId, props.organizationDisplayName);
      setManagedObject(apOrganization);
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
              <div><b>Cloud Connectivity</b>: {String(managedObject.status?.cloudConnectivity)}</div>
              <div><b>Event Portal Connectivity</b>: {String(managedObject.status?.eventPortalConnectivity)}</div>
            </div>
            <div className="detail-right">
              <div>Id: {managedObject.name}</div>
            </div>            
          </div>
        </div>    
      </React.Fragment>
    );
  }

  return (
    <div className="manage-organizations">

      <APComponentHeader header={`Organization: ${props.organizationDisplayName}`} />

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      {managedObject && renderManagedObject() }

    </div>
  );
}
