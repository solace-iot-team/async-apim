import React from 'react';
import { Divider } from 'primereact/divider';
import { APHealthCheckContext } from '../../components/APHealthCheckContextProvider';
import { UserContext } from '../../components/UserContextProvider/UserContextProvider';
import { EAPHealthCheckSuccess } from '../../utils/APHealthCheck';

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
        <div className='p-mt-4'>Hello {userContext.user.profile?.first} {userContext.user.profile?.last}.</div>
      </div>
      {renderIssues()}
    </div>
  );
}

