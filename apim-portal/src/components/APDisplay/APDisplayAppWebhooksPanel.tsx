
import React from "react";

import { Panel, PanelHeaderTemplateOptions } from "primereact/panel";
import { APManagedWebhook, TAPManagedWebhookList } from "../deleteme.APComponentsCommon";
import { APDisplayAppWebhooks } from "./APDisplayAppWebhooks";

import "../APComponents.css";

export interface IAPDisplayAppWebhooksPanelProps {
  isAppWebhooksCapable: boolean;
  managedWebhookList: TAPManagedWebhookList; 
  emptyMessage: string;
  className?: string;
}

export const APDisplayAppWebhooksPanel: React.FC<IAPDisplayAppWebhooksPanelProps> = (props: IAPDisplayAppWebhooksPanelProps) => {
  // const componentName='APDisplayAppWebhooksPanel';

  const panelHeaderTemplate = (options: PanelHeaderTemplateOptions) => {
    const toggleIcon = options.collapsed ? 'pi pi-chevron-right' : 'pi pi-chevron-down';
    const className = `${options.className} p-jc-start`;
    const titleClassName = `${options.titleClassName} p-pl-1`;
    let title: string = 'App Webhooks';
    if(props.isAppWebhooksCapable) {
      const numberWebhooks: number = APManagedWebhook.getNumberWebhooksDefined4App(props.managedWebhookList);
      title = title + ` (${numberWebhooks})`;
    } else {
      title = title + ' (N/A)'
    }
    return (
      <div className={className} style={{ justifyContent: 'left'}} >
        <button className={options.togglerClassName} onClick={options.onTogglerClick}>
          <span className={toggleIcon}></span>
        </button>
        <span className={titleClassName}>
          {title}
        </span>
      </div>
    );
  }

  const renderComponent = (): JSX.Element => {
    return (
      <Panel 
        headerTemplate={panelHeaderTemplate} 
        toggleable
        collapsed={true}
        className="p-pt-2"
      >
        <APDisplayAppWebhooks 
          managedWebhookList={props.managedWebhookList} 
          emptyMessage="Webhooks not supported by API Products / Environments."              
          className={props.className}
        />
      </Panel>
    );
  }

  return (
    <div className={props.className ? props.className : 'card'}>
      {renderComponent()}
    </div>
  );
}
