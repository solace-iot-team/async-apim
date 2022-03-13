import React from 'react';
import { Divider } from 'primereact/divider';
import { APHealthCheckContext } from '../../components/APHealthCheckContextProvider';
import { UserContext } from '../../components/APContextProviders/APUserContextProvider';
import { EAPHealthCheckSuccess } from '../../utils/APHealthCheck';
import APLoginUsersDisplayService from '../../displayServices/APUsersDisplayService/APLoginUsersDisplayService';

export const AdminPortalUserHomePage: React.FC = () => {

  const [userContext] = React.useContext(UserContext);
  const [healthCheckContext] = React.useContext(APHealthCheckContext);

  const renderIssues = () => {
    if(healthCheckContext.systemHealthCheckSummary?.success === EAPHealthCheckSuccess.FAIL) {
      return (
        <div className='card p-mt-6'>
          <span style={{ color: 'red' }}>Restricted access only - system is partially unavailable.</span>
        </div>
      );
    }
  }

  return (
    <div className='ap-pages'>
      <h1 style={{fontSize: 'xx-large'}}>Welcome to the Async API Admin Portal</h1>
      <Divider />
      <div className='card p-mt-6'>
        <div className='p-mt-4'>Hello {APLoginUsersDisplayService.create_UserDisplayName(userContext.apLoginUserDisplay.apUserProfileDisplay)}.</div>
      </div>
      {renderIssues()}
    </div>
  );
}

