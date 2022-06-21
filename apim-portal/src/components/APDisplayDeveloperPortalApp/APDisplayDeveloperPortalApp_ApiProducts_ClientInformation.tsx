
import React from "react";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

import APDeveloperPortalAppApiProductsDisplayService, { 
  TAPAppClientInformationDisplay,
  TAPAppGuaranteedMessagingDisplay,
  TAPApp_ApiProduct_ClientInformationDisplay, 
  TAPApp_ApiProduct_ClientInformationDisplayList,
} from "../../developer-portal/displayServices/APDeveloperPortalAppApiProductsDisplayService";
import APDisplayUtils from "../../displayServices/APDisplayUtils";
import { EAPApp_Status } from "../../displayServices/APAppsDisplayService/APAppsDisplayService";

import "../APComponents.css";

export interface IAPDisplayDeveloperPortalApp_ApiProducts_ClientInformationProps {
  apAppStatus: EAPApp_Status;
  apApp_ApiProduct_ClientInformationDisplayList: TAPApp_ApiProduct_ClientInformationDisplayList;
  className?: string;
  emptyMessage: string;
}

export const APDisplayDeveloperPortalAppApiProductsClientInformation: React.FC<IAPDisplayDeveloperPortalApp_ApiProducts_ClientInformationProps> = (props: IAPDisplayDeveloperPortalApp_ApiProducts_ClientInformationProps) => {
  // const ComponentName='APDisplayDeveloperPortalAppApiProductsClientInformation';

  const componentDataTableRef = React.useRef<any>(null);
  const [guaranteedMessagingExpandedDataTableRows, setGuaranteedMessagingExpandedDataTableRows] = React.useState<any>(null);
  const guaranteedMessagingDataTableRef = React.useRef<any>(null);

  const renderGuaranteedMessaging = (row: TAPApp_ApiProduct_ClientInformationDisplay) => {
    // const funcName = 'renderGuaranteedMessaging';
    // const logName = `${ComponentName}.${funcName}()`;
    // console.log(`${logName}: row=${JSON.stringify(row, null, 2)}`);
    // alert(`${logName}: check console for log`);

    const dataTableList: Array<TAPAppGuaranteedMessagingDisplay | undefined> = row.apAppClientInformationDisplayList.map( (apAppClientInformationDisplay: TAPAppClientInformationDisplay) => {
      return apAppClientInformationDisplay.apGuarenteedMessagingDisplay;
    });
    const dataKey = APDisplayUtils.nameOf<TAPAppGuaranteedMessagingDisplay>('queueName');
    const accessTypeField = APDisplayUtils.nameOf<TAPAppGuaranteedMessagingDisplay>('accessType');
    const maxTtlField = APDisplayUtils.nameOf<TAPAppGuaranteedMessagingDisplay>('maxTtl');
    const maxMsgSpoolUsageField = APDisplayUtils.nameOf<TAPAppGuaranteedMessagingDisplay>('maxMsgSpoolUsage');
    return (
      <DataTable
        ref={guaranteedMessagingDataTableRef}
        dataKey={dataKey}
        header="Guaranteed Messaging"
        value={dataTableList}
      >
        <Column header="Queue Name" field={dataKey}  />
        <Column header="Access Type" headerStyle={{ width: '8em' }} field={accessTypeField}  />
        <Column header="Max TTL (secs)" headerStyle={{ width: '10em' }} field={maxTtlField} />
        <Column header="Max Spool (MB)" headerStyle={{ width: '10em' }} field={maxMsgSpoolUsageField} />
      </DataTable>
    );
  }

  const nameBodyTemplate = (row: TAPApp_ApiProduct_ClientInformationDisplay): JSX.Element => {
    return (
      <div>{row.apEntityId.displayName}, Status={row.apApp_ApiProduct_Status}</div>
    );
  }

  const renderComponentContent = (): JSX.Element => {    
    const dataKey = APDeveloperPortalAppApiProductsDisplayService.nameOf_ApEntityId('id');
    const nameField = APDeveloperPortalAppApiProductsDisplayService.nameOf_ApEntityId('displayName');

    return (
      <div className="card">
        <DataTable
          className="p-datatable-sm"
          ref={componentDataTableRef}
          dataKey={dataKey}
          value={props.apApp_ApiProduct_ClientInformationDisplayList}
          sortMode="single" 
          sortField={nameField} 
          sortOrder={1}
          scrollable 
          // scrollHeight="200px" 
          expandedRows={guaranteedMessagingExpandedDataTableRows}
          onRowToggle={(e) => setGuaranteedMessagingExpandedDataTableRows(e.data)}
          rowExpansionTemplate={renderGuaranteedMessaging}
        >
          <Column expander style={{ width: '3em' }} />  
          <Column header="API Product" body={nameBodyTemplate} field={nameField} sortable />
        </DataTable>
      </div>    
    );
  }
  
  const renderComponent = (): JSX.Element => {
    return (
      <React.Fragment>
        {renderComponentContent()}
      </React.Fragment>
    );
  }

  return (
    <div className={props.className ? props.className : 'card'}>
      {props.apApp_ApiProduct_ClientInformationDisplayList.length > 0 &&
        renderComponent()
      }
      {props.apApp_ApiProduct_ClientInformationDisplayList.length === 0  &&
        <span>{props.emptyMessage}</span>
      }
    </div>
  );
}


