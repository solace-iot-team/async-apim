
import React from "react";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

import { 
  EAPWebhookAuthMethodSelectIdNone, 
  IAPAppWebhookDisplay, 
  TAPWebhookRequestHeader
} from "../../../displayServices/APAppsDisplayService/APAppWebhooksDisplayService";
import APDisplayUtils from "../../../displayServices/APDisplayUtils";
import APEntityIdsService from "../../../utils/APEntityIdsService";
import { TAPAppEnvironmentDisplayList } from "../../../displayServices/APAppsDisplayService/APAppEnvironmentsDisplayService";
import { APDisplayWebhooksCommon } from "./APDisplayWebhooksCommon";

import "../../APComponents.css";

export interface IAPDisplayAppWebhookProps {
  apAppWebhookDisplay: IAPAppWebhookDisplay;
}

export const APDisplayAppWebhook: React.FC<IAPDisplayAppWebhookProps> = (props: IAPDisplayAppWebhookProps) => {
  // const ComponentName='APDisplayAppWebhook';
    
  type TManagedObject = IAPAppWebhookDisplay;

  const customHeaderDataTableRef = React.useRef<any>(null);

  const renderCustomHeaderTable = (mo: TManagedObject): JSX.Element => {
    const dataKey = APDisplayUtils.nameOf<TAPWebhookRequestHeader>('headerName');
    const sortField = dataKey;
    const nameField = APDisplayUtils.nameOf<TAPWebhookRequestHeader>('headerName');
    const valueField = APDisplayUtils.nameOf<TAPWebhookRequestHeader>('headerValue');
    return (
      <React.Fragment>
        <DataTable
          ref={customHeaderDataTableRef}
          header={APDisplayWebhooksCommon.CustomHeaders.TableHeader}
          className="p-datatable-sm"
          showGridlines={false}
          value={mo.apWebhookRequestHeaderList}
          emptyMessage={APDisplayWebhooksCommon.CustomHeaders.EmptyMessage}
          scrollable 
          dataKey={dataKey}  
          sortMode='single'
          sortField={sortField}
          sortOrder={1}
          // resizableColumns 
          // columnResizeMode="fit"
          autoLayout={true}
        >
          <Column header={APDisplayWebhooksCommon.CustomHeaders.ColumnHeader_HeaderName} headerStyle={{ width: "31%"}} field={nameField} sortable />
          <Column header={APDisplayWebhooksCommon.CustomHeaders.ColumnHeader_HeaderValue} field={valueField} bodyStyle={{ overflowWrap: 'break-word', wordWrap: 'break-word' }} />
        </DataTable>
      </React.Fragment>        
    );
  }

  const renderEnvironments = (apAppEnvironmentDisplayList: TAPAppEnvironmentDisplayList): string => {
    return APEntityIdsService.create_SortedDisplayNameList_From_ApDisplayObjectList(apAppEnvironmentDisplayList).join(', ');
  }
  const renderAuth = (mo: TManagedObject): string | undefined => {
    if(mo.apWebhookBasicAuth) return mo.apWebhookBasicAuth.authMethod;
    if(mo.apWebhookHeaderAuth) return mo.apWebhookHeaderAuth.authMethod;
    return EAPWebhookAuthMethodSelectIdNone.NONE;
  }

  const renderComponent = (mo: TManagedObject) => {
    // const funcName = 'renderComponent';
    // const logName = `${ComponentName}.${funcName}()`;

    return (
      <div className="p-mt-4 p-ml-2">
        
        <div><b>Name: </b>{mo.apEntityId.displayName}</div>
        <div><b>Environment(s): </b>{renderEnvironments(mo.apAppEnvironmentDisplayList)}</div>
        <div><b>Method: </b>{mo.apWebhookMethod}</div>
        <div><b>URI: </b>{mo.apWebhookUri}</div>
        <div><b>Mode: </b>{mo.apWebhookMode}</div>
        <div><b>Auth: </b>{renderAuth(mo)}</div>
        <div className="p-mt-2">
          { renderCustomHeaderTable(mo) }
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      
      { renderComponent(props.apAppWebhookDisplay) }
    
    </div>
  );
}


