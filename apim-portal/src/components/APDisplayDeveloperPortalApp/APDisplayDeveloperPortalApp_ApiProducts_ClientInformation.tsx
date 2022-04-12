
import React from "react";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

import APDeveloperPortalAppApiProductsDisplayService, { 
  TAPAppGuaranteedMessagingDisplay,
  TAPApp_ApiProduct_ClientInformationDisplay, 
  TAPApp_ApiProduct_ClientInformationDisplayList,
} from "../../developer-portal/displayServices/APDeveloperPortalAppApiProductsDisplayService";
import APDisplayUtils from "../../displayServices/APDisplayUtils";

import "../APComponents.css";

export interface IAPDisplayDeveloperPortalApp_ApiProducts_ClientInformationProps {
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
    const dataTableList: Array<TAPAppGuaranteedMessagingDisplay> = row.apGuarenteedMessagingDisplay ? [row.apGuarenteedMessagingDisplay] : [];
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
      <div>{row.apEntityId.displayName}</div>
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
        {/* {renderComponentHeader()} */}
        {renderComponentContent()}
      </React.Fragment>
    );
  }

  return (
    <div className={props.className ? props.className : 'card'}>
      {props.apApp_ApiProduct_ClientInformationDisplayList.length > 0 &&
        renderComponent()
      }
      {(props.apApp_ApiProduct_ClientInformationDisplayList.length === 0) && 
        <span>{props.emptyMessage}</span>
      }
    </div>
  );
}


