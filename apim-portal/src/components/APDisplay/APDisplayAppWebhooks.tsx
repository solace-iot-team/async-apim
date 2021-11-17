
import React from "react";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

import { 
  APManagedWebhook, 
  TAPManagedWebhook, 
  TAPManagedWebhookList, 
} from "../APComponentsCommon";

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
    if(!rowData.webhookWithoutEnvs) return emptyBodyTemplate();
    if(rowData.webhookWithoutEnvs.authentication) {
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
      if(rowData.webhookStatus.summaryStatus) return (<span className="pi pi-check" style={{ color: 'green'}}/>);
      else return (<span className="pi pi-times" style={{ color: 'red'}}/>);
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
          body={environmentsBodyTemplate} 
          bodyStyle={{textAlign: 'left', overflow: 'visible', verticalAlign: 'top' }}  
          sortable 
          sortField="webhookEnvironmentReference.entityRef.displayName" 
        />
        <Column 
          header="Method" 
          body={methodBodyTemplate} 
          bodyStyle={{verticalAlign: 'top'}} 
        />
        <Column 
          header="URI" 
          body={uriBodyTemplate} 
          bodyStyle={{ verticalAlign: 'top' }} 
        />
        <Column body={authenticationBodyTemplate} header="Authentication" bodyStyle={{textAlign: 'left', overflow: 'visible', verticalAlign: 'top' }}/>
        <Column body={statusBodyTemplate} header="Status" headerStyle={{ width: '5em', textAlign: 'center' }} bodyStyle={{textAlign: 'center' }}/>
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


