
import React from "react";

import { InputTextarea } from "primereact/inputtextarea";

import { ApiCallState, TApiCallState } from "../../utils/ApiCallState";

import "../APComponents.css";

export interface IApiCallStatusErrorProps {
  apiCallStatus: TApiCallState | null
}

export const ApiCallStatusError: React.FC<IApiCallStatusErrorProps> = (props: IApiCallStatusErrorProps) => {
  const componentName = 'ApiCallStatusError';

  const doInitialize = () => {
    const funcName = 'doInitialize';
    const logName = `${componentName}.${funcName}()`;
    // console.log(`${logName}: apiCallStatus=${JSON.stringify(props.apiCallStatus, null, 2)}`);
  }

  React.useEffect(() => {
    doInitialize();
  }, []);

  return (
    <React.Fragment>
      {props.apiCallStatus && !props.apiCallStatus.success && 
        <React.Fragment>
          <div className="card p-fluid">
            {/* <Divider /> */}
            <div className="p-field">
              {/* <label htmlFor="apiError" style={{color: 'red'}}>Error</label> */}
              <InputTextarea 
                id="apiError" 
                value={ApiCallState.getUserErrorMessageFromApiCallState(props.apiCallStatus)} 
                className='p-invalid'
                style={{color: 'red', resize: 'none'}}
                rows={3}
                contentEditable={false}
                // cols={200} 
              />
            </div>
          </div>  
        </React.Fragment>
      }
    </React.Fragment>
  );
}


