
import React from "react";

import AsyncApiComponent, { ConfigInterface } from "@asyncapi/react-component";

import "@asyncapi/react-component/styles/default.css";
// or minified version
// import "@asyncapi/react-component/styles/default.min.css";
import "../APComponents.css";

export interface IAPDisplayAsyncApiSpecProps {
  schemaId: string,
  schema: any
}

export const APDisplayAsyncApiSpec: React.FC<IAPDisplayAsyncApiSpecProps> = (props: IAPDisplayAsyncApiSpecProps) => {
  
  const config: ConfigInterface = {
    schemaID: props.schemaId,
    show: {
      sidebar: false,
      info: true,
      servers: true,
      operations: true,
      messages: false,
      schemas: true,
      errors: false,
    },
    sidebar: {
      showOperations: 'byOperationsTags'
    }
  };

  return (
    <div className='ap-display-asyncapispec'>
      
      <AsyncApiComponent schema={props.schema} config={config} />    
      
      {/* <hr/>        
      <pre style={ { fontSize: '12px' }} >
        {JSON.stringify(props.schema, null, 2)}
      </pre> */}

    </div>
  );
}
