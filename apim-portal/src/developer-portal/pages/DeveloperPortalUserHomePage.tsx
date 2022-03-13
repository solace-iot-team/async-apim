import React from 'react';
import { InputTextarea } from 'primereact/inputtextarea';
import { UserContext } from '../../components/APContextProviders/APUserContextProvider';
import APLoginUsersDisplayService from '../../displayServices/APUsersDisplayService/APLoginUsersDisplayService';

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
      <div className='p-mt-4'>Hello {APLoginUsersDisplayService.create_UserDisplayName(userContext.apLoginUserDisplay.apUserProfileDisplay)}.</div>
      {userContext && renderAccountIssues()}
    </React.Fragment>
  );
}

