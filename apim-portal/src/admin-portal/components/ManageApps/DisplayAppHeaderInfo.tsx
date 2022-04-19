
import React from "react";

import { Config } from "../../../Config";
import { IAPAppDisplay } from "../../../displayServices/APAppsDisplayService/APAppsDisplayService";

export interface IDisplayAppHeaderInfoProps {
  apAppDisplay: IAPAppDisplay;
}

export const DisplayAppHeaderInfo: React.FC<IDisplayAppHeaderInfoProps> = (props: IDisplayAppHeaderInfoProps) => {
  // const ComponentName = 'DisplayAppHeaderInfo';

  const renderComponent = (): JSX.Element => {
    return (
      <div className="p-col-12">
        <div className="ap-app-view">
          <div className="ap-app-view-detail-left">
            <div><b>Status: {props.apAppDisplay.apAppStatus}</b></div>
            {Config.getUseDevelTools() &&
              <div>DEVEL: connector app status:{props.apAppDisplay.devel_connectorAppResponses.smf.status}</div>
            }  
            <div className="p-mt-2"></div>
            <div>App Type: {props.apAppDisplay.apAppMeta.apAppType}</div>
            <div>App Owner Id: {props.apAppDisplay.apAppMeta.appOwnerId}</div>
            <div>App Owner Type: {props.apAppDisplay.apAppMeta.apAppOwnerType}</div>
          </div>
          <div className="ap-app-view-detail-right">
            <div>Id: {props.apAppDisplay.apEntityId.id}</div>
            <div>Internal Name: {props.apAppDisplay.apAppInternalName}</div>
            </div>            
        </div>
      </div>  
    );
  }


  return (
    <div className="ap-manage-apps">
      {renderComponent()}
    </div>
  );
}
