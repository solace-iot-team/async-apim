
import React from "react";
import { TAPUserProfileDisplay } from "../../displayServices/APUsersDisplayService";
import { APComponentHeader } from "../APComponentHeader/APComponentHeader";

import "../APComponents.css";

export interface IAPDisplayUserProfileProps {
  apUserProfileDisplay: TAPUserProfileDisplay;
  className?: string;
  header?: string;
}

export const APDisplayUserProfile: React.FC<IAPDisplayUserProfileProps> = (props: IAPDisplayUserProfileProps) => {
  // const componentName='APDisplayUserProfile';

  const renderComponent = (): JSX.Element => {
    return (
      <React.Fragment>

        {props.header && 
          <APComponentHeader header={props.header} />      
        }

        <div><b>E-mail</b>: {props.apUserProfileDisplay.apsUserProfile.email}</div>

        <div><b>First</b>: {props.apUserProfileDisplay.apsUserProfile.first}</div>

        <div><b>Last</b>: {props.apUserProfileDisplay.apsUserProfile.last}</div>

      </React.Fragment>
    );
  }

  return (
    <div className={props.className ? props.className : 'card'}>
      {renderComponent()}
    </div>
  );
}
