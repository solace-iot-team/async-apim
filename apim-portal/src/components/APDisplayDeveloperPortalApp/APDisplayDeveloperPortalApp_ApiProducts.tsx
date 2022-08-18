
import React from "react";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

import { 
  TAPDeveloperPortalAppApiProductDisplay, 
  TAPDeveloperPortalAppApiProductDisplayList 
} from "../../developer-portal/displayServices/APDeveloperPortalAppApiProductsDisplayService";
import APDisplayUtils from "../../displayServices/APDisplayUtils";

import "../APComponents.css";

export interface IAPDisplayDeveloperPortalApp_ApiProductsProps {
  apDeveloperPortalApp_ApiProductDisplayList: TAPDeveloperPortalAppApiProductDisplayList;
  className?: string;
  emptyMessage: string;
}

export const APDisplayDeveloperPortalAppApiProducts: React.FC<IAPDisplayDeveloperPortalApp_ApiProductsProps> = (props: IAPDisplayDeveloperPortalApp_ApiProductsProps) => {
  // const ComponentName='APDisplayDeveloperPortalAppApiProducts';


  const componentDataTableRef = React.useRef<any>(null);

  // const renderComponentHeader = (): JSX.Element => {
  //   if(!props.header) return (<React.Fragment></React.Fragment>);
  //   const className: string = props.headerClassName ? props.headerClassName : "ap-display-component-header";
  //   return (
  //       <div className={className}>Credentials</div>
  //   );
  // }

  // const renderComponentContent = (): JSX.Element => {
  //   const dataTableList = [
  //     {
  //       consumerKey: props.appCredentials.secret?.consumerKey,
  //       consumerSecret: props.appCredentials.secret?.consumerSecret,
  //       expiresAt: props.appCredentials.expiresAt
  //     }
  //   ];
  //   return (
  //     <div className="p-ml-2">
  //       <DataTable
  //         className="p-datatable-sm"
  //         ref={componentDataTableRef}
  //         value={dataTableList}
  //         // header={props.header}
  //       >
  //         <Column field="consumerKey" header="Username" />
  //         <Column field="consumerSecret" header="Password" />
  //         <Column field="expiresAt" header="Expires At" />
  //       </DataTable>
  //     </div>
  //   );
  // }

  // const [expandedViewProductsDataTableRows, setExpandedViewProductsDataTableRows] = React.useState<any>(null);

  // const rowExpansionTemplate = (rowData: TApiProduct) => {
  //   return (
  //     <APDisplayConnectorAttributes
  //       attributeList={rowData.attributes}
  //       emptyMessage="No attributes defined."
  //     />
  //   );
  // }

  const nameBodyTemplate = (row: TAPDeveloperPortalAppApiProductDisplay): JSX.Element => {
    return (
      // <div className="p-text-bold">{row.apEntityId.displayName}</div>
      <div>{row.apEntityId.displayName}</div>
    );
  }
  const versionBodyTemplate = (row: TAPDeveloperPortalAppApiProductDisplay): JSX.Element => {
    return (
      <div>{`${row.apVersionInfo.apLastVersion} (${row.apLifecycleStageInfo.stage})`}</div>
    );
  }
  const statusBodyTemplate = (row: TAPDeveloperPortalAppApiProductDisplay): JSX.Element => {
    return (
      // <div className="p-text-bold">{row.apAppApiProductApprovalStatus}</div>
      <div>{row.apApp_ApiProduct_Status}</div>
    );
  }
  const ownerBodyTemplate = (row: TAPDeveloperPortalAppApiProductDisplay): JSX.Element => {
    return (
      <div>{row.apBusinessGroupInfo.apOwningBusinessGroupEntityId.displayName}</div>
    );
  }

  const renderComponentContent = (): JSX.Element => {
    const dataKey = APDisplayUtils.nameOf<TAPDeveloperPortalAppApiProductDisplay>('apEntityId.id');
    const nameField = APDisplayUtils.nameOf<TAPDeveloperPortalAppApiProductDisplay>('apEntityId.displayName');
    const statusField = APDisplayUtils.nameOf<TAPDeveloperPortalAppApiProductDisplay>('apApp_ApiProduct_Status');

    return (
      <div className="card">
        <DataTable
          className="p-datatable-sm"
          ref={componentDataTableRef}
          dataKey={dataKey}
          value={props.apDeveloperPortalApp_ApiProductDisplayList}
          sortMode="single" 
          sortField={nameField} 
          sortOrder={1}
          scrollable 
          autoLayout={true}
          // scrollHeight="200px" 
          // expandedRows={expandedViewProductsDataTableRows}
          // onRowToggle={(e) => setExpandedViewProductsDataTableRows(e.data)}
          // rowExpansionTemplate={rowExpansionTemplate}
        >
          <Column header="API Product" body={nameBodyTemplate} field={nameField} sortable />
          <Column header="Version/State" body={versionBodyTemplate} style={{width: '15%'}} />
          <Column header="Owner" body={ownerBodyTemplate} style={{width: '15%'}} />
          <Column header="Status" body={statusBodyTemplate} style={{width: '15%'}} field={statusField} sortable />
          
          {/* <Column body={apisBodyTemplate} header="APIs" bodyStyle={{ verticalAlign: 'top' }}/>
          <Column body={attributesBodyTemplate} header="Attributes" bodyStyle={{ verticalAlign: 'top' }}/>
          <Column body={environmentsBodyTemplate} header="Environments" bodyStyle={{textAlign: 'left', overflow: 'visible', verticalAlign: 'top' }}/>
          <Column body={protocolsBodyTemplate} header="Protocols" bodyStyle={{ verticalAlign: 'top' }} /> */}
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
      {props.apDeveloperPortalApp_ApiProductDisplayList.length > 0 &&
        renderComponent()
      }
      {(props.apDeveloperPortalApp_ApiProductDisplayList.length === 0) && 
        <span>{props.emptyMessage}</span>
      }
    </div>
  );
}


