
import React from "react";

import { APSUserProfile } from "../../_generated/@solace-iot-team/apim-server-openapi-browser";

import "../APComponents.css";

export interface IAPDisplayUserProfileProps {
  apsUserProfile: APSUserProfile;
  className?: string;
  header?: string;
}

export const APDisplayUserProfile: React.FC<IAPDisplayUserProfileProps> = (props: IAPDisplayUserProfileProps) => {
  // const componentName='APDisplayCredentialsPanel';

  const renderComponent = (): JSX.Element => {
    return (
      <React.Fragment>
        <div><b>E-mail</b>: {props.apsUserProfile.email}</div>

        <div><b>First</b>: {props.apsUserProfile.first}</div>

        <div><b>Last</b>: {props.apsUserProfile.last}</div>
      </React.Fragment>
    );
  }

  return (
    <div className={props.className ? props.className : 'card'}>
      {renderComponent()}
    </div>
  );
}
