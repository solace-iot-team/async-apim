import React from 'react';
import { Link } from 'react-router-dom';
import { EUIAdminPortalResourcePaths, EUIDeveloperPortalResourcePaths } from '../utils/Globals';

export const HomePage: React.FC = () => {
  return (
    <React.Fragment>
      <h1>Welcome to the AsyncAPI Portal</h1>
      <hr />
      <ul>
        <li><Link to={EUIAdminPortalResourcePaths.Home}>Admin Portal</Link></li>
        <li><Link to={EUIDeveloperPortalResourcePaths.Home}>Developer Portal</Link></li>
      </ul>
    </React.Fragment>
  );
}

