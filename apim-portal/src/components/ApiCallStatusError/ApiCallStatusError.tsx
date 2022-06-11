
import React from "react";
import { useHistory } from 'react-router-dom';

import { InputTextarea } from "primereact/inputtextarea";

import { ApiCallState, TApiCallState } from "../../utils/ApiCallState";
import { EUICommonResourcePaths } from "../../utils/Globals";

import "../APComponents.css";

export interface IApiCallStatusErrorProps {
  apiCallStatus: TApiCallState | null
}

export const ApiCallStatusError: React.FC<IApiCallStatusErrorProps> = (props: IApiCallStatusErrorProps) => {
  // const ComponentName = 'ApiCallStatusError';

  const history = useHistory();
  const navigateHome = (): void => { history.push(EUICommonResourcePaths.Home); }

  React.useEffect(() => {
    // console.log(`${ComponentName}: props.apiCallStatus=${JSON.stringify(props.apiCallStatus, null, 2)}`);
    if(props.apiCallStatus !== null && !props.apiCallStatus.success && props.apiCallStatus.isUnauthorizedError) {
      navigateHome();
    }
  }, [props.apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */


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


