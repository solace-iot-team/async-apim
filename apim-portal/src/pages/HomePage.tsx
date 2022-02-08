import React from 'react';
import { Divider } from 'primereact/divider';
// import { useHistory } from 'react-router-dom';
// import { 
//   // EAppState, 
//   // EUIPublicDeveloperPortalResourcePaths, 
//   TLocationStateAppState 
// } from '../utils/Globals';
// import { UserContext } from '../components/UserContextProvider/UserContextProvider';

import "./Pages.css";

export const HomePage: React.FC = () => {

  // const appPortalHistory = useHistory<TLocationStateAppState>();
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  // const [userContext, dispatchUserContextAction] = React.useContext(UserContext);

  // TODO: enable when Marketplace concept finalized
  // const onPublicDeveloperPortal = () => {
  //   dispatchUserContextAction({ type: 'SET_ORIGIN_APP_STATE', appState: EAppState.DEVELOPER_PORTAL });
  //   dispatchUserContextAction({ type: 'SET_CURRENT_APP_STATE', appState: EAppState.PUBLIC_DEVELOPER_PORTAL });
  //   appPortalHistory.push( { 
  //     pathname: EUIPublicDeveloperPortalResourcePaths.Welcome,
  //     state: {
  //       setAppState: false        
  //     }
  //   });
  // }

  return (
    <div className='ap-pages'>
      <h1 style={{fontSize: 'xx-large'}}>Welcome to the Async API Management Portal</h1>
      <Divider />
      <div className='card p-mt-6'>
        <p>Login to start.</p>

        {/* TODO: enable when Marketplace concept finalized */}
        {/* <div className='p-mt-4'>
          <span className='ap-link' onClick={() => onPublicDeveloperPortal()}>
            Explore the Marketplace.
          </span>
        </div>
        
        <div className='p-mt-4'>or</div>

        <div className='p-mt-4'>Login to manage your APIs.</div> */}

      </div>
    </div>
  );
}

