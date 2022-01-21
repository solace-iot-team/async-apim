
import React from "react";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Panel, PanelHeaderTemplateOptions } from 'primereact/panel';

import { 
  CommonName
} from "@solace-iot-team/apim-connector-openapi-browser";
import { TAPAssetInfoList, TAPOrgAsset, TAPOrgAssetList } from "../../utils/APTypes";

import "../APComponents.css";

export interface IAPDisplayOrgAssetListProps {
  organizationId?: CommonName;
  numberOfAssets: number;
  orgAssetList: TAPOrgAssetList,
  className?: string;
}

export const APDisplayOrgAssetList: React.FC<IAPDisplayOrgAssetListProps> = (props: IAPDisplayOrgAssetListProps) => {
  const componentName='APDisplayOrgAssetList';

  const orgDataTableRef = React.useRef<any>(null);
  const [expandedOrgDataTableRows, setExpandedOrgDataTableRows] = React.useState<any>(null);

  const renderAssets = (assetInfoList: TAPAssetInfoList): JSX.Element => {
    return (
      <div>
        <DataTable
          className="p-datatable-sm"
          // ref={orgDataTableRef}
          dataKey="assetEntityId.id"
          value={assetInfoList}
          sortMode="single" 
          sortField="assetEntityId.displayName"
          sortOrder={1}
          scrollable 
        >
          <Column header="Name" field="assetEntityId.displayName" sortable />
          <Column header="Type" field="assetType" sortable />
        </DataTable>
      </div>
    );
  }
  const renderOrgAssetList = (orgAssetList: TAPOrgAssetList, organizationId: CommonName | undefined): JSX.Element => {
    const funcName = 'renderOrgAssetList';
    const logName = `${componentName}.${funcName}()`;

    const rowExpansionTemplateAsset = (row: TAPOrgAsset) => {
      return (
        <React.Fragment>
          {renderAssets(row.assetInfoList)}
          {/* DEBUG */}
          {/* <pre style={ { fontSize: '12px' }} >
            {JSON.stringify(row, null, 2)}
          </pre> */}
        </React.Fragment>
      );
    }
  
    const assetsBodyTemplate = (row: TAPOrgAsset) => {
      if(row.assetInfoList.length > 0) {
        return (`${row.assetInfoList.length}`);
      } else {
        return ('-');
      }
    }
  
    if(organizationId) {
      if(orgAssetList.length !== 1) throw new Error(`${logName}: orgAssetList.length = ${orgAssetList.length}`);
      return renderAssets(orgAssetList[0].assetInfoList);
    }

    return (
      <div className="card">
        <DataTable
          className="p-datatable-sm"
          ref={orgDataTableRef}
          dataKey="organizationEntityId.id"
          value={orgAssetList}
          sortMode="single" 
          sortField="organizationEntityId.displayName"
          sortOrder={1}
          scrollable 
          expandedRows={expandedOrgDataTableRows}
          onRowToggle={(e) => setExpandedOrgDataTableRows(e.data)}
          rowExpansionTemplate={rowExpansionTemplateAsset}
        >
          <Column expander style={{ width: '3em' }} />  
          <Column header="Organization" field="organizationEntityId.displayName" sortable />
          <Column header="Assets" body={assetsBodyTemplate} />
        </DataTable>
      </div>
    );
  }

  const renderComponent = (orgAssetList: TAPOrgAssetList, organizationId: CommonName | undefined): JSX.Element => {
    let numAssets = props.numberOfAssets;
    
    const panelHeaderTemplate = (options: PanelHeaderTemplateOptions) => {
      const toggleIcon = options.collapsed ? 'pi pi-chevron-right' : 'pi pi-chevron-down';
      const className = `${options.className} p-jc-start`;
      const titleClassName = `${options.titleClassName} p-pl-1`;
      const title = `Assets (${numAssets})`;  
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

    const emptyPanelHeader = (options: PanelHeaderTemplateOptions) => {
      const className = `${options.className} p-jc-start`;
      const titleClassName = `${options.titleClassName} p-pl-1`;
      const title = `Assets (${numAssets})`;  
      return (
        <div className={className} style={{ justifyContent: 'left'}} >
          <span className={titleClassName}>
            {title}
          </span>
        </div>    
      );
    }

    if(orgAssetList.length === 0 ) return (
      <React.Fragment>
        <Panel
          headerTemplate={emptyPanelHeader} 
          collapsed={true}
          toggleable
        />
      </React.Fragment>
    );
    return (
      <React.Fragment>
        <Panel 
          headerTemplate={panelHeaderTemplate} 
          toggleable
          collapsed={false}
          // className="p-pt-2"
        >
          <div className="p-ml-2">{renderOrgAssetList(orgAssetList, organizationId)}</div>
        </Panel>
      </React.Fragment>
    );
  }

  return (
    <div className={props.className ? props.className : 'card'}>
      { renderComponent(props.orgAssetList, props.organizationId) }
    </div>
  );
}
