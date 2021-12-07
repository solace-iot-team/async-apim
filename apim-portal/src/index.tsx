import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from "react-router-dom";
import { ConfigContextProvider } from './components/ConfigContextProvider/ConfigContextProvider';
import { AuthContextProvider } from './components/AuthContextProvider/AuthContextProvider';
import { UserContextProvider } from './components/UserContextProvider/UserContextProvider';
import { APHealthCheckContextProvider } from './components/APHealthCheckContextProvider';
import App from './App';
// import reportWebVitals from './reportWebVitals';
import { Config } from './Config';
import { APSClientOpenApi } from './utils/APSClientOpenApi';
import './index.css';

const componentName = 'index';
const logName = `${componentName}`;

Config.initialize();
APSClientOpenApi.initialize(Config.getAPSClientOpenApiConfig());

console.error(`${logName}: continue here with APSHealthCheckContextProvider`);

// test connectivity to AP server,
// if not there: render a PROBLEM page instead


ReactDOM.render(
  <BrowserRouter>
    <ConfigContextProvider>
      <AuthContextProvider>
        <UserContextProvider>
          <APHealthCheckContextProvider>
            <App />
          </APHealthCheckContextProvider>            
        </UserContextProvider>
      </AuthContextProvider>      
    </ConfigContextProvider>
  </BrowserRouter>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
