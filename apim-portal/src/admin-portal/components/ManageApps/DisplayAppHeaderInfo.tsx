
import React from "react";

import { TAPAdminPortalAppDisplay } from "../../displayServices/APAdminPortalAppsDisplayService";

export interface IDisplayAppHeaderInfoProps {
  apAdminPortalAppDisplay: TAPAdminPortalAppDisplay;
}

export const DisplayAppHeaderInfo: React.FC<IDisplayAppHeaderInfoProps> = (props: IDisplayAppHeaderInfoProps) => {
  // const ComponentName = 'DisplayAppHeaderInfo';

  const renderComponent = (): JSX.Element => {
    return (
      <div className="p-col-12">
        <div className="ap-app-view">
          <div className="ap-app-view-detail-left">
            <div><b>Status: {props.apAdminPortalAppDisplay.apAdminPortalAppStatus}</b></div>
            {/* <div><b>DEVEL Status: {props.apAdminPortalAppDisplay.apAppStatus}</b></div> */}
            <div className="p-mt-2"></div>
            <div>App Type: {props.apAdminPortalAppDisplay.apAppMeta.apAppType}</div>
            <div>App Owner Id: {props.apAdminPortalAppDisplay.apAppMeta.appOwnerDisplayName}</div>
            <div>App Owner Type: {props.apAdminPortalAppDisplay.apAppMeta.apAppOwnerType}</div>
          </div>
          <div className="ap-app-view-detail-right">
            <div>Id: {props.apAdminPortalAppDisplay.apEntityId.id}</div>
            <div>Internal Name: {props.apAdminPortalAppDisplay.apAppInternalName}</div>
            <div>App Status: {props.apAdminPortalAppDisplay.devel_connectorAppResponses.smf.status}</div>
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
