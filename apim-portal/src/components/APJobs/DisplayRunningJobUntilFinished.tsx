
import React from "react";
import { useInterval } from 'react-use';

import APJobsDisplayService, { IAPJobDisplay, TAPJobDisplayList } from "../../displayServices/APJobsDisplayService";
import { APClientConnectorOpenApi } from "../../utils/APClientConnectorOpenApi";
import { ApiCallState, TApiCallState } from "../../utils/ApiCallState";
import { E_CALL_STATE_ACTIONS } from "./APJobsCommon";
import { Job } from "@solace-iot-team/apim-connector-openapi-browser";

import "../APComponents.css";

export interface IDisplayRunningJobUntilFinishedProps {
  className?: string;
  organizationId: string;
  jobId: string;
  interval_millis: number;
  onError: (apiCallState: TApiCallState) => void;
  // onUpdate: (apJobDisplayList: TAPJobDisplayList) => void;
  onFinished: (apJobDisplayList: TAPJobDisplayList) => void;
}

export const DisplayRunningJobUntilFinished: React.FC<IDisplayRunningJobUntilFinishedProps> = (props: IDisplayRunningJobUntilFinishedProps) => {
  const ComponentName='DisplayRunningJobUntilFinished';

  const [apJobDisplayList, setApJobDisplayList] = React.useState<TAPJobDisplayList>([]);
  const [isJobFinished, setIsJobFinished] = React.useState<boolean>(false);
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [delay, setDelay] = React.useState<number | null>(props.interval_millis); 

  const apiGetJob = async() => {  
    const funcName = 'apiGetJob';
    const logName = `${ComponentName}.${funcName}()`;
    setApiCallStatus(null);
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_JOB, `get job: ${props.jobId}`);
    try {
      const apJobDisplay: IAPJobDisplay = await APJobsDisplayService.apiGet_Job({ 
        organizationId: props.organizationId,
        jobId: props.jobId
      });
      const list: TAPJobDisplayList = apJobDisplayList;
      if(apJobDisplay.status === Job.status.FINISHED) setIsJobFinished(true);
      list.push(apJobDisplay);
      setApJobDisplayList(list)
    } catch(e) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const doCheckJob = async() => {
    await apiGetJob();
  }

  useInterval( () => 
    {
      doCheckJob();
    },
    delay
  );

  React.useEffect(() => {
    doCheckJob();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(apiCallStatus === null) return;
    if(!apiCallStatus.success) {
      setDelay(null);
      props.onError(apiCallStatus);
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(apJobDisplayList === undefined) return;
    if(isJobFinished) props.onFinished(apJobDisplayList);
  }, [apJobDisplayList, isJobFinished]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const renderComponent = (): JSX.Element => {
    return (
      <React.Fragment>
        <pre>
          {JSON.stringify(apJobDisplayList, null, 2 )}
        </pre>
      </React.Fragment>
    );
  }

  return (
    <React.Fragment>
      <div className={props.className ? props.className : 'card'}>
        {apJobDisplayList && renderComponent()}
      </div>
    </React.Fragment>
  );
}
