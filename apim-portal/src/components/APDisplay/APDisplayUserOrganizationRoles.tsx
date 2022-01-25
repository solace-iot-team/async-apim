
import React from "react";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Panel, PanelHeaderTemplateOptions } from 'primereact/panel';

import { 
  CommonName
} from "@solace-iot-team/apim-connector-openapi-browser";
import { APSOrganizationRoles, APSOrganizationRolesList, APSUser } from "../../_generated/@solace-iot-team/apim-server-openapi-browser";
import { ConfigHelper } from "../ConfigContextProvider/ConfigHelper";
import { ConfigContext } from "../ConfigContextProvider/ConfigContextProvider";

import "../APComponents.css";

export interface IAPDisplayUserOrganizationRolesProps {
  organizationId?: CommonName;
  apsUser: APSUser;
  className?: string;
}

export const APDisplayUserOrganizationRoles: React.FC<IAPDisplayUserOrganizationRolesProps> = (props: IAPDisplayUserOrganizationRolesProps) => {
  const componentName='APDisplayUserOrganizationRoles';

  const [configContext] = React.useContext(ConfigContext); 
  const orgDataTableRef = React.useRef<any>(null);

  const renderOrgRoleList = (memberOfOrganizations: APSOrganizationRolesList): JSX.Element => {

    const rolesBodyTemplate = (row: APSOrganizationRoles) => {
      if(row.roles.length > 0) {
        return ConfigHelper.getAuthorizedOrgRolesDisplayNameList(configContext, row.roles).join(', ');
      } else {
        return ('None');
      }
    }
  
    return (
      <div className="card">
        <DataTable
          className="p-datatable-sm"
          ref={orgDataTableRef}
          dataKey="organizationId"
          value={memberOfOrganizations}
          sortMode="single"
          sortField="organizationId"
          sortOrder={1}
          scrollable 
        >
          {memberOfOrganizations.length > 1 && 
            <Column header="Organization" field="organizationId" sortable />
          }
          {memberOfOrganizations.length === 1 && 
            <Column header="Organization" field="organizationId" />
          }
          <Column header="Roles" body={rolesBodyTemplate} />
        </DataTable>
      </div>
    );
  }

  const renderAllOrgs = (memberOfOrganizations: APSOrganizationRolesList): JSX.Element => {

    const panelHeaderTemplate = (options: PanelHeaderTemplateOptions) => {
      const toggleIcon = options.collapsed ? 'pi pi-chevron-right' : 'pi pi-chevron-down';
      const className = `${options.className} p-jc-start`;
      const titleClassName = `${options.titleClassName} p-pl-1`;
      const title = `Organizations (${memberOfOrganizations.length})`;  
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
          collapsed={true}
        >
          <div className="p-ml-2">{renderOrgRoleList(memberOfOrganizations)}</div>
          {/* <pre style={ { fontSize: '12px' }} >
            {JSON.stringify(memberOfOrganizations, null, 2)}
          </pre> */}
        </Panel>
      </React.Fragment>
    );
  }

  const renderSingleOrg = (apsOrganizationRoles: APSOrganizationRoles): JSX.Element => {
    return (
      <React.Fragment>
        <div>{renderOrgRoleList([apsOrganizationRoles])}</div>
        {/* <div><b>Organization</b>: {apsOrganizationRoles.organizationId}</div>
        <div><b>Roles</b>: {ConfigHelper.getAuthorizedOrgRolesDisplayNameList(configContext, apsOrganizationRoles.roles)}</div>
        <pre style={ { fontSize: '12px' }} >
          {JSON.stringify(apsOrganizationRoles.roles, null, 2)}
        </pre> */}
      </React.Fragment>
    );
  }

  const renderComponent = (apsUser: APSUser, organizationId: CommonName | undefined): JSX.Element => {
    const funcName = 'renderComponent';
    const logName = `${componentName}.${funcName}()`;
    
    if(apsUser.memberOfOrganizations === undefined) return (
      <React.Fragment>
        <p>NOT A MEMBER OF ANY ORGANIZATION</p>
      </React.Fragment>
    );

    if(organizationId === undefined) return renderAllOrgs(apsUser.memberOfOrganizations);

    const apsOrganizationRoles = apsUser.memberOfOrganizations.find((apsOrganizationRoles: APSOrganizationRoles) => {
      return organizationId === apsOrganizationRoles.organizationId;
    });
    if(!apsOrganizationRoles) throw new Error(`${logName}: apsOrganizationRoles is undefined`);
    return renderSingleOrg(apsOrganizationRoles);
  }

  return (
    <div className={props.className ? props.className : 'card'}>
      { renderComponent(props.apsUser, props.organizationId) }
    </div>
  );
}
