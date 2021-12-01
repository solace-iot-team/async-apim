
import React from "react";

import "../APComponents.css";

export interface IAPComponentHeaderProps {
  header: string;
  notes?: string;
}

export const APComponentHeader: React.FC<IAPComponentHeaderProps> = (props: IAPComponentHeaderProps) => {
  return (
      <div className='ap-component-header'>
        {props.header}
        { props.notes && 
          <div className='notes'>
            {props.notes}
          </div>
        }
      </div>
  );
}


