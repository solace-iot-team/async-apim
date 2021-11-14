
import React from "react";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

import { 
  APManagedWebhook, 
  TAPManagedWebhook, 
  TAPManagedWebhookList, 
  TAPViewManagedWebhook, 
  TAPViewManagedWebhookList 
} from "../APComponentsCommon";

import "../APComponents.css";

export type TAPDisplayAppWebhooksDataTableRow = {
  apViewManagedWebhook: TAPViewManagedWebhook;
  apManagedWebhook: TAPManagedWebhook;
  synthId: string;
}
export type TAPDisplayAppWebhooksDataTableList = Array<TAPDisplayAppWebhooksDataTableRow>;

export const transformAPViewManagedWebhookListToDataTableList = (appViewManagedWebhookList: TAPViewManagedWebhookList): TAPDisplayAppWebhooksDataTableList => {
  // const funcName = 'transformAPViewManagedWebhookListToDataTableList';
  // const logName = `${componentName}.${funcName}()`;
  let dataTableList: TAPDisplayAppWebhooksDataTableList = [];
  appViewManagedWebhookList.forEach( (apViewManagedWebhook: TAPViewManagedWebhook) => {      
    const apManagedWebhookList: TAPManagedWebhookList = APManagedWebhook.createAPManagedWebhookListFromApiWebhookList([apViewManagedWebhook.apiWebHook], apViewManagedWebhook.webhookApiEnvironmentResponseList);
    apManagedWebhookList.forEach( (apManagedWebhook: TAPManagedWebhook) => {
      dataTableList.push({
        synthId: `${apManagedWebhook.environment.name}`,
        apViewManagedWebhook: apViewManagedWebhook,
        apManagedWebhook: apManagedWebhook
      });
    });
  });
  // // DEBUG
  // dataTableList.forEach( (row: TDataTableRow) => {
  //   console.log(`${logName}: row.synthId = ${JSON.stringify(row.synthId, null, 2)}`);
  //   console.log(`${logName}: row.apManagedWebhook = ${JSON.stringify(row.apManagedWebhook, null, 2)}`);
  // });
  // // throw new Error(`${logName}: continue here`);
  return dataTableList;
}

export interface IAPDisplayAppWebhooksProps {
  appViewManagedWebhookList: TAPViewManagedWebhookList;
  emptyMessage: string;
  className?: string;
}

export const APDisplayAppWebhooks: React.FC<IAPDisplayAppWebhooksProps> = (props: IAPDisplayAppWebhooksProps) => {
  const componentName='APDisplayAppWebhooks';

  const [dataTableList, setDataTableList] = React.useState<TAPDisplayAppWebhooksDataTableList>([]);
  const componentDataTableRef = React.useRef<any>(null);
  // const [componentExpandedDataTableRows, setComponentExpandedDataTableRows] = React.useState<any>(null);
  // const componentExpansionDataTableRef = React.useRef<any>(null);
  
  React.useEffect(() => {
    // TODO: may need to get the status?
    setDataTableList(transformAPViewManagedWebhookListToDataTableList(props.appViewManagedWebhookList));
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  // const renderGuaranteedMessaging = (rowData: TAPAppClientInformation): JSX.Element => {
  //   const dataTableList: Array<ClientInformationGuaranteedMessaging> = [rowData.guaranteedMessaging];
  //   return (
  //     <DataTable
  //       ref={componentExpansionDataTableRef}
  //       dataKey="name"
  //       header="Guaranteed Messaging"
  //       value={dataTableList}
  //     >
  //       <Column field="name" header="Queue Name" />
  //       <Column field="accessType" header="Access Type" />
  //     </DataTable>
  //   );
  // }

  const emptyBodyTemplate = (): JSX.Element => {
    return (<span className="pi pi-minus" style={{ color: 'gray'}}/>)
  }

  const environmentsBodyTemplate = (rowData: TAPDisplayAppWebhooksDataTableRow): string => {
    return rowData.apManagedWebhook.environment.displayName;
  }

  const methodBodyTemplate = (rowData: TAPDisplayAppWebhooksDataTableRow) => {
    if(!rowData.apManagedWebhook) return emptyBodyTemplate();
    return rowData.apViewManagedWebhook?.apiWebHook.method;
  }
  const uriBodyTemplate = (rowData: TAPDisplayAppWebhooksDataTableRow) => {
    if(!rowData.apViewManagedWebhook) return emptyBodyTemplate();
    return rowData.apViewManagedWebhook?.apiWebHook.uri;
  }

  const authenticationBodyTemplate = (rowData: TAPDisplayAppWebhooksDataTableRow): JSX.Element => {
    // if(!rowData.apViewManagedWebhook) return emptyBodyTemplate();
    if(rowData.apManagedWebhook.apiWebhookWithoutEnvs.authentication) {
      return (
          <pre style={ { fontSize: '10px' }} >
            {JSON.stringify(rowData.apManagedWebhook.apiWebhookWithoutEnvs.authentication, null, 2)}
          </pre>
      );
    } else {
      return <>None</>
    }
  }
  const statusBodyTemplate = (rowData: TAPDisplayAppWebhooksDataTableRow) => {
    if(rowData.apViewManagedWebhook.apWebhookStatus) {
      if(rowData.apViewManagedWebhook.apWebhookStatus.summaryStatus) return (<span className="pi pi-check" style={{ color: 'green'}}/>);
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
        dataKey="synthId"
        value={dataTableList}
        sortMode="single" 
        sortField="apManagedWebhook.environment.displayName" 
        sortOrder={1}
      >
        <Column 
          header="Environment" 
          body={environmentsBodyTemplate} 
          bodyStyle={{textAlign: 'left', overflow: 'visible', verticalAlign: 'top' }}  
          sortable 
          sortField="apManagedWebhook.environment.displayName" 
        />
        <Column 
          header="Method" 
          body={methodBodyTemplate} 
          bodyStyle={{verticalAlign: 'top'}} 
          sortable 
          sortField="apViewManagedWebhook?.apiWebHook.method"
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
      {props.appViewManagedWebhookList.length === 0 && 
        <span>{props.emptyMessage}</span>
      }
    </div>
  );
}


