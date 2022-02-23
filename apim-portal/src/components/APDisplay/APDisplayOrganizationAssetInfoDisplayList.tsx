
import React from "react";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Panel, PanelHeaderTemplateOptions } from 'primereact/panel';
import APAssetsDisplayService, { 
  TAPAssetInfoDisplayList, 
  TAPOrganizationAssetInfoDisplay, 
  TAPOrganizationAssetInfoDisplayList 
} from '../../displayServices/APAssetsDisplayService';

import "../APComponents.css";

export interface IAPDisplayOrganizationAssetInfoDisplayListProps {
  apOrganizationAssetInfoDisplayList: TAPOrganizationAssetInfoDisplayList;
  className?: string;
}

export const APDisplayOrganizationAssetInfoDisplayList: React.FC<IAPDisplayOrganizationAssetInfoDisplayListProps> = (props: IAPDisplayOrganizationAssetInfoDisplayListProps) => {
  const componentName='APDisplayOrganizationAssetInfoDisplayList';

  const orgDataTableRef = React.useRef<any>(null);
  const [expandedOrgDataTableRows, setExpandedOrgDataTableRows] = React.useState<any>(null);

  const renderAssets = (apAssetInfoDisplayList: TAPAssetInfoDisplayList): JSX.Element => {
    return (
      <div>
        <DataTable
          className="p-datatable-sm"
          // ref={orgDataTableRef}
          dataKey="apEntityId.id"
          value={apAssetInfoDisplayList}
          sortMode="single" 
          sortField="apEntityId.displayName"
          sortOrder={1}
          scrollable 
        >
          <Column header="Name" field="apEntityId.displayName" sortable />
          <Column header="Type" field="apAssetType" sortable />
        </DataTable>
      </div>
    );
  }
  const renderOrganizationAssetList = (apOrganizationAssetInfoDisplayList: TAPOrganizationAssetInfoDisplayList): JSX.Element => {
    const funcName = 'renderOrganizationAssetList';
    const logName = `${componentName}.${funcName}()`;

    const rowExpansionTemplateAssets = (row: TAPOrganizationAssetInfoDisplay) => {
      return (
        <React.Fragment>
          {renderAssets(row.apAssetInfoDisplayList)}
          {/* DEBUG */}
          {/* <pre style={ { fontSize: '12px' }} >
            {JSON.stringify(row, null, 2)}
          </pre> */}
        </React.Fragment>
      );
    }
  
    const assetsBodyTemplate = (row: TAPOrganizationAssetInfoDisplay) => {
      const numAssets: number = APAssetsDisplayService.getNumberOfAssets(row);
      if(numAssets > 0) {
        return (`${numAssets}`);
      } else {
        return ('-');
      }
    }
  
    return (
      <div className="card">
        <DataTable
          className="p-datatable-sm"
          ref={orgDataTableRef}
          dataKey="apEntityId.id"
          value={apOrganizationAssetInfoDisplayList}
          sortMode="single" 
          sortField="apEntityId.displayName"
          sortOrder={1}
          scrollable 
          expandedRows={expandedOrgDataTableRows}
          onRowToggle={(e) => setExpandedOrgDataTableRows(e.data)}
          rowExpansionTemplate={rowExpansionTemplateAssets}
        >
          <Column expander style={{ width: '3em' }} />  
          <Column header="Organization" field="apEntityId.displayName" sortable />
          <Column header="Assets" body={assetsBodyTemplate} />
        </DataTable>
      </div>
    );
  }

  const renderComponent = (apOrganizationAssetInfoDisplayList: TAPOrganizationAssetInfoDisplayList): JSX.Element => {
    const numAssets = APAssetsDisplayService.getNumberOfAssetsForAllOrganizations(apOrganizationAssetInfoDisplayList);
    
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

    if(apOrganizationAssetInfoDisplayList.length === 0 ) return (
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
          <div className="p-ml-2">{renderOrganizationAssetList(apOrganizationAssetInfoDisplayList)}</div>
        </Panel>
      </React.Fragment>
    );
  }

  return (
    <div className={props.className ? props.className : 'card'}>
      { renderComponent(props.apOrganizationAssetInfoDisplayList) }
    </div>
  );
}
