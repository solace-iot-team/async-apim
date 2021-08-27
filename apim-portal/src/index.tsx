import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from "react-router-dom";
import { ConfigContextProvider } from './components/ConfigContextProvider/ConfigContextProvider';
import { AuthContextProvider } from './components/AuthContextProvider/AuthContextProvider';
import { UserContextProvider } from './components/UserContextProvider/UserContextProvider';
import App from './App';
// import reportWebVitals from './reportWebVitals';
import { Config } from './Config';
import { APSClient } from './utils/APSClient';
import { APSClientOpenApi } from './utils/APSClientOpenApi';
import './index.css';

Config.initialize();
APSClient.initialize(Config.getAPSClientOpenApiConfig());
APSClientOpenApi.initialize(Config.getAPSClientOpenApiConfig());

ReactDOM.render(
  <Router>
    <ConfigContextProvider>
      <AuthContextProvider>
        <UserContextProvider>
          <App />
        </UserContextProvider>
      </AuthContextProvider>      
    </ConfigContextProvider>
  </Router>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
