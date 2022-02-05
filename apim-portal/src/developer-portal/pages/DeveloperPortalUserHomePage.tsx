import React from 'react';
import { InputTextarea } from 'primereact/inputtextarea';
import { UserContext } from '../../components/UserContextProvider/UserContextProvider';

export const DeveloperPortalUserHomePage: React.FC = () => {

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [userContext, dispatchUserContextAction] = React.useContext(UserContext);

  const renderAccountIssues = () => {
    const orgList = userContext.runtimeSettings.availableOrganizationEntityIdList;
    if(orgList && orgList.length === 0) {
      const userMessage = 'You are not a member of any organization. Please contact your system administrator.';
      return (
          <div className="card p-mt-4 p-fluid">
            <div className="p-field">
              <InputTextarea 
                id="userSetupError" 
                value={userMessage} 
                className='p-invalid'
                style={{color: 'red', resize: 'none', border: 'none'}}
                rows={3}
                contentEditable={false}     
              />
            </div>
          </div>  
      );
    }
  }

  return (
    <React.Fragment>
      <h1 style={{fontSize: 'xx-large'}}>Welcome to the Async API Developer Portal</h1>
      <hr />
      <div className='p-mt-4'>Hello {userContext.user.profile?.first} {userContext.user.profile?.last}.</div>
      {userContext && renderAccountIssues()}
    </React.Fragment>
  );
}

