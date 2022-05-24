import React from 'react';

import { Toolbar } from 'primereact/toolbar';
import { Button } from 'primereact/button';

import { Loading } from '../../components/Loading/Loading';
import { ApiCallStatusError } from '../../components/ApiCallStatusError/ApiCallStatusError';
import { ApiCallState, TApiCallState } from '../../utils/ApiCallState';
import { APSSecureTestResponse, ApsSecureTestsService } from '../../_generated/@solace-iot-team/apim-server-openapi-browser';
import { APSClientOpenApi } from '../../utils/APSClientOpenApi';

export const SecTestPage: React.FC = () => {
  const ComponentName = 'SecTestPage';

  enum E_CALL_STATE_ACTIONS {
    API_GET_SEC_TEST = "API_GET_SEC_TEST",
  }

  // const [userContext] = React.useContext(UserContext);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [apsSecureTestResponse, setApsSecureTestResponse] = React.useState<APSSecureTestResponse>();
  // const [externalSystemsDisplayList, setExternalSystemsDisplayList] = React.useState<TAPExternalSystemDisplayList>([]);
  // const [organizationId, setOrganizationId] = React.useState<string>('');
  
  const apiGetSecTest = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetSecTest';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_SEC_TEST, 'get sec test');
    try {
      const apsSecureTestResponse: APSSecureTestResponse = await ApsSecureTestsService.apsTest();
      setApsSecureTestResponse(apsSecureTestResponse);
    } catch(e: any) {
      APSClientOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const doGetSecTest = async () => {
    setIsLoading(true);
    await apiGetSecTest();
    setIsLoading(false);
  }

  React.useEffect(() => {
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  const onGetSecTest = () => {
    doGetSecTest();
  }

  const renderLeftToolbarContent = (): JSX.Element => {
    return (
      <React.Fragment>
        <Button 
          label="Get Sec Test"
          onClick={onGetSecTest} 
          className="p-button-text p-button-plain p-button-outlined"
        />
      </React.Fragment>
    );
  }
  const renderToolbar = (): JSX.Element => {
    return (<Toolbar className="p-mb-4" left={renderLeftToolbarContent()} />);
  }

  const renderSecureTestResponse = (): JSX.Element => {
    return (
      <div>Response: {JSON.stringify(apsSecureTestResponse)}</div>
    );
  }

  return (
    <div>
      <h1>Secure Test Page</h1>
      <hr />

      <Loading show={isLoading} />      

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      {renderToolbar()}

      {apsSecureTestResponse && renderSecureTestResponse()}

      
    </div>
);

}

