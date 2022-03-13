import React from 'react';
import { useLocation } from 'react-router-dom';

import { Divider } from 'primereact/divider';

import { UserContext } from '../../components/APContextProviders/APUserContextProvider';
import { EAppState, TLocationStateAppState } from '../../utils/Globals';

import "../../pages/Pages.css";

export const DeveloperPortalHomePage: React.FC = () => {

  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const [userContext, dispatchUserContextAction] = React.useContext(UserContext);
  const location = useLocation<TLocationStateAppState>();
  // const history = useHistory();

  // const navigateTo = (path: string): void => { history.push(path); }

  React.useEffect(() => {
    // only set app state if direct call to url
    if(!location.state || (location.state && location.state.setAppState)) {
      dispatchUserContextAction({ type: 'SET_ORIGIN_APP_STATE', appState: EAppState.DEVELOPER_PORTAL });
      dispatchUserContextAction({ type: 'SET_CURRENT_APP_STATE', appState: EAppState.UNDEFINED });  
    } 
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  // TODO: enable when Marketplace concept finalized
  // const onExplorePublicApis = () => {
  //   dispatchUserContextAction({ type: 'SET_CURRENT_APP_STATE', appState: EAppState.PUBLIC_DEVELOPER_PORTAL });
  //   navigateTo(Globals.getCurrentHomePath(false, EAppState.PUBLIC_DEVELOPER_PORTAL));
  // }

  return (
    <div className='ap-pages'>
      <h1 style={{fontSize: 'xx-large'}}>Welcome to the Async API Developer Portal</h1>
      <Divider />
      <div className='card p-mt-6'>
        <p>Login to start.</p>

        {/* TODO: enable when Marketplace concept finalized */}
        {/* <div className='p-mt-4'>
          <span className='ap-link' onClick={() => onExplorePublicApis()}>
            Explore the Marketplace.
          </span>
        </div>
        
        <div className='p-mt-4'>or</div>

        <div className='p-mt-4'>Login to manage your APPs.</div> */}

      </div>
    </div>  
  );

}

