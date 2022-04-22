
import React from "react";

import { Config } from "../../../Config";
import { IAPAppDisplay } from "../../../displayServices/APAppsDisplayService/APAppsDisplayService";

import '../../../components/APComponents.css';
import "./DeveloperPortalManageUserApps.css";

export interface IDeveloperPortalDisplayAppHeaderInfoProps {
  apAppDisplay: IAPAppDisplay;
}

export const DeveloperPortalDisplayAppHeaderInfo: React.FC<IDeveloperPortalDisplayAppHeaderInfoProps> = (props: IDeveloperPortalDisplayAppHeaderInfoProps) => {
  // const ComponentName = 'DeveloperPortalDisplayAppHeaderInfo';

  const renderComponent = (): JSX.Element => {
    return (
      <div className="p-col-12">
        <div className="apd-app-view">
          <div className="apd-app-view-detail-left">
            <div><b>Status: {props.apAppDisplay.apAppStatus}</b></div>
            {Config.getUseDevelTools() &&
              <div>DEVEL: connector app status:{props.apAppDisplay.devel_connectorAppResponses.smf.status}</div>
            }  
          </div>
          <div className="apd-app-view-detail-right">
            <div>Id: {props.apAppDisplay.apEntityId.id}</div>
          </div>            
        </div>
      </div>  
    );
  }


  return (
    <div className="apd-manage-user-apps">
  
      {renderComponent()}
  
    </div>
  );
}
