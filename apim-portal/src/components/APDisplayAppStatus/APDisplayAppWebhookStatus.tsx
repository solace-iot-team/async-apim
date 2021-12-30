
import React from "react";

import { TAPWebhookStatus } from "../APComponentsCommon";

import "../APComponents.css";
import { Globals } from "../../utils/Globals";

export enum EAPDisplayAppWebhookStatus_Content {
  ALL = "ALL",
  STATUS_ONLY = "STATUS_ONLY",
  DETAILS_ONLY = "DETAILS_ONLY",
  DETAILS_ONLY_IF_DOWN = "DETAILS_ONLY_IF_DOWN",
  FAILURE_DETAILS_ONLY_IF_DOWN = "FAILURE_DETAILS_ONLY_IF_DOWN"
}
export interface IAPDisplayAppWebhookStatusProps {
  apWebhookStatus: TAPWebhookStatus;
  displayContent: EAPDisplayAppWebhookStatus_Content;
  className?: string;
}

export const APDisplayAppWebhookStatus: React.FC<IAPDisplayAppWebhookStatusProps> = (props: IAPDisplayAppWebhookStatusProps) => {
  const componentName='APDisplayAppWebhookStatus';

  const getLastFailureTimeStr = (ts: number): string => {
    return new Date(ts * 1000).toUTCString();
  }

  const renderAll = (): JSX.Element => {
    const { apiWebhookStatus } = props.apWebhookStatus;
    return (
      <div>
        <div><b>URI</b>: {apiWebhookStatus.uri}</div>
        <div className="p-ml-2">
          <div>Status: {renderStatus()}</div>
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
      </div>
    );
  }
  const renderStatus = (): JSX.Element => {
    if(props.apWebhookStatus.summaryStatus) return (<span style={{ color: 'green'}}>Up</span>);
    return (<span style={{ color: 'red'}}>Down</span>);
  }

  const renderDetailsOnly = (): JSX.Element => {
    const { apiWebhookStatus } = props.apWebhookStatus;
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
    const { apiWebhookStatus } = props.apWebhookStatus;
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
    if(props.apWebhookStatus.summaryStatus) return undefined;
    return renderDetailsOnly();
  }

  const renderFailureDetailsOnlyIfDown = (): JSX.Element | undefined => {
    if(props.apWebhookStatus.summaryStatus) return undefined;
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
      {renderContent()}
    </div>
  );
}
