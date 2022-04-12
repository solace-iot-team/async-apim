
import React from "react";

import { InputTextarea } from "primereact/inputtextarea";

import { ApiCallState, TApiCallState } from "../../utils/ApiCallState";

import "../APComponents.css";

export interface IApiCallStatusErrorProps {
  apiCallStatus: TApiCallState | null
}

export const ApiCallStatusError: React.FC<IApiCallStatusErrorProps> = (props: IApiCallStatusErrorProps) => {
  // const componentName = 'ApiCallStatusError';

  return (
    <React.Fragment>
      {props.apiCallStatus && !props.apiCallStatus.success && 
        <React.Fragment>
          <div className="card p-fluid">
            {/* <Divider /> */}
            <div className="p-field">
              <InputTextarea 
                id="apiError" 
                value={ApiCallState.getUserErrorMessageFromApiCallState(props.apiCallStatus)} 
                // value={ApiCallState.getUserErrorMessageFromApiCallState(props.apiCallStatus) + ' ' +JSON.stringify(props.apiCallStatus, null, 2)} 
                className='p-invalid'
                style={{color: 'red', resize: 'none'}}
                rows={3}
                contentEditable={false}     
              />
            </div>
          </div>  
        </React.Fragment>
      }
    </React.Fragment>
  );
}

