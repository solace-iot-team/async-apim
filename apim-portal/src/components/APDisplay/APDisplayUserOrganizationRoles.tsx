
import React from "react";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Panel, PanelHeaderTemplateOptions } from 'primereact/panel';

import APMemberOfService, { 
  TAPMemberOfOrganizationDisplay, 
  TAPMemberOfOrganizationDisplayList 
} from "../../displayServices/APUsersDisplayService/APMemberOfService";
import APEntityIdsService from "../../utils/APEntityIdsService";

import "../APComponents.css";

export interface IAPDisplayUserOrganizationRolesProps {
  apMemberOfOrganizationDisplayList: TAPMemberOfOrganizationDisplayList;
  className?: string;
  displayInPanel?: boolean;
}

export const APDisplayUserOrganizationRoles: React.FC<IAPDisplayUserOrganizationRolesProps> = (props: IAPDisplayUserOrganizationRolesProps) => {
  // const ComponentName='APDisplayUserOrganizationRoles';

  const orgDataTableRef = React.useRef<any>(null);

  React.useEffect( () => {
    if(props.displayInPanel === undefined) props.displayInPanel = true;
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  const renderOrganizationRoleList = (): JSX.Element => {

    const rolesBodyTemplate = (row: TAPMemberOfOrganizationDisplay): string => {
      if(row.apOrganizationRoleEntityIdList.length === 0) return 'None.';
      return APEntityIdsService.getSortedDisplayNameList_As_String(row.apOrganizationRoleEntityIdList);
    }

    // const legacyRolesBodyTemplate = (row: TAPMemberOfOrganizationDisplay): string => {
    //   if(row.apLegacyOrganizationRoleEntityIdList.length === 0) return 'None.';
    //   return APEntityIdsService.getSortedDisplayNameList_As_String(row.apLegacyOrganizationRoleEntityIdList);
    // }

    const _sortable: boolean = props.apMemberOfOrganizationDisplayList.length > 1;
    
    return (
      <div className="card">
        <DataTable
          className="p-datatable-sm"
          ref={orgDataTableRef}
          autoLayout={true}
          dataKey={APMemberOfService.nameOf_TAPMemberOfOrganizationDisplay_Entity('id')}
          value={props.apMemberOfOrganizationDisplayList}
          sortMode="single"
          sortField={APMemberOfService.nameOf_TAPMemberOfOrganizationDisplay_Entity('displayName')}
          sortOrder={1}
          scrollable 
        >
          <Column header="Organization" field={APMemberOfService.nameOf_TAPMemberOfOrganizationDisplay_Entity('displayName')} sortable={_sortable} />
          <Column header="Organization Roles" body={rolesBodyTemplate} />
          {/* <Column header="Legacy Roles" body={legacyRolesBodyTemplate} /> */}
        </DataTable>
        {/* DEBUG */}
        {/* <pre style={ { fontSize: '12px' }} >
          {JSON.stringify(memberOfOrganizations, null, 2)}
        </pre> */}
      </div>
    );
  }

  const renderOrganizationsInPanel = (): JSX.Element => {

    const numOrganizations: number = props.apMemberOfOrganizationDisplayList.length;

    const panelHeaderTemplate = (options: PanelHeaderTemplateOptions) => {
      const toggleIcon = options.collapsed ? 'pi pi-chevron-right' : 'pi pi-chevron-down';
      const className = `${options.className} p-jc-start`;
      const titleClassName = `${options.titleClassName} p-pl-1`;
      const title = `Organizations (${numOrganizations})`;  
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
    return (
      <React.Fragment>
        <Panel 
          headerTemplate={panelHeaderTemplate} 
          toggleable
          collapsed={false}
        >
          <div className="p-ml-2">{renderOrganizationRoleList()}</div>
          {/* DEBUG */}
          {/* <pre style={ { fontSize: '12px' }} >
            {JSON.stringify(memberOfOrganizations, null, 2)}
          </pre> */}
        </Panel>
      </React.Fragment>
    );
  }

  const renderOrganizations = (): JSX.Element => {
    return (
      <React.Fragment>
        <div className="p-ml-2">{renderOrganizationRoleList()}</div>
      </React.Fragment>
    );
  }

  const renderComponent = (): JSX.Element => {
    if(props.apMemberOfOrganizationDisplayList.length === 0) return (
      <React.Fragment>
        <p>Not a member of any organization.</p>
      </React.Fragment>
    );
     
    if(props.displayInPanel) return renderOrganizationsInPanel();
    else return renderOrganizations();
  }

  return (
    <div className={props.className ? props.className : 'card'}>
      { renderComponent() }
    </div>
  );
}
