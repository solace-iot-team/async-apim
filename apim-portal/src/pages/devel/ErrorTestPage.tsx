import React from 'react';


export const ErrorTestPage: React.FC = () => {
  const componentName = 'ErrorTestPage';

  const throwError = () => {
    const funcName = 'throwError';
    const logName = `${componentName}.${funcName}()`;

    throw new Error(`${logName}: hello error`);
  }

  return (
    <React.Fragment>
        <h1>Error Test Page</h1>
        <hr />
        {throwError()}
    </React.Fragment>
);

}

