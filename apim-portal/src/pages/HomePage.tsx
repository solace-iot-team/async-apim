import React from 'react';
import { Link } from 'react-router-dom';
import { EUIAdminPortalResourcePaths, EUIDeveloperPortalResourcePaths } from '../utils/Globals';

export const HomePage: React.FC = () => {
  return (
    <React.Fragment>
      <h1 style={{fontSize: 'xx-large'}}>Welcome to the Async API Management Portal</h1>
      <hr />
      <div className='p-mt-4'>Start by logging in.</div>
    </React.Fragment>
  );
}

