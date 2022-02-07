import React from 'react';
import { Divider } from 'primereact/divider';

export const HomePage: React.FC = () => {
  return (
    <React.Fragment>
      <h1 style={{fontSize: 'xx-large'}}>Welcome to the Async API Management Portal</h1>
      <Divider />
      <div className='card p-mt-6'>

        <div className='p-mt-4'>Explore the public APIs.</div>

        <div className='p-mt-4'>or</div>

        <div className='p-mt-4'>Login to manage your APIs.</div>

      </div>
    </React.Fragment>
  );
}

