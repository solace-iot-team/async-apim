
import React from "react";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

import { 
  TAPManagedWebhook, 
  TAPManagedWebhookList,
} from "../APComponentsCommon";

import { WebHookAuth, WebHookBasicAuth, WebHookHeaderAuth } from "@solace-iot-team/apim-connector-openapi-browser";
import { Globals } from "../../utils/Globals";
import { APDisplayAppWebhookStatus, EAPDisplayAppWebhookStatus_Content } from "../APDisplayAppStatus/APDisplayAppWebhookStatus";

import "../APComponents.css";

export interface IAPDisplayAppWebhooksProps {
  managedWebhookList: TAPManagedWebhookList; 
  emptyMessage: string;
  className?: string;
}

export const APDisplayAppWebhooks: React.FC<IAPDisplayAppWebhooksProps> = (props: IAPDisplayAppWebhooksProps) => {
  const componentName='APDisplayAppWebhooks';

  type TAPDisplayAppWebhooksDataTableRow = TAPManagedWebhook;
  type TAPDisplayAppWebhooksDataTableList = Array<TAPDisplayAppWebhooksDataTableRow>;
  
  const transformAPManagedWebhookListToDataTableList = (managedWebhookList: TAPManagedWebhookList): TAPDisplayAppWebhooksDataTableList => {
    return managedWebhookList;
  }
  
  const [dataTableList, setDataTableList] = React.useState<TAPDisplayAppWebhooksDataTableList>([]);
  const componentDataTableRef = React.useRef<any>(null);
  // const [componentExpandedDataTableRows, setComponentExpandedDataTableRows] = React.useState<any>(null);
  // const componentExpansionDataTableRef = React.useRef<any>(null);
  
  React.useEffect(() => {
    // TODO: may need to get the status?
    setDataTableList(transformAPManagedWebhookListToDataTableList(props.managedWebhookList));
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  const emptyBodyTemplate = (): JSX.Element => {
    return (<span className="pi pi-minus" style={{ color: 'gray'}}/>)
  }

  const environmentsBodyTemplate = (rowData: TAPDisplayAppWebhooksDataTableRow): string => {
    return rowData.webhookEnvironmentReference.entityRef.displayName;
  }

  const methodBodyTemplate = (rowData: TAPDisplayAppWebhooksDataTableRow) => {
    if(!rowData.webhookWithoutEnvs) return emptyBodyTemplate();
    return rowData.webhookWithoutEnvs.method;
  }
  const uriBodyTemplate = (rowData: TAPDisplayAppWebhooksDataTableRow) => {
    if(!rowData.webhookWithoutEnvs) return emptyBodyTemplate();
    return rowData.webhookWithoutEnvs.uri;
  }

  const authenticationBodyTemplate = (rowData: TAPDisplayAppWebhooksDataTableRow): JSX.Element => {
    const funcName = 'authenticationBodyTemplate';
    const logName = `${componentName}.${funcName}()`;

    if(!rowData.webhookWithoutEnvs) return emptyBodyTemplate();
    if(rowData.webhookWithoutEnvs.authentication) {
      const whAuth: WebHookAuth = rowData.webhookWithoutEnvs.authentication;
      if(!whAuth.authMethod) throw new Error(`${logName}: whAuth.authMethod is undefined`);
      switch(whAuth.authMethod) {
        case WebHookBasicAuth.authMethod.BASIC:
          return (<div>{WebHookBasicAuth.authMethod.BASIC}</div>);
        case WebHookHeaderAuth.authMethod.HEADER:
          return (<div>{WebHookHeaderAuth.authMethod.HEADER}</div>);
        default:
          Globals.assertNever(logName, whAuth.authMethod);
      }
      return (
        <pre style={ { fontSize: '10px' }} >
          {JSON.stringify(rowData.webhookWithoutEnvs.authentication, null, 2)}
        </pre>
      );
    } else {
      return <>None</>
    }
  }
  const statusBodyTemplate = (rowData: TAPDisplayAppWebhooksDataTableRow) => {
    if(!rowData.webhookWithoutEnvs) return emptyBodyTemplate();
    if(rowData.webhookStatus) {
      return (
        <APDisplayAppWebhookStatus
          apWebhookStatus={rowData.webhookStatus}
          displayContent={EAPDisplayAppWebhookStatus_Content.STATUS_ONLY}
        />
      );
    } else {
      return (<span className="pi pi-question" style={{ color: 'gray'}}/>);
    }
  }

  const renderComponent = (dataTableList: TAPDisplayAppWebhooksDataTableList): JSX.Element => {
    return (
      <DataTable
        className="p-datatable-sm"
        ref={componentDataTableRef}
        dataKey="webhookEnvironmentReference.entityRef.name"
        value={dataTableList}
        sortMode="single" 
        sortField="webhookEnvironmentReference.entityRef.displayName" 
        sortOrder={1}
      >
        <Column 
          header="Environment" 
          headerStyle={{ width: '18em' }}
          body={environmentsBodyTemplate} 
          bodyStyle={{textAlign: 'left', overflow: 'visible', verticalAlign: 'top' }}  
          sortable 
          sortField="webhookEnvironmentReference.entityRef.displayName" 
        />
        <Column 
          header="Method"
          headerStyle={{ width: '7em' }}
          body={methodBodyTemplate} 
          bodyStyle={{verticalAlign: 'top'}} 
        />
        <Column 
          header="URI" 
          body={uriBodyTemplate} 
          bodyStyle={{ verticalAlign: 'top' }} 
        />
        <Column 
          header="Authentication" 
          headerStyle={{ width: '8em' }} 
          body={authenticationBodyTemplate} 
          bodyStyle={{textAlign: 'left', verticalAlign: 'top' }}
        />
        <Column header="Status" headerStyle={{ width: '5em', textAlign: 'center' }} body={statusBodyTemplate}  bodyStyle={{textAlign: 'center' }}/>
      </DataTable>
    );
  }

  return (
    <div className={props.className ? props.className : 'card'}>
      {dataTableList.length > 0 &&
        renderComponent(dataTableList)
      }
      {props.managedWebhookList.length === 0 && 
        <span>{props.emptyMessage}</span>
      }
    </div>
  );
}


