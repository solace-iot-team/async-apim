
import React from "react";

import { Panel, PanelHeaderTemplateOptions } from "primereact/panel";
import { TAPViewManagedWebhook } from "../APComponentsCommon";
import { 
  APDisplayAppWebhooks, 
  TAPDisplayAppWebhooksDataTableList, 
  transformAPViewManagedWebhookListToDataTableList 
} from "./APDisplayAppWebhooks";

import "../APComponents.css";

export interface IAPDisplayAppWebhooksPanelProps {
  appViewManagedWebhookList: Array<TAPViewManagedWebhook>;
  emptyMessage: string;
  className?: string;
}

export const APDisplayAppWebhooksPanel: React.FC<IAPDisplayAppWebhooksPanelProps> = (props: IAPDisplayAppWebhooksPanelProps) => {
  const componentName='APDisplayAppWebhooksPanel';

  const [dataTableList, setDataTableList] = React.useState<TAPDisplayAppWebhooksDataTableList>();

  React.useEffect(() => {
    // TODO: may need to get the status?
    setDataTableList(transformAPViewManagedWebhookListToDataTableList(props.appViewManagedWebhookList));
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  const panelHeaderTemplate = (options: PanelHeaderTemplateOptions) => {
    const funcName = 'panelHeaderTemplate';
    const logName = `${componentName}.${funcName}()`;
    if(!dataTableList) throw new Error(`${logName}: dataTableList is undefined`);
    const toggleIcon = options.collapsed ? 'pi pi-chevron-right' : 'pi pi-chevron-down';
    const className = `${options.className} p-jc-start`;
    const titleClassName = `${options.titleClassName} p-pl-1`;
    return (
      <div className={className} style={{ justifyContent: 'left'}} >
        <button className={options.togglerClassName} onClick={options.onTogglerClick}>
          <span className={toggleIcon}></span>
        </button>
        <span className={titleClassName}>
          {`APP Webhooks (${dataTableList.length})`}
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
          appViewManagedWebhookList={props.appViewManagedWebhookList} 
          emptyMessage="No Webhooks defined."              
          className={props.className}
        />
      </Panel>
    );
  }

  return (
    <div className={props.className ? props.className : 'card'}>
      {dataTableList && renderComponent()}
    </div>
  );
}
