
import React from "react";
import { Button } from "primereact/button";
import { Globals } from "../../utils/Globals";

import "../APComponents.css";

export interface IAPComponentHeaderProps {
  header: string;
  notes?: string;
  style?: React.CSSProperties;
  deepLink?: string;
  targetName?: string;
}

export const APComponentHeader: React.FC<IAPComponentHeaderProps> = (props: IAPComponentHeaderProps) => {

  const onOpenDeepLink = () => {
    if(props.deepLink === undefined || props.targetName === undefined) return;
    Globals.openUrlInTab(props.deepLink, props.targetName);
  }

  const renderHeader = () => {
    if(props.deepLink === undefined) return props.header;
    return(
      <div>
        {props.header}
        {props.deepLink && props.targetName &&
          <Button 
            type='button'
            icon="pi pi-external-link" 
            style={{ border: 'none'}}
            // className="p-button-rounded p-button-outlined p-button-secondary p-mr-2" 
            className="p-button-rounded p-button-secondary p-button-outlined p-ml-2" 
            onClick={onOpenDeepLink} 
            tooltip="Open in Event Portal"
          />    
        }
      </div>
    )
  }
  return (
      <div className='ap-component-header' style={props.style}>
        {renderHeader()}
        { props.notes && 
          <div className='notes'>
            {props.notes}
          </div>
        }
      </div>
  );
}


