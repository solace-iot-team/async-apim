
import React from "react";

import { MenuItem, MenuItemCommandParams } from "primereact/api";

import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { APClientConnectorOpenApi } from "../../../utils/APClientConnectorOpenApi";
import { TAPEntityId } from "../../../utils/APEntityIdsService";
import { APComponentHeader } from "../../../components/APComponentHeader/APComponentHeader";
import APJobsDisplayService, { IAPJobDisplay } from "../../../displayServices/APJobsDisplayService";
import { E_CALL_STATE_ACTIONS } from "./MonitorOrganizationJobsCommon";

import '../../../components/APComponents.css';
import "./MonitorOrganizationJobs.css";

export interface IViewOrganizationJobProps {
  organizationId: string;
  apJobDisplayEntityId: TAPEntityId;
  onError: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
  setBreadCrumbItemList: (itemList: Array<MenuItem>) => void;
  onNavigateHere: (apJobDisplayEntityId: TAPEntityId) => void;
}

export const ViewOrganizationJob: React.FC<IViewOrganizationJobProps> = (props: IViewOrganizationJobProps) => {
  const ComponentName = 'ViewOrganizationJob';

  type TManagedObject = IAPJobDisplay;

  const [managedObject, setManagedObject] = React.useState<TManagedObject>();  
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);

  // * Api Calls *
  const apiGetManagedObject = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObject';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET, 'get job');
    try {
      const apJobDisplay: IAPJobDisplay = await APJobsDisplayService.apiGet_IAPJobDisplay({ organizationId: props.organizationId, jobId: props.apJobDisplayEntityId.id });
      setManagedObject(apJobDisplay);
    } catch(e: any) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const getJobDisplayName = (mo: TManagedObject): string => {
    return `${mo.apEntityId.displayName} (${mo.apEntityId.id})`;
  }
  const ViewJob_onNavigateHereCommand = (e: MenuItemCommandParams): void => {
    props.onNavigateHere(props.apJobDisplayEntityId);
  }
  const setBreadCrumbItemList = (moDisplayName: string) => {
    props.setBreadCrumbItemList([
      {
        label: moDisplayName,
        command: ViewJob_onNavigateHereCommand
      }
    ]);
  }

  const doInitialize = async () => {
    props.onLoadingChange(true);
    await apiGetManagedObject();
    props.onLoadingChange(false);
  }

  
  // * useEffect Hooks *

  React.useEffect(() => {
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(managedObject === undefined) return;
    // props.onLoadSuccess(managedObject);
    setBreadCrumbItemList(getJobDisplayName(managedObject));
  }, [managedObject]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(apiCallStatus === null) return;
    if(!apiCallStatus.success) props.onError(apiCallStatus);
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const renderDetails = () => {
    const funcName = 'renderDetails';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);
    return(
      <React.Fragment> 
        {/* <div className="p-mb-2 p-mt-4 ap-display-component-header">Mappings:</div> */}
        {/* <div className="p-ml-4"> */}
        <pre>
        {JSON.stringify(managedObject.connectorJob, null, 2)}
          {/* {JSON.stringify(managedObject.connectorJob, (key: string, value: any) => {
            if( key !== APDisplayUtils.nameOf<Job>('id') &&
                key !== APDisplayUtils.nameOf<Job>('name')
            ) return value;
          }, 2)} */}
        </pre>
        {/* </div> */}
      </React.Fragment>
    );
  }

  const renderManagedObject = () => {
    const funcName = 'renderManagedObject';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);

    return (
      <div className="p-col-12">
        <div className="organization-job-view">
          <div className="detail-left">
            {renderDetails()}
          </div>
          <div className="detail-right">
            <div>Id: {managedObject.apEntityId.id}</div>
          </div>            
        </div>
      </div>      
    );
  }

  return (
    <div className="monitor-organization-jobs">

      { managedObject && <APComponentHeader header={`Job: ${getJobDisplayName(managedObject)}`} /> }

      { managedObject && renderManagedObject() }

    </div>
  );
}
