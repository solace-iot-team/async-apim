
import React from "react";

import { Divider } from "primereact/divider";

import { APComponentHeader } from "../../../components/APComponentHeader/APComponentHeader";
import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { E_CALL_STATE_ACTIONS } from "./ManageExternalSystemsCommon";
import { APClientConnectorOpenApi } from "../../../utils/APClientConnectorOpenApi";
import APExternalSystemsDisplayService, { TAPExternalSystemDisplay } from "../../../displayServices/APExternalSystemsDisplayService";
import { APDisplayApBusinessGroupDisplayList } from "../../../components/APDisplay/APDisplayApBusinessGroupDisplayList";

import '../../../components/APComponents.css';
import "./ManageExternalSystems.css";

export interface IViewExternalSystemProps {
  organizationId: string,
  externalSystemId: string;
  externalSystemDisplayName: string;
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const ViewExternalSystem: React.FC<IViewExternalSystemProps> = (props: IViewExternalSystemProps) => {
  const componentName = 'ViewExternalSystem';

  type TManagedObject = TAPExternalSystemDisplay;

  const [managedObject, setManagedObject] = React.useState<TManagedObject>();  
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);

  // * Api Calls *
  const apiGetManagedObject = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObject';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_EXTERNAL_SYSTEM, `retrieve details for external system: ${props.externalSystemDisplayName}`);
    try { 
      const object: TAPExternalSystemDisplay = await APExternalSystemsDisplayService.getApExternalSystemDisplay({
        organizationId: props.organizationId,
        externalSystemId: props.externalSystemId
      })
      setManagedObject(object);
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
          <div className="view">
            <div className="view-detail-left">
              
              <div className="p-text-bold">Description:</div>
              <div className="p-ml-2">{managedObject.apsExternalSystem.description}</div>

              <Divider />
              <div className="p-text-bold">Business Groups:</div>
              <APDisplayApBusinessGroupDisplayList 
                className="p-ml-4 p-mt-4"
                apBusinessGroupDisplayList={managedObject.apsBusinessGroupExternalDisplayList} 
                emptyMessage="None."  
              />

            </div>
            <div className="view-detail-right">
              <div>Id: {managedObject.apEntityId.id}</div>
            </div>            
          </div>
        </div>  
      </React.Fragment>
    ); 
  }

  return (
    <React.Fragment>
      <div className="ap-manage-external-system">

        <APComponentHeader header={`External System: ${props.externalSystemDisplayName}`} />

        <ApiCallStatusError apiCallStatus={apiCallStatus} />

        {managedObject && renderManagedObject() }

      </div>
      {/* DEBUG */}
      {/* <pre style={ { fontSize: '10px' }} >
        {JSON.stringify(managedObject, null, 2)}
      </pre> */}
      {/* <pre style={ { fontSize: '10px' }} >
        apSearchContent={JSON.stringify(managedObject?.apSearchContent.split(','), null, 2)}
      </pre> */}
    </React.Fragment>
  );
}
