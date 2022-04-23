
import React from "react";

import { Globals } from "../../utils/Globals";
import { APRenderUtils } from "../../utils/APRenderUtils";
import { WebHookStatus } from "@solace-iot-team/apim-connector-openapi-browser";

import "../APComponents.css";

export enum EAPDisplayAppWebhookStatus_Content {
  ALL = "ALL",
  STATUS_ONLY = "STATUS_ONLY",
  DETAILS_ONLY = "DETAILS_ONLY",
  DETAILS_ONLY_IF_DOWN = "DETAILS_ONLY_IF_DOWN",
  FAILURE_DETAILS_ONLY_IF_DOWN = "FAILURE_DETAILS_ONLY_IF_DOWN"
}
export interface IAPDisplayAppWebhookStatusProps {
  appWebhookStatus: WebHookStatus;
  displayContent: EAPDisplayAppWebhookStatus_Content;
  className?: string;
}

export const APDisplayAppWebhookStatus: React.FC<IAPDisplayAppWebhookStatusProps> = (props: IAPDisplayAppWebhookStatusProps) => {
  const componentName='APDisplayAppWebhookStatus';

  const [isUp, setIsUp] = React.useState<boolean>();
  const [isInitialized, setIsInitialized] = React.useState<boolean>(false);

  React.useEffect(() => {
    if(props.appWebhookStatus.up === undefined) setIsUp(false);
    else setIsUp(props.appWebhookStatus.up);
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(isUp === undefined) return;
    setIsInitialized(true);
  }, [isUp]); /* eslint-disable-line react-hooks/exhaustive-deps */


  const getLastFailureTimeStr = (ts: number | undefined): string => {
    if(ts === undefined) return 'not available';
    return new Date(ts * 1000).toUTCString();
  }
  const getName = (name: string | undefined): string => {
    if(name === '' || name === undefined) return 'not available';
    return name;
  }
  const getUri = (uri: string | undefined): string => {
    if(uri === '' || uri === undefined) return 'not available';
    return uri;
  }
  const getFailureReason = (reason: string | undefined): string => {
    if(reason === '' || reason === undefined) return 'not available';
    return reason;
  }

  const renderAll = (): JSX.Element => {
    const apiWebhookStatus = props.appWebhookStatus;
    return (
      <div>
        <div><b>Name</b>: {getName(apiWebhookStatus.name)}</div>
        <div><b>URI</b>: {getUri(apiWebhookStatus.uri)}</div>
        <div className="p-ml-2">
          <div>Status: {renderStatus()}</div>
          <div>Failure Reason: {getFailureReason(apiWebhookStatus.failureReason)}</div>
          <div>Last Failure Time: {getLastFailureTimeStr(apiWebhookStatus.lastFailureTime)}</div>
          <div>Msgs queued: {apiWebhookStatus.messagesQueued}</div>
          <div>MBs queued: {APRenderUtils.getFormattedMessagesQueuedMBs(apiWebhookStatus.messagesQueuedMB)}</div>
        </div>
      </div>
    );
  }
  const renderStatus = (): JSX.Element => {
    if(isUp) return (<span style={{ color: 'green'}}>Up</span>);
    return (<span style={{ color: 'red'}}>Down</span>);
  }

  const renderDetailsOnly = (): JSX.Element => {
    const apiWebhookStatus = props.appWebhookStatus;
    return(
      <div>
        <div><b>URI</b>: {apiWebhookStatus.uri}</div>
        <div className="p-ml-2">
          {apiWebhookStatus.failureReason !== undefined &&
            <div>Failure Reason: {apiWebhookStatus.failureReason}</div>
          }
          {apiWebhookStatus.lastFailureTime !== undefined &&
            <div>Last Failure Time: {getLastFailureTimeStr(apiWebhookStatus.lastFailureTime)}</div>
          }
          {apiWebhookStatus.messagesQueued !== undefined &&
            <div>Msgs queued: {apiWebhookStatus.messagesQueued}</div>
          }
          {apiWebhookStatus.messagesQueuedMB !== undefined &&
            <div>MBs queued: {apiWebhookStatus.messagesQueuedMB}</div>
          }
        </div>
        {/* DEBUG */}
        {/* <div>{JSON.stringify(props.apWebhookStatus.apiWebhookStatus)}</div> */}
      </div>
    );
  }

  const renderFailureDetailsOnly = (): JSX.Element => {
    const apiWebhookStatus = props.appWebhookStatus;
    return(
      <div>
        {apiWebhookStatus.failureReason !== undefined &&
          <div>Failure Reason: {apiWebhookStatus.failureReason}</div>
        }
        {apiWebhookStatus.lastFailureTime !== undefined &&
          <div>Last Failure Time: {getLastFailureTimeStr(apiWebhookStatus.lastFailureTime)}</div>
        }
      </div>
    );
  }

  const renderDetailsOnlyIfDown = (): JSX.Element | undefined => {
    if(isUp) return undefined;
    return renderDetailsOnly();
  }

  const renderFailureDetailsOnlyIfDown = (): JSX.Element | undefined => {
    if(isUp) return undefined;
    return renderFailureDetailsOnly();
  }

  const renderContent = (): JSX.Element | undefined => {
    const funcName = 'renderContent';
    const logName = `${componentName}.${funcName}()`;
    switch (props.displayContent) {
      case EAPDisplayAppWebhookStatus_Content.ALL:
        return renderAll();
      case EAPDisplayAppWebhookStatus_Content.STATUS_ONLY:
        return renderStatus();
      case EAPDisplayAppWebhookStatus_Content.DETAILS_ONLY:
        return renderDetailsOnly();
      case EAPDisplayAppWebhookStatus_Content.DETAILS_ONLY_IF_DOWN:
        return renderDetailsOnlyIfDown();
      case EAPDisplayAppWebhookStatus_Content.FAILURE_DETAILS_ONLY_IF_DOWN:
        return renderFailureDetailsOnlyIfDown();        
      default:
        Globals.assertNever(logName, props.displayContent)
    }
    return (<></>);
  }

  return (
    <div className={props.className ? props.className : 'card'}>
      
      {isInitialized && renderContent()}
    
    </div>
  );
}
