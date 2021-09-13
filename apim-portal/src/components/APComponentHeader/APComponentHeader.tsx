
import React from "react";

import "../APComponents.css";

export interface IAPComponentHeaderProps {
  header: string
}

export const APComponentHeader: React.FC<IAPComponentHeaderProps> = (props: IAPComponentHeaderProps) => {
  return (
    <div className='ap-component-header'>
      {props.header}
    </div>
  );
}


