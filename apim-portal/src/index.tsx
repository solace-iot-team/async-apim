import ReactDOM from 'react-dom';
import { BrowserRouter } from "react-router-dom";
import { ConfigContextProvider } from './components/ConfigContextProvider/ConfigContextProvider';
import { AuthContextProvider } from './components/AuthContextProvider/AuthContextProvider';
import { UserContextProvider } from './components/APContextProviders/APUserContextProvider';
import { OrganizationContextProvider } from './components/APContextProviders/APOrganizationContextProvider';
import { APHealthCheckContextProvider } from './components/APHealthCheckContextProvider';
import { APHealthCheckSummaryContextProvider } from './components/APHealthCheckSummaryContextProvider';
import App from './App';
// import reportWebVitals from './reportWebVitals';
import { Config } from './Config';
import { APSClientOpenApi } from './utils/APSClientOpenApi';
import { APCatchAll } from './components/APErrorBoundaries/APCatchAll';
import './index.css';

// const componentName = 'index';
// const logName = `${componentName}`;

Config.initialize();
APSClientOpenApi.initialize(Config.getAPSClientOpenApiConfig());

ReactDOM.render(
  <BrowserRouter>
    <APCatchAll>
      <ConfigContextProvider>
        <APHealthCheckContextProvider>
          <APHealthCheckSummaryContextProvider>
            <AuthContextProvider>
              <UserContextProvider>
                <OrganizationContextProvider>
                  <App />
                </OrganizationContextProvider>
              </UserContextProvider>
            </AuthContextProvider>      
          </APHealthCheckSummaryContextProvider>      
        </APHealthCheckContextProvider>            
      </ConfigContextProvider>
    </APCatchAll>
  </BrowserRouter>,
  document.getElementById('root')
);


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
