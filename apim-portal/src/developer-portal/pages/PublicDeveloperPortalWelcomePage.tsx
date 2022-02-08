import React from 'react';
import { Divider } from 'primereact/divider';

import "../../pages/Pages.css";

export const PublicDeveloperPortalWelcomePage: React.FC = () => {
  
  return (
    <div className='ap-pages'>
      <h1 style={{fontSize: 'xx-large'}}>Welcome to the Public Async API Marketplace</h1>
      <Divider />
      <div className='card p-mt-6'>

        <div className='p-mt-4'>Explore Marketplace API Products.</div>

      </div>
    </div>
  );

}

