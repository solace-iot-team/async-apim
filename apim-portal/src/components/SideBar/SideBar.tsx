import React from "react";
import { useHistory } from 'react-router-dom';

import { MenuItem } from "primereact/components/menuitem/MenuItem";
import { PanelMenu } from 'primereact/panelmenu';

import { Config } from '../../Config';
import { AuthContext } from '../AuthContextProvider/AuthContextProvider';
import { UserContext } from "../UserContextProvider/UserContextProvider";
import { AuthHelper } from "../../auth//AuthHelper";
import { EUIEmbeddableResourcePaths, EUIResourcePaths } from "../../utils/Globals";

import '../APComponents.css';
import './SideBar.css';

export interface ISideBarProps {
  onSwitchToDeveloperPortal: () => void;
}

export const SideBar: React.FC<ISideBarProps> = (props: ISideBarProps) => {

  const history = useHistory();
  const [authContext, dispatchAuthContextAction] = React.useContext(AuthContext);
  const [userContext, dispatchUserContextAction] = React.useContext(UserContext);

  const navigateTo = (path: string): void => { history.push(path); }

  const isDisabled = (resourcePath: EUIResourcePaths): boolean => {
    return ( 
      !AuthHelper.isAuthorizedToAccessResource(authContext.authorizedResourcePathsAsString, resourcePath)
    );
  }

  const isDisabledWithOrg = (resourcePath: EUIResourcePaths): boolean => {
    return ( 
      !AuthHelper.isAuthorizedToAccessResource(authContext.authorizedResourcePathsAsString, resourcePath) ||
      !userContext.runtimeSettings.currentOrganizationName
    );
  }
  
  const getEmbeddableMenuItem = (): MenuItem => {
    return {
      label: 'EMBEDDABLE',
      items: [
        {
          label: 'Developer',
          items: [
            {
              label: 'Configure App',
              command: () => { navigateTo(EUIEmbeddableResourcePaths.DeveloperAppConfigure); }
            }
          ]
        },
        {
          label: 'Admin',
          items: [
            {
              label: 'Environment',
            }
          ]
        },
      ]
    };
  }

  const getDevelMenuItem = (): MenuItem => {
    return {
      label: 'DEVEL',
      items: [
        {
          label: 'Boostrap Organizations',
          disabled: false,
          command: () => { navigateTo('/test/bootstrap/organizations'); }
        },
        {
          label: 'Boostrap Users',
          disabled: false,
          command: () => { navigateTo('/test/bootstrap/users'); }
        },
        {
          label: 'Boostrap Connectors',
          disabled: false,
          command: () => { navigateTo('/test/bootstrap/connectors'); }
        },
        {
          label: 'Roles',
          disabled: false,
          command: () => { navigateTo('/test/roles'); }
        },
        {
          label: 'Contexts',
          disabled: false,
          command: () => { navigateTo('/test/contexts'); }
        }
      ]
    };
  }

  const getMenuItems = (): Array<MenuItem> => {
    
    let items: Array<MenuItem>= [
      { 
        label: 'Switch to Developer Portal',
        disabled: isDisabled(EUIResourcePaths.DeveloperPortal),
        command: () => { props.onSwitchToDeveloperPortal(); }
      },
      {
        label: 'Environments',
        disabled: isDisabledWithOrg(EUIResourcePaths.ManageOrganizationEnvironments),
        command: () => { navigateTo(EUIResourcePaths.ManageOrganizationEnvironments); }
      },
      { label: "System",
        items: [
          {
            label: 'Users',
            disabled: isDisabled(EUIResourcePaths.ManageSystemUsers),
            command: () => { navigateTo(EUIResourcePaths.ManageSystemUsers); }
          },
          {
            label: 'Teams',
            disabled: isDisabled(EUIResourcePaths.ManageSystemTeams),
            command: () => { navigateTo(EUIResourcePaths.ManageSystemTeams); }
          },
          {
            label: 'Organizations',
            disabled: isDisabled(EUIResourcePaths.ManageSystemOrganizations),
            command: () => { navigateTo(EUIResourcePaths.ManageSystemOrganizations); }
          },
          {
            label: 'Setup',
            items: [
              {
                label: 'Connectors',
                disabled: isDisabled(EUIResourcePaths.ManageSystemConfigConnectors),
                command: () => { navigateTo(EUIResourcePaths.ManageSystemConfigConnectors); }
              },    
              {
                label: 'Settings',
                disabled: isDisabled(EUIResourcePaths.ManageSystemConfigSettings),
                command: () => { navigateTo(EUIResourcePaths.ManageSystemConfigSettings); }
              }        
            ]
          },
          {
            label: 'Monitor',
            items: [
              {
                label: 'Health',
                disabled: isDisabled(EUIResourcePaths.MonitorSystemHealth),
                command: () => { navigateTo(EUIResourcePaths.MonitorSystemHealth); }
              }        
            ]
          },
        ]
      },
    ];
  
    if(Config.getUseEmbeddablePages()) items.push(getEmbeddableMenuItem());
    if(Config.getUseDevelTools()) items.push(getDevelMenuItem());

    return items;
  }

  

  return (
    <div className="ap-side-bar">
      <div className="card">
        <PanelMenu model={getMenuItems()} style={{ width: '10rem' }}/>
      </div>
    </div>
  );
}

