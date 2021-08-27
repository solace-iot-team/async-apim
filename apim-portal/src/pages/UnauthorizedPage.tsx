import React from 'react';
import { ContextsTestPage } from './devel/ContextsTestPage';

export const UnauthorizedPage: React.FC = () => {

  return (
    <React.Fragment>
      <h1>Unauthorized</h1>
      <hr />
      <ContextsTestPage />
    </React.Fragment>
);

}

