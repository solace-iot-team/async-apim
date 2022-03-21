
import React from "react";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import APAssetsDisplayService, { 
  TAPOrganizationAssetInfoDisplay, 
} from '../../displayServices/APAssetsDisplayService';
import APEntityIdsService from "../../utils/APEntityIdsService";

import "../APComponents.css";

export interface IAPDisplayOrganizationAssetInfoDisplayListProps {
  apOrganizationAssetInfoDisplay: TAPOrganizationAssetInfoDisplay;
  className?: string;
}

export const APDisplayOrganizationAssetInfoDisplayList: React.FC<IAPDisplayOrganizationAssetInfoDisplayListProps> = (props: IAPDisplayOrganizationAssetInfoDisplayListProps) => {
  // const ComponentName='APDisplayOrganizationAssetInfoDisplayList';

  const orgDataTableRef = React.useRef<any>(null);

  const renderOrganizationAssetList = (apOrganizationAssetInfoDisplay: TAPOrganizationAssetInfoDisplay): JSX.Element => {
    // const funcName = 'renderOrganizationAssetList';
    // const logName = `${ComponentName}.${funcName}()`;
    if(apOrganizationAssetInfoDisplay.apAssetInfoDisplayList.length === 0) return (<></>);
    return (
      <div className="card">
        <DataTable
          className="p-datatable-sm"
          ref={orgDataTableRef}
          dataKey={APEntityIdsService.nameOf_ApEntityIdDisplay('id')}
          value={apOrganizationAssetInfoDisplay.apAssetInfoDisplayList}
          sortMode="single" 
          sortField={APEntityIdsService.nameOf_ApEntityIdDisplay('displayName')}
          sortOrder={1}
          scrollable 
        >
          <Column header="Name" field={APEntityIdsService.nameOf_ApEntityIdDisplay('displayName')} sortable />
          <Column header="Type" field={APAssetsDisplayService.nameOf_ApAssetInfoDisplay('apAssetType')} sortable />
        </DataTable>
      </div>
    );
  }

  const renderComponent = (): JSX.Element => {
    const numAssets = APAssetsDisplayService.getNumberOfOrganizationAssets(props.apOrganizationAssetInfoDisplay);
    
    return (
      <React.Fragment>
        <div><b>Number of Assets</b>: {numAssets}</div>
        <div className="p-mt-4">{renderOrganizationAssetList(props.apOrganizationAssetInfoDisplay)}</div>
      </React.Fragment>
    );
  }

  return (
    <div className={props.className ? props.className : 'card'}>
      { renderComponent() }
    </div>
  );
}
