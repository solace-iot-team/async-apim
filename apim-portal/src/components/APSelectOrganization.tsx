
import React from "react";

import { DataTable } from 'primereact/datatable';
import { Column } from "primereact/column";

import APEntityIdsService, { TAPEntityId, TAPEntityIdList } from "../utils/APEntityIdsService";

import "./APComponents.css";

export interface IAPSelectOrganizationProps {
  apMemberOfOrganizationEntityIdList: TAPEntityIdList;
  onSuccess: (organizationEntityId: TAPEntityId) => void;
}

export const APSelectOrganization: React.FC<IAPSelectOrganizationProps> = (props: IAPSelectOrganizationProps) => {
  // const componentName = 'APSelectOrganization';

  // * Select UI *
  const dt = React.useRef<any>(null);

  const onSelect = (event: any) => {
    const apEntityId: TAPEntityId = event.data as TAPEntityId;
    props.onSuccess(apEntityId);
  }

  const renderComponent = () => {
    return (
      <div className="card">
        <DataTable
            ref={dt}
            value={props.apMemberOfOrganizationEntityIdList}
            selectionMode="single"
            onRowClick={onSelect}
            id={APEntityIdsService.nameOf('id')}
            sortMode="single" 
            sortField={APEntityIdsService.nameOf('displayName')} 
            sortOrder={1}
            scrollable 
            scrollHeight="800px" 
          >
            <Column field={APEntityIdsService.nameOf('displayName')} header="Select Organization" />
        </DataTable>
      </div>
    );
  }


  return (
    <React.Fragment>
      {renderComponent()}
    </React.Fragment>      
  );
}
